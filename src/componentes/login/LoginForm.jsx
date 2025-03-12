import React, { useState } from 'react';
import './LoginForm.css';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { enviarFacturaSOAP } from '../../ConexionGFE/soapService';

const xml =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gfe="GFE_Client">
   <soapenv:Header/>
   <soapenv:Body>
      <gfe:WSExterno.GRABAR>
         <gfe:Xmlentrada>
         &lt;XMLEntrada&gt; 
 &lt;Datos&gt; 
 &lt;Dato&gt; 
 &lt;Valor&gt; 
 &lt;![CDATA[&lt;bandeja xmlns=&apos;GFE_Client&apos;&gt; 
 &lt;EmpCod&gt;REP&lt;/EmpCod&gt; 
 &lt;BanDocCodERP&gt;     52327&lt;/BanDocCodERP&gt; 
 &lt;BanTpoCFE&gt;       111&lt;/BanTpoCFE&gt; 
 &lt;BanSerCFE&gt;A&lt;/BanSerCFE&gt; 
 &lt;BanFchCFE&gt;2025/03/11&lt;/BanFchCFE&gt; 
 &lt;BanIndTpoTra&gt;0&lt;/BanIndTpoTra&gt; 
 &lt;BanForPag&gt;         2&lt;/BanForPag&gt; 
 &lt;BanFchVen&gt;&lt;/BanFchVen&gt; 
 &lt;BanCodTpoDocRec&gt;2&lt;/BanCodTpoDocRec&gt; 
 &lt;BanNumDocRec&gt;213287140010&lt;/BanNumDocRec&gt; 
 &lt;BanCodPaisRec&gt;UY&lt;/BanCodPaisRec&gt; 
 &lt;BanNomRec&gt;DSV AIR &amp; SEA URUGUAY S.A.&lt;/BanNomRec&gt; 
 &lt;BanDirRec&gt;Rincon 467, 6TH Floor.&lt;/BanDirRec&gt; 
 &lt;BanCiuRec&gt;MONTEVIDEO&lt;/BanCiuRec&gt; 
 &lt;BanDepRec&gt;MONTEVIDEO&lt;/BanDepRec&gt; 
 &lt;BanCodPosRec&gt;&lt;/BanCodPosRec&gt; 
 &lt;BanTpoMonTra&gt;USD&lt;/BanTpoMonTra&gt; 
 &lt;BanTpoCam&gt;    42.397&lt;/BanTpoCam&gt; 
 &lt;BanTMonNoGra&gt;      301.13&lt;/BanTMonNoGra&gt; 
 &lt;BanTMonExpAsi&gt;0.00&lt;/BanTMonExpAsi&gt; 
 &lt;BanTMonImpPer&gt;0.00&lt;/BanTMonImpPer&gt; 
 &lt;BanTMonIVASus&gt;0.00&lt;/BanTMonIVASus&gt; 
 &lt;BanTMonNetIMin&gt;0.00&lt;/BanTMonNetIMin&gt; 
 &lt;BanTotIVAMin&gt;0.00&lt;/BanTotIVAMin&gt; 
 &lt;BanTMonNetIBas&gt;        0.00&lt;/BanTMonNetIBas&gt; 
 &lt;BanTotIVABas&gt;        0.00&lt;/BanTotIVABas&gt; 
 &lt;BanTMonNetIOTas&gt;0.00&lt;/BanTMonNetIOTas&gt; 
 &lt;BanTotIVAOTas&gt;0.00&lt;/BanTotIVAOTas&gt; 
 &lt;BanTotMonTot&gt;      301.13&lt;/BanTotMonTot&gt; 
 &lt;BanTotMonRet&gt;0.00&lt;/BanTotMonRet&gt; 
 &lt;BanTotCreFis&gt;0.00&lt;/BanTotCreFis&gt; 
 &lt;BanMonNoFac&gt;        0.00&lt;/BanMonNoFac&gt; 
 &lt;BanMonTotPag&gt;      301.13&lt;/BanMonTotPag&gt; 
 &lt;BanCanLin&gt;8&lt;/BanCanLin&gt; 
 &lt;BanXMLCFE&gt;&lt;/BanXMLCFE&gt; 
 &lt;BanGenRepImp&gt;S&lt;/BanGenRepImp&gt; 
 &lt;BanSucCodErp&gt;S01&lt;/BanSucCodErp&gt; 
 &lt;BanPeCodErp&gt;&lt;/BanPeCodErp&gt; 
 &lt;BanAdenda&gt;Doc:52321 son dolares americanos u$s trescientos uno con trece centavos.&lt;/BanAdenda&gt; 
 &lt;BanTpoDocERP&gt;FACTURA DE CREDITO&lt;/BanTpoDocERP&gt; 
 &lt;BanNumDocERP&gt;     17913&lt;/BanNumDocERP&gt; 
 &lt;BanSerDocERP&gt;A&lt;/BanSerDocERP&gt; 
 &lt;BanEsEmisor&gt;&lt;/BanEsEmisor&gt; 
 &lt;BanRucCuAj&gt;217127640018&lt;/BanRucCuAj&gt; 
 &lt;BanTpoDocCuAj&gt;2&lt;/BanTpoDocCuAj&gt; 
 &lt;BanPaisCuAj&gt;UY&lt;/BanPaisCuAj&gt; 
 &lt;BanDocCuAj&gt;213623060013&lt;/BanDocCuAj&gt; 
 &lt;BanNomCuAj&gt;AeroVip Ltda.&lt;/BanNomCuAj&gt; 
 &lt;BanLin&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         1&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         0&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;5&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Viaje: VZ0104 27/02/2025/S  27/02/2025 Import&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         2&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         0&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;5&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;AWB: 510-10564455 EZE/EZE/MVD Cnt:0&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         3&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         8&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;1&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Verificacion Carga Recinto Aduanero: U$S 150.00&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;      150.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;      150.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         4&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;        47&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;1&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Redondeo: U$S 0.49&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.49&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.49&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         5&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         0&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;5&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Viaje: VZ0104 27/02/2025/S  27/02/2025 Import&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         6&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         0&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;5&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;AWB: 044-45236881 EZE/EZE/MVD Cnt:0&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         7&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;         8&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;1&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Verificacion Carga Recinto Aduanero: U$S 150.00&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;      150.00&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;      150.00&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;BanLinItem&gt; 
 &lt;NumLin&gt;         8&lt;/NumLin&gt; 
 &lt;BanLinCod&gt; 
 &lt;BanLinCodItem&gt; 
 &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt; 
 &lt;CodItem&gt;        47&lt;/CodItem&gt; 
 &lt;/BanLinCodItem&gt; 
 &lt;/BanLinCod&gt; 
 &lt;IndFac&gt;1&lt;/IndFac&gt; 
 &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt; 
 &lt;ItemNom&gt;Redondeo: U$S 0.64&lt;/ItemNom&gt; 
 &lt;ItemDes&gt;&lt;/ItemDes&gt; 
 &lt;ItemCan&gt;1&lt;/ItemCan&gt; 
 &lt;ItemUniMed&gt;UN&lt;/ItemUniMed&gt; 
 &lt;ItemPreUni&gt;        0.64&lt;/ItemPreUni&gt; 
 &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
 &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
 &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
 &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
 &lt;ItemMon&gt;        0.64&lt;/ItemMon&gt; 
 &lt;/BanLinItem&gt; 
 &lt;/BanLin&gt; 
 &lt;/bandeja&gt;]]&gt; 
 &lt;/Valor&gt; 
 &lt;Dato&gt; 
 &lt;Datos&gt; 
 &lt;XMLEntrada&gt; 
</gfe:Xmlentrada>
      </gfe:WSExterno.GRABAR>
   </soapenv:Body>
</soapenv:Envelope>`;



const LoginForm = ({ onLoginSuccess }) => {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const navigate = useNavigate();

    // Array de usuarios válidos
    const usuariosValidos = [
        { usuario: "admin", contraseña: "admin" },
        { usuario: "it", contraseña: "sistemas" }
    ];
    const enviarFacturaSOAP = async (xml) => {
        try {
            const response = await axios.post('http://localhost:3000/pruebaws', { xml });
            console.log('Respuesta del servidor SOAP:', response.data);
            if (response.data.success) {
                alert('✅ Factura procesada correctamente');
            } else {
                alert(`⚠️ Error: ${response.data.message}`);
            }

        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
    
            // Verifica si hay detalles del error HTTP
            if (error.response) {
                console.error('Error response data:', error.response.data);
    
                // Aquí accedemos correctamente al mensaje de error
                alert(`❌ Error: ${error.response.data.message}`);
            } else {
                alert('❌ Error al enviar la factura');
            }
        }
    };

    // Manejar el evento de submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita la recarga de la página
        enviarFacturaSOAP(xml);

        // Verificar si el usuario existe en el array
        const usuarioEncontrado = usuariosValidos.find(
            (u) => u.usuario === usuario && u.contraseña === contraseña
        );

        if (usuarioEncontrado) {
            onLoginSuccess(); // Llama a la función de login exitoso pasada desde el componente principal
            navigate('/home');


        } else {
            toast.error("Usuario o contraseña incorrectos");
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