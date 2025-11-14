import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './EmitirNC.css'
import axios from 'axios';
import ModalBusquedaClientes from '../../modales/ModalBusquedaClientes';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import ModalAlertaGFE from '../../modales/AlertasGFE';
import Swal from 'sweetalert2';
import { descargarPDFBase64 } from '../../../ConexionGFE/Funciones';
const EmitirNC = ({ isLoggedIn }) => {

  const navigate = useNavigate();
  useEffect(() => {
    const rol = localStorage.getItem('rol');

    if (rol == '') {
      navigate('/');
    }
  }, [navigate]);

  // Estado para los campos del formulario
  const backURL = import.meta.env.VITE_BACK_URL;
  const [fmid, setFmId] = useState('');
  const [fmnombre, setFmNombre] = useState('');
  const [fmtipocomprobante, setFmTipoComprobante] = useState('');
  const [fmcomprobanteelectronico, setFmComprobanteElectronico] = useState('');
  const [fmciudad, setFmCiudad] = useState('');
  const [fmpais, setFmPais] = useState('');
  const [fmrazonsocial, setFmRazonSocial] = useState('');
  const [fmtipoiva, setFmTipoIva] = useState('');
  const [fmmoneda, setFmMoneda] = useState('USD');
  const [fmfecha, setFmFecha] = useState('');
  const [fmfechaVencimiento, setFmFechaVencimiento] = useState('');
  const [fmcomprobante, setFmComprobante] = useState('');
  const [fmelectronico, setFmElectronico] = useState('');
  const [fmdireccionfiscal, setFmDireccionFiscal] = useState('');
  const [fmrutcedula, setFmRutCedula] = useState('');
  const [fmcass, setFmCass] = useState('');
  const [encAcuenta, setEncACuenta] = useState(false);
  const [fmtipodeembarque, setFmTipoDeEmbarque] = useState('');
  const [fmtc, setFmTc] = useState('');
  const [fmguia, setFmGuia] = useState('');
  const [fmcodigoconcepto, setFmCodigoConcepto] = useState('');
  const [fmdescripcion, setFmDescripcion] = useState('');
  const [fmmonedaconcepto, setFmMonedaConcepto] = useState('USD');
  const [fmimporte, setFmImporte] = useState('');
  const [fmtotalacobrar, setFmTotalACobrar] = useState('');
  const [fmsubtotal, setFmsubtotal] = useState('');
  const [fmiva, setFmIva] = useState('');
  const [fmredondeo, setFmRedondeo] = useState('');
  const [fmtotal, setFmTotal] = useState('');
  const [fmivaconcepto, setFmIvaConcepto] = useState('');
  const [fmlistadeconceptos, setFmListaDeConceptos] = useState([]);
  const [facturasCliente, setFacturasCliente] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);
  const [conceptoactual, setConceptoActual] = useState([]);
  const [codigoClienteGIA, setCodigoClienteGIA] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingtabla, setLoadingTabla] = useState(false);


  const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
  const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
  const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
  const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
  const handleConfirmAlertaGFE = () => {
    setIsModalOpenAlertaGFE(false);
    window.location.reload();
  };
  const [erdocumentoasociado, setErDocumentoAsociado] = useState('');
  const handleKeyPressDocumento = (event) => {

  };

  const handleEliminarFacturaSeleccionada = (numeroCFE) => {
    setFacturasSeleccionadas(prev => prev.filter(f => f.NumeroCFE !== numeroCFE));
  };


  const handleAgregarFacturaSeleccionada = (factura) => {
    if (facturasSeleccionadas.length > 0) {
      toast.error("Solo se puede seleccionar una factura a la vez.");
      return;
    }

    setFacturasSeleccionadas([factura]);
  };
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
  const hasFetched = useRef(false);
  const [botonActivo, setBotonActivo] = useState(false);


  // Estado para la cheque seleccionado
  const [fmconceptoseleccionado, setFmConceptoSeleccionado] = useState(null);

  // Función para seleccionar una factura al hacer clic en una fila
  const handleSeleccionarConceptoAsociado = (icindex) => {
    setFmConceptoSeleccionado(icindex);
  };

  const [conceptosEncontrados, setConceptosEncontrados] = useState([]);
  const [mostrarModalBuscarConcepto, setMostrarModalBuscarConcepto] = useState(false);
  const fetchTodosLosConceptos = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtener-conceptos`);
      setConceptosEncontrados(response.data);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      toast.error('Error al obtener la lista de conceptos');
    }
  };

  useEffect(() => {
    if (mostrarModalBuscarConcepto == true) {
      fetchTodosLosConceptos();
    }
  }, [mostrarModalBuscarConcepto]);
  const fetchConceptoPorCodigo = async () => {
    try {
      const response = await axios.get(`${backURL}/api/buscarconcepto/${fmcodigoconcepto}`);
      if (response.data) {
        setFmDescripcion(response.data.descripcion || '');
        setFmCodigoConcepto(response.data.codigo || '');
        setConceptoActual(response.data);
        console.log('Concepto Actual:', response.data);
        setBotonActivo(true);
      } else {
        toast.error('Concepto no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener el concepto:', error);
      toast.error('Error al obtener el concepto');
    }
  };
  const fetchMonedas = async () => {
    try {
      const response = await axios.get(`${backURL}/api/obtenermonedas`);
      setMonedas(response.data);
      setIsFetchedMonedas(true); // Indica que ya se obtuvieron los datos
    } catch (error) {
      console.error('Error al obtener monedas:', error);
    }
  }
  useEffect(() => {
    setFmMonedaConcepto(fmmoneda);
  }, [fmmoneda]);

  useEffect(() => {
    console.log('Concepto actual', conceptoactual)
    if (conceptoactual?.impuesto === 'iva_basica' && fmimporte) {
      const ivaCalculado = (parseFloat(fmimporte) * 0.22).toFixed(2); // 22% de IVA
      setFmIvaConcepto(ivaCalculado);
    } else if (conceptoactual?.impuesto === 'iva_minimo' && fmimporte) {
      const ivaCalculado = (parseFloat(fmimporte) * 0.10).toFixed(2); // 10% de IVA
      setFmIvaConcepto(ivaCalculado);

    } else {
      setFmIvaConcepto('0'); // Si es exento, el IVA es 0
    }
  }, [fmimporte, conceptoactual]);

  // Función para eliminar el cheque seleccionado
  const handleEliminarConceptoAsociado = () => {
    if (fmconceptoseleccionado !== null) {
      // Filtrar todos los cheques excepto el seleccionado
      const nuevosconceptoseleccionados = fmlistadeconceptos.filter((_, icindex) => icindex !== fmconceptoseleccionado);
      setFmListaDeConceptos(nuevosconceptoseleccionados);
      setFmConceptoSeleccionado(null); // Limpiar la selección
    }
  };
  // Función para agregar una factura asociada a la tabla
  const handleAgregarConceptoAsociado = () => {
    if (fmcodigoconcepto && fmdescripcion && fmmonedaconcepto && fmivaconcepto && fmimporte && conceptoactual) {
      const nuevoconceptoasociado = {
        ...conceptoactual, // todos los datos que vienen de la base
        ivaCalculado: fmivaconcepto,
        importe: fmimporte,
        moneda: fmmonedaconcepto,
      };
      setFmListaDeConceptos([...fmlistadeconceptos, nuevoconceptoasociado]);

      console.log('Conceptos Actuales:', [...fmlistadeconceptos, nuevoconceptoasociado]);

      // Reset inputs
      setFmCodigoConcepto('');
      setFmDescripcion('');
      setFmIvaConcepto('');
      setFmImporte('');
      setConceptoActual(null);
      setBotonActivo(false);
    }
  };


  useEffect(() => {
    if (hasFetched.current) return; // Si ya se ejecutó, no vuelve a hacerlo
    hasFetched.current = true;

    // Llamar al endpoint para obtener el tipo de cambio
    const obtenerTipoCambio = async () => {
      try {
        const response = await axios.get(`${backURL}/api/obtenertipocambioparacomprobante`);
        if (response.data.tipo_cambio == undefined) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/home");
        } else {
          setFmTc(response.data.tipo_cambio);
        }
        console.log(response.data.tipo_cambio);
      } catch (error) {
        if (error.response) {
          alert("No hay tipo de cambio para la fecha actual.");
          navigate("/home");
        } else {
          console.error("Error en la consulta:", error);
          navigate("/home");
        }
      }
    };
    const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    setFmFecha(icfechaactual);
    setFmFechaVencimiento(icfechaactual);
    fetchMonedas();
    obtenerTipoCambio();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmitAgregarFm = () => {
    setLoading(true);
    if (!encAcuenta && facturasSeleccionadas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay facturas seleccionadas',
        text: 'Por favor seleccioná al menos una factura.',
      });
      return;
    }
    // Si es "a cuenta" pedimos los datos primero
if (encAcuenta) {
  Swal.fire({
    title: 'Datos de Nota de Crédito a Cuenta',
    width: '60%',
    html: `
      <div style="margin-bottom:15px; text-align:left;">
        <label style="font-weight:bold; display:block; margin-bottom:8px;">Tipo de Nota de Crédito</label>
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          <label><input type="radio" name="tipoNC" value="NTT"> NC - Eticket</label>
          <label><input type="radio" name="tipoNC" value="NRA"> NC - Eticket CA</label>
          <label><input type="radio" name="tipoNC" value="NCT"> NC - Efactura</label>
          <label><input type="radio" name="tipoNC" value="NCA"> NC - Efactura CA</label>
        </div>
      </div>

      <!-- 🔹 Conceptos -->
      <div id="conceptosContainer" style="display:flex; flex-direction:column; gap:10px; text-align:left;
          max-height:500px; min-height:400px; max-width:800px; min-width:800px; overflow-y:auto;">
        <div class="concepto-item" style="display:flex; gap:10px; align-items:center;">
          <select class="productoNC swal2-input" style="width:60%; height:2.5em;">
            <option value="">Seleccione un concepto</option>
            <option value="01">VZ - Verificación de Carga</option>
            <option value="02">VZ - Iva Sobre Flete</option>
            <option value="03">VZ - Flete Importación Aerea</option>
            <option value="04">VZ - Otros Gastos Collect</option>
            <option value="05">VZ - Collect Fee</option>
            <option value="06">VZ - Flete Exportación Aerea</option>
            <option value="07">VZ - Due Carrier Prepaid</option>
            <option value="08">VZ - Redondeo</option>
            <option value="09">UX - Verificación de Carga</option>
            <option value="10">UX - Iva Sobre Flete</option>
            <option value="11">UX - Flete Importación Aerea</option>
            <option value="12">UX - Otros Gastos Collect</option>
            <option value="13">UX - Collect Fee</option>
            <option value="14">UX - Flete Exportación Aerea</option>
            <option value="15">UX - Due Carrier Prepaid</option>
            <option value="16">UX - Redondeo</option>
            <option value="17">VZ - Comisión Exportación</option>
            <option value="18">UX - Comisión Exportación Cass</option>
            <option value="19">UX - Comisión Exportación No Cass</option>
            <option value="20">UX - Comisión Exportación Mail</option>
            <option value="21">VZ - Security</option>
          </select>
          <input class="importeNC swal2-input" type="number" placeholder="Importe" style="width:30%;">
          <button class="btnEliminarConcepto" style="background:transparent; color:#b71c1c; border:none;
                  border-radius:5px; padding:4px 8px; cursor:pointer; font-size:18px;">❌</button>
        </div>
      </div>

      <button id="addConceptoBtn" type="button"
        style="margin-top:10px; padding:6px 10px; background:#0a2d54; color:white; border:none; 
               border-radius:5px; cursor:pointer;">
        + Agregar concepto
      </button>

      <hr style="margin:15px 0;">

      <div style="display:flex; align-items:center; justify-content:space-between;">
        <label style="font-weight:bold;">Referencia</label>
        <div class="switch-container" id="monedaSwitchContainer">
          <span class="label active" id="labelUYU">UYU</span>
          <div class="switch" id="monedaSwitch" data-moneda="UYU">
            <div class="slider"></div>
          </div>
          <span class="label" id="labelUSD">USD</span>
        </div>
      </div>

      <input id="referenciaNC" class="swal2-input" placeholder="Ej: Ajuste por servicios" style="width:100%;">

      <style>
        .switch-container { display: flex; align-items: center; gap: 8px; }
        .label { font-size: 16px; color: #cbd5e0; font-weight: bold; transition: 0.3s; }
        .label.active { color: #143361; transform: scale(1.2); }
        .switch { position: relative; width: 60px; height: 30px; border-radius: 15px;
          background: linear-gradient(to bottom, #2154a1, #143361); cursor: pointer; transition: 0.3s; }
        .switch.usd { background: linear-gradient(to bottom, #1b5e20, #2e7d32); }
        .switch .slider { position: absolute; top: 2.6px; left: 3px; width: 24px; height: 24px;
          border-radius: 50%; background-color: white; box-shadow: 0 0 4px rgba(0,0,0,0.2); transition: 0.3s; }
        .switch.usd .slider { transform: translateX(30px); }
      </style>
    `,
    didOpen: () => {
      const popup = Swal.getPopup();
      const container = popup.querySelector('#conceptosContainer');
      const templateSelect = popup.querySelector('.productoNC').innerHTML;

      const agregarFila = () => {
        const newRow = document.createElement('div');
        newRow.classList.add('concepto-item');
        newRow.style.display = 'flex';
        newRow.style.gap = '10px';
        newRow.style.alignItems = 'center';
        newRow.innerHTML = `
          <select class="productoNC swal2-input" style="width:60%; height:2.5em;">
            ${templateSelect}
          </select>
          <input class="importeNC swal2-input" type="number" placeholder="Importe" style="width:30%;">
          <button class="btnEliminarConcepto" style="background:transparent; color:#b71c1c; border:none;
                  border-radius:5px; padding:4px 8px; cursor:pointer; font-size:18px;">❌</button>
        `;
        newRow.querySelector('.btnEliminarConcepto').addEventListener('click', () => newRow.remove());
        container.appendChild(newRow);
      };

      popup.querySelector('#addConceptoBtn').addEventListener('click', agregarFila);
      container.querySelector('.btnEliminarConcepto').addEventListener('click', (e) => e.target.closest('.concepto-item').remove());

      const switchDiv = popup.querySelector('#monedaSwitch');
      const labelUYU = popup.querySelector('#labelUYU');
      const labelUSD = popup.querySelector('#labelUSD');

      switchDiv.addEventListener('click', () => {
        const isUSD = switchDiv.classList.toggle('usd');
        if (isUSD) {
          labelUSD.classList.add('active');
          labelUYU.classList.remove('active');
          switchDiv.dataset.moneda = 'USD';
        } else {
          labelUYU.classList.add('active');
          labelUSD.classList.remove('active');
          switchDiv.dataset.moneda = 'UYU';
        }
      });
    },
    preConfirm: () => {
      const popup = Swal.getPopup();
      const tipoNC = popup.querySelector('input[name="tipoNC"]:checked')?.value;
      const selectElements = popup.querySelectorAll('.productoNC');
      const importeElements = popup.querySelectorAll('.importeNC');
      const referenciaNC = popup.querySelector('#referenciaNC').value.trim();
      const moneda = popup.querySelector('#monedaSwitch').dataset.moneda || 'UYU';

      if (!tipoNC) {
        Swal.showValidationMessage('Debe seleccionar un tipo de Nota de Crédito');
        return false;
      }

      const conceptos = Array.from(selectElements).map((sel, i) => {
        const value = sel.options[sel.selectedIndex]?.value || '';
        const text = sel.options[sel.selectedIndex]?.text || '';
        const importe = parseFloat(importeElements[i].value);
        return { id_concepto: value, descripcion: text, importe };
      }).filter(c => c.id_concepto && !isNaN(c.importe) && c.importe > 0);

      if (conceptos.length === 0) {
        Swal.showValidationMessage('Debe agregar al menos un concepto con producto e importe válidos');
        return false;
      }

      if (!referenciaNC) {
        Swal.showValidationMessage('Debe ingresar una referencia');
        return false;
      }

      return { tipoNC, conceptos, referenciaNC, moneda };
    },
    showCancelButton: true,
    confirmButtonText: 'Generar N/C',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0a2d54',
    cancelButtonColor: '#0a2d54'
  }).then((result) => {
    if (!result.isConfirmed) return setLoading(false);

    const { tipoNC, conceptos, referenciaNC, moneda } = result.value;
    const importeTotal = conceptos.reduce((acc, c) => acc + c.importe, 0);

    const datosNC = {
      idCliente: selectedCliente.Id,
      fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
      DocsAfectados: '',
      CFEsAfectados: '',
      ImporteTotal: importeTotal,
      CodigoClienteGIA: selectedCliente.CodigoGIA,
      Moneda: moneda,
      Referencia: referenciaNC,
      TipoNC: tipoNC,
      Conceptos: conceptos
    };
    console.log('DatosNc antes del back',datosNC);
    axios.post(`${backURL}/api/insertarNCACUENTA`, datosNC)
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: response.data.wsResultado?.descripcion || 'N/C generada correctamente',
          color: '#0a2d54',
          confirmButtonColor: '#0a2d54'
        }).then(() => {
          if (response.data.pdfBase64) {
            const pdfLink = document.createElement('a');
            pdfLink.href = `data:application/pdf;base64,${response.data.pdfBase64}`;
            const numeroNC = response.data.wsResultado?.datos?.documento?.numeroDocumento || 'NC';
            pdfLink.download = `NC_${numeroNC}.pdf`;
            document.body.appendChild(pdfLink);
            pdfLink.click();
            document.body.removeChild(pdfLink);
          }
          window.location.reload();
        });
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error al generar la N/C',
          text: err.message,
          color: '#0a2d54',
          confirmButtonColor: '#0a2d54'
        });
      })
      .finally(() => setLoading(false));
  });

  return;
}
    // Armar texto con números y series sI NO ES A CUENTA
    const detalles = facturasSeleccionadas
      .map(f => `Número: ${f.NumeroCFE}, Serie: ${f.SerieCFE}`)
      .join('<br>');

    Swal.fire({
      title: 'Confirmar Generación',
      html: `
    <p style="color:#0a2d54; text-align:center;">
      Se generará N/C para las siguientes facturas:
    </p>
    <p style="color:#0a2d54; text-align:center;">
      ${detalles}
    </p>
  `,
      icon: 'question',
      color: '#0a2d54', // color general del texto
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0a2d54', // color botón confirmar
      cancelButtonColor: '#0a2d54',  // color botón cancelar
    }).then((result) => {

      if (result.isConfirmed) {
        const importeTotal = facturasSeleccionadas.reduce(
          (acc, factura) => acc + (parseFloat(factura.TotalCobrar) || 0),
          0
        );
        const datosNC = {
          idCliente: selectedCliente.Id,
          fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
          DocsAfectados: facturasSeleccionadas.map(f => f.Id).join(','), // separadas por coma
          CFEsAfectados: facturasSeleccionadas.map(f => f.NumeroCFE).join(','),
          ImporteTotal: importeTotal,
          CodigoClienteGIA: selectedCliente.CodigoGIA,
          Moneda: facturasSeleccionadas[0]?.Moneda || ''
        };
        console.log("Datos que voy a enviar:", datosNC);
        axios.post(`${backURL}/api/insertarNC`, datosNC)
          .then((response) => {
            // Mostrar mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: response.data.wsResultado?.descripcion || 'N/C generada correctamente',
              color: '#0a2d54',
              confirmButtonColor: '#0a2d54'
            }).then(() => {
              // Si llegó el PDF, generar descarga automática
              if (response.data.pdfBase64) {
                const pdfLink = document.createElement('a');
                pdfLink.href = `data:application/pdf;base64,${response.data.pdfBase64}`;
                const numeroNC = response.data.wsResultado?.datos?.documento?.numeroDocumento || 'NC';
                pdfLink.download = `NC_${numeroNC}.pdf`;
                document.body.appendChild(pdfLink);
                pdfLink.click();
                document.body.removeChild(pdfLink);
              }

              // Finalmente recargar la página si lo deseas
              window.location.reload();
            });
          })
          .catch(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error al generar la N/C',
              text: err.message,
              color: '#0a2d54',
              confirmButtonColor: '#0a2d54'
            });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  };

  // Estado para la búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectEnabled, setIsSelectEnabled] = useState(false);

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
  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    console.log('Cliente desde la base: ', cliente);
    setSearchTerm(cliente.RazonSocial);
    setIsSelectEnabled(true);
    setIsModalOpen(false);

    try {
      setLoadingTabla(true);
      const response = await axios.get(`${backURL}/api/historialfacturacionnc/${cliente.Id}`);
      console.log("Facturas del cliente:", response.data);

      // Si las querés guardar en un estado
      setFacturasCliente(response.data);
      console.log('Estas son las facturas del cliente', response.data);
    } catch (error) {
      console.error("Error al obtener facturas del cliente:", error);
    } finally {
      setLoadingTabla(false);
    }
  };

  // Actualizar el estado del formulario luego se seleccionar un cliente 
  useEffect(() => {
    if (selectedCliente) {
      setFmId(selectedCliente.Id);
      setFmCiudad(selectedCliente.Ciudad);
      setFmPais(selectedCliente.Pais);
      setFmRazonSocial(selectedCliente.RazonSocial);
      setFmTipoIva(selectedCliente.Tiva);
      setFmDireccionFiscal(selectedCliente.Direccion);
      setFmCass(selectedCliente.Cass);
      setFmRutCedula(selectedCliente.Rut);
      setCodigoClienteGIA(selectedCliente.CodigoGIA);


      // 🔁 Limpiar campos de conceptos al cambiar de cliente

    }
  }, [selectedCliente]);

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);
  //Actualización de campos de totales
  useEffect(() => {
    let nuevoSubtotal = 0;
    let nuevoIVA = 0;

    // Recorrer la lista de conceptos y sumar los valores directamente
    fmlistadeconceptos.forEach((concepto) => {
      const importe = parseFloat(concepto.importe) || 0;
      const iva = parseFloat(concepto.ivaCalculado) || 0; // Se asume que ya viene calculado

      nuevoSubtotal += importe;
      nuevoIVA += iva; // Sumar IVA directamente en lugar de calcularlo
    });

    const nuevoTotal = nuevoSubtotal + nuevoIVA;
    const nuevoRedondeo = Math.ceil(nuevoTotal) - nuevoTotal; // Redondeo siempre hacia arriba
    const nuevoTotalACobrar = nuevoTotal + nuevoRedondeo;

    // Actualizar estados
    setFmsubtotal(nuevoSubtotal.toFixed(2));
    setFmIva(nuevoIVA.toFixed(2)); // IVA ahora es la suma directa de los valores fmivaconcepto
    setFmTotal(nuevoTotal.toFixed(2));
    setFmRedondeo(nuevoRedondeo.toFixed(2));
    setFmTotalACobrar(nuevoTotalACobrar.toFixed(2));

  }, [fmlistadeconceptos]); // Se ejecuta cada vez que cambia la lista de conceptos
  const facturasFiltradas = facturasCliente.filter(factura =>
    factura.NumeroCFE.toString().toLowerCase().includes(erdocumentoasociado.toLowerCase())
  );
  useEffect(() => {
    if (encAcuenta === true) {
      setFacturasSeleccionadas([]);
    }
  }, [encAcuenta]);

  return (
    <div className="EmitirFacturaManual-container">
      <ToastContainer />
      {loading && (
        <div className="loading-overlay">
          {/* El spinner se muestra cuando loading es true */}
          <div className="loading-spinner"></div>
        </div>
      )}
      <h2 className='titulo-estandar'>Emisión de Nota de Credito</h2>
      <form className='formulario-estandar'>

        <div className='primerafilaemisiondecomprobantes'>
          <div className='div-datos-comprobante'>
            <h3 className='subtitulo-estandar'>Datos del Comprobante</h3>

            <div className='div-renglon-datos-facturasmanuales'>
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
                <label htmlFor="ecID">Código GIA:</label>
                <input
                  type="text"
                  id="ecID"
                  value={codigoClienteGIA}
                  onChange={(e) => setCodigoClienteGIA(e.target.value)}
                  required
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="fmrazonsocial">Razon Social:</label>
                <input
                  type="text"
                  id="fmrazonsocial"
                  value={fmrazonsocial}
                  onChange={(e) => setFmRazonSocial(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmmoneda">Moneda:</label>
                <select
                  id="ecmoneda"
                  value={fmmoneda}
                  onChange={(e) => setFmMoneda(e.target.value)}
                  required
                >
                  <option value="USD">USD</option>
                  <option value="UYU">UYU</option>
                </select>
              </div>

              <div>
                <label htmlFor="fmdireccionfiscal">Dirección Fiscal:</label>
                <input
                  type="text"
                  id="fmdireccionfiscal"
                  value={fmdireccionfiscal}
                  onChange={(e) => setFmDireccionFiscal(e.target.value)}
                  required
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="fmrutcedula">RUT/Cedula:</label>
                <input
                  type="text"
                  id="fmrutcedula"
                  value={fmrutcedula}
                  onChange={(e) => setFmRutCedula(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="fmcass">Cass:</label>
                <select
                  id="eccass"
                  value={fmcass}
                  onChange={(e) => setFmCass(e.target.value)}
                  required
                >
                  <option value="">Selecciona el Cass</option>
                  <option value="false">No</option>
                  <option value="true">Si</option>
                </select>
              </div>
              <div>
                <label htmlFor="acuenta">A cuenta:</label>
                <select
                  id="acuenta"
                  value={encAcuenta}
                  onChange={(e) => setEncACuenta(e.target.value === "true")}
                  required
                >
                  <option value="">Selecciona si es a cuenta</option>
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
            </div>

          </div>



          <div className='contenedor-tablasNC'>
            <br />
            <h3 className='subtitulo-estandar'>Historial de facturación</h3>
            <div className='div-primerrenglon-datos-recibos2'>
              <div className='contenedor-tabla-historial'>
                {/* Tabla que muestra las facturas agregadas */}
                <table className='tabla-historialfacturacion' >
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Número CFE</th>
                      <th>Serie CFE</th>
                      <th>Tipo de Doc.</th>
                      <th>Importe</th>
                      <th>
                        <div>
                          <input
                            type="text"
                            id="documento"
                            value={erdocumentoasociado}
                            onChange={(e) => setErDocumentoAsociado(e.target.value)}
                            onKeyDown={handleKeyPressDocumento}
                            placeholder='Nro. Comprobante'
                            autoComplete="off"
                            disabled={!searchTerm}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingtabla ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          <div className="loading-spinner">

                          </div>
                        </td>
                      </tr>
                    ) : (
                      facturasFiltradas.map((factura, indexec) => (
                        <tr
                          key={`${indexec}-${encAcuenta}`}
                          onDoubleClick={!encAcuenta ? () => handleAgregarFacturaSeleccionada(factura) : undefined}
                          style={{ cursor: encAcuenta ? 'not-allowed' : 'pointer' }}
                        >
                          <td>{factura.FechaFormateada}</td>
                          <td>{factura.NumeroCFE}</td>
                          <td>{factura.SerieCFE}</td>
                          <td>
                            {factura.TipoDocCFE === 'TCD'
                              ? 'Eticket'
                              : factura.TipoDocCFE === 'TCA'
                                ? 'Eticket CA'
                                : factura.TipoDocCFE === 'FCD'
                                  ? 'Efactura'
                                  : factura.TipoDocCFE === 'FCA'
                                    ? 'Efactura CA'
                                    : factura.TipoDocCFE}
                          </td>
                          <td>{factura.TotalCobrar}</td>
                          <td>{factura.Moneda}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Flecha */}
              <div className="flecha-tables">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#0a2d54" viewBox="0 0 24 24">
                  <path d="M10 17l5-5-5-5v10zM4 17l5-5-5-5v10z" />
                  <path fill="none" d="M0 24V0h24v24H0z" />
                </svg>
              </div>
              <div className='contenedor-tabla-historial'>
                <table className='tabla-historialfacturacion' >
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Número CFE</th>
                      <th>Serie CFE</th>
                      <th>Tipo de Doc.</th>
                      <th>Importe</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasSeleccionadas.map((factura, indexec) => (
                      <tr
                        key={indexec}
                        onClick={() => handleSeleccionarConceptoAsociado(indexec)}
                        style={{
                          cursor: 'pointer' // Indica que la fila es clickeable
                        }}
                      >
                        <td>{factura.FechaFormateada}</td>
                        <td>{factura.NumeroCFE}</td>
                        <td>{factura.SerieCFE}</td>
                        <td>{factura.TipoDocCFE === 'TCD'
                          ? 'Eticket'
                          : factura.TipoDocCFE === 'TCA'
                            ? 'Eticket CA'
                            : factura.TipoDocCFE === 'FCD'
                              ? 'Efactura'
                              : factura.TipoDocCFE === 'FCA'
                                ? 'Efactura CA'
                                : factura.TipoDocCFE}</td>
                        <td>{factura.TotalCobrar} {factura.Moneda}</td>
                        <td>
                          <button
                            className='action-button'
                            type="button"
                            onClick={() => handleEliminarFacturaSeleccionada(factura.NumeroCFE)}
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>



        </div>
        <br />
        <br />


        <div className='botonesemitirnc'>
          <div></div>
          <Link to="/home"><button type="button" className="btn-estandar">Volver</button></Link>
          <button type="button" className='btn-facturar' onClick={handleSubmitAgregarFm}>Generar N/C</button>
          <div></div>
        </div>


      </form>
      {mostrarModalBuscarConcepto && (
        <div className="modal" onClick={() => setMostrarModalBuscarConcepto(false)}>
          <div className="modal-content-conceptos">
            <div className='titulo-estandar'>
              <h2>Buscar concepto</h2>
            </div>

            <p>Seleccioná un concepto de la lista:</p>
            <div className="table-containerSinCobrar">
              <table className="tabla-guiassinfacturar">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Impuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {conceptosEncontrados.map((concepto) => (
                    <tr
                      key={concepto.idconcepto}
                      onClick={() => {
                        setFmCodigoConcepto(concepto.codigo);
                        setFmDescripcion(concepto.descripcion);
                        setConceptoActual(concepto);
                        setMostrarModalBuscarConcepto(false);
                        setBotonActivo(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{concepto.codigo}</td>
                      <td>{concepto.descripcion}</td>
                      <td>{concepto.impuesto === 'iva_basica'
                        ? '22%'
                        : concepto.impuesto === 'iva_minimo'
                          ? '10%'
                          : concepto.impuesto === 'exento'
                            ? 'Exento' : concepto.impuesto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Modal de búsqueda de clientes */}
      <ModalBusquedaClientes
        isOpen={isModalOpen}
        closeModal={closeModal}
        filteredClientes={filteredClientes}
        handleSelectCliente={handleSelectCliente}
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

export default EmitirNC