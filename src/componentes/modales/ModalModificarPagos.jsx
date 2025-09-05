import React, { useState, useEffect, useRef } from 'react';

import { Link } from "react-router-dom";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ModalAlertaGFE from './AlertasGFE';

const ModalModificarPago = ({ isOpen, closeModal, facturasAsociadas, datosRecibo, fechaActual, totalfacturas, clienteAsociado, pagosActuales }) => {
    console.log('Total Facturas: ', totalfacturas, 'Datos del recibo recibidos en modal', datosRecibo, 'Estos son los pagos', pagosActuales);
    useEffect(() => {

        setIcFecha(fechaActual);
        setIcFechavencimiento(fechaActual);
        setIcArbitraje(1);
        setIcImpDelCheque(datosRecibo.erimporte);
        setIcImporteEnDolares(datosRecibo.erimporte);
        setIcClienteGIA(datosRecibo.clienteGIA);
        setIcFormaDePago(datosRecibo.erformadepago)
        setIcTotalDeLasGuias(totalfacturas);
        setIcSaldoDelDocumento(totalfacturas);
        setIcSaldoDelCheque(totalfacturas)
        setIcTipoMoneda(datosRecibo.ertipoMoneda);
        saldoOriginalRef.current = totalfacturas;
    }, [isOpen]); // Se ejecuta solo una vez al montar el componente

    const navigate = useNavigate();
    useEffect(() => {
        const rol = localStorage.getItem('rol');

        if (rol == '') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (isOpen && pagosActuales?.length > 0) {
            const chequesIniciales = pagosActuales.map((pago) => ({
                icfecha: pago.fecha ? pago.fecha.split("T")[0] : "",
                icbanco: pago.banco || "",
                icnrocheque: pago.nro_pago || "",
                ictipoMoneda: pago.moneda || "USD",
                icarbitraje: pago.arbitraje || 1,
                icimpdelcheque: pago.importe || 0,
                icimporteendolares: pago.importe || 0,
                icfechavencimiento: pago.fechavencimiento
                    ? pago.fechavencimiento.split("T")[0]
                    : ""
            }));

            setIcListaDeCheques(chequesIniciales);
        }
    }, [isOpen, pagosActuales]);
    // Estado para los campos del formulario

    const backURL = import.meta.env.VITE_BACK_URL;
    const [monedas, setMonedas] = useState([]);
    const [isFetchedMonedas, setIsFetchedMonedas] = useState(false);

    const [isModalOpenAlertaGFE, setIsModalOpenAlertaGFE] = useState(false);
    const [tituloAlertaGfe, setTituloAlertaGfe] = useState('');
    const [mensajeAlertaGFE, setmensajeAlertaGFE] = useState('');
    const [iconoAlertaGFE, setIconoAlertaGFE] = useState('');
    const handleConfirmAlertaGFE = () => {
        setIsModalOpenAlertaGFE(false);
        window.location.reload();
    };


    const [icnrocheque, setIcNroCheque] = useState('');
    const [icClienteGIA, setIcClienteGIA] = useState('');
    const [icbanco, setIcBanco] = useState('');
    const [icfecha, setIcFecha] = useState('');

    const [ictipoMoneda, setIcTipoMoneda] = useState('USD');//*
    const [isModalTipoCambioAbierto, setIsModalTipoCambioAbierto] = useState(false);
    const [tipoCambio, setTipoCambio] = useState(null);

    const [icarbitraje, setIcArbitraje] = useState('');
    const [icimpdelcheque, setIcImpDelCheque] = useState('');
    const [icimporteendolares, setIcImporteEnDolares] = useState('');
    const [icfechavencimiento, setIcFechavencimiento] = useState('');
    const [ictotaldelasguias, setIcTotalDeLasGuias] = useState('');
    const [ictotalingresado, setIcTotalIngresado] = useState(0);
    const [icsaldodelcheque, setIcSaldoDelCheque] = useState(0);
    const [icformadepago, setIcFormaDePago] = useState('');
    const [icimpdeldocumento, setIcImpDelDocumento] = useState('');
    const [icsaldodeldocumento, setIcSaldoDelDocumento] = useState('');
    const [iclistadecheques, setIcListaDeCheques] = useState([]);
    const saldoOriginalRef = useRef(icsaldodeldocumento);


    // Estado para la cheque seleccionado
    const [icchequeseleccionado, setIcChequeSeleccionado] = useState(null);

    // Función para seleccionar una factura al hacer clic en una fila
    const handleSeleccionarChequeLista = (icindex) => {
        setIcChequeSeleccionado(icindex);
    };



    // Función para eliminar el cheque seleccionado
    const handleEliminarChequeCargado = () => {
        if (icchequeseleccionado !== null) {
            // Filtrar todos los cheques excepto el seleccionado
            const nuevoschequesseleccionados = iclistadecheques.filter((_, icindex) => icindex !== icchequeseleccionado);
            setIcListaDeCheques(nuevoschequesseleccionados);
            setIcChequeSeleccionado(null); // Limpiar la selección
        }
    };
    // Función para agregar una factura asociada a la tabla
    const handleAgregarChequeCargado = () => {
        console.log('Validando Cheque con estos datos: ', icnrocheque, icbanco, icfecha, ictipoMoneda, icarbitraje, icimpdelcheque, icimporteendolares, icfechavencimiento)
        if (icnrocheque && icbanco && icfecha && ictipoMoneda && icarbitraje && icimpdelcheque && icimporteendolares && icfechavencimiento) {
            console.log('Valores del cheque, Importe: ', icimporteendolares, ' Saldo del Pago: ', icsaldodelcheque);
            if (icimporteendolares <= icsaldodeldocumento) {
                const nuevocheque = { icfecha, icbanco, icnrocheque, ictipoMoneda, icimpdelcheque, icfechavencimiento };
                setIcListaDeCheques([...iclistadecheques, nuevocheque]);
                setIcNroCheque('');
                setIcImpDelCheque('');
                setIcImporteEnDolares('');
            } else {
                toast.error('No se puede ingresar un pago con un monto mayor al saldo del pago.')
            }

        } else {
            toast.error('Debes completar todos los campos para agregar el pago');
        }
    };

    useEffect(() => {
        const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
        setIcFecha(icfechaactual);
    }, []); // Se ejecuta solo una vez al montar el componente
    //UseEffect para actualizar los totales de los pagos 
    useEffect(() => {
        const totalImportes = iclistadecheques.reduce((total, cheque) => total + parseFloat(cheque.icimpdelcheque || 0), 0);
        setIcTotalIngresado(totalImportes);
        setIcSaldoDelDocumento((saldoOriginalRef.current - totalImportes).toFixed(2));
        setIcSaldoDelCheque((totalImportes - totalfacturas).toFixed(2));
    }, [iclistadecheques]); // Se ejecuta solo una vez al montar el componente

    const descargarPDF = async (datosRecibo, idrecibo) => {
        try {
            const response = await fetch(`${backURL}/api/generarReciboPDF`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...datosRecibo,
                    idrecibo: idrecibo
                })
            });

            if (!response.ok) throw new Error('Error al generar el PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Recibo_${datosRecibo.ernumrecibo}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success('PDF descargado correctamente');
        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            toast.error('Error al descargar el PDF');
        }
    };
    const [loading, setLoading] = useState(false);
    // Función para manejar el envío del formulario
const handleSubmitRecibo = async (e) => {
  e.preventDefault();
  setLoading(true);

  console.log('Saldo del documento antes de enviar el recibo', icsaldodeldocumento);

  if (icsaldodeldocumento !== '0.00') {
    toast.error('Los pagos deben corresponder a exactamente el total de las Guias');
    setLoading(false);
    return;
  }

  try {
    // 🔸 Traer facturas asociadas
    const idsFacturas = facturasAsociadas.map(f => f.erdocumentoasociado);
    console.log("IDs de facturas a consultar:", idsFacturas);

    const responsefacturas = await axios.post(`${backURL}/api/obtenerFacturasdesdeRecibo`, { ids: idsFacturas });
    console.log("Facturas obtenidas:", responsefacturas.data);

    datosRecibo.facturas = responsefacturas.data;
    datosRecibo.listadepagos = iclistadecheques;
    datosRecibo.arbitraje = icarbitraje;
    datosRecibo.totalrecibo = ictotaldelasguias;

    // 🔸 Armar objeto recibo
    const reciboPayload = {
      nrorecibo: datosRecibo.ernumrecibo,
      fecha: datosRecibo.erfecharecibo,
      idcliente: datosRecibo.erid,
      clienteGIA: icClienteGIA,
      nombrecliente: datosRecibo.searchTerm,
      moneda: datosRecibo.ertipoMoneda,
      formapago: datosRecibo.erformadepago,
      importe: datosRecibo.erimporte,
      razonsocial: datosRecibo.errazonSocial,
      rut: datosRecibo.errut,
      direccion: datosRecibo.erdireccion,
      listadepagos: datosRecibo.listadepagos,
      facturasAsociadas: datosRecibo.facturas
    };

    let idrecibo, numrecibo;

    // ✅ INSERTAR o ACTUALIZAR según corresponda
    if (!datosRecibo.idrecibo) {
      console.log('Insertando nuevo recibo...', reciboPayload);

      const response = await axios.post(`${backURL}/api/insertrecibo`, reciboPayload);
      idrecibo = response.data.idrecibo;
      numrecibo = response.data.nrorecibo;
      console.log('Nuevo recibo insertado:', response.data);

    } else {
      console.log('Actualizando recibo existente...', reciboPayload);

      await axios.put(`${backURL}/api/actualizarRecibo/${datosRecibo.idrecibo}`, reciboPayload);
      idrecibo = datosRecibo.idrecibo;
      numrecibo = datosRecibo.ernumrecibo;
    }

    // 🔸 Actualizar facturas asociadas
    if (facturasAsociadas.length > 0) {
      await Promise.all(
        facturasAsociadas.map(async (factura) => {
          await axios.put(`${backURL}/api/actualizarFactura/${factura.erdocumentoasociado}`, {
            idrecibo
          });
        })
      );
    }

    // 🔸 Insertar/actualizar en cuenta corriente
    const movimientoCuentaCorriente = {
      idcliente: datosRecibo.erid,
      fecha: datosRecibo.erfecharecibo,
      tipodocumento: "Recibo",
      numerorecibo: numrecibo,
      moneda: datosRecibo.ertipoMoneda,
      debe: 0,
      haber: datosRecibo.erimporte
    };

    if (!datosRecibo.idrecibo) {
      await axios.post(`${backURL}/api/insertarCuentaCorriente`, movimientoCuentaCorriente);
    } else {
      await axios.put(`${backURL}/api/actualizarCuentaCorriente/${numrecibo}`, movimientoCuentaCorriente);
    }

    // 🔸 Impactar recibo
    try {
      const impactarResponse = await axios.post(`${backURL}/api/impactarrecibo`, { idrecibo });
      console.log('Respuesta impacto:', impactarResponse.data);

      setTituloAlertaGfe('Recibo Impactado Correctamente');
      setmensajeAlertaGFE(JSON.stringify(impactarResponse.data, null, 2));
      setIconoAlertaGFE('success');
      setIsModalOpenAlertaGFE(true);

    } catch (impactarError) {
      const errorData = impactarError.response?.data || { mensaje: impactarError.message };
      console.error('Error al impactar recibo:', errorData);

      setTituloAlertaGfe('Error al Impactar el Recibo');
      setmensajeAlertaGFE(JSON.stringify(errorData, null, 2));
      setIconoAlertaGFE('error');
      setIsModalOpenAlertaGFE(true);
    }

    // 🔸 Descargar PDF
    await descargarPDF(datosRecibo, idrecibo);

  } catch (error) {
    console.error('Error en operación de recibo:', error);
    toast.error('Error al procesar el recibo');
  } finally {
    setLoading(false);
  }
};
    useEffect(() => {
        if (!isOpen) {
            // Campos individuales
            setIcNroCheque('');
            setIcBanco('');
            setIcFecha(fechaActual);
            setIcTipoMoneda('USD');
            setIcArbitraje('1');
            setIcImpDelCheque('');
            setIcImporteEnDolares('');
            setIcFechavencimiento(fechaActual);

            // Totales y saldos
            setIcTotalDeLasGuias('');
            setIcTotalIngresado(0);
            setIcSaldoDelCheque(0);
            setIcImpDelDocumento('');
            setIcSaldoDelDocumento('');

            // Tabla y selección
            setIcListaDeCheques([]);
            setIcChequeSeleccionado(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal" onClick={closeModal}>
            <ToastContainer />
            <div className="modal-content-ingresodepagos" onClick={(e) => e.stopPropagation()}>
                {loading && (
                    <div className="loading-overlay">
                        {/* El spinner se muestra cuando loading es true */}
                        <div className="loading-spinner"></div>
                    </div>
                )}
                <h2 className='Titulo-ingreso-recibos'>Ingreso de Pagos</h2>
                <form onSubmit={handleSubmitRecibo} className='formulario-emitir-recibo'>

                    <div className='primerafilaingresocheques'>
                        <div className='div-datos-cheque'>
                            <h3 className='Titulos-formularios-ingreso-recibos'>Datos del Pago</h3>

                            <div className='div-primerrenglon-datos-cheque'>
                                <div>
                                    <label htmlFor="nrocheque">Nro. de Pago:</label>
                                    <input
                                        type="text"
                                        id="nrocheque"
                                        value={icnrocheque}
                                        onChange={(e) => setIcNroCheque(e.target.value)}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="icbanco">Banco:</label>
                                    <select
                                        id="icbanco"
                                        value={icbanco}
                                        onChange={(e) => setIcBanco(e.target.value)}

                                    >
                                        <option value="">Selecciona un Banco</option>
                                        <option value="itau">Itau</option>
                                        <option value="santander">Santander</option>
                                        <option value="brou">Brou</option>
                                        <option value="giro">Giro</option>
                                    </select>
                                </div>
                                <div className="fecha-ingreso-cheque">
                                    <label htmlFor="fechaingresocheque">Fecha:</label>
                                    <input
                                        type="date"
                                        id="fechaingresocheque"
                                        value={icfecha}
                                        onChange={(e) => setIcFecha(e.target.value)}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="ecmoneda">Moneda:</label>
                                    <select
                                        id="ecmoneda"
                                        value={ictipoMoneda}
                                        onChange={(e) => setIcTipoMoneda(e.target.value)}

                                    >
                                        <option value="">Selecciona una Moneda</option>
                                        <option value="USD">USD</option>
                                        <option value="UYU">UYU</option>

                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="icarbitraje">Arbitraje:</label>
                                    <input
                                        type="text"
                                        id="icarbitraje"
                                        value={icarbitraje}
                                        onChange={(e) => setIcArbitraje(e.target.value)}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="icimpdelcheque">Imp. del Cheque:</label>
                                    <input
                                        type="text"
                                        id="icimpdelcheque"
                                        value={icimpdelcheque}
                                        onChange={(e) => setIcImpDelCheque(e.target.value)}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="icimporteendolares">Importe en USD:</label>
                                    <input
                                        type="text"
                                        id="icimporteendolares"
                                        value={icimporteendolares}
                                        onChange={(e) => setIcImporteEnDolares(e.target.value)}

                                    />
                                </div>
                                <div className="fecha-vencimiento-cheque">
                                    <label htmlFor="fechavencimientocheque">Vencimiento:</label>
                                    <input
                                        type="date"
                                        id="fechavencimientocheque"
                                        value={icfechavencimiento}
                                        onChange={(e) => setIcFechavencimiento(e.target.value)}

                                    />
                                </div>
                                <div className='contenedorbotonconfirmarcheque'>
                                    <br />
                                    <button type="button" disabled={icsaldodeldocumento === 0} onClick={handleAgregarChequeCargado} className='btn-confirmarcheque'>Confirmar</button>
                                </div>

                            </div>


                        </div>



                        <div className='div-totales-cheque'>
                            <h3 className='Titulos-formularios-ingreso-recibos'>Totales del Pago</h3>

                            <div className='div-primerrenglon-datos-recibos'>
                                <div>
                                    <label htmlFor="ictotaldelasguias">Total de las Guias:</label>
                                    <input
                                        type="text"
                                        id="ictotaldelasguias"
                                        value={ictotaldelasguias}
                                        onChange={(e) => setIcTotalDeLasGuias(e.target.value)}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ictotalingresado">Total Ingresado:</label>
                                    <input
                                        type="text"
                                        id="ictotalingresado"
                                        value={ictotalingresado}
                                        onChange={(e) => setIcTotalIngresado(e.target.value)}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="icsaldodelcheque">Saldo Del Pago:</label>
                                    <input
                                        type="text"
                                        id="icsaldodelcheque"
                                        value={icsaldodelcheque}
                                        onChange={(e) => setIcSaldoDelCheque(e.target.value)}
                                        required
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label htmlFor="icsaldodeldocumento">Saldo del Documento:</label>
                                    <input
                                        type="text"
                                        id="icsaldodeldocumento"
                                        value={icsaldodeldocumento}
                                        onChange={(e) => setIcSaldoDelDocumento(e.target.value)}
                                        required
                                        readOnly
                                    />
                                </div>


                            </div>
                        </div>

                        <div className='div-tabla-cheque'>
                            <h3 className='Titulos-formularios-ingreso-recibos'>Medios de Pago</h3>

                            <div className='contenedor-tabla-cheques'>
                                {/* Tabla que muestra las facturas agregadas */}
                                <table className='tabla-cheques' >
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Banco</th>
                                            <th>Nro. de Pago</th>
                                            <th>Moneda</th>
                                            <th>Importe</th>
                                            <th>Vencimiento</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {iclistadecheques.map((cheque, indexic) => (
                                            <tr
                                                key={indexic}
                                                onClick={() => handleSeleccionarChequeLista(indexic)}
                                                style={{
                                                    cursor: 'pointer' // Indica que la fila es clickeable
                                                }}
                                            >
                                                <td>{cheque.icfecha}</td>
                                                <td>{cheque.icbanco}</td>
                                                <td>{cheque.icnrocheque}</td>
                                                <td>{cheque.ictipoMoneda}</td>
                                                <td>{cheque.icimpdelcheque}</td>
                                                <td>{cheque.icfechavencimiento}</td>
                                                <td><button type="button" className="action-button" onClick={handleEliminarChequeCargado} disabled={icchequeseleccionado !== indexic}>❌</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>


                            </div>
                        </div>

                    </div>



                    <div className='botonesagregarcheque'>
                        <button type="submit" className='btn-estandar'>Confirmar</button>


                    </div>


                </form>

                <ModalAlertaGFE
                    isOpen={isModalOpenAlertaGFE}
                    title={tituloAlertaGfe}
                    message={mensajeAlertaGFE}
                    onConfirm={handleConfirmAlertaGFE}
                    iconType={iconoAlertaGFE}
                />

            </div>
        </div>
    );
}

export default ModalModificarPago