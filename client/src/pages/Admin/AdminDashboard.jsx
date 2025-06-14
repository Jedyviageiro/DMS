import React from 'react';

function AdminDashboard({ onNavigate }) {
  return (
    <div className="dashboard">
      <h1>Dashboard do Administrador</h1>
      <button onClick={() => onNavigate('landing')}>Voltar</button>
    </div>
  );
}

export default AdminDashboard;
