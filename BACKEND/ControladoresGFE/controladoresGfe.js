function generarXmlefacimpopp(datos) {
    let moneda;
    if(datos.Moneda === 'UYU'){
        moneda = 1;
    } else {
        moneda = 2
    }
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
                <usuario>${datos.datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datos.datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datos.datosEmpresa.codigoEmpresa}</empresa>
                <documento>
                <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                <tipoDocumento>${datos.datosEmpresa.codEfac}</tipoDocumento>

                <cliente>${datos.codigoClienteGIA}</cliente>
                <moneda>${moneda}</moneda>
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

function generarXmlimpactarDocumento(datos) {
    console.log('GENERANDO XML EFACTURA:',datos);
    // XML base como texto
        let moneda;
     if(datos.Moneda === 'UYU'){
        moneda = 1;
    } else {
        moneda = 2
    }
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <!--Optional:-->
         <xmlParametros>
            <![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>${datos.datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datos.datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datos.datosEmpresa.codigoEmpresa}</empresa>
                <documento>
                <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                <tipoDocumento>${datos.tipoComprobante}</tipoDocumento>

                <cliente>${datos.codigoClienteGIA}</cliente>
                <moneda>${moneda}</moneda>
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
    let moneda;
     if(datosCA.Moneda === 'UYU'){
        moneda = 1;
    } else {
        moneda = 2
    }
    // XML base como texto
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <!--Optional:-->
         <xmlParametros>
            <![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>${datosCA.datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datosCA.datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datosCA.datosEmpresa.codigoEmpresa}</empresa>
                <documento>
                <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                <tipoDocumento>FCA</tipoDocumento>

                <cliente>${datosCA.codigoClienteGIA}</cliente>
                <moneda>${moneda}</moneda>
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

module.exports = { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp,generarXmlimpactarDocumento};