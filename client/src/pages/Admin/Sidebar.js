import React from 'react';
import { FaCar, FaTag, FaChartBar, FaSignOutAlt, FaBars, FaUsers } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab, isSidebarCollapsed, setIsSidebarCollapsed, handleLogout }) => {
  return (
    <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <button
        className="collapse-button"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <FaBars />
      </button>
      <div className="nav-links">
        <button
          className={`nav-link ${activeTab === 'veiculos' ? 'active' : ''}`}
          onClick={() => setActiveTab('veiculos')}
        >
          <FaCar />
          {!isSidebarCollapsed && <span>Veículos</span>}
        </button>
        <button
          className={`nav-link ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <FaUsers />
          {!isSidebarCollapsed && <span>Usuários</span>}
        </button>
        <button
          className={`nav-link ${activeTab === 'promocoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('promocoes')}
        >
          <FaTag />
          {!isSidebarCollapsed && <span>Promoções</span>}
        </button>
        <button
          className={`nav-link ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          <FaChartBar />
          {!isSidebarCollapsed && <span>Relatórios</span>}
        </button>
        <button className="nav-link logout" onClick={handleLogout}>
          <FaSignOutAlt />
          {!isSidebarCollapsed && <span>Sair</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;