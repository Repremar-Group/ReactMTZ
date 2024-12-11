// Función para convertir coma a punto
export const convertirADecimal = (valor) => {
  // Si el valor es una cadena
  if (typeof valor === 'string') {
    // Reemplaza la coma por un punto y convierte a número
    const valorConPunto = valor.replace(',', '.');
    // Retorna el número, pero si no es válido, retorna 0
    return isNaN(parseFloat(valorConPunto)) ? 0 : parseFloat(valorConPunto);
  } else if (typeof valor === 'number') {
    // Si el valor es un número, solo lo retorna
    return isNaN(valor) ? 0 : valor;
  }
  // Si no es un número ni una cadena, retorna 0
  return 0;
};


// Función para convertir punto a coma
export const convertirAComa = (valor) => {
  return valor.replace('.', ',');
}