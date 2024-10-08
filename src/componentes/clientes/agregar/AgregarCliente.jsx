import React, { useState } from 'react';
import './agregarcliente.css';
import { Link } from "react-router-dom";

const AgregarCliente = ({ isLoggedIn }) => {
    // Estado para los campos del formulario
    const [razonSocial, setRazonSocial] = useState('');
    const [rut, setRut] = useState('');
    const [id, setID] = useState('');
    const [pais, setPais] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');

    // Función para manejar el envío del formulario
    const handleSubmitAgregarUsuario = (e) => {
        e.preventDefault();
        // Aquí puedes manejar la lógica para enviar la información
        console.log({
           razonSocial
        });
    };
    return (
        <div className="AgregarCliente-container">
            <form onSubmit={handleSubmitAgregarUsuario} className='formulario-agregar-cliente'>
                <h2>Agregar Cliente</h2>
                <div className='div_razonsocial_agregar'>
                    <label htmlFor="razonsocial">Razon Social:</label>
                    <input
                        type="text"
                        id="razonsocial"
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="rut">Rut:</label>
                    <input
                        type="number"
                        id="rut"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="id">ID:</label>
                    <input
                        type="text"
                        id="id"
                        value={id}
                        onChange={(e) => setID(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="pais">País:</label>
                    <input
                        type="text"
                        id="pais"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="mail"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="tel">Tel:</label>
                    <input
                        type="text"
                        id="tel"
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className='btn-agregar-cliente'>Agregar Cliente</button>

                <div>
                <Link to="/clientes"><button className="btn-Salir-Agregar-Cliente">Volver</button></Link>
                </div>
            </form>
        </div>
    );
}

export default AgregarCliente