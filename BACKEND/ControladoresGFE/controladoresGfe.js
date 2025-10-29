function generarXmlefacimpopp(datos) {
    let moneda;
    if (datos.Moneda === 'UYU') {
        moneda = 1;
    } else {
        moneda = 2
    }
    console.log('GENERANDO XML EFACTURA:', datos);
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
    console.log('GENERANDO XML EFACTURA:', datos);
    // XML base como texto
    let moneda;
    if (datos.Moneda === 'UYU') {
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
    console.log('GENERANDO XML EFACTURA CUENTA AJENA:', datosCA);
    let moneda;
    if (datosCA.Moneda === 'UYU') {
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
    // 1. Calcular sumas
    const totalFormasPago = datos.formasPago.reduce((acc, item) => acc + Number(item.importe || 0), 0);
    const totalCancelaciones = datos.cancelaciones.reduce((acc, item) => acc + Number(item.importe || 0), 0);

    // 2. Determinar moneda y cotización
    let moneda;
    let cotizacion = null;

    if (datos.Moneda === 'UYU' && totalFormasPago !== totalCancelaciones) {
        moneda = 2; // Pago en pesos para cancelar factura en dólares
        // Evitar división por cero
        if (totalCancelaciones > 0) {
            cotizacion = (totalFormasPago / totalCancelaciones).toFixed(6); // puedes ajustar los decimales
        }
    } else {
        moneda = datos.Moneda === 'UYU' ? 1 : 2;
    }

    console.log(`TOTAL FORMAS PAGO: ${totalFormasPago}`);
    console.log(`TOTAL CANCELACIONES: ${totalCancelaciones}`);
    console.log(`MONEDA A USAR: ${moneda}`);
    if (cotizacion) console.log(`COTIZACION CALCULADA: ${cotizacion}`);

    console.log('GENERANDO XML RECIBO:', datos);

    if (datos.Moneda === 'UYU') {
        const conversionPagos = {
            CHEQUEUS: 'CHEQUEMN',
            TRANSUSD: 'TRANSMN'
        };
        datos.formasPago = datos.formasPago.map(pago => ({
            ...pago,
            formaPago: conversionPagos[pago.formaPago] || pago.formaPago
        }));
    }


    // 3. Armar XML
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
                        ${cotizacion ? `<cotizacion>${cotizacion}</cotizacion>` : ''}
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

    // Generar <renglones>
    let renglones = '';
    for (let renglon of datos.formasPago) {
        // Si moneda es UYU y hay cotización, convertir importe a dólares
        let precioUnitario = renglon.importe;
        if (datos.Moneda === 'UYU' && totalFormasPago !== totalCancelaciones && cotizacion) {
            precioUnitario = (Number(renglon.importe) / Number(cotizacion)).toFixed(2);
        }

        renglones += `
        <renglon>
            <producto>COM004</producto>
            <nombreProducto>COBRO</nombreProducto>
            <cantidad>1</cantidad>
            <precioUnitario>${precioUnitario}</precioUnitario>
        </renglon>`;
    }
    xmlBase = xmlBase.replace('{{Renglones}}', renglones);

    // Generar <cancelaciones>
    let cancelaciones = '';
    if (datos.aCuenta) {
        // Caso "a cuenta": una sola cancelación con importe total del recibo
        cancelaciones = `
            <cancelacion>
                <rubroAfectado>${datos.datosEmpresa.rubDeudores}</rubroAfectado>
                <importe>${totalFormasPago.toFixed(2)}</importe>
            </cancelacion>`;
    } else {
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
    }
    xmlBase = xmlBase.replace('{{Cancelaciones}}', cancelaciones);

    // Generar <formasPago>
    let formasPago = '';
    for (let pago of datos.formasPago) {
        const esCaja = pago.formaPago === 'CAJAUYU' || pago.formaPago === 'CAJAUSD';

        // Contenido extra si es CHEQUEMN o TRANSMN
        let extraCampos = '';
        if (pago.formaPago === 'CHEQUEMN' || pago.formaPago === 'TRANSMN') {
            extraCampos = `
        <elemento1>CTA01</elemento1>
        <tipoDocumento>CHQ</tipoDocumento>`;
        }

        formasPago += `
    <formaPago>
        <formaPago>${pago.formaPago}</formaPago>
        <importe>${pago.importe}</importe>
        ${extraCampos}` +
            (!esCaja ? `
        <comprobante>${pago.comprobante}</comprobante>
        <vencimiento>${pago.vencimiento}</vencimiento>` : '') + `
    </formaPago>`;
    }
    xmlBase = xmlBase.replace('{{FormasPago}}', formasPago);

    console.log('XML Generado RECIBO:', xmlBase);
    return xmlBase;
}
function generarXmlNC(datos) {
    console.log('GENERANDO XML NOTA DE CRÉDITO:', datos);

    // Determinar código de moneda
    let moneda = datos.Moneda === 'UYU' ? 1 : 2;

    // XML base con placeholders
    let xmlBase = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
   <soapenv:Header/>
   <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
         <!--Optional:-->
         <xmlParametros><![CDATA[
                <agregarDocumentoFacturacionParametros>
                <usuario>${datos.datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datos.datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datos.datosEmpresa.codigoEmpresa}</empresa>
                    <documento>
                        <fechaDocumento>${datos.fechaCFE}</fechaDocumento>
                        <tipoDocumento>${datos.tipoComprobante}</tipoDocumento>
                        <cliente>${datos.codigoClienteGIA}</cliente>
                        <moneda>${moneda}</moneda>
                        <fechaVencimiento>${datos.fechaVencimientoCFE}</fechaVencimiento>
                        <descripcion>${datos.adendadoc}</descripcion>
                        <autonumerar>S</autonumerar>
                        <renglones>
	                        <renglon>
		                        <producto>COM004</producto>
		                        <nombreProducto>COBRO</nombreProducto>
		                        <cantidad>1</cantidad>
		                        <precioUnitario>${datos.precioUnitario || '0.00'}</precioUnitario>
	                        </renglon>
                        </renglones>
                        <cancelaciones> 
                            {{CancelacionesAutomaticas}}
                        </cancelaciones>
                    </documento>
                </agregarDocumentoFacturacionParametros>
            ]]></xmlParametros>
      </soap:agregarDocumentoFacturacion>
   </soapenv:Body>
</soapenv:Envelope>`;

    // Generar cancelaciones dinámicamente
    let detallesCancelaciones = '';
    for (let i = 0; i < datos.cancelaciones.length; i++) {
        let c = datos.cancelaciones[i];
        detallesCancelaciones += `
            <cancelacion> 
                <rubroAfectado>${c.rubroAfectado}</rubroAfectado>
                <tipoDocumentoAfectado>${c.tipoDocumentoAfectado}</tipoDocumentoAfectado> 
                <comprobanteAfectado>${c.comprobanteAfectado}</comprobanteAfectado> 
                <vencimientoAfectado>${c.vencimientoAfectado}</vencimientoAfectado> 
                <importe>${c.importe}</importe> 
            </cancelacion>
        `;
    }

    // Inyectar las cancelaciones en el XML
    xmlBase = xmlBase.replace('{{CancelacionesAutomaticas}}', detallesCancelaciones.trim());

    console.log('XML Generado NOTA DE CRÉDITO:', xmlBase);
    return xmlBase;
}


module.exports = { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp, generarXmlimpactarDocumento, generarXmlRecibo, generarXmlNC };