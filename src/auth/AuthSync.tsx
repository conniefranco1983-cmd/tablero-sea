import { useEffect, useRef, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '../contexts/AppContext';
import { setSupabaseTokenProvider } from '../lib/supabase';
import { SesnaLogo } from '../components/layout/SesnaLogo';
import { Button } from '../components/ui/Button';
import type { UserRole } from '../types';

// Debe coincidir con el namespace de auth0/post-login-action.js.
const NS = 'https://tablero.sesna.gob.mx';

/**
 * Puente Auth0 ↔ AppContext. Vive dentro de Auth0Provider y AppProvider.
 *  - registra el proveedor de token para el cliente Supabase;
 *  - deriva AppUser de las claims del token (role/estado_id desde app_metadata
 *    vía la Action; nombre/correo desde la identidad). profiles sigue siendo la
 *    fuente de verdad de RLS; estas claims son para enrutar y pintar la UI;
 *  - cierra la sesión de Auth0 cuando la app limpia el usuario (idle/botón Salir);
 *  - bloquea el render hasta que Auth0 restaura la sesión, para que un refresh o
 *    deep link no rebote a "/" (F1.7).
 */
export function AuthSync({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user: auth0User, getAccessTokenSilently, logout } = useAuth0();
  const { user: appUser, setUser } = useApp();
  const qc = useQueryClient();

  const syncedSubRef = useRef<string | null>(null);
  const hadUserRef = useRef(false);
  const primedRef = useRef(false);

  // Proveedor de token para Supabase (null mientras no hay sesión). Las queries
  // de AppProvider corren al montar, ANTES del login; con RLS esa lectura anónima
  // vuelve vacía y se cachea. Al quedar autenticados, invalidamos para que se
  // repitan ya con el JWT; al salir, limpiamos la caché del usuario anterior.
  useEffect(() => {
    if (isAuthenticated) {
      setSupabaseTokenProvider(() => getAccessTokenSilently());
      if (!primedRef.current) {
        primedRef.current = true;
        qc.invalidateQueries();
      }
    } else {
      setSupabaseTokenProvider(null);
      if (primedRef.current) {
        primedRef.current = false;
        qc.clear();
      }
    }
    return () => setSupabaseTokenProvider(null);
  }, [isAuthenticated, getAccessTokenSilently, qc]);

  // Derivar AppUser una vez por identidad (sub). No se reejecuta si la app pone
  // user en null (idle-logout): así no se repuebla peleando con el logout.
  const role = auth0User?.[`${NS}/role`] as UserRole | undefined;
  useEffect(() => {
    if (!isAuthenticated || !auth0User || !role) return;
    const sub = auth0User.sub ?? null;
    if (syncedSubRef.current === sub) return;
    syncedSubRef.current = sub;
    setUser({
      role,
      estadoId: (auth0User[`${NS}/estado_id`] as string | null) ?? undefined,
      nombre: auth0User.name ?? auth0User.email ?? '',
      correo: auth0User.email ?? '',
    });
  }, [isAuthenticated, auth0User, role, setUser]);

  // Logout centralizado: la app limpia el usuario (idle/Salir) → cerrar Auth0.
  useEffect(() => {
    if (appUser) { hadUserRef.current = true; return; }
    if (hadUserRef.current && isAuthenticated) {
      hadUserRef.current = false;
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }, [appUser, isAuthenticated, logout]);

  // Cuenta autenticada pero sin claim de rol (Action no desplegada o
  // app_metadata sin role): evita un spinner infinito.
  if (isAuthenticated && auth0User && !role) {
    return (
      <FullScreen>
        <p className="text-sm text-gray-600 max-w-xs">
          Su cuenta no tiene un rol asignado. Contacte al administrador del Sistema Nacional Anticorrupción.
        </p>
        <Button variant="primary" size="md" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Cerrar sesión
        </Button>
      </FullScreen>
    );
  }

  if (isLoading || (isAuthenticated && !appUser)) {
    return (
      <FullScreen>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-guinda-200 border-t-guinda-700" />
      </FullScreen>
    );
  }

  return <>{children}</>;
}

function FullScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4 text-center">
      <SesnaLogo size="header" />
      {children}
    </div>
  );
}
