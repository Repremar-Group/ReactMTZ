
async function obtenerDatosEmpresa(pool) {
  try {
    const [results] = await pool.query('SELECT * FROM datos_empresa LIMIT 1');
    if (results.length > 0) {
      return results[0]; // Devuelve el primer registro
    } else {
      console.warn('No se encontraron datos en la tabla datos_empresa');
      return null;
    }
  } catch (error) {
    console.error('Error al cargar los datos de empresa:', error);
    throw error;
  }
}

module.exports = { obtenerDatosEmpresa };