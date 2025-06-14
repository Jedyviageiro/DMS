import React, { useState, useEffect } from 'react';
import { FaCar, FaUser, FaBell, FaSignOutAlt, FaSearch, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';

const ClienteDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('explorar');
  const [cars, setCars] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCars();
    fetchNotificacoes();
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/veiculos/disponiveis');
      const data = await response.json();
      if (response.ok) {
        setCars(data);
      } else {
        setError(data.mensagem);
      }
    } catch (err) {
      setError('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notificacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setNotificacoes(data.notificacoes);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  const handleMarcarNotificacaoLida = async (notificacaoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/notificacoes/${notificacaoId}/lida`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchNotificacoes();
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('landing');
  };

  const handlePreOrder = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/reservas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ veiculo_id: carId })
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedCar(null);
        fetchNotificacoes();
      } else {
        setError(data.mensagem);
      }
    } catch (err) {
      setError('Erro ao fazer pré-reserva');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explorar':
        return (
          <div className="cars-grid">
            {cars.map(car => (
              <div key={car.id} className="car-card" onClick={() => setSelectedCar(car)}>
                <div className="car-icon">
                  <FaCar size={40} />
                </div>
                <div className="car-info">
                  <h3>{car.marca} {car.modelo}</h3>
                  <p>Ano: {car.ano}</p>
                  <p>Preço: R$ {car.preco.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'reservas':
        return (
          <div className="reservas-section">
            <h2>Minhas Reservas</h2>
            {/* Reservas content will be added here */}
          </div>
        );
      case 'perfil':
        return (
          <div className="perfil-section">
            <h2>Meu Perfil</h2>
            {/* Perfil content will be added here */}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Left Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-header">
          <h1>AutoElite</h1>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'explorar' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorar')}
          >
            <FaSearch /> Explorar
          </button>
          <button 
            className={`nav-link ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <FaCalendarAlt /> Ver Reservas
          </button>
          <button 
            className={`nav-link ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <FaUserEdit /> Editar Perfil
          </button>
        </div>
        <div className="nav-footer">
          <button className="nav-link logout" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-header">
          <div className="header-left">
            <h2>AutoElite</h2>
          </div>
          <div className="header-right">
            <div className="notifications-container">
              <button 
                className="notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {notificacoes.filter(n => !n.lida).length > 0 && (
                  <span className="notification-badge">
                    {notificacoes.filter(n => !n.lida).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  {notificacoes.length === 0 ? (
                    <p>Nenhuma notificação</p>
                  ) : (
                    notificacoes.map(notificacao => (
                      <div 
                        key={notificacao.id} 
                        className={`notification-item ${!notificacao.lida ? 'unread' : ''}`}
                      >
                        <p>{notificacao.mensagem}</p>
                        {!notificacao.lida && (
                          <button 
                            className="btn btn-text"
                            onClick={() => handleMarcarNotificacaoLida(notificacao.id)}
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-info">
              <FaUser />
              <span>{user?.nome}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-content">
          {error && <div className="error-message">{error}</div>}
          {renderContent()}
        </div>
      </div>

      {/* Car Details Modal */}
      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedCar.marca} {selectedCar.modelo}</h2>
            <div className="car-details">
              <p>Ano: {selectedCar.ano}</p>
              <p>Preço: R$ {selectedCar.preco.toLocaleString('pt-BR')}</p>
              <p>Quilometragem: {selectedCar.quilometragem} km</p>
              <p>Combustível: {selectedCar.combustivel}</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handlePreOrder(selectedCar.id)}
              >
                Fazer Pré-reserva
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedCar(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
