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


    // Construir condicionalmente elemento1 y puntoVenta
    let bloqueCondicionalCuentaAjena = "<autonumerar>S</autonumerar>";
    if (datos.EmpresaCuentaAjena) {
        const elemento1Valor =
            datos.EmpresaCuentaAjena === "Airclass"
                ? "AIRCLASS"
                : datos.EmpresaCuentaAjena === "AirEuropa"
                    ? "AIREUROPA"
                    : "";

        bloqueCondicionalCuentaAjena = `
        <elemento1>${elemento1Valor}</elemento1>
        <autonumerar>S</autonumerar>
        <puntoVenta></puntoVenta>`;
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
                ${bloqueCondicionalCuentaAjena}
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
                <tipoDocumento>${datosCA.datosEmpresa.codEfacCA}</tipoDocumento>

                <cliente>${datosCA.codigoClienteGIA}</cliente>
                <moneda>${moneda}</moneda>
                <fechaVencimiento>{{fechaVencimientoCFE}}</fechaVencimiento>
                <descripcion>{{Adenda}}</descripcion>
                <elemento1>${datosCA.EmpresaCuentaAjena === "Airclass"
            ? "AIRCLASS"
            : datosCA.EmpresaCuentaAjena === "AirEuropa"
                ? "AIREUROPA"
                : ""
        }</elemento1>
                <autonumerar>S</autonumerar>
                <puntoVenta></puntoVenta>
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
    //SI ME PAGAN EN PASOS PASO LOS TIPOS DE PAGO A PESOS
    if (datos.Moneda === 'UYU') {
        const conversionPagos = {
            CHQDOL: 'CHQPES',
            TRANDOL: 'TRANPES',
            EFEDOL: 'EFEPES',
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
                        <tipoDocumento>RECVTAS</tipoDocumento>
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

    let renglones = `
    <renglon>
        <producto>REC</producto>
        <nombreProducto>Cancelación de Facturas</nombreProducto>
        <cantidad>1</cantidad>
        <precioUnitario>${totalFormasPago}</precioUnitario>
    </renglon>
`;

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
        // 1. Identificamos si es un pago básico
        const esBasico = pago.formaPago === 'EFEDOL' || pago.formaPago === 'EFEPES' || pago.formaPago === 'DOCVZ';

        let contenidoExtra = '';

        //  Si NO es básico, asumimos que es Transferencia o Cheque (Pesos o Dólares)
        if (!esBasico) {
            contenidoExtra += `
        <elemento1>CTA 01</elemento1>
        <tipoDocumento>${pago.formaPago.includes('TRAN') ? 'TRANS' : 'DEP'}</tipoDocumento>
        <comprobante>${pago.comprobante}</comprobante>`;

            //    Si el nombre incluye "CHQ", le sumamos el vencimiento.
            if (pago.formaPago.includes('CHQ')) {
                contenidoExtra += `
        <vencimiento>${pago.vencimiento}</vencimiento>`;
            }
        }

        // 4. Construcción final del bloque
        formasPago += `
    <formaPago>
        <formaPago>${pago.formaPago}</formaPago>
        <importe>${pago.importe}</importe>${contenidoExtra}
    </formaPago>`;
    }

    xmlBase = xmlBase.replace('{{FormasPago}}', formasPago);

    console.log('XML Generado RECIBO:', xmlBase);
    return xmlBase;
}
function generarXmlNC(datos) {
    console.log('GENERANDO XML NOTA DE CRÉDITO:', datos);
    function escapeXml(value = "") {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
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
	                        {{RenglonesAutomaticos}}
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

    //Aca SE GENERAN LAS LINEAS DE LA NC
    let detallesRenglones = '';

    datos.cancelaciones.forEach((cancelacion, indexCancelacion) => {
        console.log(`🔹 Cancelación ${indexCancelacion + 1}: conceptos ->`, cancelacion.conceptos);

        if (Array.isArray(cancelacion.conceptos) && cancelacion.conceptos.length > 0) {
            cancelacion.conceptos.forEach((concepto) => {
                // Determinar el código de producto según si es factura manual o no
                let producto =
                    concepto.codigoGIA && concepto.codigoGIA !== ''
                        ? concepto.codigoGIA // factura manual
                        : concepto.id_concepto || 'SIN_CODIGO'; // factura no manual

                // Si es numérico y tiene una sola cifra, le agregamos un 0 adelante
                if (!isNaN(producto)) {
                    producto = String(producto).padStart(2, '0');
                }

                // Generar el bloque <renglon>
                detallesRenglones += `
          <renglon>
            <producto>${producto}</producto>
            <nombreProducto>${escapeXml(`${concepto.descripcion || 'Sin descripción'}`)}</nombreProducto>
            <cantidad>1</cantidad>
            <precioUnitario>${Number(concepto.importe || 0).toFixed(2)}</precioUnitario>
          </renglon>
        `;
            });
        }
    });

    // Si no hay renglones (fallback)
    if (!detallesRenglones.trim()) {
        detallesRenglones = `
      <renglon>
        <producto>COM004</producto>
        <nombreProducto>COBRO</nombreProducto>
        <cantidad>1</cantidad>
        <precioUnitario>${datos.precioUnitario || '0.00'}</precioUnitario>
      </renglon>
    `;
    }


    // Inyectar las cancelaciones en el XML
    xmlBase = xmlBase.replace('{{CancelacionesAutomaticas}}', detallesCancelaciones.trim());
    xmlBase = xmlBase.replace('{{RenglonesAutomaticos}}', detallesRenglones.trim());
    console.log('XML Generado NOTA DE CRÉDITO:', xmlBase);
    return xmlBase;
}
function generarXmlNCaCuenta(datos) {
    console.log('🧾 GENERANDO XML NOTA DE CRÉDITO A CUENTA:', datos);

    function escapeXml(value = "") {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    // Determinar código de moneda (según WS)
    const moneda = datos.Moneda === 'UYU' ? 1 : 2;

    // XML base (sin cancelaciones)
    let xmlBase = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
    <soapenv:Header/>
    <soapenv:Body>
      <soap:agregarDocumentoFacturacion>
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
              <descripcion>${escapeXml(datos.adenda || '-')}</descripcion>
              <autonumerar>S</autonumerar>
              <referenciaGlobal>${escapeXml(datos.referencia || 'N/C A CUENTA')}</referenciaGlobal>
              <renglones>
                {{RenglonesAutomaticos}}
              </renglones>
            </documento>
          </agregarDocumentoFacturacionParametros>
        ]]></xmlParametros>
      </soap:agregarDocumentoFacturacion>
    </soapenv:Body>
  </soapenv:Envelope>`;

    // 🧩 Generar renglones a partir de los conceptos
    let detallesRenglones = '';

    if (Array.isArray(datos.conceptos) && datos.conceptos.length > 0) {
        datos.conceptos.forEach((concepto, i) => {
            const codigo =
                concepto.id_concepto && concepto.id_concepto !== ''
                    ? concepto.id_concepto
                    : `C${(i + 1).toString().padStart(2, '0')}`;

            detallesRenglones += `
        <renglon>
          <producto>${escapeXml(codigo)}</producto>
          <nombreProducto>${escapeXml(concepto.descripcion || 'Sin descripción')}</nombreProducto>
          <cantidad>1</cantidad>
          <precioUnitario>${Number(concepto.importe || 0).toFixed(2)}</precioUnitario>
        </renglon>
      `;
        });
    } else {
        // fallback por si no hay conceptos
        detallesRenglones = `
      <renglon>
        <producto>GEN001</producto>
        <nombreProducto>NOTA DE CRÉDITO A CUENTA</nombreProducto>
        <cantidad>1</cantidad>
        <precioUnitario>${Number(datos.precioUnitario || 0).toFixed(2)}</precioUnitario>
      </renglon>
    `;
    }

    // Reemplazar placeholder
    xmlBase = xmlBase.replace('{{RenglonesAutomaticos}}', detallesRenglones.trim());

    console.log('✅ XML GENERADO N/C A CUENTA:\n', xmlBase);
    return xmlBase;
}


module.exports = { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp, generarXmlimpactarDocumento, generarXmlRecibo, generarXmlNC, generarXmlNCaCuenta };