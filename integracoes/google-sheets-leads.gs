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
var NOTIFY_EMAIL = 'agilitegestaosaude@gmail.com';   // recebe um aviso a cada lead ('' desliga)
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
    notify_(data, sheet);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Rode esta função uma vez pelo botão "Executar" do editor: o Google pede a permissão
// de enviar e-mail e já manda um aviso de teste para NOTIFY_EMAIL.
function testarAviso() {
  var sheet = getSheet_();
  MailApp.getRemainingDailyQuota();   // força o pedido de permissão de e-mail
  notify_({ nome: 'TESTE - aviso por e-mail', whatsapp: '(75) 98800-6363', email: '', cidade: 'Teste/BA',
            instagram: '@teste', impacto: 'Teste disparado pelo editor', utm_source: 'teste' }, sheet);
}

// Falha no e-mail (ex.: cota diária do Gmail) não pode impedir o lead de ser salvo
function notify_(data, sheet) {
  if (!NOTIFY_EMAIL) return;
  try {
    var whats = String(data.whatsapp || '').replace(/\D/g, '');
    var linhas = [
      'Nome: ' + (data.nome || ''),
      'WhatsApp: ' + (data.whatsapp || '') + (whats ? '  →  https://wa.me/55' + whats : ''),
      'E-mail: ' + (data.email || ''),
      'Cidade: ' + (data.cidade || ''),
      'Instagram: ' + (data.instagram || ''),
      'Impacto: ' + (data.impacto || ''),
      '',
      'Origem: ' + (data.utm_source || 'direto') + (data.utm_campaign ? ' / ' + data.utm_campaign : ''),
      '',
      'Planilha: ' + sheet.getParent().getUrl()
    ];
    var msg = {
      to: NOTIFY_EMAIL,
      subject: 'Novo lead na LP: ' + (data.nome || 'sem nome'),
      body: linhas.join('\n')
    };
    if (data.email) msg.replyTo = data.email;   // "Responder" no Gmail já vai para o lead
    MailApp.sendEmail(msg);
  } catch (err) {
    console.error('Falha ao enviar notificação: ' + err);
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
