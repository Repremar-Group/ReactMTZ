import React, { useState, useEffect } from 'react';
import './Ingresodecheque.css'
import { Link } from "react-router-dom";

const Ingresodecheques = ({ isLoggedIn }) => {
    // Estado para los campos del formulario

    const [icnrocheque, setIcNroCheque] = useState('');
    const [icbanco, setIcBanco] = useState('');
    const [icfecha, setIcFecha] = useState('');
    const [ictipoMoneda, setIcTipoMoneda] = useState(false);//*
    const [icarbitraje, setIcArbitraje] = useState('');
    const [icimpdelcheque, setIcImpDelCheque] = useState('');
    const [icimporteendolares, setIcImporteEnDolares] = useState('');
    const [icfechavencimiento, setIcFechavencimiento] = useState('');
    const [ictotaldelasguias, setIcTotalDeLasGuias] = useState('');
    const [ictotalingresado, setIcTotalIngresado] = useState('');
    const [icsaldodelcheque, setIcSaldoDelCheque] = useState('');
    const [icimpdeldocumento, setIcImpDelDocumento] = useState('');
    const [icsaldodeldocumento, setIcSaldoDelDocumento] = useState('');
    const [iclistadecheques, setIcListaDeCheques] = useState([]);



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
        if (icnrocheque && icbanco && icfecha && ictipoMoneda && icimpdelcheque && icfechavencimiento) {
            const nuevocheque = { icfecha, icbanco, icnrocheque, ictipoMoneda, icimpdelcheque, icfechavencimiento };
            setIcListaDeCheques([...iclistadecheques, nuevocheque]);
            setIcNroCheque('');
            setIcBanco('');
            setIcTipoMoneda(false);
            setIcArbitraje('');
            setIcImpDelCheque('');
            setIcImporteEnDolares('');
            setIcFechavencimiento('');
        }
    };

    useEffect(() => {
        const icfechaactual = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
        setIcFecha(icfechaactual);
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
        <div className="IngresarCheque-container">
            <h2 className='Titulo-ingreso-recibos'>Ingreso de Cheques</h2>
            <form onSubmit={handleSubmitAgregarRecibo} className='formulario-emitir-recibo'>

                <div className='primerafilaingresocheques'>
                    <div className='div-datos-cheque'>
                        <h3 className='Titulos-formularios-ingreso-recibos'>Datos del Cheque</h3>

                        <div className='div-primerrenglon-datos-cheque'>
                            <div>
                                <label htmlFor="nrocheque">Nro. de Cheque:</label>
                                <input
                                    type="text"
                                    id="nrocheque"
                                    value={icnrocheque}
                                    onChange={(e) => setIcNroCheque(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="icbanco">Banco:</label>
                                <select
                                    id="icbanco"
                                    value={icbanco}
                                    onChange={(e) => setIcBanco(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona un Banco</option>
                                    <option value="itau">Itau</option>
                                    <option value="santander">Santander</option>
                                    <option value="brou">Brou</option>
                                </select>
                            </div>
                            <div className="fecha-ingreso-cheque">
                                <label htmlFor="fechaingresocheque">Fecha:</label>
                                <input
                                    type="date"
                                    id="fechaingresocheque"
                                    value={icfecha}
                                    onChange={(e) => setIcFecha(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="ictipoMoneda">Moneda:</label>
                                <select
                                    id="ictipoMoneda"
                                    value={ictipoMoneda}
                                    onChange={(e) => setIcTipoMoneda(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona una Moneda</option>
                                    <option value="dolares">Dolares</option>
                                    <option value="pesos">Pesos</option>
                                    <option value="Euros">Euros</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="icarbitraje">Arbitraje:</label>
                                <input
                                    type="text"
                                    id="icarbitraje"
                                    value={icarbitraje}
                                    onChange={(e) => setIcArbitraje(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="icimpdelcheque">Imp. del Cheque:</label>
                                <input
                                    type="text"
                                    id="icimpdelcheque"
                                    value={icimpdelcheque}
                                    onChange={(e) => setIcImpDelCheque(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="icimporteendolares">Importe en USD:</label>
                                <input
                                    type="text"
                                    id="icimporteendolares"
                                    value={icimporteendolares}
                                    onChange={(e) => setIcImporteEnDolares(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="fecha-vencimiento-cheque">
                                <label htmlFor="fechavencimientocheque">Fecha Vencimiento:</label>
                                <input
                                    type="date"
                                    id="fechavencimientocheque"
                                    value={icfechavencimiento}
                                    onChange={(e) => setIcFechavencimiento(e.target.value)}
                                    required
                                />
                            </div>

                        </div>
                        <div className='div-segundorenglon-datos-cheque'>
                            <div className='botonesfacturasasociadas'>
                                <button type="button" className='btn-estandar'>Nuevo</button>
                                <button type="button" className='btn-estandar'>Usar Anterior</button>
                                <button type="button" className='btn-estandar'>Modificar</button>
                                <button type="button" className='btn-eliminar-estandar'>Eliminar</button>
                                <button type="button" onClick={handleAgregarChequeCargado} className='btn-estandar'>Confirmar</button>
                            </div>
                        </div>

                    </div>



                    <div className='div-totales-cheque'>
                        <h3 className='Titulos-formularios-ingreso-recibos'>Totales del Cheque</h3>

                        <div className='div-primerrenglon-datos-recibos'>
                            <div>
                                <label htmlFor="ictotaldelasguias">Total de las Guias:</label>
                                <input
                                    type="text"
                                    id="ictotaldelasguias"
                                    value={ictotaldelasguias}
                                    onChange={(e) => setIcTotalDeLasGuias(e.target.value)}
                                    required
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
                                />
                            </div>
                            <div>
                                <label htmlFor="icsaldodelcheque">Saldo Del Cheque:</label>
                                <input
                                    type="text"
                                    id="icsaldodelcheque"
                                    value={icsaldodelcheque}
                                    onChange={(e) => setIcSaldoDelCheque(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="icimpdeldocumento">Imp. del Documento:</label>
                                <input
                                    type="text"
                                    id="icimpdeldocumento"
                                    value={icimpdeldocumento}
                                    onChange={(e) => setIcImpDelDocumento(e.target.value)}
                                    required
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
                                />
                            </div>


                        </div>
                    </div>

                    <div className='div-tabla-cheque'>
                        <h3 className='Titulos-formularios-ingreso-recibos'>Totales del Cheque</h3>

                        <div className='div-primerrenglon-datos-recibos'>
                            {/* Tabla que muestra las facturas agregadas */}
                            <table className='tabla-cheques' >
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Banco</th>
                                        <th>Nro. de Cheque</th>
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

                    <Link to="/home"><button className="btn-estandar">Volver</button></Link>
                </div>


            </form>
        </div>
    );
}

export default Ingresodecheques