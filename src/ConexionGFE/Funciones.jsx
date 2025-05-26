export const descargarPDFBase64 = (base64, nombreArchivo) => {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64}`;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};