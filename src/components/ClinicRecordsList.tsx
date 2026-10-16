import { useEffect, useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiClient } from '../api/apiClient';
import type { AnxietyRecordResponse } from '../types';

interface Props {
  clinicId?: number;
  clinicName?: string;
}

export const ClinicRecordsList = ({ clinicId, clinicName }: Props) => {
  const { getAccessTokenSilently } = useAuth0();
  const api = useApiClient(getAccessTokenSilently);

  const [records, setRecords] = useState<AnxietyRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control para filtros y orden
  const [searchPatient, setSearchPatient] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'level'>('date');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  useEffect(() => {
    const fetchClinicRecords = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get<AnxietyRecordResponse[]>(
          `/api/v1/anxiety-records/clinic/${clinicId}`
        );
        setRecords(response.data);
      } catch (err: any) {
        console.error('Error al cargar registros de clínica:', err);
        setError('No se pudieron obtener los registros institucionales.');
      } finally {
        setLoading(false);
      }
    };

    fetchClinicRecords();
  }, [clinicId]);

  // 1. Cálculo de métricas estadísticas de la institución
  const stats = useMemo(() => {
    if (records.length === 0) return { total: 0, avg: '0.0', criticalCount: 0 };

    const total = records.length;
    const sumLevel = records.reduce((acc, r) => acc + (r.anxietyLevel || 0), 0);
    const avg = (sumLevel / total).toFixed(1);
    const criticalCount = records.filter((r) => (r.anxietyLevel || 0) >= 7).length;

    return { total, avg, criticalCount };
  }, [records]);

  // 2. Filtros y ordenamiento combinados
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const patientName = (rec.user?.fullName || rec.user?.username || '').toLowerCase();
        const matchesName = patientName.includes(searchPatient.toLowerCase());
        const matchesCritical = filterCriticalOnly ? (rec.anxietyLevel || 0) >= 7 : true;
        return matchesName && matchesCritical;
      })
      .sort((a, b) => {
        if (sortBy === 'level') {
          return (b.anxietyLevel || 0) - (a.anxietyLevel || 0); // Mayor a menor severidad
        }
        // Por fecha descendente (más recientes primero)
        return new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime();
      });
  }, [records, searchPatient, sortBy, filterCriticalOnly]);

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
      <h3>Panel Institucional — {clinicName || 'Clínica'}</h3>
      <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
        Auditoría y monitoreo clínico de episodios registrados en la institución.
      </p>

      {/* Tarjetas de Métricas Institucionales */}
      {!loading && records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ background: '#2d3748', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Total Episodios</span>
            <h2 style={{ margin: '0.5rem 0 0', color: '#63b3ed' }}>{stats.total}</h2>
          </div>
          <div style={{ background: '#2d3748', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Promedio de Ansiedad</span>
            <h2 style={{ margin: '0.5rem 0 0', color: Number(stats.avg) >= 7 ? '#fc8181' : '#f6ad55' }}>
              {stats.avg} / 10
            </h2>
          </div>
          <div style={{ background: '#2d3748', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Casos Críticos (&ge; 7)</span>
            <h2 style={{ margin: '0.5rem 0 0', color: '#fc8181' }}>{stats.criticalCount}</h2>
          </div>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      {!loading && records.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', background: '#1a202c', padding: '1rem', borderRadius: '6px' }}>
          <input
            type="text"
            placeholder="Buscar por paciente..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#2d3748',
              color: 'white',
              flex: 1,
              minWidth: '200px'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'level')}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2d3748',
                color: 'white'
              }}
            >
              <option value="date">Fecha (Más recientes)</option>
              <option value="level">Mayor Ansiedad</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterCriticalOnly}
              onChange={(e) => setFilterCriticalOnly(e.target.checked)}
            />
            Solo críticos
          </label>
        </div>
      )}

      {loading && <p style={{ color: '#a0aec0' }}>Cargando registros institucionales...</p>}
      {error && <p style={{ color: '#fc8181' }}>{error}</p>}

      {!loading && records.length === 0 && (
        <p style={{ color: '#a0aec0' }}>No hay registros de pacientes en esta clínica aún.</p>
      )}

      {!loading && records.length > 0 && filteredRecords.length === 0 && (
        <p style={{ color: '#a0aec0' }}>No se encontraron pacientes que coincidan con la búsqueda.</p>
      )}

      {/* Lista de Registros Filtrados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            style={{
              backgroundColor: '#2d3748',
              padding: '1rem',
              borderRadius: '6px',
              borderLeft: `5px solid ${(rec.anxietyLevel || 0) >= 7 ? '#e53e3e' : (rec.anxietyLevel || 0) >= 4 ? '#dd6b20' : '#38a169'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e0' }}>
              <span><strong>Paciente:</strong> {rec.user?.fullName || rec.user?.username}</span>
              <span><strong>Nivel:</strong> {rec.anxietyLevel}/10</span>
              <span><strong>Fecha:</strong> {new Date(rec.timeStamp).toLocaleString()}</span>
            </div>
            <p style={{ margin: '0.25rem 0' }}><strong>Relato:</strong> "{rec.rawInput}"</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Gatillo detectado:</strong> {rec.triggerIdentified}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Técnica sugerida por IA:</strong> {rec.technique}</p>
          </div>
        ))}
      </div>
    </div>
  );
};