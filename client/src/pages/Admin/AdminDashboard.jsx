import React, { useState, useEffect } from 'react';
import { FaCar, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBars, FaSignOutAlt, FaChartBar, FaTag, FaUpload } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import '../../assets/styles/AdminDashboard.css';

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
    imagens: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarVeiculos();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

          // Convert to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    // Limit to 4 images
    if (files.length + formData.imagens.length > 4) {
      alert('Você pode adicionar no máximo 4 imagens por veículo');
      return;
    }
    try {
      // Compress each image
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      );
      
      // Combine with existing images
      const newImages = [...formData.imagens, ...compressedImages].slice(0, 4);
      
      // Update form data with new images
      setFormData(prev => ({
        ...prev,
        imagens: newImages
      }));

      // Save to localStorage with a unique key
      let carKey;
      if (selectedVeiculo && selectedVeiculo.id) {
        carKey = `car_images_${selectedVeiculo.id}`;
      } else {
        carKey = `car_images_${formData.marca}_${formData.modelo}_${formData.ano}`;
      }
      localStorage.setItem(carKey, JSON.stringify(newImages));

      // If editing, update selectedVeiculo as well
      if (selectedVeiculo) {
        setSelectedVeiculo(prev => ({ ...prev, imagens: newImages }));
      }
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Erro ao processar as imagens. Por favor, tente novamente.');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
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

      // Remove images from formData before sending to server
      const { imagens, ...submitData } = formData;

      if (selectedVeiculo) {
        await adminApi.atualizarVeiculo(selectedVeiculo.id, submitData);
        setShowEditModal(false);
        setSelectedVeiculo(null);
      } else {
        const response = await adminApi.adicionarVeiculo(submitData);
        // After adding, move images to the new car id key
        if (response.data.veiculo) {
          const newKey = `car_images_${response.data.veiculo.id}`;
          localStorage.setItem(newKey, JSON.stringify(images));
          // Remove temp key
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
        imagens: []
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
      imagens: images
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await adminApi.excluirVeiculo(id);
        carregarVeiculos();
      } catch (err) {
        setError('Erro ao excluir veículo');
        console.error('Erro:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('landing');
  };

  const filteredVeiculos = veiculos.filter(veiculo =>
    veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <FaPlus /> Adicionar Veículo
                </button>
              </div>
            </div>

            {error && <div className="admin-error-message">{error}</div>}

            <div className="admin-veiculos-grid">
              {filteredVeiculos.map(veiculo => {
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
                      <p>Preço: R$ {veiculo.preco.toLocaleString('pt-BR')}</p>
                      <p>Estoque: {veiculo.estoque}</p>
                      <div className="admin-veiculo-actions">
                        <button className="admin-btn-edit" onClick={() => handleEdit(veiculo)}>
                          <FaEdit /> Editar
                        </button>
                        <button className="admin-btn-delete" onClick={() => handleDelete(veiculo.id)}>
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'promocoes':
        return (
          <div className="admin-content">
            <h1>Gerenciar Promoções</h1>
            {/* Implementar gerenciamento de promoções */}
          </div>
        );
      case 'relatorios':
        return (
          <div className="admin-content">
            <h1>Relatórios</h1>
            {/* Implementar relatórios */}
          </div>
        );
      default:
        return null;
    }
  };

  const renderImagePreview = (images) => {
    if (!images || images.length === 0) {
      return (
        <div className="image-preview-placeholder">
          <FaCar size={40} />
          <p>Nenhuma imagem selecionada</p>
          <small>Clique em "Selecionar Imagens" para adicionar fotos do veículo</small>
        </div>
      );
    }

    return (
      <div className="image-preview-grid">
        {images.map((image, index) => (
          <div key={index} className="image-preview-item">
            <img src={image} alt={`Preview ${index + 1}`} />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleRemoveImage(index)}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderImageUploadSection = () => (
    <div className="form-group">
      <label>Imagens do Veículo (máximo 4)</label>
      <div className="image-upload-container">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="image-upload-input"
        />
        <div className="image-upload-button">
          <FaUpload /> Selecionar Imagens
        </div>
      </div>
      {renderImagePreview(formData.imagens)}
      <small className="image-upload-hint">
        Formatos aceitos: Todos. Tamanho máximo: 5MB por imagem. Máximo 4 imagens.
      </small>
    </div>
  );

  const renderModalForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Marca</label>
        <input
          type="text"
          name="marca"
          value={formData.marca}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Modelo</label>
        <input
          type="text"
          name="modelo"
          value={formData.modelo}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Ano</label>
        <input
          type="number"
          name="ano"
          value={formData.ano}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Preço</label>
        <input
          type="number"
          name="preco"
          value={formData.preco}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="combustivel">Combustível</label>
        <input
          type="text"
          id="combustivel"
          name="combustivel"
          value={formData.combustivel}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Estoque</label>
        <input
          type="number"
          name="estoque"
          value={formData.estoque}
          onChange={handleInputChange}
          required
        />
      </div>
      {renderImageUploadSection()}
      <div className="form-actions">
        <button type="submit" className="admin-btn-primary">
          {selectedVeiculo ? 'Atualizar' : 'Adicionar'} Veículo
        </button>
      </div>
    </form>
  );

  if (loading) {
    return <div className="admin-loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="logo">
          <h1>AutoElite - Admin</h1>
        </div>
        <div className="nav-actions">
          <div className="user-info">
            <span>Administrador</span>
          </div>
        </div>
      </header>

      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <button 
            className="collapse-button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <FaBars />
          </button>
          <div className="nav-links">
            <button 
              className={`nav-link ${activeTab === 'veiculos' ? 'active' : ''}`}
              onClick={() => setActiveTab('veiculos')}
            >
              <FaCar />
              {!isSidebarCollapsed && <span>Veículos</span>}
            </button>
            <button 
              className={`nav-link ${activeTab === 'promocoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('promocoes')}
            >
              <FaTag />
              {!isSidebarCollapsed && <span>Promoções</span>}
            </button>
            <button 
              className={`nav-link ${activeTab === 'relatorios' ? 'active' : ''}`}
              onClick={() => setActiveTab('relatorios')}
            >
              <FaChartBar />
              {!isSidebarCollapsed && <span>Relatórios</span>}
            </button>
            <button 
              className="nav-link logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              {!isSidebarCollapsed && <span>Sair</span>}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {/* Add/Edit Vehicle Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{showEditModal ? 'Editar Veículo' : 'Adicionar Veículo'}</h2>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}>
                <FaTimes />
              </button>
            </div>
            {renderModalForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

