import React, { useState, useEffect, useRef } from 'react';
import './Comprobantes.css'
import { Link } from "react-router-dom";
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ModalBusquedaEmbarque from '../../modales/ModalBusquedaEmbarque';
import ModalComprobanteGSM from '../../modales/ModalComprobanteGSM';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import ModalAlertaGFE from '../../modales/AlertasGFE';
import { descargarPDFBase64 } from '../../../ConexionGFE/Funciones';

const Comprobantes = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const rol = localStorage.getItem('rol');

    if (rol == '') {
      navigate('/');
    }
  }, [navigate]);
  // Estado para los campos del formulario
  const backURL = import.meta.env.VITE_BACK_URL;
  const [ecid, setEcId] = useState('');
  const [ecnombre, setEcNombre] = useState('');
  const [eccodigoGia, setEcCodigoGia] = useState('');
  const [ectipocomprobante, setEcTipoComprobante] = useState('');
  const [eccomprobanteelectronico, setEcComprobanteElectronico] = useState('');
  const [ecciudad, setEcCiudad] = useState('');
  const [ecpais, setEcPais] = useState('');
  const [ecrazonsocial, setEcRazonSocial] = useState('');
  const [ectipoiva, setEcTipoIva] = useState('');
  const [ecmoneda, setEcMoneda] = useState('USD');
  const [ecfecha, setEcFecha] = useState('');
  const [ecfechaVencimiento, setEcFechaVencimiento] = useState('');
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
  const [ecredondeo, setEcRedondeo] = useState(0);
  const [ectotal, setEcTotal] = useState('');
  const [eclistadeguiasasociadas, setEcListaDeGuiasAsociadas] = useState([]);

  const hasFetched = useRef(false);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [embarques, setEmbarques] = useState([]);
  const [embarquesSeleccionados, setEmbarquesSeleccionados] = useState([]);
  const [guiasconconceptos, setGuiasConConceptos] = useState([]);
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(false);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [guiasImpoPrepaid, setGuiasImpoPrepaid] = useState([]);
  const [guiasImpoCollect, setGuiasImpoCollect] = useState([]);
  const [guiasExpoPrepaid, setGuiasExpoPrepaid] = useState([]);

  const [isModalOpenGSM, setIsModalOpenGSM] = useState(false);
  const [datosModal, setDatosModal] = useState([]);
  //Estados para Modal Alerta GFE
  const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
  const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
  const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
  const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
  const handleConfirmAlertaGFE = () => {
    setIsModalOpenAlertaGFE(false);
    window.location.reload();
  };

  const handleOpenModalGSM = () => {
    // Extraer conceptos_cuentaajena de todas las guías
    const conceptosCuentaAjena = guiasconconceptos.flatMap((guia) => guia.conceptos_cuentaajena);
    setDatosModal(conceptosCuentaAjena);
    setIsModalOpenGSM(true);
  };

  const handleCloseModalGSM = () => {
    setIsModalOpenGSM(false);
  };


  const abrirModalEmbarques = () => {
    setShowModal(true); // Abre el modal
  };
  const volver = () => {
    navigate('/home'); // Redirige a la ruta /home
  };
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

    if (ectipodeembarque !== "Impo" && ectipodeembarque !== "Expo") return;

    const guiasimpoprepaid = embarquesSeleccionados.filter(
      (embarque) => embarque.Tipo === "IMPO" && embarque.tipodepagoguia === "P"
    );
    const guiasimpocollect = embarquesSeleccionados.filter(
      (embarque) => embarque.Tipo === "IMPO" && embarque.tipodepagoguia === "C"
    );
    const guiasexpoprepaid = embarquesSeleccionados.filter(
      (embarque) => embarque.tipo === "EXPO" && embarque.tipodepago === "P"
    );

    // Guardar en estado
    setGuiasImpoPrepaid(guiasimpoprepaid);
    setGuiasImpoCollect(guiasimpocollect);
    setGuiasExpoPrepaid(guiasexpoprepaid);

    // Verificar empresas
    if (embarquesSeleccionados.length > 0) {
      const empresas = embarquesSeleccionados.map((e) => e.empresavuelo);
      const todasIguales = empresas.every((empresa) => empresa === empresas[0]);

      if (todasIguales) {
        setEcCompania(empresas[0]);
        console.log("Empresa a facturar", empresas[0]);
      } else {
        toast.error(
          "Los embarques seleccionados tienen empresas de vuelo diferentes."
        );
        return;
      }
    }

    // Calcular IVA
    const totalEcIva = guiasimpocollect.reduce((sum, embarque) => {
      const valor = parseFloat(embarque.cfiva) || 0;
      return sum + valor;
    }, 0);

    setEcIva(Number(totalEcIva.toFixed(2)));


  }, [embarquesSeleccionados, ectipodeembarque]);
  useEffect(() => {
    if (!eccompania) return;
    // Crear el array de guías con conceptos
    const nuevasGuiasConConceptos = [
      // Agregar guías impo prepaid
      ...guiasImpoPrepaid.map((embarque) => ({
        id: embarque.idguia,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinoguia,
        fecha_envio: embarque.fechavuelo,
        datosAdenda: [{
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '01' : eccompania === 'AirEuropa' ? '09' : '0',
            descripcion: `Viaje: ${embarque.nombreVuelo} ${embarque.fechavuelo_formateada} Import`,
            moneda: embarque.moneda,
            importe: 0,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '01' : eccompania === 'AirEuropa' ? '09' : '0',
            descripcion: `AWB: ${embarque.guia} ${embarque.origenvuelo}/${embarque.conexionguia}/${embarque.destinoguia}`,
            moneda: embarque.moneda,
            importe: 0,
          }],
          datosAdendaCA: [{
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
            descripcion: `Viaje: ${embarque.nombreVuelo} ${embarque.fechavuelo_formateada}  AWB: ${embarque.guia}`,
            moneda: embarque.moneda,
            importe: 0,
          }],
        conceptos: [
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '01' : eccompania === 'AirEuropa' ? '09' : '0',
            descripcion: `Verificación Carga Recinto Aduanero: U$S ${embarque.verificacion}`,
            moneda: embarque.moneda,
            importe: embarque.verificacion,
          },
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '08' : eccompania === 'AirEuropa' ? '16' : '47',
            descripcion: `Redondeo: U$S ${embarque.ajuste}`,
            moneda: embarque.moneda,
            importe: embarque.ajuste,
          },
        ],
        conceptos_cuentaajena: [
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '02' : eccompania === 'AirEuropa' ? '10' : '0',
            descripcion: `Iva Sobre Flete:`,
            moneda: embarque.moneda,
            importe: embarque.ivas3,
          },

        ],
      })),
      // Agregar guías impo collect
      ...guiasImpoCollect.map((embarque) => ({
        id: embarque.idguia,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinoguia,
        fecha_envio: embarque.fechavuelo,
        datosAdenda: [{
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `Viaje: ${embarque.nombreVuelo} ${embarque.fechavuelo_formateada} Import`,
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
          }],
          datosAdendaCA: [{
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `${embarque.empresavuelo}`,
            moneda: 'USD',
            importe: 0,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: 0,
            descripcion: `Viaje: ${embarque.nombreVuelo} ${embarque.fechavuelo_formateada}  AWB: ${embarque.guia}`,
            moneda: embarque.moneda,
            importe: 0,
          }],
        conceptos: [
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '05' : eccompania === 'AirEuropa' ? '13' : '0',
            descripcion: `Collect Fee( Iva inc.): U$S: ${parseFloat((Number(embarque.collectfee) + Number(embarque.cfiva)).toFixed(2))}`,
            moneda: embarque.moneda,
            importe: Number(embarque.collectfee),
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '01' : eccompania === 'AirEuropa' ? '09' : '0',
            descripcion: `Verificación Carga Recinto Aduanero: U$S ${embarque.verificacion}`,
            moneda: embarque.moneda,
            importe: embarque.verificacion,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '08' : eccompania === 'AirEuropa' ? '16' : '47',
            descripcion: `Redondeo: U$S ${embarque.ajuste}`,
            moneda: embarque.moneda,
            importe: embarque.ajuste,
          },
        ],
        conceptos_cuentaajena: [
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '07' : eccompania === 'AirEuropa' ? '15' : '47',
            descripcion: `Due Carrier Collect:`,
            moneda: embarque.moneda,
            importe: embarque.dcoriginal,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '03' : eccompania === 'AirEuropa' ? '11' : '47',
            descripcion: `Flete Importacion Aerea:`,
            moneda: embarque.moneda,
            importe: embarque.flete,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '02' : eccompania === 'AirEuropa' ? '10' : '47',
            descripcion: `Iva Sobre Flete:`,
            moneda: embarque.moneda,
            importe: embarque.ivas3,
          },
          {
            tipo: 'C',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '04' : eccompania === 'AirEuropa' ? '12' : '47',
            descripcion: `Otros Gastos Collect:`,
            moneda: embarque.moneda,
            importe: embarque.daoriginal,
          },

        ],
      })),//hasta aca estamos bien 
      // Agregar guías expo prepaid
      ...guiasExpoPrepaid.map((embarque) => ({
        id: embarque.idguiaexpo,
        numero_guia: embarque.guia,
        origen: embarque.origenvuelo,
        destino: embarque.destinovuelo,
        fecha_envio: embarque.fechavuelo,
         datosAdenda: [{
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
            descripcion: `Viaje: ${embarque.nombreVuelo} ${embarque.fechavuelo_formateada} AWB: ${embarque.guia}`,
            moneda: 'USD',
            importe: 0,
          }],
        conceptos: [
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '06' : eccompania === 'AirEuropa' ? '14' : '47',
            descripcion: `Flete Exportación Aerea: U$S ${embarque.fleteneto}`,
            moneda: 'USD',
            importe: embarque.fleteneto,
          },
          ...(eccompania === 'Airclass' && embarque.security && Number(embarque.security) !== 0
            ? [{
              tipo: 'P',
              guia: embarque.guia,
              id_concepto: '21',
              descripcion: `Security: U$S ${embarque.security}`,
              moneda: 'USD',
              importe: embarque.security,
            }]
            : []),
          {
            tipo: 'P',
            guia: embarque.guia,
            id_concepto: eccompania === 'Airclass' ? '07' : eccompania === 'AirEuropa' ? '15' : '47',
            descripcion: `Due Carrier: U$S ${embarque.duecarrier}`,
            moneda: 'USD',
            importe: embarque.duecarrier,
          },
        ],
      })),
    ];

    setGuiasConConceptos(nuevasGuiasConConceptos);
    console.log("Guias combinadas con conceptos:", nuevasGuiasConConceptos);
  }, [eccompania, guiasImpoPrepaid, guiasExpoPrepaid, guiasImpoCollect]);


  const calcularTotal = () => {
    // forzamos a número cada importe para evitar concatenaciones
    const total = guiasconconceptos.reduce((suma, guia) => {
      const sumaGuia = guia.conceptos.reduce((subtotal, concepto) => {
        return subtotal + (Number(concepto.importe) || 0);
      }, 0);
      return suma + sumaGuia;
    }, 0);

    const totalNum = Number(total) || 0;
    const ecivaNum = Number(eciva) || 0;
    const totalACobrar = totalNum + ecivaNum;

    setEcTotal((totalNum + ecivaNum).toFixed(2));
    setEcTotalACobrar(totalACobrar.toFixed(2));
    setEcsubtotal(totalNum.toFixed(2));
  };
  useEffect(() => {
    calcularTotal();
  }, [guiasconconceptos]);

  const fetchEmbarques = async () => {
    try {
      const clienteId = searchTerm;
      const response = await axios.get(`${backURL}/api/obtenerembarques`, {
        params: {
          tipoEmbarque: ectipodeembarque,
          clienteId: clienteId
        }
      });

      const embarquesDesdeBackend = response.data;

      // 🔴 FILTRAR los que ya están seleccionados
      const embarquesFiltrados = embarquesDesdeBackend.filter((embarque) => {
        const id = embarque.idguiasexpo || embarque.idguia;
        return !embarquesSeleccionados.some(
          (e) => (e.idguiasexpo || e.idguia) === id
        );
      });

      setEmbarques(embarquesFiltrados); // 🟢 Solo los no seleccionados
      console.log('Embarques nuevos para seleccionar:', embarquesFiltrados);
      setShowModal(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No hay embarques a facturar.');
      } else {
        toast.error('Error al obtener los embarques.');
      }
      console.error('Error al obtener embarques:', error);
    }
  };
  // Al hacer clic en el botón, ejecuta fetchEmbarques
  const handleAgregarNuevaGuia = () => {

    if (ectipodeembarque && searchTerm) {
      fetchEmbarques();
    } else {
      toast.error('Debe seleccionar un cliente y un tipo de embarque.');
    }
  };

  // Se ejecuta solo una vez al montar el componente
  useEffect(() => {
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setEcFecha(icfechaactual);
    setEcFechaVencimiento(icfechaactual);

    // Llamar al endpoint para obtener el tipo de cambio
    const obtenerTipoCambio = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtenertipocambioparacomprobante`);
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


    const fetchCompanias = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtenercompanias`);
        setCompanias(response.data);
        setIsFetchedCompanias(true); // Indica que ya se obtuvieron los datos
      } catch (error) {
        console.error('Error al obtener monedas:', error);
      }
    }
    fetchCompanias();
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
        const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${searchTerm}`);
        setFilteredClientes(response.data);
        setIsModalOpen(true); // Abre el modal con los resultados
      } catch (error) {
        console.error('Error al buscar clientes:', error);
      }
    }
  };
  const handleChangeTipoEmbarque = (event) => {
    const nuevoTipo = event.target.value;

    if (guiasconconceptos.length > 0) {
      toast.error('Ya existen conceptos cargados, debe eliminarlos para cambiar el tipo de embarque.');
      return; // No actualizamos el estado de ectipodeembarque
    }

    setEcTipoDeEmbarque(nuevoTipo); // Solo actualizamos si no hay conceptos
  };
  // Selección de un cliente desde el modal
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente Seleccionado:', cliente)
    setSearchTerm(cliente.RazonSocial); // Muestra el nombre seleccionado en el input
    setIsSelectEnabled(true);
    setIsModalOpen(false); // Cierra el modal
  };

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setEcComprobanteElectronico(selectedCliente.Tcomprobante);
      setEcId(selectedCliente.Id);
      setEcCodigoGia(selectedCliente.CodigoGIA);
      setEcCiudad(selectedCliente.Ciudad);
      setEcPais(selectedCliente.Pais);
      setEcRazonSocial(selectedCliente.RazonSocial);
      setEcTipoIva(selectedCliente.Tiva);
      setEcDireccionFiscal(selectedCliente.Direccion);
      setEcCass(selectedCliente.Cass);
      setEcrutcedula(selectedCliente.Rut);
    }
  }, [selectedCliente]);

  //UserEffect para desplegar eventos cuando se cambia el tipo de embarque!
  useEffect(() => {
    if (ectipodeembarque && searchTerm) {
      fetchEmbarques();
    }
    if (ectipodeembarque === "Expo") {
      setEcComprobanteElectronico("efacturaca")
    } else {
      setEcComprobanteElectronico("efactura");
    }
    setBotonDeshabilitado(ectipodeembarque === "Expo");
  }, [ectipodeembarque]);



  // Función para manejar el envío del formulario
  const handleSubmitFacturar = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true);
    const conceptoscuentaajena = guiasconconceptos.flatMap((guia) => guia.conceptos_cuentaajena);
    console.log('Conceptoscuentaajena: ', conceptoscuentaajena);
    // Recopilar los datos del formulario en un objeto
    const datosFormulario = {
      IdCliente: ecid,
      Nombre: searchTerm,
      RazonSocial: ecrazonsocial,
      DireccionFiscal: ecdireccionfiscal,
      CodigoGIA: eccodigoGia,
      Ciudad: ecciudad,
      Pais: ecpais,
      RutCedula: ecrutcedula,
      ComprobanteElectronico: eccomprobanteelectronico,
      Comprobante: eccomprobante,
      Compania: eccompania,
      Electronico: ecelectronico,
      Moneda: ecmoneda,
      Fecha: ecfecha,
      FechaVencimiento: ecfechaVencimiento,
      TipoIVA: ectipoiva,
      CASS: eccass,
      TipoEmbarque: ectipodeembarque,
      TC: parseFloat(ectc).toFixed(2),
      Subtotal: parseFloat(ecsubtotal).toFixed(2),
      IVA: parseFloat(eciva).toFixed(2),
      Redondeo: parseFloat(ecredondeo).toFixed(2),
      Total: parseFloat(ectotal).toFixed(2),
      TotalCobrar: parseFloat(ectotalacobrar).toFixed(2),
      DetalleFactura: guiasconconceptos,
      EmbarquesSeleccionados: embarquesSeleccionados
    };


    console.log('info al backend: ', datosFormulario);


    if (Array.isArray(conceptoscuentaajena) && conceptoscuentaajena.length > 0 && !conceptoscuentaajena.includes(undefined)) {
      // Sumar los importes de conceptos cuenta ajena
      const subtotalca = (conceptoscuentaajena.reduce((acc, concepto) => acc + parseFloat(concepto.importe || 0), 0)).toFixed(2);
      const ivaca = (0).toFixed(2); // Suponiendo que el IVA es 0
      const totalca = (parseFloat(subtotalca) + parseFloat(ivaca)).toFixed(2);
      const redondeoca = (Math.ceil(totalca) - totalca).toFixed(2); // Redondeo
      const totalACobrarca = (parseFloat(totalca) + parseFloat(redondeoca)).toFixed(2);

      // Agregar los nuevos valores al objeto SIN reasignarlo
      datosFormulario.SubtotalCuentaAjena = subtotalca;
      datosFormulario.IVACuentaAjena = ivaca;
      datosFormulario.TotalCuentaAjena = totalca;
      datosFormulario.RedondeoCuentaAjena = redondeoca;
      datosFormulario.TotalCobrarCuentaAjena = totalACobrarca;
    }

    try {
      console.log('Datos del formulario a Backend: ', datosFormulario);

      let response;
      console.log("Final payload a enviar:", JSON.stringify(datosFormulario, null, 2));
      if (datosFormulario.ComprobanteElectronico === "efactura" || datosFormulario.ComprobanteElectronico === "efacturaca") {
        // Caso EFECTURA
        response = await axios.post(`${backURL}/api/insertfactura`, datosFormulario);
        console.log('Factura Agregada (eFactura):', response.data);

      } else if (datosFormulario.ComprobanteElectronico === "eticket" || datosFormulario.ComprobanteElectronico === "eticketca") {

        response = await axios.post(`${backURL}/api/insertticket`, datosFormulario);
        console.log('Factura Agregada (eTicket):', response.data);

      } else {
        throw new Error("Tipo de ComprobanteElectronico no reconocido.");
      }

      const { facturaId, facturaCuentaAjenaId, error } = response.data;

      if (response.data.success === true) {
        const resultados = response.data.resultados;

        resultados.forEach((item, index) => {
          console.log(`Descripción ${index + 1}:`, item.descripcion);
          const nombreArchivo = `${item.tipodocumento}_${item.seriedocumento}_${item.numerodocumento}.pdf`;
          descargarPDFBase64(item.pdfBase64, nombreArchivo);
        });

        setTituloAlertaGfe('Factura Ingresada Correctamente');
        setmensajeAlertaGFE('');
        setIconoAlertaGFE('success');
        setIsModalOpenAlertaGFE(true);

      } else if (response.status === 500) {
        setTituloAlertaGfe('Error al Cargar la Factura');
        setmensajeAlertaGFE('');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);

      } else {
        setTituloAlertaGfe('Error Desconocido');
        setmensajeAlertaGFE('Error desconocido en el ERP');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);
      }

    } catch (error) {
      console.log('Error completo:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.error('Error en la solicitud:', error);

      if (error.response && error.response.status === 422) {
        const { errores, mensaje } = error.response.data;
        let mensajeError = mensaje || 'Error al procesar los documentos.';

        if (Array.isArray(errores) && errores.length > 0) {
          const detalles = errores
            .map((err, i) => `Documento ${i + 1}: ${err.descripcion || 'Error desconocido'}`)
            .join('\n');

          mensajeError += '\n\n' + detalles;
        }

        setTituloAlertaGfe('Error al Impactar en GFE');
        setmensajeAlertaGFE(mensajeError);
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);

      } else if (error.response && error.response.status === 500) {
        setTituloAlertaGfe('Error al Cargar la Factura');
        setmensajeAlertaGFE('');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);

      } else {
        setTituloAlertaGfe('Error Desconocido');
        setmensajeAlertaGFE('Error Desconocido en el ERP');
        setIconoAlertaGFE('error');
        setIsModalOpenAlertaGFE(true);
      }

    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="EmitirComprobante-container">
      {loading && (
        <div className="loading-overlay">
          {/* El spinner se muestra cuando loading es true */}
          <div className="loading-spinner"></div>
        </div>
      )}
      <h2 className='titulo-estandar'>Emisión de Comprobantes</h2>
      <form className='formulario-estandar'>
        <ToastContainer />
        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-primerrenglon-datos-comprobante'>

              <div>
                <label htmlFor="ecnombre">Nombre:</label>
                <input
                  type="text"
                  id="ecnombre"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar Cliente"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label htmlFor="eccodigoGia">Código GIA:</label>
                <input
                  type="text"
                  id="eccodigoGia"
                  value={eccodigoGia}
                  onChange={(e) => setEcCodigoGia(e.target.value)}
                  required
                  readOnly
                />
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
                  <option value="efacturaca">E-Factura Cuenta Ajena</option>
                  <option value="eticket">E-Ticket</option>
                  <option value="eticketca">E-Ticket Cuenta Ajena</option>
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
              <div className="fecha-emision-comprobante">
                <label htmlFor="ecfecha">Fecha Vencimiento:</label>
                <input
                  type="date"
                  id="ecfecha"
                  value={ecfechaVencimiento}
                  onChange={(e) => setEcFechaVencimiento(e.target.value)}
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
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="ecmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={ecmoneda}
                  onChange={(e) => setEcMoneda(e.target.value)}
                  required
                >
                  <option value="USD">USD</option>
                  <option value="UYU">UYU</option>
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
                  readOnly
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
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="ecdireccionfiscal">Dirección Fiscal:</label>
                <input
                  type="text"
                  id="ecdireccionfiscal"
                  value={ecdireccionfiscal}
                  onChange={(e) => setEcDireccionFiscal(e.target.value)}
                  required
                  readOnly
                />
              </div>
            </div>

            <div className='div-primerrenglon-datos-comprobante'>

              <div>
                <label htmlFor="eccompania">Compañia Aerea:</label>
                <select
                  id="eccompania"
                  value={eccompania}
                  onChange={(e) => setEcCompania(e.target.value)}
                  required
                  disabled
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
                  readOnly
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
                  onChange={handleChangeTipoEmbarque}
                  required
                  disabled={!isSelectEnabled}
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
                  readOnly
                />
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
                              className='action-button'
                              type="button"
                              onClick={() => eliminarConcepto(guia.id, index)}
                            >
                              ❌
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
                  readOnly
                  onChange={(e) => setEcIva(e.target.value)}

                />
              </div>

              <div>
                <label htmlFor="ectotal">Total:</label>
                <input
                  type="text"
                  id="ectotal"
                  value={ectotal}
                  readOnly
                  required
                />
              </div>
              <div>
                <label htmlFor="ectotalacobrar">Total a Cobrar:</label>
                <input
                  type="text"
                  id="ectotalacobrar"
                  value={ectotalacobrar}
                  readOnly
                  required
                />
              </div>
            </div>
          </div>


        </div>



        <div className='div-primerrenglon-datos-comprobante' style={{ marginTop: '10px' }}>

          <button type="button" className="btn-estandar" onClick={handleAgregarNuevaGuia}>Agregar Nueva Guía</button>

          <button type="button" disabled={botonDeshabilitado} onClick={handleOpenModalGSM} className='btn-estandar'>Comprobante GSM</button>

          <button type='button' className="btn-facturar" onClick={handleSubmitFacturar}>Facturar</button>

          <button type='button' className="btn-estandar" onClick={() => volver()} >Volver</button>
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
      <ModalComprobanteGSM
        isOpen={isModalOpenGSM}
        onClose={handleCloseModalGSM}
        datos={datosModal}
      />
      <ModalAlertaGFE
        isOpen={isModalOpenAlertaGFE}
        title={tituloAlertaGfe}
        message={mensajeAlertaGFE}
        onConfirm={handleConfirmAlertaGFE}
        iconType={iconoAlertaGFE}
      />

    </div>

  );
}

export default Comprobantes