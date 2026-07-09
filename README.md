# Mova Match - MVP v8

Protótipo estático em HTML/CSS/JS para a tela **Encontre imóveis compatíveis com o cliente**.

## Ajustes incluídos nesta versão

1. Tela menos poluída:
   - Filtros avançados ficam recolhidos por padrão.
   - A seção de áreas comuns não aparece para todos os tipos de imóvel.

2. Combo box de tipo de imóvel:
   - Incluída a opção **Casa de condomínio**.

3. Regra condicional das áreas comuns:
   - Se o usuário selecionar **Apartamento**, aparece o bloco **Áreas comuns do edifício**.
   - Se o usuário selecionar **Casa de condomínio**, aparece o bloco **Áreas comuns do condomínio**.
   - Para os demais tipos de imóvel, o bloco fica oculto.
   - Ao trocar para um tipo que não usa essa seção, os filtros marcados em áreas comuns são limpos.

4. Carro elétrico:
   - A opção **Infraestrutura para carregar carro elétrico** foi adicionada dentro das áreas comuns.
   - Ela aparece tanto para **Apartamento** quanto para **Casa de condomínio**.
   - O briefing inteligente reconhece termos como `carro elétrico`, `carregador`, `recarga`, `tomada para carro` e `EV charger`.

## Como usar

Abra o arquivo `index.html` no navegador.

## Arquivos

- `index.html`: protótipo completo em arquivo único.
- `README.md`: este resumo.
- `CHANGELOG.md`: histórico da versão.
