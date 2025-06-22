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
    subject: 'Confirmação de Pré-Reserva - AutoElite',
    html: `
      <h2>Caro(a) ${nome},</h2>
      <p>Acabaste de fazer uma pré-reserva para a compra do veículo <strong>${veiculo.marca}</strong>, modelo <strong>${veiculo.modelo}</strong>, ano <strong>${veiculo.ano}</strong>.</p>
      <p>Aguarde enquanto avaliamos o seu pedido. Assim que for aceite, prosseguiremos com os passos subsequentes!</p>
      <p>Atenciosamente,<br>AutoElite</p>
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

const enviarReservaAceite = async (email, nome, veiculo, agenciaEndereco) => {
  const googleMapsUrl = 'https://www.google.com/maps/place/Beira,+Mo%C3%A7ambique';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Parabéns! Sua reserva foi aceita - AutoElite',
    html: `
      <h2>Parabéns, ${nome}!</h2>
      <p>O seu pedido de reserva do carro <strong>${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</strong> foi <strong>aceite</strong>.</p>
      <p>Lembramos que o valor do carro é <strong>${Number(veiculo.preco).toFixed(2)} MZN</strong>.</p>
      <p>O pagamento será feito na nossa agência, localizada em <strong>${agenciaEndereco}</strong>.<br>
      <a href="${googleMapsUrl}" target="_blank">Clique aqui para ver no Google Maps</a></p>
      <p>O cliente tem <strong>3 dias</strong> para comparecer à agência. Estamos abertos de segunda a quinta, das 8h às 16h. Caso falhe em vir, a sua reserva será anulada devido à concorrência e ao stock limitado!</p>
      <p>Esperamos por si.<br>Atenciosamente,<br>AutoElite</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de aceitação enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail de aceitação:', error);
    throw new Error('Falha ao enviar e-mail de aceitação');
  }
};

const enviarPromocao = async (email, nome, promocao) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Promoção: ${promocao.titulo} - AutoElite`,
    html: `
      <h2>Estimado(a) ${nome},</h2>
      <p>Estamos em celebração, alusivo a <strong>${promocao.titulo}</strong>!</p>
      <p>Temos desconto de <strong>${Number(promocao.desconto_valor).toFixed(2)} MZN</strong>, válido até <strong>${promocao.data_fim}</strong>.</p>
      <p>Não perca e venha reservar o seu veículo dos sonhos!</p>
      <p>Atenciosamente,<br>AutoElite</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de promoção enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail de promoção:', error);
    throw new Error('Falha ao enviar e-mail de promoção');
  }
};

module.exports = { enviarConfirmacaoReserva, enviarReservaAceite, enviarPromocao };
