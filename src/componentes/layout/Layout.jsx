import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from '../navbar/Navbar';
import LoginForm from '../login/LoginForm';
import Home from '../home/Home';

//Importo componentes de Facturacion
import Comprobantes from '../facturacion/comprobantes/Comprobantes'
import Emisionrecibos from '../facturacion/emision_de_recibos/Emisionrecibos';
import Ingresodecheques from '../facturacion/emision_de_recibos/ingresocheques/Ingresodecheques';
import Facturasmanuales from '../facturacion/facturas_manuales/Facturasmanuales';

//Importo componentes de Reportes
import Reportespendientesexpo from '../reportes/expo/Reportespendientesexpo';
import Reportespendientesimpo from '../reportes/impo/Reportespendientesimpo';
import Reportesexpo from '../reportes/expo/Reportesexpo';
import Reportesimpo from '../reportes/impo/Reportesimpo';

//Importo componente Clientes
import Clientes from '../clientes/Clientes';

//Importo componentes de Guias
import Guiasimpo from '../guias/impo/Guiasimpo';
import Guiasexpo from '../guias/expo/Guiasexpo';

//Importo componentes de Tablas
import Historialdecambios from '../tablas/historialdecambios/Historialdecambios';
import Correlatividad from '../tablas/correlatividad/Correlatividad';

//Importo componente Deudores
import Deudores from '../deudores/Deudores';

//Importo componente AgregarCliente
import AgregarCliente from '../clientes/agregar/AgregarCliente';

function Layout({ isLoggedIn, handleLogin }) {
    const location = useLocation();

    return (
        <>
            {/* Mostrar NavBar solo si no estamos en la página de login */}
            {location.pathname !== '/' && <NavBar />}

            <Routes>
                {/* Ruta de inicio de sesión */}
                <Route path="/" element={<LoginForm onLoginSuccess={handleLogin} />} />

                {/* Ruta home: Solo accesible si el usuario está logueado */}
                <Route
                    path="/home"
                    element={
                        isLoggedIn ? (
                            <Home isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta comprobantes: Solo accesible si el usuario está logueado */}
                <Route
                    path="/facturacion/comprobantes"
                    element={
                        isLoggedIn ? (
                            <Comprobantes isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta emision de recibos: Solo accesible si el usuario está logueado */}
                <Route
                    path="/facturacion/recibos"
                    element={
                        isLoggedIn ? (
                            <Emisionrecibos isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                {/* Ruta registro de cheques: Solo accesible si el usuario está logueado */}
                <Route
                    path="/facturacion/recibos/ingresocheques"
                    element={
                        isLoggedIn ? (
                            <Ingresodecheques isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                {/* Ruta Facturas Manuales: Solo accesible si el usuario está logueado */}
                <Route
                    path="/facturacion/FacturasManuales"
                    element={
                        isLoggedIn ? (
                            <Facturasmanuales isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Reportes Impo: Solo accesible si el usuario está logueado */}
                <Route
                    path="/reportespendientes/impo"
                    element={
                        isLoggedIn ? (
                            <Reportespendientesimpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Reportes Expo: Solo accesible si el usuario está logueado */}
                <Route
                    path="/reportespendientes/expo"
                    element={
                        isLoggedIn ? (
                            <Reportespendientesexpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                                {/* Ruta Reportes Impo: Solo accesible si el usuario está logueado */}
                                <Route
                    path="/reportes/impo"
                    element={
                        isLoggedIn ? (
                            <Reportesimpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Reportes Expo: Solo accesible si el usuario está logueado */}
                <Route
                    path="/reportes/expo"
                    element={
                        isLoggedIn ? (
                            <Reportesexpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Clientes: Solo accesible si el usuario está logueado */}
                <Route
                    path="/clientes"
                    element={
                        isLoggedIn ? (
                            <Clientes isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />
                {/* Ruta Agregar Clientes: Solo accesible si el usuario está logueado */}
                <Route
                    path="/clientes/agregar"
                    element={
                        isLoggedIn ? (
                            <AgregarCliente isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Guias Impo: Solo accesible si el usuario está logueado */}
                <Route
                    path="/guias/impo"
                    element={
                        isLoggedIn ? (
                            <Guiasimpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Guias Expo: Solo accesible si el usuario está logueado */}
                <Route
                    path="/guias/expo"
                    element={
                        isLoggedIn ? (
                            <Guiasexpo isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Historial de cambio: Solo accesible si el usuario está logueado */}
                <Route
                    path="/tablas/cambio"
                    element={
                        isLoggedIn ? (
                            <Historialdecambios isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Correlatividad: Solo accesible si el usuario está logueado */}
                <Route
                    path="/tablas/correlatividad"
                    element={
                        isLoggedIn ? (
                            <Correlatividad isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta Deudores: Solo accesible si el usuario está logueado */}
                <Route
                    path="/deudores"
                    element={
                        isLoggedIn ? (
                            <Deudores isLoggedIn={isLoggedIn} />
                        ) : (
                            <Navigate to="/" /> // Redirige al login si no está autenticado
                        )
                    }
                />

                {/* Ruta por defecto: Redirige al login si no se encuentra la ruta */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default Layout;
