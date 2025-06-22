import React from 'react';
import { FaCar, FaTag, FaChartBar, FaSignOutAlt, FaBars, FaUsers, FaCalendarAlt, FaComments } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab, isSidebarCollapsed, setIsSidebarCollapsed, handleLogout }) => {
  return (
    <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-links">
        <div className="nav-links-main">
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
            className={`nav-link ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <FaCalendarAlt />
            {!isSidebarCollapsed && <span>Ver Reservas</span>}
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
          <button
            className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            <FaComments />
            {!isSidebarCollapsed && <span>Fórum</span>}
          </button>
        </div>
        <div className="nav-links-separator"></div>
        <button className="nav-link logout" onClick={handleLogout}>
          <FaSignOutAlt />
          {!isSidebarCollapsed && <span>Sair</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;