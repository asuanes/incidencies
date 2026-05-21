# Configuración de Google Sheets — paso a paso

Sigue estos pasos UNA SOLA VEZ. Después la app envía las incidencias automáticamente.

---

## Paso 1: Crear la hoja de Google Sheets

1. Ve a https://sheets.google.com y crea una hoja nueva.
2. Llámala por ejemplo **"Incidencias Cunit"**.
3. En la fila 1 pon estas cabeceras (cópialas tal cual, en este orden):

```
ID	Fecha	Tipo	Descripción	Área	Responsable	Distrito	Dirección	Latitud	Longitud	Estado	URL Mapa	URL Foto
```

(Separadas por tabulación — pégalas en A1 y se distribuyen solas.)

---

## Paso 2: Crear una carpeta para las fotos

1. En Google Drive, crea una carpeta llamada **"Incidencias - Fotos"**.
2. Ábrela y mira la URL: `https://drive.google.com/drive/folders/XXXXXXXXX`
3. Copia el `XXXXXXXXX` (el ID de la carpeta). Lo necesitarás en el siguiente paso.

---

## Paso 3: Pegar el script

1. Dentro de tu hoja de Sheets, ve a menú **Extensiones → Apps Script**.
2. Se abre un editor. Borra todo lo que haya y pega el código de `Code.gs` (el archivo de al lado).
3. En la línea `const FOLDER_ID = 'PEGA_AQUI_EL_ID_DE_LA_CARPETA';` sustituye por el ID que copiaste en el paso 2.
4. Haz clic en el icono de disquete para guardar (o Ctrl+S). Dale un nombre al proyecto, p.ej. "Incidencias Webhook".

---

## Paso 4: Publicar como Web App

1. Arriba a la derecha, botón **Implementar → Nueva implementación**.
2. Engranaje al lado de "Seleccionar tipo" → elige **Aplicación web**.
3. Configura:
   - Descripción: lo que quieras
   - **Ejecutar como: Yo (tu correo)**
   - **Quién tiene acceso: Cualquier persona** ← esto es importante para que la app pueda enviar datos
4. Botón **Implementar**.
5. Google te pedirá autorización. Acepta. Si sale aviso de "no verificada", pulsa "Configuración avanzada → Ir a [tu proyecto] (no seguro)" y autoriza. Es tu propio script, es seguro.
6. Al final te da una **URL** que termina en `/exec`. **CÓPIALA**.

---

## Paso 5: Configurar la app

1. Abre la app de Incidencias en el móvil o el ordenador.
2. Ve a la pestaña **Config**.
3. Pega la URL en el campo y pulsa **Guardar configuración**.
4. Listo. A partir de ahora cada incidencia se envía automáticamente.

---

## ¿Y si no hay conexión?

La app guarda todas las incidencias en el dispositivo aunque estés en una zona sin cobertura. Cuando vuelva a haber red, se sincronizan solas. También puedes forzar la sincronización desde la pestaña Config.

---

## Para enviar la orden de trabajo por email

Una vez tengas las incidencias en Sheets, puedes:

**Opción A (manual):** filtras por responsable y mandas un email con el enlace a la hoja filtrada.

**Opción B (automática):** ampliar el script para que envíe email cuando llega una incidencia nueva. Si lo quieres dime y te paso el código extra (es añadir unas 10 líneas a `Code.gs`).
