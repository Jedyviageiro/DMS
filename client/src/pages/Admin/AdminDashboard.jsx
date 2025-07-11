import React, { useState, useEffect } from 'react';
import { FaCar, FaSearch, FaInbox, FaCheckCircle, FaBars } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import { adminApi as adminApiAdmin } from '../../services/adminApi';
import Sidebar from './Sidebar';
import VehicleModal from './VehicleModal';
import Promocoes from './Promocoes';
import Usuario from './Usuarios';
import AdminForum from './AdminForum';
import Relatorios from './Relatorios';
import '../../assets/styles/AdminDashboard.css';
import ConfirmModal from '../../components/ConfirmModal';

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('veiculos');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    preco: '',
    combustivel: '',
    descricao: '',
    estoque: '',
    imagens: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [errorReservas, setErrorReservas] = useState(null);
  const [reservaSearch, setReservaSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'veiculos') {
      carregarVeiculos();
    } else if (activeTab === 'reservas') {
      carregarReservas();
    }
  }, [activeTab]);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const response = await adminApi.listarVeiculos();
      setVeiculos(response.data.veiculos);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar veículos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarReservas = async () => {
    try {
      setLoadingReservas(true);
      const response = await adminApiAdmin.listarReservas();
      setReservas(response.data.reservas);
      setErrorReservas(null);
    } catch (err) {
      setErrorReservas('Erro ao carregar reservas');
      console.error('Erro:', err);
    } finally {
      setLoadingReservas(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
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
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.imagens.length > 4) {
      setErrorModal({ open: true, message: 'Você pode adicionar no máximo 4 imagens por veículo' });
      return;
    }
    try {
      const compressedImages = await Promise.all(files.map((file) => compressImage(file)));
      const newImages = [...formData.imagens, ...compressedImages].slice(0, 4);
      setFormData((prev) => ({
        ...prev,
        imagens: newImages,
      }));
      let carKey;
      if (selectedVeiculo && selectedVeiculo.id) {
        carKey = `car_images_${selectedVeiculo.id}`;
      } else {
        carKey = `car_images_${formData.marca}_${formData.modelo}_${formData.ano}`;
      }
      localStorage.setItem(carKey, JSON.stringify(newImages));
      if (selectedVeiculo) {
        setSelectedVeiculo((prev) => ({ ...prev, imagens: newImages }));
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setErrorModal({ open: true, message: 'Erro ao processar as imagens. Por favor, tente novamente.' });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let carKey;
      let images = formData.imagens;
      if (selectedVeiculo && selectedVeiculo.id) {
        carKey = `car_images_${selectedVeiculo.id}`;
        const storedImages = localStorage.getItem(carKey);
        if (storedImages) images = JSON.parse(storedImages);
      } else {
        carKey = `car_images_${formData.marca}_${formData.modelo}_${formData.ano}`;
        const storedImages = localStorage.getItem(carKey);
        if (storedImages) images = JSON.parse(storedImages);
      }
      const { imagens, ...submitData } = formData;
      if (selectedVeiculo) {
        await adminApi.atualizarVeiculo(selectedVeiculo.id, submitData);
        setShowEditModal(false);
        setSelectedVeiculo(null);
        setSuccessMessage('Veículo atualizado com sucesso!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        const response = await adminApi.adicionarVeiculo(submitData);
        if (response.data.veiculo) {
          const newKey = `car_images_${response.data.veiculo.id}`;
          localStorage.setItem(newKey, JSON.stringify(images));
          localStorage.removeItem(carKey);
        }
        setShowAddModal(false);
      }
      setFormData({
        marca: '',
        modelo: '',
        ano: '',
        preco: '',
        combustivel: '',
        descricao: '',
        estoque: '',
        imagens: [],
      });
      carregarVeiculos();
    } catch (err) {
      setError('Erro ao salvar veículo');
      console.error('Erro:', err);
    }
  };

  const handleEdit = (veiculo) => {
    setSelectedVeiculo(veiculo);
    const carKey = `car_images_${veiculo.id}`;
    const storedImages = localStorage.getItem(carKey);
    const images = storedImages ? JSON.parse(storedImages) : [];
    setFormData({
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      preco: veiculo.preco,
      combustivel: veiculo.combustivel,
      descricao: veiculo.descricao,
      estoque: veiculo.estoque,
      imagens: images,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja excluir este veículo?',
      onConfirm: async () => {
        try {
          await adminApi.excluirVeiculo(id);
          carregarVeiculos();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao excluir veículo' });
          console.error('Erro:', err);
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('landing');
  };

  const filteredVeiculos = veiculos.filter(
    (veiculo) =>
      veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservas = reservas.filter((reserva) => {
    const search = reservaSearch.toLowerCase();
    return (
      reserva.usuario_nome.toLowerCase().includes(search) ||
      reserva.usuario_email.toLowerCase().includes(search) ||
      reserva.marca.toLowerCase().includes(search) ||
      reserva.modelo.toLowerCase().includes(search) ||
      reserva.status.toLowerCase().includes(search)
    );
  });

  const handleStatusReserva = (reserva_id, status) => {
    setConfirmModal({
      open: true,
      message: `Tem certeza que deseja ${status === 'confirmada' ? 'aceitar' : 'recusar'} esta reserva?`,
      onConfirm: async () => {
        try {
          await adminApiAdmin.atualizarStatusReserva(reserva_id, status);
          carregarReservas();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao atualizar status da reserva' });
          console.error('Erro:', err);
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'veiculos':
        return (
          <div className="admin-content">
            <div className="admin-header">
              <h1>Gerenciar Veículos</h1>
              <div className="admin-actions">
                <div className="admin-search-bar">
                  <FaSearch className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar veículos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}>
                  <FaCar /> Adicionar Veículo
                </button>
              </div>
            </div>
            {error && <div className="admin-error-message">{error}</div>}
            <div className="admin-veiculos-grid">
              {filteredVeiculos.map((veiculo) => {
                const carKey = `car_images_${veiculo.id}`;
                const storedImages = localStorage.getItem(carKey);
                const images = storedImages ? JSON.parse(storedImages) : [];
                const firstImage = images.length > 0 ? images[0] : null;
                return (
                  <div key={veiculo.id} className="admin-veiculo-card">
                    <div className="admin-veiculo-image">
                      {firstImage ? (
                        <img src={firstImage} alt={`${veiculo.marca} ${veiculo.modelo}`} />
                      ) : (
                        <FaCar className="admin-placeholder-icon" />
                      )}
                    </div>
                    <div className="admin-veiculo-info">
                      <h3>{veiculo.marca} {veiculo.modelo}</h3>
                      <p>Ano: {veiculo.ano}</p>
                      <p>Preço: MZN {veiculo.preco.toLocaleString('en-US', { style: 'currency', currency: 'MZN' })}</p>
                      <p>Estoque: {veiculo.estoque}</p>
                      <div className="admin-veiculo-actions">
                        <button className="admin-btn-edit" onClick={() => handleEdit(veiculo)}>
                          <FaCar /> Editar
                        </button>
                        <button className="admin-btn-delete" onClick={() => handleDelete(veiculo.id)}>
                          <FaCar /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'usuarios':
        return <Usuario />;
      case 'promocoes':
        return <Promocoes />;
      case 'reservas':
        return (
          <div className="admin-content admin-reservas-section">
            <div className="admin-header">
              <div>
                <h1>Reservas dos Clientes</h1>
                <p className="admin-section-desc">Gerencie as reservas feitas pelos clientes. Aceite ou recuse solicitações de reserva de veículos.</p>
              </div>
              <div className="admin-search-bar">
                <FaSearch className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, veículo ou status..."
                  value={reservaSearch}
                  onChange={e => setReservaSearch(e.target.value)}
                />
              </div>
            </div>
            {loadingReservas ? (
              <div className="admin-loading">Carregando reservas...</div>
            ) : errorReservas ? (
              <div className="admin-error-message">{errorReservas}</div>
            ) : filteredReservas.length === 0 ? (
              <div className="admin-empty-state">
                <FaInbox size={48} />
                <p>Nenhuma reserva encontrada.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table admin-reservas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Veículo</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td>{reserva.id}</td>
                        <td>{reserva.usuario_nome}</td>
                        <td>{reserva.usuario_email}</td>
                        <td>{reserva.marca} {reserva.modelo} ({reserva.ano})</td>
                        <td>{new Date(reserva.data_reserva).toLocaleString('pt-BR')}</td>
                        <td>
                          <span className={`reserva-status-badge status-${reserva.status}`}>
                            {reserva.status.charAt(0).toUpperCase() + reserva.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {reserva.status === 'pendente' && (
                            <div className="admin-reservas-actions">
                              <button className="admin-btn-primary" onClick={() => handleStatusReserva(reserva.id, 'confirmada')}>Aceitar</button>
                              <button className="admin-btn-delete" onClick={() => handleStatusReserva(reserva.id, 'cancelada')}>Recusar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'relatorios':
        return <Relatorios />;
      case 'forum':
        return <AdminForum />;
      default:
        return null;
    }
  };

  if (loading && activeTab === 'veiculos') {
    return <div className="admin-loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="top-navbar">
        <div className="top-navbar-left">
          <button
            className="hamburger-top-navbar"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Abrir/Fechar menu"
          >
            <FaBars size={26} />
          </button>
          <div className="logo">
            <h1>AutoElite - Admin</h1>
          </div>
        </div>
        <div className="nav-actions">
          <div className="user-info">
            <span>Administrador <FaCheckCircle style={{ color: '#4f8cff', marginLeft: 4, verticalAlign: 'middle' }} title="Verificado" /></span>
          </div>
        </div>
      </header>
      <div className="dashboard-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          handleLogout={handleLogout}
        />
        <main className="main-content">{renderContent()}</main>
      </div>
      {(showAddModal || showEditModal) && (
        <VehicleModal
          showAddModal={showAddModal}
          showEditModal={showEditModal}
          setShowAddModal={setShowAddModal}
          setShowEditModal={setShowEditModal}
          selectedVeiculo={selectedVeiculo}
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          handleSubmit={handleSubmit}
        />
      )}
      {confirmModal.open && (
        <ConfirmModal
          open={confirmModal.open}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ open: false, message: '', onConfirm: null })}
        />
      )}
      {errorModal.open && (
        <ConfirmModal
          open={errorModal.open}
          message={errorModal.message}
          onConfirm={() => setErrorModal({ open: false, message: '' })}
          onCancel={() => setErrorModal({ open: false, message: '' })}
          confirmText="OK"
          cancelText=""
        />
      )}
      {successMessage && (
        <ConfirmModal
          open={true}
          message={successMessage}
          onConfirm={() => setSuccessMessage('')}
          onCancel={() => setSuccessMessage('')}
          confirmText="OK"
          cancelText=""
        />
      )}
    </div>
  );
};

export default AdminDashboard;