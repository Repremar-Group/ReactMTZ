import React from 'react'
import "./Navbar.css"
import { Link } from "react-router-dom"
import logo from "./img/LogoCieloSur.png"

//Creo el componente.
const NavBar = () => {

    return (

        <header className="navbar">
            <Link to="/home" className="logoPagina">
            <img src={logo} alt="Home" />
            </Link>

            <nav className="botonesNavBar">

                <Link to="/facturacion"><button className="botonNavBar">Facturación</button></Link>

                <Link to="/reportes"><button className="botonNavBar">Reportes</button></Link>

                <Link to="/clientes"><button className="botonNavBar">Clientes</button></Link>

                <Link to="/guias"><button className="botonNavBar">Guias</button></Link>

                <Link to="/tablas"><button className="botonNavBar">Tablas</button></Link>

                <Link to="/deudores"><button className="botonNavBar">Deudores</button></Link>

                <Link to="/logout"><button className="botonNavBar">Salir</button></Link>

            </nav>

        </header>


    )
}

//Exporto el componente.
export default NavBar
