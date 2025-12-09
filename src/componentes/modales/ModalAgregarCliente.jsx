import React, { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';


const ModalAgregarCliente = ({ isOpen, onClose, onSuccess }) => {
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

    const [isFetched, setIsFetched] = useState(false);
    if (!isOpen) return null;

    // Función para manejar el envío del formulario
    const handleSubmitAgregarUsuario = async (e) => {
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
        // Realizar la solicitud POST usando axios
        try {
            const response = await axios.post(`${backURL}/api/insertclientes`, nuevoCliente);

            if (response.data?.message === 'Cliente insertado correctamente') {
                toast.success('Cliente agregado exitosamente');
                setTimeout(() => {
                    onSuccess?.(response.data.codigoGia);
                    onClose();
                }, 1500);
            } else if (response.data?.error === 'Ya existe un cliente con esa razón social') {
                toast.warning('Ya existe un cliente con esa razón social');
            } else {
                toast.error('Ocurrió un problema inesperado');
                console.error('Respuesta desconocida del servidor:', response.data);
            }
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            toast.error('Error al enviar la solicitud');
        }
    };



    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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


                    <div className='div_segundorenglon-agregarusuario'>

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
                        <button type="submit" className='btn-agregar-cliente'>Guardar</button>
                        <button type="button" onClick={onClose} className='btn-Salir-Agregar-Cliente'>Cancelar</button>
                    </div>


                </form>
            </div>
        </div>
    );
}
export default ModalAgregarCliente;