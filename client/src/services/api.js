import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User profile update
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/usuarios/perfil', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao atualizar perfil' };
  }
};

// Vehicles endpoints
export const getVehicles = (filters = {}) => {
  const { marca, precoMin, precoMax, combustivel } = filters;
  return api.get('/veiculos', {
    params: {
      marca,
      precoMin,
      precoMax,
      combustivel
    }
  });
};

// Reservations endpoints
export const getReservations = () => api.get('/reservas');
export const createReservation = (veiculo_id) => api.post('/reservas', { veiculo_id });
export const cancelReservation = (reserva_id) => api.delete(`/reservas/${reserva_id}`);

// Notifications endpoints
export const getNotifications = () => api.get('/notificacoes');
export const markNotificationAsRead = (notificacao_id) => 
  api.put(`/notificacoes/${notificacao_id}/lida`);

// Admin API functions
export const adminApi = {
  // Vehicle Management
  listarVeiculos: () => api.get('/veiculos'),
  adicionarVeiculo: (veiculoData) => api.post('/veiculos', veiculoData),
  atualizarVeiculo: (id, veiculoData) => api.put(`/veiculos/${id}`, veiculoData),
  excluirVeiculo: (id) => api.delete(`/veiculos/${id}`),
  entradaEstoque: (id, quantidade) => api.patch(`/veiculos/${id}/entrada`, { quantidade }),
  saidaEstoque: (id, quantidade) => api.patch(`/veiculos/${id}/saida`, { quantidade })
};

export default api; 