import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiClient } from '../api/apiClient';
import type{ AnxietyRecordResponse } from '../types';

interface Props {
  userEmail: string;
  refreshKey: number; // Disparador para refrescar la lista tras un post exitoso
}

export const PatientRecordsList = ({ userEmail, refreshKey }: Props) => {
  const { getAccessTokenSilently } = useAuth0();
  const api = useApiClient(getAccessTokenSilently);

  const [records, setRecords] = useState<AnxietyRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get<AnxietyRecordResponse[]>(
          `/api/v1/anxiety-records/patient/${encodeURIComponent(userEmail)}`
        );
        // Ordenamos del más reciente al más antiguo
        setRecords(response.data.reverse());
      } catch (err: any) {
        console.error('Error al cargar historial:', err);
        setError('No se pudo obtener el historial de episodios.');
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchHistory();
    }
  }, [userEmail, refreshKey]);

  return (
    <div style={{ marginTop: '2.5rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
      <h3>Mis Registros Anteriores</h3>

      {loading && <p style={{ color: '#a0aec0' }}>Cargando historial...</p>}
      {error && <p style={{ color: '#fc8181' }}>{error}</p>}

      {!loading && records.length === 0 && (
        <p style={{ color: '#a0aec0' }}>Aún no tenés episodios registrados.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {records.map((rec) => (
          <div 
            key={rec.id} 
            style={{ 
              backgroundColor: '#2d3748', 
              padding: '1rem', 
              borderRadius: '6px', 
              borderLeft: `5px solid ${rec.anxietyLevel >= 7 ? '#e53e3e' : rec.anxietyLevel >= 4 ? '#dd6b20' : '#38a169'}` 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e0' }}>
              <span><strong>Fecha:</strong> {new Date(rec.timeStamp).toLocaleString()}</span>
              <span><strong>Nivel:</strong> {rec.anxietyLevel}/10</span>
            </div>
            <p style={{ margin: '0.25rem 0' }}><strong>Relato:</strong> "{rec.rawInput}"</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Gatillo:</strong> {rec.triggerIdentified}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Técnica sugerida:</strong> {rec.technique}</p>
          </div>
        ))}
      </div>
    </div>
  );
};