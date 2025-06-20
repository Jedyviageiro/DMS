import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // ajuste conforme o seu backend
});

// Adiciona o token automaticamente se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções da API de administrador
export const adminApi = {
  listarUsuarios: () => api.get('/admin/usuarios'),
  
  criarUsuario: (dados) => api.post('/usuarios', dados),

  atualizarUsuario: (id, data) => api.put(`/api/usuarios/${id}`, data),
 
  excluirUsuario: (id) => api.delete(`/api/usuarios/${id}`),
};
