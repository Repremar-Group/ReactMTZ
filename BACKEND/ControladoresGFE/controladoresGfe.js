const datos = {
    "facturaIdERP": "1234",
    "serieCFE": "A",
    "fechaCFE": "2025-03-13",
    "tipoDocRec": "1",
    "nroDocRec": "5678",
    "paisRec": "CL",
    "razonSocialRec": "Empresa X",
    "direccionRec": "Calle Falsa 123",
    "ciudadRec": "Santiago",
    "moneda": "CLP",
    "tipoCambio": "800",
    "totalNoGrabado": "1000.00",
    "totalACobrar": "5000.00",
    "cantidadLineasFactura": "2",
    "sucursal": "Sucursal1",
    "adenda": "Ninguna",
    "serieDocumentoERP": "S-1234",
    "rutCuentaAjena": "12345678-9",
    "paisCuentaAjena": "CL",
    "razonSocialCuentaAjena": "Cuenta Ajena",
    "detalleFactura": [
        {
            "codItem": "001",
            "indicadorFacturacion": "S",
            "nombreItem": "Producto A",
            "cantidad": "10",
            "unidadMedida": "UN",
            "precioUnitario": "100.00"
        },
        {
            "codItem": "002",
            "indicadorFacturacion": "S",
            "nombreItem": "Producto B",
            "cantidad": "5",
            "unidadMedida": "UN",
            "precioUnitario": "200.00"
        }
    ]
}
function generarXml(datos) {
    // XML base como texto
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gfe="GFE_Client">
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
 &lt;BanDocCodERP&gt;     {{facturaIdERP}}&lt;/BanDocCodERP&gt; 
 &lt;BanTpoCFE&gt;       111&lt;/BanTpoCFE&gt; 
 &lt;BanSerCFE&gt;{{serieCFE}}&lt;/BanSerCFE&gt; 
 &lt;BanFchCFE&gt;{{fechaCFE}}&lt;/BanFchCFE&gt; 
 &lt;BanIndTpoTra&gt;0&lt;/BanIndTpoTra&gt; 
 &lt;BanForPag&gt;         2&lt;/BanForPag&gt; 
 &lt;BanFchVen&gt;&lt;/BanFchVen&gt; 
 &lt;BanCodTpoDocRec&gt;{{tipoDocRec}}&lt;/BanCodTpoDocRec&gt; 
 &lt;BanNumDocRec&gt;{{nroDocRec}}&lt;/BanNumDocRec&gt; 
 &lt;BanCodPaisRec&gt;{{paisRec}}&lt;/BanCodPaisRec&gt; 
 &lt;BanNomRec&gt;{{razonSocialRec}}&lt;/BanNomRec&gt; 
 &lt;BanDirRec&gt;{{direccionRec}}&lt;/BanDirRec&gt; 
 &lt;BanCiuRec&gt;{{ciudadRec}}&lt;/BanCiuRec&gt; 
 &lt;BanDepRec&gt;{{depRec}}&lt;/BanDepRec&gt; 
 &lt;BanCodPosRec&gt;&lt;/BanCodPosRec&gt; 
 &lt;BanTpoMonTra&gt;{{moneda}}&lt;/BanTpoMonTra&gt; 
 &lt;BanTpoCam&gt;    {{tipoCambio}}&lt;/BanTpoCam&gt; 
 &lt;BanTMonNoGra&gt;      {{totalNoGrabado}}&lt;/BanTMonNoGra&gt; 
 &lt;BanTMonExpAsi&gt;0.00&lt;/BanTMonExpAsi&gt; 
 &lt;BanTMonImpPer&gt;0.00&lt;/BanTMonImpPer&gt; 
 &lt;BanTMonIVASus&gt;0.00&lt;/BanTMonIVASus&gt; 
 &lt;BanTMonNetIMin&gt;0.00&lt;/BanTMonNetIMin&gt; 
 &lt;BanTotIVAMin&gt;0.00&lt;/BanTotIVAMin&gt; 
 &lt;BanTMonNetIBas&gt;        0.00&lt;/BanTMonNetIBas&gt; 
 &lt;BanTotIVABas&gt;        0.00&lt;/BanTotIVABas&gt; 
 &lt;BanTMonNetIOTas&gt;0.00&lt;/BanTMonNetIOTas&gt; 
 &lt;BanTotIVAOTas&gt;0.00&lt;/BanTotIVAOTas&gt; 
 &lt;BanTotMonTot&gt;      {{totalACobrar}}&lt;/BanTotMonTot&gt; 
 &lt;BanTotMonRet&gt;0.00&lt;/BanTotMonRet&gt; 
 &lt;BanTotCreFis&gt;0.00&lt;/BanTotCreFis&gt; 
 &lt;BanMonNoFac&gt;        0.00&lt;/BanMonNoFac&gt; 
 &lt;BanMonTotPag&gt;      {{totalACobrar2}}&lt;/BanMonTotPag&gt; 
 &lt;BanCanLin&gt;{{cantidadLineasFactura}}&lt;/BanCanLin&gt; 
 &lt;BanXMLCFE&gt;&lt;/BanXMLCFE&gt; 
 &lt;BanGenRepImp&gt;S&lt;/BanGenRepImp&gt; 
 &lt;BanSucCodErp&gt;{{sucursal}}&lt;/BanSucCodErp&gt; 
 &lt;BanPeCodErp&gt;&lt;/BanPeCodErp&gt; 
 &lt;BanAdenda&gt;{{adenda}}&lt;/BanAdenda&gt; 
 &lt;BanTpoDocERP&gt;FACTURA DE CREDITO&lt;/BanTpoDocERP&gt; 
 &lt;BanNumDocERP&gt;     {{facturaIdERP2}}&lt;/BanNumDocERP&gt; 
 &lt;BanSerDocERP&gt;{{serieDocumentoERP}}&lt;/BanSerDocERP&gt; 
 &lt;BanEsEmisor&gt;&lt;/BanEsEmisor&gt; 
 &lt;BanRucCuAj&gt;{{rutCuentaAjena}}&lt;/BanRucCuAj&gt; 
 &lt;BanTpoDocCuAj&gt;2&lt;/BanTpoDocCuAj&gt; 
 &lt;BanPaisCuAj&gt;{{paisCuentaAjena}}&lt;/BanPaisCuAj&gt; 
 &lt;BanDocCuAj&gt;{{rutCuentaAjena2}}&lt;/BanDocCuAj&gt; 
 &lt;BanNomCuAj&gt;{{razonSocialCuentaAjena}}&lt;/BanNomCuAj&gt; 
 &lt;BanLin&gt; 
{{detalleFactura}}
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

    // Reemplazar las partes del XML base con los valores de los parámetros
    xmlBase = xmlBase.replace('{{facturaIdERP}}', datos.facturaIdERP)
        .replace('{{serieCFE}}', datos.serieCFE)
        .replace('{{fechaCFE}}', datos.fechaCFE)
        .replace('{{tipoDocRec}}', datos.tipoDocRec)
        .replace('{{nroDocRec}}', datos.nroDocRec)
        .replace('{{paisRec}}', datos.paisRec)
        .replace('{{razonSocialRec}}', datos.razonSocialRec)
        .replace('{{direccionRec}}', datos.direccionRec)
        .replace('{{ciudadRec}}', datos.ciudadRec)
        .replace('{{depRec}}', datos.ciudadRec)
        .replace('{{moneda}}', datos.moneda)
        .replace('{{tipoCambio}}', datos.tipoCambio)
        .replace('{{totalNoGrabado}}', datos.totalNoGrabado)
        .replace('{{totalACobrar}}', datos.totalACobrar)
        .replace('{{totalACobrar2}}', datos.totalACobrar)
        .replace('{{cantidadLineasFactura}}', datos.cantidadLineasFactura)
        .replace('{{sucursal}}', datos.sucursal)
        .replace('{{adenda}}', datos.adenda)
        .replace('{{facturaIdERP2}}', datos.facturaIdERP)
        .replace('{{serieDocumentoERP}}', datos.serieDocumentoERP)
        .replace('{{rutCuentaAjena}}', datos.rutCuentaAjena)
        .replace('{{paisCuentaAjena}}', datos.paisCuentaAjena)
        .replace('{{rutCuentaAjena2}}', datos.rutCuentaAjena)
        .replace('{{razonSocialCuentaAjena}}', datos.razonSocialCuentaAjena);

    // Generar el bloque de detalles de factura
    let detallesFactura = '';
    for (let i = 0; i < datos.detalleFactura.length; i++) {
        let detalle = datos.detalleFactura[i];
        detallesFactura += `
            &lt;BanLinItem&gt;
            &lt;NumLin&gt;${i + 1}&lt;/NumLin&gt;
            &lt;BanLinCod&gt;
            &lt;BanLinCodItem&gt;
            &lt;TpoCodItem&gt;INT1&lt;/TpoCodItem&gt;
            &lt;CodItem&gt;${detalle.codItem || '0'}&lt;/CodItem&gt;
            &lt;/BanLinCodItem&gt;
            &lt;/BanLinCod&gt;
            &lt;IndFac&gt;${detalle.indicadorFacturacion}&lt;/IndFac&gt;
            &lt;IndAgeRes&gt;&lt;/IndAgeRes&gt;
            &lt;ItemNom&gt;${detalle.nombreItem}&lt;/ItemNom&gt;
            &lt;ItemDes&gt;&lt;/ItemDes&gt; 
            &lt;ItemCan&gt;${detalle.cantidad}&lt;/ItemCan&gt;
            &lt;ItemUniMed&gt;${detalle.unidadMedida || 'UN'}&lt;/ItemUniMed&gt;
            &lt;ItemPreUni&gt;${detalle.precioUnitario || '0.00'}&lt;/ItemPreUni&gt;
            &lt;ItemDesPor&gt;0.000&lt;/ItemDesPor&gt; 
            &lt;ItemMonDes&gt;0.00&lt;/ItemMonDes&gt; 
            &lt;ItemRecPor&gt;&lt;/ItemRecPor&gt; 
            &lt;ItemRecMon&gt;&lt;/ItemRecMon&gt; 
            &lt;ItemMon&gt;        ${detalle.precioUnitario || '0.00'}&lt;/ItemMon&gt; 
            &lt;/BanLinItem&gt;`;
    }

    // Reemplazar el marcador {{detalleFactura}} con los detalles generados
    xmlBase = xmlBase.replace('{{detalleFactura}}', detallesFactura);

    return xmlBase;
}
generarXml(datos);

module.exports = { generarXml };