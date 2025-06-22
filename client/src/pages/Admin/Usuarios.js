import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import '../../assets/styles/AdminDashboard.css';
import ConfirmModal from '../../components/ConfirmModal';

const Usuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: 'cliente',
  });
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listarUsuarios();
      setUsuarios(response.data.usuarios || response.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      role: usuario.role || 'cliente',
    });
    setShowEditModal(true);
  };

  const limparFormulario = () => {
    setSelectedUsuario(null);
    setFormData({ nome: '', email: '', telefone: '', role: 'cliente' });
  };

  const fecharModal = () => {
    setShowEditModal(false);
    setError(null);
    limparFormulario();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const { nome, email, telefone, role } = formData;

    if (!nome || !email || !telefone) {
      setError('Todos os campos são obrigatórios');
      setActionLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('E-mail inválido');
      setActionLoading(false);
      return;
    }

    const telefoneRegex = /^\d{9,15}$/;
    if (!telefoneRegex.test(telefone)) {
      setError('Telefone inválido (deve conter entre 9 e 15 dígitos)');
      setActionLoading(false);
      return;
    }

    if (!['admin', 'cliente'].includes(role)) {
      setError('Role inválida');
      setActionLoading(false);
      return;
    }

    try {
      await adminApi.atualizarUsuario(selectedUsuario.id, formData);
      fecharModal();
      carregarUsuarios();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.response?.data?.mensagem || 'Erro ao salvar usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja excluir este usuário?',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminApi.excluirUsuario(id);
          carregarUsuarios();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao excluir usuário' });
          console.error('Erro ao excluir usuário:', err);
        } finally {
          setActionLoading(false);
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="admin-loading">Carregando...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Gerenciar Usuários</h1>

        <div className="admin-actions">
          <div className="admin-search-bar">
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-veiculos-grid">
        {filteredUsuarios.map((usuario) => (
          <div key={usuario.id} className="admin-veiculo-card">
            <div className="admin-veiculo-info">
              <h3>{usuario.nome}</h3>
              <p>Email: {usuario.email}</p>
              <p>Telefone: {usuario.telefone || 'Não informado'}</p>
              <p>Role: {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              <div className="admin-veiculo-actions">
                <button
                  className="admin-btn-edit"
                  onClick={() => handleEdit(usuario)}
                  disabled={actionLoading}
                >
                  <FaEdit /> Editar
                </button>
                <button
                  className="admin-btn-delete"
                  onClick={() => handleDelete(usuario.id)}
                  disabled={actionLoading}
                >
                  <FaTrash /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Usuário</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={fecharModal}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
};

export default Usuario;
