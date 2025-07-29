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
                <fechaVencimiento>{{fechaVencimientoCFE}}</fechaVencimiento>
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
        .replace('{{fechaVencimientoCFE}}', datos.fechaVencimientoCFE)
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
                <fechaVencimiento>{{fechaVencimientoCFE}}</fechaVencimiento>
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
        .replace('{{fechaVencimientoCFE}}', datos.fechaVencimientoCFE)
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
                <fechaVencimiento>{{fechaVencimientoCFE}}</fechaVencimiento>
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
        .replace('{{fechaVencimientoCFE}}', datosCA.fechaVencimientoCFE)
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
function generarXmlRecibo(datos) {
    let moneda = datos.Moneda === 'UYU' ? 1 : 2;

    console.log('GENERANDO XML RECIBO:', datos);

    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <xmlParametros><![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>${datos.datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datos.datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datos.datosEmpresa.codigoEmpresa}</empresa>
                    <documento>
                        <fechaDocumento>{{fechaCFE}}</fechaDocumento>
                        <tipoDocumento>rec</tipoDocumento>
                        <cliente>${datos.codigoClienteGIA}</cliente>
                        <moneda>${moneda}</moneda>
                        <fechaVencimiento>{{fechaVencimientoCFE}}</fechaVencimiento>
                        <descripcion>{{Adenda}}</descripcion>
                        <renglones>
	                        {{Renglones}}
                        </renglones>
                        <cancelaciones>
                            {{Cancelaciones}}
                        </cancelaciones>
                        <formasPago>
                            {{FormasPago}}
                        </formasPago>
                    </documento>
                </agregarDocumentoFacturacionParametros>
            ]]></xmlParametros>
      </soap:agregarDocumentoFacturacion>
   </soapenv:Body>
</soapenv:Envelope>`;

    // Reemplazo de valores simples
    xmlBase = xmlBase.replace('{{fechaCFE}}', datos.fechaCFE)
                     .replace('{{fechaVencimientoCFE}}', datos.fechaVencimientoCFE)
                     .replace('{{Adenda}}', datos.adendadoc);

    // Generar <renglones> desde formas de pago
    let renglones = '';
    for (let renglon of datos.formasPago) {
        renglones += `
            <renglon>
                <producto>COM004</producto>
                <nombreProducto>COBRO</nombreProducto>
                <cantidad>1</cantidad>
                <precioUnitario>${renglon.importe}</precioUnitario>
            </renglon>`;
    }
    xmlBase = xmlBase.replace('{{Renglones}}', renglones);

    // Generar bloque <cancelaciones>
    let cancelaciones = '';
    for (let cancelacion of datos.cancelaciones) {
        cancelaciones += `
            <cancelacion>
                <rubroAfectado>${cancelacion.rubroAfectado}</rubroAfectado>
                <tipoDocumentoAfectado>${cancelacion.tipoDocumentoAfectado}</tipoDocumentoAfectado>
                <comprobanteAfectado>${cancelacion.comprobanteAfectado}</comprobanteAfectado>
                <vencimientoAfectado>${cancelacion.vencimientoAfectado}</vencimientoAfectado>
                <importe>${cancelacion.importe}</importe>
            </cancelacion>`;
    }
    xmlBase = xmlBase.replace('{{Cancelaciones}}', cancelaciones);

    // Generar bloque <formasPago>
    let formasPago = '';
    for (let pago of datos.formasPago) {
        formasPago += `
            <formaPago>
                <formaPago>${pago.formaPago}</formaPago>
                <importe>${pago.importe}</importe>
                <comprobante>${pago.comprobante}</comprobante>
                <vencimiento>${pago.vencimiento}</vencimiento>
            </formaPago>`;
    }
    xmlBase = xmlBase.replace('{{FormasPago}}', formasPago);

    console.log('XML Generado RECIBO:', xmlBase);
    return xmlBase;
}


module.exports = { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp,generarXmlimpactarDocumento, generarXmlRecibo};