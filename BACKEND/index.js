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
const { generarXml } = require('./ControladoresGFE/controladoresGfe')

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

// Función para generar el mensaje en el backend
function generarMensaje(monto) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  return `Son dólares americanos U$S ${montoEnLetras}`;
}
function generarAdenda(numerodoc, monto) {
  const montoEnLetras = NumeroALetras(monto);  // Convierte el monto a letras
  return `Doc:${numerodoc} ${montoEnLetras}`;
}

//Consulta para cargar la tabla de preview de clientes.

app.get('/api/previewclientes', (req, res) => {
  console.log('Received request for /api/previewclientes'); // Agrega esta línea
  const sql = 'SELECT * FROM clientes';

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
  const sql = 'SELECT * FROM facturas';

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
app.post('/api/insertclientes', (req, res) => {
  console.log('Received request for /api/insertclientes');
  const {
    Nombre,
    RazonSocial,
    Direccion,
    Zona,
    Ciudad,
    CodigoPostal,
    Rut,
    IATA,
    Cass,
    Pais,
    Email,
    Tel,
    Tcomprobante,
    Tiva,
    Moneda,
    Saldo
  } = req.body; // Los datos del cliente enviados desde el front

  // Consulta para insertar el cliente
  const insertClienteQuery = `
    INSERT INTO clientes (Nombre, RazonSocial, Direccion, Zona, Ciudad, CodigoPostal, Rut, IATA, Cass, Pais, Email, Tel, Tcomprobante, Tiva, Moneda, Saldo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ejecutar la inserción del cliente
  connection.query(insertClienteQuery, [Nombre, RazonSocial, Direccion, Zona, Ciudad, CodigoPostal, Rut, IATA, Cass, Pais, Email, Tel, Tcomprobante, Tiva, Moneda, Saldo], (err, results) => {
    if (err) {
      console.error('Error al insertar el cliente:', err);
      return res.status(500).json({ error: 'Error al insertar el cliente' });
    }
    // Respuesta exitosa
    res.status(200).json({ message: 'Cliente y cuenta corriente insertados exitosamente' });
  });
}
);


//Armando Endpoint para eliminar Cliente

app.delete('/api/deleteclientes', (req, res) => {
  console.log('Received request for /api/deleteclientes');
  const { Id } = req.body; // Obtener el Id del cliente a eliminar

  // Consulta para eliminar la cuenta corriente del cliente
  const deleteCuentaCorrienteQuery = `
    DELETE FROM CuentaCorriente
    WHERE Id_Cliente = ?
  `;

  connection.query(deleteCuentaCorrienteQuery, [Id], (err, results) => {
    if (err) {
      console.error('Error al eliminar la cuenta corriente:', err);
      return res.status(500).json({ error: 'Error al eliminar la cuenta corriente' });
    }
    console.log('Cuenta corriente eliminada:', results.affectedRows);
    const deleteClienteQuery = `
      DELETE FROM clientes
      WHERE Id = ?
    `;

    connection.query(deleteClienteQuery, [Id], (err, results) => {
      if (err) {
        console.error('Error al eliminar el cliente:', err);
        return res.status(500).json({ error: 'Error al eliminar el cliente' });
      }
      console.log('Cliente eliminado:', results.affectedRows);
      // Respuesta exitosa
      res.status(200).json({ message: 'Cliente y cuenta corriente eliminados exitosamente' });
    });
  });
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

// Endpoint para actualizar un cliente
app.put('/api/actualizarcliente/:id', (req, res) => {
  const id = req.params.id; // Obtener el ID del cliente de la URL
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
    codigopostal,
    cass,
    tipoComprobante,
    tipoMoneda,
    tipoIVA
  } = req.body; // Obtener los datos del cliente del cuerpo de la solicitud

  // Consulta SQL para actualizar los datos del cliente
  const sql = `UPDATE clientes SET 
    Nombre = ?,
    RazonSocial = ?,
    Direccion = ?,
    Zona = ?,
    Ciudad = ?,
    CodigoPostal = ?,
    Rut = ?,
    IATA = ?,
    Cass = ?,
    Pais = ?,
    Email = ?,
    Tel = ?,
    Tcomprobante = ?,
    Moneda = ?,
    Tiva = ?
    WHERE id = ?`;

  const values = [
    nombre,
    razonSocial,
    direccion,
    zona,
    ciudad,
    codigopostal,
    rut,
    iata,
    cass,
    pais,
    email,
    tel,
    tipoComprobante,
    tipoMoneda,
    tipoIVA,
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

  const { codigo, descripcion, exento } = req.body;

  if (!codigo || !descripcion || exento === undefined) {
    console.log('Faltan datos obligatorios');
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = 'INSERT INTO conceptos (codigo, descripcion, exento) VALUES (UPPER(?), ?, ?)';
  const values = [codigo, descripcion, exento ? 1 : 0];

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

app.post('/api/insertfactura', (req, res) => {
  console.log('Received request for /api/insertfactura');
  let facturaCuentaAjenaId;
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
                            CASS, TipoEmbarque, TC, Subtotal, IVA, Redondeo, Total, TotalCobrar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insertFacturaQuery, [
      IdCliente, Nombre, RazonSocial, DireccionFiscal, Ciudad, Pais, RutCedula, ComprobanteElectronico,
      Comprobante, Compania, Electronico, Moneda, Fecha, TipoIVA, CASS, TipoEmbarque, TC, Subtotal, IVA,
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
                    codItem: concepto.id_concepto.toString().padStart(3, '0'), // Asignamos el codItem como el id del concepto, formateado con ceros a la izquierda
                    indicadorFacturacion: importeFormateado === 0 ? "5" : "1",
                    nombreItem: concepto.descripcion, // Usamos la descripción como el nombre del item
                    cantidad: "1", // Asignamos la cantidad como "1", ya que no se especifica en los datos
                    unidadMedida: "UN", // Unidad de medida "UN"
                    precioUnitario: concepto.importe.toFixed(2), // Precio unitario del concepto, formateado con 2 decimales
                  };
                });
              });
              let adenda = generarAdenda(facturaId, TotalCobrar)
              const datos = {
                facturaIdERP: facturaId,
                serieCFE: "A",
                fechaCFE: Fecha,
                tipoDocRec: "2",
                nroDocRec: '213287140010',
                paisRec: Pais,
                razonSocialRec: RazonSocial,
                direccionRec: DireccionFiscal,
                ciudadRec: Ciudad,
                moneda: Moneda,
                tipoCambio: TC,
                totalNoGrabado: TotalCobrar,
                totalACobrar: TotalCobrar,
                cantidadLineasFactura: detallesFactura.length,
                sucursal: "S01",
                adenda: adenda,
                serieDocumentoERP: "A",
                rutCuentaAjena: RutCedula,
                paisCuentaAjena: Pais,
                razonSocialCuentaAjena: RazonSocial,
                detalleFactura: detallesFactura
              }
              //detallesFactura.length
              console.log('ESTOS SON LOS DATOS:', datos);
              //Envio los datos a generarXml en controladoresGFE
              const xml = generarXml(datos);

              const enviarFacturaSOAP = async (xml) => {
                try {
                  const response = await axios.post('http://localhost:3000/pruebaws', { xml });
                  console.log('Respuesta del servidor SOAP:', response.data);
                  if (response.data.success) {
                    console.log('✅ Factura procesada en GFE correctamente');
                  } else {
                    console.log(`⚠️ Error: ${response.data.message}`);
                  }

                } catch (error) {
                  console.error('Error al enviar la solicitud:', error);

                  // Verifica si hay detalles del error HTTP
                  if (error.response) {
                    console.error('Error response data:', error.response.data);

                    // Aquí accedemos correctamente al mensaje de error para enviarlo al front
                    console.log(`❌ Error: ${error.response.data.message}`);
                    throw new Error(error.response.data.message);
                  } else {
                    console.log('❌ Error al enviar la factura a GFE');
                    throw new Error('Error al enviar la factura a GFE, Chequear Conectividad');
                  }
                }
              };
              (async () => {
                try {
                  const xml = generarXml(datos);
                  await enviarFacturaSOAP(xml); // Esperar que termine antes de continuar

                  res.status(200).json({
                    message: 'Factura cargada exitosamente',
                    facturaId: facturaId || null,
                    facturaCuentaAjenaId: facturaCuentaAjenaId || null
                  });
                } catch (error) {
                  res.status(422).json({ error: error.message });
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

// Ruta de proxy para enviar la solicitud SOAP
app.post('/pruebaws', async (req, res) => {
  const xml = req.body.xml; // Se espera que el XML venga en el cuerpo de la solicitud
  const xmlBuffer = Buffer.from(xml, 'utf-8');
  try {
    const response = await axios.post('http://srvgfe.grep.local:8082/gfeclient/servlet/awsexterno', xmlBuffer, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': '"GFE_Clientaction/AWSEXTERNO.GRABAR"',
        'Accept-Encoding': 'gzip,deflate',
        'Host': 'srvgfe.grep.local:8082',
        'Connection': 'Keep-Alive',
        'User-Agent': 'Apache-HttpClient/4.5.5 (Java/17.0.12)',

      },
    });
    // Imprimir la respuesta del servidor en su formato original (XML)
    console.log('Respuesta directa del servidor (XML):', response.data);
    // Procesar la respuesta XML usando xml2js
    const parser = new xml2js.Parser({
      explicitArray: false, // Para evitar arrays innecesarios
      tagNameProcessors: [xml2js.processors.stripPrefix] // Remueve prefijos como "SOAP-ENV:"
    });

    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error('Error al parsear el XML:', err);
        return res.status(500).send('Error al procesar la respuesta SOAP');
      }

      // Imprimir la estructura del XML recibido para depuración
      console.log('Estructura del XML recibido:', result);

      try {
        const body = result.Envelope.Body;
        const response = body['WSExterno.GRABARResponse'];
        const xmlRetorno = response.Xmlretorno;
        console.log('Tipo de xmlRetorno:', typeof xmlRetorno);
        console.log('Contenido de xmlRetorno:', xmlRetorno);
        // Extraemos la descripción directamente del XML como se había hecho antes
        const descripcion = xmlRetorno._.match(/<Descripcion>(.*?)<\/Descripcion>/)[1];

        // Si la descripción es 'Ok', respondemos con éxito
        if (descripcion === 'Ok') {
          res.status(200).json({ success: true, message: 'Factura procesada correctamente' });
        } else {
          // Si no es 'Ok', respondemos con error concatenando la descripción
          res.status(400).json({ success: false, message: `Error: ${descripcion}` });
        }

        console.log('Respuesta procesada:', xmlRetorno);
      } catch (error) {
        console.error('Error accediendo a los elementos del XML:', error);
      }
    });

  } catch (error) {
    console.error('Error al enviar la factura:', error);
    res.status(500).send('Error al enviar la factura');
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

