import React, { useState } from 'react';
import './agregarcliente.css';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Alertas from '../../modales/Alertas';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';


const AgregarCliente = ({ isLoggedIn }) => {
    const backURL = import.meta.env.VITE_BACK_URL;
    // Estado para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [razonSocial, setRazonSocial] = useState('');
    const [rut, setRut] = useState('');
    const [iata, setIata] = useState(''); //*
    const [codigoGia, setCodigoGia] = useState('');
    const [direccion, setDireccion] = useState('');//*
    const [zona, setZona] = useState('');//*
    const [ciudad, setCiudad] = useState('');//*

    const [cass, setCass] = useState('');//*
    const [tipoComprobante, setTipoComprobante] = useState('2');//*
    const [tipoMoneda, setTipoMoneda] = useState(false);//*
    const [monedas, setMonedas] = useState([]);
    const [tipoIVA, setTipoIVA] = useState(false);//*
    const [pais, setPais] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');
    const [saldo, setSaldo] = useState(0);
    const [alertasVisible, setAlertasVisible] = useState(false);
    const [alertasMessage, setAlertasMessage] = useState('');
    const navigate = useNavigate();
    const [isFetched, setIsFetched] = useState(false);


    // Función para manejar el envío del formulario
    const handleSubmitAgregarUsuario = (e) => {
        e.preventDefault();
        const nuevoCliente = {
            Nombre: nombre,
            RazonSocial: razonSocial,
            Direccion: direccion,
            Zona: zona,
            Ciudad: ciudad,
            Rut: rut,
            IATA: iata,
            Cass: cass,
            Pais: pais,
            Email: email,
            Tel: tel,
            TDOCDGI: tipoComprobante,
            Saldo: 0,
            usuarioModifica: 'sistemas',
            fechaModifica: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        console.log('Datos a enviar al backend', nuevoCliente)
        // Realizar la solicitud POST usando axios
        axios.post(`${backURL}/api/insertclientes`, nuevoCliente)
            .then(response => {
                if (response.data?.message === 'Cliente insertado correctamente') {
                    toast.success('Cliente agregado exitosamente');
                    setTimeout(() => {
                        navigate('/clientes');
                    }, 2000);
                } else if (response.data?.error === 'Ya existe un cliente con esa razón social') {
                    toast.warning('Ya existe un cliente con esa razón social');
                } else {
                    toast.error('Ocurrió un problema inesperado');
                    console.error('Respuesta desconocida del servidor:', response.data);
                }
            })
            .catch(error => {
                if (error.response) {
                    // El servidor respondió con un código de estado diferente a 2xx
                    const mensaje = error.response.data?.error || 'Error al procesar la solicitud';
                    toast.error(mensaje);
                } else if (error.request) {
                    // No hubo respuesta del servidor
                    toast.error('No se pudo contactar con el servidor');
                } else {
                    // Otro tipo de error
                    toast.error('Error inesperado al enviar la solicitud');
                }
                console.error('Detalles del error:', error);
            });
    };


    return (
        <div className="AgregarCliente-container">
            <ToastContainer />
            <form onSubmit={handleSubmitAgregarUsuario} className='formulario-agregar-cliente'>
                <h2 className='titulo-estandar'>Agregar Cliente</h2>
                <div className='div_primerrenglon-agregarusuario'>
                    <div>
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div>
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
                        <label htmlFor="rut">Rut / CI:</label>
                        <input
                            type="number"
                            id="rut"
                            value={rut}
                            onChange={(e) => setRut(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className='div_segundorenglon-agregarusuario'>

                    <div>
                        <label htmlFor="direccion">Direccion:</label>
                        <input
                            type="text"
                            id="direccion"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Ciudad">Ciudad:</label>
                        <input
                            type="text"
                            id="ciudad"
                            value={ciudad}
                            onChange={(e) => setCiudad(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Zona">Zona:</label>
                        <input
                            type="text"
                            id="zona"
                            value={zona}
                            onChange={(e) => setZona(e.target.value)}
                        />

                    </div>
                </div>

                <div className='div_segundorenglon-agregarusuario'>
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

                </div>


                <div className='div_segundorenglon-agregarusuario'>
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

                    <div>
                        <label htmlFor="iata">IATA:</label>
                        <input
                            type="number"
                            id="iata"
                            value={iata}
                            onChange={(e) => setIata(e.target.value)}
                        />
                    </div>


                </div>


                <div className='div_segundorenglon-agregarusuario'>


                    <div>
                        <label htmlFor="cass">Cass:</label>
                        <select
                            id="cass"
                            value={cass}
                            onChange={(e) => setCass(e.target.value)}

                        >
                            <option value="">Selecciona el Cass</option>
                            <option value="false">No</option>
                            <option value="true">Si</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tipoComprobante">Tipo de DOC. DGI:</label>
                        <select
                            id="tipoComprobante"
                            value={tipoComprobante}
                            onChange={(e) => setTipoComprobante(e.target.value)}
                            required
                        >
                            <option value="2">RUT</option>
                            <option value="3">CI</option>
                        </select>
                    </div>

                </div>



                <div className='botonesagregarusuario'>
                    <button type="submit" className='btn-agregar-cliente'>Agregar Cliente</button>

                    <Link to="/clientes"><button className="btn-Salir-Agregar-Cliente">Volver</button></Link>
                </div>


            </form>
        </div>
    );
}

export default AgregarCliente