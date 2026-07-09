# Changelog

## v3.0.0

- Adiciona exibição de logo de imobiliária nos imóveis sem imagem.
- Distribui proporcionalmente os 10 logos informados na base simulada de 3.000 imóveis.
- Mantém distribuição determinística: aleatória na aparência, mas estável a cada reload.
- Inclui placeholders SVG neutros em `assets/logos/` para publicação imediata no GitHub Pages.
- Adiciona instruções para substituir os placeholders pelos logos oficiais.
- Atualiza teste local para validar matching e distribuição dos logos.

## v2.0.0

- Corrige o fluxo em que a busca natural podia ser ignorada ao clicar diretamente em buscar.
- Transforma tipo, bairro, preço, suítes e vagas em critérios obrigatórios configuráveis.
- Adiciona lógica de preferência do buscador versus características disponíveis.
- Adiciona explicação do match em cada resultado.
- Adiciona protótipo de regras configuráveis por imobiliária.
- Inclui teste de regressão para busca de apartamento em Moema.
