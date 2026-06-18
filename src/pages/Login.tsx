import { LogIn } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../components/ui/Button';
import { SesnaLogo } from '../components/layout/SesnaLogo';

export function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-guinda-950 via-guinda-900 to-guinda-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <SesnaLogo size="hero" className="mx-auto mb-4" />
          <p className="text-guinda-200 text-sm mt-2">
            Tablero de Captura del Informe Trimestral sobre la situación de los Sistemas Estatales Anticorrupción
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Iniciar sesión</h2>
          <p className="text-sm text-gray-500 mb-6">
            Si aún no tiene una cuenta, por favor contáctese con el administrador del sistema.
          </p>

          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={isLoading}
            icon={<LogIn size={16} />}
            onClick={() => loginWithRedirect()}
            className="w-full"
          >
            Entrar
          </Button>
        </div>

        <p className="text-center text-xs text-guinda-300 mt-6">
          Secretaría Ejecutiva del Sistema Nacional Anticorrupción © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
