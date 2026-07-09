
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Script principal não encontrado em index.html');
const script = match[1];

class El {
  constructor(value = '', checked = true) {
    this.value = value;
    this.checked = checked;
    this.textContent = '';
    this.style = {};
    this.className = '';
    this.dataset = {};
    this.classList = { add(){}, remove(){}, toggle(){} };
    this.options = [];
    Object.defineProperty(this, 'innerHTML', {
      get: () => this._innerHTML || '',
      set: (v) => {
        this._innerHTML = String(v);
        this.options = [...String(v).matchAll(/<option(?:\s+value="([^"]*)")?[^>]*>([^<]*)<\/option>/g)]
          .map(m => ({ value: m[1] ?? m[2], text: m[2] }));
      }
    });
  }
  addEventListener() {}
}

const ids = [
  'clienteNome','clienteBusca','bairro','tipo','preco','suites','vagas','ordem','voiceSearchText',
  'profileChips','inventory','resultSummary','above90','historyList','clientList','regressionResult',
  'totalImoveis','toast','clienteTipo','clienteStatus','ruleTipo','ruleBairro','rulePreco',
  'ruleSuites','ruleVagas','ruleSubtipos'
];
const elements = {};
for (const id of ids) elements[id] = new El('', true);
for (const id of ['ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas']) elements[id].checked = true;
elements.ruleSubtipos.checked = false;
elements.preco.innerHTML = '<option value="">Valor</option><option value="3">Até R$ 3 mi</option><option value="5">Até R$ 5 mi</option><option value="8">Até R$ 8 mi</option><option value="10">Até R$ 10 mi</option><option value="acima10">Acima de R$ 10 mi</option>';
elements.suites.innerHTML = '<option value="">Suítes</option><option value="1">1+ suíte</option><option value="2">2+ suítes</option><option value="3">3+ suítes</option><option value="4">4+ suítes</option><option value="5">5+ suítes</option>';
elements.vagas.innerHTML = '<option value="">Vagas</option><option value="1">1+ vaga</option><option value="2">2+ vagas</option><option value="3">3+ vagas</option><option value="4">4+ vagas</option><option value="5">5+ vagas</option>';
elements.ordem.innerHTML = '<option value="match">Maior compatibilidade</option><option value="precoAsc">Menor preço</option><option value="precoDesc">Maior preço</option><option value="areaDesc">Maior metragem</option><option value="areaAsc">Menor metragem</option>';
elements.clienteTipo.value = 'Lead';
elements.clienteStatus.value = 'Quente';

global.document = {
  getElementById: (id) => elements[id] || (elements[id] = new El()),
  querySelectorAll: () => []
};
global.window = { scrollTo(){}, SpeechRecognition: null, webkitSpeechRecognition: null };
global.setTimeout = () => 0;
global.clearTimeout = () => {};

eval(script);

const dbg = window.MatchRDebug;
if (!dbg) throw new Error('window.MatchRDebug não foi exposto');

const distribution = dbg.logoDistribution();
const counts = Object.values(distribution);
if (counts.length !== 10) {
  throw new Error(`Esperava 10 imobiliárias na distribuição, recebi ${counts.length}: ${JSON.stringify(distribution)}`);
}
if (!counts.every(count => count === 300)) {
  throw new Error(`Distribuição deveria ser 300 para cada imobiliária: ${JSON.stringify(distribution)}`);
}

const profile = dbg.parseBriefing('Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.');
const rows = dbg.rankedResults(profile);
if (!rows.length) throw new Error('Nenhum resultado para a busca de regressão');
if (rows.some(row => row.imovel.tipo === 'Casa')) throw new Error('Busca por apartamento retornou casa');
if (rows.some(row => row.imovel.bairro !== 'Moema')) throw new Error('Busca por Moema retornou outro bairro');
if (rows.some(row => row.imovel.preco > 5)) throw new Error('Busca até R$ 5 mi retornou imóvel acima do teto');
if (rows.some(row => !row.imovel.imobiliaria || !row.imovel.imobiliariaLogo)) throw new Error('Algum imóvel sem foto não recebeu logo de imobiliária');

console.log('PASS — matching OK e logos distribuídos proporcionalmente:', distribution);
