import { useAuth0 } from '@auth0/auth0-react';
import type{ UserProfile } from '../types';

interface Props {
  profile: UserProfile | null;
}

export const Navbar = ({ profile }: Props) => {
  const { logout } = useAuth0();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'CLINIC_ADMIN':
        return '#805ad5'; // Púrpura
      case 'PROFESSIONAL':
        return '#319795'; // Verde azulado
      case 'PATIENT':
      default:
        return '#3182ce'; // Azul
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#1a202c',
        borderBottom: '1px solid #2d3748',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AnchorMind Pro</h2>
        {profile && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: getRoleBadgeColor(profile.role),
              fontWeight: 'bold',
            }}
          >
            {profile.role}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {profile && (
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <span style={{ display: 'block', fontWeight: 'bold' }}>{profile.fullName}</span>
            <span style={{ color: '#a0aec0' }}>{profile.clinicName || 'Sin Clínica'}</span>
          </div>
        )}
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};