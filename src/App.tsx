import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth0 } from '@auth0/auth0-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%', color: 'white' }}>
        Procesando credenciales...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Si entra a la raíz '/', mandarlo a dashboard (ProtectedRoute decidirá si va a login) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}