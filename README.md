# Busca imobiliária por voz para corretores

Funcionalidade plugável para o corretor falar livremente o que procura — em vez de preencher bairro, valor, suítes, vagas etc. — e receber filtros estruturados para o motor de busca.

## O que vem pronto

- Componente React `VoiceSearchBox` com botão de microfone, fallback por texto e preview de filtros.
- Hook `useSpeechToText` usando Web Speech API no navegador.
- Endpoint Next.js `POST /api/parse-property-search`.
- Schema Zod para extrair intenção imobiliária com Structured Outputs.
- Parser local simples como fallback quando `OPENAI_API_KEY` não estiver configurada.
- Conversão para um objeto `searchParams` fácil de conectar ao seu motor de busca.

## Fluxo

```txt
Fala do corretor
  -> SpeechRecognition no navegador
  -> texto livre
  -> /api/parse-property-search
  -> filtros estruturados
  -> searchParams
  -> seu motor de busca
```

## Instalação em um projeto Next.js

1. Copie as pastas `src/components`, `src/hooks`, `src/lib` e `src/app/api/parse-property-search` para seu projeto.
2. Instale as dependências:

```bash
npm install openai zod
```

3. Configure a chave no `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

4. Use o componente onde hoje ficam os filtros manuais:

```tsx
import { VoiceSearchBox } from "./components/VoiceSearchBox";

export function PropertySearch() {
  return (
    <VoiceSearchBox
      knownNeighborhoods={["Vila Madalena", "Pinheiros", "Jardins", "Moema"]}
      knownCities={["São Paulo", "Rio de Janeiro"]}
      knownStates={["SP", "RJ"]}
      onSearch={(params, filters) => {
        console.log("Enviar para seu motor de busca", params, filters);
        // fetchProperties(params)
        // router.push(`/imoveis?${new URLSearchParams(flatten(params))}`)
      }}
    />
  );
}
```

## Exemplo de entrada

> “Apartamento para compra na Vila Madalena até 1 milhão e meio, 3 quartos, 2 suítes, 2 vagas e varanda gourmet.”

## Exemplo de saída para o motor de busca

```json
{
  "transaction": "compra",
  "property_type": "apartamento",
  "neighborhoods": ["Vila Madalena"],
  "price_max": 1500000,
  "bedrooms_min": 3,
  "suites_min": 2,
  "parking_spaces_min": 2,
  "must_have": ["varanda gourmet"],
  "sort_by": "relevance",
  "free_text": "Apartamento para compra na Vila Madalena até 1 milhão e meio, 3 quartos, 2 suítes, 2 vagas e varanda gourmet."
}
```

## Como conectar ao seu motor de busca

O arquivo `src/lib/toSearchQuery.ts` é a camada de tradução. Adapte os nomes dos campos para baterem com sua API, banco ou índice de busca.

Exemplo:

```ts
onSearch={(params) => {
  fetch("/api/properties/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}}
```

## Observações de produto

- O preço é capturado no mesmo momento que os demais filtros. Nada de tratar preço como detalhe final.
- Use `knownNeighborhoods`, `knownCities` e `knownStates` com os nomes que existem na sua base. Isso reduz ambiguidade e melhora matching.
- A experiência ideal é manter os filtros visuais editáveis depois da fala. O corretor fala rápido, confere os chips e ajusta só se precisar.
- Para produção mobile, teste bem em Chrome/Edge/Safari. Alguns navegadores não suportam a Web Speech API de forma consistente.
- Em alguns navegadores, o reconhecimento de voz pode depender de serviço externo do próprio navegador. Avise isso na política de privacidade se for aplicável ao seu produto.

## Rodando a demo

```bash
npm install
npm run dev
```

Abra `/demo`.
