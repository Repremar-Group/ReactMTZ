import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import ModalAgregarCliente from './ModalAgregarCliente';

const ModalBusquedaClientes = ({ isOpen, closeModal, filteredClientes, handleSelectCliente }) => {
  if (!isOpen) return null; // Evita renderizar el modal si no está abierto
  const [modalSaldoOpen, setModalSaldoOpen] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [saldoNuevo, setSaldoNuevo] = useState('');
  const backURL = import.meta.env.VITE_BACK_URL;
  const [modalAgregarOpen, setModalAgregarOpen] = useState(false);

  if (!isOpen) return null;

  // --- Consulta saldo ---
  const verificarSaldoCliente = async (cliente) => {
    try {
      setLoadingSaldo(true);
      const response = await axios.post(`${backURL}/api/obtenerSaldoClienteVerificacion`, {
        idCliente: cliente.Id,
      });

      if (response.data.tieneSaldo) {
        handleSelectCliente(cliente);
        closeModal();
      } else {
        setClienteSeleccionado(cliente);
        setModalSaldoOpen(true);
      }
    } catch (error) {
      console.error('Error verificando saldo:', error);
      alert('Error consultando saldo del cliente.');
    } finally {
      setLoadingSaldo(false);
    }
  };

  const guardarSaldo = async () => {
    if (!clienteSeleccionado) return;
    try {
      const usuario = localStorage.getItem('usuario') || 'Sistema'; // fallback por si no hay nada

      await axios.post(`${backURL}/api/actualizarSaldoCliente`, {
        idCliente: clienteSeleccionado.Id,
        saldo: parseFloat(saldoNuevo),
        usuario: usuario
      });

      alert('Saldo cargado correctamente.');
      setModalSaldoOpen(false);
      handleSelectCliente(clienteSeleccionado);
      closeModal();
    } catch (error) {
      console.error('Error guardando saldo:', error);
      alert('Error guardando saldo.');
    }
  };
  const handleClienteCreado = async (codigoGia) => {
    try {
      const res = await axios.post(`${backURL}/api/obtenerClientePorCodigoGia`, { codigoGia });
      const clienteNuevo = res.data;
      if (clienteNuevo) {
        handleSelectCliente(clienteNuevo);
        closeModal();
      }
    } catch (error) {
      console.error('Error obteniendo cliente recién creado:', error);
      alert('No se pudo obtener el cliente recién creado.');
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <div className="modal" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2 className='titulo-estandar'>Resultados de Búsqueda</h2>
          {filteredClientes.length > 0 ? (
            <div className='contenedortabla_clientesbusqueda'>
              <table className='tabla-clientesbusquedareal'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Razón Social</th>
                    <th>Seleccionar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map(cliente => (
                    <tr key={cliente.Id}>
                      <td>{cliente.Id}</td>
                      <td>{cliente.RazonSocial}</td>
                      <td>
                        <button
                          className='btn-estandartablas'
                          disabled={loadingSaldo}
                          onClick={() => verificarSaldoCliente(cliente)}
                        >
                          {loadingSaldo ? 'Consultando...' : 'Seleccionar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <p className='p_modaltraerclientes'>No se encontraron clientes.</p>
              <button className='btn-estandar' onClick={() => setModalAgregarOpen(true)}>
                Crear Cliente
              </button>
            </div>
          )}
        </div>
      </div>
      <ModalAgregarCliente
        isOpen={modalAgregarOpen}
        onClose={() => setModalAgregarOpen(false)}
        onSuccess={(codigoGia) => {
          setModalAgregarOpen(false);
          handleClienteCreado(codigoGia);
        }}
      />
      {/* MODAL CARGA DE SALDO */}
      {modalSaldoOpen && (
        <div className="modal" onClick={() => setModalSaldoOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className='titulo-estandar'>
              Cargar saldo para {clienteSeleccionado?.RazonSocial}
            </h2>
            <p>Este cliente no tiene saldo cargado. ¿Deseás ingresarlo ahora?</p>
            <input
              type="number"
              step="0.01"
              placeholder="Ingrese saldo inicial"
              className="input-estandar"
              value={saldoNuevo}
              onChange={(e) => setSaldoNuevo(e.target.value)}
            />
            <div style={{ marginTop: '1rem' }}>
              <button className='btn-estandar' onClick={guardarSaldo}>
                Guardar saldo
              </button>
              <button
                className='btn-estandar'
                onClick={() => {
                  // Cierra el modal de saldo
                  setModalSaldoOpen(false);
                  // Selecciona el cliente igual que si tuviera saldo
                  handleSelectCliente(clienteSeleccionado);
                  // Cierra el modal principal
                  closeModal();
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalBusquedaClientes;
