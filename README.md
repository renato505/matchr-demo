# MatchR — MVP v2

MVP estático do **MatchR**, pronto para publicar no GitHub Pages.

## O que esta versão corrige

- A busca por voz/texto agora interpreta o briefing antes de buscar imóveis.
- Tipo de imóvel, bairro, orçamento, suítes e vagas podem funcionar como critérios obrigatórios.
- Se o cliente pede **apartamento**, o motor não sugere **casa**.
- As preferências do cliente são cruzadas com as características disponíveis dos imóveis.
- Cada resultado explica o motivo do match: obrigatórios atendidos, preferências encontradas e pontos que faltaram.
- Inclui uma área de regras configuráveis da imobiliária, simulando como cada operação pode definir o que é inegociável.

## Como publicar no GitHub Pages

1. Crie ou abra o repositório do demo no GitHub.
2. Envie estes arquivos para a raiz do repositório:
   - `index.html`
   - `.nojekyll`
   - `README.md`
   - `package.json` e `test-matchr-v2.js` são opcionais, mas úteis para registro e teste.
3. No GitHub, vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salve e abra o link do GitHub Pages depois da publicação.

## Teste principal de regressão

Frase usada para validar o bug corrigido:

> Cliente Mariana quer apartamento em Moema até 5 milhões, 3 suítes, 2 vagas, varanda gourmet e vista aberta.

Resultado esperado:

- somente imóveis do tipo **Apartamento**;
- somente imóveis em **Moema**;
- preço até **R$ 5 milhões**;
- mínimo de **3 suítes**;
- mínimo de **2 vagas**;
- varanda gourmet e vista aberta entram como preferências de ranking.

## Teste local opcional

Com Node.js instalado:

```bash
npm test
```

O teste roda a checagem principal para garantir que casas não entram quando o briefing pede apartamento.

## Estrutura

```text
.
├── index.html          # demo estático completo
├── README.md           # instruções do projeto
├── .nojekyll           # evita processamento Jekyll no GitHub Pages
├── package.json        # script opcional de teste
└── test-matchr-v2.js   # teste opcional de regressão
```
