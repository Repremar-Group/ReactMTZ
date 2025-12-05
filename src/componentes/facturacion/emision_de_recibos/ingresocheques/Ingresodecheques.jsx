import React, { useState, useEffect, useRef } from 'react';
import './Ingresodecheque.css'
import { Link } from "react-router-dom";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ModalAlertaGFE from '../../../modales/AlertasGFE';

const Ingresodecheques = ({ isOpen, closeModal, facturasAsociadas, datosRecibo, fechaActual, totalfacturas, clienteAsociado }) => {
    console.log('Total Facturas: ', totalfacturas, 'Datos del recibo recibidos en modal', datosRecibo);
    useEffect(() => {

        setIcFecha(fechaActual);
        setIcFechavencimiento(fechaActual);
        setIcArbitraje(1);
        setIcImpDelCheque(datosRecibo.erimporte);
        setIcImporteEnDolares(datosRecibo.erimporte);
        setIcClienteGIA(datosRecibo.clienteGIA);
        setIcFormaDePago(datosRecibo.erformadepago)
        const total = Number(totalfacturas) || 0;
        setIcTotalDeLasGuias(parseFloat(total.toFixed(2)));
        setIcSaldoDelDocumento(totalfacturas);
        setIcSaldoDelCheque(totalfacturas)
        setIcTipoMoneda(datosRecibo.ertipoMoneda);
        setACuenta(datosRecibo.aCuenta);
        setIcComentario(datosRecibo.comentario);
        saldoOriginalRef.current = totalfacturas;
    }, [isOpen]); // Se ejecuta solo una vez al montar el componente

    const navigate = useNavigate();
    useEffect(() => {
        const rol = localStorage.getItem('rol');

        if (rol == '') {
            navigate('/');
        }
    }, [navigate]);

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
    const [iccomentario, setIcComentario] = useState('');
    const [icfecha, setIcFecha] = useState('');
    const [aCuenta, setACuenta] = useState('');
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
        if (icnrocheque && icbanco && icfecha && icimpdelcheque && icfechavencimiento && icformadepago) {
            console.log('Valores del cheque, Importe: ', icimporteendolares, ' Saldo del Pago: ', icsaldodeldocumento, 'A cuenta: ', aCuenta, 'Expresion', (icimporteendolares <= icsaldodeldocumento) && !aCuenta);
            const saldoRedondeado = parseFloat(Number(icsaldodeldocumento).toFixed(2));
            if (((icimporteendolares <= saldoRedondeado) && !aCuenta) || aCuenta) {
                const nuevocheque = { icfecha, icformadepago, icbanco, icnrocheque, ictipoMoneda, icimpdelcheque, icfechavencimiento };
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

    const descargarPDF = async (datosRecibo, idrecibo, numrecibo, iclistadecheques = []) => {
        try {
            console.log("Estos son los datos del recibo",datosRecibo)
            const response = await fetch(`${backURL}/api/generarReciboPDF`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...datosRecibo,
                    idrecibo: idrecibo,
                    numrecibo: numrecibo,
                    listadepagos: iclistadecheques
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
    const handleSubmitAgregarRecibo = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Saldo del documento antes de enviar el recibo', icsaldodeldocumento);

        // Permitir el envío si el saldo es 0 o si es aCuenta
        if (icsaldodeldocumento === '0.00' || aCuenta || icsaldodeldocumento === '-0.00') {
            console.log('Estas son las facturas asociadas al Recibo: ', facturasAsociadas);

            try {
                // Solo obtengo las facturas si NO es A Cuenta
                let facturas = [];
                if (!aCuenta) {
                    const idsFacturas = facturasAsociadas.map(factura => factura.erdocumentoasociado);
                    console.log("IDs de facturas a consultar:", idsFacturas);

                    const responsefacturas = await axios.post(`${backURL}/api/obtenerFacturasdesdeRecibo`, { ids: idsFacturas });
                    console.log("Facturas obtenidas:", responsefacturas.data);
                    facturas = responsefacturas.data;
                }
                const importeFinal = datosRecibo.ertipoMoneda === 'UYU'
                    ? Number(datosRecibo.erimporte) / Number(datosRecibo.tipoCambio)
                    : Number(datosRecibo.erimporte);
                // Preparar objeto del recibo
                const nuevoRecibo = {
                    nrorecibo: datosRecibo.ernumrecibo,
                    fecha: datosRecibo.erfecharecibo,
                    idcliente: datosRecibo.erid,
                    clienteGIA: icClienteGIA,
                    nombrecliente: datosRecibo.searchTerm,
                    moneda: datosRecibo.ertipoMoneda,
                    formapago: "-",
                    importe: importeFinal,
                    razonsocial: datosRecibo.errazonSocial,
                    rut: datosRecibo.errut,
                    direccion: datosRecibo.erdireccion,
                    listadepagos: iclistadecheques,
                    facturasAsociadas: facturas, // <-- vacías si es A Cuenta
                    aCuenta: aCuenta,
                    comentario: iccomentario,
                };

                console.log('Datos Recibo antes de insertar en bd', nuevoRecibo);

                // Insertar recibo en BD
                const response = await axios.post(`${backURL}/api/insertrecibo`, nuevoRecibo);
                console.log('Respuesta completa del WS:', response);
                const idrecibo = response.data.idrecibo;
                const numrecibo = response.data.nrorecibo;

                // Actualizar facturas solo si NO es A Cuenta
                if (!aCuenta && facturasAsociadas.length > 0) {
                    await Promise.all(
                        facturasAsociadas.map(async (factura) => {
                            await axios.put(`${backURL}/api/actualizarFactura/${factura.erdocumentoasociado}`, {
                                idrecibo: idrecibo
                            });
                        })
                    );
                }

                // Insertar en cuenta corriente
                const movimientoCuentaCorriente = {
                    idcliente: datosRecibo.erid,
                    fecha: datosRecibo.erfecharecibo,
                    tipodocumento: "Recibo",
                    numerorecibo: numrecibo,
                    moneda: datosRecibo.ertipoMoneda,
                    debe: 0,
                    haber: datosRecibo.erimporte
                };
                await axios.post(`${backURL}/api/insertarCuentaCorriente`, movimientoCuentaCorriente);

                // Impactar recibo y mostrar modal
                try {
                    const impactarResponse = await axios.post(`${backURL}/api/impactarrecibo`, { idrecibo });
                    const respuestaWS = impactarResponse.data;
                    console.log('Respuesta completa del WS:', respuestaWS);

                    setTituloAlertaGfe('Recibo Impactado Correctamente');
                    setmensajeAlertaGFE(JSON.stringify(respuestaWS, null, 2));
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
                //Comleto los datos del recibo con arbitraje y facturas
                datosRecibo.arbitraje = icarbitraje;
                datosRecibo.facturas = facturas;

                // Asignamos totalrecibo según si es aCuenta o no
                if (datosRecibo.aCuenta) {
                    // Suma de los importes de los cheques
                    datosRecibo.totalrecibo = iclistadecheques.reduce(
                        (total, cheque) => total + Number(cheque.icimpdelcheque || 0),
                        0
                    );
                } else {
                    // Total de las guías
                    datosRecibo.totalrecibo = (ictotaldelasguias / datosRecibo.tipoCambio).toFixed(2);
                }
                // Descargar PDF
                await descargarPDF(datosRecibo, idrecibo, numrecibo, iclistadecheques);

            } catch (error) {
                console.error('Error al guardar el recibo:', error);
                toast.error('Error al guardar el recibo');
            } finally {
                setLoading(false);
                   await descargarPDF(datosRecibo, idrecibo, numrecibo, iclistadecheques);
            }

        } else {
            toast.error('Los pagos deben corresponder a exactamente el total de las Guias');
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!isOpen) {
            // Campos individuales
            setIcNroCheque('');
            setIcBanco('');
            setIcFecha(fechaActual);
            setIcTipoMoneda(datosRecibo.ertipoMoneda);
            console.log('Tipo moneda de los pagos', datosRecibo.ertipoMoneda);
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
                <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo'>

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
                                    <label htmlFor="icformapago">Forma Pago:</label>
                                    <select
                                        id="icformapago"
                                        value={icformadepago}
                                        onChange={(e) => setIcFormaDePago(e.target.value)}

                                    >
                                        <option value="">Selecciona una forma</option>
                                        <option value="DOCVZ">CANJE DOCUMENTOS</option>
                                        <option value="CHQDOL">CHEQUE</option>
                                        <option value="EFEDOL">EFECTIVO</option>
                                        <option value="TRANDOL">TRANSFERENCIA</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="icbanco">Banco:</label>
                                    <select
                                        id="icbanco"
                                        value={icbanco}
                                        onChange={(e) => setIcBanco(e.target.value)}

                                    >
                                        <option value="">Selecciona un Banco</option>
                                        <option value="bandes">BANDES</option>
                                        <option value="banqueheritage">BANQUE HERITAGE</option>
                                        <option value="bbva">BBVA</option>
                                        <option value="brou">BROU</option>
                                        <option value="cash">CASH</option>
                                        <option value="citibank">CITI BANK</option>
                                        <option value="comercial">COMERCIAL</option>
                                        <option value="deposito">DEPOSITO</option>
                                        <option value="documentos">DOCUMENTOS</option>
                                        <option value="discount">DISCOUNT</option>
                                        <option value="hsbc">HSBC</option>
                                        <option value="itau">ITAU</option>
                                        <option value="lloydstsb">LLOYDS TSB</option>
                                        <option value="santander">SANTANDER</option>
                                        <option value="scotiabank">SCOTIABANK</option>
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
                                    <label htmlFor="icimpdelcheque">Imp. del Cheque:</label>
                                    <input
                                        type="text"
                                        id="icimpdelcheque"
                                        value={icimpdelcheque}
                                        onChange={(e) => setIcImpDelCheque(e.target.value)}

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
                                    <button type="button" disabled={icsaldodeldocumento === 0 && !aCuenta} onClick={handleAgregarChequeCargado} className='btn-confirmarcheque'>Registrar Pago</button>
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
                                            <th>Forma de pago</th>
                                            <th>Banco</th>
                                            <th>Nro. de Pago</th>

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
                                                <td>{cheque.icformadepago}</td>
                                                <td>{cheque.icbanco}</td>
                                                <td>{cheque.icnrocheque}</td>

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
                        <button type="submit" className='btn-estandar'>Confirmar
                        </button>

                        <button className="btn-estandar" onClick={closeModal} >Volver </button>
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

export default Ingresodecheques