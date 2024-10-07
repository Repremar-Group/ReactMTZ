import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from '../navbar/Navbar';
import LoginForm from '../login/LoginForm';
import Home from '../home/Home';

//Importo componentes de Facturacion
import Comprobantes from '../facturacion/comprobantes/Comprobantes'
import Emisionrecibos from '../facturacion/emision_de_recibos/Emisionrecibos';
import Facturasmanuales from '../facturacion/facturas_manuales/Facturasmanuales';

//Importo componentes de Reportes
import Reportesexpo from '../reportes/expo/Reportesexpo';
import Reportesimpo from '../reportes/impo/Reportesimpo';



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
                {/* Ruta por defecto: Redirige al login si no se encuentra la ruta */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

export default Layout;