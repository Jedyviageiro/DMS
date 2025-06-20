import React from 'react';
<<<<<<< HEAD
import { FaCar, FaTag, FaChartBar, FaSignOutAlt, FaBars, FaUsers, FaCalendarAlt, FaComments } from 'react-icons/fa';
=======
import { FaCar, FaTag, FaChartBar, FaSignOutAlt, FaBars, FaUsers } from 'react-icons/fa';
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105

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
<<<<<<< HEAD
          className={`nav-link ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          <FaCalendarAlt />
          {!isSidebarCollapsed && <span>Ver Reservas</span>}
        </button>
        <button
=======
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105
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
<<<<<<< HEAD
        <button
          className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
          onClick={() => setActiveTab('forum')}
        >
          <FaComments />
          {!isSidebarCollapsed && <span>Fórum</span>}
        </button>
=======
>>>>>>> b8c950df1db816c1bccb1d2262b0f65792127105
        <button className="nav-link logout" onClick={handleLogout}>
          <FaSignOutAlt />
          {!isSidebarCollapsed && <span>Sair</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;