import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/api/usuarios/perfil', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao atualizar perfil' };
  }
};

export const getVehicles = (filters = {}) => {
  const { marca, precoMin, precoMax, combustivel } = filters;
  return api.get('/api/veiculos', {
    params: { marca, precoMin, precoMax, combustivel },
  });
};

export const getReservations = () => api.get('/api/reservas');

export const createReservation = (veiculo_id) =>
  api.post('/api/reservas', { veiculo_id });

export const cancelReservation = (reserva_id) =>
  api.delete(`/api/reservas/${reserva_id}`);

export const getNotifications = () => api.get('/api/notificacoes');

export const markNotificationAsRead = (notificacao_id) =>
  api.put(`/api/notificacoes/${notificacao_id}/lida`);

export const getPromocoes = () => api.get('/api/promocoes');

export const adminApi = {
  listarVeiculos: () => api.get('/api/veiculos'),

   criarUsuario: (dados) => api.post('/usuarios', dados),
   
  adicionarVeiculo: (veiculoData) => api.post('/api/veiculos', veiculoData),

  atualizarVeiculo: (id, veiculoData) =>
    api.put(`/api/veiculos/${id}`, veiculoData),

  excluirVeiculo: (id) => api.delete(`/api/veiculos/${id}`),

  entradaEstoque: (id, quantidade) =>
    api.patch(`/api/veiculos/${id}/entrada`, { quantidade }),

  saidaEstoque: (id, quantidade) =>
    api.patch(`/api/veiculos/${id}/saida`, { quantidade }),

  listarUsuarios: () => api.get('/api/usuarios'),

  atualizarUsuario: (id, data) => api.put(`/api/usuarios/${id}`, data),

  excluirUsuario: (id) => api.delete(`/api/usuarios/${id}`),

  listarPromocoes: () => api.get('/api/promocoes'),

  criarPromocao: (promocaoData) => api.post('/api/promocoes', promocaoData),

  atualizarPromocao: (id, promocaoData) =>
    api.put(`/api/promocoes/${id}`, promocaoData),

  deletarPromocao: (id) => api.delete(`/api/promocoes/${id}`),

  obterPromocaoPorId: (id) => api.get(`/api/promocoes/${id}`),

  listarRelatorios: () => api.get('/api/relatorios'),
};

export default api;
