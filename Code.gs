var SHEET_ID = "COLLE_ICI_ID_SHEET";

function doGet(e) {
  var action = e.parameter.action;
  var source = e.parameter.source || "pc";
  var result;
  if (action === "get") { result = getData(); }
  else if (action === "hit") { result = hitCounter(source); }
  else if (action === "reset") { result = resetCounter(); }
  else { result = { error: "unknown" }; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getData() {
  var sheet = getSheet();
  return { count: getCount(sheet), history: getHistory(sheet) };
}

function hitCounter(source) {
  var sheet = getSheet();
  var count = getCount(sheet) + 1;
  setCount(sheet, count);
  var date = Utilities.formatDate(new Date(), "Europe/Paris", "dd/MM/yyyy HH:mm");
  appendHistory(sheet, { date: date, source: source, id: Date.now() });
  return { count: count, history: getHistory(sheet) };
}

function resetCounter() {
  var sheet = getSheet();
  setCount(sheet, 0);
  clearHistory(sheet);
  return { count: 0, history: [] };
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("tracker");
  if (!sheet) {
    sheet = ss.insertSheet("tracker");
    sheet.getRange("A1").setValue(0);
    sheet.getRange("B1").setValue("[]");
  }
  return sheet;
}

function getCount(sheet) {
  return parseInt(sheet.getRange("A1").getValue()) || 0;
}

function setCount(sheet, n) {
  sheet.getRange("A1").setValue(n);
}

function getHistory(sheet) {
  try { return JSON.parse(sheet.getRange("B1").getValue() || "[]"); }
  catch(e) { return []; }
}

function appendHistory(sheet, entry) {
  var h = getHistory(sheet);
  h = [entry].concat(h).slice(0, 50);
  sheet.getRange("B1").setValue(JSON.stringify(h));
}

function clearHistory(sheet) {
  sheet.getRange("B1").setValue("[]");
}
