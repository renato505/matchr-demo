
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const forbidden = ['startVoice','SpeechRecognition','webkitSpeechRecognition','Falar busca','Reconhecimento de voz'];
for (const term of forbidden) {
  if (html.includes(term)) throw new Error(`Termo removido ainda aparece no HTML: ${term}`);
}
if (!html.includes('Encontre imóveis compatíveis com o cliente')) throw new Error('Novo posicionamento não encontrado');
if (!html.includes('Selecionar para WhatsApp')) throw new Error('Seleção para WhatsApp não encontrada');
if (!html.includes('openWhatsApp')) throw new Error('Função de WhatsApp não encontrada');

const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Script principal não encontrado');
const script = match[1];
class El {
  constructor(value='', checked=true){
    this.value=value; this.checked=checked; this.textContent=''; this.style={}; this.className=''; this.disabled=false; this.dataset={};
    this.classList={add(){}, remove(){}, toggle(){}}; this.options=[];
    Object.defineProperty(this,'innerHTML',{get:()=>this._innerHTML||'',set:(v)=>{this._innerHTML=String(v); this.options=[...String(v).matchAll(/<option(?:\s+value="([^"]*)")?[^>]*>([^<]*)<\/option>/g)].map(m=>({value:m[1]??m[2],text:m[2]}));}});
  }
  addEventListener(){}
  focus(){}
  select(){}
}
const ids = ['clienteNome','clienteBusca','bairro','tipo','preco','suites','vagas','ordem','briefingText','profileChips','inventory','resultSummary','above90','historyList','clientList','regressionResult','totalImoveis','toast','clienteTipo','clienteStatus','ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas','ruleSubtipos','selectionSummary','whatsappMessage','whatsappPhone'];
const elements = {};
for (const id of ids) elements[id] = new El('', true);
for (const id of ['ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas']) elements[id].checked = true;
elements.ruleSubtipos.checked = false;
elements.preco.innerHTML = '<option value="">Valor</option><option value="3">Até R$ 3 mi</option><option value="5">Até R$ 5 mi</option><option value="8">Até R$ 8 mi</option><option value="10">Até R$ 10 mi</option><option value="acima10">Acima de R$ 10 mi</option>';
elements.suites.innerHTML = '<option value="">Suítes</option><option value="1">1+ suíte</option><option value="2">2+ suítes</option><option value="3">3+ suítes</option><option value="4">4+ suítes</option><option value="5">5+ suítes</option>';
elements.vagas.innerHTML = '<option value="">Vagas</option><option value="1">1+ vaga</option><option value="2">2+ vagas</option><option value="3">3+ vagas</option><option value="4">4+ vagas</option><option value="5">5+ vagas</option>';
elements.ordem.innerHTML = '<option value="match">Maior compatibilidade</option><option value="precoAsc">Menor preço</option><option value="precoDesc">Maior preço</option><option value="areaDesc">Maior metragem</option><option value="areaAsc">Menor metragem</option>';
elements.clienteTipo.value='Lead'; elements.clienteStatus.value='Quente';
global.document = { getElementById:(id)=>elements[id] || (elements[id]=new El()), querySelectorAll:()=>[] };
global.window = { scrollTo(){}, open(){ global.__openedWhatsApp = true; } };
global.navigator = { clipboard:{ writeText: async()=>{} } };
global.setTimeout = () => 0; global.clearTimeout = () => {};
eval(script);
const dbg = window.MatchRDebug;
if (!dbg) throw new Error('Debug API não exposta');
if (dbg.version !== 'v5-briefing-whatsapp') throw new Error(`Versão incorreta: ${dbg.version}`);
const distribution = dbg.logoDistribution();
const counts = Object.values(distribution);
if (counts.length !== 10 || !counts.every(c=>c===300)) throw new Error(`Distribuição de logos incorreta: ${JSON.stringify(distribution)}`);
const profile = dbg.parseBriefing('Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.');
const rows = dbg.rankedResults(profile);
if (!rows.length) throw new Error('Nenhum resultado para regressão');
if (rows.some(row => row.imovel.tipo === 'Casa')) throw new Error('Busca por apartamento retornou casa');
if (rows.some(row => row.imovel.bairro !== 'Moema')) throw new Error('Busca por Moema retornou outro bairro');
if (rows.some(row => row.imovel.preco > 5)) throw new Error('Busca até R$ 5 mi retornou acima do teto');
elements.briefingText.value = 'Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.';
searchWithProfile(false);
const top = dbg.getCurrentMatches()[0];
if (!top) throw new Error('Sem top match para WhatsApp');
dbg.toggleSelection(top.imovel.id);
const msg = dbg.buildWhatsAppMessage();
if (!msg.includes(top.imovel.titulo) || !msg.includes('Perfil considerado')) throw new Error('Mensagem de WhatsApp incompleta');
if (dbg.formatWhatsAppPhone('(11) 99999-8888') !== '5511999998888') throw new Error('Formatação de telefone falhou');
console.log('PASS — v5 OK: briefing, matching, logos e WhatsApp.');
