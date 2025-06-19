import React, { useState, useEffect } from 'react';
import { FaTag, FaSearch } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import PromocaoModal from './PromocaoModal';
import '../../assets/styles/AdminDashboard.css';

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

  useEffect(() => {
    carregarPromocoes();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta promoção?')) {
      try {
        await adminApi.deletarPromocao(id);
        carregarPromocoes();
      } catch (err) {
        setError('Erro ao excluir promoção');
        console.error('Erro:', err);
      }
    }
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
      {(showAddModal || showEditModal) && (
        <PromocaoModal
          showAddModal={showAddModal}
          showEditModal={showEditModal}
          setShowAddModal={setShowAddModal}
          setShowEditModal={setShowEditModal}
          selectedPromocao={selectedPromocao}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Promocoes;