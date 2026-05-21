// ============================================
//  INCIDENCIAS MUNICIPALES - Webhook a Sheets
//  Pega este código en Extensiones > Apps Script
// ============================================

// 1. ID de la carpeta de Drive donde se guardarán las fotos
//    (sustituye por el tuyo del Paso 2 de las instrucciones)
const FOLDER_ID = 'PEGA_AQUI_EL_ID_DE_LA_CARPETA';

// 2. Nombre de la hoja dentro del archivo (por defecto "Hoja 1" o "Sheet1")
const SHEET_NAME = 'Hoja 1';

// 3. CLAVE SECRETA - solo quien la conozca puede enviar incidencias.
//    Cámbiala por algo único. Recomendado: 20+ caracteres, letras + números + guiones.
//    Esta misma clave la tienes que poner en la app (pestaña Config).
const CLAVE_SECRETA = 'cambia-esto-por-una-clave-larga-y-unica';


function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // VALIDACIÓN DE CLAVE: rechaza cualquier petición sin la clave correcta
    if (!data.clave || data.clave !== CLAVE_SECRETA) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Acceso no autorizado' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
                 || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Guardar la foto en Drive y obtener su URL pública
    let fotoUrl = '';
    if (data.foto && data.foto.startsWith('data:image')) {
      fotoUrl = guardarFoto(data.foto, data.id);
    }

    // Enlace al mapa (Google Maps) para abrirlo con un clic
    const mapaUrl = `https://www.google.com/maps?q=${data.lat},${data.lng}`;

    // Añadir fila
    sheet.appendRow([
      data.id,
      new Date(data.fecha),
      data.tipo,
      data.descripcion,
      data.area,
      data.responsable,
      data.distrito,
      data.direccion,
      data.lat,
      data.lng,
      data.estado,
      mapaUrl,
      fotoUrl
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


function guardarFoto(dataUrl, incidenciaId) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  // dataUrl viene tipo "data:image/jpeg;base64,XXXXX"
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return '';
  const mimeType = match[1];
  const base64 = match[2];
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, incidenciaId + '.jpg');
  const file = folder.createFile(blob);
  // Hacer que la foto sea visible con el enlace
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}


// Función de prueba opcional: ejecuta esto desde el editor (botón "Ejecutar")
// para comprobar que el script tiene permisos antes de publicarlo.
function test() {
  doPost({
    postData: {
      contents: JSON.stringify({
        clave: CLAVE_SECRETA,
        id: 'TEST-' + Date.now(),
        fecha: new Date().toISOString(),
        tipo: 'Prueba',
        descripcion: 'Incidencia de prueba',
        area: 'Otros',
        responsable: 'Test',
        distrito: 'Test',
        direccion: 'Sant Boi de Llobregat',
        lat: 41.3429,
        lng: 2.0364,
        estado: 'Pendiente',
        foto: ''
      })
    }
  });
}
