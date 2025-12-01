
const express = require('express');
const mysql = require('mysql');
const mysql2 = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const { NumeroALetras } = require('./numeroALetras');
const axios = require('axios');
const xml2js = require('xml2js');
const { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp, generarXmlimpactarDocumento, generarXmlRecibo, generarXmlNC, generarXmlNCaCuenta } = require('./ControladoresGFE/controladoresGfe')
const { obtenerDatosEmpresa } = require('./ControladoresGFE/datosdelaempresaGFE')
const cron = require('node-cron');
const { Console } = require('console');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

const multer = require('multer');
const xlsx = require('xlsx');

// crea carpeta uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });


const port = process.env.PORT || 5000;
const logger = require("./logger");

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Reemplazamos console.log
console.log = (...args) => {
  originalLog(...args);
  logger.info(args.join(" "));
};

// Reemplazamos console.error
console.error = (...args) => {
  originalError(...args);
  logger.error(args.join(" "));
};

// Reemplazamos console.warn
console.warn = (...args) => {
  originalWarn(...args);
  logger.warn(args.join(" "));
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alertasairbillcielosur@gmail.com', // cuenta de Gmail
    pass: 'rjlb wzca mlcw tlgh' // Contraseña de aplicacion
  }
});

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
// Pool de conexiones mysqlmaximo 10 
const pool = mysql2.createPool({
  host: 'cielosurinvoicedb.mysql.database.azure.com',
  user: 'cielosurdb',
  password: 'nujqeg-giwfes-6jynzA',
  database: 'cielosurinvoiceprod',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000
});

const connection = mysql.createConnection({
  host: 'cielosurinvoicedb.mysql.database.azure.com',
  user: 'cielosurdb',
  password: 'nujqeg-giwfes-6jynzA',
  database: 'cielosurinvoiceprod',
  port: 3306,
  connectTimeout: 60000,
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

const app = express();

app.use(express.json());


app.use(cors());
cron.schedule('34 14 * * *', async () => {
  try {
    console.log('⏰ Ejecutando cierre diario...');

    const [resultGuias] = await pool.query(`
      SELECT COUNT(*) AS guias FROM (
        SELECT guia FROM guiasimpo WHERE facturada = 0
        UNION ALL
        SELECT guia FROM guiasexpo WHERE facturada = 0
      ) AS total_guias
    `);
    const guias = resultGuias[0].guias;

    const [resultFacturas] = await pool.query(`
      SELECT COUNT(*) AS facturas FROM facturas WHERE idrecibo IS NULL
    `);
    const facturas = resultFacturas[0].facturas;

    await pool.query(`
      INSERT INTO cierre_diario (fecha, guias_sin_facturar, facturas_sin_cobrar)
      VALUES (CURDATE(), ?, ?)
      ON DUPLICATE KEY UPDATE 
        guias_sin_facturar = VALUES(guias_sin_facturar),
        facturas_sin_cobrar = VALUES(facturas_sin_cobrar)
    `, [guias, facturas]);

    console.log('✅ Cierre diario guardado:', new Date().toLocaleString());


    const [guiasDet] = await pool.query(`
      SELECT guia AS numero, consignatario AS cliente, DATE_FORMAT(emision, '%d/%m/%Y') AS fecha,
             'Impo' AS tipo, total
      FROM guiasimpo WHERE facturada = 0
      UNION ALL
      SELECT guia AS numero, agente AS cliente, DATE_FORMAT(emision, '%d/%m/%Y') AS fecha,
             'Expo' AS tipo, total
      FROM guiasexpo WHERE facturada = 0
      ORDER BY fecha DESC
    `);

    const [totalGuias] = await pool.query(`
    SELECT 
      (SELECT IFNULL(SUM(total), 0) FROM guiasimpo WHERE facturada = 0) +
      (SELECT IFNULL(SUM(total), 0) FROM guiasexpo WHERE facturada = 0) AS total_sin_facturar
  `);

    const [facturasDet] = await pool.query(`
    SELECT 
      Comprobante AS numero, 
      RazonSocial AS cliente, 
      DATE_FORMAT(Fecha, '%d/%m/%Y') AS fecha, 
      TotalCobrar AS monto
    FROM facturas
    WHERE idrecibo IS NULL
    ORDER BY Fecha DESC
  `);

    const [totalFacturas] = await pool.query(`
      SELECT SUM(TotalCobrar) AS totalSinCobrar FROM facturas WHERE idrecibo IS NULL
    `);
    const totalGuiasMonto = totalGuias[0].total_sin_facturar || 0;
    const totalFacturasMonto = totalFacturas[0].totalSinCobrar || 0;
    // HTML del reporte
    const html = `
                  <h2>📊 Reporte Cierre Diario</h2>
                  <p><b>Fecha:</b> ${new Date().toLocaleDateString('es-UY')}</p>
                  <p><b>Guías sin facturar:</b> ${guias} (Total: $${totalGuiasMonto.toLocaleString()})</p>
                  <p><b>Facturas sin cobrar:</b> ${facturas} (Total: $${totalFacturasMonto.toLocaleString()})</p>
                  
                  <h3>📦 Guías sin facturar</h3>
                  <table border="1" cellpadding="5" cellspacing="0">
                    <tr><th>N° Guía</th><th>Tipo</th><th>Cliente</th><th>Fecha</th><th>Total</th></tr>
                    ${guiasDet.map(g => `
                      <tr>
                        <td>${g.numero}</td>
                        <td>${g.tipo}</td>
                        <td>${g.cliente}</td>
                        <td>${g.fecha}</td>
                        <td>$${g.total.toLocaleString()}</td>
                      </tr>`).join('')}
                  </table>

                  <h3>💰 Facturas sin cobrar</h3>
                  <table border="1" cellpadding="5" cellspacing="0">
                    <tr><th>N° Factura</th><th>Cliente</th><th>Fecha</th><th>Monto</th></tr>
                    ${facturasDet.map(f => `
                      <tr>
                        <td>${f.numero}</td>
                        <td>${f.cliente}</td>
                        <td>${f.fecha}</td>
                        <td>$${f.monto.toLocaleString()}</td>
                      </tr>`).join('')}
                  </table>
                `;

    const workbook = new ExcelJS.Workbook();

    // Hoja Guías sin facturar
    const wsGuias = workbook.addWorksheet('Guías sin facturar');
    wsGuias.columns = [
      { header: 'N° Guía', key: 'numero', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];
    guiasDet.forEach(g => wsGuias.addRow(g));

    // Aplicar estilo a la fila de encabezado
    wsGuias.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF003366' }, // azul oscuro
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // blanco y negrita
    });

    // Habilitar filtro en encabezado
    wsGuias.autoFilter = { from: 'A1', to: 'E1' };

    // Hoja Facturas sin cobrar
    const wsFacturas = workbook.addWorksheet('Facturas sin cobrar');
    wsFacturas.columns = [
      { header: 'N° Factura', key: 'numero', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Monto', key: 'monto', width: 15 },
    ];
    facturasDet.forEach(f => wsFacturas.addRow(f));

    // Aplicar estilo a la fila de encabezado
    wsFacturas.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF003366' }, // azul oscuro
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // blanco y negrita
    });

    // Habilitar filtro en encabezado
    wsFacturas.autoFilter = { from: 'A1', to: 'D1' };

    // Generar buffer del Excel
    const bufferExcel = await workbook.xlsx.writeBuffer();

    // Enviar mail con adjunto Excel
    const mailOptions = {
      from: 'alertasairbillcielosur@gmail.com',
      to: 'pgauna@repremar.com',
      subject: '[TEST] Cierre Diario AirBill',
      text: `Hola Patricio,\n\nEl cierre diario se ejecutó correctamente.\nGuías sin facturar: ${guias} (Total: $${totalGuiasMonto})\nFacturas sin cobrar: ${facturas} (Total: $${totalFacturasMonto})\n\nSaludos,\nSistema`,
      html,
      attachments: [
        {
          filename: `CierreDiario_${new Date().toISOString().slice(0, 10)}.xlsx`,
          content: bufferExcel,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('❌ Error enviando el correo:', error);
      }
      console.log('📧 Correo enviado:', info.response);
    });
  } catch (err) {
    console.error('❌ Error en cierre diario:', err);
  }
});


app.get('/api/cierre_diario', async (req, res) => {
  const query = `
    SELECT fecha, guias_sin_facturar, facturas_sin_cobrar
    FROM cierre_diario
    WHERE fecha >= CURDATE() - INTERVAL 15 DAY
    ORDER BY fecha ASC
  `;

  try {
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Función para generar el mensaje en el backend
function generarMensaje(monto, moneda) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  if (moneda === 'USD') {
    return `Son dólares americanos U$S ${montoEnLetras}`;
  } else {
    return `Son pesos uruguayos $ ${montoEnLetras}`;
  }
}
function generarAdenda(numerodoc, monto, moneda) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  console.log('Moneda de la adenda: ', moneda);
  if (moneda === 'USD') {
    return `Son dólares americanos U$S ${montoEnLetras}`;
  } else {
    return `Son pesos uruguayos $ ${montoEnLetras}`;
  }

}
function generarAdendaSinDoc(monto, moneda) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  console.log('Moneda de la adenda: ', moneda);
  if (moneda === 'USD') {
    return `Son dólares americanos U$S ${montoEnLetras}`;
  } else {
    return `Son pesos uruguayos $ ${montoEnLetras}`;
  }

}
function generarAdendaConConceptos(numerodoc, monto, moneda, detalleFactura = []) {
  console.log("🔹 [generarAdendaConConceptos] Parámetros recibidos:");
  console.log("  → numerodoc:", numerodoc);
  console.log("  → monto:", monto);
  console.log("  → moneda:", moneda);
  console.log("  → detalleFactura:", detalleFactura);

  const montoEnLetras = NumeroALetras(monto); // Convierte el monto a letras

  // Encabezado según moneda
  const encabezado =
    moneda === "USD"
      ? `Doc:${numerodoc} - Son dólares americanos U$S ${montoEnLetras}`
      : `Doc:${numerodoc} - Son pesos uruguayos $ ${montoEnLetras}`;

  // Si hay detalle de adenda, lo formateamos
  let detalleTexto = "";
  if (Array.isArray(detalleFactura) && detalleFactura.length > 0) {
    detalleTexto = detalleFactura
      .map((item) => {
        return `${item.descripcion}${item.importe && Number(item.importe) !== 0
          ? `: ${item.moneda} ${Number(item.importe).toFixed(2)}`
          : ""
          }`;
      })
      .join(" | ");
  }

  const resultadoFinal = detalleTexto
    ? `${encabezado}&#10;&#10;${detalleTexto}`
    : encabezado;

  console.log("✅ [generarAdendaConConceptos] Resultado final:", resultadoFinal);

  return resultadoFinal;
}

//Consulta para cargar la tabla de preview de clientes.

app.get('/api/previewclientes', async (req, res) => {
  console.log('Received request for /api/previewclientes'); // Mantengo el log
  const sql = 'SELECT * FROM clientes ORDER BY Id DESC';

  try {
    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar Clientes.', error: err.message });
  }
});

app.get('/api/previewfacturas', async (req, res) => {
  console.log('Received request for /api/previewfacturas');
  const sql = 'SELECT * FROM facturas ORDER BY Id DESC';

  try {
    const [result] = await pool.query(sql);

    // Formatear la fecha en cada resultado
    const formattedResult = result.map((row) => {
      const fecha = new Date(row.Fecha);
      const formattedFecha = fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const fechaVenc = row.fechaVencimiento ? new Date(row.fechaVencimiento) : null;
      const formattedFechaVenc = fechaVenc
        ? fechaVenc.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : '';
      return {
        ...row,
        Fecha: formattedFecha,
        fechaVencimiento: formattedFechaVenc, // aquí se agrega
      };
    });

    res.status(200).json(formattedResult);
  } catch (err) {
    res.status(500).json({ message: 'Error en el backend cargando facturas', error: err.message });
  }
});

app.post('/api/changeestadocliente', async (req, res) => {
  const { idCliente } = req.body;
  console.log("Cambiando estado del cliente: ", idCliente);
  if (!idCliente) {
    return res.status(400).json({ message: 'idCliente es requerido' });
  }

  try {
    // 1) Buscar cliente
    const [rows] = await pool.query(
      'SELECT Estado FROM clientes WHERE Id = ?',
      [idCliente]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const estadoActual = rows[0].Estado?.trim().toUpperCase();

    // 2) Determinar nuevo estado
    const nuevoEstado = estadoActual === 'A' ? 'I' : 'A';

    // 3) Actualizar
    await pool.query(
      'UPDATE clientes SET Estado = ? WHERE Id = ?',
      [nuevoEstado, idCliente]
    );

    res.status(200).json({
      message: 'Estado de cliente actualizado correctamente',
      estadoAnterior: estadoActual,
      estadoNuevo: nuevoEstado
    });

  } catch (err) {
    console.error("Error cambiando estado del cliente:", err);
    res.status(500).json({
      message: "Error en el servidor al cambiar el estado del cliente",
      error: err.message
    });
  }
});

app.get('/api/previewnc', async (req, res) => {
  console.log('Received request for /api/previewnc');

  const sql = `
    SELECT 
      nc.*, 
      clientes.Rut, 
      clientes.RazonSocial
    FROM nc
    LEFT JOIN clientes ON nc.idCliente = clientes.Id
    ORDER BY nc.idNC DESC
  `;
  try {
    const [result] = await pool.query(sql);

    const formattedResult = result.map((row) => {
      // Formatear fecha
      const fecha = row.fecha ? new Date(row.fecha) : null;
      const formattedFecha = fecha
        ? fecha.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : '';

      return {
        ...row,
        fecha: formattedFecha, // fecha formateada
      };
    });

    res.status(200).json(formattedResult);
  } catch (err) {
    console.error('Error fetching NC:', err);
    res.status(500).json({ message: 'Error en el backend cargando notas de crédito', error: err.message });
  }
});

//Preview de recibos 
app.get('/api/previewrecibos', async (req, res) => {
  console.log('Received request for /api/previewrecibos');
  const sql = 'SELECT * FROM recibos ORDER BY idrecibo DESC';
  try {
    const [result] = await pool.query(sql);

    const formattedResult = result.map((row) => {
      // Formatear 'fecha'
      const fecha = new Date(row.fecha);
      const formattedFecha = fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Formatear 'fechaDocumentoCFE' si existe
      const fechaDoc = row.fechaDocumentoCFE ? new Date(row.fechaDocumentoCFE) : null;
      const formattedFechaDoc = fechaDoc
        ? fechaDoc.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : '';

      return {
        ...row,
        fecha: formattedFecha,
        fechaDocumentoCFE: formattedFechaDoc,
      };
    });

    res.status(200).json(formattedResult);
  } catch (err) {
    res.status(500).json({ message: 'Error en el backend cargando recibos', error: err.message });
  }
});


//Armado de la consulta Insert Cliente

// Ruta para insertar un cliente y su cuenta corriente
app.post('/api/insertclientes', async (req, res) => {
  console.log('Received request for /api/insertclientes');
  const datosEmpresa = await obtenerDatosEmpresa(pool);
  console.log('Datos de la empresa desde el back', datosEmpresa);
  const {
    Nombre,
    RazonSocial,
    Direccion,
    Zona,
    Ciudad,
    Rut,
    IATA,
    Cass,
    Pais,
    Email,
    Tel,
    TDOCDGI,
    Saldo
  } = req.body;

  // Validar si ya existe la razón social
  const verificarRazonSocialQuery = 'SELECT * FROM clientes WHERE RazonSocial = ?';

  try {
    const [results] = await pool.query(verificarRazonSocialQuery, [RazonSocial]);

    if (results.length > 0) {
      return res.status(400).json({ error: 'Ya existe un cliente con esa razón social' });
    }

    // Si no existe, continuar con el proceso SOAP
    const construirXmlAgregarElemento = () => {
      const esTipo3 = TDOCDGI === '3';
      return `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
          <soapenv:Header/>
          <soapenv:Body>
            <soap:agregarElemento>
              <xmlParametros><![CDATA[
                <agregarElementoParametros>
                  <usuario>${datosEmpresa.usuarioGfe}</usuario>
                  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                  <elemento>
                    <nombre>${Nombre}</nombre>
                    <habilitado>S</habilitado>
                    <conjuntos>
                      <conjunto>${datosEmpresa.conjuntoClientes}</conjunto>
                    </conjuntos>
                    <atributos>
                      <atributo><campo>DIR</campo><valor>${Direccion}</valor></atributo>
                      <atributo><campo>TDOCDGI</campo><valor>${TDOCDGI}</valor></atributo>
                      ${esTipo3
          ? `<atributo><campo>CI</campo><valor>${Rut}</valor></atributo>`
          : `<atributo><campo>RUC</campo><valor>${Rut}</valor></atributo>`
        }
                      <atributo><campo>PAIS</campo><valor>${Pais}</valor></atributo>
                      <atributo><campo>TEL</campo><valor>${Tel}</valor></atributo>
                      <atributo><campo>RAZON</campo><valor>${RazonSocial}</valor></atributo>
                      <atributo><campo>EMAIL</campo><valor>${Email}</valor></atributo>
                      <atributo><campo>LOC</campo><valor>${Zona}</valor></atributo>
                      <atributo><campo>CIUDAD</campo><valor>${Ciudad}</valor></atributo>
                    </atributos>
                  </elemento>
                </agregarElementoParametros>
              ]]></xmlParametros>
            </soap:agregarElemento>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
    };

    const xml = construirXmlAgregarElemento();
    const xmlBuffer = Buffer.from(xml, 'utf-8');

    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarElemento"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': `${datosEmpresa.serverFacturacion}`,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
    };

    try {
      const response = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlBuffer,
        { headers }
      );

      const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
      const parsed = await parser.parseStringPromise(response.data);
      const innerXml = parsed?.Envelope?.Body?.agregarElementoResponse?.xmlResultado;

      if (innerXml) {
        const rawXml = innerXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        const innerParsed = await xml2js.parseStringPromise(rawXml, { explicitArray: false });

        const CodigoGIA = innerParsed?.agregarElementoResultado?.datos?.elemento?.codigo;

        if (!CodigoGIA) {
          return res.status(500).json({ error: 'No se pudo obtener el código del cliente desde la respuesta del WS' });
        }

        const insertClienteQuery = `
          INSERT INTO clientes 
            (Nombre, RazonSocial, Direccion, Zona, Ciudad, Rut, IATA, Cass, Pais, Email, Tel, TDOCDGI, Saldo, CodigoGIA)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
          await pool.query(insertClienteQuery, [
            Nombre,
            RazonSocial,
            Direccion,
            Zona,
            Ciudad,
            Rut,
            IATA,
            Cass,
            Pais,
            Email,
            Tel,
            TDOCDGI,
            Saldo,
            CodigoGIA
          ]);

          return res.status(200).json({
            message: 'Cliente insertado correctamente',
            codigoGia: CodigoGIA
          });
        } catch (err) {
          console.error('Error al insertar el cliente:', err);
          return res.status(500).json({ error: 'Error al insertar el cliente' });
        }

      } else {
        return res.status(500).json({ error: 'Respuesta del WS inválida: no se encontró xmlResultado' });
      }
    } catch (error) {
      console.error('Error al enviar solicitud SOAP:', error.message);
      return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
    }
  } catch (error) {
    console.error('Error general en insertclientes:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/insertclientes/excel', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  // 🧩 Función para escapar caracteres especiales de XML (solo una vez)
  const xmlEscape = (value) => {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    console.log(`📘 Procesando ${data.length} filas...`);

    const resultados = [];
    const datosEmpresa = await obtenerDatosEmpresa(pool);
    const safeInt = (value) => {
      const num = parseInt(value);
      return isNaN(num) ? 0 : num;
    };
    for (const fila of data) {
      const Nombre = xmlEscape(fila["CL_NOMBRE,C,50"] || "");
      const CodigoGia = xmlEscape(fila["CL_RUBRO,C,20"] || "");
      const RazonSocial = xmlEscape(fila["CL_RAZON,C,80"] || "");

      // Defaults si están vacíos
      const Direccion = xmlEscape(
        (fila["CL_DIRECCI,C,50"] && fila["CL_DIRECCI,C,50"].toString().trim() !== "")
          ? fila["CL_DIRECCI,C,50"].toString().trim()
          : "-"
      );
      const Zona = xmlEscape((fila["CL_ZONA,C,30"] || "MONTEVIDEO").toString().trim() || "MONTEVIDEO");
      const Ciudad = xmlEscape((fila["CL_CIUDAD,C,30"] || "MONTEVIDEO").toString().trim() || "MONTEVIDEO");
      const Rut = xmlEscape((fila["CL_RUC,C,15"] || "0").toString().trim() || "0");

      // Campos opcionales (varchar) que pueden quedar vacíos
      const IATA = fila["CL_IATA,N,11,0"] ? fila["CL_IATA,N,11,0"].toString() : "";
      const Cass = "false";

      // Fijos
      const Pais = "URUGUAY";
      const Email = xmlEscape(fila["CL_EMAIL,C,254"] || "");
      const Tel = xmlEscape(fila["CL_TELEFON,M"] || "");
      const TDOCDGI = "2";
      const Saldo = 0; // decimal, ok

      if (!RazonSocial || !Nombre) {
        console.warn(`⚠️ Faltan campos obligatorios (Nombre o RazonSocial) en fila:`, fila);
        continue;
      }

      // 🔍 Verificar duplicado
      const [results] = await pool.query("SELECT * FROM clientes WHERE RazonSocial = ?", [RazonSocial]);
      if (results.length > 0) {
        console.log(`⏩ Cliente duplicado: ${RazonSocial}, se omite.`);
        continue;
      }

      // 🧾 Armar XML
      const esTipo3 = TDOCDGI === "3";
      const xml = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
          <soapenv:Header/>
          <soapenv:Body>
            <soap:agregarElemento>
              <xmlParametros><![CDATA[
                <agregarElementoParametros>
                  <usuario>${datosEmpresa.usuarioGfe}</usuario>
                  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                  <elemento>
                    <codigo>${CodigoGia}</codigo>
                    <nombre>${Nombre}</nombre>
                    <habilitado>S</habilitado>
                    <conjuntos>
                      <conjunto>${datosEmpresa.conjuntoClientes}</conjunto>
                    </conjuntos>
                    <atributos>
                      <atributo><campo>DIR</campo><valor>${Direccion}</valor></atributo>
                      <atributo><campo>TDOCDGI</campo><valor>${TDOCDGI}</valor></atributo>
                      ${esTipo3
          ? `<atributo><campo>CI</campo><valor>${Rut}</valor></atributo>`
          : `<atributo><campo>RUC</campo><valor>${Rut}</valor></atributo>`}
                      <atributo><campo>PAIS</campo><valor>${Pais}</valor></atributo>
                      <atributo><campo>TEL</campo><valor>${Tel}</valor></atributo>
                      <atributo><campo>RAZON</campo><valor>${RazonSocial}</valor></atributo>
                      <atributo><campo>EMAIL</campo><valor>${Email}</valor></atributo>
                      <atributo><campo>LOC</campo><valor>${Zona}</valor></atributo>
                      <atributo><campo>CIUDAD</campo><valor>${Ciudad}</valor></atributo>
                    </atributos>
                  </elemento>
                </agregarElementoParametros>
              ]]></xmlParametros>
            </soap:agregarElemento>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

      try {
        console.log('XML a instertar: ', xml);
        // 🚀 Enviar XML al servidor GIA
        const response = await axios.post(
          `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
          Buffer.from(xml, "utf-8"),
          {
            headers: {
              "Content-Type": "text/xml;charset=utf-8",
              SOAPAction: '"agregarElemento"',
            },
          }
        );

        const rawResponse = response.data;
        const parser = new xml2js.Parser({
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
        });

        const parsed = await parser.parseStringPromise(rawResponse);
        const innerXml = parsed?.Envelope?.Body?.agregarElementoResponse?.xmlResultado;

        if (!innerXml) {
          console.error("❌ Respuesta SOAP inválida. Respuesta cruda:\n", rawResponse);
          throw new Error("Respuesta SOAP inválida desde el servidor GIA");
        }

        // 🧩 NO reemplazamos &amp; de nuevo — mantenemos el XML escapado válido
        const rawXml = innerXml
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");

        const innerParsed = await xml2js.parseStringPromise(rawXml, { explicitArray: false });
        const CodigoGIA = innerParsed?.agregarElementoResultado?.datos?.elemento?.codigo;

        if (!CodigoGIA) {
          console.error("❌ No se pudo obtener Código GIA. XML interno:\n", rawXml);
          throw new Error("No se pudo obtener Código GIA");
        }

        await pool.query(
          `INSERT INTO clientes 
            (Nombre, RazonSocial, Direccion, Zona, Ciudad, Rut, IATA, Cass, Pais, Email, Tel, TDOCDGI, Saldo, CodigoGIA)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [Nombre, RazonSocial, Direccion, Zona, Ciudad, Rut, IATA, Cass, Pais, Email, Tel, TDOCDGI, Saldo, CodigoGIA]
        );

        resultados.push({ RazonSocial, CodigoGIA, estado: "OK" });
      } catch (err) {
        console.error(`💥 Error al procesar cliente "${RazonSocial}":`, err.message);
        console.error("🧾 Respuesta cruda del WS (si existe):\n", err.response?.data || "Sin respuesta");
        throw new Error(`Error al enviar cliente "${RazonSocial}" → ${err.message}`);
      }
    }

    fs.unlinkSync(filePath);

    return res.json({
      mensaje: "✅ Procesamiento completado sin errores",
      insertados: resultados.length,
      resultados,
    });
  } catch (err) {
    console.error("⛔ Error procesando Excel:", err);
    res.status(500).json({ error: err.message || "Error procesando Excel" });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// Endpoint para actualizar un cliente
app.put('/api/actualizarcliente/:id', async (req, res) => {
  const id = req.params.id; // Obtener el ID del cliente de la URL
  const datosEmpresa = await obtenerDatosEmpresa(pool);
  const {
    nombre,
    rut,
    pais,
    email,
    tel,
    razonSocial,
    iata,
    direccion,
    zona,
    ciudad,
    cass,
    tipoComprobante,
    codigoGIA
  } = req.body; // Obtener los datos del cliente del cuerpo de la solicitud


  const construirXmlModificarElemento = () => {
    const esTipo3 = tipoComprobante === '3';
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
  <soapenv:Header/>
  <soapenv:Body>
    <soap:modificarElemento>
      <xmlParametros>
        <![CDATA[
<modificarElementoParametros>
  <usuario>${datosEmpresa.usuarioGfe}</usuario>
  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
  <elemento>
    <codigo>${codigoGIA}</codigo>
    <nombre>${nombre}</nombre>
    <habilitado>S</habilitado>
    <conjuntos>
      <conjunto>${datosEmpresa.conjuntoClientes}</conjunto>
    </conjuntos>
    <atributos>
      <atributo><campo>DIR</campo><valor>${direccion}</valor></atributo>
      <atributo><campo>TDOCDGI</campo><valor>${tipoComprobante}</valor></atributo>
      ${esTipo3
        ? `<atributo><campo>CI</campo><valor>${rut}</valor></atributo> <atributo><campo>RUC</campo><valor></valor></atributo>`
        : `<atributo><campo>RUC</campo><valor>${rut}</valor></atributo> <atributo><campo>CI</campo><valor></valor></atributo>`
      }
      <atributo><campo>PAIS</campo><valor>${pais}</valor></atributo>
      <atributo><campo>TEL</campo><valor>${tel}</valor></atributo>
      <atributo><campo>RAZON</campo><valor>${razonSocial}</valor></atributo>
      <atributo><campo>EMAIL</campo><valor>${email}</valor></atributo>
      <atributo><campo>LOC</campo><valor>${zona}</valor></atributo>
      <atributo><campo>CIUDAD</campo><valor>${ciudad}</valor></atributo>
    </atributos>
  </elemento>
</modificarElementoParametros>
        ]]>
      </xmlParametros>
    </soap:modificarElemento>
  </soapenv:Body>
</soapenv:Envelope>`;
  };

  const xml = construirXmlModificarElemento();
  console.log(`\n📤 Enviando XML para cliente "${RazonSocial}":\n`, xml);
  const xmlBuffer = Buffer.from(xml, 'utf-8');

  const headers = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"modificarElemento"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': `${datosEmpresa.serverFacturacion}`,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  try {
    console.log('XML MODIFICAR A SOAP', xml);
    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlBuffer,
      { headers }
    );
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    const parsed = await parser.parseStringPromise(response.data);

    const innerXml = parsed?.Envelope?.Body?.modificarElementoResponse?.xmlResultado;
    console.log('Respuesta cruda SOAP', innerXml);
    if (!innerXml) {
      return res.status(500).json({ error: 'No se encontró xmlResultado en la respuesta SOAP' });
    }

    const rawXml = innerXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParsed = await xml2js.parseStringPromise(rawXml, { explicitArray: false });

    const resultado = innerParsed?.modificarElementoResultado?.resultado;
    const descripcion = innerParsed?.modificarElementoResultado?.descripcion;

    if (resultado !== '1') {
      return res.status(500).json({ error: 'Error en WS', descripcion });
    }

    // Ahora actualizar en la base de datos
    const sql = `UPDATE clientes SET 
        Nombre = ?, RazonSocial = ?, Direccion = ?, Zona = ?, Ciudad = ?,
        Rut = ?, IATA = ?, Cass = ?, Pais = ?, Email = ?, Tel = ?, TDOCDGI= ?
        WHERE id = ?`;

    const values = [
      nombre,
      razonSocial,
      direccion,
      zona,
      ciudad,
      rut,
      iata,
      cass,
      pais,
      email,
      tel,
      tipoComprobante,
      id
    ];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente No encontrado' });
    }

    res.status(200).json({ message: 'Cliente modificado correctamente en WS y BD' });
  } catch (error) {
    console.error('Error al enviar solicitud SOAP o actualizar BD:', error.message);
    return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
  }
});


//Armando Endpoint para eliminar Cliente
app.delete('/api/deleteclientes', async (req, res) => {
  console.log('Received request for /api/deleteclientes');
  const { Id, CodigoGIA } = req.body; // Se requiere el código GIA además del Id
  const datosEmpresa = await obtenerDatosEmpresa(pool);
  if (!CodigoGIA || !Id) {
    return res.status(400).json({ error: 'Se requiere Id y CodigoGIA del cliente' });
  }

  const construirXmlEliminarElemento = () => {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
  <soapenv:Header/>
  <soapenv:Body>
    <soap:eliminarElemento>
      <xmlParametros>
        <![CDATA[
<eliminarElementoParametros>
  <usuario>${datosEmpresa.usuarioGfe}</usuario>
  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
  <elemento>
    <codigo>${CodigoGIA}</codigo>
    <conjunto>${datosEmpresa.conjuntoClientes}</conjunto>
  </elemento>
</eliminarElementoParametros>
        ]]>
      </xmlParametros>
    </soap:eliminarElemento>
  </soapenv:Body>
</soapenv:Envelope>`;
  };

  const xml = construirXmlEliminarElemento();
  const xmlBuffer = Buffer.from(xml, 'utf-8');

  const headers = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"eliminarElemento"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': `${datosEmpresa.conjuntoClientes}`,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  try {
    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlBuffer,
      { headers }
    );

    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    const parsed = await parser.parseStringPromise(response.data);
    const innerXml = parsed?.Envelope?.Body?.eliminarElementoResponse?.xmlResultado;

    if (!innerXml) {
      return res.status(500).json({ error: 'No se encontró xmlResultado en la respuesta SOAP' });
    }

    const rawXml = innerXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParsed = await xml2js.parseStringPromise(rawXml, { explicitArray: false });

    const resultado = innerParsed?.eliminarElementoResultado?.resultado;
    const descripcion = innerParsed?.eliminarElementoResultado?.descripcion;

    if (resultado !== '1') {
      return res.status(500).json({ error: 'Error en WS', descripcion });
    }

    // Si la respuesta fue correcta, eliminar en la BD
    const deleteClienteQuery = `DELETE FROM clientes WHERE Id = ?`;

    try {
      const [results] = await pool.query(deleteClienteQuery, [Id]);

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado en la base de datos' });
      }

      console.log('Cliente eliminado:', results.affectedRows);
      res.status(200).json({
        message: 'Cliente eliminado correctamente en WS y base de datos',
        descripcionWS: descripcion
      });
    } catch (err) {
      console.error('Error al eliminar el cliente en la base de datos:', err);
      return res.status(500).json({ error: 'Error al eliminar el cliente en la base de datos' });
    }
  } catch (error) {
    console.error('Error al enviar solicitud SOAP:', error.message);
    return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
  }
});


//Obtener datos para modificar cliente.
app.get('/api/obtenerclientes/:id', async (req, res) => {
  console.log('Received request for /api/obtenerclientes/' + req.params.id);
  const { id } = req.params; // Obtener el ID del cliente desde la URL

  // Consulta para obtener el cliente por ID
  const getClienteQuery = `
      SELECT * FROM clientes
      WHERE Id = ?
  `;

  try {
    const [results] = await pool.query(getClienteQuery, [id]);

    if (results.length > 0) {
      console.log('Cliente encontrado:', results[0]);
      // Respuesta exitosa con los datos del cliente
      res.status(200).json(results[0]);
    } else {
      // Si no se encuentra el cliente
      console.log('Cliente no encontrado');
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener el cliente:', err);
    return res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

app.post('/api/guardar-datos-empresa', async (req, res) => {
  const { usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion, rubVentas,
    rubCompras,
    rubCostos,
    rubDeudores,
    codEfac,
    codEfacCA,
    codETick,
    codETickCA,
    usuModifica } = req.body;
  const fechaModificacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const [rows] = await pool.query('SELECT * FROM datos_empresa LIMIT 1');

    if (rows.length > 0) {
      // Ya hay datos → Hacer UPDATE
      await pool.query(
        `UPDATE datos_empresa SET usuarioGfe = ?, passwordGfe = ?, codigoEmpresa = ?, contraseñaEmpresa = ?, conjuntoClientes = ?, serverFacturacion = ?,rubVentas = ?,rubCompras = ?,rubCostos = ?,rubDeudores = ?, codEfac = ?, codEfacCA = ?, codETick = ?, codETickCA = ?, usuarioModifica = ?, fechaModifica = ?`,
        [usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion, rubVentas, rubCompras, rubCostos, rubDeudores, codEfac, codEfacCA, codETick, codETickCA, usuModifica, fechaModificacion],
      );

      res.send('Datos actualizados correctamente');
    } else {
      // No hay datos → Hacer INSERT

      await pool.query(
        `INSERT INTO datos_empresa SET usuarioGfe = ?, passwordGfe = ?, codigoEmpresa = ?, contraseñaEmpresa = ?, conjuntoClientes = ?, serverFacturacion = ?,rubVentas = ?,rubCompras = ?,rubCostos = ?,rubDeudores = ?, codEfac = ?, codEfacCA = ?, codETick = ?, codETickCA = ?, usuarioModifica = ?, fechaModifica = ?`,
        [usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion, rubVentas, rubCompras, rubCostos, rubDeudores, codEfac, codEfacCA, codETick, codETickCA, usuModifica, fechaModificacion],
      );
      res.send('Datos insertados correctamente');
    }
  } catch (error) {
    console.error('Error al guardar datos de empresa:', error);
    res.status(500).send('Error al guardar datos');
  }
});

app.get('/api/obtener-datos-empresa', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM datos_empresa LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'No se encontraron datos de empresa' });
    }
  } catch (error) {
    console.error('Error al obtener datos de empresa:', error);
    res.status(500).send('Error al obtener los datos');
  }
});

app.get('/api/obtener-conceptos', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM conceptos');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    res.status(500).json({ error: 'Error al obtener conceptos' });
  }
});


// Endpoint para buscar clientes
app.get('/api/obtenernombrecliente', async (req, res) => {
  const search = req.query.search;
  try {
    const [results] = await pool.query(
      'SELECT * FROM clientes WHERE Estado = "A" AND RazonSocial LIKE ?',
      [`%${search}%`]
    );
    res.json(results);
  } catch (err) {
    console.error('Error en la consulta:', err);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

app.post('/api/validarlogin', async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
    const [results] = await pool.query(sql, [usuario]);

    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioDB = results[0];
    const match = await bcrypt.compare(contraseña, usuarioDB.contraseña);

    if (match) {
      // Éxito
      return res.status(200).json({ mensaje: 'Login exitoso', rol: usuarioDB.rol });
    } else {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error al procesar login' });
  }
});

// Endpoint para insertar un usuario con contraseña hasheada
app.post('/api/insertusuarios', async (req, res) => {
  console.log('Received request for /api/insertusuarios');

  const {
    usuario,
    contraseña,
    rol
  } = req.body; // Los datos del usuario enviados desde el frontend

  try {
    // Hashear la contraseña antes de almacenarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Consulta para insertar un nuevo usuario con la contraseña hasheada
    const insertUsuarioQuery = `
      INSERT INTO usuarios (usuario, contraseña, rol)
      VALUES (?, ?, ?)
    `;

    // Ejecutar la inserción del usuario con la contraseña hasheada
    await pool.query(insertUsuarioQuery, [usuario, hashedPassword, rol]);
    // Respuesta exitosa
    res.status(200).json({ message: 'Usuario insertado exitosamente' });
  } catch (error) {
    console.error('Error al insertar el usuario o hashear la contraseña:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

//Consulta para cargar la tabla de preview de clientes.

app.get('/api/previewusuarios', async (req, res) => {
  console.log('Received request for /api/previewclientes'); // Agrega esta línea
  const sql = 'SELECT * FROM usuarios';

  try {
    const [result] = await pool.query(sql);
    // Envía todos los resultados de la consulta al frontend
    res.status(200).json(result);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'An error occurred while fetching clients.' });
  }
});

//Obtener datos para modificar cliente.
app.get('/api/obtenerusuario/:id', async (req, res) => {
  console.log('Received request for /api/obtenerclientes/' + req.params.id);
  const { id } = req.params; // Obtener el ID del cliente desde la URL

  // Consulta para obtener el cliente por ID
  const getClienteQuery = `
      SELECT * FROM usuarios
      WHERE id = ?
  `;

  try {
    const [results] = await pool.query(getUsuarioQuery, [id]);

    if (results.length > 0) {
      console.log('Usuario encontrado:', results[0]);
      res.status(200).json(results[0]);
    } else {
      console.log('Usuario no encontrado');
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener el Usuario:', err);
    res.status(500).json({ error: 'Error al obtener el Usuario' });
  }
});

// Endpoint para actualizar un cliente
app.put('/api/actualizarusuario/:id', async (req, res) => {
  const id = req.params.id; // Obtener el ID del cliente de la URL
  const {
    usuario,
    contraseña,
    rol,
  } = req.body; // Obtener los datos del cliente del cuerpo de la solicitud

  // Consulta SQL para actualizar los datos del cliente
  const sql = `UPDATE clientes SET 
    usuario = ?,
    contraseña = ?,
    rol = ?
    WHERE id = ?`;

  const values = [
    usuario,
    contraseña,
    rol,
    id
  ];

  try {
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente No encontrado' });
    }

    res.status(200).json({ message: 'Cliente Modificado Correctamente' });
  } catch (err) {
    console.error('Error actualizando cliente:', err);
    res.status(500).json({ message: 'Error actualizando cliente' });
  }
});

app.delete('/api/deleteusuario', async (req, res) => {
  const { Id } = req.body;

  try {
    // 1. Buscar el rol del usuario
    const [usuarioRows] = await pool.query('SELECT rol FROM usuarios WHERE id = ?', [Id]);

    if (!usuarioRows || usuarioRows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const rolUsuario = usuarioRows[0].rol;

    // 2. Verificar si es el último admin
    if (rolUsuario === 'admin') {
      const [adminRows] = await pool.query('SELECT COUNT(*) AS total FROM usuarios WHERE rol = "admin"');
      const totalAdmins = adminRows[0].total;

      if (totalAdmins <= 1) {
        return res.status(400).json({ mensaje: 'No se puede eliminar al último usuario administrador' });
      }
    }

    // 3. Eliminar el usuario
    await pool.query('DELETE FROM usuarios WHERE id = ?', [Id]);

    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// Agrega un vuelo a la base de datos
app.post('/api/agregarVuelo', async (req, res) => {
  const { vuelo, compania } = req.body; // Extrae vuelo y compania del cuerpo de la solicitud
  try {
    // Inserta el vuelo y la compañía en la base de datos
    await pool.query('INSERT INTO vuelos (vuelo, compania) VALUES (?, ?)', [vuelo, compania]);
    res.status(201).send('Vuelo agregado correctamente');
  } catch (error) {
    console.error('Error al agregar vuelo:', error);
    res.status(500).send('Error al agregar vuelo');
  }
});

// Define el endpoint para obtener los vuelos
app.get('/api/previewvuelos', async (req, res) => {
  const query = 'SELECT * FROM vuelos'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener vuelos:', error);
    res.status(500).json({ error: 'Error al obtener vuelos' });
  }
});

// Define el endpoint para obtener vuelos
app.get('/api/obtenervuelos', async (req, res) => {
  const query = 'SELECT * FROM vuelos'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener vuelos:', error);
    res.status(500).json({ error: 'Error al obtener vuelos' });
  }
});

//elimina el vuelo
app.delete('/api/eliminarvuelo/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM vuelos WHERE idVuelos = ?';

  try {
    const [results] = await pool.query(query, [id]);
    res.status(200).json({ message: 'Vuelo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vuelo:', error);
    res.status(500).json({ error: 'Error al eliminar vuelo' });
  }
});

//agrega un ciudad a la bd
app.post('/api/agregarCiudad', async (req, res) => {
  const { ciudad } = req.body;
  try {
    await pool.query('INSERT INTO ciudades (ciudad) VALUES (?)', [ciudad]);
    res.status(201).send('Ciudad agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la ciudad:', error);
    res.status(500).send('Error al agregar Ciudad');
  }
});
// Define el endpoint para obtener ciudades
app.get('/api/obtenerciudades', async (req, res) => {
  const query = 'SELECT ciudad FROM ciudades'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});

// Define el endpoint para obtener ciudades
app.get('/api/previewciudades', async (req, res) => {
  const query = 'SELECT * FROM ciudades'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});

//elimina la ciudad
app.delete('/api/eliminarciudad/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM ciudades WHERE idciudades = ?';
  try {
    const [results] = await pool.query(query, [id]);
    res.status(200).json({ message: 'Ciudad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar ciudad:', error);
    res.status(500).json({ error: 'Error al eliminar ciudad' });
  }
});

//agrega una moneda a la bd
app.post('/api/agregarMoneda', async (req, res) => {
  const { moneda } = req.body;
  try {
    await pool.query('INSERT INTO monedas (moneda) VALUES (?)', [moneda]);
    res.status(201).send('Moneda agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la moneda:', error);
    res.status(500).send('Error al agregar moneda');
  }
});

// Define el endpoint para obtener monedas
app.get('/api/previewmonedas', async (req, res) => {
  const query = 'SELECT * FROM monedas'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    res.status(500).json({ error: 'Error al obtener monedas' });
  }
});
// Define el endpoint para obtener monedas
app.get('/api/obtenermonedas', async (req, res) => {
  const query = 'SELECT moneda FROM monedas'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    res.status(500).json({ error: 'Error al obtener monedas' });
  }
});
//elimina la moneda
app.delete('/api/eliminarmoneda/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM monedas WHERE idmonedas = ?';

  try {
    const [results] = await pool.query(query, [id]);
    res.status(200).json({ message: 'Moneda eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar moneda:', error);
    res.status(500).json({ error: 'Error al eliminar moneda' });
  }
});
//--------------------------------------------------------------------------------------------------------------------
//agrega una moneda a la bd
app.post('/api/agregarCompania', async (req, res) => {
  const { compania } = req.body;
  try {
    await pool.query('INSERT INTO companias (compania) VALUES (?)', [compania]);
    res.status(201).send('Compañia agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la Compañia:', error);
    res.status(500).send('Error al agregar Compañia');
  }
});

// Define el endpoint para obtener monedas
app.get('/api/previewcompanias', async (req, res) => {
  const query = 'SELECT * FROM companias'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener compañias:', error);
    res.status(500).json({ error: 'Error al obtener compañias' });
  }
});
// Define el endpoint para obtener monedas
app.get('/api/obtenercompanias', async (req, res) => {
  const query = 'SELECT compania FROM companias'; // Cambia el nombre de la tabla si es diferente

  try {
    const [results] = await pool.query(query);
    res.status(200).json(results); // Envía los resultados como respuesta JSON
  } catch (error) {
    console.error('Error al obtener companias:', error);
    res.status(500).json({ error: 'Error al obtener companias' });
  }
});

//elimina la moneda
app.delete('/api/eliminarcompania/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM companias WHERE idcompanias = ?';

  try {
    const [results] = await pool.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Compañia no encontrada' });
    }

    res.status(200).json({ message: 'Compañia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar compañia:', error);
    res.status(500).json({ error: 'Error al eliminar compañia' });
  }
});

//Endpoint para inserter una guia impo.
app.post('/api/insertguiaimpo', async (req, res) => {
  console.log('Received request for /api/insertguiaimpo');

  // Datos enviados desde el formulario
  const {
    vueloSeleccionado,
    givuelofecha,
    giorigenvuelo,
    ginroguia,
    gifechaemisionguia,
    searchTerm,
    origenguiaSeleccionado,
    conexionguiaSeleccionado,
    destinoguiaSeleccionado,
    gitipodepagoguia,
    gimercaderiaguia,
    gipiezasguia,
    gipesoguia,
    gipesovolguia,
    moneda,
    giarbitrajeguia,
    gitarifaguia,
    gifleteoriginalguia,
    gidcoriginalguia,
    gidaoriginalguia,
    gifleteguia,
    giivas3guia,
    giduecarrierguia,
    gidueagentguia,
    giverificacionguia,
    gicollectfeeguia,
    gicfivaguia,
    giajusteguia,
    gitotalguia,
    gitotaldelaguia,
  } = req.body;

  try {

    // Verificar si la guía ya existe
    const checkGuiaQuery = 'SELECT * FROM guiasimpo WHERE guia = ?';
    const [existingGuia] = await pool.query(checkGuiaQuery, [ginroguia]);

    if (existingGuia.length > 0) {
      return res.status(400).json({ message: 'Este número de guía ya existe' });
    }

    // Si la guía no existe, procedemos con la inserción
    const insertGuiaQuery = `
        INSERT INTO guiasimpo (
          nrovuelo, fechavuelo, origenvuelo, guia, emision, consignatario,
          origenguia, conexionguia, destinoguia, tipodepagoguia,
          mercaderia, piezas, peso, pesovolumetrico,
          moneda, arbitraje, tarifa, fleteoriginal,
          dcoriginal, daoriginal, flete, ivas3,
          duecarrier, dueagent, verificacion,
          collectfee, cfiva, ajuste, total, totalguia
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    // Ejecutar la consulta con los valores correspondientes
    await pool.query(insertGuiaQuery, [
      vueloSeleccionado,
      givuelofecha,
      giorigenvuelo,
      ginroguia,
      gifechaemisionguia,
      searchTerm,
      origenguiaSeleccionado,
      conexionguiaSeleccionado,
      destinoguiaSeleccionado,
      gitipodepagoguia,
      gimercaderiaguia,
      gipiezasguia,
      gipesoguia,
      gipesovolguia,
      moneda,
      giarbitrajeguia,
      gitarifaguia,
      gifleteoriginalguia,
      gidcoriginalguia,
      gidaoriginalguia,
      gifleteguia,
      giivas3guia,
      giduecarrierguia,
      gidueagentguia,
      giverificacionguia,
      gicollectfeeguia,
      gicfivaguia,
      giajusteguia,
      gitotalguia,
      gitotaldelaguia
    ]);

    res.status(200).json({ message: 'Guía insertada exitosamente' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});
//Endpoint que trae todas las guias de impo que coincidan con el vuelo y la fecha del mismo
app.post('/api/fetchguiasimpo', async (req, res) => {
  console.log('Received request for /api/fetchguias');

  const { vueloSeleccionado, givuelofecha } = req.body;

  try {
    const fetchGuiasQuery = `
      SELECT idguia, guia, consignatario, total,totalguia, tipodepagoguia, facturada
      FROM guiasimpo
      WHERE nrovuelo = ? AND fechavuelo = ?
      ORDER BY fechaingresada DESC
    `;

    // Ejecutar la consulta usando pool
    const [results] = await pool.query(fetchGuiasQuery, [vueloSeleccionado, givuelofecha]);

    // Responder con las guías encontradas
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

//Endpoint que trae todas las guias de epo que coincidan con el vuelo y la fecha del mismo
app.post('/api/fetchguiasexpo', async (req, res) => {
  console.log('Received request for /api/fetchguias');

  const { vueloSeleccionado, gevuelofecha } = req.body;

  try {
    const fetchGuiasQuery = `
      SELECT idguiasexpo, guia, agente, total,cobrarpagar, tipodepago, facturada
      FROM guiasexpo
      WHERE nrovuelo = ? AND fechavuelo = ?
      ORDER BY fechaingresada DESC
    `;
    // Ejecutar la consulta usando pool
    const [results] = await pool.query(fetchGuiasQuery, [vueloSeleccionado, gevuelofecha]);

    // Responder con las guías encontradas
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.get('/api/obtenerguia/:guia', async (req, res) => {
  console.log('Received request for /api/obtenerguia');

  const { guia } = req.params; // Obtener el parámetro 'guia' de la URL

  try {
    const fetchGuiaQuery = `
      SELECT 
        nrovuelo, fechavuelo, origenvuelo, guia, emision, consignatario,
        origenguia, conexionguia, destinoguia, tipodepagoguia, mercaderia, piezas, peso, 
        pesovolumetrico, moneda, arbitraje, tarifa, fleteoriginal, dcoriginal, daoriginal, 
        flete, ivas3, duecarrier, dueagent, verificacion, collectfee, cfiva, ajuste, 
        total, totalguia
      FROM guiasimpo
      WHERE guia = ?
    `;


    // Ejecutar la consulta usando pool
    const [results] = await pool.query(fetchGuiaQuery, [guia]);

    if (results.length > 0) {
      res.status(200).json(results[0]); // Enviamos el primer resultado
    } else {
      res.status(404).json({ message: 'Guía no encontrada' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.get('/api/obtenerexpo/:guia', async (req, res) => {
  console.log('Received request for /api/obtenerexpo');

  const { guia } = req.params; // Obtener el parámetro 'guia' de la URL

  try {
    const fetchGuiaQuery = `
      SELECT 
        idguiasexpo, nrovuelo, fechavuelo, origenvuelo, conexionvuelo, destinovuelo, 
        empresavuelo, cass, agente, reserva, guia, emision, tipodepago, piezas, 
        pesobruto, pesotarifado, tarifaneta, tarifaventa, fleteneto, fleteawb, 
        duecarrier, dueagent, dbf, gsa, security, cobrarpagar, agentecollect, 
        total, fechaingresada, tipo
      FROM guiasexpo
      WHERE guia = ?
    `;
    // Ejecutar la consulta usando pool
    const [results] = await pool.query(fetchGuiaQuery, [guia]);

    if (results.length > 0) {
      res.status(200).json(results[0]); // Enviamos el primer (y único) resultado
    } else {
      res.status(404).json({ message: 'Guía no encontrada' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Endpoint para modificar la guía
app.post('/api/modificarguia', async (req, res) => {
  const datosGuia = req.body; // Datos recibidos desde el frontend

  const {
    guia, nrovuelo, fechavuelo, origenvuelo, emision, consignatario,
    origenguia, conexionguia, destinoguia, tipodepagoguia, mercaderia, piezas, peso,
    pesovolumetrico, moneda, arbitraje, tarifa, fleteoriginal, dcoriginal, daoriginal,
    flete, ivas3, duecarrier, dueagent, verificacion, collectfee, cfiva, ajuste, total,
    totalguia
  } = datosGuia;

  // Query para actualizar los datos de la guía en la base de datos
  const updateGuiaQuery = `
      UPDATE guiasimpo
      SET 
          nrovuelo = ?, 
          fechavuelo = ?, 
          origenvuelo = ?, 
          emision = ?, 
          consignatario = ?, 
          origenguia = ?, 
          conexionguia = ?, 
          destinoguia = ?, 
          tipodepagoguia = ?, 
          mercaderia = ?, 
          piezas = ?, 
          peso = ?, 
          pesovolumetrico = ?, 
          moneda = ?, 
          arbitraje = ?, 
          tarifa = ?, 
          fleteoriginal = ?, 
          dcoriginal = ?, 
          daoriginal = ?, 
          flete = ?, 
          ivas3 = ?, 
          duecarrier = ?, 
          dueagent = ?, 
          verificacion = ?, 
          collectfee = ?, 
          cfiva = ?, 
          ajuste = ?, 
          total = ?, 
          totalguia = ?
      WHERE guia = ?`;

  try {
    // Ejecutar la consulta de actualización
    const [result] = await pool.query(updateGuiaQuery, [
      nrovuelo, fechavuelo, origenvuelo, emision, consignatario, origenguia,
      conexionguia, destinoguia, tipodepagoguia, mercaderia, piezas, peso, pesovolumetrico,
      moneda, arbitraje, tarifa, fleteoriginal, dcoriginal, daoriginal, flete, ivas3, duecarrier,
      dueagent, verificacion, collectfee, cfiva, ajuste, total, totalguia, guia
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Guía actualizada correctamente' });
    } else {
      res.status(404).json({ message: 'No se encontró la guía para actualizar' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});
// Endpoint para modificar una guia expo
app.post('/api/modificarguiaexpo', async (req, res) => {
  const datosGuia = req.body; // Datos recibidos desde el frontend

  const {
    guia, nrovuelo, fechavuelo, origenvuelo, emision, agente,
    cass, conexionvuelo, destinovuelo, empresavuelo, reserva, tipodepago,
    piezas, pesobruto, pesotarifado, tarifaneta, tarifaventa, fleteneto,
    fleteawb, duecarrier, dueagent, dbf, gsa, security, cobrarpagar,
    agentecollect, total
  } = datosGuia;

  // Query para actualizar los datos de la guía en la base de datos
  const updateGuiaQuery = `
    UPDATE guiasexpo
    SET 
      nrovuelo = ?, 
      fechavuelo = ?, 
      origenvuelo = ?, 
      conexionvuelo = ?, 
      destinovuelo = ?, 
      empresavuelo = ?, 
      cass = ?, 
      agente = ?, 
      reserva = ?, 
      emision = ?, 
      tipodepago = ?, 
      piezas = ?, 
      pesobruto = ?, 
      pesotarifado = ?, 
      tarifaneta = ?, 
      tarifaventa = ?, 
      fleteneto = ?, 
      fleteawb = ?, 
      duecarrier = ?, 
      dueagent = ?, 
      dbf = ?, 
      gsa = ?, 
      security = ?, 
      cobrarpagar = ?, 
      agentecollect = ?, 
      total = ?
    WHERE guia = ?
  `;

  try {
    // Ejecutar la consulta de actualización
    const [result] = await pool.query(updateGuiaQuery, [
      nrovuelo, fechavuelo, origenvuelo, conexionvuelo, destinovuelo, empresavuelo,
      cass, agente, reserva, emision, tipodepago, piezas, pesobruto, pesotarifado,
      tarifaneta, tarifaventa, fleteneto, fleteawb, duecarrier, dueagent, dbf, gsa,
      security, cobrarpagar, agentecollect, total, guia
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Guía actualizada correctamente' });
    } else {
      res.status(404).json({ message: 'No se encontró la guía para actualizar' });
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});


app.delete('/api/eliminarGuia/:guia', async (req, res) => {
  const { guia } = req.params;
  console.log('Eliminando guia Impo', guia)

  try {
    const [result] = await pool.query('DELETE FROM guiasimpo WHERE idguia = ?', [guia]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Guía eliminada exitosamente' });
    } else {
      res.status(404).json({ message: 'No se encontró la guía para eliminar' });
    }
  } catch (error) {
    console.error('Error al eliminar la guía:', error);
    res.status(500).json({ error: 'Hubo un error al eliminar la guía' });
  }
});

app.delete('/api/eliminarGuiaExpo/:guiaAEliminar', async (req, res) => {
  const { guiaAEliminar } = req.params;
  console.log('Eliminando guia Expo', guiaAEliminar)
  try {
    const [result] = await pool.query('DELETE FROM guiasexpo WHERE idguiasexpo = ?', [guiaAEliminar]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Guía eliminada exitosamente' });
    } else {
      res.status(404).json({ message: 'No se encontró la guía para eliminar' });
    }
  } catch (error) {
    console.error('Error al eliminar la guía:', error);
    res.status(500).json({ error: 'Hubo un error al eliminar la guía' });
  }
});

app.get('/api/previewguias', async (req, res) => {
  console.log('Received request for /api/previewguias');

  try {
    const fetchGuiasQuery = `
      SELECT 
      g.*, 
      v.vuelo AS nombreVuelo, 
      v.compania, 
      DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fechavuelo_formateada, tipo
      FROM guiasimpo g
      LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
    `;
    // Ejecutar la consulta para obtener todas las guías
    const [results] = await pool.query(fetchGuiasQuery);

    // Enviar todas las guías obtenidas
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});
// Endpoint para obtener guías Expo
app.get('/api/previewguiasexpo', async (req, res) => {
  console.log('Received request for /api/previewguiasexpo');

  try {
    const fetchGuiasExpoQuery = `
      SELECT 
        e.*, 
        v.vuelo AS nombreVuelo, 
        v.compania, 
        DATE_FORMAT(e.fechavuelo, '%d/%m/%Y') AS fechavuelo_formateada, tipo
      FROM guiasexpo e
      LEFT JOIN vuelos v ON e.nrovuelo = v.idVuelos
    `;
    // Ejecutar la consulta para obtener todas las guías expo
    const [results] = await pool.query(fetchGuiasExpoQuery);

    // Enviar todas las guías expo obtenidas
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

//Endpoint para inserter una guia impo.
app.post('/api/insertguiaexpo', async (req, res) => {
  console.log('Received request for /api/insertguiaimpo');

  // Datos enviados desde el formulario
  const {
    vueloSeleccionado,
    gevuelofecha,
    origenVueloSeleccionado,
    conexionVueloSeleccionado,
    destinoVueloSeleccionado,
    empresavuelo,
    gecassvuelo,
    searchTerm,
    gereserva,
    genroguia,
    geemision,
    getipodepagoguia,
    gepiezasguia,
    gepesobrutoguia,
    gepesotarifadoguia,
    getarifanetaguia,
    getarifaventaguia,
    gefletenetoguia,
    gefleteawbguia,
    geduecarrierguia,
    gedueagentguia,
    gedbfguia,
    gegsaguia,
    gesecurityguia,
    gecobrarpagarguia,
    geagentecollectguia,
    getotalguia,
  } = req.body;

  try {
    // Consulta SQL para verificar si el número de guía ya existe
    const checkGuiaQuery = 'SELECT * FROM guiasexpo WHERE guia = ?';

    // Verificamos si la guía ya existe
    const [existing] = await pool.query(checkGuiaQuery, [genroguia]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Este número de guía ya existe' });
    }

    // Si la guía no existe, procedemos con la inserción
    const insertGuiaQuery = `
        INSERT INTO guiasexpo (
          nrovuelo, fechavuelo, origenvuelo, conexionvuelo, destinovuelo, empresavuelo, cass, agente, reserva, guia, emision, tipodepago, piezas, pesobruto, pesotarifado,
          tarifaneta, tarifaventa, fleteneto, fleteawb,
          duecarrier, dueagent, dbf, gsa,
          security, cobrarpagar, agentecollect,
          total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    // Ejecutar la consulta con los valores correspondientes
    await pool.query(insertGuiaQuery, [
      vueloSeleccionado,
      gevuelofecha,
      origenVueloSeleccionado,
      conexionVueloSeleccionado,
      destinoVueloSeleccionado,
      empresavuelo,
      gecassvuelo,
      searchTerm,
      gereserva,
      genroguia,
      geemision,
      getipodepagoguia,
      gepiezasguia,
      gepesobrutoguia,
      gepesotarifadoguia,
      getarifanetaguia,
      getarifaventaguia,
      gefletenetoguia,
      gefleteawbguia,
      geduecarrierguia,
      gedueagentguia,
      gedbfguia,
      gegsaguia,
      gesecurityguia,
      gecobrarpagarguia,
      geagentecollectguia,
      getotalguia,
    ]);

    res.status(200).json({ message: 'Guía insertada exitosamente' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.get('/api/obtenertipocambio', async (req, res) => {
  console.log('Received request for /api/obtenertipocambio');
  try {

    const fetchTipoCambioQuery = `
  SELECT id, DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha, tipo_cambio 
      FROM tipocambio ORDER BY tipocambio.fecha DESC
    `;

    const [results] = await pool.query(fetchTipoCambioQuery);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener los tipos de cambio:', error);
    res.status(500).json({ error: 'Error al obtener los tipos de cambio' });
  }
});

app.post('/api/agregartipocambio', async (req, res) => {
  console.log('Received request for /api/agregartipocambio');

  const { fecha, tipo_cambio } = req.body;

  // Validar que los datos estén presentes
  if (!fecha || !tipo_cambio) {
    return res.status(400).json({ error: 'Fecha y tipo de cambio son requeridos' });
  }

  try {
    const insertTipoCambioQuery = `
      INSERT INTO tipocambio (fecha, tipo_cambio)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE tipo_cambio = VALUES(tipo_cambio);
    `;

    // Ejecutar la consulta usando el pool
    await pool.query(insertTipoCambioQuery, [fecha, tipo_cambio]);

    res.status(200).json({ message: 'Tipo de cambio agregado/actualizado correctamente' });
  } catch (error) {
    console.error('Error al insertar el tipo de cambio:', error);
    res.status(500).json({ error: 'Error al insertar el tipo de cambio' });
  }
});

app.put('/api/modificartipocambio', async (req, res) => {
  console.log('Received request for /api/modificartipocambio');

  const { id, tipo_cambio, fecha } = req.body;

  // Validar que los datos estén presentes
  if (!id || !tipo_cambio || !fecha) {
    return res.status(400).json({ error: 'ID, fecha y tipo de cambio son requeridos' });
  }

  // Convertir la fecha al formato YYYY-MM-DD
  const fechaConvertida = fecha.split('/').reverse().join('-');

  try {
    // Verificar si existe una factura con la misma fecha
    const checkFacturaQuery = `
     SELECT COUNT(*) AS facturaCount
     FROM facturas
     WHERE Fecha = ?;
   `;

    const [facturaResults] = await pool.query(checkFacturaQuery, [fechaConvertida]);

    // Si hay una factura con la misma fecha, no permitir la modificación
    if (facturaResults[0].facturaCount > 0) {
      return res.status(450).json({ error: 'No se puede modificar el tipo de cambio, ya existe una factura con la misma fecha.' });
    }

    const updateTipoCambioQuery = `
      UPDATE tipocambio
      SET  tipo_cambio = ?
      WHERE id = ?;
    `;

    const [updateResults] = await pool.query(updateTipoCambioQuery, [tipo_cambio, id]);

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ error: 'Tipo de cambio no encontrado' });
    }

    res.status(200).json({ message: 'Tipo de cambio modificado correctamente' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Endpoint para eliminar un tipo de cambio
app.delete('/api/eliminartipocambio', async (req, res) => {
  console.log('Received request to delete tipo de cambio');

  const { id, fecha } = req.body; // Obtener el id del tipo de cambio que se va a eliminar

  // Validar que el id esté presente
  if (!id) {
    return res.status(400).json({ error: 'ID del tipo de cambio es requerido' });
  }
  // Convertir la fecha al formato YYYY-MM-DD
  const fechaConvertida = fecha.split('/').reverse().join('-');

  try {
    // Verificar si existe una factura con la misma fecha
    const checkFacturaQuery = `
     SELECT COUNT(*) AS facturaCount
     FROM facturas
     WHERE Fecha = ?;
   `;
    const [facturaResults] = await pool.query(checkFacturaQuery, [fechaConvertida]);

    if (facturaResults[0].facturaCount > 0) {
      return res.status(450).json({
        error: 'No se puede eliminar el tipo de cambio, ya que existe una factura con la misma fecha.'
      });
    }

    const deleteTipoCambioQuery = `
      DELETE FROM tipocambio WHERE id = ?;
    `;

    const [deleteResults] = await pool.query(deleteTipoCambioQuery, [id]);

    if (deleteResults.affectedRows === 0) {
      return res.status(404).json({ error: 'Tipo de cambio no encontrado' });
    }

    res.status(200).json({ message: 'Tipo de cambio eliminado correctamente' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Endpoint para obtener el tipo de cambio de la fecha actual
app.get('/api/obtenertipocambioparacomprobante', async (req, res) => {
  console.log('Received request for /api/obtenertipocambioparacomprobante');
  const query = 'SELECT tipo_cambio FROM tipocambio WHERE fecha = CURDATE()';

  try {
    const [results] = await pool.query(query);

    if (results.length === 0) {
      console.log('No hay tipo de cambio para la fecha actual');
      return res.status(400).json({ error: 'No hay tipo de cambio para la fecha actual' });
    }

    console.log(results[0].tipo_cambio);
    res.json({ tipo_cambio: results[0].tipo_cambio });
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

app.get('/api/obtenerembarques', async (req, res) => {
  console.log('Received request for /api/obtenerembarques');
  const { tipoEmbarque, clienteId } = req.query; // Obtener los parámetros de la consulta

  if (!tipoEmbarque || !clienteId) {
    return res.status(400).json({ error: 'Faltan parámetros (tipoEmbarque o clienteId)' });
  }

  let query = '';
  if (tipoEmbarque === 'Impo') {
    // Consulta para la tabla guiasimpo, buscando por el consignatario (cliente)
    query = `
    SELECT 
      g.*, 
      v.vuelo AS nombreVuelo, 
      v.compania AS empresavuelo, 
      DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fechavuelo_formateada
    FROM guiasimpo g
    LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
    WHERE g.consignatario = ? AND g.facturada <> 1
`;
  } else if (tipoEmbarque === 'Expo') {
    // Consulta para la tabla guiasexpo, buscando por el agente (cliente)
    query = `
    SELECT 
      g.*, 
      v.vuelo AS nombreVuelo, 
      DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fechavuelo_formateada
      FROM guiasexpo g
      LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
      WHERE g.agente = ? AND g.tipodepago = 'P' AND g.facturada <> 1 AND g.cass = 'N'
    `;
  } else {
    return res.status(400).json({ error: 'Tipo de embarque no válido' });
  }

  try {
    // Ejecutar la consulta con el pool
    const [results] = await pool.query(query, [clienteId]);

    if (results.length === 0) {
      console.log('No se encontraron embarques para el cliente y tipo de embarque');
      return res.status(404).json({ error: 'No se encontraron embarques' });
    }

    // Si la consulta es exitosa, devolver los embarques
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

app.post('/api/agregarconcepto', async (req, res) => {
  console.log('Received request for /api/agregarconcepto');
  const datosEmpresa = await obtenerDatosEmpresa(pool);

  const { codigo, codigoGIA, descripcionDesdeFront, selectedIva, unidadPrincipal, selectedClasificacion, selectedCategoria } = req.body;
  console.log(codigo, codigoGIA, descripcionDesdeFront, selectedIva, unidadPrincipal, selectedClasificacion, selectedCategoria)

  if (!codigo || !descripcionDesdeFront || !codigoGIA || !selectedIva || !unidadPrincipal || !selectedClasificacion || !selectedCategoria === undefined) {
    console.log('Faltan datos obligatorios');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const traducirIva = (valor) => {
    if (valor === 'iva_basica') return 'IVABAS';
    if (valor === 'iva_minimo') return 'IVAMIN';
    if (valor === 'exento') return 'IVAEXE';
    return valor;
  };
  const ivaWs = traducirIva(selectedIva);
  const construirXmlAgregarProducto = () => {
    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
        <soapenv:Header/>
        <soapenv:Body>
          <soap:agregarProducto>
            <xmlParametros><![CDATA[
              <agregarProductoParametros>
                <usuario>${datosEmpresa.usuarioGfe}</usuario>
                <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                <producto>
                  <codigo>${codigoGIA}</codigo>
                  <nombre>${descripcionDesdeFront}</nombre>
                  <descripcion>${descripcionDesdeFront}</descripcion>
                  <habilitado>S</habilitado>
                  <unidadPrincipal>${unidadPrincipal}</unidadPrincipal>
                  <clasificacion>${selectedClasificacion}</clasificacion>
                  <categoria>${selectedCategoria}</categoria>
                  <rubroVenta>${datosEmpresa.rubVentas}</rubroVenta>
                  <rubroCompra>${datosEmpresa.rubCompras}</rubroCompra>
                  <rubroCosto>${datosEmpresa.rubCostos}</rubroCosto>
                  <impuestos>
                    <impuesto>
                      <impuesto>${ivaWs}</impuesto>
                    </impuesto>
                  </impuestos>
                </producto>
              </agregarProductoParametros>
            ]]></xmlParametros>
          </soap:agregarProducto>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
  };

  const xml = construirXmlAgregarProducto();
  const xmlBuffer = Buffer.from(xml, 'utf-8');

  const headers = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"agregarProducto"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': datosEmpresa.serverFacturacion,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  try {
    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlBuffer,
      { headers }
    );

    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    const parsed = await parser.parseStringPromise(response.data);
    const innerXml = parsed?.Envelope?.Body?.agregarProductoResponse?.xmlResultado;

    if (!innerXml) {
      return res.status(500).json({ error: 'Respuesta del WS inválida: no se encontró xmlResultado' });
    }

    const rawXml = innerXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParsed = await xml2js.parseStringPromise(rawXml, { explicitArray: false });

    // Asegurate de que los campos existan
    const resultado = innerParsed?.agregarProductoResultado?.resultado;
    const descripcion = innerParsed?.agregarProductoResultado?.descripcion;

    if (resultado === '2') {
      // El WS respondió con error lógico
      return res.status(400).json({ error: descripcion || 'Error en el WebService' });
    }

    if (resultado !== '1') {
      // Resultado desconocido
      return res.status(500).json({ error: 'Respuesta inesperada del WebService' });
    }

    const query = `
      INSERT INTO conceptos (codigo, codigoGIA, descripcion, impuesto, unidadPrincipal, clasificacion, categoria)
      VALUES (UPPER(?), ?, ?, ?, ?, ?, ?)
    `;
    const values = [codigo, codigoGIA, descripcionDesdeFront, selectedIva, unidadPrincipal, selectedClasificacion, selectedCategoria];

    try {
      const [result] = await pool.query(query, values);
      console.log('Concepto agregado con ID:', result.insertId);
      res.json({ message: 'Concepto agregado con éxito', id: result.insertId, codigoGia: codigoGIA });
    } catch (err) {
      console.log('Error en la inserción:', err);
      return res.status(500).json({ error: 'Error al agregar el concepto a la base de datos' });
    }

  } catch (error) {
    console.error('Error al enviar solicitud SOAP:', error.message);
    return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
  }
});
app.get('/api/previewconceptos', async (req, res) => {
  console.log('Received request for /api/previewconceptos');

  const query = 'SELECT * FROM conceptos'; // Consulta para obtener todos los conceptos
  try {
    const [results] = await pool.query(query);
    console.log('Conceptos obtenidos:', results);
    res.json(results); // Devuelve los conceptos como respuesta
  } catch (err) {
    console.log('Error al obtener los conceptos:', err);
    res.status(500).json({ error: 'Error al obtener los conceptos' });
  }
});
app.delete('/api/eliminarconcepto/:id', async (req, res) => {
  const { id } = req.params; // Obtiene el id del concepto a eliminar

  // Asegúrate de que el ID sea un número válido antes de intentar eliminar
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de concepto inválido' });
  }

  const query = 'DELETE FROM conceptos WHERE idconcepto = ?';

  try {
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }

    console.log('Concepto eliminado con ID:', id);
    res.json({ message: 'Concepto eliminado con éxito' });
  } catch (err) {
    console.log('Error al eliminar el concepto:', err);
    res.status(500).json({ error: 'Error al eliminar el concepto' });
  }
});

app.get('/api/buscarconcepto/:codigo', async (req, res) => {
  const { codigo } = req.params;
  console.log('Código recibido en backend:', codigo);
  const query = 'SELECT * FROM conceptos WHERE codigo = ?';

  try {
    const [results] = await pool.query(query, [codigo]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }

    res.json(results[0]); // Devuelve el primer resultado encontrado
  } catch (err) {
    console.error('Error al obtener el concepto:', err);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

app.post('/api/insertfactura', async (req, res) => {
  console.log('Received request for /api/insertfactura');
  let connection;
  let facturaCuentaAjenaId;

  try {
    // Obtener conexión del pool
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const datosEmpresa = await obtenerDatosEmpresa(pool);
    const {
      IdCliente,
      Nombre,
      RazonSocial,
      DireccionFiscal,
      CodigoGIA,
      Ciudad,
      Pais,
      RutCedula,
      ComprobanteElectronico,
      Comprobante,
      Compania,
      Electronico,
      Moneda,
      Fecha,
      FechaVencimiento,
      TipoIVA,
      CASS,
      TipoEmbarque,
      TC,
      Subtotal,
      IVA,
      Redondeo,
      Total,
      TotalCobrar,
      DetalleFactura, // Lista de detalles para insertar
      SubtotalCuentaAjena,
      IVACuentaAjena,
      TotalCuentaAjena,
      RedondeoCuentaAjena,
      TotalCobrarCuentaAjena,
      EmbarquesSeleccionados
    } = req.body; // Los datos de la factura enviados desde el frontend
    console.log(JSON.stringify(req.body, null, 2));
    console.log('Moneda en el back: ', Moneda);
    if (Moneda === 'UYU') {
      DetalleFactura.forEach(detalle => {
        if (detalle.conceptos && Array.isArray(detalle.conceptos)) {
          detalle.conceptos = detalle.conceptos.map(concepto => ({
            ...concepto,
            importe: parseFloat((concepto.importe * TC).toFixed(2))
          }));
        }

        if (detalle.conceptos_cuentaajena && Array.isArray(detalle.conceptos_cuentaajena)) {
          detalle.conceptos_cuentaajena = detalle.conceptos_cuentaajena.map(concepto => ({
            ...concepto,
            importe: parseFloat((concepto.importe * TC).toFixed(2))
          }));
        }
      });
    }

    let comprobanteElectronicoFinal;

    switch (ComprobanteElectronico.toLowerCase()) {
      case 'efactura':
        comprobanteElectronicoFinal = datosEmpresa.codEfac;
        break;
      case 'efacturaca':
        comprobanteElectronicoFinal = datosEmpresa.codEfacCA;
        break;
      case 'eticket':
        comprobanteElectronicoFinal = datosEmpresa.codETick;
        break;
      case 'eticketca':
        comprobanteElectronicoFinal = datosEmpresa.codETickCA;
        break;
      default:
        comprobanteElectronicoFinal = ComprobanteElectronico; // Por si viene uno que no corresponde
        break;
    }

    console.log('Tipo de comprobante desde front', ComprobanteElectronico, 'Comprobante Convertido', comprobanteElectronicoFinal);



    console.log("Datos recibidos en el backend:", JSON.stringify(req.body, null, 2));
    // Consulta para insertar la factura
    const insertFacturaQuery = `
      INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                            ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia,fechaVencimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultFactura] = await connection.query(insertFacturaQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, comprobanteElectronicoFinal,
      Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
      Redondeo, Total, TotalCobrar, CodigoGIA, FechaVencimiento]);

    const facturaId = resultFactura.insertId; // Obtener el ID de la factura insertada

    console.log('Moneda antes de adenda: ', Moneda);

    // Insertar detalles de la factura principal
    const detallePromises = [];
    for (const detalle of DetalleFactura) {
      for (const concepto of detalle.conceptos) {
        detallePromises.push(connection.query(
          `INSERT INTO detalle_facturas (IdFactura, Tipo, Guia, Descripcion, Moneda, Importe, Id_concepto)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [facturaId, concepto.tipo, concepto.guia, concepto.descripcion, concepto.moneda, concepto.importe, concepto.id_concepto]
        ));
      }
    }
    // Si existen conceptos en 'conceptos_cuentaajena', crear una segunda factura
    if (DetalleFactura.some(detalle => detalle.conceptos_cuentaajena && detalle.conceptos_cuentaajena.length > 0)) {
      const insertFacturaCuentaAjenaQuery = `
    INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                          ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                          CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia,fechaVencimiento)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

      const [resultCuentaAjena] = await connection.query(insertFacturaCuentaAjenaQuery, [
        IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, datosEmpresa.codEfacCA, // ComprobanteElectronico como 'efacturaca'
        Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, SubtotalCuentaAjena, IVACuentaAjena,
        RedondeoCuentaAjena, TotalCuentaAjena, TotalCobrarCuentaAjena, CodigoGIA, FechaVencimiento
      ]);

      facturaCuentaAjenaId = resultCuentaAjena.insertId; // ID de la factura de cuenta ajena

      // Insertar detalles de factura de cuenta ajena
      for (const detalle of DetalleFactura) {
        for (const concepto of detalle.conceptos_cuentaajena || []) {
          detallePromises.push(connection.query(
            `INSERT INTO detalle_facturas (IdFactura, Tipo, Guia, Descripcion, Moneda, Importe, Id_concepto)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [facturaCuentaAjenaId, concepto.tipo, concepto.guia, concepto.descripcion, concepto.moneda, concepto.importe, concepto.id_concepto]
          ));
        }
      }
      // Insertar en cuenta corriente factura cuenta ajena
      await connection.query(
        `INSERT INTO cuenta_corriente (IdCliente, IdFactura, TipoDocumento, NumeroDocumento, Moneda, Debe, Fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [IdCliente, facturaCuentaAjenaId, 'Factura', facturaCuentaAjenaId, Moneda, TotalCobrarCuentaAjena, Fecha]
      );
    }
    for (const embarque of EmbarquesSeleccionados) {
      if (embarque.Tipo === 'IMPO') {
        await connection.query(
          `UPDATE guiasimpo SET idfactura = ?, idfacturacuentaajena = ?, facturada = 1 WHERE idguia = ?`,
          [facturaId, facturaCuentaAjenaId, embarque.idguia]
        );
      } else {
        await connection.query(
          `UPDATE guiasexpo SET idfactura = ?, facturada = 1 WHERE idguiasexpo = ?`,
          [facturaId, embarque.idguiasexpo]
        );
      }
    }

    // Esperar inserción de todos los detalles
    await Promise.all(detallePromises);
    // Insertar en cuenta corriente principal
    await connection.query(
      `INSERT INTO cuenta_corriente (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, Moneda, Debe)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [IdCliente, facturaId, Fecha, 'Factura', Comprobante, Moneda, TotalCobrar]
    );


    // Preparar datos SOAP


    const detallesFactura = DetalleFactura.flatMap((detalle) => {
      return detalle.conceptos.map((concepto) => {
        const importeNumerico = parseFloat(concepto.importe) || 0; // convierte a número o 0 si no es válido
        const importeFormateado = parseFloat(importeNumerico.toFixed(2));

        return {
          codItem: concepto.id_concepto.toString(), // Asignamos el codItem como el id del concepto, formateado con ceros a la izquierda
          indicadorFacturacion: importeFormateado === 0 ? "5" : "1",
          nombreItem: concepto.descripcion, // Usamos la descripción como el nombre del item
          cantidad: "1", // Asignamos la cantidad como "1", ya que no se especifica en los datos
          unidadMedida: "UN", // Unidad de medida "UN"
          precioUnitario: importeFormateado.toFixed(2), // Precio unitario del concepto, formateado con 2 decimales
        };
      });
    });
    const detallesCuentaAjena = DetalleFactura.flatMap((detalle) => {
      return (Array.isArray(detalle.conceptos_cuentaajena) ? detalle.conceptos_cuentaajena : []).map((concepto) => {
        const importeNumerico = parseFloat(concepto.importe) || 0; // convierte a número o 0 si no es válido
        const importeFormateado = parseFloat(importeNumerico.toFixed(2));


        return {
          codItem: concepto.id_concepto.toString(), // Código del ítem
          indicadorFacturacion: importeFormateado === 0 ? "5" : "1", // "5" si el importe es 0, si no "1"
          nombreItem: concepto.descripcion, // Descripción del concepto
          cantidad: "1", // Siempre "1"
          unidadMedida: "UN", // Unidad de medida
          precioUnitario: importeFormateado.toFixed(2), // Importe con 2 decimales como string
        };
      });
    });

    const DatosAdendaFact = DetalleFactura.flatMap((item) => item.datosAdenda || []);
    const DatosAdendaFactCA = DetalleFactura.flatMap((item) => item.datosAdendaCA || []);

    const adenda = generarAdendaConConceptos(facturaId, TotalCobrar, Moneda, DatosAdendaFact);
    const adendaCuentaAjena = facturaCuentaAjenaId
      ? generarAdendaConConceptos(facturaCuentaAjenaId, TotalCuentaAjena, Moneda, DatosAdendaFactCA)
      : null;

    const datos = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda: Moneda,
      detalleFactura: detallesFactura,
      adendadoc: adenda,
      datosEmpresa: datosEmpresa,
      codigoClienteGIA: CodigoGIA
    }
    const datosEfacCuentaAjena = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda: Moneda,
      detalleFacturaCuentaAjena: detallesCuentaAjena,
      adendadoc: adendaCuentaAjena,
      datosEmpresa: datosEmpresa,
      codigoClienteGIA: CodigoGIA,
      EmpresaCuentaAjena: Compania
    };
    const datosEfacCuentaAjenaExpo = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda: Moneda,
      detalleFacturaCuentaAjena: detallesFactura,
      adendadoc: adenda,
      datosEmpresa: datosEmpresa,
      codigoClienteGIA: CodigoGIA,
      EmpresaCuentaAjena: Compania
    };


    console.log('ESTOS SON LOS DATOS:', datos);

    // Generar los XMLs
    if (comprobanteElectronicoFinal === 'FTA') {
      console.log('➡ Generando XML con generarXmlefacCuentaAjenaimpopp (Cuenta Ajena)');
      xml = generarXmlefacCuentaAjenaimpopp(datosEfacCuentaAjenaExpo);
    } else {
      console.log('➡ Generando XML con generarXmlefacimpopp (Factura normal)');
      xml = generarXmlefacimpopp(datos);
    }
    console.log('ESTOS SON LOS DATOSca:', datosEfacCuentaAjena);
    const xmlCuentaAjena = facturaCuentaAjenaId ? generarXmlefacCuentaAjenaimpopp(datosEfacCuentaAjena) : null;
    console.log('Procesando FacuturaSoap');
    // Llamada directa a la función SOAP
    const resultadoSOAP = await procesarFacturaSOAP(xml, xmlCuentaAjena);
    console.log('Resultado FacuturaSoap', resultadoSOAP);
    // Actualizar base de datos con resultados
    const updateQuery = `
    UPDATE facturas SET FechaCFE=?, ComprobanteElectronico=?, TipoDocCFE=?, SerieCFE=?, NumeroCFE=?, PdfBase64=?, Adenda=? WHERE Id=?
  `;
    const updateCuentaCorrienteQuery = `
    UPDATE cuenta_corriente SET TipoDocumento=?, NumeroDocumento=?, Fecha=? WHERE IdFactura=?
  `;

    // Factura principal
    if (resultadoSOAP[0]) {
      const doc1 = resultadoSOAP[0];
      await connection.query(updateQuery, [
        doc1.fechadocumento, doc1.tipodocumento, doc1.tipodocumento,
        doc1.seriedocumento, doc1.numerodocumento, doc1.pdfBase64, adenda, facturaId
      ]);
      await connection.query(updateCuentaCorrienteQuery, [
        doc1.tipodocumento, doc1.numerodocumento, doc1.fechadocumento, facturaId
      ]);
    }

    // Factura cuenta ajena
    if (facturaCuentaAjenaId && resultadoSOAP[1]) {
      const doc2 = resultadoSOAP[1];
      await connection.query(updateQuery, [
        doc2.fechadocumento, doc2.tipodocumento, doc2.tipodocumento,
        doc2.seriedocumento, doc2.numerodocumento, doc2.pdfBase64, adendaCuentaAjena, facturaCuentaAjenaId
      ]);
      await connection.query(updateCuentaCorrienteQuery, [
        doc2.tipodocumento, doc2.numerodocumento, doc2.fechadocumento, facturaCuentaAjenaId
      ]);
    }

    console.log('Resultado SOAP recibido:', JSON.stringify(resultadoSOAP, null, 2));
    await connection.commit();
    res.status(200).json({
      success: true,
      resultados: resultadoSOAP,
      facturaId,
      facturaCuentaAjenaId
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error en /api/insertfactura:', err);
    res.status(500).json({ error: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/insertticket', async (req, res) => {
  let connection;
  let TicketCuentaAjenaId;

  console.log('Received request for /api/insertticket');

  try {
    // Obtener conexión del pool y comenzar transacción
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const datosEmpresa = await obtenerDatosEmpresa(pool);
    const {
      IdCliente,
      Nombre,
      RazonSocial,
      DireccionFiscal,
      CodigoGIA,
      Ciudad,
      Pais,
      RutCedula,
      ComprobanteElectronico,
      Comprobante,
      Compania,
      Electronico,
      Moneda,
      Fecha,
      FechaVencimiento,
      TipoIVA,
      CASS,
      TipoEmbarque,
      TC,
      Subtotal,
      IVA,
      Redondeo,
      Total,
      TotalCobrar,
      DetalleFactura,
      SubtotalCuentaAjena,
      IVACuentaAjena,
      TotalCuentaAjena,
      RedondeoCuentaAjena,
      TotalCobrarCuentaAjena,
      EmbarquesSeleccionados
    } = req.body;

    // Convertir comprobante
    let comprobanteElectronicoFinal;
    switch (ComprobanteElectronico.toLowerCase()) {
      case 'efactura': comprobanteElectronicoFinal = datosEmpresa.codEfac; break;
      case 'efacturaca': comprobanteElectronicoFinal = datosEmpresa.codEfacCA; break;
      case 'eticket': comprobanteElectronicoFinal = datosEmpresa.codETick; break;
      case 'eticketca': comprobanteElectronicoFinal = datosEmpresa.codETickCA; break;
      default: comprobanteElectronicoFinal = ComprobanteElectronico; break;
    }

    console.log('Tipo de comprobante desde front', ComprobanteElectronico, 'Comprobante Convertido', comprobanteElectronicoFinal);

    // Insertar ticket principal
    const insertTicketQuery = `
      INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                            ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia, fechaVencimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultTicket] = await connection.query(insertTicketQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, comprobanteElectronicoFinal,
      Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
      Redondeo, Total, TotalCobrar, CodigoGIA, FechaVencimiento
    ]);

    const ticketId = resultTicket.insertId;

    // Función para insertar detalles en batches
    const insertDetalles = async (facturaId, conceptos) => {
      const batchSize = 50; // tamaño del batch
      for (let i = 0; i < conceptos.length; i += batchSize) {
        const batch = conceptos.slice(i, i + batchSize);
        const values = batch.map(c => [facturaId, c.tipo, c.guia, c.descripcion, c.moneda, c.importe, c.id_concepto]);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
        const query = `INSERT INTO detalle_facturas (IdFactura, Tipo, Guia, Descripcion, Moneda, Importe, Id_concepto) VALUES ${placeholders}`;
        await connection.query(query, values.flat());
      }
    };

    // Insertar detalles ticket principal
    for (const detalle of DetalleFactura) {
      await insertDetalles(ticketId, detalle.conceptos);
    }

    // Si existen conceptos de cuenta ajena
    if (DetalleFactura.some(detalle => detalle.conceptos_cuentaajena?.length > 0)) {
      const insertTicketCuentaAjenaQuery = `
        INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                              ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                              CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia, fechaVencimiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [resultCuentaAjena] = await connection.query(insertTicketCuentaAjenaQuery, [
        IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, datosEmpresa.codETickCA,
        Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC,
        SubtotalCuentaAjena, IVACuentaAjena, RedondeoCuentaAjena, TotalCuentaAjena, TotalCobrarCuentaAjena, CodigoGIA, FechaVencimiento
      ]);

      TicketCuentaAjenaId = resultCuentaAjena.insertId;

      // Insertar detalles ticket cuenta ajena
      for (const detalle of DetalleFactura) {
        if (detalle.conceptos_cuentaajena?.length > 0) {
          await insertDetalles(TicketCuentaAjenaId, detalle.conceptos_cuentaajena);
        }
      }

      // Insertar en cuenta corriente
      await connection.query(
        `INSERT INTO cuenta_corriente (IdCliente, IdFactura, TipoDocumento, NumeroDocumento, Moneda, Debe, Fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [IdCliente, TicketCuentaAjenaId, 'Eticket Cuenta Ajena', TicketCuentaAjenaId, Moneda, TotalCobrarCuentaAjena, Fecha]
      );
    }

    // Actualizar embarques
    for (const embarque of EmbarquesSeleccionados) {
      if (embarque.Tipo === 'IMPO') {
        await connection.query(
          `UPDATE guiasimpo SET idfactura = ?, idfacturacuentaajena = ?, facturada = 1 WHERE idguia = ?`,
          [ticketId, TicketCuentaAjenaId, embarque.idguia]
        );
      } else {
        await connection.query(
          `UPDATE guiasexpo SET idfactura = ?, facturada = 1 WHERE idguiasexpo = ?`,
          [ticketId, embarque.idguiasexpo]
        );
      }
    }

    // Insertar cuenta corriente principal
    await connection.query(
      `INSERT INTO cuenta_corriente (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, Moneda, Debe)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [IdCliente, ticketId, Fecha, 'Eticket', ticketId, Moneda, TotalCobrar]
    );

    // Commit de la transacción
    await connection.commit();

    // Generar datos para SOAP
    const adenda = generarAdenda(ticketId, TotalCobrar, Moneda);
    const adendaCuentaAjena = TicketCuentaAjenaId ? generarAdenda(TicketCuentaAjenaId, TotalCuentaAjena, Moneda) : null;

    const detallesFactura = DetalleFactura.flatMap(d =>
      d.conceptos.map(c => {
        const importeNumerico = parseFloat(c.importe) || 0; // convierte a número o 0 si no es válido
        const importeFormateado = importeNumerico.toFixed(2); // string con 2 decimales
        return {
          codItem: c.id_concepto.toString(),
          indicadorFacturacion: importeNumerico === 0 ? "5" : "1",
          nombreItem: c.descripcion,
          cantidad: "1",
          unidadMedida: "UN",
          precioUnitario: importeFormateado
        };
      })
    );
    const detallesCuentaAjena = DetalleFactura.flatMap(d =>
      (d.conceptos_cuentaajena || []).map(c => {
        const importeNumerico = parseFloat(c.importe) || 0; // convierte a número o 0 si no es válido
        const importeFormateado = importeNumerico.toFixed(2); // string con 2 decimales
        return {
          codItem: c.id_concepto.toString(),
          indicadorFacturacion: importeNumerico === 0 ? "5" : "1",
          nombreItem: c.descripcion,
          cantidad: "1",
          unidadMedida: "UN",
          precioUnitario: importeFormateado
        };
      })
    );
    const datos = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda,
      detalleFactura: detallesFactura,
      adendadoc: adenda,
      datosEmpresa,
      codigoClienteGIA: CodigoGIA,
      tipoComprobante: datosEmpresa.codETick
    };

    const datosEfacCuentaAjena = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda,
      detalleFactura: detallesCuentaAjena,
      adendadoc: adendaCuentaAjena,
      datosEmpresa,
      codigoClienteGIA: CodigoGIA,
      tipoComprobante: datosEmpresa.codETickCA,
      EmpresaCuentaAjena: Compania
    };
    const datosEfacCuentaAjenaExpo = {
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      Moneda: Moneda,
      detalleFactura: detallesFactura,
      adendadoc: adenda,
      datosEmpresa: datosEmpresa,
      codigoClienteGIA: CodigoGIA,
      tipoComprobante: datosEmpresa.codETickCA,
      EmpresaCuentaAjena: Compania
    };

    // Enviar SOAP
    if (comprobanteElectronicoFinal === 'TTA') {
      console.log('➡ Generando XML con TICKET (Cuenta Ajena)');
      xml = generarXmlimpactarDocumento(datosEfacCuentaAjenaExpo);
    } else {
      console.log('➡ Generando XML coN TICKET');
      xml = generarXmlimpactarDocumento(datos);
    }
    const xmlCuentaAjena = TicketCuentaAjenaId ? generarXmlimpactarDocumento(datosEfacCuentaAjena) : null;
    console.log('XML TICKET GENERADO: ', xml, ' XML TICKETCA GENERADO: ', xmlCuentaAjena);

    const resultadoSOAP = await new Promise((resolve, reject) => {
      axios.post('http://localhost:5000/pruebaws', { xml, xmlCuentaAjena })
        .then(async response => {
          const updateQuery = `
            UPDATE facturas SET 
              FechaCFE = ?, 
              TipoDocCFE = ?, 
              SerieCFE = ?, 
              NumeroCFE = ?, 
              PdfBase64 = ?
            WHERE Id = ?
          `;

          const doc1 = response.data.resultados[0];
          const doc2 = response.data.resultados[1];

          await connection.query(updateQuery, [
            doc1.fechadocumento, doc1.tipodocumento, doc1.seriedocumento, doc1.numerodocumento, doc1.pdfBase64, ticketId
          ]);

          if (TicketCuentaAjenaId) {
            await connection.query(updateQuery, [
              doc2.fechadocumento, doc2.tipodocumento, doc2.seriedocumento, doc2.numerodocumento, doc2.pdfBase64, TicketCuentaAjenaId
            ]);
          }

          resolve(response.data);
        })
        .catch(err => reject(err));
    });

    res.status(200).json(resultadoSOAP);

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error en /api/insertticket:', err);
    res.status(500).json({ error: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/insertfacturamanual', async (req, res) => {
  let connection;
  try {
    console.log('Received request for /api/insertfactura');
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const {
      IdCliente,
      Nombre,
      codigoClienteGIA,
      RazonSocial,
      DireccionFiscal,
      Ciudad,
      Pais,
      RutCedula,
      ComprobanteElectronico,
      Comprobante,
      Electronico,
      Moneda,
      Fecha,
      FechaVencimiento,
      TipoIVA,
      CASS,
      TipoEmbarque,
      TC,
      Subtotal,
      IVA,
      Redondeo,
      Total,
      TotalCobrar,
      DetalleFactura,
      Adenda
    } = req.body; // Los datos de la factura enviados desde el frontend

    const datosEmpresa = await obtenerDatosEmpresa(pool);

    let tipoComprobante;

    switch (ComprobanteElectronico) {
      case 'efactura':
        tipoComprobante = datosEmpresa.codEfac;
        break;
      case 'eticket':
        tipoComprobante = datosEmpresa.codETick;
        break;
      case 'efacturaca':
        tipoComprobante = datosEmpresa.codEfacCA;
        break;
      case 'eticketca':
        tipoComprobante = datosEmpresa.codETickCA;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de comprobante electrónico no reconocido' });
    }


    console.log("Datos recibidos en el backend:", JSON.stringify(req.body, null, 2));
    // Consulta para insertar la factura
    const insertFacturaQuery = `
      INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                            ComprobanteElectronico, Comprobante, Electronico, Moneda, Fecha, TipoIVA, 
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia, esManual, fechaVencimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultFactura] = await connection.query(insertFacturaQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, tipoComprobante,
      Comprobante, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
      Redondeo, Total, TotalCobrar, codigoClienteGIA, 1, FechaVencimiento
    ]);

    const facturaId = resultFactura.insertId;

    // Insertar detalles en batches
    const insertDetalles = async (facturaId, detalles) => {
      const batchSize = 50;
      for (let i = 0; i < detalles.length; i += batchSize) {
        const batch = detalles.slice(i, i + batchSize);
        const values = batch.map(d => [
          facturaId, d.codigo, d.descripcion, d.moneda, d.ivaCalculado, d.importe, d.impuesto, d.codigoGIA
        ]);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const query = `INSERT INTO detalle_facturas_manuales 
          (IdFactura, Codigo, Descripcion, Moneda, IVA, Importe, impuesto, codigoGIA) 
          VALUES ${placeholders}`;
        await connection.query(query, values.flat());
      }
    };

    if (!Array.isArray(DetalleFactura)) {
      throw new Error('DetalleFactura no está bien formado');
    }
    await insertDetalles(facturaId, DetalleFactura);

    const insertCuentaCorrienteQuery = `
            INSERT INTO cuenta_corriente (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, 
                                          Moneda, Debe)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

    await connection.query(insertCuentaCorrienteQuery, [
      IdCliente, facturaId, Fecha, 'Factura', Comprobante, Moneda, TotalCobrar
    ]);

    // Commit de la transacción antes del SOAP
    await connection.commit();

    let adendaGenerada = generarAdenda(facturaId, TotalCobrar, Moneda);

    // Adenda ingresada por el usuario (desde modal del frontend)
    let adendaFront = Adenda || "";

    // Concatenación con salto de línea REAL para XML
    let adendaFinal = `${adendaGenerada}\n${adendaFront}`.trim();

    const datosParaXML = {
      datosEmpresa: {
        usuarioGfe: datosEmpresa.usuarioGfe, // Reemplazalo con tus valores reales
        passwordGfe: datosEmpresa.passwordGfe,
        codigoEmpresa: datosEmpresa.codigoEmpresa
      },
      tipoComprobante: tipoComprobante, // O usa un código como "101" si lo tenés mapeado
      codigoClienteGIA: codigoClienteGIA || '', // Lo tenés que traer del cliente, si no venía del frontend
      Moneda: Moneda,
      fechaCFE: Fecha,
      fechaVencimientoCFE: FechaVencimiento,
      adendadoc: adendaFinal, // o cualquier observación que uses
      detalleFactura: DetalleFactura.map((item) => ({
        codItem: item.codigoGIA,
        nombreItem: item.descripcion,
        cantidad: 1, // Podés cambiarlo si manejás cantidades reales
        precioUnitario: parseFloat(item.importe) || 0.00
      }))
    };

    const xmlGenerado = generarXmlimpactarDocumento(datosParaXML);
    console.log('XML generado para envío:', xmlGenerado);
    const xmlBuffer = Buffer.from(xmlGenerado, 'utf-8');

    // Headers SOAP
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarDocumentoFacturacion"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': datosEmpresa.serverFacturacion,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
    };

    const headersObtenerPdf = {
      ...headers,
      SOAPAction: '"obtenerRepresentacionImpresaDocumentoFacturacion"',
    };

    // Helpers para parsear XML SOAP
    const parseSOAP = async (xmlData) => {
      const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
      return await parser.parseStringPromise(xmlData);
    };

    const parseInnerXML = async (escapedXml) => {
      const rawXml = escapedXml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      const innerParser = new xml2js.Parser({ explicitArray: false });
      return await innerParser.parseStringPromise(rawXml);
    };

    const construirXmlObtenerPdf = ({ fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento }) => `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
    <soapenv:Header/>
    <soapenv:Body>
      <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
        <xmlParametros><![CDATA[
          <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
            <usuario>${datosEmpresa.usuarioGfe}</usuario>
            <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
            <empresa>${datosEmpresa.codigoEmpresa}</empresa>
            <documento>
              <fechaDocumento>${fechaDocumento}</fechaDocumento>
              <tipoDocumento>${tipoDocumento}</tipoDocumento>
              <serieDocumento>${serieDocumento}</serieDocumento>
              <numeroDocumento>${numeroDocumento}</numeroDocumento>
            </documento>
          </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
        ]]></xmlParametros>
      </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
    </soapenv:Body>
  </soapenv:Envelope>
`;
    let datosDoc = null;
    let pdfBase64 = null;

    try {
      // Paso 2: Impactar documento
      const response = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlBuffer,
        { headers }
      );

      const parsed = await parseSOAP(response.data);
      const innerXml = parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado;
      const result = await parseInnerXML(innerXml);
      const resultado = result.agregarDocumentoFacturacionResultado;

      if (resultado.resultado !== "1") {
        return res.status(422).json({
          success: false,
          message: 'Error al impactar el documento',
          descripcion: resultado.descripcion,
        });
      }

      // Paso 3: Obtener PDF
      datosDoc = resultado.datos.documento;

      const xmlPdf = construirXmlObtenerPdf({
        fechaDocumento: datosDoc.fechaDocumento,
        tipoDocumento: datosDoc.tipoDocumento,
        serieDocumento: datosDoc.serieDocumento,
        numeroDocumento: datosDoc.numeroDocumento,
      });

      const pdfResponse = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlPdf,
        { headers: headersObtenerPdf }
      );

      const parsedPdf = await parseSOAP(pdfResponse.data);
      const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
      const innerPdf = await parseInnerXML(innerPdfXmlEscaped);

      pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado?.datos?.pdfBase64 || null;


      // Paso 4: Actualizar la factura con los datos del CFE
      const updateQuery = `
      UPDATE facturas SET 
        FechaCFE = ?, 
        TipoDocCFE = ?, 
        SerieCFE = ?, 
        NumeroCFE = ?, 
        PdfBase64 = ?
      WHERE Id = ?
    `;

      await connection.query(updateQuery, [
        datosDoc.fechaDocumento,
        datosDoc.tipoDocumento,
        datosDoc.serieDocumento,
        datosDoc.numeroDocumento,
        pdfBase64,
        facturaId // << Asegurate que este valor esté bien definido
      ]);
    } catch (soapError) {
      console.error('Error SOAP:', soapError);
      // opcional: podés decidir si hacer rollback aquí o solo loguearlo
      throw soapError; // para que caiga al catch general y haga rollback
    }
    res.status(200).json({
      success: true,
      message: `Factura ${facturaId} impactada y guardada correctamente`,
      documento: {
        fecha: datosDoc.fechaDocumento,
        tipo: datosDoc.tipoDocumento,
        serie: datosDoc.serieDocumento,
        numero: datosDoc.numeroDocumento,
        pdfBase64: pdfBase64
      }
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error en /api/insertfacturamanual:', err);
    res.status(500).json({ error: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/movimientos/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log(`Received request for /api/movimientos/${idCliente}`); // Log para depuración

  const sql = `
    SELECT 
    IdMovimiento, 
    IdCliente, 
    IdFactura, 
    DATE_FORMAT(Fecha, '%d/%m/%Y') AS Fecha, 
    TipoDocumento, 
    NumeroDocumento, 
    NumeroRecibo, 
    Moneda, 
    Debe, 
    Haber
    FROM cuenta_corriente 
    WHERE IdCliente = ? 
    AND Fecha <= CURDATE()
    ORDER BY Fecha DESC;
  `;

  try {
    const [results] = await pool.query(sql, [idCliente]);

    if (results.length === 0) {
      console.log('No hay movimientos para este cliente');
      return res.status(404).json({ message: 'No hay movimientos para este cliente' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
});
app.get('/api/historialfac/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log(`Received request for /api/historialfac/${idCliente}`);
  console.log('🟢 ID Cliente recibido:', idCliente, typeof idCliente);

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const sql = `
  SELECT 
    *,
    DATE_FORMAT(FechaCFE, '%d/%m/%Y') AS FechaCFEFormateada
  FROM facturas
  WHERE IdCliente = ?
    AND NumeroCFE IS NOT NULL
    AND NumeroCFE != 0
  ORDER BY FechaCFE DESC;
`;

  try {
    const [results] = await pool.query(sql, [idCliente]);

    if (results.length === 0) {
      console.log('No hay facturas emitidas para este cliente');
      return res.status(200).json({ message: 'No hay facturas emitidas para este cliente' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener historial de facturación:', error);
    res.status(500).json({ message: 'Error al obtener historial de facturación' });
  }
});
app.get('/api/saldo/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log(`Calculando saldo total para el cliente ${idCliente}`);

  const sql = `
    SELECT 
      (c.Saldo + COALESCE(SUM(cc.Haber), 0) - COALESCE(SUM(cc.Debe), 0)) AS Saldo
    FROM clientes c
    LEFT JOIN cuenta_corriente cc 
      ON c.Id = cc.IdCliente 
      AND cc.Fecha <= CURDATE()
    WHERE c.Id = ?
    GROUP BY c.Saldo;
  `;

  try {
    const [results] = await pool.query(sql, [idCliente]);

    // Si el cliente no existe, devolvemos saldo 0
    const saldo = results.length > 0 ? results[0].Saldo || 0 : 0;

    res.status(200).json({ saldo });
  } catch (error) {
    console.error('Error al calcular saldo:', error);
    res.status(500).json({ message: 'Error al calcular saldo.' });
  }
});

app.get('/api/buscarfacturaporcomprobante/:comprobante', async (req, res) => {
  const { comprobante } = req.params;
  const sql = `SELECT * FROM facturas WHERE Id = ?`;
  try {
    const [results] = await pool.query(sql, [comprobante]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada.' });
    }

    const factura = results[0];

    // Comprobamos si la factura tiene un valor en el campo idrecibo
    if (factura.idrecibo) {
      return res.status(200).json({ message: 'Tiene Recibo.', factura });
    }

    res.status(200).json(factura); // Devuelve la factura
  } catch (error) {
    console.error('Error al buscar la factura:', error);
    res.status(500).json({ message: 'Error al buscar la factura.' });
  }
});

// Ruta para insertar un recibo
app.post('/api/insertrecibo', async (req, res) => {
  console.log('Received request for /api/insertrecibo');

  const {
    nrorecibo,
    fecha,
    idcliente,
    clienteGIA,
    nombrecliente,
    moneda,
    importe,
    formapago,
    razonsocial,
    rut,
    direccion,
    listadepagos,
    aCuenta,
    comentario
  } = req.body;

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const datosEmpresa = await obtenerDatosEmpresa(pool);
    const formularioausar = datosEmpresa.ultimoFormularioRecibo + 1;
    const documentoausar = datosEmpresa.ultimoDocumentoRecibo + 1;

    // 🔸 INSERTAR RECIBO
    const insertReciboQuery = `
      INSERT INTO recibos (nrorecibo, fecha, idcliente, nombrecliente, moneda, importe, formapago, razonsocial, rut, direccion, nroformulario, aCuenta, comentario)
      VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultInsert] = await connection.query(insertReciboQuery, [
      documentoausar, fecha, idcliente, nombrecliente, moneda, importe,
      formapago, razonsocial, rut, direccion, formularioausar, aCuenta, comentario
    ]);
    const idrecibo = resultInsert.insertId;

    // 🔸 ACTUALIZAR datos_empresa
    const updateEmpresaQuery = `
      UPDATE datos_empresa
      SET ultimoFormularioRecibo = ?, ultimoDocumentoRecibo = ?, fechaModifica = CURRENT_DATE
      WHERE id = ?
    `;
    await connection.query(updateEmpresaQuery, [
      formularioausar,
      documentoausar,
      datosEmpresa.id
    ]);
    // 🔸 INSERTAR PAGOS (si hay)
    if (Array.isArray(listadepagos) && listadepagos.length > 0) {
      const pagosValues = listadepagos.map(pago => [
        idrecibo,
        pago.icfecha,
        pago.icbanco,
        pago.icnrocheque,
        pago.ictipoMoneda,
        pago.icimpdelcheque,
        pago.icfechavencimiento
      ]);

      const insertPagosQuery = `
        INSERT INTO pagos (idrecibo, fecha, banco, nro_pago, moneda, importe, vencimiento)
        VALUES ?
      `;
      await connection.query(insertPagosQuery, [pagosValues]);
    }

    //COMMIT si todo salió bien
    await connection.commit();


    console.log('Recibo y pagos insertados correctamente');
    return res.status(200).json({
      message: 'Recibo y pagos insertados exitosamente',
      idrecibo,            // el ID autoincremental
      nrorecibo: documentoausar  // el número de recibo real que se insertó
    });

  } catch (error) {
    console.error('❌ Error general en insertrecibo:', error);

    if (connection) {
      try {
        await connection.rollback();
        console.log('Rollback ejecutado correctamente');
      } catch (rollbackError) {
        console.error('Error durante el rollback:', rollbackError);
      }
    }

    return res.status(500).json({ error: 'Error general en insertrecibo', detalle: error.message });

  } finally {
    if (connection) connection.release();
  }
});


app.post('/api/impactarrecibo', async (req, res) => {
  console.log('ImpactarRecibo endpoint alcanzado');
  const { idrecibo } = req.body;
  console.log('ID RECIBIDO:', idrecibo);
  try {
    const datosEmpresa = await obtenerDatosEmpresa(pool);
    // 1. Traer datos del recibo
    const [reciboRows] = await pool.query('SELECT * FROM recibos WHERE idrecibo = ?', [idrecibo]);
    const recibo = reciboRows[0];
    if (!recibo) return res.status(404).json({ error: 'Recibo no encontrado' });

    // 2. Traer pagos
    const [pagos] = await pool.query('SELECT * FROM pagos WHERE idrecibo = ?', [idrecibo]);

    // 3. Traer facturas asociadas
    const [facturasAsociadas] = await pool.query('SELECT * FROM facturas WHERE idrecibo = ?', [idrecibo]);
    if (!recibo.aCuenta && facturasAsociadas.length === 0)
      return res.status(400).json({ error: 'No hay facturas asociadas' });


    let codigoClienteGIA = '';
    if (recibo.aCuenta) {
      // Si es a cuenta, traemos el código desde la tabla clientes
      const [clienteRows] = await pool.query('SELECT CodigoGIA FROM clientes WHERE Id = ?', [recibo.idcliente]);
      codigoClienteGIA = clienteRows[0]?.CodigoGIA || '';
    } else {
      // Si no es a cuenta, usamos la primera factura asociada
      codigoClienteGIA = facturasAsociadas[0].CodigoClienteGia || '';
    }
    // 4. Armar el XML
    const datosXml = {
      datosEmpresa,
      fechaCFE: formatFecha(recibo.fecha),
      fechaVencimientoCFE: formatFecha(recibo.fecha),
      adendadoc: generarMensaje(recibo.importe, recibo.moneda),
      codigoClienteGIA: codigoClienteGIA,
      cancelaciones: facturasAsociadas.map(factura => ({
        rubroAfectado: '113102',
        tipoDocumentoAfectado: factura.TipoDocCFE,
        comprobanteAfectado: factura.NumeroCFE,
        vencimientoAfectado: formatFecha(factura.fechaVencimiento || factura.Fecha),
        importe: factura.TotalCobrar
      })),
      formasPago: pagos.map(pago => ({
        formaPago: recibo.formapago,
        importe: pago.importe,
        comprobante: pago.nro_pago,
        vencimiento: formatFecha(pago.vencimiento)
      })),
      Moneda: recibo.moneda,
      aCuenta: recibo.aCuenta
    };

    const xml = generarXmlRecibo(datosXml);
    console.log('Impactando Recibo, XML: ', xml);

    // 5. Enviar XML al WS
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarDocumentoFacturacion"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': datosEmpresa.serverFacturacion,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)'
    };

    try {
      const response = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xml,
        { headers }
      );

      const parsed = await parseSOAP(response.data);
      const inner = await parseInnerXML(parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
      const resultado = inner.agregarDocumentoFacturacionResultado;

      if (resultado.resultado !== "1") {
        return res.status(422).json({
          success: false,
          mensaje: 'Error en agregarDocumentoFacturacion',
          errores: [{ descripcion: resultado.descripcion, resultado: resultado.resultado }],
        });
      }

      // 🆕 Guardar datos del documento en la tabla recibos
      const datosDoc = resultado?.datos?.documento;
      if (datosDoc) {
        const { fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento } = datosDoc;

        const updateQuery = `
                UPDATE recibos
                SET fechaDocumentoCFE = ?, tipoDocumentoCFE = ?, serieDocumentoCFE = ?, numeroDocumentoCFE = ?
                WHERE idrecibo = ?
              `;

        await pool.query(updateQuery, [fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento, idrecibo]);
      }

      // ✅ Respuesta final
      return res.status(200).json({
        success: true,
        message: 'Recibo impactado y datos del WS guardados correctamente',
        resultado
      });

    } catch (error) {
      console.error('Error al enviar XML al WS:', error);
      return res.status(500).json({ error: 'Error al impactar recibo con el WS' });
    }

  } catch (err) {
    console.error('Error en /api/impactarrecibo:', err);
    return res.status(500).json({ error: 'Error general en impactar recibo', detalle: err.message });
  }
});

// Función auxiliar para formatear fecha a YYYY-MM-DD
function formatFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toISOString().split('T')[0];
}

// Función para parsear el SOAP
async function parseSOAP(xmlData) {
  const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
  return await parser.parseStringPromise(xmlData);
}

async function parseInnerXML(escapedXml) {
  const rawXml = escapedXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const parser = new xml2js.Parser({ explicitArray: false });
  return await parser.parseStringPromise(rawXml);
}


app.put('/api/actualizarFactura/:idFactura', async (req, res) => {
  const { idFactura } = req.params;
  const { idrecibo } = req.body;

  console.log(`Actualizando factura ${idFactura} con idrecibo: ${idrecibo}`);

  const updateQuery = `UPDATE facturas SET idrecibo = ? WHERE Id = ?`;

  try {
    const [result] = await pool.query(updateQuery, [idrecibo, idFactura]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró la factura para actualizar' });
    }

    res.status(200).json({ message: 'Factura actualizada con éxito' });
  } catch (err) {
    console.error('Error al actualizar la factura:', err);
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
});

app.post('/api/insertarCuentaCorriente', async (req, res) => {
  const { idcliente, fecha, tipodocumento, numerorecibo, moneda, debe, haber } = req.body;

  // Mostrar en consola todos los valores recibidos
  console.log('Datos recibidos para insertar en cuenta corriente:');
  console.log('idcliente:', idcliente);
  console.log('fecha:', fecha);
  console.log('tipodocumento:', tipodocumento);
  console.log('numerorecibo:', numerorecibo);
  console.log('moneda:', moneda);
  console.log('debe:', debe);
  console.log('haber:', haber);

  const insertQuery = `
      INSERT INTO cuenta_corriente (IdCliente, Fecha, TipoDocumento, NumeroRecibo, Moneda, Debe, Haber)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(insertQuery, [
      idcliente, fecha, tipodocumento, numerorecibo, moneda, debe, haber
    ]);

    res.status(200).json({ message: 'Recibo agregado a cuenta corriente', insertId: result.insertId });
  } catch (err) {
    console.error('Error al insertar en cuenta corriente:', err);
    res.status(500).json({ error: 'Error al insertar en cuenta corriente' });
  }
});

app.put('/api/actualizarRecibo/:idrecibo', async (req, res) => {
  const { idrecibo } = req.params;
  const {
    nrorecibo,
    fecha,
    idcliente,
    clienteGIA,
    nombrecliente,
    moneda,
    importe,
    formapago,
    razonsocial,
    rut,
    direccion,
    listadepagos
  } = req.body;


  try {
    // 🔄 Obtener conexión y comenzar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();


    // 🔸 ACTUALIZAR RECIBO
    const updateReciboQuery = `
      UPDATE recibos
      SET nrorecibo = ?, fecha = ?, idcliente = ?, nombrecliente = ?, moneda = ?, importe = ?, 
          formapago = ?, razonsocial = ?, rut = ?, direccion = ?
      WHERE idrecibo = ?
    `;
    await connection.query(updateReciboQuery, [
      nrorecibo, fecha, idcliente, nombrecliente, moneda, importe,
      formapago, razonsocial, rut, direccion, idrecibo
    ]);

    // 🔸 BORRAR PAGOS ANTERIORES
    await connection.query(`DELETE FROM pagos WHERE idrecibo = ?`, [idrecibo]);

    if (Array.isArray(listadepagos) && listadepagos.length > 0) {
      const pagosValues = listadepagos.map(pago => [
        idrecibo,
        pago.icfecha,
        pago.icbanco,
        pago.icnrocheque,
        pago.ictipoMoneda,
        pago.icimpdelcheque,
        pago.icfechavencimiento
      ]);

      const insertPagosQuery = `
        INSERT INTO pagos (idrecibo, fecha, banco, nro_pago, moneda, importe, vencimiento)
        VALUES ?
      `;
      await connection.query(insertPagosQuery, [pagosValues]);
    }

    // ✅ Commit si todo salió bien
    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Recibo actualizado correctamente', idrecibo });
  } catch (error) {
    console.error('❌ Error al actualizar recibo:', error);

    try {
      if (connection) await connection.rollback();
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError);
    }

    if (connection) connection.release();
    res.status(500).json({ error: 'Error al actualizar recibo', detalle: error.message });
  }
});

app.put('/api/actualizarCuentaCorriente/:nrorecibo', async (req, res) => {
  const { nrorecibo } = req.params;
  const { idcliente, fecha, tipodocumento, moneda, debe, haber } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE cuenta_corriente
       SET IdCliente = ?, Fecha = ?, TipoDocumento = ?, Moneda = ?, Debe = ?, Haber = ?
       WHERE NumeroRecibo = ?`,
      [idcliente, fecha, tipodocumento, moneda, debe, haber, nrorecibo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el movimiento para actualizar' });
    }

    res.status(200).json({ message: 'Cuenta corriente actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar cuenta corriente:', err);
    res.status(500).json({ error: 'Error al actualizar en cuenta corriente' });
  }
});

app.post('/api/obtenerFacturasdesdeRecibo', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron IDs de facturas válidos.' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `
    SELECT 
      *,
      DATE_FORMAT(Fecha, '%Y-%m-%d') AS FechaFormateada  -- Formatear solo la fecha
    FROM facturas
    WHERE Id IN (${placeholders})
  `;

  try {
    const [results] = await pool.query(sql, ids);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error al obtener facturas:', err);
    res.status(500).json({ error: 'Error al obtener facturas.' });
  }
});


app.post('/api/generarReciboPDF', async (req, res) => {
  try {
    const datosRecibo = req.body;
    const idrecibo = datosRecibo.idrecibo;
    const numrecibo = datosRecibo.numrecibo;
    const listadepagos = datosRecibo.listadepagos || [];
    console.log("Datos recibidos:", datosRecibo);

    const fecha = datosRecibo.erfecharecibo;
    const [year, month, day] = fecha.split('-');

    // Cargar PDF base
    const pdfBasePath = path.join(__dirname, 'pdfs', 'recibo_base.pdf');
    const pdfBytes = fs.readFileSync(pdfBasePath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const primeraPagina = pdfDoc.getPages()[0];

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Datos estáticos
    primeraPagina.drawText(`Recibo N°: ${numrecibo}`, { x: 480, y: 765, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.errut}`, { x: 275, y: 760, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${day}`, { x: 465, y: 705, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${month}`, { x: 505, y: 705, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${year}`, { x: 540, y: 705, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.errazonSocial}`, { x: 130, y: 725, size: 11, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.erdireccion}`, { x: 130, y: 705, size: 11, color: rgb(0, 0, 0) });

    // Función para dividir texto en líneas, rompiendo palabras largas si es necesario
    function dividirEnLineas(texto, maxWidth, font, fontSize) {
      const lineas = [];
      let lineaActual = '';
      for (let i = 0; i < texto.length; i++) {
        lineaActual += texto[i];
        const ancho = font.widthOfTextAtSize(lineaActual, fontSize);
        if (ancho > maxWidth) {
          lineas.push(lineaActual.slice(0, -1));
          lineaActual = texto[i];
        }
      }
      if (lineaActual) lineas.push(lineaActual);
      return lineas;
    }

    if (datosRecibo.aCuenta) {
      // Recibo a cuenta: comentario + pagos
      let yPos = 590;

      primeraPagina.drawText('Comentarios:', {
        x: 50,
        y: yPos,
        size: fontSize,
        color: rgb(0, 0, 0),
        font
      });

      let comentarioTexto = datosRecibo.comentario?.trim() || 'Sin comentarios.';
      const maxWidth = 420;

      const lineasComentario = dividirEnLineas(comentarioTexto, maxWidth, font, fontSize);

      let comentarioY = yPos - 20;
      for (const linea of lineasComentario) {
        if (comentarioY < 120) break; // evita pasarse de la página
        primeraPagina.drawText(linea, { x: 50, y: comentarioY, size: fontSize, font, color: rgb(0, 0, 0) });
        comentarioY -= 14;
      }

      // Línea separadora debajo del comentario
      primeraPagina.drawLine({
        start: { x: 50, y: comentarioY - 5 },
        end: { x: 470, y: comentarioY - 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      console.log('Lista de pagos del recibo: ', datosRecibo.listadepagos)
      // Dibujar pagos debajo del comentario
      if (Array.isArray(listadepagos) && listadepagos.length > 0) {
        let pagosYPos = comentarioY - 20;
        const espacioY = 16; // separación vertical entre filas, antes era 20
        const fontSizeHeader = 10;

        // Encabezado
        const headerX = {
          banco: 50,
          vencimiento: 120,
          nro: 200,
          moneda: 280,
          arbitraje: 360,
          importe: 430
        };

        primeraPagina.drawText('Banco', { x: headerX.banco, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
        primeraPagina.drawText('Vencimiento', { x: headerX.vencimiento, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
        primeraPagina.drawText('Nro.Documento', { x: headerX.nro, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
        primeraPagina.drawText('Moneda', { x: headerX.moneda, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
        primeraPagina.drawText('Arbitraje', { x: headerX.arbitraje, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
        primeraPagina.drawText('Importe', { x: headerX.importe, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });

        // Línea separadora debajo del header
        primeraPagina.drawLine({
          start: { x: 50, y: pagosYPos - 3 },
          end: { x: 470, y: pagosYPos - 3 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        pagosYPos -= espacioY;

        // Dibujar datos de los pagos
        for (const pago of listadepagos) {
          if (pagosYPos < 60) break; // evitar pasar del pie de página
          primeraPagina.drawText(`${pago.icbanco.toUpperCase()}`, { x: headerX.banco, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icfechavencimiento}`, { x: headerX.vencimiento, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icnrocheque}`, { x: headerX.nro, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.ictipoMoneda}`, { x: headerX.moneda, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${datosRecibo.arbitraje}`, { x: headerX.arbitraje, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icimpdelcheque}`, { x: headerX.importe, y: pagosYPos, size: fontSize, font, color: rgb(0, 0, 0) });
          pagosYPos -= espacioY;
        }

        // Total en letras
        const montoenletras = generarMensaje(datosRecibo.erimporte, datosRecibo.ertipoMoneda);
        primeraPagina.drawText(`${montoenletras}`, { x: 50, y: pagosYPos, size: 10 });
        primeraPagina.drawText(`${datosRecibo.totalrecibo}`, { x: 516, y: 42, size: 10, color: rgb(0, 0, 0) });
      }

    } else {
      // Recibo normal: facturas + pagos
      if (Array.isArray(datosRecibo.facturas)) {
        primeraPagina.drawText(`Recibo sobre Facturas Detalladas:`, { x: 50, y: 630, size: 12 });
        primeraPagina.drawText(`Documento:`, { x: 50, y: 610, size: 10 });
        primeraPagina.drawText(`Fecha:`, { x: 150, y: 610, size: 10 });
        primeraPagina.drawText(`Saldo:`, { x: 220, y: 610, size: 10 });
        primeraPagina.drawLine({ start: { x: 50, y: 600 }, end: { x: 300, y: 600 }, thickness: 1, color: rgb(0, 0, 0) });

        let facturaYPos = 590;
        for (const factura of datosRecibo.facturas) {
          // ✅ Convertir la fecha al formato YYYY-MM-DD
          let fechaFormateada = "";
          if (factura.Fecha) {
            try {
              const fechaObj = new Date(factura.Fecha);
              if (!isNaN(fechaObj)) {
                fechaFormateada = fechaObj.toISOString().split("T")[0];
              } else {
                // Si la fecha viene como string sin formato ISO (por ej: "2025-10-29 00:00:00")
                const match = factura.Fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
                fechaFormateada = match ? match[0] : factura.Fecha;
              }
            } catch (e) {
              fechaFormateada = factura.Fecha;
            }
          }

          primeraPagina.drawText(`${factura.NumeroCFE}`, {
            x: 50,
            y: facturaYPos,
            size: 10,
            color: rgb(0, 0, 0),
          });

          primeraPagina.drawText(`${fechaFormateada}`, {
            x: 150,
            y: facturaYPos,
            size: 10,
            color: rgb(0, 0, 0),
          });

          primeraPagina.drawText(`${factura.TotalCobrar}`, {
            x: 220,
            y: facturaYPos,
            size: 10,
            color: rgb(0, 0, 0),
          });

          primeraPagina.drawText(`${factura.TotalCobrar}`, {
            x: 520,
            y: facturaYPos,
            size: 10,
            color: rgb(0, 0, 0),
          });

          facturaYPos -= 20;
        }

        if (Array.isArray(listadepagos) && listadepagos.length > 0) {
          // 📍 Posición de inicio debajo de las facturas
          let pagosYPos = facturaYPos - 30;
          const espacioY = 16;
          const fontSizeHeader = 10;
          const fontSize = 10;

          // 🔹 Encabezado
          const headerX = {
            banco: 50,
            vencimiento: 120,
            nro: 200,
            moneda: 280,
            arbitraje: 360,
            importe: 430
          };

          primeraPagina.drawText('Banco', { x: headerX.banco, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText('Vencimiento', { x: headerX.vencimiento, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText('Nro.Documento', { x: headerX.nro, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText('Moneda', { x: headerX.moneda, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText('Arbitraje', { x: headerX.arbitraje, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });
          primeraPagina.drawText('Importe', { x: headerX.importe, y: pagosYPos, size: fontSizeHeader, font, color: rgb(0, 0, 0) });

          // 🔹 Línea separadora debajo del header
          primeraPagina.drawLine({
            start: { x: 50, y: pagosYPos - 3 },
            end: { x: 470, y: pagosYPos - 3 },
            thickness: 1,
            color: rgb(0, 0, 0),
          });

          pagosYPos -= espacioY;

          // 🔹 Dibujar datos de los pagos
          for (const pago of listadepagos) {
            if (pagosYPos < 60) break; // evita pasar del pie del PDF
            primeraPagina.drawText(`${pago.icbanco?.toUpperCase() || ''}`, { x: headerX.banco, y: pagosYPos, size: fontSize, font });
            primeraPagina.drawText(`${pago.icfechavencimiento || ''}`, { x: headerX.vencimiento, y: pagosYPos, size: fontSize, font });
            primeraPagina.drawText(`${pago.icnrocheque || ''}`, { x: headerX.nro, y: pagosYPos, size: fontSize, font });
            primeraPagina.drawText(`${pago.ictipoMoneda || ''}`, { x: headerX.moneda, y: pagosYPos, size: fontSize, font });
            primeraPagina.drawText(`${datosRecibo.arbitraje || ''}`, { x: headerX.arbitraje, y: pagosYPos, size: fontSize, font });
            primeraPagina.drawText(`${pago.icimpdelcheque || ''}`, { x: headerX.importe, y: pagosYPos, size: fontSize, font });
            pagosYPos -= espacioY;
          }

          // 🔹 Línea final debajo de los pagos
          primeraPagina.drawLine({
            start: { x: 50, y: pagosYPos - 4 },
            end: { x: 470, y: pagosYPos - 4 },
            thickness: 1,
            color: rgb(0, 0, 0),
          });

          pagosYPos -= 20;

          // 🔹 Total en letras
          const montoenletras = generarMensaje(datosRecibo.erimporte, datosRecibo.ertipoMoneda);
          primeraPagina.drawText(`${montoenletras}`, { x: 50, y: pagosYPos, size: 10, font });

          // 🔹 Total numérico (alineado a la derecha)
          primeraPagina.drawText(`${datosRecibo.totalrecibo}`, { x: 516, y: 42, size: 10, font, color: rgb(0, 0, 0) });
        }
      } else {
        console.error("No se encontraron facturas en los datos recibidos.", datosRecibo.facturas);
      }
    }

    // Guardar PDF y actualizar DB
    const pdfFinalBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfFinalBytes).toString('base64');
    await pool.query(`UPDATE recibos SET pdfbase64 = ? WHERE idrecibo = ?`, [pdfBase64, idrecibo]);

    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Recibo_${datosRecibo.ernumrecibo}.pdf`);
    res.send(Buffer.from(pdfFinalBytes));

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

app.post('/cotizaciones-bcu', async (req, res) => {
  const datosEmpresa = await obtenerDatosEmpresa(pool);
  const fechaActual = new Date().toISOString().split('T')[0];

  const headersCotizacion = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"procesoCargarCotizacionesBcu"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': `${datosEmpresa.serverFacturacion}`,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  const headersObtener = {
    ...headersCotizacion,
    'SOAPAction': '"obtenerCotizacion"',
  };

  const xmlCotizaciones = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
      <soapenv:Header/>
      <soapenv:Body>
        <soap:procesoCargarCotizacionesBcu>
          <xmlParametros>
          <![CDATA[
            <procesoCargarCotizacionesBcuParametros>
              <usuario>${datosEmpresa.usuarioGfe}</usuario>
              <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
              <empresa>${datosEmpresa.codigoEmpresa}</empresa>
              <parametros>
                <fecha>${fechaActual}</fecha>
              </parametros>
            </procesoCargarCotizacionesBcuParametros>
          ]]>
          </xmlParametros>
        </soap:procesoCargarCotizacionesBcu>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const xmlObtenerCotizacion = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
      <soapenv:Header/>
      <soapenv:Body>
        <soap:obtenerCotizacion>
          <xmlParametros><![CDATA[
            <obtenerCotizacionParametros>
              <usuario>${datosEmpresa.usuarioGfe}</usuario>
              <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
              <empresa>${datosEmpresa.codigoEmpresa}</empresa>
              <parametros>
                <fecha>${fechaActual}</fecha>
                <moneda>2</moneda>
                <compraVenta>1</compraVenta>
              </parametros>
            </obtenerCotizacionParametros>
          ]]></xmlParametros>
        </soap:obtenerCotizacion>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const parseSOAP = async (xmlData) => {
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    return await parser.parseStringPromise(xmlData);
  };

  const parseInnerXML = async (escapedXml) => {
    const rawXml = escapedXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParser = new xml2js.Parser({ explicitArray: false });
    return await innerParser.parseStringPromise(rawXml);
  };

  try {
    // ✅ Primera llamada: procesoCargarCotizacionesBcu
    const cotizacionesResponse = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlCotizaciones,
      { headers: headersCotizacion }
    );

    const parsedSOAP1 = await parseSOAP(cotizacionesResponse.data);
    const innerXml1 = parsedSOAP1.Envelope.Body.procesoCargarCotizacionesBcuResponse.xmlResultado;
    const innerResult1 = await parseInnerXML(innerXml1);

    console.log('✔ Cotizaciones generales:', JSON.stringify(innerResult1, null, 2));

    // ✅ Segunda llamada: obtenerCotizacion para moneda 2
    const obtenerCotizacionResponse = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlObtenerCotizacion,
      { headers: headersObtener }
    );

    const parsedSOAP2 = await parseSOAP(obtenerCotizacionResponse.data);
    const innerXml2 = parsedSOAP2.Envelope.Body.obtenerCotizacionResponse.xmlResultado;
    const innerResult2 = await parseInnerXML(innerXml2);

    console.log('💲 Cotización moneda 2:', JSON.stringify(innerResult2, null, 2));

    const cotizacionMoneda2 = innerResult2.obtenerCotizacionResultado.datos.cotizacion;

    return res.status(200).json({
      success: true,
      fecha: fechaActual,
      cotizacionesGenerales: innerResult1.procesoCargarCotizacionesBcuResultado || innerResult1,
      cotizacionMoneda2: cotizacionMoneda2,
    });

  } catch (error) {
    console.error('❌ Error en el proceso de cotizaciones:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error al enviar la solicitud de cotizaciones',
      error: error.message,
    });
  }
});
app.post('/pruebaws', async (req, res) => {
  const { xml, xmlCuentaAjena } = req.body;
  console.log('Recibido en /pruebaws:', { xmlLength: xml?.length, xmlCuentaAjenaLength: xmlCuentaAjena?.length });

  const datosEmpresa = await obtenerDatosEmpresa(pool);
  const headersAgregar = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"agregarDocumentoFacturacion"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': `${datosEmpresa.serverFacturacion}`,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  const headersObtenerPdf = {
    ...headersAgregar,
    SOAPAction: '"obtenerRepresentacionImpresaDocumentoFacturacion"',
  };

  const parseSOAP = async (xmlData) => {
    console.log('Parseando SOAP, longitud:', xmlData?.length);
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    return await parser.parseStringPromise(xmlData);
  };

  const parseInnerXML = async (escapedXml) => {
    console.log('Parseando Inner XML');
    const rawXml = escapedXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParser = new xml2js.Parser({ explicitArray: false });
    return await innerParser.parseStringPromise(rawXml);
  };

  const construirXmlObtenerPdf = ({ fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento }) => `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
      <soapenv:Header/>
      <soapenv:Body>
        <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
          <xmlParametros><![CDATA[
            <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
              <usuario>${datosEmpresa.usuarioGfe}</usuario>
              <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
              <empresa>${datosEmpresa.codigoEmpresa}</empresa>
              <documento>
                <fechaDocumento>${fechaDocumento}</fechaDocumento>
                <tipoDocumento>${tipoDocumento}</tipoDocumento>
                <serieDocumento>${serieDocumento}</serieDocumento>
                <numeroDocumento>${numeroDocumento}</numeroDocumento>
              </documento>
            </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
          ]]></xmlParametros>
        </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const resultados = [];

    // Proceso principal
    const procesarXML = async (xmlData) => {
      console.log('Procesando XML...');
      const xmlBuffer = Buffer.from(xmlData, 'utf-8');

      // 1. Enviar SOAP agregarDocumentoFacturacion
      const response = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlBuffer,
        { headers: headersAgregar }
      );
      console.log('Respuesta SOAP agregarDocumentoFacturacion recibida:', response.data);

      // 2. Parsear respuesta
      const parsed = await parseSOAP(response.data);
      console.log('Parsed SOAP:', parsed);
      const inner = await parseInnerXML(parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
      console.log('Inner XML parseado:', inner);
      const resultado = inner.agregarDocumentoFacturacionResultado;
      console.log('Resultado agregado:', resultado);

      // 3. Validar resultado
      if (resultado.resultado !== "1") {
        throw {
          success: false,
          mensaje: 'Error en agregarDocumentoFacturacion',
          errores: [{ descripcion: resultado.descripcion, resultado: resultado.resultado }],
        };
      }

      // 4. Construir XML para obtener PDF
      const xmlPdf = construirXmlObtenerPdf({
        fechaDocumento: resultado.datos.documento.fechaDocumento,
        tipoDocumento: resultado.datos.documento.tipoDocumento,
        serieDocumento: resultado.datos.documento.serieDocumento,
        numeroDocumento: resultado.datos.documento.numeroDocumento,
      });

      // 5. Pedir PDF
      const pdfResponse = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlPdf,
        { headers: headersObtenerPdf }
      );
      console.log('Respuesta SOAP obtener PDF recibida:', pdfResponse.data);

      const parsedPdf = await parseSOAP(pdfResponse.data);
      const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
      const innerPdfXml = innerPdfXmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const innerPdf = await parseInnerXML(innerPdfXml);
      console.log('Inner PDF parseado:', innerPdf);
      const pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;

      return {
        resultado: resultado.resultado,
        descripcion: resultado.descripcion,
        fechadocumento: resultado.datos.documento.fechaDocumento,
        tipodocumento: resultado.datos.documento.tipoDocumento,
        seriedocumento: resultado.datos.documento.serieDocumento,
        numerodocumento: resultado.datos.documento.numeroDocumento,
        pdfBase64,
      };
    };

    // Procesar factura principal
    const resultado1 = await procesarXML(xml);
    resultados.push(resultado1);

    // Procesar cuenta ajena solo si existe
    if (xmlCuentaAjena) {
      const resultado2 = await procesarXML(xmlCuentaAjena);
      resultados.push(resultado2);
    }
    console.log('Resultados finales a enviar:', resultados);
    return res.status(200).json({
      success: true,
      resultados,
    });

  } catch (error) {
    console.error('Error procesando SOAP:', error);
    if (error && error.errores) {
      return res.status(422).json(error);
    }
    return res.status(500).send('Error al enviar las facturas');
  }
});
async function procesarFacturaSOAP(xml, xmlCuentaAjena) {
  const datosEmpresa = await obtenerDatosEmpresa(pool);

  const headersAgregar = {
    'Content-Type': 'text/xml;charset=utf-8',
    'SOAPAction': '"agregarDocumentoFacturacion"',
    'Accept-Encoding': 'gzip,deflate',
    'Host': `${datosEmpresa.serverFacturacion}`,
    'Connection': 'Keep-Alive',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
  };

  const headersObtenerPdf = {
    ...headersAgregar,
    SOAPAction: '"obtenerRepresentacionImpresaDocumentoFacturacion"',
  };

  const parseSOAP = async (xmlData) => {
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
    return await parser.parseStringPromise(xmlData);
  };

  const parseInnerXML = async (escapedXml) => {
    const rawXml = escapedXml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerParser = new xml2js.Parser({ explicitArray: false });
    return await innerParser.parseStringPromise(rawXml);
  };

  const construirXmlObtenerPdf = ({ fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento }) => `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
      <soapenv:Header/>
      <soapenv:Body>
        <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
          <xmlParametros><![CDATA[
            <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
              <usuario>${datosEmpresa.usuarioGfe}</usuario>
              <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
              <empresa>${datosEmpresa.codigoEmpresa}</empresa>
              <documento>
                <fechaDocumento>${fechaDocumento}</fechaDocumento>
                <tipoDocumento>${tipoDocumento}</tipoDocumento>
                <serieDocumento>${serieDocumento}</serieDocumento>
                <numeroDocumento>${numeroDocumento}</numeroDocumento>
              </documento>
            </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
          ]]></xmlParametros>
        </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const procesarXML = async (xmlData) => {
    const xmlBuffer = Buffer.from(xmlData, 'utf-8');

    // 1. Enviar SOAP agregarDocumentoFacturacion
    const response = await axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlBuffer, { headers: headersAgregar });
    const parsed = await parseSOAP(response.data);
    const inner = await parseInnerXML(parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
    const resultado = inner.agregarDocumentoFacturacionResultado;

    if (resultado.resultado !== "1") {
      throw { success: false, mensaje: 'Error en agregarDocumentoFacturacion', errores: [{ descripcion: resultado.descripcion, resultado: resultado.resultado }] };
    }

    // 2. Construir XML para obtener PDF
    const xmlPdf = construirXmlObtenerPdf({
      fechaDocumento: resultado.datos.documento.fechaDocumento,
      tipoDocumento: resultado.datos.documento.tipoDocumento,
      serieDocumento: resultado.datos.documento.serieDocumento,
      numeroDocumento: resultado.datos.documento.numeroDocumento,
    });

    // 3. Pedir PDF
    const pdfResponse = await axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlPdf, { headers: headersObtenerPdf });
    const parsedPdf = await parseSOAP(pdfResponse.data);
    const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
    const innerPdf = await parseInnerXML(innerPdfXmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
    const pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;

    return {
      resultado: resultado.resultado,
      descripcion: resultado.descripcion,
      fechadocumento: resultado.datos.documento.fechaDocumento,
      tipodocumento: resultado.datos.documento.tipoDocumento,
      seriedocumento: resultado.datos.documento.serieDocumento,
      numerodocumento: resultado.datos.documento.numeroDocumento,
      pdfBase64,
    };
  };

  const resultados = [];

  // Procesar factura principal
  const resultado1 = await procesarXML(xml);
  resultados.push(resultado1);

  // Procesar cuenta ajena si existe
  if (xmlCuentaAjena) {
    const resultado2 = await procesarXML(xmlCuentaAjena);
    resultados.push(resultado2);
  }

  return resultados;
}

app.post('/api/generar-excel-cuentacorriente', async (req, res) => {
  const { desde, hasta, cliente, numeroCliente, moneda } = req.body;
  const fechaDesde = new Date(`${desde}T00:00:00`);
  const fechaHasta = new Date(`${hasta}T00:00:00`);

  try {
    const getSaldoInicial = async () => {
      const sql = `
        SELECT 
          (c.Saldo + IFNULL(SUM(cc.Debe) - SUM(cc.Haber), 0)) AS SaldoInicial
        FROM clientes c
        LEFT JOIN cuenta_corriente cc
          ON c.Id = cc.IdCliente 
          AND cc.Fecha < ? 
          AND cc.Moneda = ?
        WHERE c.Id = ?
        GROUP BY c.Saldo;
      `;
      const [rows] = await pool.query(sql, [fechaDesde, moneda, numeroCliente]);
      return rows[0]?.SaldoInicial || 0;
    };

    // 🔹 2. Obtener movimientos dentro del rango
    const getMovimientos = async () => {
      const sql = `
    SELECT 
      Fecha,
      DATE_FORMAT(Fecha, '%d/%m/%Y') AS FechaFormateada,
      TipoDocumento, NumeroDocumento, NumeroRecibo, Moneda, Debe, Haber
    FROM cuenta_corriente 
    WHERE IdCliente = ? 
      AND Fecha BETWEEN ? AND ? 
      AND Moneda = ?
    ORDER BY Fecha ASC;
  `;
      const [rows] = await pool.query(sql, [numeroCliente, fechaDesde, fechaHasta, moneda]);
      return rows;
    };


    const movimientos = await getMovimientos();
    const saldoInicial = await getSaldoInicial();
    let saldoAcumulado = parseFloat(saldoInicial || 0);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cuenta Corriente');

    // Título con fondo y estilo
    const titleRow = sheet.addRow(['Cuenta Corriente Deudores']);
    sheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);
    titleRow.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B2E59' }
    };
    titleRow.getCell(1).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    sheet.addRow([]);

    // Recuadro informativo general (con borde externo)
    const info = [
      [`Cliente: ${cliente}`],
      [`Desde: ${desde}`],
      [`Hasta: ${hasta}`],
      [`Moneda: ${moneda}`],
      [`Saldo Inicial: ${(Number(saldoInicial) || 0).toFixed(2)}`]
    ];

    const infoStartRow = sheet.lastRow.number + 1;

    info.forEach(item => {
      const row = sheet.addRow(item);
      sheet.mergeCells(`A${row.number}:H${row.number}`);
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    });

    const infoEndRow = sheet.lastRow.number;

    // Borde externo al bloque completo
    sheet.getCell(`A${infoStartRow}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' }
    };
    sheet.getCell(`H${infoStartRow}`).border = {
      top: { style: 'thin' },
      right: { style: 'thin' }
    };
    sheet.getCell(`A${infoEndRow}`).border = {
      bottom: { style: 'thin' },
      left: { style: 'thin' }
    };
    sheet.getCell(`H${infoEndRow}`).border = {
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Bordes laterales intermedios
    for (let i = infoStartRow + 1; i < infoEndRow; i++) {
      sheet.getCell(`A${i}`).border = { left: { style: 'thin' } };
      sheet.getCell(`H${i}`).border = { right: { style: 'thin' } };
    }

    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Fecha', 'Tipo Documento', 'Número Doc.', 'Número Rec.',
      'Moneda', 'Debe', 'Haber', 'Saldo'
    ]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B2E59' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Movimientos
    movimientos.forEach(mov => {
      sheet.addRow([
        mov.Fecha,
        mov.TipoDocumento === 'TCD'
          ? 'Eticket'
          : mov.TipoDocumento === 'TCA'
            ? 'Eticket Cuenta Ajena'
            : (mov.TipoDocumento || '-'),
        !isNaN(parseFloat(mov.NumeroDocumento)) ? parseFloat(mov.NumeroDocumento) : '-',
        mov.NumeroRecibo,
        mov.Moneda,
        parseFloat(mov.Debe || 0),
        parseFloat(mov.Haber || 0),
        saldoAcumulado += parseFloat(mov.Debe || 0) - parseFloat(mov.Haber || 0)
      ]);
      const currentRow = sheet.lastRow;
      currentRow.getCell(3).alignment = { horizontal: 'center' }
      currentRow.getCell(5).alignment = { horizontal: 'center' }
      currentRow.getCell(6).alignment = { horizontal: 'center' }
      currentRow.getCell(7).alignment = { horizontal: 'center' }
    });

    // Ancho de columnas
    sheet.columns = [
      { width: 12 }, // Fecha
      { width: 20 }, // Tipo Documento
      { width: 12 }, // Número Documento
      { width: 12 }, // Número Recibo
      { width: 12 }, // Moneda
      { width: 12 }, // Debe
      { width: 12 }, // Haber
      { width: 12 }, // Saldo
    ];

    // Descargar
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=cuenta_corriente.xlsx'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar Excel:', error);
    res.status(500).send('Error al generar Excel');
  }
});

app.post('/api/generar-pdf-cuentacorriente', async (req, res) => {
  const { desde, hasta, cliente, numeroCliente, moneda } = req.body;
  console.log('Datos recibidos del frontend - Cuenta Corriente:', req.body);
  const fechaDesde = new Date(`${desde}T00:00:00`);
  const fechaHasta = new Date(`${hasta}T00:00:00`);

  const sql = `
  SELECT 
    IdMovimiento, 
    IdCliente, 
    IdFactura, 
    DATE_FORMAT(Fecha, '%d/%m/%Y') AS FechaFormateada, 
    TipoDocumento, 
    NumeroDocumento, 
    NumeroRecibo, 
    Moneda, 
    Debe, 
    Haber
  FROM cuenta_corriente 
  WHERE IdCliente = ? 
    AND Fecha BETWEEN ? AND ? 
    AND Moneda = ?
  ORDER BY Fecha ASC;
`;

  // 🔹 2. Saldo inicial (todo lo anterior a la fecha desde)
  const sqlSaldoInicial = `
  SELECT 
    IFNULL(cli.Saldo, 0) + IFNULL(SUM(cc.Debe) - SUM(cc.Haber), 0) AS Saldo
  FROM clientes cli
  LEFT JOIN cuenta_corriente cc 
    ON cli.Id = cc.IdCliente
    AND cc.Fecha < ?
    AND cc.Moneda = ?
  WHERE cli.Id = ?;
`;

  // 🔹 3. Saldo final (todo hasta la fecha hasta inclusive)
  const sqlSaldoFinal = `
  SELECT 
    IFNULL(cli.Saldo, 0) + IFNULL(SUM(cc.Debe) - SUM(cc.Haber), 0) AS Saldo
  FROM clientes cli
  LEFT JOIN cuenta_corriente cc 
    ON cli.Id = cc.IdCliente
    AND cc.Fecha <= ?
    AND cc.Moneda = ?
  WHERE cli.Id = ?;
`;
  try {
    const [resultMovimientos] = await pool.query(sql, [numeroCliente, fechaDesde, fechaHasta, moneda]);
    console.log('Resultado de movimientos', resultMovimientos);


    const [resultSaldoInicialRows] = await pool.query(sqlSaldoInicial, [fechaDesde, moneda, numeroCliente]);
    const [resultSaldoFinalRows] = await pool.query(sqlSaldoFinal, [fechaHasta, moneda, numeroCliente]);


    const saldoInicial = resultSaldoInicialRows[0]?.Saldo || 0;
    console.log('Saldo inicial', saldoInicial);
    const saldoFinal = resultSaldoFinalRows[0]?.Saldo || 0;

    // Lógica para generar el PDF con pdf-lib
    const pdfDoc = await PDFDocument.create(); // Crear el documento PDF
    let page = pdfDoc.addPage([600, 800]); // Tamaño de página

    // Posiciones para los textos en la tabla
    const xPos = 430;
    let yPos = 765;
    const rowHeight = 14;
    const colWidth1 = 60; // ancho de la columna de etiquetas
    const colWidth2 = 80; // ancho de la columna de valores
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Dibujar las líneas verticales de la tabla
    page.drawLine({ start: { x: xPos, y: yPos + 5 }, end: { x: xPos, y: yPos - (rowHeight * 4) + 5 }, thickness: 1 });
    page.drawLine({ start: { x: xPos + colWidth1, y: yPos + 5 }, end: { x: xPos + colWidth1, y: yPos - (rowHeight * 4) + 5 }, thickness: 1 });
    page.drawLine({ start: { x: xPos + colWidth1 + colWidth2, y: yPos + 5 }, end: { x: xPos + colWidth1 + colWidth2, y: yPos - (rowHeight * 4) + 5 }, thickness: 1 });

    // Dibujar las líneas horizontales (superior, entre filas y base)
    for (let i = 0; i <= 4; i++) {
      page.drawLine({
        start: { x: xPos, y: yPos - (rowHeight * i) + 5 },
        end: { x: xPos + colWidth1 + colWidth2, y: yPos - (rowHeight * i) + 5 },
        thickness: 1,
      });
    }

    // Ahora dibujamos los textos dentro de la tabla
    let textYPos = yPos - 6; // Centramos el texto verticalmente

    page.drawText('Emisión:', { x: xPos + 5, y: textYPos, size: 10 });
    page.drawText(new Date().toLocaleDateString(), { x: xPos + colWidth1 + 5, y: textYPos, size: 10 });

    textYPos -= rowHeight;
    page.drawText('Desde:', { x: xPos + 5, y: textYPos, size: 10 });
    page.drawText(fechaDesde.toLocaleDateString(), { x: xPos + colWidth1 + 5, y: textYPos, size: 10 });

    textYPos -= rowHeight;
    page.drawText('Hasta:', { x: xPos + 5, y: textYPos, size: 10 });
    page.drawText(fechaHasta.toLocaleDateString(), { x: xPos + colWidth1 + 5, y: textYPos, size: 10 });

    textYPos -= rowHeight;
    page.drawText('Moneda:', { x: xPos + 5, y: textYPos, size: 10 });
    page.drawText(moneda, { x: xPos + colWidth1 + 5, y: textYPos, size: 10 });

    // Titulo Cuenta Corriente
    page.drawText('Cuenta Corriente Deudores', { x: 190, y: 720, size: 16, font: helveticaBoldFont });

    // Información del cliente
    const boxY = 650;
    const boxHeight = 25;
    const startX = 45;

    // Definir anchos individuales
    const boxWidth1 = 60;    // "Cliente" (solo etiqueta)
    const boxWidth2 = 65;    // Número cliente (5 cifras)
    const boxWidth3 = 200;   // Nombre largo
    const boxWidth4 = 140;   // Saldo Inicial separado
    const lightGray = rgb(0.9, 0.9, 0.9); // Gris claro

    // Dibujar los primeros 3 recuadros seguidos
    page.drawRectangle({
      x: startX,
      y: boxY,
      width: boxWidth1,
      height: boxHeight,
      color: lightGray,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawRectangle({
      x: startX + boxWidth1,
      y: boxY,
      width: boxWidth2,
      height: boxHeight,
      color: lightGray,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    page.drawRectangle({
      x: startX + boxWidth1 + boxWidth2,
      y: boxY,
      width: boxWidth3,
      height: boxHeight,
      color: lightGray,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // El cuarto recuadro separado hacia la derecha
    const saldoBoxX = startX + boxWidth1 + boxWidth2 + boxWidth3 + 60; // separás 50px más
    page.drawRectangle({
      x: saldoBoxX,
      y: boxY,
      width: boxWidth4,
      height: boxHeight,
      color: lightGray,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Insertar textos
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Primer recuadro
    page.drawText('Cliente', { x: startX + 5, y: boxY + boxHeight - 15, size: 10, font: helveticaFont });

    // Segundo recuadro (número cliente)
    page.drawText(numeroCliente.toString(), { x: startX + boxWidth1 + 20, y: boxY + 10, size: 10, font: helveticaFont });

    // Tercer recuadro (nombre largo)
    page.drawText(cliente, { x: startX + boxWidth1 + boxWidth2 + 5, y: boxY + 10, size: 10, font: helveticaFont });

    // Calcular las posiciones de cada texto en el eje X
    const saldoLabel = 'Saldo Inicial:';
    const saldoValue = (Number(saldoInicial) || 0).toFixed(2);

    // Ajusta el espacio entre ambos textos en el eje X
    const saldoLabelX = saldoBoxX + 5;  // Un pequeño margen a la izquierda
    const saldoValueX = saldoLabelX + helveticaBoldFont.widthOfTextAtSize(saldoLabel, 9) + 10; // Añadir espacio entre el label y el valor

    // Dibuja el texto "Saldo Inicial:"
    page.drawText(saldoLabel, {
      x: saldoLabelX,
      y: boxY + boxHeight - 15,  // Ajuste vertical para que esté arriba en el recuadro
      size: 9,
      font: helveticaBoldFont
    });

    // Dibuja el valor "Saldo Inicial:"
    page.drawText(saldoValue, {
      x: saldoValueX,  // Estará al lado del texto "Saldo Inicial:"
      y: boxY + boxHeight - 15,  // Alineado verticalmente
      size: 10,
      font: helveticaBoldFont
    });


    //Linea para separar headers 
    // Definir la posición para la línea
    const lineY = boxY - 10;  // Ajusta la posición para que esté justo debajo de los recuadros
    const lineThickness = 2;  // Grosor de la línea
    page.drawLine({
      start: { x: startX, y: lineY },  // Comienza desde el inicio de los recuadros
      end: { x: 570, y: lineY },  // Termina al final de la última caja
      thickness: lineThickness,
      color: rgb(0, 0, 0),  // Color negro
    });

    //Headers
    // Definir las posiciones de los encabezados
    const tableStartY = boxY - 40;  // Ajusta la posición vertical para que los encabezados estén debajo de los recuadros
    const headerHeight = 20;  // Altura de los encabezados de la tabla
    const headerFontSize = 9;  // Tamaño de la fuente para los encabezados

    // Definir los títulos de los encabezados
    const headers = ['Fecha', 'Tipo', 'Documento', 'Recibo', 'Moneda', 'Debe', 'Haber', 'Saldo'];

    // Anchos de las columnas
    const columnWidths = [60, 80, 60, 80, 45, 60, 60, 80];  // Ajusta el ancho de cada columna según tus necesidades

    // Posición inicial de la tabla
    let currentX = startX;  // Inicia en la misma X que los recuadros anteriores
    let currentY = tableStartY - headerHeight - 10;

    // Dibujar el fondo gris claro para los encabezados de la tabla
    page.drawRectangle({
      x: currentX,
      y: tableStartY,
      width: columnWidths.reduce((a, b) => a + b, 0),  // Sumar el ancho total de las columnas
      height: headerHeight,
      color: lightGray,  // Gris claro
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Dibujar los títulos de la tabla
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: currentX + 5,  // Un pequeño margen desde el borde izquierdo
        y: tableStartY + 5,  // Alineado verticalmente en el centro del encabezado
        size: headerFontSize,
        font: helveticaFont,
      });

      // Ajustar la posición X para el siguiente encabezado
      currentX += columnWidths[index];
    });


    function drawTable(resultMovimientos) {
      let saldoAcumulado = parseFloat(saldoInicial);  // Inicializar el saldo acumulado
      // Definir un umbral para cuando cambiar de página
      const pageHeight = 800;  // Altura de la página
      const rowHeight = 20;    // Altura de cada fila
      const marginBottom = 50; // Espacio de margen en la parte inferior
      let currentPage = page;

      function drawHeaders(page) {
        let currentX = startX;

        // Dibujar el fondo gris claro para los encabezados de la tabla
        page.drawRectangle({
          x: currentX,
          y: tableStartY + 170,
          width: columnWidths.reduce((a, b) => a + b, 0),  // Sumar el ancho total de las columnas
          height: headerHeight,
          color: lightGray,  // Gris claro
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Dibujar los títulos de la tabla
        headers.forEach((header, index) => {
          page.drawText(header, {
            x: currentX + 5,  // Un pequeño margen desde el borde izquierdo
            y: tableStartY + 175,  // Alineado verticalmente en el centro del encabezado
            size: headerFontSize,
            font: helveticaFont,
          });
          // Dibujar la línea de separación entre las columnas
          if (index < headers.length - 1) {
            page.drawLine({
              start: { x: currentX + columnWidths[index], y: tableStartY + 170 },
              end: { x: currentX + columnWidths[index], y: tableStartY + 170 + headerHeight },
              color: rgb(0, 0, 0),
              thickness: 1,
            });
          }

          // Ajustar la posición X para el siguiente encabezado
          currentX += columnWidths[index];
        });
      }


      // Dibujar cada fila de datos en la tabla
      resultMovimientos.forEach((movimiento) => {

        if (currentY < marginBottom) {
          // Crear una nueva página
          currentPage = pdfDoc.addPage();  // Suponiendo que `doc` es tu documento PDF
          drawHeaders(currentPage);
          currentY = pageHeight - marginBottom;  // Resetear la posición Y al inicio de la página
        }
        // Dibujar la fila de la tabla
        currentPage.drawRectangle({
          x: startX,
          y: currentY,
          width: columnWidths.reduce((a, b) => a + b, 0),  // Sumar los anchos de las columnas
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // Insertar los valores en cada columna de la fila
        currentPage.drawText(movimiento.FechaFormateada, { x: startX + 5, y: currentY + 5, size: 8, font: helveticaFont });
        currentPage.drawText(movimiento.TipoDocumento === 'TCD'
          ? 'Eticket'
          : movimiento.TipoDocumento === 'TCA'
            ? 'Eticket Cuenta Ajena'
            : (movimiento.TipoDocumento || '-'), { x: startX + columnWidths[0] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Comprobar si 'NumeroDocumento' no es null antes de dibujar
        if (movimiento.NumeroDocumento) {
          currentPage.drawText(movimiento.NumeroDocumento, { x: startX + columnWidths[0] + columnWidths[1] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        } else {
          currentPage.drawText('      -', { x: startX + columnWidths[0] + columnWidths[1] + 2, y: currentY + 5, size: 8, font: helveticaFont });
        }

        // Comprobar si 'NumeroRecibo' no es null antes de dibujar
        if (movimiento.NumeroRecibo) {
          currentPage.drawText(movimiento.NumeroRecibo, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        } else {
          currentPage.drawText('-', { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        }

        currentPage.drawText(movimiento.Moneda, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Comprobar si 'Debe' y 'Haber' son números válidos antes de dibujar
        const debeValue = (movimiento.Debe != null)
          ? Number(movimiento.Debe).toFixed(2)
          : '0.00';

        const haberValue = (movimiento.Haber != null)
          ? Number(movimiento.Haber).toFixed(2)
          : '0.00';

        // Dibujar los valores de "Debe" y "Haber"
        currentPage.drawText(debeValue, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        currentPage.drawText(haberValue, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Calcular saldo acumulado
        saldoAcumulado += (movimiento.Debe || 0) - (movimiento.Haber || 0);  // Ajuste según la lógica de saldo

        // Mostrar el saldo acumulado en la última columna
        currentPage.drawText(saldoAcumulado.toFixed(2), { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5] + columnWidths[6] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Ajustar la posición Y para la siguiente fila
        currentY -= 20;  // Espacio para la siguiente fila
      });
    }

    // Llamar a la función para dibujar la tabla con los datos
    drawTable(resultMovimientos);




    // Guardar el PDF
    const pdfFinalBytes = await pdfDoc.save();

    // Setear cabeceras para descarga del PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="CuentaCorriente"', // Asegúrate de que el nombre esté entre comillas dobles
    });

    res.send(Buffer.from(pdfFinalBytes)); // Envía el PDF generado
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});


app.get('/api/obtenerguiasimpopendientes', async (req, res) => {
  const { cliente, desde, hasta, tipoPago, aerolinea } = req.query;

  try {
    let query = `
      SELECT g.*, v.vuelo AS vuelo
      FROM guiasimpo g
      LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
      WHERE g.emision >= ?
      AND g.emision <= ?
      AND g.facturada = 0
    `;

    const params = [desde, hasta];

    // ✔️ Agregar filtro por cliente SOLO si viene con valor
    if (cliente && cliente.trim() !== "") {
      query += ` AND g.consignatario = ?`;
      params.push(cliente);
    }

    // ✔️ Filtro por tipo de pago
    if (tipoPago && tipoPago !== 'Cualquiera') {
      query += ` AND g.tipodepagoguia = ?`;
      params.push(tipoPago);
    }

    // ✔️ Filtro por aerolínea
    if (aerolinea && aerolinea !== 'Cualquiera' && aerolinea !== 'ALL') {
      query += ` AND v.compania = ?`;
      params.push(aerolinea);
    }

    query += ` ORDER BY g.emision ASC`;

    const [results] = await pool.query(query, params);
    res.status(200).json(results);

  } catch (error) {
    console.error('Error al obtener guías impo:', error);
    res.status(500).json({ error: 'Error al obtener guías impo' });
  }
});

app.get('/api/obtenerguiasexpopendientes', async (req, res) => {
  const { cliente, desde, hasta, tipoPago, aerolinea } = req.query;

  try {
    let query = `
      SELECT g.*, v.vuelo AS vuelo
      FROM guiasexpo g
      LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
      WHERE g.emision >= ?
      AND g.emision <= ?
      AND g.facturada = 0
      AND g.cass = 'N'
    `;

    const params = [desde, hasta];

    // ✔️ Filtrar por cliente SOLO si viene con valor
    if (cliente && cliente.trim() !== "") {
      query += ` AND g.agente = ?`;
      params.push(cliente);
    }

    // ✔️ Filtro por tipo de pago
    if (tipoPago && tipoPago !== 'Cualquiera') {
      query += ` AND g.tipodepago = ?`;
      params.push(tipoPago);
    }

    // ✔️ Filtro por aerolínea
    if (aerolinea && aerolinea !== 'Cualquiera' && aerolinea !== 'ALL') {
      query += ` AND v.compania = ?`;
      params.push(aerolinea);
    }

    query += ` ORDER BY g.emision ASC`;

    const [results] = await pool.query(query, params);
    res.status(200).json(results);

  } catch (error) {
    console.error('Error al obtener guías expo:', error);
    res.status(500).json({ error: 'Error al obtener guías expo' });
  }
});

app.get('/api/obtenerModificarFactura', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el parámetro "id"' });
  }

  try {
    // Buscar la factura
    const [facturaResults] = await pool.query('SELECT * FROM facturas WHERE Id = ?', [id]);

    if (facturaResults.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Buscar los detalles
    const [detalleResults] = await pool.query(
      'SELECT * FROM detalle_facturas_manuales WHERE IdFactura = ?',
      [id]
    );

    // Respuesta final
    res.status(200).json({
      factura: facturaResults[0],
      detalles: detalleResults,
    });
  } catch (error) {
    console.error('Error al obtener la factura o sus detalles:', error);
    res.status(500).json({ error: 'Error al obtener la factura o sus detalles' });
  }
});

//Endpoint para traer todo el redibo y poder modificarlo
app.get('/api/obtenerModificarRecibo', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el parámetro "id"' });
  }

  try {
    // 1️⃣ Buscar el recibo
    const [reciboResults] = await pool.query('SELECT * FROM recibos WHERE idrecibo = ?', [id]);

    if (reciboResults.length === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }

    const recibo = reciboResults[0];
    const idCliente = recibo.idcliente;

    // 2️⃣ Buscar los pagos asociados
    const [pagosResults] = await pool.query('SELECT * FROM pagos WHERE idrecibo = ?', [id]);

    // 3️⃣ Buscar datos del cliente
    const [clienteResults] = await pool.query('SELECT * FROM clientes WHERE Id = ?', [idCliente]);
    const cliente = clienteResults[0] || null;

    // 4️⃣ Buscar facturas asociadas
    const [facturasAsociadasResults] = await pool.query('SELECT * FROM facturas WHERE idrecibo = ?', [id]);

    // 5️⃣ Buscar movimientos de cuenta corriente del cliente
    const sqlMovimientos = `
            SELECT 
              IdMovimiento, 
              IdCliente, 
              IdFactura, 
              DATE_FORMAT(Fecha, '%d/%m/%Y') AS Fecha, 
              TipoDocumento, 
              NumeroDocumento, 
              NumeroRecibo, 
              Moneda, 
              Debe, 
              Haber
            FROM cuenta_corriente
            WHERE IdCliente = ?
              AND Fecha <= CURDATE()
            ORDER BY Fecha DESC
          `;

    const [movimientosResults] = await pool.query(sqlMovimientos, [idCliente]);

    // 6️⃣ Respuesta final
    res.status(200).json({
      recibo,
      pagos: pagosResults,
      cliente,
      facturasAsociadas: facturasAsociadasResults,
      movimientos: movimientosResults
    });

  } catch (error) {
    console.error('Error al obtener los datos del recibo:', error);
    res.status(500).json({ error: 'Error al obtener los datos del recibo' });
  }
});
// Obtener NC + documentos afectados
app.get('/api/obtenerModificarNC', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el parámetro "id"' });
  }


  try {
    // 1️⃣ Buscar la NC
    const [ncResults] = await pool.query('SELECT * FROM nc WHERE idNC = ?', [id]);

    if (ncResults.length === 0) {
      return res.status(404).json({ error: 'Nota de crédito no encontrada' });
    }

    const nc = ncResults[0];

    // 2️⃣ Traer los datos del cliente
    const [clienteResults] = await pool.query('SELECT * FROM clientes WHERE Id = ?', [nc.idCliente]);
    const cliente = clienteResults.length > 0 ? clienteResults[0] : null;

    // 3️⃣ Procesar DocsAfectados (Ids de facturas)
    let docsAfectados = [];
    if (nc.DocsAfectados) {
      docsAfectados = nc.DocsAfectados
        .split(',')
        .map(d => d.trim())
        .filter(d => d !== '')
        .map(Number);
    }

    let facturasConFecha = [];

    if (docsAfectados.length > 0) {
      const [facturasResults] = await pool.query(
        `SELECT * FROM facturas WHERE Id IN (?)`,
        [docsAfectados]
      );

      facturasConFecha = facturasResults.map(f => {
        let fechaFormateada = null;
        if (f.Fecha) {
          const fechaObj = new Date(f.Fecha);
          const dia = String(fechaObj.getDate()).padStart(2, '0');
          const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const anio = fechaObj.getFullYear();
          fechaFormateada = `${dia}/${mes}/${anio}`;
        }
        return { ...f, FechaFormateada: fechaFormateada };
      });
    }

    // 4️⃣ Respuesta final
    res.status(200).json({
      nc,
      cliente,
      facturasAfectadas: facturasConFecha
    });

  } catch (error) {
    console.error('Error al obtener la NC:', error);
    res.status(500).json({ error: 'Error al obtener la NC' });
  }
});

app.put('/api/modificarFacturaManual', async (req, res) => {
  const {
    Id,
    IdCliente,
    Nombre,
    codigoClienteGIA,
    RazonSocial,
    DireccionFiscal,
    Ciudad,
    Pais,
    RutCedula,
    ComprobanteElectronico,
    Comprobante,
    Electronico,
    Moneda,
    Fecha,
    fechaVencimiento,
    TipoIVA,
    CASS,
    TipoEmbarque,
    TC,
    Subtotal,
    IVA,
    Redondeo,
    Total,
    TotalCobrar,
    DetalleFactura,
  } = req.body;

  const updateFacturaQuery = `
    UPDATE facturas SET 
      IdCliente = ?, Nombre = ?, CodigoClienteGia = ?, RazonSocial = ?, DireccionFiscal = ?, 
      Ciudad = ?, Pais = ?, RutCedula = ?, ComprobanteElectronico = ?, Comprobante = ?, 
      Electronico = ?, Moneda = ?, Fecha = ?, TipoIVA = ?, CASS = ?, TipoEmbarque = ?, 
      TC = ?, Subtotal = ?, IVA = ?, Redondeo = ?, Total = ?, TotalCobrar = ?, fechaVencimiento = ?
    WHERE Id = ?
  `;

  const params = [
    IdCliente, Nombre, codigoClienteGIA, RazonSocial, DireccionFiscal,
    Ciudad, Pais, RutCedula, ComprobanteElectronico, Comprobante,
    Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque,
    TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, fechaVencimiento,
    Id
  ];
  try {
    // 1️⃣ Actualizar factura
    await pool.query(updateFacturaQuery, params);


    // 2️⃣ Eliminar detalles anteriores
    await pool.query('DELETE FROM detalle_facturas_manuales WHERE IdFactura = ?', [Id]);


    // 3️⃣ Insertar nuevos detalles si existen
    if (DetalleFactura && DetalleFactura.length > 0) {
      const insertQuery = `
        INSERT INTO detalle_facturas_manuales 
        (IdFactura, Codigo, Descripcion, Moneda, IVA, Importe, impuesto, codigoGIA)
        VALUES ?
      `;

      const values = DetalleFactura.map(d => [
        Id,
        d.codigo,
        d.descripcion,
        d.moneda,
        parseFloat(d.ivaCalculado || 0),
        parseFloat(d.importe || 0),
        d.impuesto,
        d.codigoGIA
      ]);



      await pool.query(insertQuery, [values]);
    }

    res.status(200).json({ success: true, message: 'Factura y detalles actualizados correctamente' });

  } catch (error) {
    console.error('Error al modificar la factura:', error);
    res.status(500).json({ error: 'Error al modificar la factura' });
  }
});


app.get('/api/obtenerguiasimporeporte', async (req, res) => {
  const { cliente, desde, hasta, tipoPago, aerolinea } = req.query;

  console.log("Generando reporte impo:", cliente, desde, hasta, tipoPago);
  try {
    let query = `
    SELECT 
  g.*, 
  v.vuelo AS vuelo
FROM guiasimpo g
LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
WHERE g.emision >= ? AND g.emision <= ?
  `;

    const params = [desde, hasta];

    if (cliente && cliente.trim() !== '') {
      query += ` AND g.consignatario LIKE ?`;
      params.push(`%${cliente}%`);
    }

    if (tipoPago && tipoPago !== 'ALL' && tipoPago !== 'Cualquiera') {
      query += ` AND g.tipodepagoguia = ?`;
      params.push(tipoPago);
    }
    if (aerolinea && aerolinea !== 'ALL') {
      query += ` AND v.compania = ?`;
      params.push(aerolinea);
    }


    query += ` ORDER BY g.emision ASC`;

    console.log('QUERY REPORTE IMPO: ', query, params);
    const [results] = await pool.query(query, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener guías impo:', error);
    res.status(500).json({ error: 'Error al obtener guías impo' });
  }
});

app.get('/api/facturas-sin-cobrar', async (req, res) => {
  console.log('Received request for /api/facturas-sin-cobrar');

  const sqlList = `
    SELECT 
      Id, 
      Comprobante AS numero, 
      RazonSocial AS cliente, 
      DATE_FORMAT(Fecha, '%d/%m/%Y') AS fecha, 
      TotalCobrar AS monto
    FROM facturas
    WHERE idrecibo IS NULL
    ORDER BY Fecha DESC
  `;

  const sqlTotal = `
    SELECT SUM(TotalCobrar) AS totalSinCobrar
    FROM facturas
    WHERE idrecibo IS NULL
  `;

  try {
    const [facturas] = await pool.query(sqlList);
    const [totalResult] = await pool.query(sqlTotal);

    const totalSinCobrar = totalResult[0]?.totalSinCobrar || 0;

    res.status(200).json({ facturas, totalSinCobrar });
  } catch (error) {
    console.error('Error al obtener facturas sin cobrar:', error);
    res.status(500).json({ message: 'Ocurrió un error al obtener las facturas sin cobrar.' });
  }
});

app.get('/api/guias-sin-facturar', async (req, res) => {
  console.log('Received request for /api/guias-sin-facturar');

  const sql = `
    SELECT 
      guia AS numero, 
      consignatario AS cliente, 
      DATE_FORMAT(emision, '%d/%m/%Y') AS fecha,
      'Impo' AS tipo,
      total
    FROM guiasimpo
    WHERE facturada = 0

    UNION ALL

    SELECT 
      guia AS numero, 
      agente AS cliente, 
      DATE_FORMAT(emision, '%d/%m/%Y') AS fecha,
      'Expo' AS tipo,
      total
    FROM guiasexpo
    WHERE facturada = 0

    ORDER BY fecha DESC
  `;

  const totalSql = `
    SELECT 
      (SELECT IFNULL(SUM(total), 0) FROM guiasimpo WHERE facturada = 0) +
      (SELECT IFNULL(SUM(total), 0) FROM guiasexpo WHERE facturada = 0) AS total_sin_facturar
  `;

  try {
    const [guias] = await pool.query(sql);
    const [totalResult] = await pool.query(totalSql);

    res.status(200).json({
      guias,
      total_sin_facturar: totalResult[0]?.total_sin_facturar || 0
    });
  } catch (error) {
    console.error('Error al obtener guías sin facturar:', error);
    res.status(500).json({ message: 'Error al obtener las guías sin facturar.' });
  }
});

app.post('/api/impactardocumento', async (req, res) => {
  const factura = req.body;
  const idFactura = factura.factura.Id;
  const esManual = factura.factura.esManual;
  console.log('Impactando Documento en el back Factura: ', factura, ' idFactura: ', idFactura);
  try {
    const datosEmpresa = await obtenerDatosEmpresa(pool);
    const tablaDetalles = esManual === 1 ? 'detalle_facturas_manuales' : 'detalle_facturas';

    // Obtener detalles de la factura
    const [resultados] = await pool.query(
      `SELECT * FROM ${tablaDetalles} WHERE IdFactura = ?`,
      [idFactura]
    );

    let adenda = generarAdenda(factura.factura.Id, factura.factura.Total, factura.factura.Moneda);

    // Preparar detalles de la factura
    const detallesFactura = resultados.map((concepto) => {
      const importe = Number(concepto.Importe) || 0;
      const importeFormateado = parseFloat(importe.toFixed(2));
      const codItem = esManual === 1
        ? concepto.codigoGIA?.toString() || 'SIN_CODIGO'
        : concepto.Id_concepto?.toString() || 'SIN_CODIGO';
      return {
        codItem: codItem,
        indicadorFacturacion: importeFormateado === 0 ? "5" : "1",
        nombreItem: concepto.Descripcion,
        cantidad: "1",
        unidadMedida: "UN",
        precioUnitario: importeFormateado.toFixed(2),
      };
    });

    // Convertir fecha DD/MM/YYYY a YYYY-MM-DD
    function convertirFechaAISO(fechaStr) {
      console.log('Convirtiendo esta fecha', fechaStr)
      const [dia, mes, anio] = fechaStr.split('/');
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    const datos = {
      fechaCFE: convertirFechaAISO(factura.factura.Fecha),
      fechaVencimientoCFE: convertirFechaAISO(factura.factura.fechaVencimiento),
      Moneda: factura.factura.Moneda,
      detalleFactura: detallesFactura,
      adendadoc: adenda,
      datosEmpresa: datosEmpresa,
      codigoClienteGIA: factura.factura.CodigoClienteGia,
      tipoComprobante: factura.factura.ComprobanteElectronico
    };

    const xml = generarXmlimpactarDocumento(datos);
    const xmlBuffer = Buffer.from(xml, 'utf-8');

    // Headers SOAP
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarDocumentoFacturacion"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': datosEmpresa.serverFacturacion,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',
    };

    const headersObtenerPdf = {
      ...headers,
      SOAPAction: '"obtenerRepresentacionImpresaDocumentoFacturacion"',
    };

    // Helpers para parsear XML SOAP
    const parseSOAP = async (xmlData) => {
      const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] });
      return await parser.parseStringPromise(xmlData);
    };

    const parseInnerXML = async (escapedXml) => {
      const rawXml = escapedXml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      const innerParser = new xml2js.Parser({ explicitArray: false });
      return await innerParser.parseStringPromise(rawXml);
    };

    // Construir XML para obtener PDF
    const construirXmlObtenerPdf = ({ fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento }) => `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
          <soapenv:Header/>
          <soapenv:Body>
            <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
              <xmlParametros><![CDATA[
                <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
                  <usuario>${datosEmpresa.usuarioGfe}</usuario>
                  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                  <documento>
                    <fechaDocumento>${fechaDocumento}</fechaDocumento>
                    <tipoDocumento>${tipoDocumento}</tipoDocumento>
                    <serieDocumento>${serieDocumento}</serieDocumento>
                    <numeroDocumento>${numeroDocumento}</numeroDocumento>
                  </documento>
                </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
              ]]></xmlParametros>
            </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

    // Paso 1: Impactar documento
    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlBuffer,
      { headers }
    );

    const parsed = await parseSOAP(response.data);
    const innerXml = parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado;
    const result = await parseInnerXML(innerXml);
    const resultado = result.agregarDocumentoFacturacionResultado;

    if (resultado.resultado !== "1") {
      return res.status(422).json({
        success: false,
        message: 'Error al impactar el documento',
        descripcion: resultado.descripcion,
      });
    }

    const datosDoc = resultado.datos.documento;

    // Paso 2: Obtener PDF
    const xmlPdf = construirXmlObtenerPdf({
      fechaDocumento: datosDoc.fechaDocumento,
      tipoDocumento: datosDoc.tipoDocumento,
      serieDocumento: datosDoc.serieDocumento,
      numeroDocumento: datosDoc.numeroDocumento,
    });

    const pdfResponse = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xmlPdf,
      { headers: headersObtenerPdf }
    );

    const parsedPdf = await parseSOAP(pdfResponse.data);
    const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
    const innerPdf = await parseInnerXML(innerPdfXmlEscaped);

    const pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado?.datos?.pdfBase64 || null;

    // Actualizar factura en DB usando pool
    await pool.query(
      `
      UPDATE facturas SET 
        FechaCFE = ?, 
        TipoDocCFE = ?, 
        SerieCFE = ?, 
        NumeroCFE = ?, 
        PdfBase64 = ?
      WHERE Id = ?
      `,
      [datosDoc.fechaDocumento, datosDoc.tipoDocumento, datosDoc.serieDocumento, datosDoc.numeroDocumento, pdfBase64, idFactura]
    );


    return res.status(200).json({
      success: true,
      message: `Factura ${idFactura} impactada y guardada correctamente`,
      documento: {
        fecha: datosDoc.fechaDocumento,
        tipo: datosDoc.tipoDocumento,
        serie: datosDoc.serieDocumento,
        numero: datosDoc.numeroDocumento,
        pdfBase64: pdfBase64
      }
    });

  } catch (error) {
    console.error('❌ Error en impactar documento:', error);
    return res.status(500).json({ success: false, message: 'Error interno al impactar documento o actualizar base de datos' });
  }
});


app.post('/api/actualizarcorrelatividad', async (req, res) => {
  const { campo, valor } = req.body;

  const camposPermitidos = ['ultimoFormularioRecibo', 'ultimoDocumentoRecibo'];

  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: 'Campo no permitido' });
  }

  const sql = `UPDATE datos_empresa SET ${campo} = ? WHERE id = 1`; // ajusta el WHERE si lo necesitas dinámico

  try {
    const [result] = await pool.query(sql, [valor]);
    res.status(200).json({ message: `Campo ${campo} actualizado correctamente` });
  } catch (err) {
    console.error('Error al actualizar:', err);
    res.status(500).json({ error: 'Error al actualizar el dato' });
  }
});
app.get('/api/obtenercorrelatividad', async (req, res) => {
  const sql = `
    SELECT ultimoFormularioRecibo, ultimoDocumentoRecibo
    FROM datos_empresa
    WHERE id = 1
    LIMIT 1
  `;
  try {
    const [rows] = await pool.query(sql);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sin datos de correlatividad' });
    }

    res.json(rows[0]); // { ultimoFormularioRecibo: 123, ultimoDocumentoRecibo: 456 }
  } catch (err) {
    console.error('Error al consultar correlatividad:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

app.get('/api/obtenercorrelatividadtabla', async (req, res) => {
  const query = `
    SELECT 
      nroformulario AS ccformulario, 
      nrorecibo AS ccdocumento, 
      DATE_FORMAT(fecha, '%d/%m/%Y') AS ccfecha, 
      'Recibo' AS cctipocomprobante, 
      CASE 
        WHEN numeroDocumentoCFE IS NOT NULL AND numeroDocumentoCFE != '' THEN 'Correcto'
        ELSE 'Sin impactar'
      END AS ccestado
    FROM recibos
    ORDER BY nroformulario DESC
  `;

  try {
    const [result] = await pool.query(query);
    res.json(result);
  } catch (err) {
    console.error('Error al obtener datos de correlatividad:', err);
    res.status(500).json({ error: 'Error al obtener datos de correlatividad' });
  }
});
app.get('/api/historialfacturacionnc/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  console.log('Endpoint historialfacturacionnc ejecutandose');
  const sql = `
  SELECT 
    DATE_FORMAT(Fecha, '%d/%m/%Y') AS FechaFormateada,
    facturas.*
  FROM facturas
  WHERE IdCliente = ? 
    AND tieneNC = 0 
    AND NumeroCFE IS NOT NULL
  ORDER BY Fecha DESC
`;

  try {
    const [results] = await pool.query(sql, [idCliente]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo facturas:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/insertarNC', async (req, res) => {
  const { idCliente, fecha, DocsAfectados, CFEsAfectados, ImporteTotal, CodigoClienteGIA, Moneda } = req.body;

  if (!idCliente || !fecha || !DocsAfectados || !ImporteTotal) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }
  try {
    const sqlInsert = `
    INSERT INTO nc (idCliente, fecha, DocsAfectados, CFEsAfectados, ImporteTotal, CodigoClienteGIA, Moneda)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    const [result] = await pool.query(sqlInsert, [idCliente, fecha, DocsAfectados, CFEsAfectados, ImporteTotal, CodigoClienteGIA, Moneda]);
    const idNC = result.insertId;

    const idsFacturas = DocsAfectados.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (idsFacturas.length === 0) {
      return res.json({ message: 'N/C insertada correctamente, no se actualizaron facturas', idNC: result.insertId });
    }


    const sqlUpdate = `UPDATE facturas SET tieneNC = 1 WHERE Id IN (?)`;
    await pool.query(sqlUpdate, [idsFacturas]);

    // Consultar facturas para obtener Moneda y TotalCobrar para movimientos en cuenta_corriente

    const sqlSelectFacturas = `SELECT Id, Moneda, TotalCobrar FROM facturas WHERE Id IN (?)`;
    const [facturas] = await pool.query(sqlSelectFacturas, [idsFacturas]);

    if (facturas.length === 0) {
      return res.json({
        message: 'N/C insertada y facturas actualizadas, pero no se encontraron facturas para cuenta corriente',
        idNC
      });
    }

    // Preparar array para insert masivo en cuenta_corriente
    const movimientos = facturas.map(f => [
      idCliente,            // IdCliente
      f.Id,                 // IdFactura
      fecha.split(' ')[0],  // Fecha (solo fecha)
      'NC',                 // TipoDocumento
      result.insertId.toString(), // NumeroDocumento (id de la NC insertada)
      '',                   // NumeroRecibo (vacío)
      f.Moneda,             // Moneda
      0,                    // Debe
      f.TotalCobrar || 0    // Haber (monto)
    ]);

    const sqlInsertMovimientos = `
          INSERT INTO cuenta_corriente
          (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, NumeroRecibo, Moneda, Debe, Haber)
          VALUES ?
        `;
    await pool.query(sqlInsertMovimientos, [movimientos]);
    // 5️⃣ ***Actualizar guias IMPO o EXPO asociadas a esas facturas***
    const sqlUpdateGuias = `
      UPDATE guiasimpo
      SET facturada = 0
      WHERE idfactura IN (? ) OR idfacturacuentaajena IN (?);
    `;
    await pool.query(sqlUpdateGuias, [idsFacturas, idsFacturas]);

    const sqlUpdateGuiasExpo = `
      UPDATE guiasexpo
      SET facturada = 0
      WHERE idfactura IN (?);
    `;
    await pool.query(sqlUpdateGuiasExpo, [idsFacturas]);



    const impactarResponse = await axios.post('http://localhost:5000/api/impactarnc', { idNC });

    return res.json({
      message: 'N/C insertada correctamente, facturas y cuenta corriente actualizadas',
      idNC,
      wsResultado: impactarResponse.data.resultado,
      pdfBase64: impactarResponse.data.pdfBase64
    });

  } catch (err) {
    console.error('Error procesando N/C:', err);
    return res.status(500).json({ message: 'Error procesando N/C', error: err.message });
  }
});


app.post('/api/impactarnc', async (req, res) => {
  console.log('ImpactarNC endpoint alcanzado');
  const { idNC } = req.body;
  console.log('ID N/C RECIBIDO:', idNC);
  try {
    const datosEmpresa = await obtenerDatosEmpresa(pool);
    // 1. Traer datos de la NC
    const [ncRows] = await pool.query('SELECT * FROM nc WHERE idNC = ?', [idNC]);
    const nc = ncRows[0];
    if (!nc) return res.status(404).json({ error: 'N/C no encontrada' });

    // 2. Obtener facturas asociadas
    const idsFacturas = nc.DocsAfectados.split(',').map(id => id.trim()).filter(id => id.length > 0);
    if (idsFacturas.length === 0) return res.status(400).json({ error: 'La N/C no tiene facturas asociadas' });


    const [facturas] = await pool.query('SELECT * FROM facturas WHERE Id IN (?)', [idsFacturas]);
    if (facturas.length === 0) return res.status(400).json({ error: 'No se encontraron facturas asociadas' });

    //Aca se obtiene el detalle de facturas para poder hacer los conceptos de la nc
    const detallesFacturas = {};

    for (const factura of facturas) {
      let detalles = [];

      if (factura.esManual === 1) {
        const [rows] = await pool.query(
          "SELECT IdFactura, Codigo, Descripcion, Moneda, IVA, Importe, impuesto, codigoGIA FROM detalle_facturas_manuales WHERE IdFactura = ?",
          [factura.Id]
        );
        detalles = rows.map(det => ({
          idFactura: det.IdFactura,
          codigo: det.Codigo,
          descripcion: det.Descripcion,
          moneda: det.Moneda,
          iva: det.IVA,
          importe: det.Importe,
          impuesto: det.impuesto,
          codigoGIA: det.codigoGIA,
        }));
      } else {
        const [rows] = await pool.query(
          "SELECT IdFactura, Tipo, Guia, Descripcion, Moneda, Importe, Id_concepto FROM detalle_facturas WHERE IdFactura = ?",
          [factura.Id]
        );
        detalles = rows.map(det => ({
          idFactura: det.IdFactura,
          tipo: det.Tipo,
          guia: det.Guia,
          descripcion: det.Descripcion,
          moneda: det.Moneda,
          importe: det.Importe,
          id_concepto: det.Id_concepto,
        }));
      }

      detallesFacturas[factura.Id] = detalles;
    }

    // 3. Preparar datos para XML
    const datosXml = {
      datosEmpresa,
      fechaCFE: formatFecha(nc.fecha),
      fechaVencimientoCFE: formatFecha(nc.fecha),
      adendadoc: facturas[0].Adenda,
      codigoClienteGIA: nc.CodigoClienteGIA,
      precioUnitario: nc.ImporteTotal, // Monto total
      Moneda: facturas[0].Moneda,
      tipoComprobante:
        facturas.length > 0
          ? (facturas[0].TipoDocCFE === 'TCT'
            ? 'NTT' // Codigo Nota para eticket
            : facturas[0].TipoDocCFE === 'TTA'
              ? 'NRA'//Codigo Nota para eticket CA
              : facturas[0].TipoDocCFE === 'FCT'
                ? 'NCT'//Codigo Nota para Efactura 
                : facturas[0].TipoDocCFE === 'FTA'
                  ? 'NCA' //Codigo Nota para Efactura CA
                  : 'NCA')
          : 'NCT',
      cancelaciones: facturas.map(factura => ({
        rubroAfectado: '113102',
        tipoDocumentoAfectado: factura.TipoDocCFE,
        comprobanteAfectado: factura.NumeroCFE,
        vencimientoAfectado: formatFecha(factura.FechaVencimiento || factura.Fecha),
        importe: factura.TotalCobrar,
        conceptos: detallesFacturas[factura.Id] || []
      }))
    };
    console.log(datosXml.cancelaciones)
    const xml = generarXmlNC(datosXml);
    console.log('Impactando N/C, XML: ', xml);

    // 4. Enviar XML al WS
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarDocumentoFacturacion"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': datosEmpresa.serverFacturacion,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)'
    };

    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xml,
      { headers }
    );
    console.log('RESPUESTA BRUTA DEL WS:', response.data);
    const parsed = await parseSOAP(response.data);
    const inner = await parseInnerXML(parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
    const resultado = inner.agregarDocumentoFacturacionResultado;

    if (resultado.resultado !== "1") {

      return res.status(200).json({
        success: false,
        message: resultado.descripcion,
        resultado
      });
    }

    // 5. Guardar datos del documento en la tabla NC
    const datosDoc = resultado?.datos?.documento;
    let pdfBase64 = null;
    console.log('DATOS DOC NC', datosDoc);
    if (datosDoc) {
      const { fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento } = datosDoc;


      await pool.query(`
        UPDATE nc
        SET fecha = ?, TipoDocumento = ?, Serie = ?, NumeroCFE = ?
        WHERE idNC = ?
      `, [fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento, idNC]);

      // 6. Obtener PDF desde el WS
      const headersPdf = {
        'Content-Type': 'text/xml;charset=utf-8',
        'SOAPAction': '"obtenerRepresentacionImpresaDocumentoFacturacion"',
        'Accept-Encoding': 'gzip,deflate',
        'Host': datosEmpresa.serverFacturacion,
        'Connection': 'Keep-Alive',
        'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)'
      };

      const xmlPdf = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
          <soapenv:Header/>
          <soapenv:Body>
            <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
              <xmlParametros><![CDATA[
                <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
                  <usuario>${datosEmpresa.usuarioGfe}</usuario>
                  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                  <documento>
                    <fechaDocumento>${fechaDocumento}</fechaDocumento>
                    <tipoDocumento>${tipoDocumento}</tipoDocumento>
                    <serieDocumento>${serieDocumento}</serieDocumento>
                    <numeroDocumento>${numeroDocumento}</numeroDocumento>
                  </documento>
                </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
              ]]></xmlParametros>
            </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
      console.log('XML PDF', xmlPdf);
      const pdfResp = await axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlPdf, { headers: headersPdf });
      const parsedPdf = await parseSOAP(pdfResp.data);
      const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
      const innerPdf = await parseInnerXML(innerPdfXmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
      pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;
      if (pdfBase64) {
        await pool.query(`
      UPDATE nc
      SET PdjBase64 = ?
      WHERE idNC = ?
    `, [pdfBase64, idNC]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'N/C impactada, datos y PDF del WS obtenidos correctamente',
      resultado,
      pdfBase64
    });

  } catch (err) {
    console.error('Error al impactar N/C:', err);
    return res.status(500).json({ error: 'Error al impactar N/C', details: err.message });
  }
});
app.post('/api/insertarNCACUENTA', async (req, res) => {
  const {
    idCliente,
    fecha,
    DocsAfectados = '-',
    CFEsAfectados = '-',
    ImporteTotal,
    CodigoClienteGIA,
    Moneda,
    Referencia,
    TipoNC,
    Conceptos = []
  } = req.body;

  if (!idCliente || !fecha || !ImporteTotal) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    // 1️⃣ Insertar cabecera en tabla nc
    const sqlInsert = `
      INSERT INTO nc (
        fecha,
        DocsAfectados,
        CFEsAfectados,
        ImporteTotal,
        Moneda,
        idCliente,
        CodigoClienteGIA
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sqlInsert, [
      fecha,
      DocsAfectados,
      CFEsAfectados,
      ImporteTotal,
      Moneda,
      idCliente,
      CodigoClienteGIA
    ]);

    const idNC = result.insertId;

    // 2️⃣ Impactar al WS (pasamos los conceptos directamente)
    const impactarResponse = await axios.post('http://localhost:5000/api/impactarncacuentaa', {
      idNC,
      TipoNC,
      Referencia,
      Conceptos
    });

    return res.json({
      message: 'N/C a cuenta insertada correctamente',
      idNC,
      wsResultado: impactarResponse.data.resultado,
      pdfBase64: impactarResponse.data.pdfBase64
    });

  } catch (err) {
    console.error('Error procesando N/C a cuenta:', err);
    return res.status(500).json({
      message: 'Error procesando N/C a cuenta',
      error: err.message
    });
  }
});
app.post('/api/impactarncacuentaa', async (req, res) => {
  console.log('Impactar NC a cuenta alcanzado');
  const { idNC, TipoNC, Referencia, Conceptos = [] } = req.body;

  try {
    const datosEmpresa = await obtenerDatosEmpresa(pool);

    // 1️⃣ Obtener datos de la NC
    const [ncRows] = await pool.query('SELECT * FROM nc WHERE idNC = ?', [idNC]);
    const nc = ncRows[0];
    if (!nc) return res.status(404).json({ error: 'N/C no encontrada' });
    const adenda = generarAdendaSinDoc(nc.ImporteTotal, nc.Moneda);
    // 2️⃣ Preparar datos XML
    const datosXml = {
      datosEmpresa,
      fechaCFE: formatFecha(nc.fecha),
      fechaVencimientoCFE: formatFecha(nc.fecha),
      codigoClienteGIA: nc.CodigoClienteGIA,
      Moneda: nc.Moneda,
      precioUnitario: nc.ImporteTotal,
      tipoComprobante: TipoNC || 'NCA',
      referencia: Referencia || '',
      conceptos: Conceptos.map(c => ({
        id_concepto: c.id_concepto || '',
        descripcion: c.descripcion || '',
        importe: c.importe || 0
      })),
      adenda: adenda
    };

    const xml = generarXmlNCaCuenta(datosXml);
    console.log('XML NC Cuenta Ajena:', xml);

    // 3️⃣ Enviar XML al WS
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
      'SOAPAction': '"agregarDocumentoFacturacion"',
      'Accept-Encoding': 'gzip,deflate',
      'Host': datosEmpresa.serverFacturacion,
      'Connection': 'Keep-Alive',
      'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)'
    };

    const response = await axios.post(
      `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
      xml,
      { headers }
    );

    const parsed = await parseSOAP(response.data);
    const inner = await parseInnerXML(parsed.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
    const resultado = inner.agregarDocumentoFacturacionResultado;

    if (resultado.resultado !== "1") {
      return res.status(200).json({
        success: false,
        message: resultado.descripcion,
        resultado
      });
    }

    // 4️⃣ Actualizar NC con datos del documento
    const datosDoc = resultado?.datos?.documento;
    let pdfBase64 = null;

    if (datosDoc) {
      const { fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento } = datosDoc;

      await pool.query(`
        UPDATE nc
        SET fecha = ?, TipoDocumento = ?, Serie = ?, NumeroCFE = ?
        WHERE idNC = ?
      `, [fechaDocumento, tipoDocumento, serieDocumento, numeroDocumento, idNC]);

      // 5️⃣ Obtener PDF del WS
      const headersPdf = {
        'Content-Type': 'text/xml;charset=utf-8',
        'SOAPAction': '"obtenerRepresentacionImpresaDocumentoFacturacion"',
        'Accept-Encoding': 'gzip,deflate',
        'Host': datosEmpresa.serverFacturacion,
        'Connection': 'Keep-Alive',
        'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)'
      };

      const xmlPdf = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap/">
          <soapenv:Header/>
          <soapenv:Body>
            <soap:obtenerRepresentacionImpresaDocumentoFacturacion>
              <xmlParametros><![CDATA[
                <obtenerRepresentacionImpresaDocumentoFacturacionParametros>
                  <usuario>${datosEmpresa.usuarioGfe}</usuario>
                  <usuarioPassword>${datosEmpresa.passwordGfe}</usuarioPassword>
                  <empresa>${datosEmpresa.codigoEmpresa}</empresa>
                  <documento>
                    <fechaDocumento>${fechaDocumento}</fechaDocumento>
                    <tipoDocumento>${tipoDocumento}</tipoDocumento>
                    <serieDocumento>${serieDocumento}</serieDocumento>
                    <numeroDocumento>${numeroDocumento}</numeroDocumento>
                  </documento>
                </obtenerRepresentacionImpresaDocumentoFacturacionParametros>
              ]]></xmlParametros>
            </soap:obtenerRepresentacionImpresaDocumentoFacturacion>
          </soapenv:Body>
        </soapenv:Envelope>
      `;

      const pdfResp = await axios.post(
        `http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`,
        xmlPdf,
        { headers: headersPdf }
      );

      const parsedPdf = await parseSOAP(pdfResp.data);
      const innerPdfXmlEscaped = parsedPdf.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
      const innerPdf = await parseInnerXML(innerPdfXmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
      pdfBase64 = innerPdf.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;

      if (pdfBase64) {
        await pool.query(`UPDATE nc SET PdjBase64 = ? WHERE idNC = ?`, [pdfBase64, idNC]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'N/C a cuenta impactada y PDF obtenido correctamente',
      resultado,
      pdfBase64
    });

  } catch (err) {
    console.error('Error al impactar N/C a cuenta:', err);
    return res.status(500).json({
      error: 'Error al impactar N/C a cuenta',
      details: err.message
    });
  }
});
app.post('/api/eliminarNC', async (req, res) => {
  const { idNC } = req.body;

  if (!idNC) {
    return res.status(400).json({ message: 'Falta el idNC' });
  }

  try {
    // 1️⃣ Obtener la NC y sus facturas asociadas
    const [ncRows] = await pool.query('SELECT DocsAfectados FROM nc WHERE idNC = ?', [idNC]);
    if (ncRows.length === 0) {
      return res.status(404).json({ message: 'N/C no encontrada' });
    }

    const idsFacturas = ncRows[0].DocsAfectados.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (idsFacturas.length > 0) {
      // 2️⃣ Actualizar facturas para desmarcar tieneNC
      await pool.query('UPDATE facturas SET tieneNC = 0 WHERE Id IN (?)', [idsFacturas]);

      // 3️⃣ Borrar movimientos de cuenta_corriente asociados
      await pool.query('DELETE FROM cuenta_corriente WHERE TipoDocumento = "NC" AND NumeroDocumento = ?', [idNC]);

      // 4️⃣ Borrar la NC
      await pool.query('DELETE FROM nc WHERE idNC = ?', [idNC]);

      return res.json({ message: 'N/C eliminada correctamente' });
    } else {
      // Si no hay facturas asociadas, solo borrar la NC
      await pool.query('DELETE FROM nc WHERE idNC = ?', [idNC]);
      return res.json({ message: 'N/C eliminada correctamente' });
    }
  } catch (err) {
    console.error('Error eliminando N/C:', err);
    return res.status(500).json({ message: 'Error eliminando N/C', error: err.message });
  }
});

app.post('/api/reimpactarnc', async (req, res) => {
  const { idNC, idCliente, fecha, DocsAfectados, CFEsAfectados, ImporteTotal, CodigoClienteGIA, Moneda } = req.body;

  if (!idNC || !idCliente || !fecha || !DocsAfectados || !ImporteTotal) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para reimpactar N/C' });
  }
  try {
    // 1. Actualizar la NC con los datos modificados
    const sqlUpdateNC = `
    UPDATE nc 
    SET idCliente = ?, fecha = ?, DocsAfectados = ?, CFEsAfectados = ?, 
        ImporteTotal = ?, CodigoClienteGIA = ?, Moneda = ?
    WHERE idNC = ?
  `;

    await pool.query(sqlUpdateNC, [idCliente, fecha, DocsAfectados, CFEsAfectados, ImporteTotal, CodigoClienteGIA, Moneda, idNC]);

    console.log(`N/C ${idNC} actualizada correctamente, procediendo a impactar al WS...`);

    // 2️⃣ Llamar al endpoint de impactar, reutilizando la lógica ya existente
    const impactarResponse = await axios.post('http://localhost:5000/api/impactarnc', { idNC });

    return res.json({
      message: 'N/C actualizada y reimpactada correctamente',
      idNC,
      wsResultado: impactarResponse.data
    });

  } catch (err) {
    console.error('Error reimpactando N/C:', err);
    return res.status(500).json({ message: 'Error al reimpactar N/C', error: err.message });
  }
});
app.get("/api/reportedeembarqueguiasexpo", async (req, res) => {
  const { desde, hasta, cliente, tipoPago, aerolinea } = req.query;
  console.log("Parámetros recibidos:", desde, hasta, cliente, tipoPago, aerolinea);
  try {
    let query = `
      SELECT 
        g.*, 
        f.NumeroCFE AS numeroFacturaCFE,
        r.numeroDocumentoCFE AS numeroReciboCFE,
        v.vuelo AS vuelo,
        v.compania AS compania
      FROM guiasexpo g
      LEFT JOIN facturas f ON g.idfactura = f.Id
      LEFT JOIN recibos r ON f.idrecibo = r.idrecibo
      LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
      WHERE DATE(g.fechaingresada) BETWEEN ? AND ?
    `;

    const params = [desde, hasta];

    // Filtro por cliente (opcional)
    if (cliente && cliente.trim() !== "" && cliente.trim().toLowerCase() !== "todos") {
      query += " AND g.agente = ?";
      params.push(cliente);
    }

    // Filtro por tipo de pago (opcional) con mapeo
    if (tipoPago && tipoPago.trim() !== "" && tipoPago.trim().toLowerCase() !== "todos") {
      let tipoFiltro = null;
      if (tipoPago.toLowerCase() === "cc") tipoFiltro = "C";
      else if (tipoPago.toLowerCase() === "pp") tipoFiltro = "P";

      if (tipoFiltro) {
        query += " AND g.tipodepago = ?";
        params.push(tipoFiltro);
      }
    }
    if (aerolinea && aerolinea.trim() !== "" && aerolinea.toLowerCase() !== "all") {
      query += " AND v.compania = ?";
      params.push(aerolinea);
    }

    query += " ORDER BY g.fechaingresada DESC";
    console.log('Query mas parametros reporte expo', query, params)
    const [rows] = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte Embarque");

    worksheet.columns = [
      { header: "awbnumber", key: "guia", width: 15 },
      { header: "agente", key: "agente", width: 20 },
      { header: "destino", key: "destinovuelo", width: 15 },
      { header: "nrovuelo", key: "nrovuelo", width: 15 },
      { header: "fecha", key: "emision", width: 15 },
      { header: "bruto", key: "pesobruto", width: 10 },
      { header: "tarifado", key: "pesotarifado", width: 10 },
      { header: "ppcc", key: "tipodepago", width: 10 },
      { header: "neto", key: "tarifaneta", width: 10 },
      { header: "awbrate", key: "tarifaventa", width: 10 },
      { header: "awa", key: "awa", width: 10 },
      { header: "awc", key: "duecarrier", width: 10 },
      { header: "cca", key: "cca", width: 10 },
      { header: "dbc", key: "dbf", width: 10 },
      { header: "fletevz", key: "fleteneto", width: 10 },
      { header: "totalvz", key: "totalvz", width: 10 },
      { header: "fleteawb", key: "fleteawb", width: 10 },
      { header: "totalawb", key: "total", width: 10 },
      { header: "gsa", key: "gsa", width: 10 },
      { header: "security", key: "security", width: 10 },
      { header: "pagarcobrar", key: "cobrarpagar", width: 10 },
      { header: "factura", key: "numeroFacturaCFE", width: 15 },
      { header: "recibo", key: "numeroReciboCFE", width: 15 },
    ];

    rows.forEach((r) => {
      r.cca = 0;
      const fleteneto = Number(r.fleteneto) || 0;
      const duecarrier = Number(r.duecarrier) || 0;
      r.totalvz = fleteneto + duecarrier;
      r.awa = r.fleteawb || 0;
      worksheet.addRow(r);
      // Forzar celdas vacías para que existan y se vean los bordes
      worksheet.columns.forEach((col, index) => {
        const cell = worksheet.getRow(worksheet.lastRow.number).getCell(index + 1);
        if (cell.value === undefined || cell.value === null) {
          cell.value = "";
        }
      });
    });
    // 🔹 Define color corporativo RePremar (azul)
    const azulRepremar = "143361"; // puedes ajustar el tono si querés otro matiz

    // 🔹 Estilo para el header
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: azulRepremar },
      };
      cell.font = { bold: true, color: { argb: "FFFFFF" } }; // texto blanco
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 🔹 Colorear filas alternadas (gris claro y blanco)
    const grisClaro = "F2F2F2";

    // 🔹 Aplicar formato a filas (centrar + alternar colores + bordes)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // omitir header
      const colorFondo = rowNumber % 2 === 0 ? grisClaro : "FFFFFF";
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorFondo },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // 🔹 Agregar autofiltro a todas las columnas relevantes
    worksheet.autoFilter = {
      from: "A1",
      to: worksheet.getRow(1).getCell(worksheet.columnCount)._address,
    };

    // 🔹 Congelar la fila de encabezado
    worksheet.views = [{ state: "frozen", ySplit: 1 }];


    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte_Embarque_${desde}_a_${hasta}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando Excel:", err);
    res.status(500).json({ mensaje: "Error generando Excel", error: err.message });
  }
});
app.get("/api/reportedeembarque/pdf", async (req, res) => {
  try {
    const { desde, hasta, cliente, tipoPago, aerolinea } = req.query;
    console.log("Parámetros recibidos:", { desde, hasta, cliente, tipoPago });

    // Mapear tipoPago a la base de datos
    let tipoFiltro = "";
    if (tipoPago?.toLowerCase() === "cc") tipoFiltro = "C"; // Collect
    else if (tipoPago?.toLowerCase() === "pp") tipoFiltro = "P"; // Prepaid

    // Query SQL con filtros dinámicos
    const [rows] = await pool.query(
      `
  SELECT 
    g.guia AS awb,
    DATE_FORMAT(g.emision, '%d/%m/%Y') AS emision,
    v.vuelo AS vuelo,
    DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fecha,
    g.destinovuelo AS destino,
    g.pesobruto AS peso,
    g.pesotarifado AS tarifado,
    g.tipodepago AS ppcc,
    g.tarifaneta AS tarifa,
    g.fleteawb,
    g.fleteneto AS totalflete,
    g.dueagent,
    g.dbf,
    g.duecarrier,
    g.security,
    g.cobrarpagar AS incentivo,
    g.total
  FROM guiasexpo g
  LEFT JOIN vuelos v ON v.idVuelos = g.nrovuelo
  WHERE 1=1
    ${cliente ? "AND g.agente = ?" : ""}
    ${tipoFiltro ? "AND g.tipodepago = ?" : ""}
    ${desde && hasta ? "AND g.emision BETWEEN ? AND ?" : ""}
    ${aerolinea && aerolinea.toLowerCase() !== "all" ? "AND v.compania = ?" : ""}
  ORDER BY g.emision ASC
  `,
      [
        ...(cliente ? [cliente] : []),
        ...(tipoFiltro ? [tipoFiltro] : []),
        ...(desde && hasta ? [desde, hasta] : []),
        ...(aerolinea && aerolinea.toLowerCase() !== "all" ? [aerolinea] : []),
      ]
    );

    if (!rows.length) {
      return res.status(404).send("No se encontraron datos para el filtro indicado.");
    }

    // Separar Collect y Prepaid usando el valor real de la base
    const collectData = [];
    const prepaidData = [];

    rows.forEach(r => {
      r.incentivo = Number(r.fleteawb || 0) - Number(r.totalflete || 0);

      // Para mostrar en la tabla
      r.ppccDisplay = r.ppcc === "P" ? "PREPAID" : "COLLECT";

      // Separar según valor real
      if (r.ppcc === "C") collectData.push(r);
      else if (r.ppcc === "P") prepaidData.push(r);
    });

    const totalCollect = collectData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalPrepaid = prepaidData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalFinal = totalPrepaid - totalCollect;

    // Crear PDF A3 horizontal
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([1191, 842]);

    let imageFile = "AirEuropa.jpg"; // valor por defecto

    if (aerolinea?.toUpperCase() === "AIRCLASS") {
      imageFile = "Airclass.jpg";
    } else if (aerolinea?.toUpperCase() === "ALL") {
      imageFile = null; // sin imagen
    }

    // --- SOLO si hay imagen se ejecuta este bloque ---
    if (imageFile) {
      const imagePath = path.join(__dirname, "Img", imageFile);
      const imageBytes = fs.readFileSync(imagePath);

      const jpgImage = await pdfDoc.embedJpg(imageBytes);

      const imgWidth = 160;
      const imgHeight = (jpgImage.height / jpgImage.width) * imgWidth;

      page.drawImage(jpgImage, {
        x: 1191 - imgWidth - 40,
        y: page.getHeight() - imgHeight - 40,
        width: imgWidth,
        height: imgHeight,
      });
    }
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.12, 0.31, 0.47);
    const gris = rgb(0.95, 0.95, 0.95);
    const negro = rgb(0, 0, 0);

    let y = height - 60;

    // Encabezado
    page.drawText("Reporte de Exportación", {
      x: 480,
      y,
      size: 20,
      font: bold,
      color: negro,
    });

    y -= 40;

    const datos = [
      ["Cliente:", cliente || "-"],
      ["Desde:", desde || "-"],
      ["Hasta:", hasta || "-"],
      ["Base:", "MVD"],
    ];

    datos.forEach(([k, v]) => {
      page.drawText(k, { x: 50, y, size: 12, font: bold });
      page.drawText(v, { x: 130, y, size: 12, font });
      y -= 18;
    });

    y -= 10;

    const headers = [
      "Número AWB", "Emisión", "Vuelo", "Fecha", "Destino",
      "Peso Bruto", "Peso Tarifado", "PP/CC", "Tarifa Neta",
      "Flete AWB", "Total Flete", "Due Agent", "DBF",
      "Due Carrier", "Security", "Incentivo", "Total",
    ];

    const colWidths = [
      77, 65, 54, 65, 54, 60, 71, 60, 54, 60, 65, 65, 42, 71, 60, 71, 60,
    ];
    const startX = (1191 - colWidths.reduce((a, b) => a + b, 0)) / 2;

    const drawTable = (dataArray, title, total) => {
      if (!dataArray.length) return; // no dibuja si no hay datos

      const marginTop = 50; // margen superior al crear nueva página
      const rowHeight = 17;
      const headerHeight = 22;
      const titleHeight = 20;

      // Función para agregar página nueva si y es demasiado bajo
      const checkNewPage = () => {
        if (y < 50) { // 50px margen inferior
          const newPage = pdfDoc.addPage([1191, 842]);
          y = newPage.getSize().height - marginTop;
          page = newPage; // reemplaza la página actual
        }
      };

      let x = startX;
      y -= 30;

      // Título tabla
      page.drawText(title, { x: startX, y, size: 14, font: bold, color: azul });
      y -= titleHeight;

      // Cabecera
      x = startX;
      headers.forEach((h, i) => {
        checkNewPage();
        page.drawRectangle({
          x,
          y: y - headerHeight,
          width: colWidths[i],
          height: headerHeight,
          color: azul,
        });
        page.drawText(h, {
          x: x + 3,
          y: y - 15,
          size: 10,
          font: bold,
          color: rgb(1, 1, 1),
        });
        x += colWidths[i];
      });
      y -= headerHeight;

      // Filas
      dataArray.forEach((r, idx) => {
        checkNewPage();

        const colorFondo = idx % 2 === 0 ? gris : rgb(1, 1, 1);
        x = startX;

        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: rowHeight,
          color: colorFondo,
        });

        const valores = [
          r.awb,
          r.emision,
          r.vuelo,
          r.fecha,
          r.destino,
          Number(r.peso || 0).toFixed(2),
          Number(r.tarifado || 0).toFixed(2),
          r.ppccDisplay,
          Number(r.tarifa || 0).toFixed(2),
          Number(r.fleteawb || 0).toFixed(2),
          Number(r.totalflete || 0).toFixed(2),
          Number(r.dueagent || 0).toFixed(2),
          Number(r.dbf || 0).toFixed(2),
          Number(r.duecarrier || 0).toFixed(2),
          Number(r.security || 0).toFixed(2),
          Number(r.incentivo || 0).toFixed(2),
          Number(r.total || 0).toFixed(2),
        ];

        valores.forEach((v, i) => {
          page.drawText(String(v), {
            x: x + 3,
            y: y - 12,
            size: 10,
            font,
            color: negro,
          });
          x += colWidths[i];
        });

        y -= rowHeight;
      });

      y -= 20;

      // Total de la tabla a la derecha
      const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
      const totalX = startX + totalTableWidth - 150;

      page.drawText(title === "COLLECT" ? "A Cobrar:" : "A Pagar:", {
        x: totalX,
        y,
        size: 12,
        font: bold,
        color: azul,
      });
      page.drawText(total.toFixed(2), {
        x: totalX + 100,
        y,
        size: 12,
        font: bold,
        color: azul,
      });

      y -= 30;
    };

    // Dibujar tablas solo si tienen datos
    drawTable(collectData, "COLLECT", totalCollect);
    drawTable(prepaidData, "PREPAID", totalPrepaid);

    // Total final resaltado con recuadro a la derecha
    const totalFinalX = startX + colWidths.reduce((a, b) => a + b, 0) - 200;
    page.drawRectangle({
      x: totalFinalX,
      y: y - 22,
      width: 200,
      height: 22,
      color: azul,
    });
    page.drawText("Total a Pagar", {
      x: totalFinalX + 10,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(totalFinal.toFixed(2), {
      x: totalFinalX + 200 - 60,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte_Exportacion_${desde}_a_${hasta}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando el PDF");
  }
});
app.get("/api/reportedeembarqueimpo/pdf", async (req, res) => {
  try {
    const { desde, hasta, cliente, tipoPago, aerolinea } = req.query;
    console.log("Parámetros recibidos:", { desde, hasta, cliente, tipoPago });

    // Mapear tipoPago a la base de datos
    let tipoFiltro = "";
    if (tipoPago?.toLowerCase() === "cc") tipoFiltro = "C"; // Collect
    else if (tipoPago?.toLowerCase() === "pp") tipoFiltro = "P"; // Prepaid

    // Query SQL con filtros dinámicos
    const [rows] = await pool.query(
      `
  SELECT 
    g.guia AS awb,
    DATE_FORMAT(g.emision, '%d/%m/%Y') AS emision,
    v.vuelo AS vuelo,
    DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fecha,
    g.destinoguia AS destino,
    g.peso AS peso,
    g.pesovolumetrico AS tarifado,
    g.tipodepagoguia AS ppcc,
    g.tarifa AS tarifa,
    g.flete AS totalflete,
    g.dueagent,
    g.verificacion AS dbf,
    g.duecarrier,
    g.collectfee AS security,
    g.ajuste AS incentivo,
    g.total
  FROM guiasimpo g
  LEFT JOIN vuelos v ON v.idVuelos = g.nrovuelo
  WHERE 1=1
    ${cliente ? "AND g.consignatario = ?" : ""}
    ${tipoFiltro ? "AND g.tipodepagoguia = ?" : ""}
    ${desde && hasta ? "AND g.emision BETWEEN ? AND ?" : ""}
    ${aerolinea && aerolinea.toLowerCase() !== "all" ? "AND v.compania = ?" : ""}
  ORDER BY g.emision ASC
  `,
      [
        ...(cliente ? [cliente] : []),
        ...(tipoFiltro ? [tipoFiltro] : []),
        ...(desde && hasta ? [desde, hasta] : []),
        ...(aerolinea && aerolinea.toLowerCase() !== "all" ? [aerolinea] : []),
      ]
    );

    if (!rows.length) {
      return res.status(404).send("No se encontraron datos para el filtro indicado.");
    }

    // Separar Collect y Prepaid usando el valor real de la base
    const collectData = [];
    const prepaidData = [];

    rows.forEach(r => {
      r.incentivo = Number(r.fleteawb || 0) - Number(r.totalflete || 0);

      // Para mostrar en la tabla
      r.ppccDisplay = r.ppcc === "P" ? "PREPAID" : "COLLECT";

      // Separar según valor real
      if (r.ppcc === "C") collectData.push(r);
      else if (r.ppcc === "P") prepaidData.push(r);
    });

    const totalCollect = collectData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalPrepaid = prepaidData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalFinal = totalPrepaid - totalCollect;

    // Crear PDF A3 horizontal
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([1191, 842]);

    let imageFile = "AirEuropa.jpg"; // valor por defecto

    if (aerolinea?.toUpperCase() === "AIRCLASS") {
      imageFile = "Airclass.jpg";
    } else if (aerolinea?.toUpperCase() === "ALL") {
      imageFile = null; // sin imagen
    }

    // --- SOLO si hay imagen se ejecuta este bloque ---
    if (imageFile) {
      const imagePath = path.join(__dirname, "Img", imageFile);
      const imageBytes = fs.readFileSync(imagePath);

      const jpgImage = await pdfDoc.embedJpg(imageBytes);

      const imgWidth = 160;
      const imgHeight = (jpgImage.height / jpgImage.width) * imgWidth;

      page.drawImage(jpgImage, {
        x: 1191 - imgWidth - 40,
        y: page.getHeight() - imgHeight - 40,
        width: imgWidth,
        height: imgHeight,
      });
    }
    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.12, 0.31, 0.47);
    const gris = rgb(0.95, 0.95, 0.95);
    const negro = rgb(0, 0, 0);

    let y = height - 60;

    // Encabezado
    page.drawText("Reporte de Importación", {
      x: 480,
      y,
      size: 20,
      font: bold,
      color: negro,
    });

    y -= 40;

    const datos = [
      ["Cliente:", cliente || "-"],
      ["Desde:", desde || "-"],
      ["Hasta:", hasta || "-"],
      ["Base:", "MVD"],
    ];

    datos.forEach(([k, v]) => {
      page.drawText(k, { x: 50, y, size: 12, font: bold });
      page.drawText(v, { x: 130, y, size: 12, font });
      y -= 18;
    });

    y -= 10;

    const headers = [
      "Número AWB", "Emisión", "Vuelo", "Fecha", "Destino",
      "Peso Bruto", "Peso Tarifado", "PP/CC", "Tarifa Neta",
      "Flete AWB", "Total Flete", "Due Agent", "DBF",
      "Due Carrier", "Security", "Incentivo", "Total",
    ];

    const colWidths = [
      77, 65, 54, 65, 54, 60, 71, 60, 54, 60, 65, 65, 42, 71, 60, 71, 60,
    ];
    const startX = (1191 - colWidths.reduce((a, b) => a + b, 0)) / 2;

    const drawTable = (dataArray, title, total) => {
      if (!dataArray.length) return; // no dibuja si no hay datos

      const marginTop = 50; // margen superior al crear nueva página
      const rowHeight = 17;
      const headerHeight = 22;
      const titleHeight = 20;

      // Función para agregar página nueva si y es demasiado bajo
      const checkNewPage = () => {
        if (y < 50) { // 50px margen inferior
          const newPage = pdfDoc.addPage([1191, 842]);
          y = newPage.getSize().height - marginTop;
          page = newPage; // reemplaza la página actual
        }
      };

      let x = startX;
      y -= 30;

      // Título tabla
      page.drawText(title, { x: startX, y, size: 14, font: bold, color: azul });
      y -= titleHeight;

      // Cabecera
      x = startX;
      headers.forEach((h, i) => {
        checkNewPage();
        page.drawRectangle({
          x,
          y: y - headerHeight,
          width: colWidths[i],
          height: headerHeight,
          color: azul,
        });
        page.drawText(h, {
          x: x + 3,
          y: y - 15,
          size: 10,
          font: bold,
          color: rgb(1, 1, 1),
        });
        x += colWidths[i];
      });
      y -= headerHeight;

      // Filas
      dataArray.forEach((r, idx) => {
        checkNewPage();

        const colorFondo = idx % 2 === 0 ? gris : rgb(1, 1, 1);
        x = startX;

        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: rowHeight,
          color: colorFondo,
        });

        const valores = [
          r.awb,
          r.emision,
          r.vuelo,
          r.fecha,
          r.destino,
          Number(r.peso || 0).toFixed(2),
          Number(r.tarifado || 0).toFixed(2),
          r.ppccDisplay,
          Number(r.tarifa || 0).toFixed(2),
          Number(r.fleteawb || 0).toFixed(2),
          Number(r.totalflete || 0).toFixed(2),
          Number(r.dueagent || 0).toFixed(2),
          Number(r.dbf || 0).toFixed(2),
          Number(r.duecarrier || 0).toFixed(2),
          Number(r.security || 0).toFixed(2),
          Number(r.incentivo || 0).toFixed(2),
          Number(r.total || 0).toFixed(2),
        ];

        valores.forEach((v, i) => {
          page.drawText(String(v), {
            x: x + 3,
            y: y - 12,
            size: 10,
            font,
            color: negro,
          });
          x += colWidths[i];
        });

        y -= rowHeight;
      });

      y -= 20;

      // Total de la tabla a la derecha
      const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
      const totalX = startX + totalTableWidth - 150;

      page.drawText(title === "COLLECT" ? "A Cobrar:" : "A Pagar:", {
        x: totalX,
        y,
        size: 12,
        font: bold,
        color: azul,
      });
      page.drawText(total.toFixed(2), {
        x: totalX + 100,
        y,
        size: 12,
        font: bold,
        color: azul,
      });

      y -= 30;
    };

    // Dibujar tablas solo si tienen datos
    drawTable(collectData, "COLLECT", totalCollect);
    drawTable(prepaidData, "PREPAID", totalPrepaid);

    // Total final resaltado con recuadro a la derecha
    const totalFinalX = startX + colWidths.reduce((a, b) => a + b, 0) - 200;
    page.drawRectangle({
      x: totalFinalX,
      y: y - 22,
      width: 200,
      height: 22,
      color: azul,
    });
    page.drawText("Total a Pagar", {
      x: totalFinalX + 10,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(totalFinal.toFixed(2), {
      x: totalFinalX + 200 - 60,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte_Exportacion_${desde}_a_${hasta}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando el PDF");
  }
});
app.get("/api/reportedeembarquependiente/pdf", async (req, res) => {
  try {
    const { desde, hasta, cliente, tipoPago, aerolinea } = req.query;
    console.log("reportedeembarquependiente, Parámetros recibidos:", { desde, hasta, cliente, tipoPago });

    // Mapear tipoPago a la base de datos
    let tipoFiltro = "";
    if (tipoPago?.toLowerCase() === "cc") tipoFiltro = "C"; // Collect
    else if (tipoPago?.toLowerCase() === "pp") tipoFiltro = "P"; // Prepaid

    // Query SQL con filtros dinámicos
    const [rows] = await pool.query(
      `
  SELECT 
    g.guia AS awb,
    DATE_FORMAT(g.emision, '%d/%m/%Y') AS emision,
    v.vuelo AS vuelo,
    DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fecha,
    g.destinovuelo AS destino,
    g.pesobruto AS peso,
    g.pesotarifado AS tarifado,
    g.tipodepago AS ppcc,
    g.tarifaneta AS tarifa,
    g.fleteawb,
    g.fleteneto AS totalflete,
    g.dueagent,
    g.dbf,
    g.duecarrier,
    g.security,
    g.cobrarpagar AS incentivo,
    g.total
  FROM guiasexpo g
  LEFT JOIN vuelos v ON v.idVuelos = g.nrovuelo
  WHERE 1=1
  AND g.facturada = 0 AND g.cass = 'N' 
    ${cliente ? "AND g.agente = ?" : ""}
    ${tipoFiltro ? "AND g.tipodepago = ?" : ""}
    ${desde && hasta ? "AND g.emision BETWEEN ? AND ?" : ""}
      ${aerolinea && aerolinea.toLowerCase() !== "all" ? "AND v.compania = ?" : ""}
  ORDER BY g.emision ASC
  `,
      [
        ...(cliente ? [cliente] : []),
        ...(tipoFiltro ? [tipoFiltro] : []),
        ...(desde && hasta ? [desde, hasta] : []),
        ...(aerolinea && aerolinea.toLowerCase() !== "all" ? [aerolinea] : []),
      ]
    );

    if (!rows.length) {
      return res.status(404).send("No se encontraron datos para el filtro indicado.");
    }

    // Separar Collect y Prepaid usando el valor real de la base
    const collectData = [];
    const prepaidData = [];

    rows.forEach(r => {
      r.incentivo = Number(r.fleteawb || 0) - Number(r.totalflete || 0);

      // Para mostrar en la tabla
      r.ppccDisplay = r.ppcc === "P" ? "PREPAID" : "COLLECT";

      // Separar según valor real
      if (r.ppcc === "C") collectData.push(r);
      else if (r.ppcc === "P") prepaidData.push(r);
    });

    const totalCollect = collectData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalPrepaid = prepaidData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalFinal = totalPrepaid - totalCollect;

    // Crear PDF A3 horizontal
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([1191, 842]);
    let imageFile = "AirEuropa.jpg"; // valor por defecto

    if (aerolinea?.toUpperCase() === "AIRCLASS") {
      imageFile = "Airclass.jpg";
    } else if (aerolinea?.toUpperCase() === "ALL") {
      imageFile = null; // sin imagen
    }

    // --- SOLO si hay imagen se ejecuta este bloque ---
    if (imageFile) {
      const imagePath = path.join(__dirname, "Img", imageFile);
      const imageBytes = fs.readFileSync(imagePath);

      const jpgImage = await pdfDoc.embedJpg(imageBytes);

      const imgWidth = 160;
      const imgHeight = (jpgImage.height / jpgImage.width) * imgWidth;

      page.drawImage(jpgImage, {
        x: 1191 - imgWidth - 40,
        y: page.getHeight() - imgHeight - 40,
        width: imgWidth,
        height: imgHeight,
      });
    }

    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.12, 0.31, 0.47);
    const gris = rgb(0.95, 0.95, 0.95);
    const negro = rgb(0, 0, 0);

    let y = height - 60;

    // Encabezado
    page.drawText("Reporte de Exportación", {
      x: 480,
      y,
      size: 20,
      font: bold,
      color: negro,
    });

    y -= 40;

    const datos = [
      ["Cliente:", cliente || "-"],
      ["Desde:", desde || "-"],
      ["Hasta:", hasta || "-"],
      ["Base:", "MVD"],
    ];

    datos.forEach(([k, v]) => {
      page.drawText(k, { x: 50, y, size: 12, font: bold });
      page.drawText(v, { x: 130, y, size: 12, font });
      y -= 18;
    });

    y -= 10;

    const headers = [
      "Número AWB", "Emisión", "Vuelo", "Fecha", "Destino",
      "Peso Bruto", "Peso Tarifado", "PP/CC", "Tarifa Neta",
      "Flete AWB", "Total Flete", "Due Agent", "DBF",
      "Due Carrier", "Security", "Incentivo", "Total",
    ];

    const colWidths = [
      77, 65, 54, 65, 54, 60, 71, 60, 54, 60, 65, 65, 42, 71, 60, 71, 60,
    ];
    const startX = (1191 - colWidths.reduce((a, b) => a + b, 0)) / 2;

    const drawTable = (dataArray, title, total) => {
      if (!dataArray.length) return; // no dibuja si no hay datos

      const marginTop = 50; // margen superior al crear nueva página
      const rowHeight = 17;
      const headerHeight = 22;
      const titleHeight = 20;

      // Función para agregar página nueva si y es demasiado bajo
      const checkNewPage = () => {
        if (y < 50) { // 50px margen inferior
          const newPage = pdfDoc.addPage([1191, 842]);
          y = newPage.getSize().height - marginTop;
          page = newPage; // reemplaza la página actual
        }
      };

      let x = startX;
      y -= 30;

      // Título tabla
      page.drawText(title, { x: startX, y, size: 14, font: bold, color: azul });
      y -= titleHeight;

      // Cabecera
      x = startX;
      headers.forEach((h, i) => {
        checkNewPage();
        page.drawRectangle({
          x,
          y: y - headerHeight,
          width: colWidths[i],
          height: headerHeight,
          color: azul,
        });
        page.drawText(h, {
          x: x + 3,
          y: y - 15,
          size: 10,
          font: bold,
          color: rgb(1, 1, 1),
        });
        x += colWidths[i];
      });
      y -= headerHeight;

      // Filas
      dataArray.forEach((r, idx) => {
        checkNewPage();

        const colorFondo = idx % 2 === 0 ? gris : rgb(1, 1, 1);
        x = startX;

        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: rowHeight,
          color: colorFondo,
        });

        const valores = [
          r.awb,
          r.emision,
          r.vuelo,
          r.fecha,
          r.destino,
          Number(r.peso || 0).toFixed(2),
          Number(r.tarifado || 0).toFixed(2),
          r.ppccDisplay,
          Number(r.tarifa || 0).toFixed(2),
          Number(r.fleteawb || 0).toFixed(2),
          Number(r.totalflete || 0).toFixed(2),
          Number(r.dueagent || 0).toFixed(2),
          Number(r.dbf || 0).toFixed(2),
          Number(r.duecarrier || 0).toFixed(2),
          Number(r.security || 0).toFixed(2),
          Number(r.incentivo || 0).toFixed(2),
          Number(r.total || 0).toFixed(2),
        ];

        valores.forEach((v, i) => {
          page.drawText(String(v), {
            x: x + 3,
            y: y - 12,
            size: 10,
            font,
            color: negro,
          });
          x += colWidths[i];
        });

        y -= rowHeight;
      });

      y -= 20;

      // Total de la tabla a la derecha
      const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
      const totalX = startX + totalTableWidth - 150;

      page.drawText(title === "COLLECT" ? "A Cobrar:" : "A Pagar:", {
        x: totalX,
        y,
        size: 12,
        font: bold,
        color: azul,
      });
      page.drawText(total.toFixed(2), {
        x: totalX + 100,
        y,
        size: 12,
        font: bold,
        color: azul,
      });

      y -= 30;
    };

    // Dibujar tablas solo si tienen datos
    drawTable(collectData, "COLLECT", totalCollect);
    drawTable(prepaidData, "PREPAID", totalPrepaid);

    // Total final resaltado con recuadro a la derecha
    const totalFinalX = startX + colWidths.reduce((a, b) => a + b, 0) - 200;
    page.drawRectangle({
      x: totalFinalX,
      y: y - 22,
      width: 200,
      height: 22,
      color: azul,
    });
    page.drawText("Total a Pagar", {
      x: totalFinalX + 10,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(totalFinal.toFixed(2), {
      x: totalFinalX + 200 - 60,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte_Exportacion_${desde}_a_${hasta}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando el PDF");
  }
});

app.get("/api/reportedeembarquependienteimpo/pdf", async (req, res) => {
  try {
    const { desde, hasta, cliente, tipoPago, aerolinea } = req.query;
    console.log("reportedeembarquependiente, Parámetros recibidos:", { desde, hasta, cliente, tipoPago });

    // Mapear tipoPago a la base de datos
    let tipoFiltro = "";
    if (tipoPago?.toLowerCase() === "cc") tipoFiltro = "C"; // Collect
    else if (tipoPago?.toLowerCase() === "pp") tipoFiltro = "P"; // Prepaid

    // Query SQL con filtros dinámicos
    const sql = `
      SELECT 
        g.guia AS awb,
        DATE_FORMAT(g.emision, '%d/%m/%Y') AS emision,
        v.vuelo AS vuelo,
        DATE_FORMAT(g.fechavuelo, '%d/%m/%Y') AS fecha,
        g.destinoguia AS destino,
        g.peso AS peso,
        g.pesovolumetrico AS volumetrico,
        g.tipodepagoguia AS ppcc,
        g.tarifa,
        g.flete AS totalflete,
        g.dueagent,
        g.duecarrier,
        g.verificacion,
        g.collectfee,
        g.total
      FROM guiasimpo g
      LEFT JOIN vuelos v ON v.idVuelos = g.nrovuelo
      WHERE 1=1
        AND g.facturada = 0
        AND g.Tipo = 'IMPO'
        ${cliente ? " AND g.consignatario = ?" : ""}
        ${tipoFiltro ? " AND g.tipodepagoguia = ?" : ""}
        ${desde && hasta ? " AND g.emision BETWEEN ? AND ?" : ""}
        ${aerolinea && aerolinea.toLowerCase() !== "all" ? " AND v.compania = ?" : ""}
      ORDER BY g.emision ASC
    `;

    // Parámetros dinámicos
    const params = [
      ...(cliente ? [cliente] : []),
      ...(tipoFiltro ? [tipoFiltro] : []),
      ...(desde && hasta ? [desde, hasta] : []),
      ...(aerolinea && aerolinea.toLowerCase() !== "all" ? [aerolinea] : []),
    ];
    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return res.status(404).send("No se encontraron datos para el filtro indicado.");
    }

    // Separar Collect y Prepaid usando el valor real de la base
    const collectData = [];
    const prepaidData = [];

    rows.forEach(r => {
      r.incentivo = Number(r.fleteawb || 0) - Number(r.totalflete || 0);

      // Para mostrar en la tabla
      r.ppccDisplay = r.ppcc === "P" ? "PREPAID" : "COLLECT";

      // Separar según valor real
      if (r.ppcc === "C") collectData.push(r);
      else if (r.ppcc === "P") prepaidData.push(r);
    });

    const totalCollect = collectData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalPrepaid = prepaidData.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const totalFinal = totalPrepaid - totalCollect;

    // Crear PDF A3 horizontal
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([1191, 842]);
    let imageFile = "AirEuropa.jpg"; // valor por defecto

    if (aerolinea?.toUpperCase() === "AIRCLASS") {
      imageFile = "Airclass.jpg";
    } else if (aerolinea?.toUpperCase() === "ALL") {
      imageFile = null; // sin imagen
    }

    // --- SOLO si hay imagen se ejecuta este bloque ---
    if (imageFile) {
      const imagePath = path.join(__dirname, "Img", imageFile);
      const imageBytes = fs.readFileSync(imagePath);

      const jpgImage = await pdfDoc.embedJpg(imageBytes);

      const imgWidth = 160;
      const imgHeight = (jpgImage.height / jpgImage.width) * imgWidth;

      page.drawImage(jpgImage, {
        x: 1191 - imgWidth - 40,
        y: page.getHeight() - imgHeight - 40,
        width: imgWidth,
        height: imgHeight,
      });
    }

    const { height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const azul = rgb(0.12, 0.31, 0.47);
    const gris = rgb(0.95, 0.95, 0.95);
    const negro = rgb(0, 0, 0);

    let y = height - 60;

    // Encabezado
    page.drawText("Reporte de Importación", {
      x: 480,
      y,
      size: 20,
      font: bold,
      color: negro,
    });

    y -= 40;

    const datos = [
      ["Cliente:", cliente || "-"],
      ["Desde:", desde || "-"],
      ["Hasta:", hasta || "-"],
      ["Base:", "MVD"],
    ];

    datos.forEach(([k, v]) => {
      page.drawText(k, { x: 50, y, size: 12, font: bold });
      page.drawText(v, { x: 130, y, size: 12, font });
      y -= 18;
    });

    y -= 10;

    const headers = [
      "Número AWB", "Emisión", "Vuelo", "Fecha", "Destino",
      "Peso Bruto", "Peso Tarifado", "PP/CC", "Tarifa Neta",
      "Flete AWB", "Total Flete", "Due Agent", "DBF",
      "Due Carrier", "Security", "Incentivo", "Total",
    ];

    const colWidths = [
      77, 65, 54, 65, 54, 60, 71, 60, 54, 60, 65, 65, 42, 71, 60, 71, 60,
    ];
    const startX = (1191 - colWidths.reduce((a, b) => a + b, 0)) / 2;

    const drawTable = (dataArray, title, total) => {
      if (!dataArray.length) return; // no dibuja si no hay datos

      const marginTop = 50; // margen superior al crear nueva página
      const rowHeight = 17;
      const headerHeight = 22;
      const titleHeight = 20;

      // Función para agregar página nueva si y es demasiado bajo
      const checkNewPage = () => {
        if (y < 50) { // 50px margen inferior
          const newPage = pdfDoc.addPage([1191, 842]);
          y = newPage.getSize().height - marginTop;
          page = newPage; // reemplaza la página actual
        }
      };

      let x = startX;
      y -= 30;

      // Título tabla
      page.drawText(title, { x: startX, y, size: 14, font: bold, color: azul });
      y -= titleHeight;

      // Cabecera
      x = startX;
      headers.forEach((h, i) => {
        checkNewPage();
        page.drawRectangle({
          x,
          y: y - headerHeight,
          width: colWidths[i],
          height: headerHeight,
          color: azul,
        });
        page.drawText(h, {
          x: x + 3,
          y: y - 15,
          size: 10,
          font: bold,
          color: rgb(1, 1, 1),
        });
        x += colWidths[i];
      });
      y -= headerHeight;

      // Filas
      dataArray.forEach((r, idx) => {
        checkNewPage();

        const colorFondo = idx % 2 === 0 ? gris : rgb(1, 1, 1);
        x = startX;

        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: colWidths.reduce((a, b) => a + b, 0),
          height: rowHeight,
          color: colorFondo,
        });

        const valores = [
          r.awb,
          r.emision,
          r.vuelo,
          r.fecha,
          r.destino,
          Number(r.peso || 0).toFixed(2),
          Number(r.tarifado || 0).toFixed(2),
          r.ppccDisplay,
          Number(r.tarifa || 0).toFixed(2),
          Number(r.fleteawb || 0).toFixed(2),
          Number(r.totalflete || 0).toFixed(2),
          Number(r.dueagent || 0).toFixed(2),
          Number(r.dbf || 0).toFixed(2),
          Number(r.duecarrier || 0).toFixed(2),
          Number(r.security || 0).toFixed(2),
          Number(r.incentivo || 0).toFixed(2),
          Number(r.total || 0).toFixed(2),
        ];

        valores.forEach((v, i) => {
          page.drawText(String(v), {
            x: x + 3,
            y: y - 12,
            size: 10,
            font,
            color: negro,
          });
          x += colWidths[i];
        });

        y -= rowHeight;
      });

      y -= 20;

      // Total de la tabla a la derecha
      const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
      const totalX = startX + totalTableWidth - 150;

      page.drawText(title === "COLLECT" ? "A Cobrar:" : "A Pagar:", {
        x: totalX,
        y,
        size: 12,
        font: bold,
        color: azul,
      });
      page.drawText(total.toFixed(2), {
        x: totalX + 100,
        y,
        size: 12,
        font: bold,
        color: azul,
      });

      y -= 30;
    };

    // Dibujar tablas solo si tienen datos
    drawTable(collectData, "COLLECT", totalCollect);
    drawTable(prepaidData, "PREPAID", totalPrepaid);

    // Total final resaltado con recuadro a la derecha
    const totalFinalX = startX + colWidths.reduce((a, b) => a + b, 0) - 200;
    page.drawRectangle({
      x: totalFinalX,
      y: y - 22,
      width: 200,
      height: 22,
      color: azul,
    });
    page.drawText("Total a Pagar", {
      x: totalFinalX + 10,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(totalFinal.toFixed(2), {
      x: totalFinalX + 200 - 60,
      y: y - 16,
      size: 12,
      font: bold,
      color: rgb(1, 1, 1),
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte_Exportacion_${desde}_a_${hasta}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando el PDF");
  }
});

app.delete("/api/eliminarRecibo/:id", async (req, res) => {
  const { id } = req.params;

  console.log('Recibo a Eliminar:', id);
  try {
    // 1. Obtener info del recibo (para validar)
    const [recibo] = await pool.query("SELECT * FROM recibos WHERE idrecibo = ?", [id]);
    if (recibo.length === 0) {
      return res.status(404).json({ mensaje: "Recibo no encontrado" });
    }

    const nrorecibo = recibo[0].nrorecibo;

    // Eliminar movimientos de cuenta_corriente asociados al recibo
    await pool.query("DELETE FROM cuenta_corriente WHERE NumeroRecibo = ?", [String(nrorecibo)]);

    // Desasociar facturas
    await pool.query("UPDATE facturas SET idrecibo = NULL WHERE idrecibo = ?", [id]);

    //  Eliminar el recibo
    await pool.query("DELETE FROM recibos WHERE idrecibo = ?", [id]);

    console.log(`Recibo ${id} eliminado correctamente`);
    return res.json({ mensaje: "Recibo eliminado correctamente", idrecibo: id });

  } catch (err) {
    console.error("Error eliminando recibo:", err);
    return res.status(500).json({ mensaje: "Error eliminando recibo", error: err.message });
  }
});


app.post('/api/obtenerSaldoClienteVerificacion', async (req, res) => {
  // Aseguramos que la variable 'pool' esté definida en el alcance superior para la conexión a MySQL

  const { idCliente } = req.body;

  if (!idCliente) {
    return res.status(400).json({ error: 'Falta el ID del cliente.' });
  }

  const sql = `
    SELECT 
      Saldo, 
      usuariomodificasaldo, 
      DATE_FORMAT(fechamodificasaldo, '%Y-%m-%d %H:%i:%s') AS fechamodificasaldo
    FROM clientes
    WHERE Id = ?
  `;

  try {
    const [rows] = await pool.query(sql, [idCliente]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const clienteData = rows[0];
    const {
      Saldo,
      usuariomodificasaldo: usuarioModifica,
      fechamodificasaldo: fechaModifica
    } = clienteData;

    const saldoNum = Number(Saldo); // o saldoNum = parseFloat(Saldo);

    if ((usuarioModifica === null && fechaModifica === null) && (!saldoNum || saldoNum === 0)) {
      return res.json({ tieneSaldo: false });
    }
    // ---------------------------------------

    // Si al menos uno de los campos tiene valor, se considera que tiene un saldo registrado (incluso si es 0)
    res.status(200).json({
      tieneSaldo: true,
      saldo: Saldo, // Usamos la variable Saldo del resultado de la consulta
      usuariomodificasaldo: usuarioModifica,
      fechamodificasaldo: fechaModifica
    });
  } catch (err) {
    console.error('Error al obtener saldo del cliente:', err);
    res.status(500).json({ error: 'Error al obtener saldo del cliente.' });
  }
});

app.post('/api/actualizarSaldoCliente', async (req, res) => {
  const { idCliente, saldo, usuario } = req.body;

  if (!idCliente || saldo == null || isNaN(saldo)) {
    return res.status(400).json({ error: 'Datos inválidos para actualizar saldo.' });
  }

  const sql = `
    UPDATE clientes
    SET Saldo = ?, usuariomodificasaldo = ?, fechamodificasaldo = NOW()
    WHERE Id = ?
  `;

  try {
    await pool.query(sql, [saldo, usuario || 'Sistema', idCliente]);
    res.status(200).json({ mensaje: 'Saldo actualizado correctamente.' });
  } catch (err) {
    console.error('Error al actualizar saldo del cliente:', err);
    res.status(500).json({ error: 'Error al actualizar saldo del cliente.' });
  }
});
app.post('/api/obtenerClientePorCodigoGia', async (req, res) => {
  const { codigoGia } = req.body; // recibimos CodigoGIA

  if (!codigoGia) {
    return res.status(400).json({ error: 'Falta el CodigoGIA del cliente.' });
  }

  const sql = `
    SELECT *
    FROM clientes
    WHERE CodigoGIA = ?
    LIMIT 1
  `;

  try {
    const [rows] = await pool.query(sql, [codigoGia]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Devuelve el cliente completo
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error al obtener cliente por CodigoGIA:', err);
    res.status(500).json({ error: 'Error al obtener cliente.' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.status(200).send('Server is running');
});
app.get('/', (req, res) => {
  res.send('Este es el backend V 1.1 01/12/25');
});

