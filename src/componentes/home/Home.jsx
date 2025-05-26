import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

const Home = ({ isLoggedIn }) => {
    const [tipoCambio, setTipoCambio] = useState('');
    const [fechaHoraActual, setFechaHoraActual] = useState('');
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
        axios.get(`${backURL}/api/guias-sin-facturar`)
            .then(res => setGuiasSinFacturar(res.data))
            .catch(err => console.error(err));

        axios.get(`${backURL}/api/facturas-sin-cobrar`)
            .then(res => setFacturasSinCobrar(res.data))
            .catch(err => console.error(err));

        axios.get(`${backURL}/api/cierre_diario`) // cambia esto por tu endpoint real
            .then((res) => {
                const formateado = res.data.map(item => ({
                    fecha: new Date(item.fecha).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' }),
                    guias: item.guias_sin_facturar,
                    facturas: item.facturas_sin_cobrar
                }));
                setData(formateado);
            })
            .catch((err) => console.error('Error al obtener datos de cierre diario:', err));
    }, []);

    useEffect(() => {
        const actualizarFechaHora = () => {
            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fecha = ahora.toLocaleDateString('es-ES', opcionesFecha);
            const hora = ahora.toLocaleTimeString('es-ES');
            setFechaHoraActual(`${fecha} - ${hora}`);
        };
        actualizarFechaHora();
        const intervalo = setInterval(actualizarFechaHora, 1000);
        return () => clearInterval(intervalo);
    }, []);

    const handleGuardarTipoCambio = () => {
        axios.post(`${backURL}/api/tipo-cambio`, { tipoCambio })
            .then(() => alert('Tipo de cambio guardado'))
            .catch(err => console.error(err));
    };

    return (
        <div className="Contenedor_Principal">
            {/* Navbar */}
            <div className="navbarsuperior">
                <div className="navbar-left">
                    <span>Tipo de Cambio:</span>
                    <input
                        type="number"
                        value={tipoCambio}
                        onChange={(e) => setTipoCambio(e.target.value)}
                        placeholder="Ej: 1000.50"
                    />
                    <button onClick={handleGuardarTipoCambio}>Guardar</button>
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
                    <div className="table-containerguiassinfacturar">
                        <table className='tabla-guiassinfacturar'>
                            <thead>
                                <tr>
                                    <th>N° Guía</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guiasSinFacturar.length > 0 ? (
                                    guiasSinFacturar.map((guia, index) => (
                                        <tr key={index}>
                                            <td>{guia.numero}</td>
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
