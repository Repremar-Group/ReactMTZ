const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Configura la conexión a tu servidor MySQL flexible de Azure
const connection = mysql.createConnection({
  host: 'cielosurinvoicedb.mysql.database.azure.com', // Tu servidor MySQL flexible de Azure
  user: 'cielosurdb', // El usuario que creaste para la base de datos
  password: 'nujqeg-giwfes-6jynzA', // La contraseña del usuario
  database: 'cielosurinvoiceprod', // El nombre de la base de datos
  port: 3306, // Puerto predeterminado de MySQL
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
    Moneda
  } = req.body; // Los datos del cliente enviados desde el front

  // Consulta para insertar el cliente
  const insertClienteQuery = `
    INSERT INTO clientes (Nombre, RazonSocial, Direccion, Zona, Ciudad, CodigoPostal, Rut, IATA, Cass, Pais, Email, Tel, Tcomprobante, Tiva, Moneda)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ejecutar la inserción del cliente
  connection.query(insertClienteQuery, [Nombre, RazonSocial, Direccion, Zona, Ciudad, CodigoPostal, Rut, IATA, Cass, Pais, Email, Tel, Tcomprobante, Tiva, Moneda], (err, results) => {
    if (err) {
      console.error('Error al insertar el cliente:', err);
      return res.status(500).json({ error: 'Error al insertar el cliente' });
    }

    // Obtener el ID del cliente recién insertado
    const clienteId = results.insertId;

    // Ahora insertar la cuenta corriente
    const insertCuentaCorrienteQuery = `
        INSERT INTO CuentaCorriente (Id_Cliente, Debe, Haber, Fecha, TipoDocumento, NroDocumento)
        VALUES (?, NULL, NULL, NULL, NULL, NULL)
      `;

    connection.query(insertCuentaCorrienteQuery, [clienteId], (err, results) => {
      if (err) {
        console.error('Error al insertar la cuenta corriente:', err);
        return res.status(500).json({ error: 'Error al insertar la cuenta corriente' });
      }

      // Respuesta exitosa
      res.status(200).json({ message: 'Cliente y cuenta corriente insertados exitosamente' });
    });
  }
  );
});

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

