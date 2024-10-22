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


/*app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Received:', username, password);

  const sql = 'SELECT * FROM Clientes;';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred while processing your request.' });
    } else {
      if (result.length > 0) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Login failed. Invalid username or password.' });
      }
    }
  });
});
*/

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
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/api/health', (req, res) => {
  res.status(200).send('Server is running');
});
