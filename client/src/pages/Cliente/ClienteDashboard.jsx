import React, { useState, useEffect, useRef } from 'react';
import {
  FaCar,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaCalendarAlt,
  FaUserEdit,
  FaBars,
  FaEdit,
  FaSave,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCamera,
  FaUserCircle,
  FaComments
} from 'react-icons/fa';
import {
  getVehicles,
  getReservations,
  getNotifications,
  markNotificationAsRead,
  createReservation,
  cancelReservation,
  updateUserProfile,
  getPromocoes,
} from '../../services/api';
import '../../assets/styles/ClienteDashboard.css';
import Forum from './Forum';
import ConfirmModal from '../../components/ConfirmModal';

const ClienteDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('explorar');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    telefone: '',
  });
  const [editError, setEditError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false);
  const fileInputRef = useRef(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  useEffect(() => {
    fetchData();
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setEditForm({
        nome: userData.nome || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
      });
      const savedImage = localStorage.getItem(`profileImage_${userData.email}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, notificationsRes, reservationsRes, promocoesRes] = await Promise.all([
        getVehicles(),
        getNotifications(),
        getReservations(),
        getPromocoes(),
      ]);

      if (vehiclesRes.data.veiculos) {
        setCars(vehiclesRes.data.veiculos);
      }
      if (notificationsRes.data.notificacoes) {
        setNotificacoes(notificationsRes.data.notificacoes);
      }
      if (reservationsRes.data.reservas) {
        setReservations(reservationsRes.data.reservas);
      }
      if (promocoesRes.data) {
        setPromocoes(promocoesRes.data);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = (precoOriginal, promocao) => {
    if (!promocao || !promocao.ativo) return { precoFinal: precoOriginal, desconto: 0 };

    let desconto = 0;
    if (promocao.desconto_tipo === 'percentual') {
      desconto = precoOriginal * (promocao.desconto_valor / 100);
    } else if (promocao.desconto_tipo === 'valor_fixo') {
      desconto = promocao.desconto_valor;
    }
    const precoFinal = precoOriginal - desconto;
    return { precoFinal: precoFinal > 0 ? precoFinal : 0, desconto };
  };

  const getApplicablePromotion = (car) => {
    return promocoes.find((promocao) => {
      if (!promocao.ativo) return false;
      if (promocao.aplicavel_em === 'todos') return true;
      if (promocao.aplicavel_em === 'marca' && promocao.marca === car.marca) return true;
      if (promocao.aplicavel_em === 'modelo' && promocao.modelo === car.modelo) return true;
      return false;
    });
  };

  const handleMarcarNotificacaoLida = async (notificacaoId) => {
    try {
      await markNotificationAsRead(notificacaoId);
      setNotificacoes(notificacoes.map((notificacao) =>
        notificacao.id === notificacaoId ? { ...notificacao, lida: true } : notificacao
      ));
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
      const response = await createReservation(carId);
      if (response.data) {
        setSelectedCar(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao fazer pré-reserva');
    }
  };

  const handleCancelReservation = async (reservaId) => {
    try {
      await cancelReservation(reservaId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao cancelar reserva');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      const response = await updateUserProfile(editForm);
      if (response.mensagem === 'Dados pessoais atualizados com sucesso') {
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (err) {
      setEditError(err.mensagem || 'Erro ao atualizar perfil');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const compressedImage = await compressImage(file);
        setProfileImage(compressedImage);
        localStorage.setItem(`profileImage_${user.email}`, compressedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Erro ao processar a imagem. Por favor, tente novamente com uma imagem menor.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  const getCarImages = (carId) => {
    const carKey = `car_images_${carId}`;
    const storedImages = localStorage.getItem(carKey);
    return storedImages ? JSON.parse(storedImages) : [];
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % getCarImages(selectedCar?.id).length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      (prev - 1 + getCarImages(selectedCar?.id).length) % getCarImages(selectedCar?.id).length
    );
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const hasPromotion = showPromotionsOnly ? !!getApplicablePromotion(car) : true;
    return matchesSearch && hasPromotion;
  });

  const handleShowNotifications = async () => {
    if (!showNotifications) {
      // Mark all as read when opening
      const unread = notificacoes.filter(n => !n.lida);
      for (const n of unread) {
        try {
          await markNotificationAsRead(n.id);
        } catch (err) {
          // ignore error
        }
      }
      setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
    }
    setShowNotifications(!showNotifications);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explorar':
        return (
          <div className="explorar-section">
            <div className="search-filter-container">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Pesquisar por marca de carro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <label className="promotion-filter">
                <input
                  type="checkbox"
                  checked={showPromotionsOnly}
                  onChange={(e) => setShowPromotionsOnly(e.target.checked)}
                />
                Ver apenas Promoções
              </label>
            </div>
            <div className="cars-grid">
              {filteredCars.map((car) => {
                const images = getCarImages(car.id);
                const firstImage = images.length > 0 ? images[0] : null;
                const promocao = getApplicablePromotion(car);
                const { precoFinal, desconto } = applyDiscount(car.preco, promocao);

                return (
                  <div
                    key={car.id}
                    className="car-card"
                    onClick={() => {
                      setSelectedCar(car);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <div className="car-image">
                      {firstImage ? (
                        <img src={firstImage} alt={`${car.marca} ${car.modelo}`} />
                      ) : (
                        <FaCar className="car-placeholder-icon" />
                      )}
                    </div>
                    <div className="car-info">
                      <h3>{car.marca} {car.modelo}</h3>
                      <p>Ano: {car.ano}</p>
                      {promocao ? (
                        <>
                          <p className="promo-title">{promocao.titulo || 'Promoção Especial'}</p>
                          <p className="preco-original">
                            Preço Original: R$ {car.preco.toLocaleString('pt-BR')}
                          </p>
                          <p className="desconto">
                            Desconto:{' '}
                            {promocao.desconto_tipo === 'percentual'
                              ? `${promocao.desconto_valor}%`
                              : `R$ ${promocao.desconto_valor.toLocaleString('pt-BR')}`}
                          </p>
                          <p className="preco-final">
                            Preço Final: R$ {precoFinal.toLocaleString('pt-BR')}
                          </p>
                        </>
                      ) : (
                        <p>Preço: R$ {car.preco.toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredCars.length === 0 && (
                <p>Nenhum carro encontrado para os critérios selecionados.</p>
              )}
            </div>
          </div>
        );
      case 'reservas':
        return (
          <div className="reservas-grid">
            {reservations.map((reserva) => {
              const images = getCarImages(reserva.veiculo_id);
              const firstImage = images.length > 0 ? images[0] : null;
              const promocao = getApplicablePromotion({
                marca: reserva.marca,
                modelo: reserva.modelo,
                preco: reserva.preco,
              });
              const { precoFinal, desconto } = applyDiscount(reserva.preco, promocao);

              return (
                <div key={reserva.id} className="reserva-card">
                  <div className="reserva-image">
                    {firstImage ? (
                      <img src={firstImage} alt={`${reserva.marca} ${reserva.modelo}`} />
                    ) : (
                      <div className="placeholder-image">
                        <FaCar />
                      </div>
                    )}
                    <span className="reserva-status" data-status={reserva.status}>
                      {reserva.status === 'pendente'
                        ? 'Pendente'
                        : reserva.status === 'confirmada'
                        ? 'Confirmada'
                        : 'Cancelada'}
                    </span>
                  </div>
                  <div className="reserva-info">
                    <h3>{reserva.marca} {reserva.modelo}</h3>
                    <p>Ano: {reserva.ano}</p>
                    {promocao ? (
                      <>
                        <p className="promo-title">{promocao.titulo || 'Promoção Especial'}</p>
                        <p className="preco-original">
                          Preço Original: R$ {reserva.preco.toLocaleString('pt-BR')}
                        </p>
                        <p className="desconto">
                          Desconto:{' '}
                          {promocao.desconto_tipo === 'percentual'
                            ? `${promocao.desconto_valor}%`
                            : `R$ ${promocao.desconto_valor.toLocaleString('pt-BR')}`}
                        </p>
                        <p className="preco-final">
                          Preço Final: R$ {precoFinal.toLocaleString('pt-BR')}
                        </p>
                      </>
                    ) : (
                      <p>Preço: R$ {reserva.preco.toLocaleString('pt-BR')}</p>
                    )}
                    <p>Data da Reserva: {new Date(reserva.data_reserva).toLocaleDateString('pt-BR')}</p>
                    {reserva.status === 'pendente' && (
                      <button
                        className="btn-cancelar"
                        onClick={() => handleCancelReservation(reserva.id)}
                      >
                        <FaTimes /> Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 'perfil':
        return (
          <div className="perfil-section">
            <div className="perfil-header">
              <h2>Meu Perfil</h2>
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="btn-icon btn-success" onClick={handleEditSubmit}>
                      <FaSave /> Salvar
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          nome: user?.nome || '',
                          email: user?.email || '',
                          telefone: user?.telefone || '',
                        });
                      }}
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </>
                ) : (
                  <button className="btn-icon" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Editar
                  </button>
                )}
              </div>
            </div>
            <div className="perfil-content">
              <div className="perfil-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Foto de perfil" className="perfil-image" />
                ) : (
                  <div className="perfil-image-placeholder">
                    <FaUserCircle size={80} />
                  </div>
                )}
                <button
                  className="btn-upload"
                  onClick={triggerImageUpload}
                  disabled={isUploading}
                >
                  <FaCamera />
                  {isUploading ? 'Enviando...' : 'Alterar foto'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                  <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={editForm.nome}
                      onChange={handleEditChange}
                      required
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                      placeholder="Digite seu email"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefone">Telefone</label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={editForm.telefone}
                      onChange={handleEditChange}
                      required
                      pattern="[0-9]{9,15}"
                      title="Telefone deve conter entre 9 e 15 dígitos"
                      placeholder="Digite seu telefone"
                    />
                  </div>
                  {editError && <div className="error-message">{editError}</div>}
                </form>
              ) : (
                <div className="perfil-info">
                  <div className="info-group">
                    <label>Nome Completo</label>
                    <p>{user?.nome || 'Não informado'}</p>
                  </div>
                  <div className="info-group">
                    <label>Email</label>
                    <p>{user?.email || 'Não informado'}</p>
                  </div>
                  <div className="info-group">
                    <label>Telefone</label>
                    <p>{user?.telefone || 'Não informado'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'forum':
        return <Forum />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="top-navbar">
        <div className="logo">
          <h1>AutoElite</h1>
        </div>
        <div className="nav-actions">
          <div className="notifications-container">
            <button
              className="notification-button"
              onClick={handleShowNotifications}
            >
              <FaBell size={20} />
              {notificacoes.filter((n) => !n.lida).length > 0 && (
                <span className="notification-badge">
                  {notificacoes.filter((n) => !n.lida).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown teardrop-effect">
                {notificacoes.length === 0 ? (
                  <p>Nenhuma notificação</p>
                ) : (
                  <div className={`notification-item ${!notificacoes[0].lida ? 'unread' : ''}`}>
                    <p>{notificacoes[0].mensagem}</p>
                    <button
                      className="btn btn-text"
                      onClick={() => setShowNotifications(false)}
                    >
                      Fechar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="user-info">
            {profileImage ? (
              <div className="user-avatar">
                <img src={profileImage} alt={user?.nome} />
              </div>
            ) : (
              <div className="user-avatar">
                <FaUser size={20} />
              </div>
            )}
            <span>{user?.nome}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-wrapper">
        <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="collapse-button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <FaBars />
          </button>
          <div className="nav-links">
            <button
              className={`nav-link ${activeTab === 'explorar' ? 'active' : ''}`}
              onClick={() => setActiveTab('explorar')}
            >
              <FaCar />
              {!isSidebarCollapsed && <span>Explorar</span>}
            </button>
            <button
              className={`nav-link ${activeTab === 'reservas' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservas')}
            >
              <FaCalendarAlt />
              {!isSidebarCollapsed && <span>Minhas Reservas</span>}
            </button>
            <button
              className={`nav-link ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <FaUserEdit />
              {!isSidebarCollapsed && <span>Meu Perfil</span>}
            </button>
            <button
              className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
              onClick={() => setActiveTab('forum')}
            >
              <FaComments />
              {!isSidebarCollapsed && <span>Fórum</span>}
            </button>
            <button className="nav-link logout" onClick={handleLogout}>
              <FaSignOutAlt />
              {!isSidebarCollapsed && <span>Sair</span>}
            </button>
          </div>
        </nav>

        <main className="main-content">
          {error && <div className="error-message">{error}</div>}
          {renderContent()}
        </main>
      </div>

      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal-content car-modal">
            <div className="car-gallery">
              <button className="gallery-nav prev" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              {getCarImages(selectedCar.id).length > 0 ? (
                <img
                  src={getCarImages(selectedCar.id)[currentImageIndex]}
                  alt={`${selectedCar.marca} ${selectedCar.modelo}`}
                  className="car-gallery-image"
                />
              ) : (
                <div className="car-gallery-placeholder">
                  <FaCar size={40} />
                  <p>Nenhuma imagem disponível</p>
                </div>
              )}
              <button className="gallery-nav next" onClick={nextImage}>
                <FaChevronRight />
              </button>
              <div className="gallery-dots">
                {getCarImages(selectedCar.id).map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
            <div className="car-details">
              <h2>{selectedCar.marca} {selectedCar.modelo}</h2>
              <div className="car-specs">
                <p><strong>Ano:</strong> {selectedCar.ano}</p>
                {(() => {
                  const promocao = getApplicablePromotion(selectedCar);
                  const { precoFinal, desconto } = applyDiscount(selectedCar.preco, promocao);
                  return promocao ? (
                    <>
                      <p className="promo-title">{promocao.titulo || 'Promoção Especial'}</p>
                      <p className="preco-original">
                        <strong>Preço Original:</strong> R$ {selectedCar.preco.toLocaleString('pt-BR')}
                      </p>
                      <p className="desconto">
                        <strong>Desconto:</strong>{' '}
                        {promocao.desconto_tipo === 'percentual'
                          ? `${promocao.desconto_valor}%`
                          : `R$ ${promocao.desconto_valor.toLocaleString('pt-BR')}`}
                      </p>
                      <p className="preco-final">
                        <strong>Preço Final:</strong> R$ {precoFinal.toLocaleString('pt-BR')}
                      </p>
                    </>
                  ) : (
                    <p>
                      <strong>Preço:</strong> R$ {selectedCar.preco.toLocaleString('pt-BR')}
                    </p>
                  );
                })()}
                <p><strong>Combustível:</strong> {selectedCar.combustivel}</p>
                <p><strong>Quilometragem:</strong> {selectedCar.quilometragem} km</p>
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
        </div>
      )}

      {showErrorModal && (
        <ConfirmModal
          open={showErrorModal}
          message={errorModalMessage}
          onConfirm={() => setShowErrorModal(false)}
          onCancel={() => setShowErrorModal(false)}
          confirmText="OK"
          cancelText=""
        />
      )}
    </div>
  );
};

export default ClienteDashboard;