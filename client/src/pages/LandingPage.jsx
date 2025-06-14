import React from 'react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <h1>AutoElite</h1>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Transforme sua Concessionária com Tecnologia de Elite</h1>
              <p className="hero-subtitle">Gerencie seu negócio com eficiência, modernidade e precisão. Uma solução completa para concessionárias que buscam excelência.</p>
              <div className="hero-buttons">
                <button onClick={() => onNavigate('login')} className="btn btn-primary">Acessar Sistema</button>
                <button onClick={() => onNavigate('register')} className="btn btn-secondary">Saiba Mais</button>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <img src="src/assets/images/hero-bg.jpg" alt="Interior de um carro de luxo" className="hero-image" />
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3>Gestão Inteligente</h3>
                <p>Controle total do seu inventário e operações com nossa plataforma intuitiva.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3>Relatórios Avançados</h3>
                <p>Análises detalhadas e insights valiosos para tomada de decisões.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Experiência Cliente</h3>
                <p>Ofereça um atendimento premium e personalizado aos seus clientes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 AutoElite. Todos os direitos reservados.</p>
          <div className="developer-links">
            <a href="https://github.com/Jedyviageiro" target="_blank" rel="noopener noreferrer" className="developer-link">
              <i className="fab fa-github"></i> Jedy Viageiro
            </a>
            <a href="https://github.com/BataneDomingos" target="_blank" rel="noopener noreferrer" className="developer-link">
              <i className="fab fa-github"></i> Batane Domingos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 