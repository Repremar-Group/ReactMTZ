const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

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

