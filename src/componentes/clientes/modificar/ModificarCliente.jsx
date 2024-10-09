import React, { useState } from 'react'; // Asegúrate de importar useState
import './modificarcliente.css';

const ModificarCliente = ({ empresa, rut, closeModal, id, pais, email, tel }) => {
  if (!empresa || !rut) return null; // No muestra nada si no hay empresa seleccionada

  // Establece el estado local para los campos que se pueden modificar
  const [razonSocial, setRazonSocial] = useState(empresa);
  const [rutLocal, setRut] = useState(rut);
  const [idLocal, setID] = useState(id);
  const [paisLocal, setPais] = useState(pais);
  const [emailLocal, setEmail] = useState(email);
  const [telLocal, setTel] = useState(tel);
  const [iata, setIata] = useState(''); //*
  const [direccion, setDireccion] = useState('');//*
  const [zona, setZona] = useState('');//*
  const [ciudad, setCiudad] = useState('');//*
  const [codigopostal, setCodigoPostal] = useState('');//*
  const [cass, setCass] = useState('');//*
  const [comision, setComision] = useState('');//*
  const [descuento, setDescuento] = useState('');//*
  const [isCheckedLPC, setIsCheckedLPC] = useState(false);//*
  const [isCheckedCompaniaAerea, setIsCheckedCompaniaAerea] = useState(false);//*
  const [tipoComprobante, setTipoComprobante] = useState(false);//*
  const [tipoMoneda, setTipoMoneda] = useState(false);//*
  const [tipoIVA, setTipoIVA] = useState(false);//*


  const handleSubmit = (e) => {
    e.preventDefault();
    // Llama a la función para controlar la modificación aquí
    onConfirmar(); // Debes implementar esta función según tus necesidades
  };

  // Maneja el cambio del checkbox LPC
  const handleCheckboxChangeLPC = () => {
    setIsCheckedLPC(!isCheckedLPC);
  };

  // Maneja el cambio del checkbox LPC
  const handleCheckboxChangeCompaniaAerea = () => {
    setIsCheckedCompaniaAerea(!isCheckedLPC);
  };


  return (
    <form className= 'formulario-editar-cliente'onSubmit={handleSubmit}>
      <h2>Modificar Empresa: {razonSocial} </h2>
      <div className="contenido-modificar-empresa">
        <div className='div_primerrenglon-modificarusuario'>
          <div>
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setID(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="razonsocial">Razon Social:</label>
            <input
              type="text"
              id="razonsocial"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              required
            />
          </div>
        </div>

        <div className='div_segundorenglon-modificarusuario'>
          <div>
            <label htmlFor="direccion">Direccion:</label>
            <input
              type="text"
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="Zona">Zona:</label>
            <input
              type="text"
              id="zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              required
            />

          </div>
        </div>

        <div className='div_tercerrenglon-modificarusuario'>
          <div>
            <label htmlFor="Ciudad">Ciudad:</label>
            <input
              type="text"
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="codigo-postal">Codigo Postal:</label>
            <input
              type="text"
              id="codigo-postal"
              value={codigopostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              required
            />
          </div>
        </div>



        <div className='div_cuartorenglon-modificarusuario'>
          <div>
            <label htmlFor="rut">Rut:</label>
            <input
              type="number"
              id="rut"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="iata">IATA:</label>
            <input
              type="text"
              id="iata"
              value={iata}
              onChange={(e) => setIata(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="cass">Cass:</label>
            <input
              type="text"
              id="cass"
              value={cass}
              onChange={(e) => setCass(e.target.value)}
              required
            />
          </div>
        </div>


        <div className='div_quintorenglon-modificarusuario'>
          <div>
            <label htmlFor="pais">País:</label>
            <input
              type="text"
              id="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="mail"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="tel">Tel:</label>
            <input
              type="text"
              id="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              required
            />
          </div>
        </div>




        <div className='div_sextorenglon-modificarusuario'>
          <div className='divporcentajes'>
            <div>
              <label htmlFor="comision">Comision(%):</label>
              <input
                type="text"
                id="comision"
                value={comision}
                onChange={(e) => setComision(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="descuento">Descuento(%):</label>
              <input
                type="text"
                id="descuento"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                required
              />
            </div>
          </div>
          <div className='divcheckboxs'>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isCheckedLPC}
                  onChange={handleCheckboxChangeLPC}
                />
                LPC
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isCheckedCompaniaAerea}
                  onChange={handleCheckboxChangeCompaniaAerea}
                />
                Compañía Aérea
              </label>
            </div>
          </div>

        </div>


        <div className='div_septimorenglon-modificarusuario'>
          <div>
            <label htmlFor="tipoComprobante">Tipo de Comprobante:</label>
            <select
              id="tipoComprobante"
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo de Comprobante</option>
              <option value="credito">Factura de Credito</option>
              <option value="contado">Factura Contado</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipoMoneda">Moneda:</label>
            <select
              id="tipoMoneda"
              value={tipoMoneda}
              onChange={(e) => setTipoMoneda(e.target.value)}
              required
            >
              <option value="">Selecciona una Moneda</option>
              <option value="dolares">Dolares</option>
              <option value="pesos">Pesos</option>
              <option value="Euros">Euros</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipoIVA">Tipo de IVA:</label>
            <select
              id="tipoIVA"
              value={tipoIVA}
              onChange={(e) => setTipoIVA(e.target.value)}
              required
            >
              <option value="">Seleccione un tipo de IVA</option>
              <option value="IVA22">IVA 22%</option>
              <option value="IVAX">IVA X%</option>
              <option value="IVAY">IVA Y%</option>
            </select>
          </div>
        </div>


        <div className='botones-formulario-modificar-cliente'>
          <button className='btn-modificar-cliente' type="submit">Modificar</button> {/* Cambié "Eliminar" a "Modificar" para reflejar la acción */}
          <button className='btn-volver-modificar-cliente' type="button" onClick={closeModal}>Volver</button>
        </div>

      </div>
    </form>
  );
};

export default ModificarCliente;