/* ============================================================
   seguimiento.gs  ·  Google Apps Script
   Backend gratuito para registrar las interacciones en una
   Google Sheet. No necesitas servidor propio.
   ------------------------------------------------------------
   CÓMO INSTALARLO (una sola vez):
   1. Crea una Google Sheet nueva (será tu base de datos).
   2. En el menú: Extensiones → Apps Script.
   3. Borra el código de ejemplo y pega TODO este archivo.
   4. Guarda. Luego: Implementar → Nueva implementación →
      tipo "Aplicación web".
        - Ejecutar como: Yo
        - Quién tiene acceso: Cualquier usuario
   5. Copia la URL que termina en /exec.
   6. Pega esa URL en js/config.js  →  ENDPOINT: "https://.../exec"
   ============================================================ */

var HOJA = "eventos";
var ENCABEZADOS = ["fecha","sesion","correo","nombre","apellido","tema","tipo","detalle","valor","url"];

function getHoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(ENCABEZADOS);
  }
  return sh;
}

// Recibe un evento desde el sitio y lo agrega como fila
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = getHoja_();
    sh.appendRow([
      d.ts || new Date().toISOString(),
      d.sesion || "", d.correo || "", d.nombre || "", d.apellido || "",
      d.tema || "", d.tipo || "", d.detalle || "", d.valor || "", d.url || ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Devuelve todos los eventos en JSON para el dashboard
function doGet() {
  var sh = getHoja_();
  var datos = sh.getDataRange().getValues();
  var cab = datos.shift();
  var salida = datos.map(function(fila) {
    var o = {};
    cab.forEach(function(c, i) { o[c === "fecha" ? "ts" : c] = fila[i]; });
    return o;
  });
  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}
