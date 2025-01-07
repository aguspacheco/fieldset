const multiplicador = 7.5;
const porc_preferencial = 800;

/*----- Modulos -----*/

// 1.1) Por estudio de mensura, considerado com nunerom de parcelas la suma de parcelas de origen mas resultante
const modulos = [
  { rango: [0, 5], valor: 900 },
  { rango: [6, 20], valor: 750 },
  { rango: [21, 50], valor: 660 },
  { rango: [51, Infinity], valor: 600 },
];

// 1.2.a) Unidad Funcional y/o Unidad Complementaria -> M600
const m_ufuncional = 600 * multiplicador;
// Declaracion jurada individual formato papel -> M240
const m_ddjj = 240 * multiplicador;
// 3.3) Por certificacion de valores fiscales de inmueble, por cada parcela -> M720
const m_valorFiscal = 720 * multiplicador;
// 3.4) Por pedido de reconsideracion de valuacion fiscal -> M600
const m_valuacionFiscal = 600 * multiplicador;
// 3.5) Por pedido de reconsideracion de receptividad ganadera -> M600
const m_ganadera = 600 * multiplicador;
// 3.6) Por pedido de reconsideracion de VIR -> M840
const m_vir = 840 * multiplicador;

/** ----- Elementos ----- */

const formularioValuaciones = document.getElementById("formularioValuaciones");
const resultadosValuaciones = document.getElementById("resultadosValuaciones");
const resultadosValuaciones_tabla = document.getElementById("resultadosValuaciones-tabla");

const formularioMensura = document.getElementById("formularioMensura");
const resultadosMensura = document.getElementById("resultadosMensura");
const resultadosMensura_tabla = document.getElementById("resultadosMensura-tabla");

/** ----- FUNCIONES GENERALES ----- */

/**
 * Formatea un monto en una cadena con el formato de moneda argentina
 * @param {Number} monto - El monto a formatear
 * @returns {String} - El monto formateado como cadena con el formato de moneda argentina
 */
function formatoMoneda(monto) {
  return (
    "$ " +
    monto.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Visualiza el total a pagar en la página
 * @param {Number} total - El total a pagar
 * @param {string} abonar - Cuerpo contenedor del total
 */
function visualizarTotal(total, abonar) {
  const contenedor = document.getElementById(abonar);
  contenedor.innerHTML = "";
  contenedor.innerText = formatoMoneda(total);
}

/**
 * Agrega una fila a la tabla de resultados con la información de una etiqueta, cantidad, valor modular y valor total.
 * @param {string} etiqueta - La etiqueta de la fila.
 * @param {number} cantidad - La cantidad ingresada en el formulario.
 * @param {number} valorModular - El valor modular de cada elemento de la fila.
 */
function agregarFila(etiqueta, cantidad, valorModular, tabla) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
        <th class="texto-izquierda">${etiqueta}</th>
        <td>${cantidad}</td>
        <td>${formatoMoneda(valorModular)}</td>
        <td>${formatoMoneda(valorModular * cantidad)}</td>
      `;
  tabla.appendChild(fila);
}

function agregarFilaPreferencial(preferencial, monto, tabla) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
        <th class="texto-izquierda">Preferencial</th>
        <td>${preferencial ? "SI" : "NO"}</td>
        <td>${preferencial ? porc_preferencial : 0}%</td>
        <td>${formatoMoneda(monto)}</td>
      `;
  tabla.appendChild(fila);
}

/** ----- MENSURA ----- */

/**
 * Retorna el valor modular correspondiente a la cantidad de parcelas recibidas
 * @param {Number} parcelas - La cantidad de parcelas a considerar
 * @returns {Number} - El valor modular correspondiente a la cantidad de parcelas recibidas
 */
function parcelasValorModular(parcelas) {
  const moduloEncontrado = modulos.find((modulo) => {
    const [min, max] = modulo.rango;
    return parcelas >= min && parcelas <= max;
  });
  return moduloEncontrado.valor * multiplicador;
}

/**
 * Obtiene los valores de entrada ingresados por el usuario en el formulario
 * @returns {Object} - Un objeto con los valores de entrada ingresados por el usuario en el formulario
 */
function obtenerValoresEntrada() {
  const origen = parseInt(document.getElementById("origen").value) || 0;
  const resultante = parseInt(document.getElementById("resultante").value) || 0;
  const ddjj = parseInt(document.getElementById("ddjjMensura").value) || 0;
  const funcional = parseInt(document.getElementById("ufuncional").value) || 0;

  if (origen < 0 || resultante < 0 || ddjj < 0 || funcional < 0) {
    alert("Ingrese valores no negativos.");
    return null;
  }

  if (origen === 0 && resultante === 0 && ddjj === 0 && funcional === 0) {
    alert("Ingrese al menos un valor antes de calcular.");
    return null;
  }

  const preferencial = document.getElementById("preferencial").checked;
  const parcelas = origen + resultante;

  return { origen, resultante, ddjj, funcional, preferencial, parcelas };
}

/**
 * Calcula el total a pagar en base a los valores de entrada ingresados por el usuario
 * @param {Object} valoresEntrada - Un objeto con los valores de entrada ingresados por el usuario
 * @returns {Number} - El total a pagar en base a los valores de entrada ingresados por el usuario
 */
function calcularTotal({ parcelas, ddjj, preferencial, funcional }) {
  let total = ddjj * m_ddjj + funcional * m_ufuncional;
  if (parcelas != 0) total += parcelasValorModular(parcelas) * parcelas;
  if (preferencial) total *= 1 + porc_preferencial / 100;

  return total;
}

function totalPreferencial(parcelas, ddjj, funcional) {
  let total = ddjj * m_ddjj + funcional * m_ufuncional;
  if (parcelas != 0) total += parcelasValorModular(parcelas) * parcelas;
  return (total * porc_preferencial) / 100;
}

/**
 * Crea una tabla con los resultados de cada elemento con su cantidad y valor modular,
 * y la agrega a la sección de resultados del HTML.
 *
 * @param {object} valoresEntrada - Objeto con los valores de entrada del formulario.
 */
function crearTablaResultados(valoresEntrada) {
  const { origen, resultante, ddjj, funcional, preferencial, parcelas } = valoresEntrada;
  const valor_modulo_parcelas = parcelasValorModular(parcelas);

  agregarFila("Parcelas Origen", origen, valor_modulo_parcelas, resultadosMensura);
  agregarFila("Parcelas Resultante", resultante, valor_modulo_parcelas, resultadosMensura);
  agregarFila("Unidad Funcional", funcional, m_ufuncional, resultadosMensura);
  agregarFila("Declaracion Jurada", ddjj, m_ddjj, resultadosMensura);

  const montoPreferencial = preferencial ? totalPreferencial(parcelas, ddjj, funcional) : 0;

  agregarFilaPreferencial(preferencial, montoPreferencial, resultadosMensura);
}

function mostrarTotalMensura() {
  const valoresEntrada = obtenerValoresEntrada();
  const total = calcularTotal(valoresEntrada);
  crearTablaResultados(valoresEntrada);
  visualizarTotal(total, "abonarMensura");
}

const calcularMensuraBtn = document.getElementById("calcularMensura-btn");
const limpiarMensuraBtn = document.getElementById("limpiarMensura-btn");
const recalcularMensuraBtn = document.getElementById("recalcularMensura-btn");

calcularMensuraBtn.addEventListener("click", () => {
  const valoresEntrada = obtenerValoresEntrada();

  if (valoresEntrada === null) {
    return;
  }

  // Verificar si hay algún valor menor a cero
  if (valoresEntrada === null) {
    // Si hay un valor menor a cero, no continuar
    return;
  }

  formularioMensura.style.display = "none";
  limpiarMensuraBtn.style.display = "none";
  calcularMensuraBtn.style.display = "none";
  resultadosMensura.style.display = "block";
  recalcularMensuraBtn.style.display = "block";
  mostrarTotalMensura();
});

limpiarMensuraBtn.addEventListener("click", () => {
  const elementos = ["origen", "resultante", "ddjjMensura", "ufuncional"];

  elementos.forEach((elemento) => {
    document.getElementById(elemento).value = "";
  });

  document.getElementById("preferencial").checked = false;
});

recalcularMensuraBtn.addEventListener("click", () => {
  resultadosMensura.innerHTML = "";
  resultadosMensura.style.display = "none";
  recalcularMensuraBtn.style.display = "none";
  formularioMensura.style.display = "block";
  limpiarMensuraBtn.style.display = "block";
  calcularMensuraBtn.style.display = "block";
});

/** ----- VALUACIONES ----- */

/**
 * Obtiene los valores de entrada ingresados por el usuario en el formulario
 * @returns {Object} - Un objeto con los valores de entrada ingresados por el usuario en el formulario
 */
function obtenerValoresEntradaValuaciones() {
  const ddjj = parseInt(document.getElementById("ddjjValuacion").value) || 0;
  const valorFiscal = parseInt(document.getElementById("valorFiscal").value) || 0;
  const valuacionFiscal = parseInt(document.getElementById("valuacionFiscal").value) || 0;
  const ganadera = parseInt(document.getElementById("ganadera").value) || 0;
  const vir = parseInt(document.getElementById("vir").value) || 0;
  const preferencial = document.getElementById("preferencialValuacion").checked;

  if (ddjj < 0 || valorFiscal < 0 || valuacionFiscal < 0 || ganadera < 0 || vir < 0) {
    alert("Ingrese valores no negativos.");
    return null;
  }

  if (ddjj === 0 && valorFiscal === 0 && valuacionFiscal === 0 && ganadera === 0 && vir === 0) {
    alert("Ingrese al menos un valor antes de calcular.");
    return null;
  }

  return { ddjj, valorFiscal, valuacionFiscal, ganadera, vir, preferencial };
}

function preferencialValuaciones(ddjj, valorFiscal, valuacionFiscal, ganadera, vir) {
  let total =
    ddjj * m_ddjj +
    valorFiscal * m_valorFiscal +
    valuacionFiscal * m_valuacionFiscal +
    ganadera * m_ganadera +
    vir * m_vir;

  return (total * porc_preferencial) / 100;
}

function calcularValuacion(valoresEntrada) {
  const { ddjj, valorFiscal, valuacionFiscal, ganadera, vir, preferencial } = valoresEntrada;

  let total =
    m_ddjj * ddjj +
    m_valorFiscal * valorFiscal +
    m_valuacionFiscal * valuacionFiscal +
    m_ganadera * ganadera +
    m_vir * vir;

  if (preferencial) total *= 1 + porc_preferencial / 100;

  return total;
}

/**
 * Crea una tabla con los resultados de cada elemento con su cantidad y valor modular,
 * y la agrega a la sección de resultados del HTML.
 *
 * @param {object} valoresEntrada - Objeto con los valores de entrada del formulario.
 */
function crearTablaResultadosValuaciones(valoresEntrada) {
  const { ddjj, valorFiscal, valuacionFiscal, ganadera, vir, preferencial } = valoresEntrada;

  agregarFila("Declaracion Jurada", ddjj, m_ddjj, resultadosValuaciones);
  agregarFila("Valor Fiscal", valorFiscal, m_valorFiscal, resultadosValuaciones);
  agregarFila("Valuacion Fiscal", valuacionFiscal, m_valuacionFiscal, resultadosValuaciones);
  agregarFila("Ganadera", ganadera, m_ganadera, resultadosValuaciones);
  agregarFila("VIR", vir, m_vir, resultadosValuaciones);

  const montoPreferencial = preferencial
    ? preferencialValuaciones(ddjj, valorFiscal, valuacionFiscal, ganadera, vir)
    : 0;

  agregarFilaPreferencial(preferencial, montoPreferencial, resultadosValuaciones);
}

function mostrarTotalValuaciones() {
  const valoresEntrada = obtenerValoresEntradaValuaciones();
  const total = calcularValuacion(valoresEntrada);
  crearTablaResultadosValuaciones(valoresEntrada);
  visualizarTotal(total, "abonarValuacion");
}

const calcularValuacionBtn = document.getElementById("calcularValuacion-btn");
const limpiarValuacionBtn = document.getElementById("limpiarValuacion-btn");
const recalcularValuacionBtn = document.getElementById("recalcularValuacion-btn");

calcularValuacionBtn.addEventListener("click", () => {
  const valoresEntradaValuaciones = obtenerValoresEntradaValuaciones();

  if (valoresEntradaValuaciones === null) {
    return;
  }
  formularioValuaciones.style.display = "none";
  calcularValuacionBtn.style.display = "none";
  limpiarValuacionBtn.style.display = "none";
  resultadosValuaciones.style.display = "block";
  recalcularValuacionBtn.style.display = "block";
  mostrarTotalValuaciones();
});

recalcularValuacionBtn.addEventListener("click", () => {
  resultadosValuaciones.innerHTML = "";
  resultadosValuaciones.style.display = "none";
  recalcularValuacionBtn.style.display = "none";
  formularioValuaciones.style.display = "block";
  calcularValuacionBtn.style.display = "block";
  limpiarValuacionBtn.style.display = "block";
});

limpiarValuacionBtn.addEventListener("click", () => {
  const elementos = ["ddjjValuacion", "valorFiscal", "valuacionFiscal", "ganadera", "vir"];

  elementos.forEach((elemento) => {
    document.getElementById(elemento).value = "";
  });

  document.getElementById("preferencialValuacion").checked = false;
});
