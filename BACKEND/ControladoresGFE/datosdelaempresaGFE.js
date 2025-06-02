
function obtenerDatosEmpresa(db) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM datos_empresa LIMIT 1', (error, results) => {
      if (error) {
        console.error('Error al cargar los datos de empresa:', error);
        return reject(error);
      }
      if (results.length > 0) {
        resolve(results[0]); // Devuelve el primer registro
      } else {
        console.warn('No se encontraron datos en la tabla datos_empresa');
        resolve(null);
      }
    });
  });
}

module.exports = {
  obtenerDatosEmpresa,
};
