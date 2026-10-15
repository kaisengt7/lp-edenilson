/**
 * Recebe os leads do formulário da LP e grava uma linha por envio na planilha.
 *
 * Instalação (uma vez, na conta Google que vai guardar os leads):
 *  1. Crie uma planilha no Google Sheets (ex.: "Leads LP Edenilson").
 *  2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo inteiro. Salve.
 *  3. Implantar → Nova implantação → tipo "App da Web".
 *       Executar como: Eu
 *       Quem pode acessar: Qualquer pessoa
 *     Autorize o acesso quando o Google pedir.
 *  4. Copie a URL que termina em /exec e cole em LEAD_FORM.sheetsUrl no index.html.
 *
 * Se editar este script depois, publique de novo em Implantar → Gerenciar implantações →
 * editar (lápis) → Versão: "Nova versão". Assim a URL /exec continua a mesma.
 *
 * As colunas seguem os nomes dos campos enviados pela LP. Campo novo no formulário vira
 * coluna nova no fim da planilha sozinho — não precisa mexer neste script.
 */

var SHEET_NAME = 'Leads';
var DEFAULT_COLUMNS = [
  'data', 'nome', 'whatsapp', 'email', 'cidade', 'instagram', 'impacto',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'pagina'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // campos que ainda não têm coluna ganham uma no fim
    Object.keys(data).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key).setFontWeight('bold');
      }
    });

    sheet.appendRow(headers.map(function (col) {
      if (col === 'data') return new Date();
      // prefixo ' evita que o Sheets interprete telefone ou texto como fórmula/número
      var v = data[col] == null ? '' : String(data[col]);
      return /^[=+\-@]/.test(v) || col === 'whatsapp' ? "'" + v : v;
    }));
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(DEFAULT_COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, DEFAULT_COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}
