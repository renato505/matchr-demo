# MatchR — MVP v3

MVP estático do **MatchR**, pronto para publicar no GitHub Pages.

## O que esta versão inclui

- Busca por voz/texto interpreta o briefing antes de buscar imóveis.
- Tipo de imóvel, bairro, orçamento, suítes e vagas podem funcionar como critérios obrigatórios.
- Se o cliente pede **apartamento**, o motor não sugere **casa**.
- Preferências do cliente são cruzadas com características disponíveis dos imóveis.
- Cada resultado explica o motivo do match: obrigatórios atendidos, preferências encontradas e pontos que faltaram.
- Imóveis sem foto exibem logos de imobiliárias parceiras.
- Os 3.000 imóveis simulados sem imagem recebem logos de forma aleatória e proporcional: 300 para cada uma das 10 imobiliárias.

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

Os logos ficam em `assets/logos/`. Os arquivos incluídos são placeholders neutros para o MVP. Para usar os logos oficiais, substitua os arquivos mantendo os mesmos nomes.

## Como publicar no GitHub Pages

1. Crie ou abra o repositório do demo no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. No GitHub, vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salve e abra o link do GitHub Pages depois da publicação.

## Testes de regressão

Frase usada para validar o bug corrigido:

> Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.

Resultado esperado:

- somente imóveis do tipo **Apartamento**;
- somente imóveis em **Moema**;
- preço até **R$ 5 milhões**;
- mínimo de **3 suítes**;
- mínimo de **2 vagas**;
- nenhum card sem imagem fica vazio; todos recebem um logo de imobiliária.

## Teste local opcional

Com Node.js instalado:

```bash
npm test
```

O teste checa o motor de matching e a distribuição proporcional dos logos.

## Estrutura

```text
.
├── index.html
├── assets/
│   └── logos/
│       ├── pilar.svg
│       ├── bossa-nova-sothebys.svg
│       ├── coelho-da-fonseca.svg
│       ├── local.svg
│       ├── axpe.svg
│       ├── cobogo.svg
│       ├── refugios.svg
│       ├── anglo.svg
│       ├── tamaras.svg
│       └── jardins-co.svg
├── README.md
├── CHANGELOG.md
├── package.json
├── test-matchr-v3.js
├── .nojekyll
└── .gitignore
```
