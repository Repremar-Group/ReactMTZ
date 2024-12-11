import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ModalBusquedaClientes from './ModalBusquedaClientes';
import { convertirAComa, convertirADecimal } from '../funcionesgenerales';
import { ToastContainer, toast } from 'react-toastify';

const ModalModificarGuiaImpo = ({ isOpen, closeModal, guia }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };
    const [loading, setLoading] = useState(false);
    const [datosGuia, setDatosGuia] = useState({
        nrovuelo: '',
        fechavuelo: '',
        origenvuelo: '',
        nroembarque: '',
        guia: '',
        emision: '',
        consignatario: '',
        origenguia: '',
        conexionguia: '',
        destinoguia: '',
        tipodepagoguia: '',
        mercaderia: '',
        piezas: 0,
        peso: 0,
        pesovolumetrico: 0,
        moneda: '',
        arbitraje: 0,
        tarifa: 0,
        fleteoriginal: 0,
        dcoriginal: 0,
        daoriginal: 0,
        flete: 0,
        ivas3: 0,
        duecarrier: 0,
        dueagent: 0,
        verificacion: 0,
        collectfee: 0,
        cfiva: 0,
        ajuste: 0,
        total: 0,
        totalguia: 0,
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
                const response = await axios.get(`http://localhost:3000/api/obtenerguia/${guia}`);
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
            [name]: value
        }));
    };

    // Búsqueda de clientes al presionar Enter
    const handleKeyPressModificar = async (e) => {
        if (e.key === 'Enter' && datosGuia.consignatario.trim()) {
            e.preventDefault();
            try {
                const response = await axios.get(`http://localhost:3000/api/obtenernombrecliente?search=${datosGuia.consignatario}`);
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
            consignatario: cliente.RazonSocial,
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
    const [origenguiaSeleccionadoModificar, setOrigenGuiaSeleccionadoModificar] = useState('');
    const [conexionguiaSeleccionadoModificar, setConexionGuiaSeleccionadoModificar] = useState('');
    const [destinoguiaSeleccionadoModificar, setDestinoGuiaSeleccionadoModificar] = useState('MVD');
    const [isFetchedCiudadesModificar, setIsFetchedCiudadesModificar] = useState(false); // Para evitar múltiples llamadas

    const fetchCiudadesModificar = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/obtenerciudades');
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
            const response = await axios.get('http://localhost:3000/api/obtenermonedas');
            setMonedasModificar(response.data);
            setIsFetchedModificar(true); // Indica que ya se obtuvieron los datos
        } catch (error) {
            console.error('Error al obtener monedas:', error);
        }
    }
    //UseEffect para calcular Flete Original
    useEffect(() => {
        if (datosGuia.pesovolumetrico && datosGuia.tarifa) {
            // Convertir coma a punto antes de hacer el cálculo
            const pesoVolConvertido = convertirADecimal(datosGuia.pesovolumetrico);
            const tarifaConvertida = convertirADecimal(datosGuia.tarifa);
            // Realizar el cálculo
            const fleteCalculado = parseFloat(pesoVolConvertido) * parseFloat(tarifaConvertida);
            console.log(fleteCalculado)
            // Si el cálculo es un número válido, actualizar el estado de Flete Original
            if (!isNaN(fleteCalculado)) {
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteoriginal: convertirADecimal(fleteCalculado.toFixed(2)),

                }));
            } else {
                setDatosGuia(prevState => ({
                    ...prevState,
                    fleteoriginal: '',

                }));
            }
        } else {
            setDatosGuia(prevState => ({
                ...prevState,
                fleteoriginal: '',

            }));
        }
    }, [datosGuia.pesovolumetrico, datosGuia.tarifa]);

    //Use Effect para manejar due carrier y due agent
    useEffect(() => {
        if (datosGuia.dcoriginal || datosGuia.daoriginal) {
            setDatosGuia(prevState => ({
                ...prevState,
                dueagent: datosGuia.daoriginal,
                duecarrier: datosGuia.dcoriginal,

            }));
        } else {
            setDatosGuia(prevState => ({
                ...prevState,
                dueagent: '',
                duecarrier: '',

            }));
        }
    }, [
        datosGuia.dcoriginal,
        datosGuia.daoriginal
    ]);

    
    //UseEffect para calcular la guia si es Collect
    useEffect(() => {

        
        if (datosGuia.fleteoriginal) {

            const fleteoriginal = convertirADecimal(datosGuia.fleteoriginal);

            if (datosGuia.tipodepagoguia === 'C') { // Caso Collect
                // Calcular el 22% de gifleteoriginalguia (esto es el IVA)
                const iva22 = parseFloat(fleteoriginal) * 0.22;
                //Calcular el collect fee
                console.log('fleteoriginal: ', fleteoriginal)
                const collectfee = parseFloat(fleteoriginal) * 0.05;
                const collectfeeiva = collectfee * 0.22;
                // Calcular el 3% del IVA calculado
                const ivaS3 = (iva22 * 0.03);
                //Calcular el ajuste.
                const redondeo = Math.ceil(
                    (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.collectfee)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.cfiva)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                ) -
                    (
                        (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.collectfee)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.cfiva)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                    );
                //Calculo de total a cobrar
                const totalacobrar = (
                    (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.collectfee)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.cfiva)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                    (parseFloat(redondeo) || 0)
                )
                //Calculo total de la guia
                const totaldelaguia = (
                    (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                )
                // Actualización de datosGuia
                setDatosGuia(prevState => ({
                    ...prevState,
                    collectfee: collectfee.toFixed(2),
                    cfiva: collectfeeiva.toFixed(2),
                    ivas3: ivaS3.toFixed(2),
                    fleteoriginal: fleteoriginal,
                    ajuste: redondeo.toFixed(2),
                    total: totalacobrar,
                    totalguia: totaldelaguia.toFixed(2),
                }));
            } else if (datosGuia.tipodepagoguia === 'P') {
                const iva22 = parseFloat(fleteoriginal) * 0.22;
                const ivaS3 = iva22 * 0.03;

                const redondeo = Math.ceil(
                    (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                ) -
                    (
                        (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                        (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                    );

                const totalacobrar = (
                    (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                    (parseFloat(redondeo) || 0)
                );

                const totaldelaguia = (
                    (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
                );

                // Actualización de datosGuia
                setDatosGuia(prevState => ({
                    ...prevState,
                    totalguia: totaldelaguia.toFixed(2),
                    flete: fleteoriginal.toFixed(2),
                    ivas3: ivaS3.toFixed(2),
                    ajuste: redondeo.toFixed(2),
                    total: totalacobrar.toFixed(2),
                }));
            } else { // Caso que no sea Collect ni Prepaid
                setDatosGuia(prevState => ({
                    ...prevState,
                    collectfee: '',
                    cfiva: '',
                    ivas3: '',
                    fleteoriginal: '',
                    ajuste: '',
                    total: '',
                    totalguia: '',
                }));
            }
        }
    }, [
        datosGuia.cfiva,
        datosGuia.collectfee,
        datosGuia.fleteoriginal,
        datosGuia.tipodepagoguia,
        datosGuia.verificacion,
        datosGuia.ivas3,
        datosGuia.duecarrier,
        datosGuia.dueagent,
    ]);

    //UseEffect para calcular la guia si es PrePaid
    useEffect(() => {
        if (datosGuia.fleteoriginal && datosGuia.tipodepagoguia === 'P') {
            const fleteoriginal = convertirADecimal(datosGuia.fleteoriginal);
            const iva22 = parseFloat(fleteoriginal) * 0.22;
            const ivaS3 = iva22 * 0.03;

            const redondeo = Math.ceil(
                (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) 
            ) -
                (
                    (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                    (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) 
                );

            const totalacobrar = (
                (parseFloat(convertirADecimal(datosGuia.verificacion)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.ivas3)) || 0) +
                (parseFloat(redondeo) || 0)
            );

            const totaldelaguia = (
                (parseFloat(convertirADecimal(datosGuia.fleteoriginal)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.dueagent)) || 0) +
                (parseFloat(convertirADecimal(datosGuia.duecarrier)) || 0)
            );

            // Actualización de datosGuia
            setDatosGuia(prevState => ({
                ...prevState,
                totalguia: totaldelaguia.toFixed(2),
                flete: fleteoriginal.toFixed(2),
                ivas3: ivaS3.toFixed(2),
                ajuste: redondeo.toFixed(2),
                total: totalacobrar.toFixed(2),
            }));
        } else {
            // Reiniciar valores
            setDatosGuia(prevState => ({
                ...prevState,
                flete: '',
                ivas3: '',
                ajuste: ''
            }));
        }
    }, [
        datosGuia.fleteoriginal,
        datosGuia.tipodepagoguia,
        datosGuia.verificacion,
        datosGuia.ivas3,
        datosGuia.duecarrier,
        datosGuia.dueagent
    ]);

    const handleSubmitGuardarGuiaImpo = async (e) => {
        e.preventDefault(); // Previene el comportamiento predeterminado de submit del formulario
    
        try {
            // Enviar los datos al backend usando axios
            const response = await axios.post('http://localhost:3000/api/modificarguia', datosGuia);
    
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
                        <form className='formulario-estandar' onSubmit={handleSubmitGuardarGuiaImpo}>
                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="ginroembarque">Nro. Embarque:</label>
                                    <input
                                        type="text"
                                        id="ginroembarque"
                                        value={datosGuia.nroembarque}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, nroembarque: e.target.value })}
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
                                        disabled
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
                                    <label htmlFor="consignatario">Consignatario:</label>
                                    <input
                                        type="text"
                                        name="consignatario"
                                        value={datosGuia.consignatario}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPressModificar}
                                        placeholder="Buscar consignatario"
                                        required
                                    />
                                </div>
                            </div>


                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="giorigenguia">Origen:</label>
                                    <select
                                        id="ciudad"
                                        value={datosGuia.origenguia}
                                        required
                                        onChange={(e) => setDatosGuia({ ...datosGuia, origenguia: e.target.value })}
                                        onClick={() => {
                                            if (!isFetchedCiudadesModificar) fetchCiudadesModificar(); // Solo llama a fetchCiudades una vez
                                        }}
                                    >
                                        <option value="">Seleccione un origen</option>
                                        {ciudadesModificar.map((ciudad, index) => (
                                            <option key={index} value={ciudad.ciudad}>
                                                {ciudad.ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="giconexionguia">Conexion:</label>
                                    <select
                                        id="ciudad"
                                        value={datosGuia.conexionguia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, conexionguia: e.target.value })}
                                        onClick={() => {
                                            if (!isFetchedCiudadesModificar) fetchCiudadesModificar(); // Solo llama a fetchMonedas una vez
                                        }}
                                    >
                                        <option value="">Seleccione una Conexion</option>
                                        {ciudadesModificar.map((ciudad, index) => (
                                            <option key={index} value={ciudad.ciudad}>
                                                {ciudad.ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="gidestinoguia">Destino:</label>
                                    <select
                                        id="ciudad"
                                        required
                                        value={datosGuia.destinoguia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, destinoguia: e.target.value })}
                                        onClick={() => {
                                            if (!isFetchedCiudadesModificar) fetchCiudadesModificar(); // Solo llama a fetchMonedas una vez
                                        }}
                                    >
                                        <option value="MVD">MVD</option>
                                        {ciudadesModificar.map((ciudad, index) => (
                                            <option key={index} value={ciudad.ciudad}>
                                                {ciudad.ciudad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="gitipodepagoguia">Tipo de Pago:</label>
                                    <select
                                        id="gitipodepagoguia"
                                        value={datosGuia.tipodepagoguia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, tipodepagoguia: e.target.value })}
                                        required
                                        disabled
                                    >
                                        <option value="">Selecciona una Tipo</option>
                                        <option value="P">PREPAID</option>
                                        <option value="C">COLLECT</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="gimercaderiaguia">Mercaderia:</label>
                                    <input
                                        type="text"
                                        id="gimercaderiaguia"
                                        value={datosGuia.mercaderia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, mercaderia: e.target.value })}

                                    />
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
                                    <label htmlFor="gipesoguia">Peso:</label>
                                    <input
                                        type="number"
                                        id="gipesoguia"
                                        value={datosGuia.peso}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, peso: e.target.value })}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="gipesovolguia">Peso/Vol:</label>
                                    <input
                                        type="number"
                                        id="gipesovolguia"
                                        value={datosGuia.pesovolumetrico}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, pesovolumetrico: e.target.value })}
                                        required
                                    />
                                </div>
                                <div></div>
                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="moneda">Moneda:</label>
                                    <select
                                        id="moneda"
                                        required
                                        value={datosGuia.moneda}
                                        onChange={(e) =>
                                            setDatosGuia({ ...datosGuia, moneda: e.target.value }) // Actualiza el estado al seleccionar una moneda
                                        }
                                        onClick={() => {
                                            if (!isFetchedModificar) fetchMonedasModificar(); // Solo llama a fetchMonedas una vez
                                        }}
                                    >
                                        <option value="">Seleccione una moneda</option>
                                        {monedasModificar.map((moneda, index) => (
                                            <option key={index} value={moneda.moneda}>
                                                {moneda.moneda}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="giarbitrajeguia">Arbitraje:</label>
                                    <input
                                        type="number"
                                        id="giarbitrajeguia"
                                        value={datosGuia.arbitraje}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, arbitraje: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gitarifaguia">Tarifa:</label>
                                    <input
                                        type="number"
                                        id="gitarifaguia"
                                        value={datosGuia.tarifa}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, tarifa: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gifleteoriginalguia">Flete Original:</label>
                                    <input
                                        type="text"
                                        id="gifleteoriginalguia"
                                        value={datosGuia.fleteoriginal}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, fleteoriginal: e.target.value })}
                                        readOnly
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gidcoriginalguia">DC Original:</label>
                                    <input
                                        type="number"
                                        id="gidcoriginalguia"
                                        value={datosGuia.dcoriginal}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, dcoriginal: e.target.value })}

                                    />
                                </div>
                                <div>
                                    <label htmlFor="gidaoriginalguia">DA Original:</label>
                                    <input
                                        type="number"
                                        id="gidaoriginalguia"
                                        value={datosGuia.daoriginal}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, daoriginal: e.target.value })}

                                    />
                                </div>
                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="gifleteguia">Flete:</label>
                                    <input
                                        type="text"
                                        id="gifleteguia"
                                        value={datosGuia.flete}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, flete: e.target.value })}
                                        readOnly
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giiva53guia">IVA Sobre 3%:</label>
                                    <input
                                        type="text"
                                        id="giiva53guia"
                                        value={datosGuia.ivas3}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, ivas3: e.target.value })}
                                        readOnly
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giduecarrierguia">Due Carrier:</label>
                                    <input
                                        type="text"
                                        id="giduecarrierguia"
                                        value={datosGuia.duecarrier || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, duecarrier: e.target.value })}
                                        readOnly

                                    />
                                </div>
                                <div>
                                    <label htmlFor="gidueagentguia">Due Agent:</label>
                                    <input
                                        type="text"
                                        id="gidueagentguia"
                                        value={datosGuia.dueagent || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, dueagent: e.target.value })}
                                        readOnly

                                    />
                                </div>
                                <div>
                                    <label htmlFor="giverificacionguia">Verificación:</label>
                                    <input
                                        type="text"
                                        id="giverificacionguia"
                                        value={datosGuia.verificacion}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, verificacion: e.target.value })}

                                    />
                                </div>

                            </div>

                            <div className='div-primerrenglon-datos-comprobante'>

                                <div>
                                    <label htmlFor="gicollectfeeguia">Collect Fee:</label>
                                    <input
                                        type="text"
                                        id="gicollectfeeguia"
                                        value={datosGuia.collectfee || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, collectfee: e.target.value })}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gicfivaguia">CF IVA:</label>
                                    <input
                                        type="text"
                                        id="gicfivaguia"
                                        value={datosGuia.cfiva || 0}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, cfiva: e.target.value })}
                                        readOnly

                                    />
                                </div>

                                <div>
                                    <label htmlFor="giajusteguia">Ajuste:</label>
                                    <input
                                        type="text"
                                        id="giajusteguia"
                                        value={datosGuia.ajuste}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, ajuste: e.target.value })}
                                        readOnly
                                        required
                                    />
                                </div>
                                <div></div>
                            </div>


                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="gitotalguia">Total a Cobrar:</label>
                                    <input
                                        type="text"
                                        id="gitotalguia"
                                        value={datosGuia.total}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, total: e.target.value })}
                                        readOnly
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gitotaldelaguia">Total de la Guia:</label>
                                    <input
                                        type="text"
                                        id="gitotaldelaguia"
                                        value={datosGuia.totalguia}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, totalguia: e.target.value })}
                                        readOnly
                                        required
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
export default ModalModificarGuiaImpo;
