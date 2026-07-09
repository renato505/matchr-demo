# MatchR - MVP v11

Protótipo estático em HTML/CSS/JS para a página do MatchR com motor de compatibilidade, navegação restaurada e conteúdo institucional.

## Ajustes incluídos nesta versão

- Restaurado o **menu de navegação** em formato hambúrguer, abrindo pela lateral esquerda.
- Mantida a interface limpa do motor da v8/v10.
- Mantido o **logotipo no canto superior esquerdo**.
- Mantida a seção **Para você, corretor** com vídeo embedado do YouTube.
- Recriadas/organizadas as seções de página para não ficar “só motor”:
  - Para você, corretor
  - Motor de compatibilidade
  - Imóveis sugeridos
  - Como funciona
  - Benefícios
  - Para imobiliárias e incorporadoras
  - Contato / próximos passos
- Mantida a opção **Casa de condomínio** no combo box de tipo de imóvel.
- Mantida a lógica condicional:
  - **Apartamento** exibe **Áreas comuns do edifício**.
  - **Casa de condomínio** exibe **Áreas comuns do condomínio**.
  - Os demais tipos ocultam a seção de áreas comuns.
- Mantida a opção **Infraestrutura para carregar carro elétrico** para Apartamento e Casa de condomínio.
- Filtros avançados permanecem recolhidos por padrão para reduzir poluição visual.

## Como publicar no GitHub Pages

1. Envie o arquivo `index.html` para a raiz do repositório.
2. No GitHub, acesse **Settings > Pages**.
3. Selecione a branch principal e a pasta raiz.
4. Salve e aguarde a publicação.

## Observação sobre o vídeo

O link enviado era do YouTube Studio, que é a área de edição do criador. Para embed público na página, o HTML usa o ID do vídeo no formato padrão de incorporação do YouTube: `https://www.youtube.com/embed/7o9W3ATGCl4`. Se o vídeo estiver privado, ele não será exibido para visitantes externos.
