import React, { useState } from 'react';
import './LoginForm.css';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';




const LoginForm = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();
    const backURL = import.meta.env.VITE_BACK_URL;

    // Array de usuarios válidos
    const usuariosValidos = [
        { usuario: "admin", contraseña: "admin" },
        { usuario: "it", contraseña: "sistemas" }
    ];
    

    // Manejar el evento de submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita la recarga de la página

        try {
            const response = await axios.post(`${backURL}/api/validarlogin`, {
                usuario,
                contraseña,
            });

            // Si la respuesta es correcta
            if (response.status === 200) {
                toast.success("Login exitoso");
                const { rol } = response.data;

                localStorage.setItem("usuario", usuario);
                localStorage.setItem("rol", rol);

                onLoginSuccess(); 
                navigate('/home');
            }
        } catch (error) {
            
            if (error) {
                toast.error('Usuario inválido o no fue encontrado');
            } 
        }
    };

    return (
        <div className='Login'>
            <ToastContainer />
            <form className='formularioschicos' onSubmit={handleSubmit}>
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