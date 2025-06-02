const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const { NumeroALetras } = require('./numeroALetras');
const axios = require('axios');
const xml2js = require('xml2js');
const { generarXmlefacimpopp, generarXmlefacCuentaAjenaimpopp } = require('./ControladoresGFE/controladoresGfe')
const { obtenerDatosEmpresa } = require('./ControladoresGFE/datosdelaempresaGFE')
const cron = require('node-cron');
const { Console } = require('console');

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}
// Configura la conexión a tu servidor MySQL flexible de Azure
const connection = mysql.createConnection({
  host: 'cielosurinvoicedb.mysql.database.azure.com', // Tu servidor MySQL flexible de Azure
  user: 'cielosurdb', // El usuario que creaste para la base de datos
  password: 'nujqeg-giwfes-6jynzA', // La contraseña del usuario
  database: 'cielosurinvoiceprod', // El nombre de la base de datos
  port: 3306, // Puerto predeterminado de MySQL
  connectTimeout: 60000,
});
// Probar la conexión
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
cron.schedule('25 17 * * *', () => {
  console.log('⏰ Ejecutando cierre diario...');

  // Consulta para contar guías sin facturar
  const queryGuias = `
    SELECT COUNT(*) AS guias FROM (
      SELECT guia FROM guiasimpo WHERE facturada = 0
      UNION ALL
      SELECT guia FROM guiasexpo WHERE facturada = 0
    ) AS total_guias;
  `;

  // Consulta para contar facturas sin cobrar
  const queryFacturas = `
    SELECT COUNT(*) AS facturas FROM facturas WHERE idrecibo IS NULL;
  `;

  connection.query(queryGuias, (err, resultGuias) => {
    if (err) return console.error('Error al contar guías:', err);

    const guias = resultGuias[0].guias;

    connection.query(queryFacturas, (err, resultFacturas) => {
      if (err) return console.error('Error al contar facturas:', err);

      const facturas = resultFacturas[0].facturas;

      const insertQuery = `
        INSERT INTO cierre_diario (fecha, guias_sin_facturar, facturas_sin_cobrar)
        VALUES (CURDATE(), ?, ?)
        ON DUPLICATE KEY UPDATE 
          guias_sin_facturar = VALUES(guias_sin_facturar),
          facturas_sin_cobrar = VALUES(facturas_sin_cobrar)
      `;

      connection.query(insertQuery, [guias, facturas], (err, resultInsert) => {
        if (err) return console.error('Error al guardar cierre diario:', err);
        console.log('✅ Cierre diario guardado:', new Date().toLocaleString());
      });
    });
  });
});

app.get('/api/cierre_diario', (req, res) => {
  const query = `
    SELECT fecha, guias_sin_facturar, facturas_sin_cobrar
    FROM cierre_diario
    WHERE fecha >= CURDATE() - INTERVAL 15 DAY
    ORDER BY fecha ASC
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Función para generar el mensaje en el backend
function generarMensaje(monto) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  return `Son dólares americanos U$S ${montoEnLetras}`;
}
function generarAdenda(numerodoc, monto) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  return `Doc:${numerodoc} - Son dólares americanos U$S ${montoEnLetras}`;
}

//Consulta para cargar la tabla de preview de clientes.

app.get('/api/previewclientes', (req, res) => {
  console.log('Received request for /api/previewclientes'); // Agrega esta línea
  const sql = 'SELECT * FROM clientes ORDER BY Id DESC';

  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'An error occurred while fetching clients.' });
    }

    // Envía todos los resultados de la consulta al frontend
    res.status(200).json(result);
  });
});
app.get('/api/previewfacturas', (req, res) => {
  console.log('Received request for /api/previewfacturas');
  const sql = 'SELECT * FROM facturas ORDER BY Fecha DESC';

  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el backend cargando facturas' });
    }

    // Formatear la fecha en cada resultado
    const formattedResult = result.map((row) => {
      const fecha = new Date(row.Fecha);
      const formattedFecha = fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      return { ...row, Fecha: formattedFecha };
    });

    res.status(200).json(formattedResult);
  });
});


//Armado de la consulta Insert Cliente

// Ruta para insertar un cliente y su cuenta corriente
app.post('/api/insertclientes', async (req, res) => {
  console.log('Received request for /api/insertclientes');
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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
  connection.query(verificarRazonSocialQuery, [RazonSocial], async (error, results) => {
    if (error) {
      console.error('Error al verificar la razón social:', error);
      return res.status(500).json({ error: 'Error al verificar la razón social' });
    }

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

        connection.query(insertClienteQuery, [
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
        ], (err, results) => {
          if (err) {
            console.error('Error al insertar el cliente:', err);
            return res.status(500).json({ error: 'Error al insertar el cliente' });
          }

          return res.status(200).json({
            message: 'Cliente insertado correctamente',
            codigoGia: CodigoGIA
          });
        });
      } else {
        return res.status(500).json({ error: 'Respuesta del WS inválida: no se encontró xmlResultado' });
      }
    } catch (error) {
      console.error('Error al enviar solicitud SOAP:', error.message);
      return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
    }
  });
});

// Endpoint para actualizar un cliente
app.put('/api/actualizarcliente/:id', async (req, res) => {
  const id = req.params.id; // Obtener el ID del cliente de la URL
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error actualizando cliente:', err);
        return res.status(500).json({ message: 'Error actualizando cliente' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente No encontrado' });
      }

      res.status(200).json({ message: 'Cliente modificado correctamente en WS y BD' });
    });
  } catch (error) {
    console.error('Error al enviar solicitud SOAP:', error.message);
    return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
  }
});


//Armando Endpoint para eliminar Cliente

app.delete('/api/deleteclientes', async (req, res) => {
  console.log('Received request for /api/deleteclientes');
  const { Id, CodigoGIA } = req.body; // Se requiere el código GIA además del Id
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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

    connection.query(deleteClienteQuery, [Id], (err, results) => {
      if (err) {
        console.error('Error al eliminar el cliente en la base de datos:', err);
        return res.status(500).json({ error: 'Error al eliminar el cliente en la base de datos' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado en la base de datos' });
      }

      console.log('Cliente eliminado:', results.affectedRows);
      res.status(200).json({
        message: 'Cliente eliminado correctamente en WS y base de datos',
        descripcionWS: descripcion
      });
    });
  } catch (error) {
    console.error('Error al enviar solicitud SOAP:', error.message);
    return res.status(500).json({ error: 'Error al enviar solicitud SOAP' });
  }
});


//Obtener datos para modificar cliente.
app.get('/api/obtenerclientes/:id', (req, res) => {
  console.log('Received request for /api/obtenerclientes/' + req.params.id);
  const { id } = req.params; // Obtener el ID del cliente desde la URL

  // Consulta para obtener el cliente por ID
  const getClienteQuery = `
      SELECT * FROM clientes
      WHERE Id = ?
  `;

  connection.query(getClienteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el cliente:', err);
      return res.status(500).json({ error: 'Error al obtener el cliente' });
    }

    if (results.length > 0) {
      console.log('Cliente encontrado:', results[0]);
      // Respuesta exitosa con los datos del cliente
      res.status(200).json(results[0]);
    } else {
      // Si no se encuentra el cliente
      console.log('Cliente no encontrado');
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  });
});

app.post('/api/guardar-datos-empresa', async (req, res) => {
  const { usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion } = req.body;

  try {
    const rows = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM datos_empresa LIMIT 1', (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });

    if (rows.length > 0) {
      // Ya hay datos → Hacer UPDATE
      await new Promise((resolve, reject) => {
        connection.query(
          `UPDATE datos_empresa SET usuarioGfe = ?, passwordGfe = ?, codigoEmpresa = ?, contraseñaEmpresa = ?, conjuntoClientes = ?, serverFacturacion = ?`,
          [usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion],
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });

      res.send('Datos actualizados correctamente');
    } else {
      // No hay datos → Hacer INSERT
      await new Promise((resolve, reject) => {
        connection.query(
          `INSERT INTO datos_empresa (usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion) VALUES (?, ?, ?, ?, ?, ?)`,
          [usuarioGfe, passwordGfe, codigoEmpresa, contraseñaEmpresa, conjuntoClientes, serverFacturacion],
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });

      res.send('Datos insertados correctamente');
    }
  } catch (error) {
    console.error('Error al guardar datos de empresa:', error);
    res.status(500).send('Error al guardar datos');
  }
});

app.get('/api/obtener-datos-empresa', async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM datos_empresa LIMIT 1', (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
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

app.get('/api/obtener-conceptos', (req, res) => {
  connection.query('SELECT * FROM conceptos', (error, results) => {
    if (error) {
      console.error('Error al obtener conceptos:', error);
      return res.status(500).json({ error: 'Error al obtener conceptos' });
    }
    res.json(results);
  });
});



// Endpoint para buscar clientes
app.get('/api/obtenernombrecliente', (req, res) => {
  const search = req.query.search;
  const query = 'SELECT * FROM clientes WHERE RazonSocial LIKE ?';
  connection.query(query, [`%${search}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results);
  });
});

app.post('/api/validarlogin', async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
    connection.query(sql, [usuario], async (err, results) => {
      if (err) {
        console.error('Error al consultar usuario:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

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
    });
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
    const saltRounds = 10; // Define el número de rondas de sal para el hash
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Consulta para insertar un nuevo usuario con la contraseña hasheada
    const insertUsuarioQuery = `
      INSERT INTO usuarios (usuario, contraseña, rol)
      VALUES (?, ?, ?)
    `;

    // Ejecutar la inserción del usuario con la contraseña hasheada
    connection.query(insertUsuarioQuery, [usuario, hashedPassword, rol], (err, results) => {
      if (err) {
        console.error('Error al insertar el usuario:', err);
        return res.status(500).json({ error: 'Error al insertar el usuario' });
      }
      // Respuesta exitosa
      res.status(200).json({ message: 'Usuario insertado exitosamente' });
    });
  } catch (error) {
    console.error('Error al hashear la contraseña:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

//Consulta para cargar la tabla de preview de clientes.

app.get('/api/previewusuarios', (req, res) => {
  console.log('Received request for /api/previewclientes'); // Agrega esta línea
  const sql = 'SELECT * FROM usuarios';

  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'An error occurred while fetching clients.' });
    }

    // Envía todos los resultados de la consulta al frontend
    res.status(200).json(result);
  });
});

//Obtener datos para modificar cliente.
app.get('/api/obtenerusuario/:id', (req, res) => {
  console.log('Received request for /api/obtenerclientes/' + req.params.id);
  const { id } = req.params; // Obtener el ID del cliente desde la URL

  // Consulta para obtener el cliente por ID
  const getClienteQuery = `
      SELECT * FROM usuarios
      WHERE id = ?
  `;

  connection.query(getClienteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el Usuario:', err);
      return res.status(500).json({ error: 'Error al obtener el Usuario' });
    }

    if (results.length > 0) {
      console.log('Usuario encontrado:', results[0]);
      // Respuesta exitosa con los datos del cliente
      res.status(200).json(results[0]);
    } else {
      // Si no se encuentra el cliente
      console.log('Usuario no encontrado');
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  });
});

// Endpoint para actualizar un cliente
app.put('/api/actualizarusuario/:id', (req, res) => {
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

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error actualizando cliente:', err);
      return res.status(500).json({ message: 'Error actualizando cliente' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente No encontrado' });
    }
    res.status(200).json({ message: 'Cliente Modificado Correctamente' });
  });
});
app.delete('/api/deleteusuario', async (req, res) => {
  const { Id } = req.body;

  try {
    // 1. Buscar el rol del usuario
    const usuarioRows = await queryAsync('SELECT rol FROM usuarios WHERE id = ?', [Id]);

    if (!usuarioRows || usuarioRows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const rolUsuario = usuarioRows[0].rol;

    // 2. Verificar si es el último admin
    if (rolUsuario === 'admin') {
      const adminRows = await queryAsync('SELECT COUNT(*) AS total FROM usuarios WHERE rol = "admin"');
      const totalAdmins = adminRows[0].total;

      if (totalAdmins <= 1) {
        return res.status(400).json({ mensaje: 'No se puede eliminar al último usuario administrador' });
      }
    }

    // 3. Eliminar el usuario
    await queryAsync('DELETE FROM usuarios WHERE id = ?', [Id]);

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
    await connection.query('INSERT INTO vuelos (vuelo, compania) VALUES (?, ?)', [vuelo, compania]);
    res.status(201).send('Vuelo agregado correctamente');
  } catch (error) {
    console.error('Error al agregar vuelo:', error);
    res.status(500).send('Error al agregar vuelo');
  }
});

// Define el endpoint para obtener los vuelos
app.get('/api/previewvuelos', (req, res) => {
  const query = 'SELECT * FROM vuelos'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener vuelos:', error);
      res.status(500).json({ error: 'Error al obtener vuelos' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
// Define el endpoint para obtener vuelos
app.get('/api/obtenervuelos', (req, res) => {
  const query = 'SELECT * FROM vuelos'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener vuelos:', error);
      res.status(500).json({ error: 'Error al obtener vuelos' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
//elimina el vuelo
app.delete('/api/eliminarvuelo/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM vuelos WHERE idVuelos = ?';

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar vuelo:', error);
      res.status(500).json({ error: 'Error al eliminar vuelo' });
    } else {
      res.status(200).json({ message: 'Vuelo eliminado correctamente' });
    }
  });
});

//agrega un ciudad a la bd
app.post('/api/agregarCiudad', async (req, res) => {
  const { ciudad } = req.body;
  try {
    // Inserta el vuelo en la base de datos. Actualiza esta lógica según tu configuración
    await connection.query('INSERT INTO ciudades (ciudad) VALUES (?)', [ciudad]);
    res.status(201).send('Ciudad agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la ciudad:', error);
    res.status(500).send('Error al agregar Ciudad');
  }
});
// Define el endpoint para obtener ciudades
app.get('/api/obtenerciudades', (req, res) => {
  const query = 'SELECT ciudad FROM ciudades'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener ciudades:', error);
      res.status(500).json({ error: 'Error al obtener ciudades' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});

// Define el endpoint para obtener ciudades
app.get('/api/previewciudades', (req, res) => {
  const query = 'SELECT * FROM ciudades'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener ciudades:', error);
      res.status(500).json({ error: 'Error al obtener ciudades' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
//elimina la ciudad
app.delete('/api/eliminarciudad/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM ciudades WHERE idciudades = ?';

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar ciudad:', error);
      res.status(500).json({ error: 'Error al eliminar ciudad' });
    } else {
      res.status(200).json({ message: 'Ciudad eliminada correctamente' });
    }
  });
});

//agrega una moneda a la bd
app.post('/api/agregarMoneda', async (req, res) => {
  const { moneda } = req.body;
  try {
    // Inserta el vuelo en la base de datos. Actualiza esta lógica según tu configuración
    await connection.query('INSERT INTO monedas (moneda) VALUES (?)', [moneda]);
    res.status(201).send('Moneda agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la moneda:', error);
    res.status(500).send('Error al agregar moneda');
  }
});

// Define el endpoint para obtener monedas
app.get('/api/previewmonedas', (req, res) => {
  const query = 'SELECT * FROM monedas'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener monedas:', error);
      res.status(500).json({ error: 'Error al obtener monedas' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
// Define el endpoint para obtener monedas
app.get('/api/obtenermonedas', (req, res) => {
  const query = 'SELECT moneda FROM monedas'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener monedas:', error);
      res.status(500).json({ error: 'Error al obtener monedas' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
//elimina la moneda
app.delete('/api/eliminarmoneda/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM monedas WHERE idmonedas = ?';

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar moneda:', error);
      res.status(500).json({ error: 'Error al eliminar moneda' });
    } else {
      res.status(200).json({ message: 'Moneda eliminada correctamente' });
    }
  });
});
//--------------------------------------------------------------------------------------------------------------------
//agrega una moneda a la bd
app.post('/api/agregarCompania', async (req, res) => {
  const { compania } = req.body;
  try {
    // Inserta el vuelo en la base de datos. Actualiza esta lógica según tu configuración
    await connection.query('INSERT INTO companias (compania) VALUES (?)', [compania]);
    res.status(201).send('Compañia agregada correctamente');
  } catch (error) {
    console.error('Error al agregar la Compañia:', error);
    res.status(500).send('Error al agregar Compañia');
  }
});

// Define el endpoint para obtener monedas
app.get('/api/previewcompanias', (req, res) => {
  const query = 'SELECT * FROM companias'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener compañias:', error);
      res.status(500).json({ error: 'Error al obtener compañias' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
// Define el endpoint para obtener monedas
app.get('/api/obtenercompanias', (req, res) => {
  const query = 'SELECT compania FROM companias'; // Cambia el nombre de la tabla si es diferente

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener companias:', error);
      res.status(500).json({ error: 'Error al obtener companias' });
    } else {
      res.status(200).json(results); // Envía los resultados como respuesta JSON
    }
  });
});
//elimina la moneda
app.delete('/api/eliminarcompania/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM companias WHERE idcompanias = ?';

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar compañia:', error);
      res.status(500).json({ error: 'Error al eliminar compañia' });
    } else {
      res.status(200).json({ message: 'Compañia eliminada correctamente' });
    }
  });
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
    // Consulta SQL para verificar si el número de guía ya existe
    const checkGuiaQuery = 'SELECT * FROM guiasimpo WHERE guia = ?';

    // Verificamos si la guía ya existe
    connection.query(checkGuiaQuery, [ginroguia], (err, results) => {
      if (err) {
        console.error('Error al verificar la guía:', err);
        return res.status(500).json({ error: 'Error al verificar la guía' });
      }

      // Si ya existe la guía, retornamos un error con un mensaje específico
      if (results.length > 0) {
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
      connection.query(insertGuiaQuery, [
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
      ], (err, results) => {
        if (err) {
          console.error('Error al insertar la guía:', err);
          return res.status(500).json({ error: 'Error al insertar la guía' });
        }

        // Respuesta exitosa
        res.status(200).json({ message: 'Guía insertada exitosamente' });
      });
    });
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
      SELECT guia, consignatario, total, tipodepagoguia
      FROM guiasimpo
      WHERE nrovuelo = ? AND fechavuelo = ?
      ORDER BY fechaingresada DESC
    `;

    // Ejecutar la consulta para obtener las guías según los filtros
    connection.query(fetchGuiasQuery, [vueloSeleccionado, givuelofecha], (err, results) => {
      if (err) {
        console.error('Error al obtener las guías:', err);
        return res.status(500).json({ error: 'Error al obtener las guías' });
      }

      // Responder con las guías encontradas
      res.status(200).json(results);
    });
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
      SELECT guia, agente, total, tipodepago
      FROM guiasexpo
      WHERE nrovuelo = ? AND fechavuelo = ?
      ORDER BY fechaingresada DESC
    `;

    // Ejecutar la consulta para obtener las guías según los filtros
    connection.query(fetchGuiasQuery, [vueloSeleccionado, gevuelofecha], (err, results) => {
      if (err) {
        console.error('Error al obtener las guías:', err);
        return res.status(500).json({ error: 'Error al obtener las guías' });
      }

      // Responder con las guías encontradas
      res.status(200).json(results);
    });
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

    // Ejecutar la consulta para obtener los detalles de la guía seleccionada
    connection.query(fetchGuiaQuery, [guia], (err, results) => {
      if (err) {
        console.error('Error al obtener la guía:', err);
        return res.status(500).json({ error: 'Error al obtener la guía' });
      }

      // Si se encuentra la guía, enviamos los datos
      if (results.length > 0) {
        res.status(200).json(results[0]); // Enviamos el primer (y único) resultado
      } else {
        res.status(404).json({ message: 'Guía no encontrada' });
      }
    });
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

    // Ejecutar la consulta para obtener los detalles de la guía seleccionada
    connection.query(fetchGuiaQuery, [guia], (err, results) => {
      if (err) {
        console.error('Error al obtener la guía:', err);
        return res.status(500).json({ error: 'Error al obtener la guía' });
      }

      // Si se encuentra la guía, enviamos los datos
      if (results.length > 0) {
        res.status(200).json(results[0]); // Enviamos el primer (y único) resultado
      } else {
        res.status(404).json({ message: 'Guía no encontrada' });
      }
    });
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
    connection.query(updateGuiaQuery, [
      nrovuelo, fechavuelo, origenvuelo, emision, consignatario, origenguia,
      conexionguia, destinoguia, tipodepagoguia, mercaderia, piezas, peso, pesovolumetrico,
      moneda, arbitraje, tarifa, fleteoriginal, dcoriginal, daoriginal, flete, ivas3, duecarrier,
      dueagent, verificacion, collectfee, cfiva, ajuste, total, totalguia, guia
    ], (err, result) => {
      if (err) {
        console.error('Error al actualizar la guía:', err);
        return res.status(500).json({ error: 'Error al actualizar la guía' });
      }

      // Si se actualiza correctamente
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Guía actualizada correctamente' });
      } else {
        res.status(404).json({ message: 'No se encontró la guía para actualizar' });
      }
    });
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
    connection.query(updateGuiaQuery, [
      nrovuelo, fechavuelo, origenvuelo, conexionvuelo, destinovuelo, empresavuelo,
      cass, agente, reserva, emision, tipodepago, piezas, pesobruto, pesotarifado,
      tarifaneta, tarifaventa, fleteneto, fleteawb, duecarrier, dueagent, dbf, gsa,
      security, cobrarpagar, agentecollect, total, guia
    ], (err, result) => {
      if (err) {
        console.error('Error al actualizar la guía:', err);
        return res.status(500).json({ error: 'Error al actualizar la guía' });
      }

      // Si se actualiza correctamente
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Guía actualizada correctamente' });
      } else {
        res.status(404).json({ message: 'No se encontró la guía para actualizar' });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});


app.delete('/api/eliminarGuia/:guia', async (req, res) => {
  const { guia } = req.params;
  console.log('Eliminando guia Impo', guia)

  try {
    await connection.query('DELETE FROM guiasimpo WHERE idguia = ?', [guia]);
    res.status(200).json({ message: 'Guía eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al eliminar la guía' });
  }
});

app.delete('/api/eliminarGuiaExpo/:guiaAEliminar', async (req, res) => {
  const { guiaAEliminar } = req.params;
  console.log('Eliminando guia Expo', guiaAEliminar)
  try {
    await connection.query('DELETE FROM guiasexpo WHERE idguiasexpo = ?', [guiaAEliminar]);
    res.status(200).json({ message: 'Guía eliminada exitosamente' });
  } catch (error) {
    console.error(error);
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
    connection.query(fetchGuiasQuery, (err, results) => {
      if (err) {
        console.error('Error al obtener las guías:', err);
        return res.status(500).json({ error: 'Error al obtener las guías' });
      }

      // Enviar todas las guías obtenidas
      res.status(200).json(results);
    });
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
    connection.query(fetchGuiasExpoQuery, (err, results) => {
      if (err) {
        console.error('Error al obtener las guías expo:', err);
        return res.status(500).json({ error: 'Error al obtener las guías expo' });
      }

      // Enviar todas las guías expo obtenidas
      res.status(200).json(results);
    });
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
    connection.query(checkGuiaQuery, [genroguia], (err, results) => {
      if (err) {
        console.error('Error al verificar la guía:', err);
        return res.status(500).json({ error: 'Error al verificar la guía' });
      }

      // Si ya existe la guía, retornamos un error con un mensaje específico
      if (results.length > 0) {
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
      connection.query(insertGuiaQuery, [
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
      ], (err, results) => {
        if (err) {
          console.error('Error al insertar la guía:', err);
          return res.status(500).json({ error: 'Error al insertar la guía' });
        }

        // Respuesta exitosa
        res.status(200).json({ message: 'Guía insertada exitosamente' });
      });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.get('/api/obtenertipocambio', (req, res) => {
  console.log('Received request for /api/obtenertipocambio');


  const fetchTipoCambioQuery = `
  SELECT id, DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha, tipo_cambio 
      FROM tipocambio ORDER BY tipocambio.fecha DESC
    `;

  connection.query(fetchTipoCambioQuery, (err, results) => {
    if (err) {
      console.error('Error al obtener los tipos de cambio:', err);
      return res.status(500).json({ error: 'Error al obtener los tipos de cambio' });
    }

    res.status(200).json(results);
  });
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

    // Ejecutar la consulta para insertar o actualizar el tipo de cambio
    connection.query(insertTipoCambioQuery, [fecha, tipo_cambio], (err, results) => {
      if (err) {
        console.error('Error al insertar el tipo de cambio:', err);
        return res.status(500).json({ error: 'Error al insertar el tipo de cambio' });
      }

      res.status(200).json({ message: 'Tipo de cambio agregado/actualizado correctamente' });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
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

    connection.query(checkFacturaQuery, [fechaConvertida], (err, results) => {
      if (err) {
        console.error('Error al verificar las facturas:', err);
        return res.status(500).json({ error: 'Error al verificar las facturas' });
      }

      // Si hay una factura con la misma fecha, no permitir la modificación
      if (results[0].facturaCount > 0) {
        return res.status(450).json({ error: 'No se puede modificar el tipo de cambio, ya existe una factura con la misma fecha.' });
      }

      const updateTipoCambioQuery = `
      UPDATE tipocambio
      SET  tipo_cambio = ?
      WHERE id = ?;
    `;

      // Ejecutar la consulta para actualizar el tipo de cambio
      connection.query(updateTipoCambioQuery, [tipo_cambio, id], (err, results) => {
        if (err) {
          console.error('Error al modificar el tipo de cambio:', err);
          return res.status(500).json({ error: 'Error al modificar el tipo de cambio' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Tipo de cambio no encontrado' });
        }

        res.status(200).json({ message: 'Tipo de cambio modificado correctamente' });
      });
    });
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

    connection.query(checkFacturaQuery, [fechaConvertida], (err, results) => {
      if (err) {
        console.error('Error al verificar las facturas:', err);
        return res.status(500).json({ error: 'Error al verificar las facturas' });
      }

      // Si hay una factura con la misma fecha, no permitir la modificación
      if (results[0].facturaCount > 0) {
        return res.status(450).json({ error: 'No se puede eliminar el tipo de cambio, ya que existe una factura con la misma fecha.' });
      }

      const deleteTipoCambioQuery = `
      DELETE FROM tipocambio WHERE id = ?;
    `;

      // Ejecutar la consulta para eliminar el tipo de cambio
      connection.query(deleteTipoCambioQuery, [id], (err, results) => {
        if (err) {
          console.error('Error al eliminar el tipo de cambio:', err);
          return res.status(500).json({ error: 'Error al eliminar el tipo de cambio' });
        }

        // Verificar si se eliminó algún registro
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Tipo de cambio no encontrado' });
        }

        res.status(200).json({ message: 'Tipo de cambio eliminado correctamente' });
      });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Endpoint para obtener el tipo de cambio de la fecha actual
app.get('/api/obtenertipocambioparacomprobante', (req, res) => {
  console.log('Received request for /api/obtenertipocambioparacomprobante');
  const query = 'SELECT tipo_cambio FROM tipocambio WHERE fecha = CURDATE()';

  connection.query(query, (err, results) => {
    if (err) {
      console.log('Error en la consulta');
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length === 0) {
      console.log('No hay tipo de cambio para la fecha actual');
      return res.status(400).json({ error: 'No hay tipo de cambio para la fecha actual' });
    }
    console.log(results[0].tipo_cambio);
    res.json({ tipo_cambio: results[0].tipo_cambio });
  });
});

app.get('/api/obtenerembarques', (req, res) => {
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
      WHERE g.agente = ? AND g.tipodepago = 'P' AND g.facturada <> 1
    `;
  } else {
    return res.status(400).json({ error: 'Tipo de embarque no válido' });
  }

  // Ejecutar la consulta
  connection.query(query, [clienteId], (err, results) => {
    if (err) {
      console.log('Error en la consulta:', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length === 0) {
      console.log('No se encontraron embarques para el cliente y tipo de embarque');
      return res.status(404).json({ error: 'No se encontraron embarques' });
    }

    // Si la consulta es exitosa, devolver los embarques
    console.log(results);
    res.json(results);
  });
});

app.post('/api/agregarconcepto', (req, res) => {
  console.log('Received request for /api/agregarconcepto');

  const { codigo, codigoGIA, descripcion, selectedIva } = req.body;
  console.log(codigo, codigoGIA, descripcion, selectedIva)

  if (!codigo || !descripcion || !codigoGIA || !selectedIva === undefined) {
    console.log('Faltan datos obligatorios');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = 'INSERT INTO conceptos (codigo, codigoGIA, descripcion, impuesto) VALUES (UPPER(?), ?, ?, ?)';
  const values = [codigo, codigoGIA, descripcion, selectedIva];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.log('Error en la inserción:', err);
      return res.status(500).json({ error: 'Error al agregar el concepto' });
    }

    console.log('Concepto agregado con ID:', result.insertId);
    res.json({ message: 'Concepto agregado con éxito', id: result.insertId });
  });
});
app.get('/api/previewconceptos', (req, res) => {
  console.log('Received request for /api/previewconceptos');

  const query = 'SELECT * FROM conceptos'; // Consulta para obtener todos los conceptos

  connection.query(query, (err, results) => {
    if (err) {
      console.log('Error al obtener los conceptos:', err);
      return res.status(500).json({ error: 'Error al obtener los conceptos' });
    }

    console.log('Conceptos obtenidos:', results);
    res.json(results); // Devuelve los conceptos como respuesta
  });
});
app.delete('/api/eliminarconcepto/:id', (req, res) => {
  const { id } = req.params; // Obtiene el id del concepto a eliminar

  // Asegúrate de que el ID sea un número válido antes de intentar eliminar
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de concepto inválido' });
  }

  const query = 'DELETE FROM conceptos WHERE idconcepto = ?';

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.log('Error al eliminar el concepto:', err);
      return res.status(500).json({ error: 'Error al eliminar el concepto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }

    console.log('Concepto eliminado con ID:', id);
    res.json({ message: 'Concepto eliminado con éxito' });
  });
});
app.get('/api/buscarconcepto/:codigo', (req, res) => {
  const { codigo } = req.params;
  console.log('Código recibido en backend:', codigo);
  const query = 'SELECT * FROM conceptos WHERE codigo = ?';

  connection.query(query, [codigo], (err, results) => {
    if (err) {
      console.error('Error al obtener el concepto:', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }

    res.json(results[0]); // Devuelve el primer resultado encontrado
  });
});

app.post('/api/insertfactura', async (req, res) => {
  console.log('Received request for /api/insertfactura');
  let facturaCuentaAjenaId;
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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
  // Iniciar la transacción
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al iniciar la transacción' });
    }

    console.log("Datos recibidos en el backend:", JSON.stringify(req.body, null, 2));
    // Consulta para insertar la factura
    const insertFacturaQuery = `
      INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                            ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar, CodigoClienteGia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertFacturaQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, ComprobanteElectronico,
      Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
      Redondeo, Total, TotalCobrar, CodigoGIA
    ], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error al insertar la factura:', err);
          res.status(500).json({ error: 'Error al insertar la factura' });
        });
      }

      const facturaId = result.insertId; // Obtener el ID de la factura insertada
      let adenda = generarAdenda(facturaId, TotalCobrar)
      const detalleFacturaPromises = [];
      DetalleFactura.forEach((detalle) => {
        // Insertar los detalles de la factura
        detalle.conceptos.forEach((concepto) => {
          detalleFacturaPromises.push(
            new Promise((resolve, reject) => {
              const insertDetalleQuery = `
              INSERT INTO detalle_facturas (IdFactura, Tipo, Guia, Descripcion, Moneda, Importe)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

              connection.query(insertDetalleQuery, [
                facturaId, concepto.tipo, concepto.guia, concepto.descripcion, concepto.moneda, concepto.importe
              ], (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            })
          );
        });
      });
      // Si existen conceptos en 'conceptos_cuentaajena', crear una segunda factura
      if (DetalleFactura.some(detalle => detalle.conceptos_cuentaajena && detalle.conceptos_cuentaajena.length > 0)) {
        const insertFacturaCuentaAjenaQuery = `
    INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                          ComprobanteElectronico, Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, 
                          CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

        connection.query(insertFacturaCuentaAjenaQuery, [
          IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 'efacturaca', // ComprobanteElectronico como 'efacturaca'
          Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, SubtotalCuentaAjena, IVACuentaAjena,
          RedondeoCuentaAjena, TotalCuentaAjena, TotalCobrarCuentaAjena
        ], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error al insertar la factura de cuenta ajena:', err);
              res.status(500).json({ error: 'Error al insertar la factura de cuenta ajena' });
            });
          }

          facturaCuentaAjenaId = result.insertId; // ID de la factura de cuenta ajena

          // Insertar en cuenta corriente
          const insertCuentaCorrienteQuery = `
          INSERT INTO cuenta_corriente (IdCliente, IdFactura, TipoDocumento, NumeroDocumento, Moneda, Debe, Fecha)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          connection.query(insertCuentaCorrienteQuery, [
            IdCliente, facturaCuentaAjenaId, 'Factura', facturaCuentaAjenaId, Moneda, TotalCobrarCuentaAjena, Fecha
          ], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error al insertar en cuenta corriente:', err);
                res.status(500).json({ error: 'Error al insertar en cuenta corriente' });
              });
            }

            console.log('Factura de cuenta ajena registrada en cuenta corriente con éxito.');
          });

          // Insertar detalles de la factura de cuenta ajena
          DetalleFactura.forEach((detalle) => {
            if (detalle.conceptos_cuentaajena && detalle.conceptos_cuentaajena.length > 0) {
              detalle.conceptos_cuentaajena.forEach((conceptoCuentaAjena) => {
                detalleFacturaPromises.push(
                  new Promise((resolve, reject) => {
                    const insertDetalleQuery = `
              INSERT INTO detalle_facturas (IdFactura, Tipo, Guia, Descripcion, Moneda, Importe)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

                    connection.query(insertDetalleQuery, [
                      facturaCuentaAjenaId, conceptoCuentaAjena.tipo, conceptoCuentaAjena.guia,
                      conceptoCuentaAjena.descripcion, conceptoCuentaAjena.moneda, conceptoCuentaAjena.importe
                    ], (err, result) => {
                      if (err) {
                        return reject(err);
                      }
                      resolve(result);
                    });
                  })
                );
              });
            }
          });
          console.log('EmbarquesSeleccionados:', EmbarquesSeleccionados);

        })
      }
      EmbarquesSeleccionados.forEach((embarque) => {
        console.log('EmbarquesSeleccionados:', EmbarquesSeleccionados);
        let updateGuiaQuery = '';
        let queryParams = [];
        console.log('Embarque:', embarque);

        // Verificar tipo de embarque
        if (embarque.Tipo === 'IMPO') {
          console.log(embarque.Tipo);
          // Lógica para guiasimpo
          updateGuiaQuery = `UPDATE guiasimpo SET idfactura = ?, idfacturacuentaajena = ?, facturada = 1 WHERE idguia = ?`;
          queryParams = [facturaId, facturaCuentaAjenaId, embarque.idguia];
          console.log('IMPO: Consulta y parámetros:', updateGuiaQuery, queryParams);
        } else {
          console.log('EXPO');
          // Lógica para guiasexpo
          updateGuiaQuery = `UPDATE guiasexpo SET idfactura = ?, facturada = 1 WHERE idguiasexpo = ?`;
          queryParams = [facturaId, embarque.idguiasexpo];
          console.log('EXPO: Consulta y parámetros:', updateGuiaQuery, queryParams);
        }

        // Ejecutar consulta
        connection.query(updateGuiaQuery, queryParams, (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error al actualizar la guía:', err);
              res.status(500).json({ error: 'Error al actualizar la guía' });
            });
          }
        });
      });
      Promise.all(detalleFacturaPromises)
        .then(() => {
          // Insertar la cuenta corriente
          const insertCuentaCorrienteQuery = `
            INSERT INTO cuenta_corriente (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, 
                                          Moneda, Debe)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          // Se envía TotalCobrar en "Debe" y NaN en "Haber"
          connection.query(insertCuentaCorrienteQuery, [
            IdCliente, facturaId, Fecha, 'Factura', Comprobante, Moneda, TotalCobrar
          ], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error al insertar la cuenta corriente:', err);
                res.status(500).json({ error: 'Error al insertar la cuenta corriente' });
              });
            }

            // Commit de la transacción
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Error al hacer commit de la transacción:', err);
                  res.status(500).json({ error: 'Error al hacer commit de la transacción' });
                });
              }
              const detallesFactura = DetalleFactura.flatMap((detalle) => {
                return detalle.conceptos.map((concepto) => {
                  const importeFormateado = parseFloat(concepto.importe.toFixed(2));

                  return {
                    codItem: concepto.id_concepto.toString(), // Asignamos el codItem como el id del concepto, formateado con ceros a la izquierda
                    indicadorFacturacion: importeFormateado === 0 ? "5" : "1",
                    nombreItem: concepto.descripcion, // Usamos la descripción como el nombre del item
                    cantidad: "1", // Asignamos la cantidad como "1", ya que no se especifica en los datos
                    unidadMedida: "UN", // Unidad de medida "UN"
                    precioUnitario: concepto.importe.toFixed(2), // Precio unitario del concepto, formateado con 2 decimales
                  };
                });
              });
              const detallesCuentaAjena = DetalleFactura.flatMap((detalle) => {
                return detalle.conceptos_cuentaajena.map((concepto) => {
                  const importeFormateado = parseFloat(concepto.importe.toFixed(2));

                  return {
                    codItem: concepto.id_concepto.toString(), // Código del ítem
                    indicadorFacturacion: importeFormateado === 0 ? "5" : "1", // "5" si el importe es 0, si no "1"
                    nombreItem: concepto.descripcion, // Descripción del concepto
                    cantidad: "1", // Siempre "1"
                    unidadMedida: "UN", // Unidad de medida
                    precioUnitario: concepto.importe.toFixed(2), // Importe con 2 decimales como string
                  };
                });
              });
              let adendaCUENTAAJENA = generarAdenda(facturaCuentaAjenaId, TotalCuentaAjena);
              
              const datos = {
                fechaCFE: Fecha,
                detalleFactura: detallesFactura,
                adendadoc: adenda,
                datosEmpresa: datosEmpresa,
                codigoClienteGIA: CodigoGIA
              }
              const datosEfacCuentaAjena = {
                fechaCFE: Fecha,
                detalleFacturaCuentaAjena: detallesCuentaAjena,
                adendadoc: adendaCUENTAAJENA,
                datosEmpresa: datosEmpresa,
                codigoClienteGIA: CodigoGIA
              }
              //detallesFactura.length
              console.log('ESTOS SON LOS DATOS:', datos);
              const enviarFacturaSOAP = async (xml, xmlCuentaAjena) => {
                return new Promise((resolve, reject) => {
                  axios.post('http://localhost:3000/pruebaws', { xml, xmlCuentaAjena })
                    .then(response => {
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

                      connection.query(updateQuery, [
                        doc1.fechadocumento,
                        doc1.tipodocumento,
                        doc1.seriedocumento,
                        doc1.numerodocumento,
                        doc1.pdfBase64,
                        facturaId
                      ], (err) => {
                        if (err) {
                          console.error('Error al actualizar la primera factura:', err);
                          return reject(new Error('Error al actualizar la primera factura'));
                        }

                        connection.query(updateQuery, [
                          doc2.fechadocumento,
                          doc2.tipodocumento,
                          doc2.seriedocumento,
                          doc2.numerodocumento,
                          doc2.pdfBase64,
                          facturaCuentaAjenaId
                        ], (err2) => {
                          if (err2) {
                            console.error('Error al actualizar la segunda factura:', err2);
                            return reject(new Error('Error al actualizar la segunda factura'));
                          }

                          resolve(response.data);
                        });
                      });
                    })
                    .catch(error => {
                      console.error('Error en enviarFacturaSOAP:', error.response?.data || error.message || error);
                      if (error.response && error.response.data) {
                        reject(error.response.data);
                      } else {
                        reject(new Error('Error en SOAP'));
                      }
                    });
                });
              };

              // En tu código principal:
              (async () => {
                try {
                  const xml = generarXmlefacimpopp(datos);
                  const xmlCuentaAjena = generarXmlefacCuentaAjenaimpopp(datosEfacCuentaAjena);

                  const resultadoSOAP = await enviarFacturaSOAP(xml, xmlCuentaAjena);

                  res.status(200).json(resultadoSOAP);

                } catch (error) {
                  if (typeof error === 'object' && error !== null) {
                    res.status(422).json(error);
                  } else {
                    res.status(422).json({ error: error.toString() });
                  }
                }
              })();
            });
          });
        })
        .catch((err) => {
          return connection.rollback(() => {
            console.error('Error al insertar los detalles de la factura:', err);
            res.status(500).json({ error: 'Error al insertar los detalles de la factura' });
          });
        });
    });
  });
});


app.post('/api/insertfacturamanual', (req, res) => {
  console.log('Received request for /api/insertfactura');
  const {
    IdCliente,
    Nombre,
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
    TipoIVA,
    CASS,
    TipoEmbarque,
    TC,
    Subtotal,
    IVA,
    Redondeo,
    Total,
    TotalCobrar,
    DetalleFactura
  } = req.body; // Los datos de la factura enviados desde el frontend
  // Iniciar la transacción
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al iniciar la transacción' });
    }

    console.log("Datos recibidos en el backend:", JSON.stringify(req.body, null, 2));
    // Consulta para insertar la factura
    const insertFacturaQuery = `
      INSERT INTO facturas (IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, 
                            ComprobanteElectronico, Comprobante, Electronico, Moneda, Fecha, TipoIVA, 
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertFacturaQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, ComprobanteElectronico,
      Comprobante, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
      Redondeo, Total, TotalCobrar
    ], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error al insertar la factura:', err);
          res.status(500).json({ error: 'Error al insertar la factura' });
        });
      }

      const facturaId = result.insertId; // Obtener el ID de la factura insertada
      const detalleFacturaPromises = [];
      if (Array.isArray(DetalleFactura)) {
        DetalleFactura.forEach((concepto) => {
          detalleFacturaPromises.push(
            new Promise((resolve, reject) => {
              const insertDetalleQuery = `
                  INSERT INTO detalle_facturas_manuales (IdFactura, Codigo, Descripcion, Moneda, IVA, Importe)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;
              connection.query(insertDetalleQuery, [
                facturaId, concepto.fmcodigoconcepto, concepto.fmdescripcion, concepto.fmmonedaconcepto, concepto.fmivaconcepto, concepto.fmimporte
              ], (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            })
          );
        });
      } else {
        console.error('DetalleFactura no es un array:', DetalleFactura);
        return res.status(400).json({ error: 'DetalleFactura no está bien formado' });
      }
      Promise.all(detalleFacturaPromises)
        .then(() => {
          // Insertar la cuenta corriente
          const insertCuentaCorrienteQuery = `
            INSERT INTO cuenta_corriente (IdCliente, IdFactura, Fecha, TipoDocumento, NumeroDocumento, 
                                          Moneda, Debe)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          // Se envía TotalCobrar en "Debe" y NaN en "Haber"
          connection.query(insertCuentaCorrienteQuery, [
            IdCliente, facturaId, Fecha, 'Factura', Comprobante, Moneda, TotalCobrar
          ], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error al insertar la cuenta corriente:', err);
                res.status(500).json({ error: 'Error al insertar la cuenta corriente' });
              });
            }

            // Commit de la transacción
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Error al hacer commit de la transacción:', err);
                  res.status(500).json({ error: 'Error al hacer commit de la transacción' });
                });
              }

              res.status(200).json({ message: 'Factura, detalles y cuenta corriente insertados exitosamente' });
            });
          });
        })
        .catch((err) => {
          return connection.rollback(() => {
            console.error('Error al insertar los detalles de la factura:', err);
            res.status(500).json({ error: 'Error al insertar los detalles de la factura' });
          });
        });
    });
  });
});

app.get('/api/movimientos/:idCliente', (req, res) => {
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

  connection.query(sql, [idCliente], (err, result) => {
    if (err) {
      console.error('Error al obtener movimientos:', err);
      return res.status(500).json({ message: 'An error occurred while fetching movements.' });
    }

    res.status(200).json(result);
  });
});

app.get('/api/saldo/:idCliente', (req, res) => {
  const { idCliente } = req.params;
  console.log(`Calculando saldo para el cliente ${idCliente}`);

  const sql = `
    SELECT SUM(Haber) - SUM(Debe) AS Saldo
    FROM cuenta_corriente 
    WHERE IdCliente = ? 
    AND Fecha <= CURDATE();
  `;

  connection.query(sql, [idCliente], (err, result) => {
    if (err) {
      console.error('Error al calcular saldo:', err);
      return res.status(500).json({ message: 'Error al calcular saldo.' });
    }

    // Si el resultado está vacío, retornar saldo 0
    const saldo = result[0]?.Saldo || 0;
    res.status(200).json({ saldo });
  });
});
app.get('/api/buscarfacturaporcomprobante/:comprobante', (req, res) => {
  const { comprobante } = req.params;
  const sql = `SELECT * FROM facturas WHERE Id = ?`;

  connection.query(sql, [comprobante], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al buscar la factura.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada.' });
    }

    // Comprobamos si la factura tiene un valor en el campo idrecibo
    const factura = result[0];
    if (factura.idrecibo) {
      return res.status(200).json({ message: 'Tiene Recibo.', factura: factura }); // Cambiar a 200 y enviar la factura
    }
    res.status(200).json(result[0]); // Devuelve solo la primera coincidencia
  });
});
// Ruta para insertar un recibo
app.post('/api/insertrecibo', (req, res) => {
  console.log('Received request for /api/insertrecibo');

  const {
    nrorecibo,
    fecha,
    idcliente,
    nombrecliente,
    moneda,
    importe,
    formapago,
    razonsocial,
    rut,
    direccion
  } = req.body; // Datos del recibo enviados desde el front

  // Consulta para insertar el recibo
  const insertReciboQuery = `
    INSERT INTO recibos (nrorecibo, fecha, idcliente, nombrecliente, moneda, importe, formapago, razonsocial, rut, direccion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ejecutar la inserción del recibo
  connection.query(insertReciboQuery, [nrorecibo, fecha, idcliente, nombrecliente, moneda, importe, formapago, razonsocial, rut, direccion], (err, results) => {
    if (err) {
      console.error('Error al insertar el recibo:', err);
      return res.status(500).json({ error: 'Error al insertar el recibo' });
    }
    // Respuesta exitosa con el ID del recibo insertado
    res.status(200).json({ message: 'Recibo insertado exitosamente', idrecibo: results.insertId });
  });
});


app.put('/api/actualizarFactura/:idFactura', (req, res) => {
  const { idFactura } = req.params;
  const { idrecibo } = req.body;

  console.log(`Actualizando factura ${idFactura} con idrecibo: ${idrecibo}`);

  const updateQuery = `UPDATE facturas SET idrecibo = ? WHERE Id = ?`;

  connection.query(updateQuery, [idrecibo, idFactura], (err, result) => {
    if (err) {
      console.error('Error al actualizar la factura:', err);
      return res.status(500).json({ error: 'Error al actualizar la factura' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró la factura para actualizar' });
    }

    res.status(200).json({ message: 'Factura actualizada con éxito' });
  });
});

app.post('/api/insertarCuentaCorriente', (req, res) => {
  const { idcliente, fecha, tipodocumento, numerorecibo, moneda, debe, haber } = req.body;

  const insertQuery = `
      INSERT INTO cuenta_corriente (IdCliente, Fecha, TipoDocumento, NumeroRecibo, Moneda, Debe, Haber)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(insertQuery, [idcliente, fecha, tipodocumento, numerorecibo, moneda, debe, haber], (err, result) => {
    if (err) {
      console.error('Error al insertar en cuenta corriente:', err);
      return res.status(500).json({ error: 'Error al insertar en cuenta corriente' });
    }
    res.status(200).json({ message: 'Recibo agregado a cuenta corriente' });
  });
});
app.post('/api/obtenerFacturasdesdeRecibo', (req, res) => {
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

  connection.query(sql, ids, (err, results) => {
    if (err) {
      console.error('Error al obtener facturas:', err);
      return res.status(500).json({ error: 'Error al obtener facturas.' });
    }

    res.status(200).json(results);
  });
});



app.post('/api/generarReciboPDF', async (req, res) => {
  try {
    const datosRecibo = req.body;
    console.log("Datos recibidos:", datosRecibo);
    const fecha = datosRecibo.erfecharecibo; // Suponiendo que tiene el formato "2025-02-18"
    const [year, month, day] = fecha.split('-'); // Divide la fecha en partes

    // Cargar el PDF base
    const pdfBasePath = path.join(__dirname, 'pdfs', 'recibo_base.pdf'); // Ruta del PDF base
    const pdfBytes = fs.readFileSync(pdfBasePath);

    // Cargar el PDF en PDF-Lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const primeraPagina = pages[0];

    // Insertar los datos estaticos del recibo
    primeraPagina.drawText(`Recibo N°: ${datosRecibo.ernumrecibo}`, { x: 460, y: 760, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.errut}`, { x: 310, y: 760, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${day}`, { x: 470, y: 700, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${month}`, { x: 510, y: 700, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${year}`, { x: 545, y: 700, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.errazonSocial}`, { x: 150, y: 720, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`${datosRecibo.erdireccion}`, { x: 150, y: 700, size: 12, color: rgb(0, 0, 0) });
    primeraPagina.drawText(`Recibo sobre Facturas Detalladas:`, { x: 50, y: 630, size: 12 });
    primeraPagina.drawText(`Documento:`, { x: 50, y: 610, size: 10 });
    primeraPagina.drawText(`Fecha:`, { x: 150, y: 610, size: 10 });
    primeraPagina.drawText(`Saldo:`, { x: 220, y: 610, size: 10 });
    primeraPagina.drawLine({
      start: { x: 50, y: 600 }, // Punto de inicio de la línea
      end: { x: 300, y: 600 },   // Punto final de la línea (ajusta el valor de x para cambiar el largo)
      thickness: 1,              // Grosor de la línea
      color: rgb(0, 0, 0)        // Color negro
    });
    // Verificar si 'facturas' existe y es un arreglo
    if (Array.isArray(datosRecibo.facturas)) {
      let facturaYPos = 590; // Posición Y inicial para las facturas
      datosRecibo.facturas.forEach((factura) => {
        primeraPagina.drawText(`${factura.Comprobante}`, { x: 50, y: facturaYPos, size: 10, color: rgb(0, 0, 0) });
        primeraPagina.drawText(`${factura.FechaFormateada}`, { x: 150, y: facturaYPos, size: 10, color: rgb(0, 0, 0) });
        primeraPagina.drawText(`${factura.TotalCobrar}`, { x: 220, y: facturaYPos, size: 10, color: rgb(0, 0, 0) });
        primeraPagina.drawText(`${factura.TotalCobrar}`, { x: 520, y: facturaYPos, size: 10, color: rgb(0, 0, 0) });
        facturaYPos -= 20; // Decrementar la posición Y para la siguiente factura
      });
      primeraPagina.drawText(`Banco:`, { x: 50, y: facturaYPos, size: 10 });
      primeraPagina.drawText(`Vencimiento:`, { x: 150, y: facturaYPos, size: 10 });
      primeraPagina.drawText(`Nro.Documento:`, { x: 220, y: facturaYPos, size: 10 });
      primeraPagina.drawText(`Moneda:`, { x: 310, y: facturaYPos, size: 10 });
      primeraPagina.drawText(`Arbitraje:`, { x: 371, y: facturaYPos, size: 10 });
      primeraPagina.drawText(`Importe:`, { x: 435, y: facturaYPos, size: 10 });
      primeraPagina.drawLine({
        start: { x: 50, y: facturaYPos - 10 }, // Punto de inicio de la línea
        end: { x: 470, y: facturaYPos - 10 },   // Punto final de la línea (ajusta el valor de x para cambiar el largo)
        thickness: 1,              // Grosor de la línea
        color: rgb(0, 0, 0)        // Color negro
      });
      if (Array.isArray(datosRecibo.listadepagos)) {
        let pagosYPos = facturaYPos - 20; // Posición Y inicial para las facturas
        datosRecibo.listadepagos.forEach((pago) => {
          primeraPagina.drawText(`${pago.icbanco.toUpperCase()}`, { x: 50, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icfechavencimiento}`, { x: 150, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icnrocheque}`, { x: 220, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.ictipoMoneda}`, { x: 310, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${datosRecibo.arbitraje}`, { x: 371, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          primeraPagina.drawText(`${pago.icimpdelcheque}`, { x: 435, y: pagosYPos, size: 10, color: rgb(0, 0, 0) });
          pagosYPos -= 20; // Decrementar la posición Y para la siguiente factura
        });
        //Sumo todos los improes
        let montototalpagos = datosRecibo.totalrecibo;
        let montoenletras = generarMensaje(montototalpagos);
        primeraPagina.drawText(`${montoenletras}`, { x: 50, y: pagosYPos, size: 10 });
        primeraPagina.drawText(`${datosRecibo.totalrecibo}`, { x: 520, y: 50, size: 10, color: rgb(0, 0, 0) });
      } else {
        console.error("No se encontraron pagos en los datos recibidos.", datosRecibo.listadepagos);
      }

    } else {
      console.error("No se encontraron facturas en los datos recibidos.", datosRecibo.facturas);
    }

    // Guardar el nuevo PDF en memoria
    const pdfFinalBytes = await pdfDoc.save();

    // Enviar el PDF como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Recibo_${datosRecibo.ernumrecibo}.pdf`);
    res.send(Buffer.from(pdfFinalBytes));

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});
app.post('/cotizaciones-bcu', async (req, res) => {
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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
      `http://${datosEmpresa.codigoEmpresa}/giaweb/soap/giawsserver`,
      xmlCotizaciones,
      { headers: headersCotizacion }
    );

    const parsedSOAP1 = await parseSOAP(cotizacionesResponse.data);
    const innerXml1 = parsedSOAP1.Envelope.Body.procesoCargarCotizacionesBcuResponse.xmlResultado;
    const innerResult1 = await parseInnerXML(innerXml1);

    console.log('✔ Cotizaciones generales:', JSON.stringify(innerResult1, null, 2));

    // ✅ Segunda llamada: obtenerCotizacion para moneda 2
    const obtenerCotizacionResponse = await axios.post(
      `http://${datosEmpresa.codigoEmpresa}/giaweb/soap/giawsserver`,
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
  const xmlBuffer = Buffer.from(xml, 'utf-8');
  const xmlBufferca = Buffer.from(xmlCuentaAjena, 'utf-8');
  const datosEmpresa = await obtenerDatosEmpresa(connection);
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

  // Función que arma el XML para obtener el PDF base64 dado un documento
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
    // 1) Enviar ambas solicitudes agregarDocumentoFacturacion en paralelo
    const [response1, response2] = await Promise.all([
      axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlBuffer, { headers: headersAgregar }),
      axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlBufferca, { headers: headersAgregar }),
    ]);

    // 2) Parsear respuestas SOAP originales
    const result1 = await parseSOAP(response1.data);
    const result2 = await parseSOAP(response2.data);

    const inner1 = await parseInnerXML(result1.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);
    const inner2 = await parseInnerXML(result2.Envelope.Body.agregarDocumentoFacturacionResponse.xmlResultado);

    const res1 = inner1.agregarDocumentoFacturacionResultado;
    const res2 = inner2.agregarDocumentoFacturacionResultado;

    // ✅ Verificamos si alguno falló
    if (res1.resultado !== "1" || res2.resultado !== "1") {
      console.log('res1:', res1);
      console.log('res2:', res2);
      console.log('Enviando error 422 con este objeto:', {
        success: false,
        mensaje: 'Uno o ambos documentos no fueron aceptados por GFE',
        errores: [
          { descripcion: res1.descripcion, resultado: res1.resultado },
          { descripcion: res2.descripcion, resultado: res2.resultado },
        ],
      });
      return res.status(422).json({
        success: false,
        mensaje: 'Uno o ambos documentos no fueron aceptados por GFE',
        errores: [
          { descripcion: res1.descripcion, resultado: res1.resultado },
          { descripcion: res2.descripcion, resultado: res2.resultado },
        ],
      });
    }

    // 3) Construir XMLs para pedir PDF base64 usando los datos de cada documento
    const xmlPdf1 = construirXmlObtenerPdf({
      fechaDocumento: res1.datos.documento.fechaDocumento,
      tipoDocumento: res1.datos.documento.tipoDocumento,
      serieDocumento: res1.datos.documento.serieDocumento,
      numeroDocumento: res1.datos.documento.numeroDocumento,
    });

    const xmlPdf2 = construirXmlObtenerPdf({
      fechaDocumento: res2.datos.documento.fechaDocumento,
      tipoDocumento: res2.datos.documento.tipoDocumento,
      serieDocumento: res2.datos.documento.serieDocumento,
      numeroDocumento: res2.datos.documento.numeroDocumento,
    });

    // 4) Pedir los PDFs base64 en paralelo
    const [pdfResponse1, pdfResponse2] = await Promise.all([
      axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlPdf1, { headers: headersObtenerPdf }),
      axios.post(`http://${datosEmpresa.serverFacturacion}/giaweb/soap/giawsserver`, xmlPdf2, { headers: headersObtenerPdf }),
    ]);

    // 5) Parsear las respuestas con los PDFs
    const parsedPdf1 = await parseSOAP(pdfResponse1.data);
    const parsedPdf2 = await parseSOAP(pdfResponse2.data);

    // 6) Extraer el XML interno con el base64 del PDF
    const innerPdf1XmlEscaped = parsedPdf1.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;
    const innerPdf2XmlEscaped = parsedPdf2.Envelope.Body.obtenerRepresentacionImpresaDocumentoFacturacionResponse.xmlResultado;

    const innerPdf1Xml = innerPdf1XmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const innerPdf2Xml = innerPdf2XmlEscaped.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    const innerPdf1 = await parseInnerXML(innerPdf1Xml);
    const innerPdf2 = await parseInnerXML(innerPdf2Xml);
    console.log('dos innerpdf', innerPdf1, innerPdf2);

    // 7) Extraer base64 
    const pdfBase641 = innerPdf1.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;
    const pdfBase642 = innerPdf2.obtenerRepresentacionImpresaDocumentoFacturacionResultado.datos.pdfBase64 || null;

    // 8) Retornar la respuesta con datos y PDFs base64
    return res.status(200).json({
      success: true,
      resultados: [
        {
          resultado: res1.resultado,
          descripcion: res1.descripcion,
          fechadocumento: res1.datos.documento.fechaDocumento || null,
          tipodocumento: res1.datos.documento.tipoDocumento || null,
          seriedocumento: res1.datos.documento.serieDocumento || null,
          numerodocumento: res1.datos.documento.numeroDocumento || null,
          pdfBase64: pdfBase641,
        },
        {
          resultado: res2.resultado,
          descripcion: res2.descripcion,
          fechadocumento: res2.datos.documento.fechaDocumento || null,
          tipodocumento: res2.datos.documento.tipoDocumento || null,
          seriedocumento: res2.datos.documento.serieDocumento || null,
          numerodocumento: res2.datos.documento.numeroDocumento || null,
          pdfBase64: pdfBase642,
        },
      ],
    });

  } catch (error) {
    console.error('Error procesando solicitudes SOAP:', error);
    return res.status(500).send('Error al enviar las facturas');
  }
});


app.post('/api/generar-pdf-cuentacorriente', async (req, res) => {
  const { desde, hasta, cliente, numeroCliente, moneda } = req.body;

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
    ORDER BY Fecha DESC;
  `;
  // Consulta para obtener el saldo inicial
  const sqlSaldoInicial = `
    SELECT SUM(Debe) - SUM(Haber) AS Saldo
    FROM cuenta_corriente 
    WHERE IdCliente = ? 
      AND Fecha <= ?
  `;

  // Consulta para obtener el saldo final
  const sqlSaldoFinal = `
    SELECT SUM(Debe) - SUM(Haber) AS Saldo
    FROM cuenta_corriente 
    WHERE IdCliente = ? 
    AND Fecha <= ?
  `;
  try {
    // Promesa para obtener los movimientos
    const getMovimientos = () => {
      return new Promise((resolve, reject) => {
        connection.query(sql, [numeroCliente, fechaDesde, fechaHasta], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };

    // Promesa para obtener el saldo inicial
    const getSaldoInicial = () => {
      return new Promise((resolve, reject) => {
        connection.query(sqlSaldoInicial, [numeroCliente, fechaDesde], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };

    // Promesa para obtener el saldo final
    const getSaldoFinal = () => {
      return new Promise((resolve, reject) => {
        connection.query(sqlSaldoFinal, [numeroCliente, fechaHasta], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };

    // Obtener los resultados usando async/await
    const resultMovimientos = await getMovimientos();

    const resultSaldoInicial = await getSaldoInicial();
    const resultSaldoFinal = await getSaldoFinal();

    // Obtener saldo inicial y final
    const saldoInicial = resultSaldoInicial[0]?.Saldo || 0;
    const saldoFinal = resultSaldoFinal[0]?.Saldo || 0;

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
    const saldoValue = saldoInicial.toFixed(2);

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
    const columnWidths = [60, 60, 80, 80, 45, 60, 60, 80];  // Ajusta el ancho de cada columna según tus necesidades

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
      let saldoAcumulado = parseFloat(resultSaldoInicial[0]?.Saldo);  // Inicializar el saldo acumulado
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
        currentPage.drawText(movimiento.TipoDocumento, { x: startX + columnWidths[0] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Comprobar si 'NumeroDocumento' no es null antes de dibujar
        if (movimiento.NumeroDocumento) {
          currentPage.drawText(movimiento.NumeroDocumento, { x: startX + columnWidths[0] + columnWidths[1] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        } else {
          currentPage.drawText('     -', { x: startX + columnWidths[0] + columnWidths[1] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        }

        // Comprobar si 'NumeroRecibo' no es null antes de dibujar
        if (movimiento.NumeroRecibo) {
          currentPage.drawText(movimiento.NumeroRecibo, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        } else {
          currentPage.drawText('     -', { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: currentY + 5, size: 8, font: helveticaFont });
        }

        currentPage.drawText(movimiento.Moneda, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y: currentY + 5, size: 8, font: helveticaFont });

        // Comprobar si 'Debe' y 'Haber' son números válidos antes de dibujar
        const debeValue = (movimiento.Debe !== 0.00 && movimiento.Debe !== undefined) ? movimiento.Debe.toFixed(2) : '     -';
        const haberValue = (movimiento.Haber !== null && movimiento.Haber !== undefined) ? movimiento.Haber.toFixed(2) : '     -';

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


app.get('/api/obtenerguiasimpopendientes', (req, res) => {
  const { cliente, desde, hasta, tipoPago } = req.query;

  let query = `
    SELECT g.*, v.vuelo AS vuelo
FROM guiasimpo g
LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
WHERE g.consignatario = ? 
AND g.emision >= ? 
AND g.emision <= ? 
AND g.facturada = 0
  `;

  const params = [cliente, desde, hasta];

  // Si el tipo de pago no es 'Cualquiera', filtramos por ese campo
  if (tipoPago && tipoPago !== 'Cualquiera') {
    query += ` AND tipodepagoguia = ?`;
    params.push(tipoPago);
  }

  query += ` ORDER BY emision ASC`;

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error al obtener guías impo:', error);
      res.status(500).json({ error: 'Error al obtener guías impo' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/obtenerguiasexpopendientes', (req, res) => {
  const { cliente, desde, hasta, tipoPago } = req.query;

  let query = `
    SELECT g.*, v.vuelo AS vuelo
FROM guiasexpo g
LEFT JOIN vuelos v ON g.nrovuelo = v.idVuelos
WHERE g.agente = ? 
AND g.emision >= ? 
AND g.emision <= ? 
AND g.facturada = 0
  `;

  const params = [cliente, desde, hasta];

  // Si el tipo de pago no es 'Cualquiera', filtramos por ese campo
  if (tipoPago && tipoPago !== 'Cualquiera') {
    query += ` AND tipodepago = ?`;
    params.push(tipoPago);
  }

  query += ` ORDER BY emision ASC`;

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error al obtener guías impo:', error);
      res.status(500).json({ error: 'Error al obtener guías impo' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/facturas-sin-cobrar', (req, res) => {
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

  connection.query(sqlList, (err, facturas) => {
    if (err) {
      console.error('Error al obtener facturas sin cobrar:', err);
      return res.status(500).json({ message: 'Ocurrió un error al obtener las facturas sin cobrar.' });
    }

    connection.query(sqlTotal, (err2, totalResult) => {
      if (err2) {
        console.error('Error al calcular total sin cobrar:', err2);
        return res.status(500).json({ message: 'Ocurrió un error al calcular el total sin cobrar.' });
      }

      const totalSinCobrar = totalResult[0].totalSinCobrar || 0;

      res.status(200).json({ facturas, totalSinCobrar });
    });
  });
});


app.get('/api/guias-sin-facturar', (req, res) => {
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

  // Ejecutar ambas consultas en paralelo
  connection.query(sql, (err, guias) => {
    if (err) {
      console.error('Error al obtener guías sin facturar:', err);
      return res.status(500).json({ message: 'Error al obtener las guías sin facturar.' });
    }

    connection.query(totalSql, (err2, totalResult) => {
      if (err2) {
        console.error('Error al calcular total sin facturar:', err2);
        return res.status(500).json({ message: 'Error al calcular el total sin facturar.' });
      }

      res.status(200).json({
        guias,
        total_sin_facturar: totalResult[0].total_sin_facturar
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.status(200).send('Server is running');
});
app.get('/', (req, res) => {
  res.send('Este es el backend');
});

