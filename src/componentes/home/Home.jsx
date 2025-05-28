import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, LineChart, Line
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';

const Home = ({ isLoggedIn }) => {
    const [tipoCambio, setTipoCambio] = useState('');
    const [tipoCambioCargado, setTipoCambioCargado] = useState(false);
    const [fechaHoraActual, setFechaHoraActual] = useState('');
    const [fechaActual, setFechaActual] = useState('');
    const [guiasSinFacturar, setGuiasSinFacturar] = useState([]);
    const [facturasSinCobrar, setFacturasSinCobrar] = useState([]);
    const backURL = import.meta.env.VITE_BACK_URL;
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    useEffect(() => {
        const rol = localStorage.getItem('rol');
        if (rol === '') {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const actualizarFechaHora = () => {
            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fecha = ahora.toLocaleDateString('es-ES', opcionesFecha);
            const hora = ahora.toLocaleTimeString('es-ES');
            setFechaHoraActual(`${fecha} - ${hora}`);
            // Formato para MySQL: YYYY-MM-DD
            const yyyy = ahora.getFullYear();
            const mm = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
            const dd = String(ahora.getDate()).padStart(2, '0');
            const fechaMysql = `${yyyy}-${mm}-${dd}`;
            setFechaActual(fechaMysql);
        };
        actualizarFechaHora();
        const intervalo = setInterval(actualizarFechaHora, 1000);
        return () => clearInterval(intervalo);
    }, []);




    useEffect(() => {
        if (!fechaActual) return;

        const FetchTiposDeCambio = async () => {
            try {
                const response = await axios.get(`${backURL}/api/obtenertipocambio`);
                const datos = response.data;

                const [anio, mes, dia] = fechaActual.split('-');
                const fechaFormateada = `${dia}/${mes}/${anio}`; // DD/MM/YYYY

                const tipoCambioHoy = datos.find(item => item.fecha === fechaFormateada);

                if (tipoCambioHoy) {
                    setTipoCambio(tipoCambioHoy.tipo_cambio); // Mostrar el valor
                    setTipoCambioCargado(true); // Marcar como cargado
                } else {
                    setTipoCambio(''); // Asegura campo vacío si no hay valor
                    setTipoCambioCargado(false);
                    toast.error("No se ha cargado el tipo de cambio.");
                }
            } catch (error) {
                console.error('Error al cargar los tipos de cambio:', error);
                toast.error("Error al obtener los tipos de cambio.");
            }
        };

        FetchTiposDeCambio();
    }, [fechaActual]);
    useEffect(() => {

        const obtenerDatos = async () => {
            try {
                const [guiasRes, facturasRes, cierreRes] = await Promise.all([
                    axios.get(`${backURL}/api/guias-sin-facturar`),
                    axios.get(`${backURL}/api/facturas-sin-cobrar`),
                    axios.get(`${backURL}/api/cierre_diario`)
                ]);

                const guiasData = guiasRes.data;
                const facturasData = facturasRes.data;
                const cierreData = cierreRes.data;

                setGuiasSinFacturar(guiasData);
                setFacturasSinCobrar(facturasData);

                const formateado = cierreData.map(item => ({
                    fecha: new Date(item.fecha).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' }),
                    guias: item.guias_sin_facturar,
                    facturas: item.facturas_sin_cobrar
                }));

                // Agregar la entrada de hoy con los datos actuales
                const hoy = new Date().toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' });

                const yaExiste = formateado.some(item => item.fecha === hoy);
                if (!yaExiste) {
                    formateado.push({
                        fecha: hoy,
                        guias: guiasData.length,
                        facturas: facturasData.length
                    });
                }

                setData(formateado);
            } catch (err) {
                console.error('Error al obtener datos:', err);
            }
        };

        obtenerDatos();
    }, []);

    const traerCotizacion = async () => {
        try {
            const response = await axios.post(`${backURL}/cotizaciones-bcu`);
            const cotizacion = response.data.cotizacionMoneda2;

            if (cotizacion) {
                setTipoCambio(cotizacion);

                // Llamamos automáticamente a la función para guardar en la base
                const nuevocambio = { fecha: fechaActual, tipo_cambio: cotizacion };

                const guardarResponse = await axios.post(`${backURL}/api/agregartipocambio`, nuevocambio);
                if (guardarResponse.status === 200) {
                    toast.success('Tipo de cambio guardado correctamente.');
                    setTipoCambioCargado(true);
                }
            } else {
                toast.error('No se encontró cotización para la moneda seleccionada.');
            }
        } catch (error) {
            console.error('Error al obtener o guardar cotización:', error);
            toast.error('Error al obtener o guardar cotización.');
        }
    };

    return (
        <div className="Contenedor_Principal">
            <ToastContainer />
            {/* Navbar */}
            <div className="navbarsuperior">
                <div className="navbar-left">
                    <span>Tipo de Cambio: {tipoCambio ? tipoCambio : '-'}</span>
                    {!tipoCambioCargado && (
                        <button onClick={traerCotizacion}>Buscar Cotización</button>
                    )}
                </div>
                <div className="navbar-right">
                    <span>{fechaHoraActual}</span>
                </div>
            </div>

            {/* Secciones principales */}
            <div className="top-sections">
                {/* Guías sin facturar */}
                <div className="section-box">
                    <h3 className="section-title">Guías sin Facturar</h3>
                    <div className="table-containerSinCobrar">
                        <table className='tabla-guiassinfacturar'>
                            <thead>
                                <tr>
                                    <th>N° Guía</th>
                                    <th>Tipo de Guía</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guiasSinFacturar.length > 0 ? (
                                    guiasSinFacturar.map((guia, index) => (
                                        <tr key={index}>
                                            <td>{guia.numero}</td>
                                            <td>{guia.tipo}</td>
                                            <td>{guia.cliente}</td>
                                            <td>{guia.fecha}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No hay guías pendientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Facturas sin cobrar */}
                <div className="section-box">
                    <h3 className="section-title">Facturas sin Cobrar</h3>
                    <div className="table-containerSinCobrar">
                        <table>
                            <thead>
                                <tr>
                                    <th>N° Factura</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturasSinCobrar.length > 0 ? (
                                    facturasSinCobrar.map((factura, index) => (
                                        <tr key={index}>
                                            <td>{factura.numero}</td>
                                            <td>{factura.cliente}</td>
                                            <td>{factura.fecha}</td>
                                            <td>{factura.monto}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No hay facturas pendientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="graphs-section">
                <div className="graph-box" style={{ width: '100%', maxWidth: '775px', height: 370 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="guias" fill="#8884d8">
                                <LabelList dataKey="guias" position="insideTop" fill="#FFFFFF" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="graph-box" style={{ width: '100%', maxWidth: '775px', height: 370 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="facturas" fill="#82ca9d">
                                <LabelList dataKey="facturas" position="insideTop" fill="#FFFFFF" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Home;
