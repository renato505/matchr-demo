
global.window={addEventListener:()=>{}, scrollTo:()=>{}, toastTimer:null};
const elements={};
function el(value='', checked=true){return {value,checked,selectedIndex:0,options:[{value:'',text:''}],textContent:'',innerHTML:'',style:{},classList:{remove(){},add(){},toggle(){}}};}
['clienteNome','bairro','tipo','preco','suites','vagas','ordem','voiceSearchText','voiceSearchChips','voiceSearchStatus','understanding','inventory','resultTitle','resultSub','dashboardScore','above90','toast','totalImoveis','searchHistory','selectedSearch'].forEach(id=>elements[id]=el(''));
elements.ordem.value='score';
['ruleTipo','ruleBairro','rulePreco','ruleSuites','ruleVagas'].forEach(id=>elements[id]=el('', true));
elements.rulePreferenciasHard=el('', false);
global.document={
  getElementById:(id)=>elements[id]||el(''),
  querySelectorAll:()=>[],
};
global.navigator={clipboard:{writeText:()=>{}}};

const BAIRROS = ['Moema','Itaim Bibi','Vila Nova Conceição','Jardins','Jardim América','Pinheiros','Vila Madalena','Alto de Pinheiros','Brooklin','Campo Belo','Perdizes','Higienópolis','Morumbi','Cidade Jardim','Vila Olímpia','Paraíso','Chácara Klabin','Pacaembu'];
const TIPOS = ['Apartamento','Casa','Cobertura','Studio'];
const FEATURE_POOL = ['varanda gourmet','vista aberta','rua tranquila','muita luz natural','jardim','piscina','sauna','rooftop','academia','segurança','elevador privativo','pé-direito alto','arquitetura autoral','reforma contemporânea','janelas piso-teto','home office','closet','lareira','boa liquidez','preço competitivo','planta familiar','perto do parque','churrasqueira'];
const SEED_PROPERTIES = [
 {id:'MVP-001',tipo:'Apartamento',bairro:'Moema',endereco:'Alameda dos Jurupis',preco:4.8,area:182,suites:3,vagas:2,diferenciais:['varanda gourmet','vista aberta','academia','elevador privativo','muita luz natural'],descricao:'Apartamento amplo em Moema com varanda gourmet, vista aberta e planta muito funcional.',baseScore:96},
 {id:'MVP-002',tipo:'Apartamento',bairro:'Moema',endereco:'Av. Rouxinol',preco:3.9,area:158,suites:3,vagas:2,diferenciais:['varanda gourmet','rua tranquila','segurança','reforma contemporânea','planta familiar'],descricao:'Apartamento reformado, silencioso e pronto para família que busca Moema com bom custo-benefício.',baseScore:93},
 {id:'MVP-003',tipo:'Apartamento',bairro:'Moema',endereco:'Rua Gaivota',preco:4.6,area:170,suites:3,vagas:3,diferenciais:['vista aberta','área gourmet','muita luz natural','janelas piso-teto'],descricao:'Opção luminosa, com vista livre e ótima distribuição interna.',baseScore:91},
 {id:'MVP-004',tipo:'Casa',bairro:'Moema',endereco:'Rua Canário',preco:4.4,area:240,terreno:300,suites:3,vagas:3,diferenciais:['jardim','piscina','rua tranquila','churrasqueira'],descricao:'Casa em rua calma de Moema. Deve aparecer para busca de casa, não para apartamento.',baseScore:89},
 {id:'MVP-005',tipo:'Cobertura',bairro:'Moema',endereco:'Av. Jamaris',preco:7.8,area:260,suites:4,vagas:4,diferenciais:['rooftop','piscina','vista aberta','área gourmet'],descricao:'Cobertura com vista e área social generosa.',baseScore:94},
 {id:'MVP-006',tipo:'Apartamento',bairro:'Itaim Bibi',endereco:'Rua João Cachoeira',preco:5.4,area:164,suites:3,vagas:2,diferenciais:['varanda gourmet','home office','academia','boa liquidez'],descricao:'Apartamento no Itaim com perfil urbano e alta liquidez.',baseScore:90}
];
let seed = 505;
function rand(){seed = (seed * 9301 + 49297) % 233280; return seed / 233280;}
function pick(arr){return arr[Math.floor(rand()*arr.length)]}
function buildInventory(){
  const imoveis = SEED_PROPERTIES.map(x=>({...x}));
  for(let i=imoveis.length+1;i<=3000;i++){
    const tipo = pick(TIPOS);
    const bairro = pick(BAIRROS);
    const areaBase = tipo==='Studio' ? 42 + Math.round(rand()*45) : tipo==='Casa' ? 180 + Math.round(rand()*420) : tipo==='Cobertura' ? 180 + Math.round(rand()*380) : 88 + Math.round(rand()*240);
    const suites = tipo==='Studio' ? Math.max(1, Math.round(rand()*1)) : Math.min(5, Math.max(1, Math.round(areaBase/70) + (rand()>.72?1:0)));
    const vagas = tipo==='Studio' ? Math.round(rand()*2) : Math.min(6, Math.max(1, Math.round(areaBase/85) + (rand()>.65?1:0)));
    const premiumBairro = ['Itaim Bibi','Vila Nova Conceição','Jardins','Jardim América','Cidade Jardim'].includes(bairro) ? 1.22 : ['Moema','Pinheiros','Vila Olímpia','Higienópolis'].includes(bairro) ? 1.08 : 0.96;
    const tipoMult = tipo==='Casa' ? 1.12 : tipo==='Cobertura' ? 1.45 : tipo==='Studio' ? 0.74 : 1;
    const preco = Number(Math.max(1.1, (areaBase * 0.018 * premiumBairro * tipoMult) + rand()*1.8).toFixed(1));
    const shuffled = [...FEATURE_POOL].sort(()=>rand()-.5);
    const diferenciais = shuffled.slice(0, 4 + Math.floor(rand()*3));
    if(tipo==='Casa' && !diferenciais.includes('jardim')) diferenciais[0] = 'jardim';
    if(tipo==='Cobertura' && !diferenciais.includes('rooftop')) diferenciais[1] = 'rooftop';
    if(tipo==='Studio' && !diferenciais.includes('boa liquidez')) diferenciais[0] = 'boa liquidez';
    const endTipo = ['Rua','Alameda','Av.'][Math.floor(rand()*3)];
    const endereco = `${endTipo} ${pick(['Jacarandá','das Acácias','Rouxinol','Harmonia','Verde','Horizonte','das Artes','Boa Vista','Serena','do Parque'])}`;
    const descricao = `${tipo} em ${bairro} com ${diferenciais.slice(0,3).join(', ')} e curadoria para cliente de alto padrão.`;
    imoveis.push({id:'IMV-'+String(i).padStart(4,'0'),tipo,bairro,endereco,preco,area:areaBase,terreno:tipo==='Casa'?areaBase+Math.round(rand()*280):null,suites,vagas,diferenciais,descricao,baseScore:72+Math.round(rand()*26)});
  }
  return imoveis;
}
const IMOVEIS = buildInventory();
let voiceState = emptyVoiceState();
let searchHistory = [];
let activeSearchId = null;
let leads = [
  {nome:'Mariana',tipo:'Cliente',status:'Quente',busca:'Apartamento em Moema até R$ 5 mi, 3 suítes e varanda'},
  {nome:'Eduardo',tipo:'Lead',status:'Morno',busca:'Casa no Alto de Pinheiros com jardim'},
  {nome:'Carolina',tipo:'Cliente',status:'Quente',busca:'Cobertura em Pinheiros com vista aberta'}
];
function emptyVoiceState(){return {text:'',cliente:'',bairro:'',tipo:'',priceMaxMi:null,priceMinMi:null,priceBucket:'',suitesMin:null,vagasMin:null,areaMin:null,features:[],profile:'',order:''}}
function norm(str){return String(str||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function escapeHtml(str){return String(str||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function br(n){return Number(n||0).toLocaleString('pt-BR')}
function money(mi){return 'R$ '+Number(mi||0).toLocaleString('pt-BR',{minimumFractionDigits: mi<10?1:0, maximumFractionDigits:1})+' mi'}
function toast(msg){const el=document.getElementById('toast'); el.textContent=msg; el.style.display='block'; clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.style.display='none',2600)}
function goId(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); document.getElementById(id).classList.add('active'); document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.target===id)); window.scrollTo({top:0,behavior:'smooth'})}
function labelOf(el){return el && el.selectedIndex>0 ? el.options[el.selectedIndex].text : ''}
function setSelect(id,value){const el=document.getElementById(id); if(!el)return; const exists=[...el.options].some(o=>o.value===value || o.text===value); if(exists)el.value=value||''}
function parseCliente(text){const raw=String(text||''); const m=raw.match(/cliente\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/i); if(!m)return ''; return m[1].replace(/\s+(quer|procura|busca|precisa).*$/i,'').trim()}
function parseTipo(text){const s=norm(text); if(/\b(cobertura|penthouse)\b/.test(s))return 'Cobertura'; if(/\b(studio|kitnet|loft)\b/.test(s))return 'Studio'; if(/\b(casa|casas|sobrado|sobrados)\b/.test(s))return 'Casa'; if(/\b(apartamento|apartamentos|apto|aptos|ape|apes)\b/.test(s))return 'Apartamento'; return ''}
function parseBairro(text){const s=norm(text); const aliases = {'jardins':'Jardins','jd america':'Jardim América','jardim america':'Jardim América','vila nova conceicao':'Vila Nova Conceição','v nova conceicao':'Vila Nova Conceição','itaim':'Itaim Bibi','itaim bibi':'Itaim Bibi','vila olimpia':'Vila Olímpia','chacara klabin':'Chácara Klabin','alto de pinheiros':'Alto de Pinheiros'}; for(const [k,v] of Object.entries(aliases)){if(s.includes(k))return v} return BAIRROS.find(b=>s.includes(norm(b)))||''}
function wordToNumber(s){const map={um:1,uma:1,dois:2,duas:2,tres:3,três:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10}; return map[norm(s)]||null}
function parseMin(text,terms){const s=norm(text).replace(/,/g,'.'); const term = terms.join('|'); const re1 = new RegExp('(\\d+)\\s*(\\+|ou mais)?\\s*('+term+')','i'); const m1=s.match(re1); if(m1)return Number(m1[1]); const re2 = new RegExp('\\b(um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)\\s*('+term+')','i'); const m2=s.match(re2); if(m2)return wordToNumber(m2[1]); return null}
function parseArea(text){const s=norm(text).replace(/,/g,'.'); const matches=[...s.matchAll(/(\d{2,4})\s*(m2|m²|metros|metro|m\b)/g)].map(m=>Number(m[1])); if(!matches.length)return null; return Math.max(...matches)}
function parseBudget(text){
  const s=norm(text).replace(/,/g,'.');
  const number = '(\\d+(?:\\.\\d+)?)';
  const ate = [...s.matchAll(new RegExp('(?:ate|maximo|teto|limite|no maximo|até)\\s*(?:r\\$)?\\s*'+number+'\\s*(?:mi|milhoes|milhao|m)?','g'))].map(m=>Number(m[1]));
  const acima = [...s.matchAll(new RegExp('(?:acima|mais de|a partir de)\\s*(?:r\\$)?\\s*'+number+'\\s*(?:mi|milhoes|milhao|m)?','g'))].map(m=>Number(m[1]));
  const entre = s.match(new RegExp('entre\\s*(?:r\\$)?\\s*'+number+'\\s*(?:e|a)\\s*(?:r\\$)?\\s*'+number+'\\s*(?:mi|milhoes|milhao|m)?'));
  if(entre){return {min:Number(entre[1]), max:Number(entre[2]), bucket:String(Math.ceil(Number(entre[2])))} }
  if(ate.length){const max=Math.max(...ate); return {min:null,max,bucket:max>10?'acima10':String(Math.ceil(max))}}
  if(acima.length){const min=Math.min(...acima); return {min,bucket:min>=10?'acima10':''}}
  const solto = s.match(new RegExp('(?:r\\$)?\\s*'+number+'\\s*(?:mi|milhoes|milhao)'));
  if(solto){const max=Number(solto[1]); return {min:null,max,bucket:max>10?'acima10':String(Math.ceil(max))}}
  return {min:null,max:null,bucket:''}
}
function parseFeatures(text){
  const s=norm(text); const found=[];
  const map={
    'varanda gourmet':['varanda gourmet','area gourmet','área gourmet','gourmet'],
    'varanda integrada':['varanda integrada','varanda ampla','terraco integrado'],
    'vista aberta':['vista aberta','vista livre','vista definitiva','vista skyline'],
    'rua tranquila':['rua tranquila','rua calma','rua silenciosa','silencioso'],
    'muita luz natural':['muita luz natural','luz natural','iluminado','bem iluminado','ensolarado'],
    'jardim':['jardim','quintal'],
    'piscina':['piscina'],
    'rooftop':['rooftop'],
    'sauna':['sauna'],
    'academia':['academia','fitness'],
    'segurança':['seguranca','segurança','portaria blindada','condominio seguro'],
    'elevador privativo':['elevador privativo'],
    'pé-direito alto':['pe direito alto','pé direito alto','pé-direito alto'],
    'arquitetura autoral':['arquitetura autoral','projeto autoral'],
    'reforma contemporânea':['reforma contemporanea','reforma contemporânea','reformado','reformada'],
    'janelas piso-teto':['janelas piso teto','janelas piso-teto'],
    'home office':['home office','escritorio','escritório'],
    'closet':['closet'],
    'lareira':['lareira'],
    'perto do parque':['perto do parque','proximo ao parque','próximo ao parque'],
    'churrasqueira':['churrasqueira']
  };
  Object.entries(map).forEach(([label,terms])=>{if(terms.some(t=>s.includes(norm(t))) && !found.includes(label))found.push(label)});
  if(/familia|filhos|crian/.test(s)){['planta familiar','segurança','rua tranquila'].forEach(f=>{if(!found.includes(f))found.push(f)})}
  if(/investidor|renda|liquidez|revenda/.test(s)){['boa liquidez','preço competitivo'].forEach(f=>{if(!found.includes(f))found.push(f)})}
  return found;
}
function parseProfile(text){const s=norm(text); if(/familia|filhos|crian/.test(s))return 'Família'; if(/investidor|renda|liquidez/.test(s))return 'Investidor'; if(/executivo|expatriado|relocacao/.test(s))return 'Executivo / expatriado'; if(/casal/.test(s))return 'Casal'; return ''}
function parseOrder(text){const s=norm(text); if(/menor\s+preco|mais\s+barato/.test(s))return 'preco_asc'; if(/maior\s+preco|mais\s+caro/.test(s))return 'preco_desc'; if(/menor\s+(metragem|area)/.test(s))return 'area_asc'; if(/maior\s+(metragem|area)/.test(s))return 'area_desc'; return ''}
function parseSearch(text){const budget=parseBudget(text); return {text:String(text||'').trim(),cliente:parseCliente(text),bairro:parseBairro(text),tipo:parseTipo(text),priceMaxMi:budget.max,priceMinMi:budget.min,priceBucket:budget.bucket,suitesMin:parseMin(text,['suite','suites']),vagasMin:parseMin(text,['vaga','vagas','garagem','garagens']),areaMin:parseArea(text),features:parseFeatures(text),profile:parseProfile(text),order:parseOrder(text)}}
function rules(){return {tipoHard:document.getElementById('ruleTipo')?.checked!==false,bairroHard:document.getElementById('ruleBairro')?.checked!==false,precoHard:document.getElementById('rulePreco')?.checked!==false,suitesHard:document.getElementById('ruleSuites')?.checked!==false,vagasHard:document.getElementById('ruleVagas')?.checked!==false,preferenciasHard:document.getElementById('rulePreferenciasHard')?.checked===true}}
function chipsHtml(parsed){const chips=[]; if(parsed.cliente)chips.push('Cliente: '+parsed.cliente); if(parsed.bairro)chips.push('Bairro: '+parsed.bairro); if(parsed.tipo)chips.push('Tipo: '+parsed.tipo); if(parsed.priceMinMi)chips.push('Preço: acima de R$ '+String(parsed.priceMinMi).replace('.',',')+' mi'); if(parsed.priceMaxMi)chips.push('Preço: até R$ '+String(parsed.priceMaxMi).replace('.',',')+' mi'); if(parsed.suitesMin)chips.push('Suítes: '+parsed.suitesMin+'+'); if(parsed.vagasMin)chips.push('Vagas: '+parsed.vagasMin+'+'); if(parsed.areaMin)chips.push('Área: '+parsed.areaMin+'+ m²'); if(parsed.profile)chips.push('Perfil: '+parsed.profile); if(parsed.features.length)chips.push('Preferências: '+parsed.features.join(', ')); if(parsed.order)chips.push('Critério: '+orderLabel(parsed.order)); return chips.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}
function orderLabel(value){return {score:'Melhor match',preco_desc:'Maior preço',preco_asc:'Menor preço',area_desc:'Maior metragem',area_asc:'Menor metragem'}[value]||''}
function li(list,empty){return list.length?list.map(x=>`<li>${escapeHtml(x)}</li>`).join(''):`<li>${escapeHtml(empty)}</li>`}
function renderUnderstanding(){
  const el=document.getElementById('understanding');
  const c=getCriteria(); const r=rules();
  const hard=[]; const soft=[]; const config=[];
  if(c.tipo)(r.tipoHard?hard:soft).push('Tipo: '+c.tipo);
  if(c.bairro)(r.bairroHard?hard:soft).push('Bairro: '+c.bairro);
  if(c.priceMaxMi)(r.precoHard?hard:soft).push('Preço até '+money(c.priceMaxMi));
  if(c.priceMinMi)(r.precoHard?hard:soft).push('Preço acima de '+money(c.priceMinMi));
  if(c.suitesMin)(r.suitesHard?hard:soft).push(c.suitesMin+'+ suítes');
  if(c.vagasMin)(r.vagasHard?hard:soft).push(c.vagasMin+'+ vagas');
  if(c.areaMin)soft.push(c.areaMin+'+ m²');
  if(c.profile)soft.push('Perfil: '+c.profile);
  if(c.features.length)(r.preferenciasHard?hard:soft).push(...c.features);
  config.push('Imobiliária define o que elimina e o que ranqueia.');
  config.push('Busca principal aplica o texto automaticamente antes de salvar.');
  config.push('Cards mostram por que cada imóvel apareceu.');
  el.style.display='grid';
  el.innerHTML = `<div class="box"><h3>Critérios obrigatórios</h3><ul>${li(hard,'Nenhuma trava ainda')}</ul></div><div class="box"><h3>Preferências para ranking</h3><ul>${li(soft,'Nenhuma preferência ainda')}</ul></div><div class="box"><h3>Motor v2</h3><ul>${li(config,'')}</ul></div>`;
}
function applyNaturalSearch(silent=false){
  const raw=document.getElementById('voiceSearchText').value.trim();
  if(!raw){if(!silent)toast('Digite ou fale uma busca primeiro.'); return false;}
  voiceState=parseSearch(raw);
  if(voiceState.cliente)document.getElementById('clienteNome').value=voiceState.cliente;
  if(voiceState.bairro)setSelect('bairro',voiceState.bairro);
  if(voiceState.tipo)setSelect('tipo',voiceState.tipo);
  setSelect('preco',voiceState.priceBucket||'');
  if(voiceState.suitesMin)setSelect('suites',String(voiceState.suitesMin));
  if(voiceState.vagasMin)setSelect('vagas',String(voiceState.vagasMin));
  if(voiceState.order)setSelect('ordem',voiceState.order);
  document.getElementById('voiceSearchChips').innerHTML=chipsHtml(voiceState);
  document.getElementById('voiceSearchStatus').textContent='Briefing entendido. Critérios obrigatórios travam a busca; preferências organizam os melhores matches.';
  renderUnderstanding();
  render();
  return true;
}
function buscarComTextoAplicado(){
  const raw=document.getElementById('voiceSearchText').value.trim();
  if(raw)applyNaturalSearch(true);
  selectTop();
}
function useExample(){document.getElementById('voiceSearchText').value='Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.'; applyNaturalSearch()}
function clearSearch(){voiceState=emptyVoiceState(); document.getElementById('voiceSearchText').value=''; document.getElementById('voiceSearchChips').innerHTML=''; document.getElementById('clienteNome').value=''; ['bairro','tipo','preco','suites','vagas'].forEach(id=>setSelect(id,'')); setSelect('ordem','score'); document.getElementById('voiceSearchStatus').textContent='Busca limpa.'; const u=document.getElementById('understanding'); u.style.display='none'; u.innerHTML=''; render()}
function propertyHasFeature(x,feature){const all=norm((x.diferenciais||[]).join(' ')+' '+(x.descricao||'')); return all.includes(norm(feature)) || (feature==='área gourmet' && all.includes('varanda gourmet'))}
function getCriteria(){
  const preco=document.getElementById('preco').value;
  const priceFromSelect = preco ? (preco==='acima10' ? {min:10,max:null,bucket:preco} : {min:null,max:Number(preco),bucket:preco}) : {min:null,max:null,bucket:''};
  const suitesSelect = Number(document.getElementById('suites').value||0) || null;
  const vagasValue = document.getElementById('vagas').value;
  const vagasSelect = vagasValue ? (vagasValue==='mais4'?5:Number(vagasValue)) : null;
  return {
    cliente:document.getElementById('clienteNome').value.trim()||voiceState.cliente||'Cliente sem nome',
    bairro:voiceState.bairro || document.getElementById('bairro').value,
    tipo:voiceState.tipo || document.getElementById('tipo').value,
    priceMaxMi:voiceState.priceMaxMi || priceFromSelect.max,
    priceMinMi:voiceState.priceMinMi || priceFromSelect.min,
    priceBucket:voiceState.priceBucket || priceFromSelect.bucket,
    suitesMin:voiceState.suitesMin || suitesSelect,
    vagasMin:voiceState.vagasMin || vagasSelect,
    areaMin:voiceState.areaMin,
    features:voiceState.features || [],
    profile:voiceState.profile || '',
    order:voiceState.order || document.getElementById('ordem').value || 'score',
    fala:voiceState.text
  }
}
function weightedScore(x,c){
  let points=0, total=0; const reasons=[], missing=[];
  function add(weight, ok, reason, miss, partial=0){total+=weight; if(ok){points+=weight; if(reason)reasons.push(reason)} else if(partial>0){points+=weight*partial; if(miss)missing.push(miss)} else if(miss){missing.push(miss)}}
  if(c.tipo)add(18,x.tipo===c.tipo,'tipo exato: '+x.tipo,'tipo diferente');
  if(c.bairro)add(16,x.bairro===c.bairro,'bairro solicitado: '+x.bairro,'bairro diferente');
  if(c.priceMaxMi){const ok=x.preco<=c.priceMaxMi; const partial=!rules().precoHard && x.preco<=c.priceMaxMi*1.08 ? .45 : 0; add(16,ok,'dentro do teto: '+money(x.preco),'acima do teto',partial)}
  if(c.priceMinMi)add(10,x.preco>=c.priceMinMi,'faixa premium: '+money(x.preco),'abaixo da faixa desejada');
  if(c.suitesMin)add(12,x.suites>=c.suitesMin,`${x.suites} suítes atende o mínimo`,`${x.suites} suítes, abaixo do pedido`);
  if(c.vagasMin)add(10,x.vagas>=c.vagasMin,`${x.vagas} vagas atende o mínimo`,`${x.vagas} vagas, abaixo do pedido`);
  if(c.areaMin)add(8,x.area>=c.areaMin,`${br(x.area)} m² atende a área`,`área abaixo do pedido`);
  if(c.features.length){
    total+=20;
    const matched=c.features.filter(f=>propertyHasFeature(x,f));
    const missingFeatures=c.features.filter(f=>!propertyHasFeature(x,f));
    points += 20*(matched.length/c.features.length);
    if(matched.length)reasons.push('preferências atendidas: '+matched.slice(0,3).join(', '));
    if(missingFeatures.length)missing.push('faltam: '+missingFeatures.slice(0,3).join(', '));
  }
  if(c.profile){total+=6; points+=4; reasons.push('perfil considerado: '+c.profile)}
  if(!total){total=1; points=x.baseScore/100; reasons.push('busca geral por qualidade da base')}
  const exactness = points/total;
  const score = Math.round((exactness*82) + (x.baseScore/100*18));
  return {match:Math.min(99,Math.max(1,score)),reasons,missing};
}
function passesHardRules(x,c,r){
  if(c.tipo && r.tipoHard && x.tipo!==c.tipo)return false;
  if(c.bairro && r.bairroHard && x.bairro!==c.bairro)return false;
  if(c.priceMaxMi && r.precoHard && x.preco>c.priceMaxMi)return false;
  if(c.priceMinMi && r.precoHard && x.preco<c.priceMinMi)return false;
  if(c.suitesMin && r.suitesHard && x.suites<c.suitesMin)return false;
  if(c.vagasMin && r.vagasHard && x.vagas<c.vagasMin)return false;
  if(r.preferenciasHard && c.features.length && !c.features.every(f=>propertyHasFeature(x,f)))return false;
  return true;
}
function filtered(){
  const c=getCriteria(); const r=rules();
  let data=IMOVEIS.filter(x=>passesHardRules(x,c,r)).map(x=>{const s=weightedScore(x,c); return {...x,match:s.match,reasons:s.reasons,missing:s.missing}});
  const ordem=c.order||'score';
  if(ordem==='preco_desc')data.sort((a,b)=>b.preco-a.preco || b.match-a.match);
  else if(ordem==='preco_asc')data.sort((a,b)=>a.preco-b.preco || b.match-a.match);
  else if(ordem==='area_desc')data.sort((a,b)=>b.area-a.area || b.match-a.match);
  else if(ordem==='area_asc')data.sort((a,b)=>a.area-b.area || b.match-a.match);
  else data.sort((a,b)=>b.match-a.match || b.baseScore-a.baseScore || a.preco-b.preco);
  return data;
}
function card(x,client=false){
  const reasons=(x.reasons||[]).slice(0,3).join(' • ') || 'boa aderência geral ao estoque';
  const missing=(x.missing||[]).slice(0,2).join(' • ');
  const wrap=client?'client-card':'imovel'; const inner=client?'client-body':'body'; const img=client?'client-img':'photo';
  return `<div class="${wrap}"><div class="${img}"></div><div class="${inner}"><h3>${escapeHtml(x.tipo)} • ${escapeHtml(x.bairro)}</h3><div class="meta">${escapeHtml(x.endereco)}<br>${br(x.area)} m²${x.terreno?' • terreno '+br(x.terreno)+' m²':''} • ${x.suites} suítes • ${x.vagas} vagas</div><p style="font-size:13px;margin:10px 0">${escapeHtml(x.descricao)}</p><div class="matchline"><span class="score">Match ${x.match||x.baseScore}%</span><b>${money(x.preco)}</b></div><div>${x.diferenciais.slice(0,4).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><div class="why"><b>Por que apareceu</b><p>${escapeHtml(reasons)}</p>${missing?`<p><span class="warn">Atenção</span> ${escapeHtml(missing)}</p>`:''}</div>${client?'<div class="mini-actions"><button onclick="toast(&quot;Gostei registrado.&quot;)">❤️ Gostei</button><button onclick="toast(&quot;Pedido de visita enviado.&quot;)">Agendar</button></div>':'<div class="actions"><button class="btn ghost" onclick="toast(&quot;Imóvel favoritado.&quot;)">Favoritar</button><button class="btn primary" onclick="toast(&quot;Contato com parceiro iniciado.&quot;)">Tenho cliente</button></div>'}</div></div>`
}
function render(){
  const data=filtered();
  document.getElementById('inventory').innerHTML=data.slice(0,18).map(x=>card(x)).join('') || '<div class="empty"><h2>Nenhum imóvel encontrado</h2><p>Altere as regras da imobiliária, limpe filtros ou transforme algum critério em preferência.</p></div>';
  const c=getCriteria();
  document.getElementById('resultTitle').textContent=`${br(data.length)} imóveis compatíveis`;
  const hardNote = c.tipo ? `Tipo travado em ${c.tipo}. ` : '';
  document.getElementById('resultSub').textContent=data.length ? hardNote+'Ordenado pelo melhor cruzamento entre perfil buscado e características disponíveis.' : 'Nenhum resultado com esses critérios obrigatórios.';
  const top=data.slice(0,20); const avg=top.length?Math.round(top.reduce((s,x)=>s+(x.match||x.baseScore),0)/top.length):0;
  document.getElementById('dashboardScore').textContent=avg+'%';
  document.getElementById('above90').textContent=String(data.filter(x=>(x.match||x.baseScore)>=90).length);
  if(voiceState.text)renderUnderstanding();
}
function currentCriteria(){
  const c=getCriteria();
  return {cliente:c.cliente,bairro:c.bairro,tipo:c.tipo,preco:c.priceMaxMi?'Até '+money(c.priceMaxMi):(c.priceMinMi?'Acima de '+money(c.priceMinMi):''),vagas:c.vagasMin?c.vagasMin+'+ vagas':'',suites:c.suitesMin?c.suitesMin+'+ suítes':'',ordem:orderLabel(c.order)==='Melhor match'?'':orderLabel(c.order),area:c.areaMin?c.areaMin+'+ m²':'',perfil:c.profile,desejos:c.features.join(', '),fala:c.fala}
}
function criteriaList(c){const arr=[]; if(c.bairro)arr.push('Bairro: '+c.bairro); if(c.tipo)arr.push('Tipo: '+c.tipo); if(c.preco)arr.push('Preço: '+c.preco); if(c.vagas)arr.push('Vagas: '+c.vagas); if(c.suites)arr.push('Suítes: '+c.suites); if(c.area)arr.push('Área: '+c.area); if(c.perfil)arr.push('Perfil: '+c.perfil); if(c.desejos)arr.push('Preferências: '+c.desejos); if(c.ordem)arr.push('Critério: '+c.ordem); return arr.length?arr:['Busca geral em toda a base']}
function criteriaBadges(c){return criteriaList(c).map(i=>`<span>${escapeHtml(i)}</span>`).join('')}
function makeSearchRecord(data,criteria){const id='BUSCA-'+Date.now(); return {id,created:new Date().toLocaleDateString('pt-BR'),criteria,total:data.length,top:data.slice(0,6)}}
function selectTop(){const data=filtered(); const rec=makeSearchRecord(data,currentCriteria()); searchHistory.unshift(rec); activeSearchId=rec.id; renderSearchHistory(); goId('matches'); viewSearchResult(rec.id,false); toast('Resultado de busca criado para '+rec.criteria.cliente+'.')}
function renderSearchHistory(){const el=document.getElementById('searchHistory'); if(!searchHistory.length){el.innerHTML='<p>Nenhuma busca salva ainda.</p>';return;} el.innerHTML='<table class="table"><thead><tr><th>Cliente</th><th>Critérios</th><th>Resultados</th><th></th></tr></thead><tbody>'+searchHistory.map(r=>`<tr><td><b>${escapeHtml(r.criteria.cliente)}</b><br><small>${r.created}</small></td><td><div class="criteria">${criteriaBadges(r.criteria)}</div></td><td>${br(r.total)}</td><td><button class="btn ghost" onclick="viewSearchResult('${r.id}')">Ver</button></td></tr>`).join('')+'</tbody></table>'}
function viewSearchResult(id,toastIt=true){const rec=searchHistory.find(r=>r.id===id)||searchHistory[0]; if(!rec)return; activeSearchId=rec.id; document.getElementById('selectedSearch').innerHTML=`<h3>${escapeHtml(rec.criteria.cliente)}</h3><div class="criteria">${criteriaBadges(rec.criteria)}</div><p>${br(rec.total)} imóveis encontrados. Top 6 para curadoria:</p><div class="client-grid">${rec.top.map(x=>card(x,true)).join('')}</div><div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" onclick="copyLink()">Copiar link privado</button><button class="btn ghost" onclick="goId('inventario')">Ajustar busca</button></div>`; if(toastIt)toast('Resultado aberto.')}
function copyLink(){const txt='https://matchr.demo/curadoria/'+(activeSearchId||'busca'); navigator.clipboard?.writeText(txt); toast('Link privado copiado: '+txt)}
function renderLeads(){const el=document.getElementById('leadsTable'); el.innerHTML='<table class="table"><thead><tr><th>Nome</th><th>Tipo</th><th>Status</th><th>Busca</th></tr></thead><tbody>'+leads.map(l=>`<tr><td><b>${escapeHtml(l.nome)}</b></td><td>${escapeHtml(l.tipo)}</td><td><span class="status ${l.status==='Quente'?'hot':l.status==='Comprou'?'ok':'cold'}">${escapeHtml(l.status)}</span></td><td>${escapeHtml(l.busca)}</td></tr>`).join('')+'</tbody></table>'}
function addLead(){const nome=document.getElementById('leadNome').value.trim(); if(!nome){toast('Informe o nome.');return} leads.unshift({nome,tipo:document.getElementById('leadTipo').value,status:document.getElementById('leadStatus').value,busca:document.getElementById('leadBusca').value.trim()||'Busca ainda não informada'}); ['leadNome','leadBusca'].forEach(id=>document.getElementById(id).value=''); renderLeads(); toast('Cadastro adicionado.')}
function startVoiceSearch(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){toast('Reconhecimento de voz não disponível neste navegador.');return} const rec=new SR(); rec.lang='pt-BR'; rec.interimResults=false; rec.maxAlternatives=1; rec.onresult=e=>{document.getElementById('voiceSearchText').value=e.results[0][0].transcript; applyNaturalSearch()}; rec.onerror=()=>toast('Não consegui capturar a fala. Tente digitar.'); rec.start(); toast('Pode falar a busca do cliente.')}
function init(){const bairro=document.getElementById('bairro'); BAIRROS.forEach(b=>bairro.insertAdjacentHTML('beforeend',`<option>${escapeHtml(b)}</option>`)); document.getElementById('totalImoveis').textContent=br(IMOVEIS.length); render(); renderLeads(); renderSearchHistory()}
window.addEventListener('DOMContentLoaded', init);

voiceState=parseSearch('Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.');
const data=filtered();
console.log('count', data.length);
console.log(data.slice(0,5).map(x=>`${x.tipo}|${x.bairro}|${x.preco}|${x.suites}|${x.vagas}|${x.match}`).join('\n'));
if(!data.length) throw new Error('no results');
if(data.some(x=>x.tipo!=='Apartamento')) throw new Error('returned non-apartment');
if(data.some(x=>x.bairro!=='Moema')) throw new Error('returned wrong bairro');
if(data.some(x=>x.preco>5)) throw new Error('returned over budget');
if(data.some(x=>x.suites<3)) throw new Error('returned fewer suites');
if(data.some(x=>x.vagas<2)) throw new Error('returned fewer vagas');
console.log('OK');
