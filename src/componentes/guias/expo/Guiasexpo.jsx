import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "./Guiasexpo.css";
import axios from 'axios';
import { convertirAComa, convertirADecimal } from '../../funcionesgenerales';

const Guiasexpo = ({ isLoggedIn }) => {
  // Estado para los campos del formulario
  const [genroembarque, setGeNroEmbarque] = useState('');
  const [geagente, setGeAgente] = useState('');
  const [gereserva, setGeReserva] = useState('');
  const [genroguia, setGeNroGuia] = useState('');
  const [geemision, setGeEmision] = useState('');
  const [getipodepagoguia, setGeTipoDePagoGuia] = useState('');
  const [genrovuelo, setGeNroVuelo] = useState('');
  const [gevuelofecha, setGeVueloFecha] = useState('');
  const [georigenvuelo, setGeOrigenVuelo] = useState('');
  const [geconexionvuelo, setGeConexionVuelo] = useState('');
  const [gedestinovuelo, setGeDestinoVuelo] = useState('');
  const [gecassvuelo, setGecassVuelo] = useState('');
  const [geempresavuelo, setGeEmpresaVuelo] = useState('');
  const [gepiezasguia, setGePiezasGuia] = useState('');
  const [gepesobrutoguia, setGePesoBrutoGuia] = useState('');
  const [gevolumenguia, setGeVolumenGuia] = useState('');
  const [geacordadoguia, setGeAcordadoGuia] = useState('');
  const [gepesotarifadoguia, setGePesoTarifadoGuia] = useState('');
  const [getarifanetaguia, setGeTarifaNetaGuia] = useState('');
  const [getarifaventaguia, setGeTarifaVentaGuia] = useState('');
  const [gefletenetoguia, setGeFleteNetoGuia] = useState('');
  const [gefleteawbguia, setGeFleteAwbGuia] = useState('');
  const [geincluirduecarrierguia, setGeIncluirDueCarrierGuia] = useState('');
  const [geduecarrierguia, setGeDueCarrierGuia] = useState('');
  const [gedueagentguia, setGeDueAgentGuia] = useState('');
  const [gedbfguia, setGeDbfGuia] = useState('');
  const [gegsaguia, setGeGsaGuia] = useState('');
  const [gesecurityguia, setGeSecurityGuia] = useState('');
  const [gecobrarpagarguia, setGeCobrarPagarGuia] = useState('');
  const [geagentecollectguia, setGeAgenteCollectGuia] = useState('');
  const [getotalguia, setGeTotalGuia] = useState('');
  const [geccaguia, setGeCcaGuia] = useState('');
  const [geembarcadorguia, setGeEmbarcadorGuia] = useState('');
  const [geconsignatarioguia, setGeConsignatarioGuia] = useState('');
  const [gemercaderiaguia, setGeMercaderiaGuia] = useState('');
  const [geusuarioguia, setGeUsuarioGuia] = useState('');
  const [gefacturadoguia, setGeFacturadoGuia] = useState('');
  const [genrofacturaguia, setGeNroFacturaGuia] = useState('');
  const [gereciboguia, setGeReciboGuia] = useState('');



  const [ginrovueloembarques, setGiNroVueloEmbarques] = useState('');
  const [gifechaembarques, setGiFechaEmbarques] = useState('');

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
  //Estados para obtenerlas ciudades desde bd 
  const [ciudades, setCiudades] = useState([]);
  const [origenVueloSeleccionado, setOrigenVueloSeleccionado] = useState('');
  const [conexionVueloSeleccionado, setConexionVueloSeleccionado] = useState('');
  const [destinoVueloSeleccionado, setDestinoVueloSeleccionado] = useState('MVD');
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


  const datos = [
    { numero: "1", fecha: "01/11/2024", agente: "Cielosur", origen: "MVD", destino: "EZE", peso: "500" },
    { numero: "2", fecha: "02/11/2024", agente: "Cielosur", origen: "SCL", destino: "LIM", peso: "550" },
    { numero: "3", fecha: "03/11/2024", agente: "Cielosur", origen: "EZE", destino: "SCL", peso: "600" },
    { numero: "4", fecha: "04/11/2024", agente: "Cielosur", origen: "LIM", destino: "MVD", peso: "450" },
    { numero: "5", fecha: "05/11/2024", agente: "Cielosur", origen: "BOG", destino: "EZE", peso: "700" },
    { numero: "6", fecha: "06/11/2024", agente: "Cielosur", origen: "EZE", destino: "MVD", peso: "500" },
    { numero: "7", fecha: "07/11/2024", agente: "Cielosur", origen: "SCL", destino: "BOG", peso: "1200" },
    { numero: "8", fecha: "08/11/2024", agente: "Cielosur", origen: "MVD", destino: "SCL", peso: "550" },
    { numero: "9", fecha: "09/11/2024", agente: "Cielosur", origen: "LIM", destino: "BOG", peso: "600" },
    { numero: "10", fecha: "10/11/2024", agente: "Cielosur", origen: "EZE", destino: "SCL", peso: "480" },
    { numero: "11", fecha: "11/11/2024", agente: "Cielosur", origen: "MVD", destino: "LIM", peso: "510" },
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
  const datosmercaderia = [
    { largo: "200", ancho: "100", alto: "120", cantidad: "500", volumen: "10" },
    { largo: "220", ancho: "110", alto: "130", cantidad: "600", volumen: "12" },
    { largo: "210", ancho: "105", alto: "125", cantidad: "550", volumen: "11" },
    { largo: "230", ancho: "115", alto: "135", cantidad: "650", volumen: "13" },
    { largo: "240", ancho: "120", alto: "140", cantidad: "700", volumen: "14" },
    { largo: "250", ancho: "125", alto: "145", cantidad: "750", volumen: "15" },
    { largo: "260", ancho: "130", alto: "150", cantidad: "800", volumen: "16" },
    { largo: "270", ancho: "135", alto: "155", cantidad: "850", volumen: "17" },
    { largo: "280", ancho: "140", alto: "160", cantidad: "900", volumen: "18" },
    { largo: "290", ancho: "145", alto: "165", cantidad: "950", volumen: "19" }
  ];


  const TablaPagos = ({ pago }) => (
    <table className='tabla-pago-guias-expo' >
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
    <table className='tabla-embarques-expo' >
      <thead>
        <tr>
          <th>Numero</th>
          <th>Fecha</th>
          <th>Agente</th>
          <th>Origen</th>
          <th>Destino</th>
          <th>Peso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((embarque, index) => (
          <tr key={index}>
            <td>{embarque.numero}</td>
            <td>{embarque.fecha}</td>
            <td>{embarque.agente}</td>
            <td>{embarque.origen}</td>
            <td>{embarque.destino}</td>
            <td>{embarque.peso}</td>
            <td>
              <button type="button" className="action-button"  >✏️</button>
              <button type="button" className="action-button"  >❌</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );



  const [ecfecha, setEcFecha] = useState('');

  const [ecguia, setEcGuia] = useState('');
  const [ecdescripcion, setEcDescripcion] = useState('');
  const [ecmonedaguia, setEcMonedaGuia] = useState('');
  const [ecimporte, setEcImporte] = useState('');

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
  // Función para agregar una factura asociada a la tabla
  const handleAgregarGuiaAsociada = () => {
    if (ecguia && ecdescripcion && ecmonedaguia && ecimporte) {
      const nuevaguiaasociada = { ecguia, ecdescripcion, ecmonedaguia, ecimporte };
      setEcListaDeGuiasAsociadas([...eclistadeguiasasociadas, nuevaguiaasociada]);
      setEcGuia('');
      setEcDescripcion('');
      setEcMonedaGuia('');
      setEcImporte('');
    }
  };

  useEffect(() => {
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setEcFecha(icfechaactual);
  }, []); // Se ejecuta solo una vez al montar el componente

  // useEffect para actualizar Flete Neto cuando Tarifa Neta o Peso Tarifado cambian
  useEffect(() => {
    if (getarifanetaguia && gepesotarifadoguia) {
      // Convertir coma a punto antes de hacer el cálculo
      const tarifanetaconvertida = convertirADecimal(getarifanetaguia);
      const pesotarifadoconvertido = convertirADecimal(gepesotarifadoguia);

      // Realizar el cálculo
      const fleteNetoCalculado = parseFloat(tarifanetaconvertida) * parseFloat(pesotarifadoconvertido);

      // Si el cálculo es un número válido, actualizar el estado de Flete Original
      if (!isNaN(fleteNetoCalculado)) {
        setGeFleteNetoGuia(convertirAComa(fleteNetoCalculado.toFixed(2))); // Mantener dos decimales
      } else {
        setGeFleteNetoGuia(''); // Si el cálculo no es válido, limpiar el valor
      }
    } else {
      setGeFleteNetoGuia(''); // Si alguno de los campos está vacío, borrar Flete Original
    }
  }, [getarifanetaguia, gepesotarifadoguia]);

  // useEffect para actualizar Flete Awb cuando Tarifa Venta o Peso Tarifado cambian
  useEffect(() => {
    if (getarifaventaguia && gepesotarifadoguia) {
      // Convertir coma a punto antes de hacer el cálculo
      const tarifaventaconvertida = convertirADecimal(getarifaventaguia);
      const pesotarifadoconvertido = convertirADecimal(gepesotarifadoguia);

      // Realizar el cálculo
      const fleteAwbCalculado = parseFloat(tarifaventaconvertida) * parseFloat(pesotarifadoconvertido);

      // Si el cálculo es un número válido, actualizar el estado de Flete Original
      if (!isNaN(fleteAwbCalculado)) {
        setGeFleteAwbGuia(convertirAComa(fleteAwbCalculado.toFixed(2))); // Mantener dos decimales
      } else {
        setGeFleteAwbGuia(''); // Si el cálculo no es válido, limpiar el valor
      }
    } else {
      setGeFleteAwbGuia(''); // Si alguno de los campos está vacío, borrar Flete Original
    }
  }, [getarifaventaguia, gepesotarifadoguia]);


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
      <h2 className='titulo-estandar'>Embarques de Exportación</h2>
      <form onSubmit={handleSubmitAgregarRecibo} className='formulario-estandar'>

        <div className='primeracolumnaguiasimpo'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Vuelo</h3>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="genrovuelo">Nro.Vuelo:</label>
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
                <label htmlFor="gevuelofecha">Fecha:</label>
                <input
                  type="date"
                  id="gevuelofecha"
                  value={gevuelofecha}
                  onChange={(e) => setGeVueloFecha(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="georigenvuelo">Origen:</label>
                <select
                      id="georigenvuelo"
                      value={origenVueloSeleccionado}
                      onChange={(e) => setOrigenVueloSeleccionado(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchCiudades una vez
                      }}
                      required
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
                <label htmlFor="geconexionvuelo">Conexion:</label>
                <select
                      id="ciudad"
                      value={conexionVueloSeleccionado}
                      onChange={(e) => setConexionVueloSeleccionado(e.target.value)}
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
                <label htmlFor="gedestinovuelo">Destino:</label>
                <select
                      id="ciudad"
                      required
                      value={destinoVueloSeleccionado}
                      onChange={(e) => setDestinoVueloSeleccionado(e.target.value)}
                      onClick={() => {
                        if (!isFetchedCiudades) fetchCiudades(); // Solo llama a fetchMonedas una vez
                      }}
                    >
                      <option value="">Seleccione un Destino</option>
                      {ciudades.map((ciudad, index) => (
                        <option key={index} value={ciudad.ciudad}>
                          {ciudad.ciudad}
                        </option>
                      ))}
                    </select>
              </div>

              <div>
                <label htmlFor="geempresavuelo">Empresa:</label>
                <input
                  type="text"
                  id="geempresavuelo"
                  value={vueloSeleccionado ? vueloSeleccionado.compania : ''}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="gecassvuelo">Cass:</label>
                <select
                  id="gecassvuelo"
                  value={gecassvuelo}
                  onChange={(e) => setGecassVuelo(e.target.value)}
                  required
                >
                  <option value="">Seleccione una Opcion</option>
                  <option value="S">Si</option>
                  <option value="N">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className='para generar espacio'>
          </div>

          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Embarque</h3>

            <div className='div-primerrenglon-datos-comprobante'>
              
              <div>
                <label htmlFor="geagente">Agente:</label>
                <input
                  type="text"
                  id="geagente"
                  value={geagente}
                  onChange={(e) => setGeAgente(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gereserva">Reserva:</label>
                <input
                  type="text"
                  id="gereserva"
                  value={gereserva}
                  onChange={(e) => setGeReserva(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="genroguia">Guia:</label>
                <input
                  type="text"
                  id="genroguia"
                  value={genroguia}
                  onChange={(e) => setGeNroGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="geemision">Emisión:</label>
                <input
                  type="date"
                  id="geemision"
                  value={geemision}
                  onChange={(e) => setGeEmision(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="getipodepagoguia">Tipo de Pago:</label>
                <select
                  id="getipodepagoguia"
                  value={getipodepagoguia}
                  onChange={(e) => setGeTipoDePagoGuia(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Tipo</option>
                  <option value="P">PREPAID</option>
                  <option value="C">COLLECT</option>
                </select>
              </div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="gepiezasguia">Piezas:</label>
                <input
                  type="text"
                  id="gepiezasguia"
                  value={gepiezasguia}
                  onChange={(e) => setGePiezasGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gepesobrutoguia">Peso Bruto:</label>
                <input
                  type="text"
                  id="gepesobrutoguia"
                  value={gepesobrutoguia}
                  onChange={(e) => setGePesoBrutoGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gepesotarifadoguia">Peso Tarifado:</label>
                <input
                  type="text"
                  id="gepesotarifadoguia"
                  value={gepesotarifadoguia}
                  onChange={(e) => setGePesoTarifadoGuia(e.target.value)}
                  required
                />
              </div>
              <div></div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="getarifanetaguia">Tarifa Neta:</label>
                <input
                  type="text"
                  id="getarifanetaguia"
                  value={getarifanetaguia}
                  onChange={(e) => setGeTarifaNetaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="getarifaventaguia">Tarifa Venta:</label>
                <input
                  type="text"
                  id="getarifaventaguia"
                  value={getarifaventaguia}
                  onChange={(e) => setGeTarifaVentaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gefletenetoguia">Flete Neto:</label>
                <input
                  type="text"
                  id="gefletenetoguia"
                  value={gefletenetoguia}
                  onChange={(e) => setGeFleteNetoGuia(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="gefleteawbguia">Flete AWB:</label>
                <input
                  type="text"
                  id="gefleteawbguia"
                  value={gefleteawbguia}
                  onChange={(e) => setGeFleteAwbGuia(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="geincluirduecarrierguia">Incluir Due Carrier:</label>
                <select
                  id="geincluirduecarrierguia"
                  value={geincluirduecarrierguia}
                  onChange={(e) => setGeIncluirDueCarrierGuia(e.target.value)}
                  required
                >
                  <option value="">Selecciona una Opcion</option>
                  <option value="SI">Si</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div></div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="geduecarrierguia">Due Carrier:</label>
                <input
                  type="text"
                  id="geduecarrierguia"
                  value={geduecarrierguia}
                  onChange={(e) => setGeDueCarrierGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gedueagentguia">Due Agent:</label>
                <input
                  type="text"
                  id="gedueagentguia"
                  value={gedueagentguia}
                  onChange={(e) => setGeDueAgentGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gedbfguia">DBF:</label>
                <input
                  type="text"
                  id="gedbfguia"
                  value={gedbfguia}
                  onChange={(e) => setGeDbfGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gegsaguia">GSA:</label>
                <input
                  type="text"
                  id="gegsaguia"
                  value={gegsaguia}
                  onChange={(e) => setGeGsaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gesecurityguia">Security:</label>
                <input
                  type="text"
                  id="gesecurityguia"
                  value={gesecurityguia}
                  onChange={(e) => setGeSecurityGuia(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="gecobrarpagarguia">Cobrar/Pagar:</label>
                <input
                  type="text"
                  id="gecobrarpagarguia"
                  value={gecobrarpagarguia}
                  onChange={(e) => setGeCobrarPagarGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="geagentecollectguia">Agente Collect:</label>
                <input
                  type="text"
                  id="geagentecollectguia"
                  value={geagentecollectguia}
                  onChange={(e) => setGeAgenteCollectGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="getotalguia">Total de la Guia:</label>
                <input
                  type="text"
                  id="getotalguia"
                  value={getotalguia}
                  onChange={(e) => setGeTotalGuia(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="geusuarioguia">Usuario:</label>
                <input
                  type="text"
                  id="geusuarioguia"
                  value={geusuarioguia}
                  onChange={(e) => setGeUsuarioGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gefacturadoguia">Facturado:</label>
                <input
                  type="text"
                  id="gefacturadoguia"
                  value={gefacturadoguia}
                  onChange={(e) => setGeFacturadoGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="genrofacturaguia">Nro. Factura:</label>
                <input
                  type="text"
                  id="genrofacturaguia"
                  value={genrofacturaguia}
                  onChange={(e) => setGeNroFacturaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gereciboguia">Recibo:</label>
                <input
                  type="text"
                  id="gereciboguia"
                  value={gereciboguia}
                  onChange={(e) => setGeReciboGuia(e.target.value)}
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
    </div>
  );
}
export default Guiasexpo