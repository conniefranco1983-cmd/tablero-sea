import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para el path de lectura/escritura. La publishable/anon key
// identifica al proyecto; el callback `accessToken` adjunta el JWT de Auth0
// (Third-Party Auth) para que RLS aplique por rol/estado. AuthSync registra el
// proveedor al iniciar sesión y lo limpia al salir.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env');
}

// Puente hacia getAccessTokenSilently() de Auth0. Es `null` mientras no haya
// sesión, en cuyo caso las llamadas viajan solo con la anon key.
let accessTokenProvider: (() => Promise<string | undefined>) | null = null;
export function setSupabaseTokenProvider(fn: (() => Promise<string | undefined>) | null) {
  accessTokenProvider = fn;
}

export const supabase = createClient(url, anonKey, {
  accessToken: async () => (accessTokenProvider ? (await accessTokenProvider()) ?? null : null),
});
