import React from 'react';
import { Link } from 'react-router-dom';

const ModalBusquedaClientes = ({ isOpen, closeModal, filteredClientes, handleSelectCliente }) => {
  if (!isOpen) return null; // Evita renderizar el modal si no está abierto

  return (
    <div className="modal" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className='titulo-estandar'>Resultados de Búsqueda</h2>
        {filteredClientes.length > 0 ? (
          <table className='tabla-clientesbusqueda'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Razón Social</th>
                <th>Seleccionar</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.Id}</td>
                  <td>{cliente.RazonSocial}</td>
                  <td>
                    <button className='btn-estandartablas' onClick={() => handleSelectCliente(cliente)}>Seleccionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            <p className='p_modaltraerclientes'>No se encontraron clientes.</p>
            <Link to="/clientes/agregar">
              <button className='btn-estandar'>Crear Cliente</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalBusquedaClientes;
