# MatchR — MVP v5

MVP estático do **MatchR**, pronto para publicar no GitHub Pages.

## O que esta versão inclui

- A interface principal agora é **Encontre imóveis compatíveis com o cliente**.
- O corretor digita ou cola o briefing do cliente em linguagem natural.
- Exemplos clicáveis ajudam a demonstrar rapidamente o fluxo.
- Tipo, bairro, orçamento, suítes e vagas podem funcionar como critérios obrigatórios.
- Se o cliente pede **apartamento**, o motor não sugere **casa**.
- Preferências como varanda gourmet, vista aberta, lazer, pet, silêncio e liquidez entram como ranking.
- Cada card explica o motivo do match.
- Cards sem foto exibem logos textuais das imobiliárias parceiras, distribuídos proporcionalmente na base simulada.
- O corretor pode selecionar imóveis e gerar uma mensagem pronta para enviar pelo WhatsApp.

## Imobiliárias distribuídas nos cards sem foto

- Pilar
- Bossa Nova Sotheby's
- Coelho da Fonseca
- Local
- Axpe
- Cobogó
- Refúgios
- Anglo
- Tamaras
- Jardins & CO

Nesta versão, os logos textuais estão embutidos no próprio HTML para evitar problemas de caminho no GitHub Pages. Quando os logos oficiais estiverem prontos, dá para substituir a renderização textual por imagens reais.

## Como publicar no GitHub Pages

1. Baixe e descompacte o pacote.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No GitHub, vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salve e abra o link do GitHub Pages depois da publicação.

## Teste local opcional

Com Node.js instalado:

```bash
npm test
```

## Estrutura

```text
.
├── index.html
├── README.md
├── CHANGELOG.md
├── package.json
├── test-matchr-v5.js
├── .nojekyll
└── .gitignore
```
