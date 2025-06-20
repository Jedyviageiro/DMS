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
<<<<<<< HEAD

  // Reservas (admin)
  listarReservas: () => api.get('/admin/reservas'),
  atualizarStatusReserva: (reserva_id, status) => api.put(`/admin/reservas/${reserva_id}/status`, { status }),

  // Fórum (admin)
  getForumPosts: () => api.get('/api/forum/posts'),
  createForumPost: (data) => api.post('/api/forum/posts', data),
  deleteForumPost: (id) => api.delete(`/api/forum/posts/${id}`),
  getForumReplies: (postId) => api.get(`/api/forum/posts/${postId}/respostas`),
  createForumReply: (postId, data) => api.post(`/api/forum/posts/${postId}/respostas`, data),
  deleteForumReply: (replyId) => api.delete(`/api/forum/respostas/${replyId}`),
  banUser: (userId) => api.post(`/api/usuarios/${userId}/ban`),
=======
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105
};
