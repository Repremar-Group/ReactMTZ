import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './Guiasimpo.css'
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';

const Guiasimpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [ginroimpo, setGiNroImpo] = useState('');
  const [givuelofecha, setGiVueloFecha] = useState('');
  const [giorigenvuelo, setGiOrigenVuelo] = useState('');
  const [giempresavuelo, setGiEmpresaVuelo] = useState('');
  const [ginroembarque, setGiNroEmbarque] = useState('');
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
  const [giiva53guia, setGiIva53Guia] = useState('');
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

  const datos = [
    { guia: "510-10198856", Cliente: "Repremar Logistics", total: "500" },
    { guia: "510-10198857", Cliente: "Logistica y Transportes S.A.", total: "450" },
    { guia: "510-10198858", Cliente: "Global Shipping Ltd.", total: "700" },
    { guia: "510-10198859", Cliente: "Fast Cargo Express", total: "600" },
    { guia: "510-10198860", Cliente: "Pacifico Freight", total: "550" },
    { guia: "510-10198861", Cliente: "Maritime Solutions", total: "620" },
    { guia: "510-10198862", Cliente: "Transporte del Sur", total: "580" },
    { guia: "510-10198863", Cliente: "Oceanic Trade", total: "500" },
    { guia: "510-10198864", Cliente: "Cargo Movers Co.", total: "670" },
    { guia: "510-10198865", Cliente: "TransAndes Ltd.", total: "520" },
    { guia: "510-10198866", Cliente: "Shipping Partners S.A.", total: "530" },
    { guia: "510-10198867", Cliente: "Comercial y Logistica Express", total: "490" },
    { guia: "510-10198868", Cliente: "Importaciones del Norte", total: "600" },
    { guia: "510-10198869", Cliente: "Mercado Global S.A.", total: "470" },
    { guia: "510-10198870", Cliente: "Logistica Integral SRL", total: "640" },
    { guia: "510-10198871", Cliente: "Shipping Co.", total: "510" },
    { guia: "510-10198872", Cliente: "Intercontinental Shipping", total: "650" },
    { guia: "510-10198873", Cliente: "Transporte Nacional", total: "560" },
    { guia: "510-10198874", Cliente: "Worldwide Logistics", total: "490" },
    { guia: "510-10198875", Cliente: "Express Cargo Ltd.", total: "610" }
  ];

  const datospagos = [
    { cheque: "3523", banco: "Santander", moneda: "Dolares", importe: "500" },
    { cheque: "3524", banco: "BBVA", moneda: "Pesos", importe: "1200" },
    { cheque: "3525", banco: "HSBC", moneda: "Dolares", importe: "850" },
    { cheque: "3526", banco: "Santander", moneda: "Pesos", importe: "900" },
    { cheque: "3527", banco: "Banco Nación", moneda: "Dolares", importe: "650" },
    { cheque: "3528", banco: "BBVA", moneda: "Pesos", importe: "700" },
    { cheque: "3529", banco: "HSBC", moneda: "Dolares", importe: "1200" },
    { cheque: "3530", banco: "Santander", moneda: "Pesos", importe: "1500" },
    { cheque: "3531", banco: "Banco Nación", moneda: "Dolares", importe: "950" },
    { cheque: "3532", banco: "BBVA", moneda: "Pesos", importe: "600" }
  ];
  const TablaPagos = ({ pago }) => (
    <table className='tabla-pago-guias' >
      <thead>
        <tr>
          <th>Cheque</th>
          <th>Banco</th>
          <th>Moneda</th>
          <th>Importe</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pago.map((pago, index) => (
          <tr key={index}>
            <td>{pago.cheque}</td>
            <td>{pago.banco}</td>
            <td>{pago.moneda}</td>
            <td>{pago.importe}</td>
            <td>
              <button type="button" className="action-button"  >✏️</button>
              <button type="button" className="action-button"  >❌</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const TablaEmbarques = ({ datos }) => (
    <table className='tabla-embarques' >
      <thead>
        <tr>
          <th>Guia</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((embarque, index) => (
          <tr key={index}>
            <td>{embarque.guia}</td>
            <td>{embarque.Cliente}</td>
            <td>{embarque.total}</td>
            <td>
              <button type="button" className="action-button"  >✏️</button>
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
      <h2 className='titulo-estandar'>Embarques de Importación</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

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
                  required
                >
                  <option value="">Selecciona una Origen</option>
                  <option value="EZE">EZE</option>
                  <option value="x">x</option>
                  <option value="etc">Etc</option>
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
            <div className='contenedor-tabla-embarques'>
              <h3 className='subtitulo-estandar'>Pago de la Guia</h3>
              <TablaPagos pago={datospagos} />
            </div>
          </div>

          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Embarque</h3>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ginroembarque">Nro. Embarque:</label>
                <input
                  type="text"
                  id="ginroembarque"
                  value={ginroembarque}
                  onChange={(e) => setGiNroEmbarque(e.target.value)}
                  required
                />
              </div>
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
                />
              </div>

            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="giorigenguia">Origen:</label>
                <select
                  id="ciudad"
                  value={origenguiaSeleccionado}
                  onChange={(e) =>setOrigenGuiaSeleccionado(e.target.value)}
                  onClick={() => {
                    if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchMonedas una vez
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
                  onChange={(e) =>setConexionGuiaSeleccionado(e.target.value)}
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
                  value={destinoguiaSeleccionado}
                  onChange={(e) =>setDestinoGuiaSeleccionado(e.target.value)}
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
                  required
                />
              </div>
              <div></div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="gipiezasguia">Piezas:</label>
                <input
                  type="text"
                  id="gipiezasguia"
                  value={gipiezasguia}
                  onChange={(e) => setGiPiezasGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gipesoguia">Peso:</label>
                <input
                  type="text"
                  id="gipesoguia"
                  value={gipesoguia}
                  onChange={(e) => setGiPesoGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gipesovolguia">Peso/Vol:</label>
                <input
                  type="text"
                  id="gipesovolguia"
                  value={gipesovolguia}
                  onChange={(e) => setGiPesovolGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ginroccaguia">Nro.CCA:</label>
                <input
                  type="text"
                  id="ginroccaguia"
                  value={ginroccaguia}
                  onChange={(e) => setGinroccaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gidifpesoccaguia">Dif.Peso CCA:</label>
                <input
                  type="text"
                  id="gidifpesoccaguia"
                  value={gidifpesoccaguia}
                  onChange={(e) => setGiDifPesoCcaGuia(e.target.value)}
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
                  type="text"
                  id="giarbitrajeguia"
                  value={giarbitrajeguia}
                  onChange={(e) => setGiArbitrajeGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gitarifaguia">Tarifa:</label>
                <input
                  type="text"
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
                  required
                />
              </div>
              <div>
                <label htmlFor="gidcoriginalguia">DC Original:</label>
                <input
                  type="text"
                  id="gidcoriginalguia"
                  value={gidcoriginalguia}
                  onChange={(e) => setGiDcOriginalGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gidaoriginalguia">DA Original:</label>
                <input
                  type="text"
                  id="gidaoriginalguia"
                  value={gidaoriginalguia}
                  onChange={(e) => setGiDaOriginalGuia(e.target.value)}
                  required
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
                  required
                />
              </div>
              <div>
                <label htmlFor="giiva53guia">Iva 5/3 %:</label>
                <input
                  type="text"
                  id="giiva53guia"
                  value={giiva53guia}
                  onChange={(e) => setGiIva53Guia(e.target.value)}
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
                  required
                />
              </div>
              <div>
                <label htmlFor="gidueagentguia">Due Agent:</label>
                <input
                  type="text"
                  id="gidueagentguia"
                  value={gidueagentguia}
                  onChange={(e) => setGiDueAgentGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="giverificacionguia">Verificación:</label>
                <input
                  type="text"
                  id="giverificacionguia"
                  value={giverificacionguia}
                  onChange={(e) => setGiVerificacionGuia(e.target.value)}
                  required
                />
              </div>
              <div></div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="gihouseextrasguia">House Extras:</label>
                <input
                  type="text"
                  id="gihouseextrasguia"
                  value={gihouseextrasguia}
                  onChange={(e) => setGiHouseExtrasGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gicollectfeeguia">Collect Fee:</label>
                <input
                  type="text"
                  id="gicollectfeeguia"
                  value={gicollectfeeguia}
                  onChange={(e) => setGiCollectFeeGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gicfivaguia">CF IVA:</label>
                <input
                  type="text"
                  id="gicfivaguia"
                  value={gicfivaguia}
                  onChange={(e) => setGiCfIvaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gigastosezeizaguia">Gastos Ezeiza:</label>
                <input
                  type="text"
                  id="gigastosezeizaguia"
                  value={gigastosezeizaguia}
                  onChange={(e) => setGiGastosEzeizaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="giajusteguia">Ajuste:</label>
                <input
                  type="text"
                  id="giajusteguia"
                  value={giajusteguia}
                  onChange={(e) => setGiAjusteGuia(e.target.value)}
                  required
                />
              </div>
              <div></div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="gitotalguia">Total:</label>
                <input
                  type="text"
                  id="gitotalguia"
                  value={gitotalguia}
                  onChange={(e) => setGiTotalGuia(e.target.value)}
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
                  required
                />
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="giusuarioguia">Usuario:</label>
                <input
                  type="text"
                  id="giusuarioguia"
                  value={giusuarioguia}
                  onChange={(e) => setGiUsuarioGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gifacturadoguia">Facturado:</label>
                <input
                  type="text"
                  id="gifacturadoguia"
                  value={gifacturadoguia}
                  onChange={(e) => setGiFacturadoGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="ginrofacturaguia">Nro. Factura:</label>
                <input
                  type="text"
                  id="ginrofacturaguia"
                  value={ginrofacturaguia}
                  onChange={(e) => setGiNroFacturaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gireciboguia">Recibo:</label>
                <input
                  type="text"
                  id="gireciboguia"
                  value={gireciboguia}
                  onChange={(e) => setGiReciboGuia(e.target.value)}
                  required
                />
              </div>
              <div></div>
              <div></div>

            </div>
          </div>
          <div>
            <h3 className='subtitulo-estandar'>Embarques del Vuelo</h3>
            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="ginrovueloembarques">Nro. Vuelo:</label>
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
            <div className='contenedor-tabla-embarques'>
              <TablaEmbarques datos={datos} />
            </div>

          </div>


        </div>



        <div className='botonesemitircomprobante'>
          <button type="submit" className='btn-estandar'>Agregar Guia</button>

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
    </div>
  );
}


export default Guiasimpo