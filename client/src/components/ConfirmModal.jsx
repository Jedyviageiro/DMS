import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/AdminDashboard.css';

const ConfirmModal = ({ open, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', successMessage }) => {
  if (!open && !successMessage) return null;
  return (
    <div className="modal-overlay">
      {successMessage && (
        <div className="modal-success-message show-success">
          {successMessage}
        </div>
      )}
      <div className="modal-content" style={{ maxWidth: 400 }}>
        {open && <button className="modal-close" onClick={onCancel}><FaTimes /></button>}
        {open && <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', textAlign: 'center' }}>{message}</h2>}
        {open && <div className="modal-buttons-row">
          <button className="admin-btn-primary" onClick={onConfirm}>{confirmText}</button>
          <button className="admin-btn-danger" onClick={onCancel}>{cancelText}</button>
        </div>}
      </div>
    </div>
  );
};

export default ConfirmModal; 