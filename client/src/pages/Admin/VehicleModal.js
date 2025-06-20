import React from 'react';
import { FaCar, FaTimes, FaUpload } from 'react-icons/fa';

const VehicleModal = ({
  showAddModal,
  showEditModal,
  setShowAddModal,
  setShowEditModal,
  selectedVeiculo,
  formData,
  handleInputChange,
  handleImageUpload,
  handleRemoveImage,
  handleSubmit
}) => {
  const renderImagePreview = (images) => {
    if (!images || images.length === 0) {
      return (
        <div className="image-preview-placeholder">
          <FaCar size={40} />
          <p>Nenhuma imagem selecionada</p>
          <small>Clique em "Selecionar Imagens" para adicionar fotos do veículo</small>
        </div>
      );
    }

    return (
      <div className="image-preview-grid">
        {images.map((image, index) => (
          <div key={index} className="image-preview-item">
            <img src={image} alt={`Preview ${index + 1}`} />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleRemoveImage(index)}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderImageUploadSection = () => (
    <div className="form-group">
      <label>Imagens do Veículo (máximo 4)</label>
      <div className="image-upload-container">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="image-upload-input"
        />
        <div className="image-upload-button">
          <FaUpload /> Selecionar Imagens
        </div>
      </div>
      {renderImagePreview(formData.imagens)}
      <small className="image-upload-hint">
        Formatos aceitos: Todos. Tamanho máximo: 5MB por imagem. Máximo 4 imagens.
      </small>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{showEditModal ? 'Editar Veículo' : 'Adicionar Veículo'}</h2>
          <button
            className="modal-close"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Marca</label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Modelo</label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Ano</label>
            <input
              type="number"
              name="ano"
              value={formData.ano}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Preço</label>
            <input
              type="number"
              name="preco"
              value={formData.preco}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="combustivel">Combustível</label>
            <input
              type="text"
              id="combustivel"
              name="combustivel"
              value={formData.combustivel}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Estoque</label>
            <input
              type="number"
              name="estoque"
              value={formData.estoque}
              onChange={handleInputChange}
              required
            />
          </div>
          {renderImageUploadSection()}
          <div className="form-actions">
            <button type="submit" className="admin-btn-primary">
              {selectedVeiculo ? 'Atualizar' : 'Adicionar'} Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;  