const SHEET_NAME = "Resultados";
const HEADERS = [
  "Fecha de recepcion",
  "ID de envio",
  "Estudiante",
  "Grupo",
  "Inicio",
  "Finalizacion",
  "Minutos",
  "Puntaje",
  "Intentos",
  "Pistas",
  "Retos completados",
  "Respuestas JSON",
];

function setup() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Configura la propiedad SPREADSHEET_ID antes de ejecutar setup().");

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse(event.postData.contents);
    validatePayload(payload);

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Ejecuta setup() para crear la hoja de resultados.");

    const duplicate = sheet.createTextFinder(payload.submissionId).matchEntireCell(true).findNext();
    if (duplicate) return jsonResponse({ ok: true, duplicate: true });

    sheet.appendRow([
      new Date(),
      safeCell(payload.submissionId),
      safeCell(payload.student),
      safeCell(payload.group || ""),
      payload.startedAt,
      payload.finishedAt,
      Number(payload.elapsedMinutes),
      Number(payload.score),
      Number(payload.attempts),
      Number(payload.hints),
      Number(payload.completedChallenges),
      safeCell(JSON.stringify(payload.answers)),
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function validatePayload(payload) {
  if (!payload || payload.activity !== "Mision: liberar el esqueleto") {
    throw new Error("Actividad no reconocida.");
  }
  if (typeof payload.submissionId !== "string" || payload.submissionId.length < 16) {
    throw new Error("Identificador de envio no valido.");
  }
  if (typeof payload.student !== "string" || payload.student.length < 2 || payload.student.length > 80) {
    throw new Error("Nombre de estudiante no valido.");
  }
  if (payload.completedChallenges !== 5) {
    throw new Error("La mision no esta completa.");
  }
}

function safeCell(value) {
  const text = String(value).slice(0, 45000);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
