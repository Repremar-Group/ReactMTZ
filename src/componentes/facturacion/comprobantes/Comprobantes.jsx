import React, { useState, useEffect, useRef } from 'react';
import './Comprobantes.css'
import { Link } from "react-router-dom";
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ModalBusquedaEmbarque from '../../modales/ModalBusquedaEmbarque';

const Comprobantes = ({ isLoggedIn }) => {
  // Estado para los campos del formulario

  const [ecid, setEcId] = useState('');
  const [ecnombre, setEcNombre] = useState('');
  const [ectipocomprobante, setEcTipoComprobante] = useState('');
  const [eccomprobanteelectronico, setEcComprobanteElectronico] = useState('');
  const [ecciudad, setEcCiudad] = useState('');
  const [ecpais, setEcPais] = useState('');
  const [ecrazonsocial, setEcRazonSocial] = useState('');
  const [ectipoiva, setEcTipoIva] = useState('');
  const [ecmoneda, setEcMoneda] = useState('');
  const [ecfecha, setEcFecha] = useState('');
  const [eccomprobante, setEcComprobante] = useState('');
  const [ecelectronico, setEcElectronico] = useState('');
  const [ecdireccionfiscal, setEcDireccionFiscal] = useState('');
  const [eccompania, setEcCompania] = useState('');
  const [companias, setCompanias] = useState([]);
  const [isFetchedCompanias, setIsFetchedCompanias] = useState(false);
  const [ecrutcedula, setEcrutcedula] = useState('');
  const [eccass, setEcCass] = useState('');
  const [ectipodeembarque, setEcTipoDeEmbarque] = useState('');
  const [ectc, setEcTc] = useState('');
  const [ecguia, setEcGuia] = useState('');
  const [ecdescripcion, setEcDescripcion] = useState('');
  const [ecmonedaguia, setEcMonedaGuia] = useState('');
  const [ecimporte, setEcImporte] = useState('');
  const [ectotalacobrar, setEcTotalACobrar] = useState('');
  const [ecsubtotal, setEcsubtotal] = useState('');
  const [eciva, setEcIva] = useState('');
  const [ecredondeo, setEcRedondeo] = useState('');
  const [ectotal, setEcTotal] = useState('');
  const [eclistadeguiasasociadas, setEcListaDeGuiasAsociadas] = useState([]);
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [embarques, setEmbarques] = useState([]);
  const [embarquesSeleccionados, setEmbarquesSeleccionados] = useState([]);
  const [guiasconconceptos, setGuiasConConceptos] = useState([]);

  // Función para manejar los embarques seleccionados
  const handleSelectEmbarques = (nuevosEmbarques) => {
    setGuiasConConceptos((prev) => {
      const actualizados = [...prev]; // Clona el estado actual

      nuevosEmbarques.forEach((nuevoEmbarque) => {
        // Verifica que el embarque y sus conceptos estén definidos
        if (!nuevoEmbarque || !nuevoEmbarque.conceptos) return;

        const existeGuia = actualizados.find((guia) => guia.id === nuevoEmbarque.id);

        if (existeGuia) {
          // Actualiza conceptos evitando duplicados
          existeGuia.conceptos = [
            ...existeGuia.conceptos,
            ...nuevoEmbarque.conceptos.filter(
              (conceptoNuevo) =>
                !existeGuia.conceptos.some(
                  (conceptoExistente) =>
                    conceptoExistente.id === conceptoNuevo.id
                )
            ),
          ];
        } else {
          // Agrega la nueva guía si no existe
          actualizados.push({
            ...nuevoEmbarque,
            conceptos: nuevoEmbarque.conceptos || [], // Asegura que conceptos sea un array
          });
        }
      });

      return actualizados;
    });

    setEmbarquesSeleccionados((prevEmbarques) => [
      ...prevEmbarques,
      ...nuevosEmbarques,
    ]);
  };

  // Función para eliminar un concepto
  const eliminarConcepto = (idGuia) => {
    // Actualizar guiás eliminando la guía con el idGuia
    setGuiasConConceptos((prev) =>
      prev.filter((guia) => guia.id !== idGuia) // Elimina la guía que coincide con idGuia
    );

    // También eliminar la guía de embarquesSeleccionados
    setEmbarquesSeleccionados((prevSeleccionados) =>
      prevSeleccionados.filter((embarque) => embarque.idguia !== idGuia) // Filtra la guía eliminada
    );
  };

  // useEffect para detectar cambios en embarquesSeleccionados
  useEffect(() => {
    console.log("embarquesSeleccionados ha cambiado:", embarquesSeleccionados);
    console.log("Tipo de embarque seleccionado:", ectipodeembarque);
    if (ectipodeembarque !== 'Impo' && ectipodeembarque !== 'Expo') return;
    // Filtrar los embarques según el tipo y tipodepagoguia
    const guiasimpoprepaid = embarquesSeleccionados.filter(
      (embarque) => embarque.Tipo === 'IMPO' && embarque.tipodepagoguia === 'P'
    );
    const guiasimpocollect = embarquesSeleccionados.filter(
      (embarque) => embarque.Tipo === 'IMPO' && embarque.tipodepagoguia === 'C'
    );
    const guiasexpoprepaid = embarquesSeleccionados.filter(
      (embarque) => embarque.tipo === 'EXPO' && embarque.tipodepago === 'P'
    );

    // Crear el array de guías con conceptos
    const nuevasGuiasConConceptos = [
      // Agregar guías impo prepaid
      ...guiasimpoprepaid.map((embarque) => ({
        id: embarque.idguia,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinoguia,
        fecha_envio: embarque.fechavuelo,
        conceptos: [
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `Viaje: ${embarque.nrovuelo} ${embarque.fechavuelo} Import`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `AWB: ${embarque.guia} ${embarque.origenvuelo}/${embarque.conexionguia}/${embarque.destinoguia}`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 8,
            descripcion: `Verificación Carga Recinto Aduanero: U$S ${embarque.verificacion}`,
            moneda: embarque.moneda,
            importe: embarque.verificacion,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 47,
            descripcion: `Redondeo: U$S ${embarque.ajuste}`,
            moneda: embarque.moneda,
            importe: embarque.ajuste,
          },
        ],
      })),
      // Agregar guías impo collect
      ...guiasimpocollect.map((embarque) => ({
        id: embarque.idguia,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinoguia,
        fecha_envio: embarque.fechavuelo,
        conceptos: [
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `Viaje: ${embarque.nrovuelo} ${embarque.fechavuelo} Import`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `AWB: ${embarque.guia} ${embarque.origenvuelo}/${embarque.conexionguia}/${embarque.destinoguia}`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 2,
            descripcion: `Collect Fee: U$S: ${embarque.collectfee + embarque.cfiva}`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 8,
            descripcion: `Verificación Carga Recinto Aduanero: U$S ${embarque.verificacion}`,
            moneda: embarque.moneda,
            importe: embarque.verificacion,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 47,
            descripcion: `Redondeo: U$S ${embarque.ajuste}`,
            moneda: embarque.moneda,
            importe: embarque.ajuste,
          },
        ],
      })),
      // Agregar guías expo prepaid
      ...guiasexpoprepaid.map((embarque) => ({
        id: embarque.idguiaexpo,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinovuelo,
        fecha_envio: embarque.fechavuelo,
        conceptos: [
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `${embarque.empresavuelo}`,
            moneda: 'USD',
            importe: 0,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `Viaje: ${embarque.nrovuelo} ${embarque.fechavuelo} AWB: ${embarque.guia}`,
            moneda: 'USD',
            importe: 0,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 9,
            descripcion: `Flete Exportación Aerea: U$S ${embarque.fleteneto}`,
            moneda: 'USD',
            importe: embarque.fleteneto,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 48,
            descripcion: `Due Agent: U$S ${embarque.dueagent}`,
            moneda: 'USD',
            importe: embarque.dueagent,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: 10,
            descripcion: `Due Carrier: U$S ${embarque.duecarrier}`,
            moneda: 'USD',
            importe: embarque.duecarrier,
          },
        ],
      })),
    ];
    // Actualizar el estado con las nuevas guías y conceptos combinados
    setGuiasConConceptos(nuevasGuiasConConceptos);
    console.log('Guias combinadas con conceptos:', nuevasGuiasConConceptos);
  }, [embarquesSeleccionados]);  // El efecto se ejecutará cada vez que cambie `embarquesSeleccionados`


  const fetchEmbarques = async () => {
    try {
      const clienteId = searchTerm;  // Asumiendo que el cliente es identificado por nombre o algún campo
      const response = await axios.get('http://localhost:3000/api/obtenerembarques', {
        params: {
          tipoEmbarque: ectipodeembarque,
          clienteId: clienteId
        }
      });

      setEmbarques(response.data);  // Guardamos los embarques en el estado
      console.log('Embarques traidos desde la base:', response.data);
      setShowModal(true);  // Mostramos el modal con los embarques
    } catch (error) {
      console.error('Error al obtener embarques:', error);
    }
  };

  // Se ejecuta solo una vez al montar el componente
  useEffect(() => {
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setEcFecha(icfechaactual);

    // Llamar al endpoint para obtener el tipo de cambio
    const obtenerTipoCambio = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/obtenertipocambioparacomprobante");
        if (response.data.tipo_cambio == undefined) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/tablas/cambio");
        } else {
          setEcTc(response.data.tipo_cambio);
        }
        console.log(response.data.tipo_cambio);
      } catch (error) {
        if (error.response) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/tablas/cambio");
        } else {
          console.error("Error en la consulta:", error);
          navigate("/tablas/cambio");
        }
      }
    };

    const fetchMonedas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/obtenermonedas');
        setMonedas(response.data);
        setIsFetchedMonedas(true); // Indica que ya se obtuvieron los datos
      } catch (error) {
        console.error('Error al obtener monedas:', error);
      }
    }

    const fetchCompanias = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/obtenercompanias');
        setCompanias(response.data);
        setIsFetchedCompanias(true); // Indica que ya se obtuvieron los datos
      } catch (error) {
        console.error('Error al obtener monedas:', error);
      }
    }
    fetchCompanias();
    fetchMonedas();
    obtenerTipoCambio();

  }, []);



  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manejo del input de búsqueda
  const handleInputChange = (e) => setSearchTerm(e.target.value);

  // Búsqueda de clientes al presionar Enter
  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      try {
        const response = await axios.get(`http://localhost:3000/api/obtenernombrecliente?search=${searchTerm}`);
        setFilteredClientes(response.data);
        setIsModalOpen(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    }
  };

  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setEcComprobanteElectronico(selectedCliente.Tcomprobante);
      setEcId(selectedCliente.Id);
      setEcCiudad(selectedCliente.Ciudad);
      setEcPais(selectedCliente.Pais);
      setEcRazonSocial(selectedCliente.RazonSocial);
      setEcTipoIva(selectedCliente.Tiva);
      setEcMoneda(selectedCliente.Moneda);
      setEcDireccionFiscal(selectedCliente.Direccion);
      setEcCass(selectedCliente.Cass);
      setEcrutcedula(selectedCliente.Rut);
    }
  }, [selectedCliente]);

  useEffect(() => {
    if (ectipodeembarque && searchTerm) {
      fetchEmbarques();
    }
  }, [ectipodeembarque, searchTerm]);



  // Función para manejar el envío del formulario
  const handleSubmitAgregarRecibo = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para enviar la información
    console.log({
      razonSocial
    });
  };




  return (
    <div className="EmitirComprobante-container">
      <h2 className='titulo-estandar'>Emisión de Comprobantes</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecID">ID de Cliente:</label>
                <input
                  type="text"
                  id="ecID"
                  value={ecid}
                  onChange={(e) => setEcId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecnombre">Nombre:</label>
                <input
                  type="text"
                  id="ecnombre"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar Cliente"
                  required
                />
              </div>
              <div>
                <label htmlFor="tipoComprobante">Tipo de Comprobante:</label>
                <select
                  id="tipoComprobante"
                  value={ectipocomprobante}
                  onChange={(e) => setEcTipoComprobante(e.target.value)}
                  required
                >
                  <option value="">Selecciona un tipo de Comprobante</option>
                  <option value="efactura">E-Factura</option>
                  <option value="eticket">E-Ticket</option>
                  <option value="efacturaca">E-Factura Cuenta Ajena</option>
                  <option value="eticketca">E-Ticket Cuenta Ajena</option>
                </select>
              </div>
              <div>
                <label htmlFor="eccomprobanteelectronico">Comprobante Electronico:</label>
                <select
                  id="tipoComprobante"
                  value={eccomprobanteelectronico}
                  onChange={(e) => setEcComprobanteElectronico(e.target.value)}
                  required
                >
                  <option value="">Comprobante Electronico</option>
                  <option value="efactura">E-Factura</option>
                  <option value="eticket">E-Ticket</option>
                  <option value="efacturaca">E-Factura Cuenta Ajena</option>
                  <option value="eticketca">E-Ticket Cuenta Ajena</option>
                </select>

              </div>
              <div>
                <label htmlFor="ecciudad">Ciudad:</label>
                <input
                  type="text"
                  id="ecciudad"
                  value={ecciudad}
                  onChange={(e) => setEcCiudad(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecpais">Pais:</label>
                <input
                  type="text"
                  id="ecpais"
                  value={ecpais}
                  onChange={(e) => setEcPais(e.target.value)}
                  required
                />
              </div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecrazonsocial">Razon Social:</label>
                <input
                  type="text"
                  id="ecrazonsocial"
                  value={ecrazonsocial}
                  onChange={(e) => setEcRazonSocial(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectipoiva">Tipo de IVA:</label>
                <select
                  id="tipoIVA"
                  value={ectipoiva}
                  onChange={(e) => setEcTipoIva(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo de IVA</option>
                  <option value="iva22">IVA 22%</option>
                  <option value="excento">Exento</option>
                </select>
              </div>
              <div>
                <label htmlFor="ecmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={ecmoneda}
                  onChange={(e) => setEcMoneda(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  {monedas.map((moneda, index) => (
                    <option key={index} value={moneda.moneda}>
                      {moneda.moneda}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fecha-emision-comprobante">
                <label htmlFor="ecfecha">Fecha:</label>
                <input
                  type="date"
                  id="ecfecha"
                  value={ecfecha}
                  onChange={(e) => setEcFecha(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccomprobante">Comprobante:</label>
                <input
                  type="text"
                  id="eccomprobante"
                  value={eccomprobante}
                  onChange={(e) => setEcComprobante(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecelectronico">Electronico:</label>
                <input
                  type="text"
                  id="ecelectronico"
                  value={ecelectronico}
                  onChange={(e) => setEcElectronico(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecdireccionfiscal">Dirección Fiscal:</label>
                <input
                  type="text"
                  id="ecdireccionfiscal"
                  value={ecdireccionfiscal}
                  onChange={(e) => setEcDireccionFiscal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccompania">Compania:</label>
                <select
                  id="eccompania"
                  value={eccompania}
                  onChange={(e) => setEcCompania(e.target.value)}
                  required
                >
                  <option value="">Seleccione una compañía</option>
                  {companias.map((compania, index) => (
                    <option key={index} value={compania.compania}>
                      {compania.compania}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ecrutcedula">RUT/Cedula:</label>
                <input
                  type="text"
                  id="ecrutcedula"
                  value={ecrutcedula}
                  onChange={(e) => setEcrutcedula(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="eccass">Cass:</label>
                <select
                  id="eccass"
                  value={eccass}
                  onChange={(e) => setEcCass(e.target.value)}
                  required
                >
                  <option value="">Selecciona el Cass</option>
                  <option value="false">No</option>
                  <option value="true">Si</option>
                </select>
              </div>
              <div>
                <label htmlFor="ectipoembarque">Tipo de Embarque:</label>
                <select
                  id="ectipoembarque"
                  value={ectipodeembarque}
                  onChange={(e) => setEcTipoDeEmbarque(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Impo">Impo</option>
                  <option value="Expo">Expo</option>
                </select>
              </div>
              <div>
                <label htmlFor="ectc">Tc:</label>
                <input
                  type="text"
                  id="ectc"
                  value={ectc}
                  onChange={(e) => setEcTc(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className='div-guias-asociadas'>
            <h3 className='subtitulo-estandar'>Guias Asociadas</h3>
            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ecguia">Guia:</label>
                <input
                  type="text"
                  id="ecguia"
                  value={ecguia}
                  onChange={(e) => setEcGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecdescripcion">Descripción:</label>
                <input
                  type="text"
                  id="ecdescripcion"
                  value={ecdescripcion}
                  onChange={(e) => setEcDescripcion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecmonedaguia">Moneda:</label>
                <select
                  id="ecmonedaguia"
                  value={ecmonedaguia}
                  onChange={(e) => setEcMonedaGuia(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Moneda</option>
                  <option value="dolares">Dolares</option>
                  <option value="pesos">Pesos</option>
                  <option value="Euros">Euros</option>
                </select>
              </div>
              <div>
                <label htmlFor="ecimporte">Importe:</label>
                <input
                  type="text"
                  id="ecimporte"
                  value={ecimporte}
                  onChange={(e) => setEcImporte(e.target.value)}
                  required
                />
              </div>

              <div className='botonesfacturasasociadas'>
                <button type="button" className='btn-estandar'>Agregar</button>
              </div>
              <div className='botonesfacturasasociadas'>
                <button type="button" className='btn-estandar'>Comprobante GSM</button>
              </div>

            </div>
          </div>

          <div className='div-tabla-facturas-asociadas'>
            <br />
            <div className='div-primerrenglon-datos-recibos'>
              {/* Tabla que muestra las facturas agregadas */}
              <table className='tabla-guias-asociadas'>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Guía</th>
                    <th>Descripción</th>
                    <th>Moneda</th>
                    <th>Importe</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Iterar sobre las guías y conceptos */}
                  {guiasconconceptos.map((guia) =>
                    guia.conceptos.map((concepto, index) => (
                      <tr key={`${guia.id}-${index}`}>
                        <td>{concepto.tipo}</td>
                        <td>{concepto.guia}</td>
                        <td>{concepto.descripcion}</td>
                        <td>{concepto.moneda}</td>
                        <td>{concepto.importe}</td>
                        <td>
                          {index === 0 && (
                            <button
                              type="button"
                              onClick={() => eliminarConcepto(guia.id, index)}
                              style={{
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                              }}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>
          </div>
          <div className='div-totales-comprobante'>
            <h3 className='subtitulo-estandar'>Totales</h3>
            <div className='div-primerrenglon-datos-comprobante'>

              <div>
                <label htmlFor="ecsubtotal">Subtotal:</label>
                <input
                  type="text"
                  id="ecsubtotal"
                  value={ecsubtotal}
                  onChange={(e) => setEcsubtotal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecivatotal">IVA:</label>
                <input
                  type="text"
                  id="ecivatotal"
                  value={eciva}
                  onChange={(e) => setEcIva(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ecredondeo">Redondeo:</label>
                <input
                  type="text"
                  id="ecredondeo"
                  value={ecredondeo}
                  onChange={(e) => setEcRedondeo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectotal">Total:</label>
                <input
                  type="text"
                  id="ectotal"
                  value={ectotal}
                  onChange={(e) => setEcTotal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ectotalacobrar">Total a Cobrar:</label>
                <input
                  type="text"
                  id="ectotalacobrar"
                  value={ectotalacobrar}
                  onChange={(e) => setEcTotalACobrar(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>


        </div>



        <div className='botonesemitircomprobante'>
          <button type="submit" className='btn-estandar'>Confirmar</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>


      </form>
      {/* Modal de búsqueda de clientes */}
      <ModalBusquedaClientes
        isOpen={isModalOpen}
        closeModal={closeModal}
        filteredClientes={filteredClientes}
        handleSelectCliente={handleSelectCliente}
      />
      <ModalBusquedaEmbarque
        showModal={showModal}
        onClose={() => setShowModal(false)}
        embarques={embarques}
        onSelectEmbarques={handleSelectEmbarques}
      />
    </div>

  );
}

export default Comprobantes