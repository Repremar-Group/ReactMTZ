import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Guiasimpo.css'
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import ModalModificarGuiaImpo from '../../modales/ModalModificarGuiaImpo';
import ModalVerGuiaImpo from '../../modales/ModalVerGuiaImpo';
import { convertirADecimal, convertirAComa } from '../../funcionesgenerales';
import { ToastContainer, toast } from 'react-toastify';

const Guiasimpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [ginroimpo, setGiNroImpo] = useState('');
  const [givuelofecha, setGiVueloFecha] = useState('');
  const [giorigenvuelo, setGiOrigenVuelo] = useState('');
  const [giempresavuelo, setGiEmpresaVuelo] = useState('');
  const [ginroguia, setGiNroGuia] = useState('');
  const [giembarcador, setGiEmbarcador] = useState('');
  const [giagente, setGiAgente] = useState('');
  const [gifechaemisionguia, setGiFechaEmisionGuia] = useState('');
  const [giorigenguia, setGiOrigenGuia] = useState('');
  const [giconexionguia, setGiConexionGuia] = useState('');
  const [gidestinoguia, setGiDestinoGuia] = useState('');
  const [gitipodepagoguia, setGiTipoDePagoGuia] = useState('');
  const [gimercaderiaguia, setGiMercaderiaGuia] = useState('');
  const [gipiezasguia, setGiPiezasGuia] = useState('');
  const [gipesoguia, setGiPesoGuia] = useState('');
  const [gipesovolguia, setGiPesovolGuia] = useState('');
  const [ginroccaguia, setGinroccaGuia] = useState('');
  const [gidifpesoccaguia, setGiDifPesoCcaGuia] = useState('');
  const [gimonedaguia, setGiMonedaGuia] = useState('');
  const [giarbitrajeguia, setGiArbitrajeGuia] = useState('');
  const [gitarifaguia, setGiTarifaGuia] = useState('');
  const [gifleteoriginalguia, setGiFleteOriginalGuia] = useState('');
  const [gidcoriginalguia, setGiDcOriginalGuia] = useState('');
  const [gidaoriginalguia, setGiDaOriginalGuia] = useState('');
  const [gifleteguia, setGiFleteGuia] = useState('');
  const [giivas3guia, setGiIvaS3Guia] = useState('');
  const [giduecarrierguia, setGiDueCarrierGuia] = useState('');
  const [gidueagentguia, setGiDueAgentGuia] = useState('');
  const [giverificacionguia, setGiVerificacionGuia] = useState('');
  const [gihouseextrasguia, setGiHouseExtrasGuia] = useState('');
  const [gicollectfeeguia, setGiCollectFeeGuia] = useState('');
  const [gicfivaguia, setGiCfIvaGuia] = useState('');
  const [gigastosezeizaguia, setGiGastosEzeizaGuia] = useState('');
  const [giajusteguia, setGiAjusteGuia] = useState('');
  const [gitotalguia, setGiTotalGuia] = useState('');
  const [gitotaldelaguia, setGiTotaldelaGuia] = useState('');
  const [giusuarioguia, setGiUsuarioGuia] = useState('');
  const [gifacturadoguia, setGiFacturadoGuia] = useState('');
  const [ginrofacturaguia, setGiNroFacturaGuia] = useState('');
  const [gireciboguia, setGiReciboGuia] = useState('');
  const [ginrovueloembarques, setGiNroVueloEmbarques] = useState('');
  const [gifechaembarques, setGiFechaEmbarques] = useState('');

  //Estados para controlar si esta abierto el modal de modificar
  const [isModalOpenModificar, setIsModalOpenModificar] = useState(false);
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);
  const openModalModificar = (guia) => {
    setGuiaSeleccionada(guia);
    setIsModalOpenModificar(true);
  };
  const closeModalModificar = () => {
    setIsModalOpenModificar(false);
    setGuiaSeleccionada(null);
    fetchGuias();
  };
  //Estados para el modal de ver 
  const [isModalOpenVer, setIsModalOpenVer] = useState(false);
  const openModalVer = (guia) => {
    setGuiaSeleccionada(guia);
    setIsModalOpenVer(true);
  };
  const closeModalVer = () => {
    setIsModalOpenVer(false);
    setGuiaSeleccionada(null);
  };

  //Estado para la tabla de embarques
  const [tablaguias, setTablaGuias] = useState([]);
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
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  const [monedas, setMonedas] = useState([]);
  const [isFetched, setIsFetched] = useState(false); // Para evitar múltiples llamadas

  const fetchMonedas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/obtenermonedas');
      setMonedas(response.data);
      setIsFetched(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener monedas:', error);
    }
  }

  const [ciudades, setCiudades] = useState([]);
  const [origenguiaSeleccionado, setOrigenGuiaSeleccionado] = useState('');
  const [conexionguiaSeleccionado, setConexionGuiaSeleccionado] = useState('');
  const [destinoguiaSeleccionado, setDestinoGuiaSeleccionado] = useState('MVD');
  const [isFetchedCiudades, setIsFetchedCiudades] = useState(false); // Para evitar múltiples llamadas

  const fetchCiudades = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/obtenerciudades');
      setCiudades(response.data);
      setIsFetchedCiudades(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener monedas:', error);
    }
  }
  //Estados para obtener el numero de vuelo al cargar la guia
  const [vuelos, setVuelos] = useState([]);
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [isFetchedVuelos, setIsFetchedVuelos] = useState(false); // Para evitar múltiples llamadas

  const fetchVuelos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/obtenervuelos');
      setVuelos(response.data);
      setIsFetchedVuelos(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener vuelos:', error);
    }
  }
  const handleSelectVuelo = (e) => {
    const vuelo = vuelos.find(v => v.vuelo === e.target.value); // Busca el vuelo completo
    setVueloSeleccionado(vuelo); // Guarda el vuelo completo
    console.log("Vuelo seleccionado:", vuelo); // Depuración
  };

  const fetchGuias = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/fetchguiasimpo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vueloSeleccionado: vueloSeleccionado.idVuelos,
          givuelofecha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTablaGuias(data); // Almacena las guías en el estado
      } else {
        console.error('Error al obtener las guías');
      }
    } catch (error) {
      console.error('Error al hacer el fetch:', error);
    }
  };


  const TablaEmbarques = ({ tablaguias }) => (
    <table className='tabla-embarques' >
      <thead>
        <tr>
          <th>Guia</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tablaguias.map((embarque, index) => (
          <tr key={index}>
            <td>{embarque.guia}</td>
            <td>{embarque.consignatario}</td>
            <td>{embarque.total}</td>
            <td>{embarque.tipodepagoguia}</td>
            <td>
              <button type="button" className="action-button" onClick={() => openModalVer(embarque.guia)}  >🔍</button>
              <button type="button" className="action-button" onClick={() => openModalModificar(embarque.guia)}>✏️</button>
              <button type="button" className="action-button"  >❌</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );



  const [eclistadeguiasasociadas, setEcListaDeGuiasAsociadas] = useState([]);


  // Estado para la cheque seleccionado
  const [ecguiaseleccionada, setEcGuiaSeleccionada] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarGuiaAsociada = (icindex) => {
    setEcGuiaSeleccionada(icindex);
  };



  // Función para eliminar el cheque seleccionado
  const handleEliminarGuiaAsociada = () => {
    if (ecguiaseleccionada !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevoschequesseleccionados = eclistadeguiasasociadas.filter((_, icindex) => icindex !== ecguiaseleccionada);
      setEcListaDeGuiasAsociadas(nuevoschequesseleccionados);
      setEcGuiaSeleccionada(null); // Limpiar la selección
    }
  };


  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setGiFechaEmisionGuia(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // useEffect para actualizar Flete Original cuando Peso/Vol o Tarifa cambian
  useEffect(() => {
    if (gipesovolguia && gitarifaguia) {
      // Convertir coma a punto antes de hacer el cálculo
      const pesoVolConvertido = convertirADecimal(gipesovolguia);
      const tarifaConvertida = convertirADecimal(gitarifaguia);

      // Realizar el cálculo
      const fleteCalculado = parseFloat(pesoVolConvertido) * parseFloat(tarifaConvertida);

      // Si el cálculo es un número válido, actualizar el estado de Flete Original
      if (!isNaN(fleteCalculado)) {
        setGiFleteOriginalGuia(convertirAComa(fleteCalculado.toFixed(2))); // Mantener dos decimales
      } else {
        setGiFleteOriginalGuia(''); // Si el cálculo no es válido, limpiar el valor
      }
    } else {
      setGiFleteOriginalGuia(''); // Si alguno de los campos está vacío, borrar Flete Original
    }
  }, [gipesovolguia, gitarifaguia]);

  //UseEffect para calcular todos los campos si la guia es Collect
  useEffect(() => {
    if (gifleteoriginalguia && gitipodepagoguia === 'C') {
      console.log("gifleteoriginalguia:", gifleteoriginalguia);
      console.log("gitipodepagoguia:", gitipodepagoguia);
      const fleteoriginal = convertirADecimal(gifleteoriginalguia);
      console.log("fleteoriginal:", fleteoriginal);
      // Calcular el 22% de gifleteoriginalguia (esto es el IVA)
      const iva22 = parseFloat(fleteoriginal) * 0.22;
      //Calcular el collect fee
      const collectfee = parseFloat(fleteoriginal) * 0.05;
      const collectfeeiva = collectfee * 0.22;
      // Calcular el 3% del IVA calculado
      const ivaS3 = (iva22 * 0.03);
      //Calcular el ajuste.
      const redondeo = Math.ceil(
        (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
        (parseFloat(convertirADecimal(giivas3guia)) || 0) +
        (parseFloat(convertirADecimal(gicollectfeeguia)) || 0) +
        (parseFloat(convertirADecimal(gicfivaguia)) || 0) +
        (parseFloat(convertirADecimal(gifleteoriginalguia)) || 0) +
        (parseFloat(convertirADecimal(gidueagentguia)) || 0) +
        (parseFloat(convertirADecimal(giduecarrierguia)) || 0)
      ) -
        (
          (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
          (parseFloat(convertirADecimal(giivas3guia)) || 0) +
          (parseFloat(convertirADecimal(gicollectfeeguia)) || 0) +
          (parseFloat(convertirADecimal(gicfivaguia)) || 0) +
          (parseFloat(convertirADecimal(gifleteoriginalguia)) || 0) +
          (parseFloat(convertirADecimal(gidueagentguia)) || 0) +
          (parseFloat(convertirADecimal(giduecarrierguia)) || 0)
        );
      console.log('redondeo:', redondeo)
      //Calculo de total a cobrar
      const totalacobrar = (
        (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
        (parseFloat(convertirADecimal(giivas3guia)) || 0) +
        (parseFloat(convertirADecimal(gicollectfeeguia)) || 0) +
        (parseFloat(convertirADecimal(gicfivaguia)) || 0) +
        (parseFloat(convertirADecimal(gifleteoriginalguia)) || 0) +
        (parseFloat(convertirADecimal(giduecarrierguia)) || 0) +
        (parseFloat(convertirADecimal(gidueagentguia)) || 0) +
        (parseFloat(redondeo) || 0)
      )
      //Calculo total de la guia
      const totaldelaguia = (
        (parseFloat(convertirADecimal(gifleteoriginalguia)) || 0) +
        (parseFloat(convertirADecimal(gidueagentguia)) || 0) +
        (parseFloat(convertirADecimal(giduecarrierguia)) || 0)
      )

      //Asignación de las Varibles.
      setGiCollectFeeGuia(collectfee.toFixed(2));
      setGiCfIvaGuia(collectfeeiva.toFixed(2));
      setGiFleteGuia(fleteoriginal);
      setGiIvaS3Guia(ivaS3.toFixed(2));


      setGiAjusteGuia(redondeo.toFixed(2));
      setGiTotalGuia(totalacobrar);
      setGiTotaldelaGuia(totaldelaguia.toFixed(2));
    } else {
      if (!gifleteoriginalguia && gitipodepagoguia != 'P') {
        setGiCfIvaGuia('');
        setGiCollectFeeGuia('');
        setGiFleteGuia('');
        setGiIvaS3Guia('');
        setGiAjusteGuia('');
        setGiTotalGuia('');
        setGiTotaldelaGuia('');
      }
    }
  }, [
    gifleteoriginalguia,
    gitipodepagoguia,
    giverificacionguia,
    giduecarrierguia,
    gidueagentguia
  ]);
  //UseEffect para calcular todos los campos si la guia es PrePaid
  useEffect(() => {
    if (gifleteoriginalguia && gitipodepagoguia === 'P') {
      const fleteoriginal = convertirADecimal(gifleteoriginalguia);
      // Calcular el 22% de gifleteoriginalguia (esto es el IVA)
      const iva22 = parseFloat(fleteoriginal) * 0.22;
      //Calcular el collect fee
      console.log('fleteoriginal: ', fleteoriginal)

      // Calcular el 3% del IVA calculado
      const ivaS3 = (iva22 * 0.03);
      //Calcular el ajuste.
      const redondeo = Math.ceil(
        (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
        (parseFloat(convertirADecimal(giivas3guia)) || 0)
      ) -
        (
          (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
          (parseFloat(convertirADecimal(giivas3guia)) || 0)
        );
      //Calculo de total a cobrar
      const totalacobrar = (
        (parseFloat(convertirADecimal(giverificacionguia)) || 0) +
        (parseFloat(convertirADecimal(giivas3guia)) || 0) +
        (parseFloat(redondeo) || 0)
      )
      //Calculo total de la guia
      const totaldelaguia = (
        (parseFloat(convertirADecimal(gifleteoriginalguia)) || 0) +
        (parseFloat(convertirADecimal(gidueagentguia)) || 0) +
        (parseFloat(convertirADecimal(giduecarrierguia)) || 0)
      )

      //Asignación de las Varibles.

      setGiFleteGuia(fleteoriginal);
      setGiIvaS3Guia(ivaS3.toFixed(2))


      setGiAjusteGuia(redondeo.toFixed(2));
      setGiTotalGuia(totalacobrar.toFixed(2));
      setGiTotaldelaGuia(totaldelaguia.toFixed(2));
    } else {
      console.log(gifleteoriginalguia)
      console.log(gitipodepagoguia)
      if (!gifleteoriginalguia && gitipodepagoguia != 'C') {
        setGiFleteGuia('');
        setGiIvaS3Guia('');
        setGiAjusteGuia('');
      }

    }
  }, [
    gifleteoriginalguia,
    gitipodepagoguia,
    giverificacionguia,
    giivas3guia,
    gicollectfeeguia,
    gicfivaguia,
    giduecarrierguia,
    gidueagentguia
  ]);


  //Use Effect para manejar los due carriers
  useEffect(() => {
    if (gidcoriginalguia || gidaoriginalguia) {
      setGiDueCarrierGuia(gidcoriginalguia);
      setGiDueAgentGuia(gidaoriginalguia);
    } else {
      setGiDueCarrierGuia('');
      setGiDueAgentGuia('');
    }
  }, [
    gidcoriginalguia,
    gidaoriginalguia
  ]);

  useEffect(() => {
    if (vueloSeleccionado && givuelofecha) {
      setGiNroVueloEmbarques(vueloSeleccionado.vuelo);
      setGiFechaEmbarques(givuelofecha);
      fetchGuias();
    } else {
      setGiNroVueloEmbarques('');
      setGiFechaEmbarques('');
    }

  }, [
    vueloSeleccionado,
    givuelofecha
  ]);

  const [loading, setLoading] = useState(false);
  // Función para manejar el envío del formulario
  const handleSubmitAgregarGuiaImpo = async (e) => {
    e.preventDefault();
    // Datos que enviarás al endpoint
    // Activar el spinner
    setLoading(true);

    const guiaData = {
      vueloSeleccionado: vueloSeleccionado.idVuelos || vueloSeleccionado,
      givuelofecha,
      giorigenvuelo,
      ginroguia,
      gifechaemisionguia,
      searchTerm,
      origenguiaSeleccionado,
      conexionguiaSeleccionado,
      destinoguiaSeleccionado,
      gitipodepagoguia,
      gimercaderiaguia,
      gipiezasguia,
      gipesoguia,
      gipesovolguia,
      moneda: moneda.value,
      giarbitrajeguia: convertirADecimal(giarbitrajeguia),
      gitarifaguia: convertirADecimal(gitarifaguia),
      gifleteoriginalguia: convertirADecimal(gifleteoriginalguia),
      gidcoriginalguia: convertirADecimal(gidcoriginalguia),
      gidaoriginalguia: convertirADecimal(gidaoriginalguia),
      gifleteguia: convertirADecimal(gifleteguia),
      giivas3guia: convertirADecimal(giivas3guia),
      giduecarrierguia: convertirADecimal(giduecarrierguia),
      gidueagentguia: convertirADecimal(gidueagentguia),
      giverificacionguia: convertirADecimal(giverificacionguia),
      gicollectfeeguia: convertirADecimal(gicollectfeeguia),
      gicfivaguia: convertirADecimal(gicfivaguia),
      giajusteguia: convertirADecimal(giajusteguia),
      gitotalguia: convertirADecimal(gitotalguia),
      gitotaldelaguia: convertirADecimal(gitotaldelaguia),
    };
    console.log(guiaData);
    try {
      const response = await axios.post('http://localhost:3000/api/insertguiaimpo', guiaData);
      console.log(response);
      if (response.status === 200) {
        toast.success('Guia Ingresada Con Exito');
      }
      fetchGuias();
      setGiNroGuia('');
      setGiFechaEmisionGuia('');
      setSearchTerm('');
      setOrigenGuiaSeleccionado('');
      setConexionGuiaSeleccionado('');
      setDestinoGuiaSeleccionado('');
      setGiTipoDePagoGuia('');
      setGiMercaderiaGuia('');
      setGiPiezasGuia('');
      setGiPesoGuia('');
      setGiPesovolGuia('');
      setGiMonedaGuia('');
      setGiArbitrajeGuia('');
      setGiTarifaGuia('');
      setGiDcOriginalGuia('');
      setGiDaOriginalGuia('');
      setGiVerificacionGuia('');
      setGiTotalGuia('');
      setGiTotaldelaGuia('');
    } catch (error) {
      // Si la guía ya existe
      if (error.response && error.response.data.message === 'Este número de guía ya existe') {
        toast.error('Este número de guía ya existe. Por favor, verifica y prueba nuevamente.');
      } else {
        toast.error('Error al enviar la guía. Por favor, revisa la consola para más detalles.');
      }
    } finally {
      // Desactivar el spinner al finalizar
      setLoading(false);
    }
  };



  return (
    <div className="EmitirComprobante-container">

      <h2 className='titulo-estandar'>Embarques de Importación</h2>
        <div className='contenedorformularioimpo'>
          {loading && (
            <div className="loading-overlay">
              {/* El spinner se muestra cuando loading es true */}
              <div className="loading-spinner"></div>
            </div>
          )}
          <form onSubmit={handleSubmitAgregarGuiaImpo} className='formulario-estandar'>

            <div className='primeracolumnaguiasimpo'>
              <div className='div-datos-comprobante'>
                <h3 className='subtitulo-estandar'>Datos del Vuelo</h3>

                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="ginrovuelo">Nro.Vuelo:</label>
                    <select
                      id="Vuelo"
                      required
                      value={vueloSeleccionado ? vueloSeleccionado.vuelo : ''}
                      onChange={handleSelectVuelo}
                      onClick={() => {
                        if (!isFetchedVuelos) fetchVuelos();
                      }}
                    >
                      <option value="">Seleccione un Vuelo</option>
                      {vuelos.map((vuelo, index) => (
                        <option key={index} value={vuelo.vuelo}>
                          {vuelo.vuelo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="givuelofecha">Fecha:</label>
                    <input
                      type="date"
                      id="givuelofecha"
                      value={givuelofecha}
                      onChange={(e) => setGiVueloFecha(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="giorigenvuelo">Origen:</label>
                    <select
                      id="giorigenvuelo"
                      value={giorigenvuelo}
                      onChange={(e) => setGiOrigenVuelo(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchCiudades una vez
                      }}
                      required
                    >
                      <option value="">Seleccione un origen</option>
                      {ciudades.map((ciudad, index) => (
                        <option key={index} value={ciudad.ciudad}>
                          {ciudad.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="giempresavuelo">Empresa:</label>
                    <input
                      type="text"
                      id="giempresavuelo"
                      value={vueloSeleccionado ? vueloSeleccionado.compania : ''}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>

              </div>

              <div className='div-datos-comprobante'>
                <h3 className='subtitulo-estandar'>Datos del Embarque</h3>

                <div className='div-primerrenglon-datos-comprobante'>
                
                  <div>
                    <label htmlFor="ginroguia">Guia:</label>
                    <input
                      type="text"
                      id="ginroguia"
                      value={ginroguia}
                      onChange={(e) => setGiNroGuia(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gifechaemisionguia">Emision:</label>
                    <input
                      type="date"
                      id="gifechaemisionguia"
                      value={gifechaemisionguia}
                      onChange={(e) => setGiFechaEmisionGuia(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="consignatario">Consignatario:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Buscar consignatario"
                      required
                    />
                  </div>

                </div>


                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="giorigenguia">Origen:</label>
                    <select
                      id="ciudad"
                      value={origenguiaSeleccionado}
                      required
                      onChange={(e) => setOrigenGuiaSeleccionado(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchCiudades una vez
                      }}
                    >
                      <option value="">Seleccione un origen</option>
                      {ciudades.map((ciudad, index) => (
                        <option key={index} value={ciudad.ciudad}>
                          {ciudad.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="giconexionguia">Conexion:</label>
                    <select
                      id="ciudad"
                      value={conexionguiaSeleccionado}
                      onChange={(e) => setConexionGuiaSeleccionado(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchMonedas una vez
                      }}
                    >
                      <option value="">Seleccione una Conexion</option>
                      {ciudades.map((ciudad, index) => (
                        <option key={index} value={ciudad.ciudad}>
                          {ciudad.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="gidestinoguia">Destino:</label>
                    <select
                      id="ciudad"
                      required
                      value={destinoguiaSeleccionado}
                      onChange={(e) => setDestinoGuiaSeleccionado(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchMonedas una vez
                      }}
                    >
                      <option value="MVD">MVD</option>
                      {ciudades.map((ciudad, index) => (
                        <option key={index} value={ciudad.ciudad}>
                          {ciudad.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="gitipodepagoguia">Tipo de Pago:</label>
                    <select
                      id="gitipodepagoguia"
                      value={gitipodepagoguia}
                      onChange={(e) => setGiTipoDePagoGuia(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una Tipo</option>
                      <option value="P">PREPAID</option>
                      <option value="C">COLLECT</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="gimercaderiaguia">Mercaderia:</label>
                    <input
                      type="text"
                      id="gimercaderiaguia"
                      value={gimercaderiaguia}
                      onChange={(e) => setGiMercaderiaGuia(e.target.value)}

                    />
                  </div>

                </div>

                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="gipiezasguia">Piezas:</label>
                    <input
                      type="number"
                      id="gipiezasguia"
                      value={gipiezasguia}
                      onChange={(e) => setGiPiezasGuia(e.target.value)}

                    />
                  </div>
                  <div>
                    <label htmlFor="gipesoguia">Peso:</label>
                    <input
                      type="number"
                      id="gipesoguia"
                      value={gipesoguia}
                      onChange={(e) => setGiPesoGuia(e.target.value)}

                    />
                  </div>
                  <div>
                    <label htmlFor="gipesovolguia">Peso/Vol:</label>
                    <input
                      type="number"
                      id="gipesovolguia"
                      value={gipesovolguia}
                      onChange={(e) => setGiPesovolGuia(e.target.value)}
                      required
                    />
                  </div>

                  <div></div>
                </div>


                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="moneda">Moneda:</label>
                    <select
                      id="moneda"
                      required
                      onClick={() => {
                        if (!isFetched) fetchMonedas(); // Solo llama a fetchMonedas una vez
                      }}
                    >
                      <option value="">Seleccione una moneda</option>
                      {monedas.map((moneda, index) => (
                        <option key={index} value={moneda.moneda}>
                          {moneda.moneda}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="giarbitrajeguia">Arbitraje:</label>
                    <input
                      type="number"
                      id="giarbitrajeguia"
                      value={giarbitrajeguia}
                      onChange={(e) => setGiArbitrajeGuia(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gitarifaguia">Tarifa:</label>
                    <input
                      type="number"
                      id="gitarifaguia"
                      value={gitarifaguia}
                      onChange={(e) => setGiTarifaGuia(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gifleteoriginalguia">Flete Original:</label>
                    <input
                      type="text"
                      id="gifleteoriginalguia"
                      value={gifleteoriginalguia}
                      onChange={(e) => setGiFleteOriginalGuia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gidcoriginalguia">DC Original:</label>
                    <input
                      type="number"
                      id="gidcoriginalguia"
                      value={gidcoriginalguia}
                      onChange={(e) => setGiDcOriginalGuia(e.target.value)}

                    />
                  </div>
                  <div>
                    <label htmlFor="gidaoriginalguia">DA Original:</label>
                    <input
                      type="number"
                      id="gidaoriginalguia"
                      value={gidaoriginalguia}
                      onChange={(e) => setGiDaOriginalGuia(e.target.value)}

                    />
                  </div>
                </div>

                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="gifleteguia">Flete:</label>
                    <input
                      type="text"
                      id="gifleteguia"
                      value={gifleteguia}
                      onChange={(e) => setGiFleteGuia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="giiva53guia">IVA Sobre 3%:</label>
                    <input
                      type="text"
                      id="giiva53guia"
                      value={giivas3guia}
                      onChange={(e) => setGiIvaS3Guia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="giduecarrierguia">Due Carrier:</label>
                    <input
                      type="text"
                      id="giduecarrierguia"
                      value={giduecarrierguia}
                      onChange={(e) => setGiDueCarrierGuia(e.target.value)}
                      readOnly

                    />
                  </div>
                  <div>
                    <label htmlFor="gidueagentguia">Due Agent:</label>
                    <input
                      type="text"
                      id="gidueagentguia"
                      value={gidueagentguia}
                      onChange={(e) => setGiDueAgentGuia(e.target.value)}
                      readOnly

                    />
                  </div>
                  <div>
                    <label htmlFor="giverificacionguia">Verificación:</label>
                    <input
                      type="text"
                      id="giverificacionguia"
                      value={giverificacionguia}
                      onChange={(e) => setGiVerificacionGuia(e.target.value)}

                    />
                  </div>

                </div>


                <div className='div-primerrenglon-datos-comprobante'>

                  <div>
                    <label htmlFor="gicollectfeeguia">Collect Fee:</label>
                    <input
                      type="text"
                      id="gicollectfeeguia"
                      value={gicollectfeeguia}
                      onChange={(e) => setGiCollectFeeGuia(e.target.value)}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="gicfivaguia">CF IVA:</label>
                    <input
                      type="text"
                      id="gicfivaguia"
                      value={gicfivaguia}
                      onChange={(e) => setGiCfIvaGuia(e.target.value)}
                      readOnly

                    />
                  </div>

                  <div>
                    <label htmlFor="giajusteguia">Ajuste:</label>
                    <input
                      type="text"
                      id="giajusteguia"
                      value={giajusteguia}
                      onChange={(e) => setGiAjusteGuia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                  <div></div>
                </div>


                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="gitotalguia">Total a Cobrar:</label>
                    <input
                      type="text"
                      id="gitotalguia"
                      value={gitotalguia}
                      onChange={(e) => setGiTotalGuia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gitotaldelaguia">Total de la Guia:</label>
                    <input
                      type="text"
                      id="gitotaldelaguia"
                      value={gitotaldelaguia}
                      onChange={(e) => setGiTotaldelaGuia(e.target.value)}
                      readOnly
                      required
                    />
                  </div>
                </div>


              </div>

              <div>
                <h3 className='subtitulo-estandar'>Embarques del Vuelo</h3>
                <div className='div-primerrenglon-datos-comprobante'>
                  <div>
                    <label htmlFor="ginrovueloembarques">Nro.Vuelo:</label>
                    <input
                      type="text"
                      id="ginrovueloembarques"
                      value={ginrovueloembarques}
                      onChange={(e) => setGiNroVueloEmbarques(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gifechaembarques">Fecha del Vuelo:</label>
                    <input
                      type="date"
                      id="gifechaembarques"
                      value={gifechaembarques}
                      onChange={(e) => setGiFechaEmbarques(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className='contenedor-tabla-embarques'style={{ marginTop: '15px' }}>
                  <TablaEmbarques tablaguias={tablaguias} />
                </div>

              </div>


            </div>



            <div className='botonesemitircomprobante' style={{ marginTop: '10px' }}>
              <button type="submit" className='btn-estandar'>Agregar Guia</button>

              <Link to="/home"><button className="btn-estandar">Volver</button></Link>
            </div>

          </form>
        </div>
      {/* Modal para modificar */}
      <ModalModificarGuiaImpo
        isOpen={isModalOpenModificar}
        closeModal={closeModalModificar}
        guia={guiaSeleccionada}
      />
      <ModalVerGuiaImpo
        isOpen={isModalOpenVer}
        closeModal={closeModalVer}
        guia={guiaSeleccionada}
      />
      {/* Modal de búsqueda de clientes */}
      <ModalBusquedaClientes
        isOpen={isModalOpen}
        closeModal={closeModal}
        filteredClientes={filteredClientes}
        handleSelectCliente={handleSelectCliente}
      />
      <ToastContainer />
    </div>
  );
}


export default Guiasimpo