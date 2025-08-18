import axios from "axios";

export const descargarPDFBase64 = (base64, nombreArchivo) => {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const impactarEnGIA = async (factura, backURLFUNC) => {
  try {
    console.log('Info a impactar en GIA, Factura: ',factura, ' urlBack: ', backURLFUNC);
    const response = await axios.post(`${backURLFUNC}/api/impactardocumento`, {
      factura: factura
    });
    return response.data;
  } catch (error) {
    console.error("Error al impactar documento:", error);
    throw error;
  }
};

export const impactarReciboEnGIA = async (recibo, backURLFUNC) => {
  try {
    console.log('Info a impactar en GIA, Recibo: ',recibo, ' urlBack: ', backURLFUNC);
    const response = await axios.post(`${backURLFUNC}/api/impactarrecibo`, {
     idrecibo: recibo
    });
    return response.data;
  } catch (error) {
    console.error("Error al impactar documento:", error);
    throw error;
  }
};
export const impactarNCEnGIA = async (idNC, backURLFUNC) => {
  try {
    console.log('Info a impactar en GIA, N/C: ', idNC, ' urlBack: ', backURLFUNC);
    const response = await axios.post(`${backURLFUNC}/api/impactarnc`, {
      idNC: idNC
    });
    return response.data;
  } catch (error) {
    console.error("Error al impactar N/C:", error);
    throw error;
  }
};