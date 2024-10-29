import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import Alertas from '../../modales/Alertas';

const AgregarUsuario = () => {
    // Estados para los campos del formulario
    const [usuario, setUsuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [rol, setRol] = useState('');
    const [mostrarContraseña, setMostrarContraseña] = useState(false); // Estado para mostrar/ocultar contraseña
    const [alertasVisible, setAlertasVisible] = useState(false);
    const [alertasMessage, setAlertasMessage] = useState('');
    const navigate = useNavigate();

    // Manejar envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevoUsuario = {
            usuario,
            contraseña,
            rol
        };

        // Realizar solicitud POST a la API
        axios.post('http://localhost:3000/api/insertusuarios', nuevoUsuario)
            .then(response => {
                setAlertasMessage('Usuario agregado exitosamente');
                setAlertasVisible(true);
                setTimeout(() => {
                    setAlertasVisible(false);
                    navigate('/usuarios');
                }, 2000);
            })
            .catch(error => {
                alert('Error al agregar el usuario');
                console.error(error);
            });
    };

    return (
        <div className="estandar-container">
            <form onSubmit={handleSubmit} className='formulario-estandar'>
                <h2 className='titulo-estandar'>Agregar Usuario</h2>

                <div className='input-group'>
                    <label htmlFor="usuario">Usuario:</label>
                    <input
                        type="text"
                        id="usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />
                </div>

                <div className='input-group'>
                    <label htmlFor="contraseña">Contraseña:</label>
                    <input
                        type={mostrarContraseña ? "text" : "password"} // Cambia el tipo de input según el estado
                        id="contraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        required
                    />
                    <div className='checkbox-estandar'>
                        <label htmlFor="mostrarContraseña">Mostrar Contraseña</label>
                        <input
                            type="checkbox"
                            id="mostrarContraseña"
                            checked={mostrarContraseña}
                            onChange={(e) => setMostrarContraseña(e.target.checked)}
                        />

                    </div>
                </div>

                <div className='input-group'>
                    <label htmlFor="rol">Rol:</label>
                    <select
                        id="rol"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        required
                    >
                        <option value="">Selecciona un Rol</option>
                        <option value="admin">Administrador</option>
                        <option value="usuario">Usuario</option>
                    </select>
                </div>

                <button type="submit" className='btn-estandar'>Agregar Usuario</button>
                <Link to="/reportes/usuarios"><button type="button" className="btn-estandar">Volver</button></Link>
            </form>

            {alertasVisible && <Alertas message={alertasMessage} onClose={()=> navigate('/parametros/usuarios')} />}
        </div>
    );
}

export default AgregarUsuario;
