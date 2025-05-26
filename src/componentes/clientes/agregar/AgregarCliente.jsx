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
    const [codigopostal, setCodigoPostal] = useState('');//*
    const [cass, setCass] = useState('');//*
    const [tipoComprobante, setTipoComprobante] = useState(false);//*
    const [tipoMoneda, setTipoMoneda] = useState(false);//*
    const [monedas, setMonedas] = useState([]);
    const [tipoIVA, setTipoIVA] = useState(false);//*
    const [pais, setPais] = useState('');
    const [email, setEmail] = useState('');
    const [tel, setTel] = useState('');
    const [saldo, setSaldo] = useState('');
    const [alertasVisible, setAlertasVisible] = useState(false);
    const [alertasMessage, setAlertasMessage] = useState('');
    const navigate = useNavigate();
    const [isFetched, setIsFetched] = useState(false);

    const fetchMonedas = async () => {
        try {
            const response = await axios.get(`${backURL}/api/obtenermonedas`);
            setMonedas(response.data);
            setIsFetched(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener monedas:', error);
        }
    }

    // Función para manejar el envío del formulario
    const handleSubmitAgregarUsuario = (e) => {
        e.preventDefault();
        const nuevoCliente = {
            Nombre: nombre,
            RazonSocial: razonSocial,
            CodigoGIA: codigoGia,
            Direccion: direccion,
            Zona: zona,
            Ciudad: ciudad,
            CodigoPostal: codigopostal,
            Rut: rut,
            IATA: iata,
            Cass: cass,
            Pais: pais,
            Email: email,
            Tel: tel,
            Tcomprobante: tipoComprobante,
            Tiva: tipoIVA,
            Moneda: tipoMoneda,
            Saldo: saldo
        };
        // Realizar la solicitud POST usando axios
        axios.post(`${backURL}/api/insertclientes`, nuevoCliente)
            .then(response => {
                setAlertasMessage('Cliente agregado exitosamente');
                setAlertasVisible(true);
                setTimeout(() => {
                    setAlertasVisible(false);
                    navigate('/clientes');
                }, 2000); // Esperar 2 segundos antes de navegar
            })
            .catch(error => {
                // Mostrar una alerta de error si la solicitud falla
                toast.error('Error al agregar el cliente');
                console.error(error);
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
                </div>

                <div className='div_segundorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="razonsocial">Código GIA:</label>
                        <input
                            type="text"
                            id="razonsocial"
                            value={codigoGia}
                            onChange={(e) => setCodigoGia(e.target.value)}
                            required
                        />
                    </div>
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
                        <label htmlFor="Zona">Zona:</label>
                        <input
                            type="text"
                            id="zona"
                            value={zona}
                            onChange={(e) => setZona(e.target.value)}
                        />

                    </div>
                </div>

                <div className='div_tercerrenglon-agregarusuario'>
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
                        <label htmlFor="codigo-postal">Codigo Postal:</label>
                        <input
                            type="text"
                            id="codigo-postal"
                            value={codigopostal}
                            onChange={(e) => setCodigoPostal(e.target.value)}
                        />
                    </div>
                </div>



                <div className='div_cuartorenglon-agregarusuario'>
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
                        <label htmlFor="iata">IATA:</label>
                        <input
                            type="number"
                            id="iata"
                            value={iata}
                            onChange={(e) => setIata(e.target.value)}
                        />
                    </div>
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
                    </div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                </div>


                <div className='div_quintorenglon-agregarusuario'>
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
                </div>


                <div className='div_septimorenglon-agregarusuario'>
                    <div>
                        <label htmlFor="tipoComprobante">Tipo de Comprobante:</label>
                        <select
                            id="tipoComprobante"
                            value={tipoComprobante}
                            onChange={(e) => setTipoComprobante(e.target.value)}
                            required
                        >
                            <option value="">Selecciona un tipo de Comprobante</option>
                            <option value="efactura">E-Factura</option>
                            <option value="eticket">E-Ticket</option>
                            <option value="efacturaca">E-Factura Cuenta Ajena</option>
                            <option value="eticketca">E-Ticket Cuenta Ajena</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tipoMoneda">Moneda:</label>
                        <select
                            id="moneda"
                            required
                            value={tipoMoneda}
                            onChange={(e) => setTipoMoneda(e.target.value)}
                            onClick={() => {
                                if (!isFetched) fetchMonedas(); // Solo llama a fetchMonedas una vez
                            }}
                        >
                            <option value="">Seleccione una moneda</option>
                            {monedas.map((moneda, index) => (
                                <option key={index} value={moneda.moneda}>
                                    {moneda.moneda}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tipoIVA">Tipo de IVA:</label>
                        <select
                            id="tipoIVA"
                            value={tipoIVA}
                            onChange={(e) => setTipoIVA(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un tipo de IVA</option>
                            <option value="iva22">IVA 22%</option>
                            <option value="excento">Exento</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="saldo">Saldo:</label>
                        <input
                            type="number"
                            id="saldo"
                            value={saldo}
                            onChange={(e) => setSaldo(e.target.value)}
                            required
                        />
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