import React, { useState, useEffect } from 'react';
import { FaTag, FaSearch } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import PromocaoModal from './PromocaoModal';
import '../../assets/styles/AdminDashboard.css';
import ConfirmModal from '../../components/ConfirmModal';

const Promocoes = () => {
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromocao, setSelectedPromocao] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    desconto_tipo: 'percentual',
    desconto_valor: '',
    data_inicio: '',
    data_fim: '',
    ativo: true,
    aplicavel_em: 'todos',
    marca: '',
    modelo: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  useEffect(() => {
    carregarPromocoes();
  }, []);

  useEffect(() => {
    if (showAddModal || showEditModal) {
      adminApi.listarVeiculos().then(res => {
        const veiculos = res.data.veiculos;
        setMarcas([...new Set(veiculos.map(v => v.marca))]);
        setModelos([...new Set(veiculos.map(v => v.modelo))]);
      });
    }
  }, [showAddModal, showEditModal]);

  const carregarPromocoes = async () => {
    try {
      setLoading(true);
      const response = await adminApi.listarPromocoes();
      setPromocoes(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar promoções');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        marca: formData.aplicavel_em === 'marca' ? formData.marca : null,
        modelo: formData.aplicavel_em === 'modelo' ? formData.modelo : null,
      };
      if (selectedPromocao) {
        await adminApi.atualizarPromocao(selectedPromocao.id, submitData);
        setShowEditModal(false);
        setSelectedPromocao(null);
      } else {
        await adminApi.criarPromocao(submitData);
        setShowAddModal(false);
      }
      setFormData({
        titulo: '',
        descricao: '',
        desconto_tipo: 'percentual',
        desconto_valor: '',
        data_inicio: '',
        data_fim: '',
        ativo: true,
        aplicavel_em: 'todos',
        marca: '',
        modelo: '',
      });
      carregarPromocoes();
    } catch (err) {
      setError('Erro ao salvar promoção');
      console.error('Erro:', err);
    }
  };

  const handleEdit = (promocao) => {
    setSelectedPromocao(promocao);
    setFormData({
      titulo: promocao.titulo,
      descricao: promocao.descricao,
      desconto_tipo: promocao.desconto_tipo,
      desconto_valor: promocao.desconto_valor,
      data_inicio: promocao.data_inicio.split('T')[0],
      data_fim: promocao.data_fim.split('T')[0],
      ativo: promocao.ativo === 1,
      aplicavel_em: promocao.aplicavel_em,
      marca: promocao.marca || '',
      modelo: promocao.modelo || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja excluir esta promoção?',
      onConfirm: async () => {
        try {
          await adminApi.deletarPromocao(id);
          carregarPromocoes();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao excluir promoção' });
          console.error('Erro:', err);
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const filteredPromocoes = promocoes.filter(
    (promocao) =>
      promocao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promocao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="admin-loading">Carregando...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Gerenciar Promoções</h1>
        <div className="admin-actions">
          <div className="admin-search-bar">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Buscar promoções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="admin-btn-primary" onClick={() => setShowAddModal(true)}>
            <FaTag /> Adicionar Promoção
          </button>
        </div>
      </div>
      {error && <div className="admin-error-message">{error}</div>}
      <div className="admin-veiculos-grid">
        {filteredPromocoes.map((promocao) => (
          <div key={promocao.id} className="admin-veiculo-card">
            <div className="admin-veiculo-info">
              <h3>{promocao.titulo}</h3>
              <p>{promocao.descricao}</p>
              <p>
                Desconto:{' '}
                {promocao.desconto_tipo === 'percentual'
                  ? `${promocao.desconto_valor}%`
                  : `R$ ${promocao.desconto_valor}`}
              </p>
              <p>
                Período: {new Date(promocao.data_inicio).toLocaleDateString()} -{' '}
                {new Date(promocao.data_fim).toLocaleDateString()}
              </p>
              <p>Status: {promocao.ativo ? 'Ativa' : 'Inativa'}</p>
              <p>Aplicável em: {promocao.aplicavel_em}</p>
              {promocao.marca && <p>Marca: {promocao.marca}</p>}
              {promocao.modelo && <p>Modelo: {promocao.modelo}</p>}
              <div className="admin-veiculo-actions">
                <button className="admin-btn-edit" onClick={() => handleEdit(promocao)}>
                  <FaTag /> Editar
                </button>
                <button className="admin-btn-delete" onClick={() => handleDelete(promocao.id)}>
                  <FaTag /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
      { (showAddModal || showEditModal) && (
        <PromocaoModal
          showAddModal={showAddModal}
          showEditModal={showEditModal}
          setShowAddModal={setShowAddModal}
          setShowEditModal={setShowEditModal}
          selectedPromocao={selectedPromocao}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          marcas={marcas}
          modelos={modelos}
        />
      )}
    </div>
  );
};

export default Promocoes;