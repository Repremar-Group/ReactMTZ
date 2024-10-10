import React, { useState } from 'react';
import './LoginForm.css';
import logo from './LogoCieloSur.png';
import { useNavigate } from 'react-router-dom';


const LoginForm = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();

    // Array de usuarios válidos
    const usuariosValidos = [
        { usuario: "admin", contraseña: "admin" },
        { usuario: "it", contraseña: "sistemas" }
    ];

    // Manejar el evento de submit
    const handleSubmit = (e) => {
        e.preventDefault(); // Evita la recarga de la página

        // Verificar si el usuario existe en el array
        const usuarioEncontrado = usuariosValidos.find(
            (u) => u.usuario === usuario && u.contraseña === contraseña
        );

        if (usuarioEncontrado) {
            onLoginSuccess(); // Llama a la función de login exitoso pasada desde el componente principal
            navigate('/home');


        } else {
            alert("Usuario o contraseña incorrectos");
        }
    };

    return (
        <div className='Login'>
            <form className= 'formularioschicos' onSubmit={handleSubmit}>
                <img src={logo} alt="Logo Cielosur" />

                <div className='input-box'>
                    <input 
                        type="text" 
                        placeholder='Usuario' 
                        onChange={e => setUsuario(e.target.value)} 
                        value={usuario}  
                        required 
                    />
                </div>

                <div className='input-box'>
                    <input 
                        type="password" 
                        placeholder='Contraseña' 
                        onChange={e => setContraseña(e.target.value)} 
                        value={contraseña} 
                        required 
                    />
                </div>

                <button type="submit" className="btn-estandar">Ingresar</button>
            </form>
        </div>
    );
}

export default LoginForm;