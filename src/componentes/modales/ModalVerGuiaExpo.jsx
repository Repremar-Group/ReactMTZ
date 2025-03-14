import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ModalBusquedaClientes from './ModalBusquedaClientes';
import { convertirAComa, convertirADecimal } from '../funcionesgenerales';

const ModalVerGuiaExpo = ({ isOpen, closeModal, guia }) => {
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
        fetchCiudadesModificar();
        fetchMonedasModificar();
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
            [name]: value
        }));
    };

    // Búsqueda de clientes al presionar Enter
    const handleKeyPressModificar = async (e) => {
        if (e.key === 'Enter' && datosGuia.consignatario.trim()) {
            e.preventDefault();
            try {
                const response = await axios.get(`${backURL}/api/obtenernombrecliente?search=${datosGuia.consignatario}`);
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
                    fleteoriginal: convertirAComa(fleteCalculado.toFixed(2)),

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
                if (!datosGuia.fleteoriginal && datosGuia.tipodepagoguia != 'P') {
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
            if (!datosGuia.fleteoriginal && datosGuia.tipodepagoguia != 'C') {
                setDatosGuia(prevState => ({
                    ...prevState,
                    flete: '',
                    ivas3: '',
                    ajuste: ''
                }));
            }

        }
    }, [
        datosGuia.fleteoriginal,
        datosGuia.tipodepagoguia,
        datosGuia.verificacion,
        datosGuia.ivas3,
        datosGuia.duecarrier,
        datosGuia.dueagent
    ]);

    if (!isOpen) return null;
    return (
        <div onClick={closeModal} className="modal">
            <div className="modal-content-grande" onClick={(e) => e.stopPropagation()}>
                <h2 className='titulo-estandar'>Guía: {guia}</h2>
                {loading ? (
                    <div className="loading-spinner">
                        {/* El spinner se muestra cuando loading es true */}
                    </div>
                ) : (
                    <div>
                        <form className='formulario-estandar'>
                            <div className='div-primerrenglon-datos-comprobante'>
                                <div>
                                    <label htmlFor="geagente">Agente:</label>
                                    <input
                                        type="text"
                                        value={datosGuia.agente}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, guia: e.target.value })}
                                        required
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="geagente">Reserva:</label>
                                    <input
                                        type="text"
                                        value={datosGuia.reserva}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, guia: e.target.value })}
                                        required
                                        disabled
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
                                        disabled
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
                                        disabled
                                        value={datosGuia.piezas}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, piezas: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gipiezasguia">Peso Bruto:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        disabled
                                        value={datosGuia.pesobruto}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, pesobruto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gipiezasguia">Peso Tarifado:</label>
                                    <input
                                        type="number"
                                        id="gipiezasguia"
                                        disabled
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
                                        disabled
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
                                        disabled
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
                                        disabled
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
                                        disabled
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
                                        readOnly
                                        required
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giiva53guia">Due Agent:</label>
                                    <input
                                        type="text"
                                        id="giiva53guia"
                                        value={datosGuia.dueagent}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, dueagent: e.target.value })}
                                        readOnly
                                        required
                                        disabled
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
                                        disabled
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
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="giverificacionguia">Security:</label>
                                    <input
                                        type="text"
                                        id="giverificacionguia"
                                        value={datosGuia.security}
                                        onChange={(e) => setDatosGuia({ ...datosGuia, security: e.target.value })}
                                        disabled
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


                        </form>
                    </div>
                )}
            </div>
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
export default ModalVerGuiaExpo;
