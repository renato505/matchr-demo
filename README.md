# MatchR MVP v7 — Áreas comuns + WhatsApp

Demo estático para GitHub Pages.

## O que entrou na v7

- Remoção definitiva da busca por voz da interface principal.
- Posicionamento: **Encontre imóveis compatíveis com o cliente**.
- Filtro de **áreas comuns do edifício**: piscina, academia, salão de festas, espaço gourmet, churrasqueira, playground, brinquedoteca, quadra, sauna, coworking, pet place, jardim, rooftop, bicicletário, portaria 24h, segurança, vagas para visitantes, gerador e lazer completo.
- Interpretação dessas áreas no briefing inteligente.
- Separação entre áreas desejáveis e áreas essenciais.
- Cards exibem linha de condomínio e motivo do match com áreas compatíveis/faltantes.
- Seleção de imóveis para enviar pelo WhatsApp no final dos cards.
- Logos de imobiliárias distribuídos de forma proporcional nos imóveis sem foto.
- Testes de regressão: apartamento não traz casa; áreas comuns essenciais são respeitadas.

## Como publicar no GitHub Pages

1. Suba todos os arquivos desta pasta para a raiz do repositório.
2. Vá em `Settings → Pages`.
3. Selecione a branch `main` e pasta `/root`.
4. Após publicar, acesse o link com `?v=7` no final para evitar cache.

## Teste local opcional

```bash
node test-matchr-v7.js
```
