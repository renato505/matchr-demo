(function () {
  'use strict';

  var state = window.matchrVoiceState || {
    text: '',
    cliente: '',
    bairro: '',
    tipo: '',
    priceMaxMi: null,
    suitesMin: null,
    vagasMin: null,
    areaMin: null,
    features: []
  };
  window.matchrVoiceState = state;

  var fallbackBairros = [
    'Alto de Pinheiros','Boaçava','Brooklin','Cidade Jardim','Higienópolis','Itaim Bibi',
    'Jardim América','Jardim Europa','Jardim Paulistano','Jardim Paulista','Moema',
    'Moema Pássaros','Pacaembu','Paraíso','Pinheiros','Real Parque','Vila Madalena','Vila Nova Conceição'
  ];

  var featureMap = [
    ['muita luz natural', ['muita luz natural', 'luz natural', 'iluminado', 'bem iluminado']],
    ['privacidade', ['privacidade', 'privativo']],
    ['jardim', ['jardim']],
    ['piscina', ['piscina']],
    ['rooftop', ['rooftop']],
    ['sauna', ['sauna']],
    ['vista aberta', ['vista aberta', 'vista livre']],
    ['rua tranquila', ['rua tranquila', 'rua silenciosa', 'sem barulho', 'silencioso']],
    ['academia', ['academia']],
    ['elevador privativo', ['elevador privativo']],
    ['varanda integrada', ['varanda integrada', 'varanda']],
    ['área gourmet', ['area gourmet', 'área gourmet', 'varanda gourmet', 'gourmet']],
    ['pé-direito alto', ['pe direito alto', 'pé direito alto', 'pé-direito alto']],
    ['arquitetura autoral', ['arquitetura autoral']],
    ['reforma contemporânea', ['reforma contemporanea', 'reforma contemporânea', 'reformado', 'reformada']],
    ['segurança', ['seguranca', 'segurança']],
    ['janelas piso-teto', ['janelas piso teto', 'janelas piso-teto']]
  ];

  function byId(id) { return document.getElementById(id); }

  function norm(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function moneyMi(value) {
    if (!value) return '';
    return 'Até R$ ' + String(value).replace('.', ',') + ' mi';
  }

  function getBairros() {
    var select = byId('bairro');
    if (!select || !select.options) return fallbackBairros;
    var arr = [];
    for (var i = 0; i < select.options.length; i++) {
      var v = select.options[i].value || select.options[i].textContent;
      if (v) arr.push(v);
    }
    arr = arr.filter(function (v) { return norm(v) !== 'todos bairros'; });
    return arr.length ? arr : fallbackBairros;
  }

  function numberFromToken(token) {
    var map = {
      um: 1, uma: 1, dois: 2, duas: 2, tres: 3, três: 3, quatro: 4, cinco: 5,
      seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
      quinze: 15, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50
    };
    var clean = norm(token).replace(/[^\d,.a-z]/g, '');
    if (map[clean] != null) return map[clean];
    var n = Number(clean.replace(/\./g, '').replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  function parsePrice(text) {
    var s = norm(text);
    var token = '(\\d+(?:[\\.,]\\d+)?|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta|quarenta|cinquenta)';
    var patterns = [
      new RegExp('(?:ate|ate r\\$|no maximo|maximo|budget|orcamento|valor|preco|teto de)\\s*(?:r\\$)?\\s*' + token + '\\s*(milhoes|milhao|mi|m|mil)?'),
      new RegExp('r\\$\\s*' + token + '\\s*(milhoes|milhao|mi|m|mil)?'),
      new RegExp(token + '\\s*(milhoes|milhao|mi)\\b')
    ];

    for (var i = 0; i < patterns.length; i++) {
      var m = s.match(patterns[i]);
      if (!m) continue;
      var value = numberFromToken(m[1]);
      if (value == null) continue;
      var unit = m[2] || '';
      var nearby = s.slice(m.index, m.index + 60);

      if (unit === 'mil') value = value / 1000;
      if (!unit && value > 100) value = value / 1000;
      if (/meio/.test(nearby) && value < 100) value += 0.5;

      return Math.round(value * 10) / 10;
    }
    return null;
  }

  function parseMin(text, words) {
    var s = norm(text);
    var token = '(\\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)';
    var regex = new RegExp(token + '\\s*(?:' + words.join('|') + ')');
    var m = s.match(regex);
    return m ? numberFromToken(m[1]) : null;
  }

  function parseArea(text) {
    var m = norm(text).match(/(\d{2,4})\s*(m2|m²|metros|metro|metros quadrados)/);
    return m ? Number(m[1]) : null;
  }

  function parseCliente(text) {
    var m = String(text || '').match(/cliente\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/i);
    if (!m) return '';
    var stops = ['quer', 'procura', 'busca', 'precisa', 'gostaria', 'deseja'];
    return m[1].split(/\s+/).filter(function (p) { return stops.indexOf(norm(p)) === -1; }).join(' ').trim();
  }

  function parseBairro(text) {
    var s = norm(text);
    var aliases = [
      ['Jardim América', ['jardins', 'jardim america']],
      ['Vila Nova Conceição', ['vila nova', 'vila nova conceicao']],
      ['Itaim Bibi', ['itaim']],
      ['Moema Pássaros', ['moema passaros', 'passaros']],
      ['Alto de Pinheiros', ['alto pinheiros']],
      ['Vila Madalena', ['madalena']]
    ];
    var bairros = getBairros().slice().sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < bairros.length; i++) {
      if (s.indexOf(norm(bairros[i])) !== -1) return bairros[i];
    }
    for (var j = 0; j < aliases.length; j++) {
      for (var k = 0; k < aliases[j][1].length; k++) {
        if (s.indexOf(norm(aliases[j][1][k])) !== -1) return aliases[j][0];
      }
    }
    return '';
  }

  function parseTipo(text) {
    var s = norm(text);
    var checks = [
      ['Casa de condomínio', ['casa de condominio', 'condominio fechado', 'condominio']],
      ['Cobertura', ['cobertura', 'penthouse']],
      ['Apartamento', ['apartamento', 'apto', 'ape']],
      ['Garden', ['garden']],
      ['Studio', ['studio', 'estudio']],
      ['Terreno', ['terreno', 'lote']],
      ['Casa', ['casa', 'sobrado']]
    ];
    for (var i = 0; i < checks.length; i++) {
      for (var j = 0; j < checks[i][1].length; j++) {
        if (s.indexOf(norm(checks[i][1][j])) !== -1) return checks[i][0];
      }
    }
    return '';
  }

  function parseFeatures(text) {
    var s = norm(text);
    var found = [];
    for (var i = 0; i < featureMap.length; i++) {
      var label = featureMap[i][0];
      var terms = featureMap[i][1];
      for (var j = 0; j < terms.length; j++) {
        if (s.indexOf(norm(terms[j])) !== -1 && found.indexOf(label) === -1) found.push(label);
      }
    }
    return found;
  }

  function parseSearch(text) {
    return {
      text: String(text || '').trim(),
      cliente: parseCliente(text),
      bairro: parseBairro(text),
      tipo: parseTipo(text),
      priceMaxMi: parsePrice(text),
      suitesMin: parseMin(text, ['suite', 'suites']),
      vagasMin: parseMin(text, ['vaga', 'vagas', 'garagem', 'garagens']),
      areaMin: parseArea(text),
      features: parseFeatures(text)
    };
  }

  function setSelect(id, value) {
    var el = byId(id);
    if (el) el.value = value || '';
  }

  function priceBucket(price) {
    if (!price) return '';
    if (price <= 10) return '10';
    if (price <= 20) return '20';
    if (price <= 40) return '40';
    return '';
  }

  function chipsHtml(parsed) {
    var chips = [];
    if (parsed.cliente) chips.push('Cliente: ' + parsed.cliente);
    if (parsed.bairro) chips.push('Bairro: ' + parsed.bairro);
    if (parsed.tipo) chips.push('Tipo: ' + parsed.tipo);
    if (parsed.priceMaxMi) chips.push('Preço: ' + moneyMi(parsed.priceMaxMi));
    if (parsed.suitesMin) chips.push('Suítes: ' + parsed.suitesMin + '+');
    if (parsed.vagasMin) chips.push('Vagas: ' + parsed.vagasMin + '+');
    if (parsed.areaMin) chips.push('Área: ' + parsed.areaMin + '+ m²');
    if (parsed.features.length) chips.push('Desejos: ' + parsed.features.join(', '));
    return chips.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }

  function setStatus(msg) {
    var el = byId('voiceSearchStatus');
    if (el) el.textContent = msg;
  }

  function propertyHasFeature(property, feature) {
    var text = norm([
      property.tipo,
      property.bairro,
      property.endereco,
      property.descricao,
      (property.diferenciais || []).join(' ')
    ].join(' '));
    var terms = [feature];
    for (var i = 0; i < featureMap.length; i++) {
      if (featureMap[i][0] === feature) terms = featureMap[i][1];
    }
    return terms.some(function (t) { return text.indexOf(norm(t)) !== -1; });
  }

  function installOverrides() {
    if (window.__matchrVoiceSearchFixInstalled) return;
    window.__matchrVoiceSearchFixInstalled = true;

    var originalFiltered = window.filtered;
    if (typeof originalFiltered === 'function') {
      window.filtered = function () {
        var data = originalFiltered.apply(this, arguments);
        var s = window.matchrVoiceState || {};
        if (s.priceMaxMi) data = data.filter(function (x) { return x.preco <= s.priceMaxMi; });
        if (s.suitesMin) data = data.filter(function (x) { return x.suites >= s.suitesMin; });
        if (s.vagasMin) data = data.filter(function (x) { return x.vagas >= s.vagasMin; });
        if (s.areaMin) data = data.filter(function (x) { return x.area >= s.areaMin; });
        if (s.features && s.features.length) {
          data = data.filter(function (x) {
            return s.features.every(function (f) { return propertyHasFeature(x, f); });
          });
        }
        return data;
      };
    }

    var originalCurrentCriteria = window.currentCriteria;
    if (typeof originalCurrentCriteria === 'function') {
      window.currentCriteria = function () {
        var c = originalCurrentCriteria.apply(this, arguments);
        var s = window.matchrVoiceState || {};
        if (s.text) c.fala = s.text;
        if (s.priceMaxMi) c.preco = moneyMi(s.priceMaxMi);
        if (s.suitesMin) c.suites = s.suitesMin + '+ suítes';
        if (s.vagasMin) c.vagas = s.vagasMin + '+ vagas';
        if (s.areaMin) c.area = s.areaMin + '+ m²';
        if (s.features && s.features.length) c.desejos = s.features.join(', ');
        return c;
      };
    }

    window.criteriaList = function (c) {
      var arr = [];
      if (c.bairro) arr.push('Bairro: ' + c.bairro);
      if (c.tipo) arr.push('Tipo: ' + c.tipo);
      if (c.preco) arr.push('Preço: ' + c.preco);
      if (c.vagas) arr.push('Vagas: ' + c.vagas);
      if (c.suites) arr.push('Suítes: ' + c.suites);
      if (c.area) arr.push('Área: ' + c.area);
      if (c.desejos) arr.push('Desejos: ' + c.desejos);
      if (c.ordem) arr.push('Ordenação: ' + c.ordem);
      if (c.fala) arr.push('Fala: “' + c.fala + '”');
      return arr.length ? arr : ['Busca geral em toda a base'];
    };

    window.criteriaBadges = function (c) {
      return window.criteriaList(c).map(function (i) { return '<span>' + i + '</span>'; }).join('');
    };

    window.criteriaText = function (c) {
      return window.criteriaList(c).join(' • ');
    };
  }

  function injectUi() {
    if (byId('voiceSearchCard')) return;
    var filters = document.querySelector('#inventario .filters');
    if (!filters) return;

    var style = document.createElement('style');
    style.textContent = '' +
      '.voice-search-card{margin:0 0 16px;padding:16px;border:1px solid var(--line);border-radius:22px;background:#fff;box-shadow:0 8px 26px rgba(0,0,0,.06)}' +
      '.voice-search-card h2{margin:0 0 4px;font-size:20px}.voice-search-card p{margin:0 0 10px;font-size:13px;color:#444}' +
      '.voice-search-card textarea{width:100%;min-height:82px;border:1px solid var(--line);border-radius:14px;padding:13px;font:inherit;font-weight:650;resize:vertical;outline:none}' +
      '.voice-search-card textarea:focus{border-color:var(--orange);box-shadow:0 0 0 4px rgba(255,122,26,.12)}' +
      '.voice-search-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.voice-search-status{margin-top:10px!important}' +
      '.voice-search-card .criteria{margin-top:10px}';
    document.head.appendChild(style);

    var card = document.createElement('div');
    card.id = 'voiceSearchCard';
    card.className = 'voice-search-card';
    card.innerHTML = '' +
      '<h2>Busca por voz</h2>' +
      '<p>Fale como no WhatsApp: cliente, bairro, tipo, valor, suítes, vagas e desejos.</p>' +
      '<textarea id="voiceSearchText" placeholder="Ex: Cliente Mariana quer apartamento em Moema até 10 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta."></textarea>' +
      '<div class="voice-search-actions">' +
      '<button class="btn primary" type="button" id="voiceSearchListenBtn" onclick="matchrVoiceStart()">🎙️ Falar busca</button>' +
      '<button class="btn ghost" type="button" onclick="matchrVoiceApply()">Aplicar aos filtros</button>' +
      '<button class="btn ghost" type="button" onclick="matchrVoiceClear()">Limpar</button>' +
      '</div>' +
      '<p id="voiceSearchStatus" class="voice-search-status">Digite uma frase ou clique em “Falar busca”.</p>' +
      '<div id="voiceSearchChips" class="criteria"></div>';

    filters.parentNode.insertBefore(card, filters.nextSibling);
  }

  window.matchrVoiceApply = function () {
    installOverrides();
    var textarea = byId('voiceSearchText');
    var raw = textarea ? textarea.value.trim() : '';
    if (!raw) {
      setStatus('Digite ou fale uma busca primeiro.');
      return;
    }

    state = parseSearch(raw);
    window.matchrVoiceState = state;

    if (state.cliente && byId('clienteNome')) byId('clienteNome').value = state.cliente;
    if (state.bairro) setSelect('bairro', state.bairro);
    if (state.tipo) setSelect('tipo', state.tipo);
    setSelect('preco', priceBucket(state.priceMaxMi));
    if (state.suitesMin) setSelect('suites', '');
    if (state.vagasMin) setSelect('vagas', '');
    setSelect('ordem', 'score');

    if (byId('voiceSearchChips')) byId('voiceSearchChips').innerHTML = chipsHtml(state);
    if (typeof window.render === 'function') window.render();
    setStatus('Busca aplicada. Agora clique em “Buscar imóveis compatíveis” para salvar no histórico.');
  };

  window.matchrVoiceClear = function () {
    state = { text: '', cliente: '', bairro: '', tipo: '', priceMaxMi: null, suitesMin: null, vagasMin: null, areaMin: null, features: [] };
    window.matchrVoiceState = state;
    if (byId('voiceSearchText')) byId('voiceSearchText').value = '';
    if (byId('voiceSearchChips')) byId('voiceSearchChips').innerHTML = '';
    ['bairro', 'tipo', 'preco', 'vagas', 'suites'].forEach(function (id) { setSelect(id, ''); });
    if (typeof window.render === 'function') window.render();
    setStatus('Busca limpa.');
  };

  window.matchrVoiceStart = function () {
    injectUi();
    installOverrides();
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var textarea = byId('voiceSearchText');
    var button = byId('voiceSearchListenBtn');

    if (!Recognition) {
      setStatus('Este navegador não liberou voz. Digite a frase e clique em “Aplicar aos filtros”.');
      if (textarea) textarea.focus();
      return;
    }

    var rec = new Recognition();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = function () {
      if (button) button.textContent = '🎙️ Ouvindo...';
      setStatus('Pode falar. Ex: “apartamento em Moema até 10 milhões, 3 suítes e 2 vagas”.');
    };
    rec.onerror = function (event) {
      if (button) button.textContent = '🎙️ Falar busca';
      setStatus('Não consegui captar o áudio. Tente de novo ou digite a frase.');
    };
    rec.onend = function () {
      if (button) button.textContent = '🎙️ Falar busca';
    };
    rec.onresult = function (event) {
      var transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
      if (textarea) textarea.value = transcript;
      window.matchrVoiceApply();
    };
    rec.start();
  };

  var attempts = 0;
  function boot() {
    attempts += 1;
    if (!document.querySelector('#inventario .filters') || typeof window.render !== 'function') {
      if (attempts < 60) setTimeout(boot, 200);
      return;
    }
    injectUi();
    installOverrides();
    if (typeof window.render === 'function') window.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
