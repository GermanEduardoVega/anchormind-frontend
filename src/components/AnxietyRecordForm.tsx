import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiClient } from '../api/apiClient';
import type{ AnxietyRecordResponse } from '../types';

interface Props {
  userEmail: string;
  onRecordCreated: () => void; // Callback para recargar el historial
}

const WAITING_MESSAGES = [
  "Analizando tu relato...",
  "Evaluando nivel de malestar...",
  "Identificando gatillos emocionales...",
  "Estructurando técnicas de regulación...",
  "Guardando en tu historial clínico..."
];

export const AnxietyRecordForm = ({ userEmail, onRecordCreated }: Props) => {
  const { getAccessTokenSilently } = useAuth0();
  const api = useApiClient(getAccessTokenSilently);

  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnxietyRecordResponse | null>(null);

  // Ciclo dinámico de mensajes mientras dura la llamada síncrona
  useEffect(() => {
    let interval: any;
    if (loading) {
      setStatusIndex(0);
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev < WAITING_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post<AnxietyRecordResponse>(
        `/api/v1/anxiety-records?username=${encodeURIComponent(userEmail)}`,
        { rawInput }
      );
      setResult(response.data);
      setRawInput('');
      onRecordCreated(); // Avisa al Dashboard que actualice la lista
    } catch (err: any) {
      console.error('Error al registrar ansiedad:', err);
      setError(err.response?.data?.message || 'Error al procesar el registro con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '1.5rem' }}>
      <h3>Nuevo Registro de Ansiedad</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Escribí detalladamente lo que sentís (físico o mental)..."
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#222',
            color: 'white',
            width: '100%',
            boxSizing: 'border-box'
          }}
          disabled={loading}
        />

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading || !rawInput.trim()}
            style={{
              padding: '0.6rem 1.4rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#4a5568' : '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Procesando...' : 'Enviar Registro'}
          </button>

          {loading && (
            <span style={{ color: '#63b3ed', fontSize: '0.9rem', fontStyle: 'italic' }}>
              ⏳ {WAITING_MESSAGES[statusIndex]}
            </span>
          )}
        </div>
      </form>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#742a2a', color: '#fed7d7', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            backgroundColor: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: '8px',
            color: '#e2e8f0',
            textAlign: 'left'
          }}
        >
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#68d391', textAlign: 'center' }}>
            ✓ Análisis Clínico Registrado
          </h4>

          <p><strong>Nivel de Ansiedad:</strong> {result.anxietyLevel}/10</p>
          <p><strong>Gatillo:</strong> {result.triggerIdentified}</p>
          <p><strong>Técnica sugerida:</strong> {result.technique}</p>

          {/* Campo que faltaba: Aplicabilidad */}
          {result.applicability && (
            <p><strong>Aplicabilidad:</strong> {result.applicability}</p>
          )}

          <p><strong>Mensaje:</strong> {result.awarenessMessage}</p>

          {/* Bloque que faltaba: Pasos de acción de la técnica */}
          {result.actionSteps && result.actionSteps.length > 0 && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #2d3748', paddingTop: '0.75rem' }}>
              <strong style={{ color: '#63b3ed' }}>Pasos recomendados para aplicar la técnica:</strong>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                {result.actionSteps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};