import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ModalBusquedaClientes from './ModalBusquedaClientes';
import './modales.css'
import { convertirAComa, convertirADecimal } from '../funcionesgenerales';
import { ToastContainer, toast } from 'react-toastify';

const ModalModificarGuiaExpo = ({ isOpen, closeModal, guia }) => {
    const backURL = import.meta.env.VITE_BACK_URL;
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };
    const [loading, setLoading] = useState(false);
    const [datosGuia, setDatosGuia] = useState({
        agente: '',
        agentecollect: 0,
        cass: '',
        cobrarpagar: 0,
        conexionvuelo: '',
        dbf: 0,
        destinovuelo: '',
        dueagent: 0,
        duecarrier: 0,
        emision: '',
        empresavuelo: '',
        fechavuelo: '',
        fleteawb: 0,
        fleteneto: 0,
        gsa: 0,
        guia: '',
        nrovuelo: '',
        origenvuelo: '',
        pesobruto: 0,
        pesotarifado: 0,
        piezas: 0,
        reserva: 0,
        security: 0,
        tarifaneta: 0,
        tarifaventa: 0,
        tipodepago: '',
        total: 0,

    });

    const [searchTermModificar, setSearchTermModificar] = useState('');
    const [filteredClientesModificar, setFilteredClientesModificar] = useState([]);
    const [selectedClienteModificar, setSelectedClienteModificar] = useState(null);
    const [isModalOpenModificar, setIsModalOpenModificar] = useState(false);

    // UseEffect para cargar datos de la guía
    useEffect(() => {
        fetchCiudadesModificar()
        fetchMonedasModificar()
        const fetchGuiaData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backURL}/api/obtenerexpo/${guia}`);
                if (response.data) {
                    setDatosGuia({
                        ...response.data,
                        emision: formatDate(response.data.emision),
                        fechavuelo: formatDate(response.data.fechavuelo)
                    });
                    console.log(response.data);
                }
            } catch (error) {
                console.error('Error al obtener los datos de la guía:', error);
            } finally {
                setLoading(false);
            }
        };

        if (guia) {
            fetchGuiaData();
        }
    }, [guia]);

    // Manejo del input de búsqueda
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDatosGuia(prevState => ({
            ...prevState,
            agente: value
        }));
    };

    // Búsqueda de clientes al presionar Enter
    const handleKeyPressModificar = async (e) => {
        if (e.key === 'Enter' && datosGuia.agente.trim()) {
            e.preventDefault();
            try {
                const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${datosGuia.agente}`);
                setFilteredClientesModificar(response.data);
                setIsModalOpenModificar(true); // Abre el modal con los resultados
            } catch (error) {
                console.error('Error al buscar clientes:', error);
            }
        }
    };

    // Selección de cliente
    const handleSelectClienteModificar = (cliente) => {
        // Actualiza datosGuia con el cliente seleccionado
        setDatosGuia(prevState => ({
            ...prevState,
            agente: cliente.RazonSocial,
        }));

        setSelectedClienteModificar(cliente); // Guarda el cliente seleccionado
        setSearchTermModificar(cliente.RazonSocial); // Actualiza el término de búsqueda
        setIsModalOpenModificar(false); // Cierra el modal
    };

    // Usar useEffect para monitorear los cambios en datosGuia (solo para depuración)
    useEffect(() => {
        console.log("datosGuia actualizado:", datosGuia);
    }, [datosGuia]);

    // Cerrar modal de consignatarios
    const closeModalconsingatariomodificar = () => setIsModalOpenModificar(false);

    //Manejo de info para las ciudades en modificar
    const [ciudadesModificar, setCiudadesModificar] = useState([]);
    const [isFetchedCiudadesModificar, setIsFetchedCiudadesModificar] = useState(false); // Para evitar múltiples llamadas

    const fetchCiudadesModificar = async () => {
        try {
            const response = await axios.get(`${backURL}/api/obtenerciudades`);
            setCiudadesModificar(response.data);
            setIsFetchedCiudadesModificar(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener monedas:', error);
        }
    }

    //Estados Para el manejo de monedas
    const [monedasModificar, setMonedasModificar] = useState([]);
    const [isFetchedModificar, setIsFetchedModificar] = useState(false); // Para evitar múltiples llamadas

    const fetchMonedasModificar = async () => {
        try {
            const response = await axios.get(`${backURL}/api/obtenermonedas`);
            setMonedasModificar(response.data);
            setIsFetchedModificar(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener monedas:', error);
        }
    }
    // useEffect para actualizar Flete Neto cuando Tarifa Neta o Peso Tarifado cambian
    useEffect(() => {
        if (datosGuia.tarifaneta && datosGuia.pesotarifado) {
            // Convertir coma a punto antes de hacer el cálculo
            const tarifanetaconvertida = convertirADecimal(datosGuia.tarifaneta);
            const pesotarifadoconvertido = convertirADecimal(datosGuia.pesotarifado);


            // Realizar el cálculo
            const fleteNetoCalculado = parseFloat(tarifanetaconvertida) * parseFloat(pesotarifadoconvertido);
            const gsa = fleteNetoCalculado * 0.05;

            // Verificar el tercer decimal
            const tercerDecimal = Math.floor((gsa * 1000) % 10); // Obtiene el tercer decimal
            let gsaRedondeado;

            if (tercerDecimal >= 5) {
                // Redondear hacia arriba
                gsaRedondeado = Math.ceil(gsa * 100) / 100;
            } else {
                // Mantener el redondeo estándar
                gsaRedondeado = Math.floor(gsa * 100) / 100;
            }

            // Si el cálculo es un número válido, actualizar el estado de Flete Original
            if (!isNaN(fleteNetoCalculado)) {
                // Actualización de datosGuia
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteneto: fleteNetoCalculado.toFixed(2),
                    gsa: gsaRedondeado.toFixed(2),
                }));
            } else {
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteneto: '',
                    gsa: '',
                }));
            }
        } else {
            setDatosGuia(prevState => ({
                ...prevState,
                fleteneto: '',
                gsa: '',
            }));
        }
    }, [datosGuia.tarifaneta, datosGuia.pesotarifado]);

    // useEffect para actualizar Flete Awb cuando Tarifa Venta o Peso Tarifado cambian
    useEffect(() => {
        if (datosGuia.tarifaventa && datosGuia.pesotarifado) {
            // Convertir coma a punto antes de hacer el cálculo
            const tarifaventaconvertida = convertirADecimal(datosGuia.tarifaventa);
            const pesotarifadoconvertido = convertirADecimal(datosGuia.pesotarifado);

            // Realizar el cálculo
            const fleteAwbCalculado = parseFloat(tarifaventaconvertida) * parseFloat(pesotarifadoconvertido);

            // Si el cálculo es un número válido, actualizar el estado de Flete Original
            if (!isNaN(fleteAwbCalculado)) {
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteawb: fleteAwbCalculado.toFixed(2),
                }));
            } else {
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteawb: '',
                }));
            }
        } else {
            setDatosGuia(prevState => ({
                ...prevState,
                fleteawb: '',
            }));
        }
    }, [datosGuia.tarifaventa, datosGuia.pesotarifado]);

    // useEffect para actualizar DBF cuando Due Agent cambia
    useEffect(() => {
        if (datosGuia.dueagent) {
            let DBFCalculado = parseFloat(datosGuia.dueagent) * 0.10;
            if (DBFCalculado <= 20) {
                DBFCalculado = 20;
                setDatosGuia(prevState => ({
                    ...prevState,
                    dbf: DBFCalculado.toFixed(2),
                }));
                
            } else {
                DBFCalculado = parseFloat(datosGuia.dueagent) * 0.10;
                setDatosGuia(prevState => ({
                    ...prevState,
                    dbf: DBFCalculado.toFixed(2),
                }));
            }

        } else {
            setDatosGuia(prevState => ({
                ...prevState,
                dbf: '',
            }));
        }
    }, [datosGuia.dueagent]);

    //UseEffect para calcular todos los campos si la guia es Collect
    useEffect(() => {
        if ((datosGuia.fleteawb && datosGuia.fleteneto) && datosGuia.tipodepago === 'C') {
            const fleteNetoConvertido = convertirADecimal(datosGuia.fleteneto);
            console.log("fleteNetoConvertido:", fleteNetoConvertido);

            //Calculo de total a cobrar
            const totalacobrar = (
                (parseFloat(convertirADecimal(datosGuia.fleteneto)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.security)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.dbf)) || 0)
            );

            //Calculo total de la guia
            const totaldelaguia = (
                (parseFloat(convertirADecimal(datosGuia.fleteawb)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.security)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.dbf)) || 0)
            );

            const AgenteCollect = (totaldelaguia - totalacobrar);

            //Asignación de las Varibles.
            setDatosGuia(prevState => ({
                ...prevState,
                total: totaldelaguia.toFixed(2),
                cobrarpagar:totalacobrar.toFixed(2),
                agentecollect:AgenteCollect.toFixed(2),
            }));

        } else {
            if ((!datosGuia.fleteawb || !datosGuia.fleteneto) && datosGuia.tipodepago != 'P') {
                setDatosGuia(prevState => ({
                    ...prevState,
                    total: '',
                    cobrarpagar:'',
                    agentecollect:'',
                }));
            }
        }
    }, [
        datosGuia.fleteneto,
        datosGuia.fleteawb,
        datosGuia.tipodepago,
        datosGuia.dueagent,
        datosGuia.duecarrier,
        datosGuia.dbf,
        datosGuia.security
    ]);

    //UseEffect para calcular todos los campos si la guia es PrePaid
    useEffect(() => {
        if (datosGuia.fleteneto && datosGuia.tipodepago === 'P') {

            //Calculo de total a cobrar
            const totalacobrar = (
                (parseFloat(convertirADecimal(datosGuia.fleteneto)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.security)) || 0)
            )
            //Calculo total de la guia
            const totaldelaguia = (
                (parseFloat(convertirADecimal(datosGuia.security)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.fleteneto)) || 0)
            )

            //Asignación de las Varibles.
            setDatosGuia(prevState => ({
                ...prevState,
                total: totaldelaguia.toFixed(2),
                cobrarpagar:totalacobrar.toFixed(2),
                agentecollect:0,
            }));
        } else {

            if (!datosGuia.fleteneto && datosGuia.tipodepago != 'C') {
                setDatosGuia(prevState => ({
                    ...prevState,
                    total: '',
                    cobrarpagar:'',
                    agentecollect:'',
                }));
            }

        }
    }, [
        datosGuia.fleteneto,
        datosGuia.fleteawb,
        datosGuia.tipodepago,
        datosGuia.duecarrier,
        datosGuia.security
    ]);
    const handleSubmitGuardarGuiaExpo = async (e) => {
        e.preventDefault(); // Previene el comportamiento predeterminado de submit del formulario
    
        try {
            // Enviar los datos al backend usando axios
            const response = await axios.post(`${backURL}/api/modificarguiaexpo`, datosGuia);
    
            // Manejo de la respuesta exitosa
            if (response.status === 200) {
                toast.success('¡Guía Actualizada guardada exitosamente!');
                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
        } catch (error) {
            // Manejo de error en la solicitud
            console.error('Error al Modificar la guía: ', error);
            toast.error('Hubo un error al guardar la guía.');
        }
    };
    

    if (!isOpen) return null;
    return (
        <div className="modal" onClick={closeModal}>
            <div className="modal-content-grande" onClick={(e) => e.stopPropagation()}>
                <h2 className='titulo-estandar'>Modificar Guía: {guia}</h2>
                {loading ? (
                    <div className="loading-spinner">
                        {/* El spinner se muestra cuando loading es true */}
                    </div>
                ) : (
                    <div>
                        <form className='formulario-estandar' onSubmit={handleSubmitGuardarGuiaExpo}>
                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="geagente">Agente:</label>
                                    <input
                                        type="text"
                                        value={datosGuia.agente}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPressModificar}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="geagente">Reserva:</label>
                                    <input
                                        type="text"
                                        value={datosGuia.reserva}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, reserva: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ginroguia">Guia:</label>
                                    <input
                                        type="text"
                                        id="ginroguia"
                                        value={datosGuia.guia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, guia: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gifechaemisionguia">Emision:</label>
                                    <input
                                        type="date"
                                        id="gifechaemisionguia"
                                        value={datosGuia.emision}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, emision: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gitipodepagoguia">Tipo de Pago:</label>
                                    <select
                                        id="gitipodepagoguia"
                                        value={datosGuia.tipodepago}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, tipodepago: e.target.value })}
                                        required
                                        disabled
                                    >
                                        <option value="">Selecciona una Tipo</option>
                                        <option value="P">PREPAID</option>
                                        <option value="C">COLLECT</option>
                                    </select>
                                </div>

                            </div>


                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="gipiezasguia">Piezas:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        
                                        value={datosGuia.piezas}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, piezas: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gipiezasguia">Peso Bruto:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        
                                        value={datosGuia.pesobruto}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, pesobruto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gipiezasguia">Peso Tarifado:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        
                                        value={datosGuia.pesotarifado}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, pesotarifado: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="gipiezasguia">Tarifa Neta:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        
                                        value={datosGuia.tarifaneta}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, tarifaneta: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giarbitrajeguia">Tarifa Venta:</label>
                                    <input
                                        type="number"
                                        id="giarbitrajeguia"
                                        value={datosGuia.tarifaventa}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, tarifaventa: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gitarifaguia">Flete Neto:</label>
                                    <input
                                        type="number"
                                        id="gitarifaguia"
                                        value={datosGuia.fleteneto}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, fleteneto: e.target.value })}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gifleteoriginalguia">Flete AWB:</label>
                                    <input
                                        type="text"
                                        id="gifleteoriginalguia"
                                        value={datosGuia.fleteawb}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, fleteawb: e.target.value })}
                                        readOnly
                                        required
                                        
                                    />
                                </div>
                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="gifleteguia">Due Carrier:</label>
                                    <input
                                        type="text"
                                        id="gifleteguia"
                                        value={datosGuia.duecarrier}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, duecarrier: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giiva53guia">Due Agent:</label>
                                    <input
                                        type="text"
                                        id="giiva53guia"
                                        value={datosGuia.dueagent}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, dueagent: e.target.value })}
                                        required
                                        
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giduecarrierguia">DBF:</label>
                                    <input
                                        type="text"
                                        id="giduecarrierguia"
                                        value={datosGuia.dbf || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, dbf: e.target.value })}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gidueagentguia">GSA:</label>
                                    <input
                                        type="text"
                                        id="gidueagentguia"
                                        value={datosGuia.gsa || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, gsa: e.target.value })}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giverificacionguia">Security:</label>
                                    <input
                                        type="text"
                                        id="giverificacionguia"
                                        value={datosGuia.security}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, security: e.target.value })}
                                    />
                                </div>

                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>

                                <div>
                                    <label htmlFor="gicollectfeeguia">Cobrar / Pagar:</label>
                                    <input
                                        type="text"
                                        id="gicollectfeeguia"
                                        value={datosGuia.cobrarpagar || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, cobrarpagar: e.target.value })}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gicfivaguia">Agente Collect:</label>
                                    <input
                                        type="text"
                                        id="gicfivaguia"
                                        value={datosGuia.agentecollect || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, agentecollect: e.target.value })}
                                        readOnly
                                        disabled

                                    />
                                </div>

                                <div>
                                    <label htmlFor="giajusteguia">Total de la Guia:</label>
                                    <input
                                        type="text"
                                        id="giajusteguia"
                                        value={datosGuia.total}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, total: e.target.value })}
                                        readOnly
                                        required
                                        disabled
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <button className='btn-estandar'>Guardar</button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
            <ToastContainer />
            {/* Modal de búsqueda de clientes */}
            <ModalBusquedaClientes
                isOpen={isModalOpenModificar}
                closeModal={closeModalconsingatariomodificar}
                filteredClientes={filteredClientesModificar}
                handleSelectCliente={handleSelectClienteModificar}
            />
        </div>
    );
};
export default ModalModificarGuiaExpo;
