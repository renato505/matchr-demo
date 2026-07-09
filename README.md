# MatchR MVP v6 — WhatsApp nos cards

Versão estática pronta para GitHub Pages.

## O que mudou nesta versão

- Mantém o posicionamento **Encontre imóveis compatíveis com o cliente**.
- Mantém o briefing inteligente por texto, sem captura de fala por áudio.
- Mantém o motor de critérios obrigatórios x preferências.
- Mantém a correção: busca por apartamento não retorna casa.
- Mantém os logos das imobiliárias nos imóveis sem foto.
- Move a ação **Selecionar para WhatsApp** para o final de cada card.
- Transforma a ação em botão verde, com ícone estilo WhatsApp em todos os cards.
- Mantém o painel para gerar mensagem, copiar texto ou abrir o WhatsApp.

## Como publicar

1. Faça upload do conteúdo desta pasta na raiz do repositório do GitHub Pages.
2. O arquivo principal precisa se chamar `index.html`.
3. Se o navegador mostrar versão antiga, abra o link com `?v=6` no final ou limpe o cache.

## Teste local opcional

Com Node.js instalado:

```bash
npm test
```

O teste valida que a interface não contém captura de áudio, que o matching de apartamento não retorna casa, que os logos seguem distribuição balanceada, que a mensagem de WhatsApp é gerada e que o seletor do WhatsApp está no final do card.
