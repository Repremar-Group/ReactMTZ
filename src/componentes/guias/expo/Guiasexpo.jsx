import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "./Guiasexpo.css";
import axios from 'axios';
import { convertirAComa, convertirADecimal } from '../../funcionesgenerales';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import { ToastContainer, toast } from 'react-toastify';
import ModalAlerta from '../../modales/Alertas';
import ModalVerGuiaExpo from '../../modales/ModalVerGuiaExpo';
import ModalModificarGuiaExpo from '../../modales/ModalModificarGuiaExpo';

const Guiasexpo = ({ isLoggedIn }) => {
  const backURL = import.meta.env.VITE_BACK_URL;
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
  const [tablaguias, setTablaGuias] = useState([]);

  //Estados para las alertas
  const [isModalOpenEliminar, setIsModalOpenEliminar] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert'); // 'alert' o 'confirm'
  const [guiaAEliminar, setGuiaAEliminar] = useState([]);

  //Funcion para modal de eliminar
  const openModalConfirmDelete = (guia) => {
    console.log(guia)
    setModalMessage('Estás seguro de eliminar la guia ' + guia.guia);
    setModalType('confirm');
    setIsModalOpenEliminar(true);
    setGuiaAEliminar(guia);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`${backURL}/api/eliminarGuiaExpo/${guiaAEliminar.guia}`); // Realiza la solicitud DELETE
      if (response.status === 200) {
        console.log('Guía eliminada:', guiaAEliminar);
        toast.success('Guía eliminada exitosamente');
        fetchGuias();
        closeModalEliminar();
      }
    } catch (error) {
      console.error('Error eliminando la guía:', error);
      toast.error('No se pudo eliminar la guía, por favor intenta nuevamente.');
    }
  };
  const handleCancel = () => {
    closeModalEliminar();
  };

  const closeModalEliminar = () => {
    setIsModalOpenEliminar(false);
    setModalMessage('');
    setModalType('alert');
    setGuiaAEliminar([]);
  };
  useEffect(() => {
    if (!isModalOpenEliminar) {
      setModalMessage('');
      setGuiaAEliminar(null);
    }
  }, [isModalOpenEliminar]);

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
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
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
   const closeModalModificarSinRecarga = () => {
    setIsModalOpenModificar(false);
    setGuiaSeleccionada(null);
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

  //Estados para obtener el numero de vuelo al cargar la guia
  const [vuelos, setVuelos] = useState([]);
  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [isFetchedVuelos, setIsFetchedVuelos] = useState(false); // Para evitar múltiples llamadas

  const fetchVuelos = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtenervuelos`);
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

  //Manejo para traer las guias despues de seleccionar el vuelo y la fecha
  const fetchGuias = async () => {
    try {
      const response = await fetch(`${backURL}/api/fetchguiasexpo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vueloSeleccionado: vueloSeleccionado.idVuelos,
          gevuelofecha,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTablaGuias(data); // Almacena las guías en el estado
        console.log(data);
      } else {
        console.error('Error al obtener las guías');
      }
    } catch (error) {
      console.error('Error al hacer el fetch:', error);
    }
  };

  useEffect(() => {
    if (vueloSeleccionado && gevuelofecha) {
      setGiNroVueloEmbarques(vueloSeleccionado.vuelo);
      setGiFechaEmbarques(gevuelofecha);
      fetchGuias();
    } else {
      setGiNroVueloEmbarques('');
      setGiFechaEmbarques('');
    }

  }, [
    vueloSeleccionado,
    gevuelofecha
  ]);
  //Estados para obtenerlas ciudades desde bd 
  const [ciudades, setCiudades] = useState([]);
  const [origenVueloSeleccionado, setOrigenVueloSeleccionado] = useState('MVD');
  const [conexionVueloSeleccionado, setConexionVueloSeleccionado] = useState('');
  const [destinoVueloSeleccionado, setDestinoVueloSeleccionado] = useState('');
  const [isFetchedCiudades, setIsFetchedCiudades] = useState(false); // Para evitar múltiples llamadas

  const fetchCiudades = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtenerciudades`);
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
            <td>{embarque.agente}</td>
            <td>{embarque.total}</td>
            <td>{embarque.tipodepago}</td>
            <td>
              <button type="button" className="action-button" onClick={() => openModalVer(embarque.guia)}  >🔍</button>
              <button type="button" className="action-button" onClick={() => openModalModificar(embarque.guia)}>✏️</button>
              <button type="button" className="action-button" onClick={() => openModalConfirmDelete(embarque)}>❌</button>
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
      const gsa = fleteNetoCalculado * 0.05;

      // Verificar el tercer decimal
      const tercerDecimal = Math.floor((gsa * 1000) % 10); // Obtiene el tercer decimal
      let gsaRedondeado;

      if (tercerDecimal >= 5) {
        // Redondear hacia arriba
        gsaRedondeado = Math.ceil(gsa * 100) / 100;
      } else {
        // Mantener el redondeo estándar
        gsaRedondeado = Math.floor(gsa * 100) / 100;
      }

      // Si el cálculo es un número válido, actualizar el estado de Flete Original
      if (!isNaN(fleteNetoCalculado)) {
        setGeFleteNetoGuia(convertirAComa(fleteNetoCalculado.toFixed(2))); // Mantener dos decimales
        setGeGsaGuia(convertirADecimal(gsaRedondeado.toFixed(2)));
      } else {
        setGeFleteNetoGuia(''); // Si el cálculo no es válido, limpiar el valor
        setGeGsaGuia('');
      }
    } else {
      setGeGsaGuia('');
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

  // useEffect para actualizar DBF cuando Due Agent cambia
  useEffect(() => {
    if (gedueagentguia) {
      let DBFCalculado = parseFloat(gedueagentguia) * 0.10;
      if (DBFCalculado <= 20) {
        DBFCalculado = 20;
        setGeDbfGuia(DBFCalculado.toFixed(2));
      } else {
        DBFCalculado = parseFloat(gedueagentguia) * 0.10;
        setGeDbfGuia(DBFCalculado.toFixed(2));
      }

    } else {
      setGeDbfGuia('');
    }
  }, [gedueagentguia]);

  //UseEffect para calcular todos los campos si la guia es Collect
  useEffect(() => {
    if ((gefleteawbguia && gefletenetoguia) && getipodepagoguia === 'C') {
      console.log("gefleteneto:", gefletenetoguia);
      console.log("getipodepagoguia:", getipodepagoguia);
      const fleteNetoConvertido = convertirADecimal(gefletenetoguia);
      console.log("fleteNetoConvertido:", fleteNetoConvertido);

      //Calculo de total a cobrar
      const totalacobrar = (
        (parseFloat(convertirADecimal(gefletenetoguia)) || 0) +
        (parseFloat(convertirADecimal(geduecarrierguia)) || 0) +
        (parseFloat(convertirADecimal(gesecurityguia)) || 0) +
        (parseFloat(convertirADecimal(gedbfguia)) || 0)
      );

      //Calculo total de la guia
      const totaldelaguia = (
        (parseFloat(convertirADecimal(gefleteawbguia)) || 0) +
        (parseFloat(convertirADecimal(geduecarrierguia)) || 0) +
        (parseFloat(convertirADecimal(gesecurityguia)) || 0) +
        (parseFloat(convertirADecimal(gedueagentguia)) || 0) +
        (parseFloat(convertirADecimal(gedbfguia)) || 0)
      );

      const AgenteCollect = (totaldelaguia - totalacobrar);

      //Asignación de las Varibles.
      setGeTotalGuia(totaldelaguia.toFixed(2));
      setGeCobrarPagarGuia(totalacobrar.toFixed(2));
      setGeAgenteCollectGuia(AgenteCollect.toFixed(2));

    } else {
      if ((!gefleteawbguia || !gefletenetoguia) && getipodepagoguia != 'P') {
        setGeTotalGuia('');
        setGeCobrarPagarGuia('');
        setGeAgenteCollectGuia('');
      }
    }
  }, [
    gefletenetoguia,
    gefleteawbguia,
    getipodepagoguia,
    gedueagentguia,
    geduecarrierguia,
    gedbfguia,
    gesecurityguia
  ]);

  //UseEffect para calcular todos los campos si la guia es PrePaid
  useEffect(() => {
    if (gefletenetoguia && getipodepagoguia === 'P') {

      //Calculo de total a cobrar
      const totalacobrar = (
        (parseFloat(convertirADecimal(gefletenetoguia)) || 0) +
        (parseFloat(convertirADecimal(geduecarrierguia)) || 0) +
        (parseFloat(convertirADecimal(gesecurityguia)) || 0)
      )
      //Calculo total de la guia
      const totaldelaguia = (
        (parseFloat(convertirADecimal(gesecurityguia)) || 0) +
        (parseFloat(convertirADecimal(geduecarrierguia)) || 0) +
        (parseFloat(convertirADecimal(gefleteawbguia)) || 0)
      )

      //Asignación de las Varibles.

      setGeTotalGuia(totaldelaguia.toFixed(2));
      setGeCobrarPagarGuia(totalacobrar.toFixed(2));
      setGeAgenteCollectGuia(0);
    } else {

      if (!gefletenetoguia && getipodepagoguia != 'C') {
        setGeTotalGuia('');
        setGeCobrarPagarGuia('');
        setGeAgenteCollectGuia('');
      }

    }
  }, [
    gefletenetoguia,
    gefleteawbguia,
    getipodepagoguia,
    geduecarrierguia,
    gesecurityguia
  ]);

  const [loading, setLoading] = useState(false);
  const handleSubmitAgregarGuiaExpo = async (e) => {
    e.preventDefault();
    // Datos que enviarás al endpoint
    // Activar el spinner
    setLoading(true);

    const guiaData = {
      vueloSeleccionado: vueloSeleccionado.idVuelos || vueloSeleccionado,
      gevuelofecha,
      origenVueloSeleccionado,
      conexionVueloSeleccionado,
      destinoVueloSeleccionado,
      empresavuelo: vueloSeleccionado.compania,
      gecassvuelo,
      searchTerm,
      gereserva,
      genroguia,
      geemision,
      getipodepagoguia,
      gepiezasguia,
      gepesobrutoguia: convertirADecimal(gepesobrutoguia),
      gepesotarifadoguia: convertirADecimal(gepesotarifadoguia),
      getarifanetaguia: convertirADecimal(getarifanetaguia),
      getarifaventaguia: convertirADecimal(getarifaventaguia),
      gefletenetoguia: convertirADecimal(gefletenetoguia),
      gefleteawbguia: convertirADecimal(gefleteawbguia),
      geduecarrierguia: convertirADecimal(geduecarrierguia),
      gedueagentguia: convertirADecimal(gedueagentguia),
      gedbfguia: convertirADecimal(gedbfguia),
      gegsaguia: convertirADecimal(gegsaguia),
      gesecurityguia: convertirADecimal(gesecurityguia),
      gecobrarpagarguia: convertirADecimal(gecobrarpagarguia),
      geagentecollectguia: convertirADecimal(geagentecollectguia),
      getotalguia: convertirADecimal(getotalguia),

    };
    console.log(guiaData);
    try {
      const response = await axios.post(`${backURL}/api/insertguiaexpo`, guiaData);
      console.log(response);
      if (response.status === 200) {
        toast.success('Guia Ingresada Con Exito');
      }
      setSearchTerm('');
      setGeReserva('');
      setGeNroGuia('');
      setGeEmision('');
      setGeTipoDePagoGuia('');
      setGePiezasGuia('');
      setGePesoBrutoGuia('');
      setGePesoTarifadoGuia('');
      setGeTarifaNetaGuia('');
      setGeTarifaVentaGuia('');
      setGeFleteNetoGuia('');
      setGeFleteAwbGuia('');
      setGeDueCarrierGuia('');
      setGeDueAgentGuia('');
      setGeDbfGuia('');
      setGeGsaGuia('');
      setGeSecurityGuia('');
      setGeCobrarPagarGuia('');
      setGeAgenteCollectGuia('');
      setGeTotalGuia('');
      //Aca se restablecen los campos
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
      fetchGuias();
    }
  };




  return (
    <div className="EmitirComprobante-container">
      <h2 className='titulo-estandar'>Embarques de Exportación</h2>
      {loading && (
        <div className="loading-overlay">
          {/* El spinner se muestra cuando loading es true */}
          <div className="loading-spinner"></div>
        </div>
      )}
      <form onSubmit={handleSubmitAgregarGuiaExpo} className='formulario-estandar'>

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
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar Agente"
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
                  type="number"
                  id="gepiezasguia"
                  value={gepiezasguia}
                  onChange={(e) => setGePiezasGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gepesobrutoguia">Peso Bruto:</label>
                <input
                  type="number"
                  id="gepesobrutoguia"
                  value={gepesobrutoguia}
                  onChange={(e) => setGePesoBrutoGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="gepesotarifadoguia">Peso Tarifado:</label>
                <input
                  type="number"
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
                  type="number"
                  id="getarifanetaguia"
                  value={getarifanetaguia}
                  onChange={(e) => setGeTarifaNetaGuia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="getarifaventaguia">Tarifa Venta:</label>
                <input
                  type="number"
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

              <div></div>
            </div>


            <div className='div-primerrenglon-datos-comprobante'>
              <div>
                <label htmlFor="geduecarrierguia">Due Carrier:</label>
                <input
                  type="number"
                  id="geduecarrierguia"
                  value={geduecarrierguia}
                  onChange={(e) => setGeDueCarrierGuia(e.target.value)}

                />
              </div>
              <div>
                <label htmlFor="gedueagentguia">Due Agent:</label>
                <input
                  type="number"
                  id="gedueagentguia"
                  value={gedueagentguia}
                  onChange={(e) => setGeDueAgentGuia(e.target.value)}
                  readOnly={getipodepagoguia === 'P'}
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
                  readOnly
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
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="gesecurityguia">Security:</label>
                <input
                  type="number"
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
                  type="number"
                  id="gecobrarpagarguia"
                  value={gecobrarpagarguia}
                  onChange={(e) => setGeCobrarPagarGuia(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="geagentecollectguia">Agente Collect:</label>
                <input
                  type="number"
                  id="geagentecollectguia"
                  value={geagentecollectguia}
                  onChange={(e) => setGeAgenteCollectGuia(e.target.value)}
                  required
                  readOnly
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
                  readOnly
                />
              </div>
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
                  readOnly
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
                  readOnly
                />
              </div>
            </div>
            <div className='contenedor-tabla-embarques'>
              <TablaEmbarques tablaguias={tablaguias} />
            </div>

          </div>


        </div>



        <div className='botonesemitircomprobante'>
          <button type="submit" className='btn-estandar'>Agregar Guia</button>

          <Link to="/home"><button className="btn-estandar">Volver</button></Link>
        </div>
      </form>
      <ModalVerGuiaExpo
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
      <ModalAlerta
        isOpen={isModalOpenEliminar}
        message={modalMessage}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancel}
        type={modalType}
      />
      <ModalModificarGuiaExpo
        isOpen={isModalOpenModificar}
        closeModal={closeModalModificar}
        closeModalSinrecarga={closeModalModificarSinRecarga}
        guia={guiaSeleccionada}
      />
      <ToastContainer />
    </div>

  );
}
export default Guiasexpo