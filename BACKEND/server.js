const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const db = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'designlogin',
  port: 3306,
});

const app = express();

app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {
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

app.get('/clientes', (req, res) => {
    const sql = 'SELECT * FROM clientesmtz';
    
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'An error occurred while fetching clients.' });
      }
  
      // Envía todos los resultados de la consulta al frontend
      res.status(200).json(result);
    });
  });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});