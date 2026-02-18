import React from 'react';
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "./img/LogoCieloSur.png";

const NavBar = () => {
    const rol = localStorage.getItem('rol');
    return (
        <header className="navbar">
            <Link to="/home" className="logoPagina" title='V 2.1.12 18/02/2026'>
                <img src={logo} alt="Home" />
            </Link>

            <nav className="botonesNavBar">

                {/* Botón de Facturacion con submenú */}
                <div className="botonConSubmenu">
                    <button className="botonNavBar">Facturación</button>
                    <div className="submenu">
                        <Link to="/facturacion/comprobantes" className="submenuItem">Emision de Comprobantes</Link>
                        <Link to="/facturacion/recibos" className="submenuItem">Emisión de Recibos</Link>
                        <Link to="/facturacion/FacturasManuales" className="submenuItem">Facturas Manuales</Link>
                        <Link to="/facturacion/EmitirNC" className="submenuItem">Emisión de N/C</Link>
                        <Link to="/facturacion/BuscarFacturas" className="submenuItem">Buscar Facturas</Link>
                        <Link to="/facturacion/BuscarRecibos" className="submenuItem">Buscar Recibos</Link>
                        <Link to="/facturacion/buscarNC" className="submenuItem">Buscar N/C</Link>
                    </div>
                </div>

                {/* Botón de Reportes con submenú */}
                <div className="botonConSubmenu">
                    <button className="botonNavBar">Reportes</button>
                    <div className="submenu">
                        <Link to="/reportes/impo" className="submenuItem">Embarques Impo</Link>
                        <Link to="/reportespendientes/impo" className="submenuItem">Pendientes Impo</Link>
                        <div className='submenu'>
                            <Link to="/reportes/expo" className="submenuItem">Embarques Expo</Link>
                            <Link to="/reportespendientes/expo" className="submenuItem">Pendientes Expo</Link>
                        </div>

                    </div>
                </div>

                <Link to="/clientes"><button className="botonNavBar">Clientes</button></Link>

                {/* Botón de Guias con submenú */}
                <div className="botonConSubmenu">
                    <button className="botonNavBar">Guias</button>
                    <div className="submenu">
                        <Link to="/guias/buscar" className="submenuItem">Buscar Guias</Link>
                        <Link to="/guias/impo" className="submenuItem">Ingresar Importación</Link>
                        <Link to="/guias/expo" className="submenuItem">Ingresar Exportación</Link>
                    </div>
                </div>

                {/* Botón de Tablas con submenú */}
                <div className="botonConSubmenu">
                    <button className="botonNavBar">Tablas</button>
                    <div className="submenu">
                        <Link to="/tablas/cambio" className="submenuItem">Historial de Cambio</Link>
                        <Link to="/tablas/correlatividad" className="submenuItem">Correlatividad</Link>
                    </div>
                </div>

                <Link to="/deudores"><button className="botonNavBar">Deudores</button></Link>

                {/* Botón de Parametros con submenú */}
                {rol === 'admin' && (
                    <div className="botonConSubmenu">
                        <button className="botonNavBar">Parametros</button>
                        <div className="submenu">
                            <Link to="/parametros/conceptos" className="submenuItem">Conceptos</Link>
                            <Link to="/parametros/monedas" className="submenuItem">Monedas</Link>
                            <Link to="/parametros/ciudades" className="submenuItem">Ciudades</Link>
                            <Link to="/parametros/vuelos" className="submenuItem">Vuelos</Link>
                            <Link to="/parametros/companias_aereas" className="submenuItem">Compañias Aereas</Link>
                            <Link to="/parametros/datosempresa" className="submenuItem">Datos de la Empresa</Link>
                            <Link to="/parametros/usuarios" className="submenuItem">Usuarios</Link>
                            <Link to="/parametros/editarsaldos" className="submenuItem">Saldos</Link>
                        </div>
                    </div>
                )}
                <Link to="/logout"><button className="botonNavBar">Salir</button></Link>
                
            </nav>
            
        </header>
    );
};

export default NavBar;
