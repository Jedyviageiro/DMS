const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarConfirmacaoReserva = async (email, nome, veiculo) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmação de Pré-Reserva - DMS System',
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Sua pré-reserva foi registrada com sucesso!</p>
      <p><strong>Veículo:</strong> ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</p>
      <p><strong>Preço:</strong> ${Number(veiculo.preco).toFixed(2)} MZN</p>
      <p>Em breve, entraremos em contato para confirmar os próximos passos.</p>
      <p>Atenciosamente,<br>Equipe DMS System</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de confirmação enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Falha ao enviar e-mail de confirmação');
  }
};

module.exports = { enviarConfirmacaoReserva };
