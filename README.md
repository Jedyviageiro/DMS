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
