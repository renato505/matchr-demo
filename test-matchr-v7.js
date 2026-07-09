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
  ['áreas comuns', html.includes('Áreas comuns do edifício') && html.includes('amenityChips')],
  ['modo essencial de áreas', html.includes('Tratar áreas selecionadas como essenciais') && html.includes('ruleAmenities')],
  ['seleção para WhatsApp', html.includes('Selecionar imóveis para WhatsApp') && html.includes('toggleSelection')],
  ['botão verde WhatsApp nos cards', html.includes('wa-card-icon') && html.includes('background:#25d366')],
  ['logos imobiliárias', html.includes('Bossa Nova Sotheby') && html.includes('Jardins & CO')]
];

let failed = 0;
for (const [name, ok] of staticChecks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed++;
}

const elements = {};
const checkedByDefault = new Set(['ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas','ruleAmenities']);
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
    removeAttribute() {},
    classList: { toggle() {} }
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

const amenityProfile = dbg.parseBriefing('Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas e precisa ter piscina e brinquedoteca no prédio.');
const amenityRows = dbg.rankedResults(amenityProfile);
const okAmenities = amenityRows.length > 0 && amenityRows.every(row => dbg.hasAmenity(row.imovel, 'piscina') && dbg.hasAmenity(row.imovel, 'brinquedoteca'));
console.log(`${okAmenities ? '✓' : '✗'} áreas comuns essenciais respeitadas`);
if (!okAmenities) failed++;

const parsedAmenities = dbg.parseAmenities('Família com dois filhos quer lazer completo, pet place, piscina, academia e brinquedoteca.');
const okParseAmenities = parsedAmenities.desired.includes('piscina') && parsedAmenities.desired.includes('academia') && parsedAmenities.desired.includes('brinquedoteca') && parsedAmenities.desired.includes('pet place');
console.log(`${okParseAmenities ? '✓' : '✗'} briefing entende áreas comuns`);
if (!okParseAmenities) failed++;

const dist = dbg.logoDistribution();
const counts = Object.values(dist);
const okDist = counts.length === 10 && counts.every(v => v === 300);
console.log(`${okDist ? '✓' : '✗'} distribuição proporcional de logos`);
if (!okDist) failed++;

vm.runInContext('selectedIds.add(currentMatches[0].imovel.id); document.getElementById("whatsappMessage").value = buildWhatsAppMessage();', context);
const msg = elements.whatsappMessage.value;
const okWhatsApp = /Oi/.test(msg) && /Compatibilidade/.test(msg) && /Condomínio/.test(msg) && /Quer que eu envie/.test(msg);
console.log(`${okWhatsApp ? '✓' : '✗'} mensagem de WhatsApp com condomínio`);
if (!okWhatsApp) failed++;

if (failed) process.exit(1);
console.log('Todos os testes do MatchR v7 passaram.');
