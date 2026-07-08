"use client";

import { useMemo, useState } from "react";
import "./globals.css";
import { IMOVEIS } from "./data";

export default function Page() {
  const [view, setView] = useState("dashboard");
  const [q, setQ] = useState("");
  const [bairro, setBairro] = useState("");
  const [tipo, setTipo] = useState("");
  const [preco, setPreco] = useState("");
  const [suites, setSuites] = useState("");
  const [ordem, setOrdem] = useState("score");
  const [toast, setToast] = useState("");

  const bairros = [...new Set(IMOVEIS.map((x) => x.bairro))].sort();
  const tipos = [...new Set(IMOVEIS.map((x) => x.tipo))].sort();

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  };

  const go = (id) => {
    setView(id);
    window.scrollTo(0, 0);
  };

  const filtered = useMemo(() => {
    let data = [...IMOVEIS];
    const term = q.toLowerCase();
    if (term) data = data.filter((x) => (x.bairro + x.endereco + x.tipo + x.diferenciais.join(" ") + x.descricao).toLowerCase().includes(term));
    if (bairro) data = data.filter((x) => x.bairro === bairro);
    if (tipo) data = data.filter((x) => x.tipo === tipo);
    if (preco) data = data.filter((x) => x.preco <= Number(preco));
    if (suites) data = data.filter((x) => x.suites >= Number(suites));
    if (ordem === "score") data.sort((a, b) => b.score - a.score);
    if (ordem === "preco") data.sort((a, b) => a.preco - b.preco);
    if (ordem === "area") data.sort((a, b) => b.area - a.area);
    return data;
  }, [q, bairro, tipo, preco, suites, ordem]);

  const topMatches = useMemo(() => {
    return [...IMOVEIS]
      .filter((x) => ["Jardim América", "Jardim Europa", "Jardim Paulistano"].includes(x.bairro) && x.preco >= 25 && x.suites >= 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);
  }, []);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText("https://www.matchr.com.br/curadoria/ana-paula"); } catch {}
    showToast("Link privado copiado.");
  };

  const money = (v) => "R$ " + v.toFixed(1).replace(".", ",") + " mi";

  const ImovelCard = ({ x, client = false }) => (
    <div className={client ? "client-card" : "imovel"}>
      <div className={client ? "client-img" : "photo"} />
      <div className={client ? "client-body" : "body"}>
        <h3>{x.tipo} • {x.bairro}</h3>
        <div className="meta">
          {x.endereco}<br />{x.area} m²{x.terreno ? ` • terreno ${x.terreno} m²` : ""} • {x.suites} suítes • {x.vagas} vagas
        </div>
        <p style={{ fontSize: 13, margin: "10px 0" }}>{x.descricao}</p>
        <div><span className="score">Match {x.score}%</span> <b>{money(x.preco)}</b></div>
        <div className="tags">{x.diferenciais.slice(0, 4).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
        {client ? (
          <div className="mini-actions">
            <button onClick={() => showToast("Gostei registrado.")}>❤️ Gostei</button>
            <button onClick={() => showToast("Pedido de visita enviado.")}>👀 Visitar</button>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}><button className="btn" onClick={() => showToast("Imóvel adicionado à curadoria.")}>Adicionar à curadoria</button></div>
        )}
      </div>
    </div>
  );

  const NavButton = ({ id, children }) => (
    <button className={view === id ? "active" : ""} onClick={() => go(id)}>{children}</button>
  );

  return (
    <div className="app">
      <aside>
        <div className="logo">
          <div><img src="/matchr-logo.jpeg" alt="Matchr" /><span>Demo • 200 imóveis fake</span></div>
        </div>
        <nav>
          <NavButton id="dashboard">Dashboard</NavButton>
          <NavButton id="inventario">Inventário <span className="pill">200</span></NavButton>
          <NavButton id="matches">Matches IA</NavButton>
          <NavButton id="clientes">Clientes</NavButton>
          <NavButton id="share">Página do cliente</NavButton>
          <NavButton id="analytics">Analytics</NavButton>
        </nav>
        <div className="card" style={{ marginTop: 24 }}>
          <b>Piloto 90 dias</b>
          <p style={{ fontSize: 13, marginBottom: 0 }}>Base fake para demonstração com investidores, imobiliárias e corretores.</p>
        </div>
      </aside>

      <main>
        {view === "dashboard" && <section className="view active">
          <div className="top"><div><h1>Matchr para corretores</h1><p>Demo navegável com 200 imóveis simulados, busca, filtros, score de match e página compartilhável para cliente.</p></div><button className="btn primary" onClick={() => go("inventario")}>Ver inventário</button></div>
          <div className="grid cols4">
            <div className="card metric"><div className="n">200</div><div className="label">imóveis fake cadastrados</div></div>
            <div className="card metric"><div className="n">12</div><div className="label">bairros prime</div></div>
            <div className="card metric"><div className="n">83%</div><div className="label">score médio top 20</div></div>
            <div className="card metric"><div className="n">90 dias</div><div className="label">piloto sugerido</div></div>
          </div>
          <div className="grid cols3" style={{ marginTop: 18 }}>
            <div className="card"><h2>Para o corretor</h2><p>Menos planilha, menos WhatsApp perdido e mais curadoria com contexto.</p></div>
            <div className="card"><h2>Para a imobiliária</h2><p>Inventário mais inteligente, feedback de cliente e métrica de demanda.</p></div>
            <div className="card"><h2>Para investidor</h2><p>Produto com rede, dados proprietários e potencial B2B SaaS + marketplace.</p></div>
          </div>
        </section>}

        {view === "inventario" && <section className="view active">
          <div className="top"><div><h1>Inventário fake</h1><p>Use os filtros para simular uma base real de imóveis de alto padrão.</p></div><button className="btn primary" onClick={() => { go("matches"); showToast("Top matches selecionados para cliente."); }}>Selecionar top matches</button></div>
          <div className="filters">
            <input placeholder="Buscar por bairro, rua, diferencial..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={bairro} onChange={(e) => setBairro(e.target.value)}><option value="">Todos bairros</option>{bairros.map((b) => <option key={b}>{b}</option>)}</select>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos tipos</option>{tipos.map((t) => <option key={t}>{t}</option>)}</select>
            <select value={preco} onChange={(e) => setPreco(e.target.value)}><option value="">Preço</option><option value="10">Até R$ 10 mi</option><option value="20">Até R$ 20 mi</option><option value="40">Até R$ 40 mi</option></select>
            <select value={suites} onChange={(e) => setSuites(e.target.value)}><option value="">Suítes</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select>
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)}><option value="score">Score</option><option value="preco">Menor preço</option><option value="area">Maior área</option></select>
          </div>
          <p>{filtered.length} imóveis encontrados</p>
          <div className="inventory">{filtered.slice(0, 60).map((x) => <ImovelCard x={x} key={x.id} />)}</div>
        </section>}

        {view === "matches" && <section className="view active">
          <div className="top"><div><h1>Matches IA para cliente exemplo</h1><p>Perfil: casa nos Jardins, R$ 35–45 mi, muita luz natural, privacidade, jardim, 4+ suítes.</p></div><button className="btn primary" onClick={() => go("share")}>Criar página compartilhável</button></div>
          <div className="inventory">{topMatches.map((x) => <ImovelCard x={x} key={x.id} />)}</div>
        </section>}

        {view === "clientes" && <section className="view active">
          <div className="top"><div><h1>Clientes</h1><p>CRM simples para testar com corretores.</p></div></div>
          <div className="card"><table className="table"><tbody><tr><th>Cliente</th><th>Busca</th><th>Budget</th><th>Status</th></tr><tr><td>Ana Paula</td><td>Casa • Jardim América/Jardim Europa</td><td>R$ 35–45 mi</td><td><span className="status hot">quente</span></td></tr><tr><td>Marcelo e Julia</td><td>Casa • Alto de Pinheiros</td><td>R$ 12–18 mi</td><td><span className="status ok">ativo</span></td></tr><tr><td>Bianca</td><td>Apto • Itaim</td><td>R$ 7–10 mi</td><td><span className="status cold">nutrir</span></td></tr></tbody></table></div>
        </section>}

        {view === "share" && <section className="view active">
          <div className="top"><div><h1>Página do cliente</h1><p>Link privado com imóveis selecionados e feedback.</p></div><button className="btn primary" onClick={copyLink}>Copiar link</button></div>
          <div className="clientpage">
            <h1 style={{ color: "#111" }}>Seleção para Ana Paula</h1><p>Curadoria feita por Renato Gosling • top 6 matches</p>
            <div className="client-grid">{topMatches.slice(0, 6).map((x) => <ImovelCard x={x} key={x.id} client />)}</div>
          </div>
        </section>}

        {view === "analytics" && <section className="view active">
          <div className="top"><div><h1>Analytics do piloto</h1><p>O que medir em 90 dias.</p></div></div>
          <div className="grid cols4">
            <div className="card metric"><div className="n">200</div><div className="label">imóveis simulados</div></div>
            <div className="card metric"><div className="n">38</div><div className="label">matches acima de 90%</div></div>
            <div className="card metric"><div className="n">64%</div><div className="label">abertura estimada de links</div></div>
            <div className="card metric"><div className="n">3.1x</div><div className="label">mais imóveis avaliados</div></div>
          </div>
          <div className="card" style={{ marginTop: 18 }}><h2>Mensagem para investidor</h2><p>O Matchr cria uma camada inteligente entre inventário imobiliário, corretor e comprador. O primeiro valor está no aumento de eficiência comercial. O segundo está nos dados: o que os clientes gostam, recusam, visitam e compram.</p></div>
        </section>}
      </main>
      <div className={toast ? "toast show" : "toast"}>{toast}</div>
    </div>
  );
}
