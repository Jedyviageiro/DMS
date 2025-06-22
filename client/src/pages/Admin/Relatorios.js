/** Modernized Relatorios.js UI **/
import React, { useEffect, useState } from 'react';
import { adminApi as adminApiAdmin } from '../../services/adminApi';
import { adminApi } from '../../services/api';
import '../../assets/styles/AdminDashboard.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const badge = (text, color) => (
  <span style={{
    display: 'inline-block',
    padding: '0.25em 0.75em',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.95em',
    background: color === 'green' ? '#e6f9ed' : color === 'red' ? '#ffeaea' : '#f5f5f7',
    color: color === 'green' ? '#1a7f37' : color === 'red' ? '#d32f2f' : '#555',
    border: color === 'green' ? '1px solid #b7e4c7' : color === 'red' ? '1px solid #ffcdd2' : '1px solid #e0e0e0',
    minWidth: 60,
    textAlign: 'center',
  }}>{text}</span>
);

const Relatorios = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [veicRes, resRes] = await Promise.all([
          adminApi.listarVeiculos(),
          adminApiAdmin.listarReservas()
        ]);
        setVeiculos(veicRes.data.veiculos);
        setReservas(resRes.data.reservas);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados do relatório');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: Count PTR (pending) and paid per vehicle
  const getPTRCount = (veiculo_id) => reservas.filter(r => r.veiculo_id === veiculo_id && r.status === 'pendente').length;
  const getPaidCount = (veiculo_id) => reservas.filter(r => r.veiculo_id === veiculo_id && r.pago).length;

  // Doughnut chart data
  const totalVehicles = veiculos.length;
  const totalRequests = reservas.length;
  const totalAccepted = reservas.filter(r => r.status === 'confirmada').length;
  const totalPaid = reservas.filter(r => r.pago).length;

  const doughnutData = {
    labels: ['Veículos', 'Solicitados', 'Aceitos', 'Pagos'],
    datasets: [
      {
        data: [totalVehicles, totalRequests, totalAccepted, totalPaid],
        backgroundColor: [
          '#4f8cff', // vehicles
          '#ffb347', // requested
          '#4caf50', // accepted
          '#00b894', // paid
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { size: 14 },
          color: '#333',
          boxWidth: 18,
          padding: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      duration: 900,
      easing: 'easeOutQuart',
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Mark reservation as paid
  const handleMarkAsPaid = async (reserva_id) => {
    setMarkingPaid(reserva_id);
    try {
      await adminApiMarkAsPaid(reserva_id);
      setReservas(reservas => reservas.map(r => r.id === reserva_id ? { ...r, pago: 1 } : r));
    } catch (err) {
      alert('Erro ao marcar como pago');
    } finally {
      setMarkingPaid(null);
    }
  };

  if (loading) return <div className="admin-loading">Carregando...</div>;
  if (error) return <div className="admin-error-message">{error}</div>;

  return (
    <div className="relatorio-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
      <div className="relatorio-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
        {/* Stock Overview Table */}
        <div className="relatorio-table" style={{ flex: 1, minWidth: 420, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 18 }}>Estoque de Veículos</h2>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f5f5f7' }}>
                <th style={{ borderTopLeftRadius: 10 }}>Veículo</th>
                <th>Estoque</th>
                <th>Pedidos PTR</th>
                <th style={{ borderTopRightRadius: 10 }}>Vendidos (Pagos)</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map(v => (
                <tr key={v.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ fontWeight: 500 }}>{v.marca} {v.modelo} ({v.ano})</td>
                  <td>{badge(v.estoque, v.estoque > 0 ? 'green' : 'red')}</td>
                  <td>{badge(getPTRCount(v.id), getPTRCount(v.id) > 0 ? 'red' : 'gray')}</td>
                  <td>{badge(getPaidCount(v.id), getPaidCount(v.id) > 0 ? 'green' : 'gray')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Reservation Management Table */}
        <div className="relatorio-table" style={{ flex: 2, minWidth: 520, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '2rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 18 }}>Reservas</h2>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f5f5f7' }}>
                <th style={{ borderTopLeftRadius: 10 }}>Cliente</th>
                <th>Veículo</th>
                <th>Status</th>
                <th>Pago</th>
                <th style={{ borderTopRightRadius: 10 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.2s', cursor: r.pago ? 'default' : 'pointer', ':hover': { background: '#f8f9fa' } }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.usuario_nome}</div>
                    <div style={{ fontSize: '0.93em', color: '#888' }}>{r.usuario_email}</div>
                  </td>
                  <td>{r.marca} {r.modelo} ({r.ano})</td>
                  <td>{badge(r.status.charAt(0).toUpperCase() + r.status.slice(1), r.status === 'confirmada' ? 'green' : r.status === 'pendente' ? 'red' : 'gray')}</td>
                  <td>{r.pago ? badge('Pago', 'green') : badge('Não', 'red')}</td>
                  <td>
                    {!r.pago && r.status === 'confirmada' && (
                      <button
                        className="admin-btn-primary"
                        style={{ borderRadius: 8, fontWeight: 600, padding: '0.5em 1.2em', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', background: '#4f8cff', color: '#fff', border: 'none', transition: 'background 0.2s' }}
                        disabled={markingPaid === r.id}
                        onClick={() => handleMarkAsPaid(r.id)}
                      >
                        {markingPaid === r.id ? 'Marcando...' : 'Marcar como Pago'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Doughnut Chart Section */}
      <div style={{ margin: '3rem auto 0', maxWidth: 480, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '2.5rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 600, fontSize: '1.15rem', marginBottom: 18, color: '#333' }}>Resumo Visual</h3>
        <div style={{ width: 320, height: 320 }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

// Helper: Mark as paid using the correct endpoint
const adminApiMarkAsPaid = (reserva_id) =>
  fetch(`/api/admin/reservas/${reserva_id}/pago`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }).then(res => {
    if (!res.ok) throw new Error('Erro ao marcar como pago');
    return res.json();
  });

export default Relatorios;
