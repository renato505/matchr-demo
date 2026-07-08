import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { localParsePropertySearchText, type ParseContext } from "../../../lib/localParser";
import { PropertySearchFiltersSchema } from "../../../lib/propertySearchSchema";
import { toPropertySearchParams } from "../../../lib/toSearchQuery";

export const runtime = "nodejs";

const RequestSchema = z.object({
  text: z.string().min(2).max(1500),
  context: z
    .object({
      knownNeighborhoods: z.array(z.string()).optional(),
      knownCities: z.array(z.string()).optional(),
      knownStates: z.array(z.string()).optional(),
    })
    .optional(),
});

function buildSystemPrompt(context: ParseContext) {
  return `
Você interpreta buscas imobiliárias faladas por corretores brasileiros e transforma fala natural em filtros estruturados.

Regras importantes:
- Não invente informação. Se o corretor não falou um campo, use null, array vazio ou "indefinido".
- Preço sempre em BRL, número inteiro em reais, sem centavos. Exemplos: "900 mil" = 900000; "1 milhão e meio" = 1500000; "1.2 milhão" = 1200000.
- "Até", "no máximo", "teto" e "limite" indicam price.max. "A partir de" e "acima de" indicam price.min. "Entre X e Y" indica min e max.
- Capture preço cedo e com a mesma prioridade de localização, tipo de imóvel e dormitórios.
- Entenda abreviações: apê, apto, ap = apartamento; dorms = quartos; vaga = garagem; suíte/suite = suites.
- Diferencie obrigatório de desejável: "precisa", "tem que ter", "obrigatório" entram em features.mustHave; "seria bom", "preferência" entram em features.niceToHave.
- Negativas como "sem térreo", "não quero rua barulhenta" entram em features.negative.
- Se bairros/cidades conhecidos forem fornecidos no contexto, prefira esses nomes exatamente como enviados.
- missingCriticalFields deve conter campos essenciais ausentes: transaction, location, price, propertyType quando faltarem.

Contexto opcional do produto:
${JSON.stringify(context, null, 2)}
`.trim();
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsedRequest = RequestSchema.safeParse(json);

    if (!parsedRequest.success) {
      return Response.json(
        { error: "Envie um JSON com { text: string, context?: {...} }." },
        { status: 400 }
      );
    }

    const { text, context = {} } = parsedRequest.data;

    // This makes the demo usable without an API key. In production, keep OPENAI_API_KEY set.
    if (!process.env.OPENAI_API_KEY) {
      const filters = localParsePropertySearchText(text, context);
      return Response.json({
        filters,
        searchParams: toPropertySearchParams(filters),
        parser: "local-fallback",
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: text },
      ],
      text: {
        format: zodTextFormat(PropertySearchFiltersSchema, "property_search_filters"),
      },
    });

    const filters = response.output_parsed;

    if (!filters) {
      return Response.json(
        { error: "A busca foi recebida, mas não voltou em formato estruturado." },
        { status: 422 }
      );
    }

    return Response.json({
      filters,
      searchParams: toPropertySearchParams(filters),
      parser: "openai",
    });
  } catch (error) {
    console.error("parse-property-search error", error);
    return Response.json(
      { error: "Erro ao interpretar a busca por voz." },
      { status: 500 }
    );
  }
}
