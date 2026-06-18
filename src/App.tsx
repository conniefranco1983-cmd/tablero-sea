import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthSync } from './auth/AuthSync';
import { ToastContainer } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { Clock, LogOut } from 'lucide-react';

// Pages
import { Login } from './pages/Login';
import { ReporterDashboard } from './pages/reporter/Dashboard';
import { CaptureForm } from './pages/reporter/CaptureForm';
import { ReviewSubmit } from './pages/reporter/ReviewSubmit';
import { Confirmation } from './pages/reporter/Confirmation';
import { NationalDashboard } from './pages/admin/NationalDashboard';
import { ReportDetail } from './pages/admin/ReportDetail';
import { PeriodManagement } from './pages/admin/PeriodManagement';
import { StructureEditor } from './pages/admin/StructureEditor';

function ProtectedRoute({ role, children }: { role?: 'reporter' | 'admin'; children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SessionWarningModal() {
  const { sessionWarning, sessionCountdown, continueSession, setUser } = useApp();
  if (!sessionWarning) return null;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = sessionCountdown / 60;
  const dashoffset = circumference * (1 - progress);
  const urgent = sessionCountdown <= 15;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-fade-in text-center">
        {/* Countdown ring */}
        <div className="flex items-center justify-center mb-5">
          <svg width="64" height="64" className="-rotate-90">
            <circle
              cx="32" cy="32" r={radius}
              fill="none" stroke="#e5e7eb" strokeWidth="4"
            />
            <circle
              cx="32" cy="32" r={radius}
              fill="none"
              stroke={urgent ? '#dc2626' : '#691C32'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`absolute text-xl font-bold tabular-nums ${urgent ? 'text-red-600' : 'text-guinda-950'}`}>
            {sessionCountdown}
          </span>
        </div>

        <div className="mb-1 flex items-center justify-center gap-2 text-gray-500">
          <Clock size={15} />
          <span className="text-sm font-medium">Sesión por expirar</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Continúa trabajando?</h3>
        <p className="text-sm text-gray-500 mb-6">
          No se detectó actividad durante 30 minutos. Su sesión se cerrará en{' '}
          <span className={`font-semibold ${urgent ? 'text-red-600' : 'text-gray-700'}`}>
            {sessionCountdown} {sessionCountdown === 1 ? 'segundo' : 'segundos'}
          </span>{' '}
          por seguridad.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" onClick={continueSession} className="w-full">
            Continuar sesión
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={() => setUser(null)}
            className="w-full text-gray-400 hover:text-gray-600"
          >
            Cerrar sesión ahora
          </Button>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/tablero' : '/reporter/tablero'} replace />
            : <Login />
        } />

        {/* Reporter */}
        <Route path="/reporter/tablero" element={
          <ProtectedRoute role="reporter"><ReporterDashboard /></ProtectedRoute>
        } />
        <Route path="/reporter/captura" element={
          <ProtectedRoute role="reporter"><CaptureForm /></ProtectedRoute>
        } />
        <Route path="/reporter/revision" element={
          <ProtectedRoute role="reporter"><ReviewSubmit /></ProtectedRoute>
        } />
        <Route path="/reporter/confirmacion" element={
          <ProtectedRoute role="reporter"><Confirmation /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/tablero" element={
          <ProtectedRoute role="admin"><NationalDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/reporte/:estadoId/:periodoId" element={
          <ProtectedRoute role="admin"><ReportDetail /></ProtectedRoute>
        } />
        <Route path="/admin/periodos" element={
          <ProtectedRoute role="admin"><PeriodManagement /></ProtectedRoute>
        } />
        <Route path="/admin/estructura" element={
          <ProtectedRoute role="admin"><StructureEditor /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
      <SessionWarningModal />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthSync>
        <AppRoutes />
      </AuthSync>
    </AppProvider>
  );
}
