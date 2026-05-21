// ============================================
//  INCIDENCIAS - Webhook a Sheets
//  Versión con login Google (OAuth)
//
//  Sustituye el código anterior por este. Después
//  hay que DESPLEGAR NUEVA VERSIÓN para que los
//  cambios entren en efecto en la URL pública.
// ============================================
 
// --- CONFIGURACIÓN ---
 
// 1. ID de la carpeta de Drive donde se guardan las fotos
const FOLDER_ID = '1EQ18BU2CTdmXWJxH_VG14R9KIDN8Q97V';
 
// 2. Nombre de la pestaña dentro del archivo
const SHEET_NAME = 'Hoja 1';
 
// 3. Client ID de Google Cloud (el que terminaba en .apps.googleusercontent.com)
//    Sustituye el de abajo por el tuyo.
const CLIENT_ID = '884701444668-iohpqp36onh3qtm3doneabkt1bbscdqe.apps.googleusercontent.com';
 
// 4. Lista de correos autorizados a registrar incidencias.
//    Añade aquí los correos del ayuntamiento. Tienen que ser
//    exactamente los mismos con los que la persona hace login.
//    Para quitar acceso a alguien, basta con borrar su correo de la lista.
const CORREOS_AUTORIZADOS = [
  'asuanes@santboi.cat',
  // 'compañero1@santboi.cat',
  // 'compañera2@santboi.cat',
];
 
 
// --- LÓGICA PRINCIPAL ---
 
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
 
    // 1. Validar que la petición trae un token de Google
    if (!data.token) {
      return jsonResponse({ ok: false, error: 'Falta token de autenticación' });
    }
 
    // 2. Verificar el token con Google (criptográficamente)
    const usuario = verificarTokenGoogle(data.token);
    if (!usuario) {
      return jsonResponse({ ok: false, error: 'Token no válido o caducado' });
    }
 
    // 3. Comprobar que el correo está en la lista de autorizados
    const correoNormalizado = usuario.email.toLowerCase().trim();
    const autorizados = CORREOS_AUTORIZADOS.map(c => c.toLowerCase().trim());
    if (!autorizados.includes(correoNormalizado)) {
      return jsonResponse({
        ok: false,
        error: 'Correo ' + usuario.email + ' no autorizado'
      });
    }
 
    // 4. Comprobar que el Client ID del token es el nuestro
    //    (evita que tokens de otras apps Google sirvan aquí)
    if (usuario.aud !== CLIENT_ID) {
      return jsonResponse({ ok: false, error: 'Token de otra aplicación' });
    }
 
    // 5. Todo correcto: guardar la incidencia
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
                 || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
 
    let fotoUrl = '';
    if (data.foto && data.foto.startsWith('data:image')) {
      fotoUrl = guardarFoto(data.foto, data.id);
    }
 
    const mapaUrl = 'https://www.google.com/maps?q=' + data.lat + ',' + data.lng;
 
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
      fotoUrl,
      usuario.email  // Quién registró la incidencia (columna N)
    ]);
 
    return jsonResponse({ ok: true, id: data.id, usuario: usuario.email });
 
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}
 
 
// --- VERIFICACIÓN DE TOKEN GOOGLE ---
 
function verificarTokenGoogle(token) {
  try {
    // Llamamos al endpoint oficial de Google para verificar el token.
    // Google nos devuelve los datos del usuario si el token es válido,
    // o un error si está caducado o manipulado.
    const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token);
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
 
    if (response.getResponseCode() !== 200) {
      return null;
    }
 
    const data = JSON.parse(response.getContentText());
 
    // Comprobar campos esenciales
    if (!data.email || !data.email_verified) {
      return null;
    }
 
    return {
      email: data.email,
      name: data.name || '',
      aud: data.aud  // a quién va dirigido el token (debe ser nuestro CLIENT_ID)
    };
  } catch (e) {
    return null;
  }
}
 
 
// --- UTILIDADES ---
 
function guardarFoto(dataUrl, incidenciaId) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return '';
  const mimeType = match[1];
  const base64 = match[2];
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, incidenciaId + '.jpg');
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}
 
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
 
// Para probar manualmente desde el editor: NO funciona con OAuth real
// porque hace falta un token de Google obtenido por la app.
// La forma de probar es directamente desde la app web.
