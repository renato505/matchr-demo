const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) throw new Error('Script principal não encontrado.');

const staticChecks = [
  ['sem botão de fala', !html.includes('🎙️') && !html.includes('Falar busca')],
  ['sem Web Speech API', !html.includes('SpeechRecognition') && !html.includes('webkitSpeechRecognition') && !html.includes('startVoice')],
  ['posicionamento correto', html.includes('Encontre imóveis compatíveis com o cliente')],
  ['briefing inteligente', html.includes('Briefing inteligente do cliente')],
  ['seleção para WhatsApp', html.includes('Selecionar imóveis para WhatsApp') && html.includes('toggleSelection')],
  ['botão verde WhatsApp nos cards', html.includes('wa-card-icon') && html.includes('background:#25d366')],
  ['seletor no final do card', html.indexOf('<div class="why">') !== -1 && html.indexOf('<label class="select-line"') > html.indexOf('<div class="why">')],
  ['logos imobiliárias', html.includes('Bossa Nova Sotheby') && html.includes('Jardins & CO')]
];

let failed = 0;
for (const [name, ok] of staticChecks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed++;
}

const elements = {};
const checkedByDefault = new Set(['ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas']);
function makeElement(id) {
  return {
    id,
    value: '',
    innerHTML: '',
    textContent: '',
    placeholder: '',
    className: '',
    style: { display: '' },
    checked: checkedByDefault.has(id),
    options: [],
    addEventListener() {},
    focus() {},
    select() {},
    setAttribute() {},
    removeAttribute() {}
  };
}
const document = {
  getElementById(id) { return elements[id] || (elements[id] = makeElement(id)); },
  querySelectorAll() { return []; },
  execCommand() { return true; }
};
const context = {
  console,
  document,
  setTimeout,
  clearTimeout,
  Intl,
  window: { scrollTo() {}, open() {} },
  navigator: { clipboard: { writeText: async () => {} } }
};
context.global = context;
vm.createContext(context);
vm.runInContext(scriptMatch[1], context, { timeout: 5000 });

const dbg = context.window.MatchRDebug;
if (!dbg) throw new Error('MatchRDebug não exposto.');

const profile = dbg.parseBriefing('Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.');
const rows = dbg.rankedResults(profile);
const okMatch = rows.length > 0 && rows.every(row => row.imovel.tipo === 'Apartamento' && row.imovel.bairro === 'Moema' && row.imovel.preco <= 5 && row.imovel.suites >= 3 && row.imovel.vagas >= 2);
console.log(`${okMatch ? '✓' : '✗'} matching sem casas na busca por apartamento`);
if (!okMatch) failed++;

const dist = dbg.logoDistribution();
const counts = Object.values(dist);
const okDist = counts.length === 10 && counts.every(v => v === 300);
console.log(`${okDist ? '✓' : '✗'} distribuição proporcional de logos`);
if (!okDist) failed++;

vm.runInContext('selectedIds.add(currentMatches[0].imovel.id); document.getElementById("whatsappMessage").value = buildWhatsAppMessage();', context);
const msg = elements.whatsappMessage.value;
const okWhatsApp = /Oi/.test(msg) && /Compatibilidade/.test(msg) && /Quer que eu envie/.test(msg);
console.log(`${okWhatsApp ? '✓' : '✗'} mensagem de WhatsApp gerada`);
if (!okWhatsApp) failed++;

if (failed) process.exit(1);
console.log('Todos os testes do MatchR v6 passaram.');
