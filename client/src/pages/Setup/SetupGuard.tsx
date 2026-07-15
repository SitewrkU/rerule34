import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore.ts';

export function SetupGuard({ children }) {
  const isConfigured = useAppStore((s) => s.isConfigured);
  const location = useLocation();

  if (!isConfigured && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  if (isConfigured && location.pathname === '/setup') {
    return <Navigate to="/" replace />;
  }

  return children;
}