import axios from "axios";

// URL del web service SOAP
const SOAP_URL = "http://srvgfe.grep.local:8082/gfeclient/servlet/awsexterno";

// Función para construir el XML dinámicamente
const generarXMLEfactura = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gfe="GFE_Client">
     <soapenv:Header/>
     <soapenv:Body>
        <gfe:WSExterno.GRABAR>
         <gfe:Xmlentrada>
            <XMLEntrada> 
                <Datos> 
                    <Dato> 
                        <Valor> 
                            <![CDATA[<bandeja xmlns='GFE_Client'> 
                            <EmpCod>KIX</EmpCod> 
                            <BanDocCodERP>     52321</BanDocCodERP> 
                            <BanTpoCFE>       111</BanTpoCFE> 
                            <BanSerCFE>A</BanSerCFE> 
                            <BanNumCFE>     17913</BanNumCFE> 
                            <BanFchCFE>2025/02/28</BanFchCFE> 
                            <BanIndTpoTra>0</BanIndTpoTra> 
                            <BanForPag>         2</BanForPag> 
                            <BanFchVen></BanFchVen> 
                            <BanCodTpoDocRec>2</BanCodTpoDocRec> 
                            <BanNumDocRec>213287140010</BanNumDocRec> 
                            <BanCodPaisRec>UY</BanCodPaisRec> 
                            <BanNomRec>DSV AIR & SEA URUGUAY S.A.</BanNomRec> 
                            <BanDirRec>Rincon 467, 6TH Floor.</BanDirRec> 
                            <BanCiuRec>MONTEVIDEO</BanCiuRec> 
                            <BanDepRec>MONTEVIDEO</BanDepRec> 
                            <BanCodPosRec></BanCodPosRec> 
                            <BanTpoMonTra>USD</BanTpoMonTra> 
                            <BanTpoCam>    42.397</BanTpoCam> 
                            <BanTMonNoGra>      301.13</BanTMonNoGra> 
                            <BanTMonExpAsi>0.00</BanTMonExpAsi> 
                            <BanTMonImpPer>0.00</BanTMonImpPer> 
                            <BanTMonIVASus>0.00</BanTMonIVASus> 
                            <BanTMonNetIMin>0.00</BanTMonNetIMin> 
                            <BanTotIVAMin>0.00</BanTotIVAMin> 
                            <BanTMonNetIBas>        0.00</BanTMonNetIBas> 
                            <BanTotIVABas>        0.00</BanTotIVABas> 
                            <BanTMonNetIOTas>0.00</BanTMonNetIOTas> 
                            <BanTotIVAOTas>0.00</BanTotIVAOTas> 
                            <BanTotMonTot>      301.13</BanTotMonTot> 
                            <BanTotMonRet>0.00</BanTotMonRet> 
                            <BanTotCreFis>0.00</BanTotCreFis> 
                            <BanMonNoFac>        0.00</BanMonNoFac> 
                            <BanMonTotPag>      301.13</BanMonTotPag> 
                            <BanCanLin>8</BanCanLin> 
                            <BanXMLCFE></BanXMLCFE> 
                            <BanGenRepImp>S</BanGenRepImp> 
                            <BanSucCodErp>S01</BanSucCodErp> 
                            <BanPeCodErp></BanPeCodErp> 
                            <BanAdenda>Doc:52321 son dolares americanos u$s trescientos uno con trece centavos.</BanAdenda> 
                            <BanTpoDocERP>FACTURA DE CREDITO</BanTpoDocERP> 
                            <BanNumDocERP>     17913</BanNumDocERP> 
                            <BanSerDocERP>A</BanSerDocERP> 
                            <BanRutaPDF>c:\PDF Kixoler TEST</BanRutaPDF> 
                            <BanEsEmisor></BanEsEmisor> 
                            <BanRucCuAj>217127640018</BanRucCuAj> 
                            <BanTpoDocCuAj>2</BanTpoDocCuAj> 
                            <BanPaisCuAj>UY</BanPaisCuAj> 
                            <BanDocCuAj>213623060013</BanDocCuAj> 
                            <BanNomCuAj>AeroVip Ltda.</BanNomCuAj> 
                            <BanLin> 
                            <BanLinItem> 
                            <NumLin>         1</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         0</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>5</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Viaje: VZ0104 27/02/2025/S  27/02/2025 Import</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         2</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         0</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>5</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>AWB: 510-10564455 EZE/EZE/MVD Cnt:0</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         3</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         8</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>1</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Verificacion Carga Recinto Aduanero: U$S 150.00</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>      150.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>      150.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         4</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>        47</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>1</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Redondeo: U$S 0.49</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.49</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.49</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         5</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         0</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>5</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Viaje: VZ0104 27/02/2025/S  27/02/2025 Import</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         6</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         0</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>5</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>AWB: 044-45236881 EZE/EZE/MVD Cnt:0</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         7</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>         8</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>1</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Verificacion Carga Recinto Aduanero: U$S 150.00</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>      150.00</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>      150.00</ItemMon> 
                            </BanLinItem> 
                            <BanLinItem> 
                            <NumLin>         8</NumLin> 
                            <BanLinCod> 
                            <BanLinCodItem> 
                            <TpoCodItem>INT1</TpoCodItem> 
                            <CodItem>        47</CodItem> 
                            </BanLinCodItem> 
                            </BanLinCod> 
                            <IndFac>1</IndFac> 
                            <IndAgeRes></IndAgeRes> 
                            <ItemNom>Redondeo: U$S 0.64</ItemNom> 
                            <ItemDes></ItemDes> 
                            <ItemCan>1</ItemCan> 
                            <ItemUniMed>UN</ItemUniMed> 
                            <ItemPreUni>        0.64</ItemPreUni> 
                            <ItemDesPor>0.000</ItemDesPor> 
                            <ItemMonDes>0.00</ItemMonDes> 
                            <ItemRecPor></ItemRecPor> 
                            <ItemRecMon></ItemRecMon> 
                            <ItemMon>        0.64</ItemMon> 
                            </BanLinItem> 
                            </BanLin> 
                            </bandeja>]]> 
                        </Valor> 
                    <Dato> 
                <Datos> 
            <XMLEntrada> 
        </gfe:Xmlentrada>
      </gfe:WSExterno.GRABAR>
   </soapenv:Body>
</soapenv:Envelope>`;
};

// Función para enviar la solicitud SOAP
export const enviarFacturaSOAP = async () => {
    const xml = generarXMLEfactura();

    try {
        const response = await axios.post(SOAP_URL, xml, {
            headers: {
                "Content-Type": "text/xml;charset=UTF-8",
                "SOAPAction": "GFE_Clientaction/AWSEXTERNO.GRABAR",
            },
        });

        return response.data; // Devuelve la respuesta del servidor SOAP
    } catch (error) {
        console.error("Error al enviar factura:", error);
        throw error;
    }
};
