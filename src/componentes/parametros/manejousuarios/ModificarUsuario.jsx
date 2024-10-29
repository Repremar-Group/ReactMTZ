import React, { useState, useEffect } from 'react';
import './modificarusuario.css';
import axios from 'axios';

const ModificarUsuario = ({ closeModal, id }) => {
    if (!id) return null; // No muestra nada si no hay usuario seleccionado

    // Estado para los campos de usuario
    const [usuario, setUsuario] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [rol, setRol] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3000/api/actualizarusuario/${id}`, {
                usuario,
                contraseña,
                rol
            });
            alert(response.data.message); // Mensaje de éxito
            closeModal(); // Cierra el modal después de modificar
        } catch (error) {
            console.error('Error:', error);
            alert('Error al modificar el usuario');
        }
    };

    // Obtiene los datos del usuario desde la base y los carga en los campos
    const fetchUsuarioData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/obtenerusuario/${id}`);
            const usuarioData = response.data;

            // Establece los datos en el estado del componente
            setUsuario(usuarioData.usuario);
            setRol(usuarioData.rol);
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
            alert('Error al obtener los datos del usuario');
        }
    };

    useEffect(() => {
        if (id) {
            fetchUsuarioData(id);
        }
    }, [id]);

    return (
        <div className='estandar-container'>
            <form className='formulario-estandar' onSubmit={handleSubmit}>
                <h2 className='subtitulo-estandar'>Modificar Usuario</h2>
                <div className="contenido-modificar-usuario">
                    <div>
                        <label htmlFor="usuario">Usuario:</label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="contraseña">Nueva Contraseña:</label>
                        <input
                            type="password"
                            id="contraseña"
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            placeholder="Ingrese una nueva contraseña"
                        />
                    </div>
                    <div>
                        <label htmlFor="rol">Rol:</label>
                        <select
                            id="rol"
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            <option value="admin">Administrador</option>
                            <option value="user">Usuario</option>
                            {/* Agrega más opciones de rol según tus necesidades */}
                        </select>
                    </div>
                    <div><br /></div>
                    <div className='botones-formulario-modificar-usuario'>
                        <button className='btn-estandar' type="submit">Modificar</button>
                        <button className='btn-estandar' type="button" onClick={closeModal}>Volver</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ModificarUsuario;
