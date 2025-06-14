# 🚗 Sistema de Gerenciamento de Concessionárias (DMS)

Um sistema completo para gestão de concessionárias de veículos, desenvolvido com:

**🛠 Stack Tecnológica:**
- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL
- **Autenticação:** JWT
- **Envio de E-mails:** Nodemailer/SendGrid

## ✨ Funcionalidades Principais

### 👨‍💼 Módulo do Cliente
- **Cadastro e Login** de usuários
- **Catálogo de Veículos** com filtros avançados
- **Sistema de Pré-reserva** com confirmação por e-mail
- **Acompanhamento** de pedidos
- **Avaliação** de veículos comprados

### 🏢 Módulo da Concessionária
- **Gestão completa** de estoque de veículos
- **Controle de preços** e promoções
- **Gerenciamento** de pré-reservas
- **Relatórios** de vendas e desempenho
- **Ferramentas** de análise de mercado

## 🔧 Requisitos Técnicos

### Backend (Node.js/Express)
```javascript
// Exemplo de rota para listagem de veículos
app.get('/api/veiculos', (req, res) => {
  // Lógica para retornar veículos do banco de dados
});



tabela de promocao
CREATE TABLE promocoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  desconto_tipo ENUM('percentual', 'valor_fixo') NOT NULL,
  desconto_valor DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  aplicavel_em ENUM('todos', 'marca', 'modelo') NOT NULL DEFAULT 'todos',
  marca VARCHAR(50) DEFAULT NULL,
  modelo VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

