import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/AdminDashboard.css';

const ConfirmModal = ({ open, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <button className="modal-close" onClick={onCancel}>
          <FaTimes />
        </button>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', textAlign: 'center' }}>{message}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="admin-btn-primary" onClick={onConfirm}>{confirmText}</button>
          <button className="admin-btn-secondary" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 