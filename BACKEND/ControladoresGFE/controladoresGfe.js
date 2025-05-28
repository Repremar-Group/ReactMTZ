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
const datosCA = {
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
    "detalleFacturaCuentaAjena": [
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
function generarXmlefacimpopp(datos) {
    console.log('GENERANDO XML EFACTURA:',datos);
    // XML base como texto
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <!--Optional:-->
         <xmlParametros>
            <![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>DATALOG</usuario>
                <usuarioPassword>DATALOG01</usuarioPassword>
                <empresa>REP</empresa>
                <documento>
                <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                <tipoDocumento>FCD</tipoDocumento>

                <cliente>REP20</cliente>
                <moneda>2</moneda>
                <fechaVencimiento>{{fechaCFE}}</fechaVencimiento>
                <descripcion>{{Adenda}}</descripcion>
                <autonumerar>S</autonumerar>
                <renglones>

                {{RenglonesAutomaticos}}

                </renglones>
                </documento>
                </agregarDocumentoFacturacionParametros>
            ]]>
</xmlParametros>
      </soap:agregarDocumentoFacturacion>
   </soapenv:Body>
</soapenv:Envelope>`;

    // Reemplazar las partes del XML base con los valores de los parámetros
    xmlBase = xmlBase.replace('{{fechaCFE}}', datos.fechaCFE)
        .replace('{{fechaCFE}}', datos.fechaCFE)
        .replace('{{Adenda}}', datos.adendadoc);

    // Generar el bloque de detalles de factura
    let detallesFactura = '';
    for (let i = 0; i < datos.detalleFactura.length; i++) {
        let detalle = datos.detalleFactura[i];
        detallesFactura += `
                <renglon>
                <producto>${detalle.codItem}</producto>
                <nombreProducto>${detalle.nombreItem}</nombreProducto>
                <cantidad>${detalle.cantidad}</cantidad>
                <precioUnitario>${detalle.precioUnitario || '0.00'}</precioUnitario>
                </renglon>
            `;
    }

    // Reemplazar el marcador {{RenglonesAutomaticos}} con los detalles generados
    xmlBase = xmlBase.replace('{{RenglonesAutomaticos}}', detallesFactura);
    console.log('XML Generado EFACTURA:', xmlBase);

    return xmlBase;
}


function generarXmlefacCuentaAjenaimpopp(datosCA) {
    console.log('GENERANDO XML EFACTURA CUENTA AJENA:',datosCA);
    // XML base como texto
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <!--Optional:-->
         <xmlParametros>
            <![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>DATALOG</usuario>
                <usuarioPassword>DATALOG01</usuarioPassword>
                <empresa>REP</empresa>
                <documento>
                <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                <tipoDocumento>FCA</tipoDocumento>

                <cliente>REP20</cliente>
                <moneda>2</moneda>
                <fechaVencimiento>{{fechaCFE}}</fechaVencimiento>
                <descripcion>{{Adenda}}</descripcion>
                <autonumerar>S</autonumerar>
                <renglones>

                {{RenglonesAutomaticos}}

                </renglones>
                </documento>
                </agregarDocumentoFacturacionParametros>
            ]]>
</xmlParametros>
      </soap:agregarDocumentoFacturacion>
   </soapenv:Body>
</soapenv:Envelope>`;

    // Reemplazar las partes del XML base con los valores de los parámetros
    xmlBase = xmlBase.replace('{{fechaCFE}}', datosCA.fechaCFE)
        .replace('{{fechaCFE}}', datosCA.fechaCFE)
        .replace('{{Adenda}}', datosCA.adendadoc);

    // Generar el bloque de detalles de factura
    let detallesFactura = '';
    for (let i = 0; i < datosCA.detalleFacturaCuentaAjena.length; i++) {
        let detalle = datosCA.detalleFacturaCuentaAjena[i];
        detallesFactura += `
                <renglon>
                <producto>${detalle.codItem}</producto>
                <nombreProducto>${detalle.nombreItem}</nombreProducto>
                <cantidad>${detalle.cantidad}</cantidad>
                <precioUnitario>${detalle.precioUnitario || '0.00'}</precioUnitario>
                </renglon>
            `;
    }

    // Reemplazar el marcador {{RenglonesAutomaticos}} con los detalles generados
    xmlBase = xmlBase.replace('{{RenglonesAutomaticos}}', detallesFactura);
    console.log('XML Generado EFACTURA CUENTA AJENA:', xmlBase);

    return xmlBase;
}

function generarXmlCotizaciones(fecha) {
    console.log('GENERANDO XML COTIZACIONES para:', fecha);

    let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:procesoCargarCotizacionesBcu>
         <!--Optional:-->
         <xmlParametros>
         <![CDATA[
<procesoCargarCotizacionesBcuParametros>
    <usuario>DATALOG</usuario>
    <usuarioPassword>DATALOG01</usuarioPassword>
    <empresa>REP</empresa>
    <parametros>
        <fecha>${fecha}</fecha>
    </parametros>
</procesoCargarCotizacionesBcuParametros>
         ]]>
</xmlParametros>
      </soap:procesoCargarCotizacionesBcu>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log('XML Generado COTIZACIONES:', xml);
    return xml;
}

generarXmlefacCuentaAjenaimpopp(datosCA);
generarXmlefacimpopp(datos);
module.exports = { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp, generarXmlCotizaciones};