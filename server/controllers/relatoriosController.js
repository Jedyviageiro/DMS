const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/db');

// PDF - Relatório de reservas confirmadas com filtros
exports.gerarRelatorioPDF = async (req, res) => {
  try {
    // Captura filtros da query string
    const { inicio, fim, marca, modelo, status } = req.query;

    // Monta a query base e parâmetros
    let query = `
      SELECT r.id, u.nome AS cliente, v.marca, v.modelo, r.data_reserva, r.status
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN veiculos v ON r.veiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    } else {
      query += " AND r.status = 'confirmada'";
    }
    if (marca) {
      query += ' AND v.marca = ?';
      params.push(marca);
    }
    if (modelo) {
      query += ' AND v.modelo = ?';
      params.push(modelo);
    }
    if (inicio) {
      query += ' AND r.data_reserva >= ?';
      params.push(inicio);
    }
    if (fim) {
      query += ' AND r.data_reserva <= ?';
      params.push(fim);
    }

    // Executa query com parâmetros
    const [dados] = await pool.query(query, params);

    // Cria documento PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_vendas.pdf');

    doc.pipe(res);
    doc.fontSize(16).text('Relatório de Vendas Confirmadas', { align: 'center' });
    doc.moveDown();

    if (dados.length === 0) {
      doc.fontSize(12).text('Nenhum registro encontrado para os filtros aplicados.', { align: 'center' });
    } else {
      dados.forEach((item, index) => {
        doc.fontSize(12).text(
          `${index + 1}. Cliente: ${item.cliente} | Veículo: ${item.marca} ${item.modelo} | Data: ${new Date(item.data_reserva).toLocaleDateString()} | Status: ${item.status}`
        );
      });
    }

    doc.end();

  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    res.status(500).json({ mensagem: 'Erro no servidor ao gerar PDF' });
  }
};

// Excel - Relatório de reservas confirmadas com filtros
exports.gerarRelatorioExcel = async (req, res) => {
  try {
    // Captura filtros da query string
    const { inicio, fim, marca, modelo, status } = req.query;

    // Monta a query base e parâmetros
    let query = `
      SELECT r.id, u.nome AS cliente, v.marca, v.modelo, r.data_reserva, r.status
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN veiculos v ON r.veiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    } else {
      query += " AND r.status = 'confirmada'";
    }
    if (marca) {
      query += ' AND v.marca = ?';
      params.push(marca);
    }
    if (modelo) {
      query += ' AND v.modelo = ?';
      params.push(modelo);
    }
    if (inicio) {
      query += ' AND r.data_reserva >= ?';
      params.push(inicio);
    }
    if (fim) {
      query += ' AND r.data_reserva <= ?';
      params.push(fim);
    }

    // Executa query com parâmetros
    const [dados] = await pool.query(query, params);

    // Cria planilha Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vendas Confirmadas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Marca', key: 'marca', width: 20 },
      { header: 'Modelo', key: 'modelo', width: 20 },
      { header: 'Data da Reserva', key: 'data_reserva', width: 25 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    dados.forEach(item => {
      worksheet.addRow({
        id: item.id,
        cliente: item.cliente,
        marca: item.marca,
        modelo: item.modelo,
        data_reserva: new Date(item.data_reserva).toLocaleDateString(),
        status: item.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_vendas.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Erro ao gerar relatório Excel:', error);
    res.status(500).json({ mensagem: 'Erro no servidor ao gerar Excel' });
  }
};
