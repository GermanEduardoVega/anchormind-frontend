import { useAuth0 } from "@auth0/auth0-react"
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const {isAuthenticated,isLoading} = useAuth0();

    if(isLoading){
        return<div style={{padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;
  }
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}