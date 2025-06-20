import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';
import { MdDeleteOutline, MdBlock } from 'react-icons/md';
import { adminApi } from '../../services/adminApi';
import ConfirmModal from '../../components/ConfirmModal';

const getProfileImage = (email) => {
  if (!email) return null;
  const img = localStorage.getItem(`profileImage_${email}`);
  return img || null;
};

const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const AdminForum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const profileImage = user ? getProfileImage(user.email) : null;
  const isAdmin = user && user.role === 'admin';
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getForumPosts();
      setPosts(res.data.posts);
      setError('');
    } catch (err) {
      setError('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    let imagem_url = null;
    if (newImage) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        imagem_url = ev.target.result;
        await sendPost(imagem_url);
      };
      reader.readAsDataURL(newImage);
    } else {
      await sendPost(null);
    }
  };

  const sendPost = async (imagem_url) => {
    try {
      await adminApi.createForumPost({ mensagem: newMessage, imagem_url });
      setNewMessage('');
      setNewImage(null);
      fetchPosts();
    } catch (err) {
      setError('Erro ao criar post');
    }
  };

  const handleToggleReplies = async (post) => {
    if (selectedPostId === post.id) {
      setSelectedPostId(null);
      return;
    }
    setSelectedPostId(post.id);
    setReplyMessage('');
    setReplyImage(null);
    setReplyLoading(true);
    try {
      const res = await adminApi.getForumReplies(post.id);
      setReplies((prev) => ({ ...prev, [post.id]: res.data.respostas }));
    } catch {
      setReplies((prev) => ({ ...prev, [post.id]: [] }));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReply = async (e, postId) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    let imagem_url = null;
    if (replyImage) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        imagem_url = ev.target.result;
        await sendReply(imagem_url, postId);
      };
      reader.readAsDataURL(replyImage);
    } else {
      await sendReply(null, postId);
    }
  };

  const sendReply = async (imagem_url, postId) => {
    try {
      await adminApi.createForumReply(postId, { resposta: replyMessage, imagem_url });
      setReplyMessage('');
      setReplyImage(null);
      handleToggleReplies(posts.find(p => p.id === postId));
    } catch (err) {
      setError('Erro ao responder');
    }
  };

  // Admin controls
  const handleDeletePost = (postId) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja deletar este post?',
      onConfirm: async () => {
        try {
          await adminApi.deleteForumPost(postId);
          fetchPosts();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao deletar post' });
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleDeleteReply = (replyId, postId) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja deletar esta resposta?',
      onConfirm: async () => {
        try {
          await adminApi.deleteForumReply(replyId);
          handleToggleReplies(posts.find(p => p.id === postId));
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao deletar resposta' });
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleBanUser = (userId) => {
    setConfirmModal({
      open: true,
      message: 'Tem certeza que deseja banir este usuário?',
      onConfirm: async () => {
        try {
          await adminApi.banUser(userId);
          fetchPosts();
        } catch (err) {
          setErrorModal({ open: true, message: 'Erro ao banir usuário' });
        } finally {
          setConfirmModal({ open: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const todayPosts = posts.filter(p => isToday(p.data_postagem));
  const postsToShow = showAll ? posts : todayPosts;

  const getAvatar = (email) => {
    if (user && email === user.email) {
      return profileImage || null;
    }
    return null;
  };

  return (
    <div className="forum-section">
      <h2>Fórum</h2>
      <div className="forum-note">As respostas são sempre para a mensagem principal, não para outras respostas.</div>
      {error && <div className="error-message">{error}</div>}
      <form className="forum-new-post" onSubmit={handleNewPost}>
        <div className="forum-form-row">
          <div className="forum-avatar">
            {profileImage ? (
              <img src={profileImage} alt="avatar" />
            ) : (
              <FaUserCircle size={36} color="#bdbdbd" />
            )}
          </div>
          <textarea
            className="forum-textarea"
            placeholder="Escreva sua dúvida ou mensagem..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            required
          />
        </div>
        <div className="forum-form-actions forum-form-actions-row">
          <button type="submit">Enviar</button>
        </div>
      </form>
      {!showAll && posts.length > todayPosts.length && (
        <button className="forum-load-previous" onClick={() => setShowAll(true)}>
          Carregar conversas anteriores
        </button>
      )}
      {loading ? (
        <div>Carregando posts...</div>
      ) : (
        <div className="forum-posts-list">
          {postsToShow.length === 0 ? <div>Nenhuma mensagem no fórum ainda.</div> : postsToShow.map(post => {
            const postProfileImg = getAvatar(post.usuario_email);
            const isPostAdmin = post.usuario_role === 'admin';
            return (
              <div key={post.id} className="forum-post-list-item">
                <div className="forum-post-header">
                  <div className="forum-avatar">
                    {postProfileImg ? (
                      <img src={postProfileImg} alt="avatar" />
                    ) : (
                      <FaUserCircle size={32} color="#bdbdbd" />
                    )}
                  </div>
                  <div>
                    <strong>{post.usuario_nome} {isPostAdmin && <FaCheckCircle style={{ color: '#4f8cff', marginLeft: 2, verticalAlign: 'middle' }} title="Admin verificado" />}</strong>
                    <span className="forum-post-date">{new Date(post.data_postagem).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="forum-admin-actions">
                    <button title="Deletar post" className="modern-icon-btn" onClick={() => handleDeletePost(post.id)}><MdDeleteOutline size={22} /></button>
                    <button title="Banir usuário" className="modern-icon-btn" onClick={() => handleBanUser(post.usuario_id)}><MdBlock size={22} /></button>
                  </div>
                </div>
                <div className="forum-post-message">{post.mensagem}</div>
                {post.imagem_url && <img src={post.imagem_url} alt="imagem" className="forum-post-img" />}
                <div className="forum-post-actions">
                  <button className="forum-ver-respostas" onClick={() => handleToggleReplies(post)}>
                    Ver respostas ({post.resposta_count || 0}) {selectedPostId === post.id ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
                {selectedPostId === post.id && (
                  <div className="forum-replies-thread">
                    <div className="forum-replies">
                      <h4>Respostas</h4>
                      {replyLoading ? <div>Carregando respostas...</div> : (replies[post.id]?.length === 0 ? <div>Nenhuma resposta ainda.</div> : replies[post.id].map(r => {
                        const replyProfileImg = getAvatar(r.usuario_email);
                        const isReplyAdmin = r.usuario_role === 'admin';
                        return (
                          <div key={r.id} className="forum-reply">
                            <div className="forum-avatar">
                              {replyProfileImg ? (
                                <img src={replyProfileImg} alt="avatar" />
                              ) : (
                                <FaUserCircle size={28} color="#bdbdbd" />
                              )}
                            </div>
                            <div>
                              <div><strong>{r.usuario_nome} {isReplyAdmin && <FaCheckCircle style={{ color: '#4f8cff', marginLeft: 2, verticalAlign: 'middle' }} title="Admin verificado" />}</strong> <span className="forum-post-date">{new Date(r.data_resposta).toLocaleString('pt-BR')}</span></div>
                              <div>{r.resposta}</div>
                            </div>
                            <div className="forum-admin-actions">
                              <button title="Deletar resposta" className="modern-icon-btn" onClick={() => handleDeleteReply(r.id, post.id)}><MdDeleteOutline size={20} /></button>
                              <button title="Banir usuário" className="modern-icon-btn" onClick={() => handleBanUser(r.usuario_id)}><MdBlock size={20} /></button>
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                    <form className="forum-reply-form" onSubmit={e => handleReply(e, post.id)}>
                      <textarea
                        className="forum-textarea"
                        placeholder="Responder..."
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        required
                      />
                      <div className="forum-form-actions forum-form-actions-row">
                        <button type="submit">Responder</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
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

export default AdminForum; 