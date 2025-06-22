import React from 'react';
import { FaTimes } from 'react-icons/fa';

const PromocaoModal = ({
  showAddModal,
  showEditModal,
  setShowAddModal,
  setShowEditModal,
  selectedPromocao,
  formData,
  handleInputChange,
  handleSubmit,
  marcas,
  modelos,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
        >
          <FaTimes />
        </button>
        <h2>{showEditModal ? 'Editar Promoção' : 'Adicionar Promoção'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo de Desconto:</label>
            <select
              name="desconto_tipo"
              value={formData.desconto_tipo}
              onChange={handleInputChange}
              required
            >
              <option value="percentual">Percentual</option>
              <option value="valor_fixo">Valor Fixo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Valor do Desconto:</label>
            <input
              type="number"
              name="desconto_valor"
              value={formData.desconto_valor}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Data de Início:</label>
            <input
              type="date"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Data de Fim:</label>
            <input
              type="date"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Ativo:</label>
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Aplicável Em:</label>
            <select
              name="aplicavel_em"
              value={formData.aplicavel_em}
              onChange={handleInputChange}
              required
            >
              <option value="todos">Todos</option>
              <option value="marca">Marca Específica</option>
              <option value="modelo">Modelo Específico</option>
            </select>
          </div>
          {formData.aplicavel_em === 'marca' && (
            <div className="form-group">
              <label>Marca:</label>
              <select
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione uma marca</option>
                {marcas && marcas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
          )}
          {formData.aplicavel_em === 'modelo' && (
            <div className="form-group">
              <label>Modelo:</label>
              <select
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um modelo</option>
                {modelos && modelos.map(modelo => (
                  <option key={modelo} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="admin-btn-primary">
            {showEditModal ? 'Atualizar' : 'Adicionar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromocaoModal;