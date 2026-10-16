import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useApiClient } from '../api/apiClient';
import type { UserProfile } from '../types';
import { Navbar } from '../components/Navbar';
import { AnxietyRecordForm } from '../components/AnxietyRecordForm';
import { PatientRecordsList } from '../components/PatientRecordsList';
import { ClinicRecordsList } from '../components/ClinicRecordsList';

export const Dashboard = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const api = useApiClient(getAccessTokenSilently);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      // Priorizamos email para evitar colisiones con apodos o alias
      const identifier = user?.email || user?.name || user?.nickname;
      if (!identifier) return;

      try {
        setLoadingProfile(true);
        const response = await api.get<UserProfile>(
          `/api/v1/users/username/${encodeURIComponent(identifier)}`
        );
        setProfile(response.data);
      } catch (err: any) {
        console.error('Error al obtener perfil:', err);
        setErrorMsg(err.response?.data?.message || 'No se pudo conectar con el backend.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#171923', color: 'white' }}>
      <Navbar profile={profile} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        {loadingProfile && (
          <p style={{ textAlign: 'center', color: '#a0aec0', marginTop: '2rem' }}>
            Cargando perfil institucional...
          </p>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#742a2a',
              color: '#fed7d7',
              borderRadius: '6px',
              marginBottom: '1.5rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {profile && (
          <>
            {/* Vista Paciente */}
            {profile.role === 'PATIENT' && (
              <>
                <AnxietyRecordForm
                  userEmail={profile.username}
                  onRecordCreated={() => setRefreshHistory((prev) => prev + 1)}
                />
                <PatientRecordsList
                  userEmail={profile.username}
                  refreshKey={refreshHistory}
                />
              </>
            )}

            {/* Vista Administrador de Clínica / Profesional */}
            {(profile.role === 'CLINIC_ADMIN' || profile.role === 'PROFESSIONAL') && (
              <ClinicRecordsList
                clinicId={profile.clinicId}
                clinicName={profile.clinicName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};