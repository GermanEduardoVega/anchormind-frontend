import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

export const Login = () => {
    const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

    if (isLoading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Cargando sesión...</div>;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    return (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10%', color: 'white' }}>
      <h1>AnchorMind Pro</h1>
      <p>Gestión clínica y monitoreo de ansiedad</p>
      
      {error && (
        <div style={{ background: '#721c24', color: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
          Error de autenticación: {error.message}
        </div>
      )}

      <button 
        onClick={() => loginWithRedirect()} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Iniciar Sesión con Auth0
      </button>
    </div>

    );
};
