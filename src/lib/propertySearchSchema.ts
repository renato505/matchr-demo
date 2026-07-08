import { z } from "zod";

export const TransactionSchema = z.enum([
  "compra",
  "aluguel",
  "temporada",
  "indefinido",
]);

export const PropertyTypeSchema = z.enum([
  "apartamento",
  "casa",
  "cobertura",
  "studio",
  "kitnet",
  "loft",
  "sobrado",
  "terreno",
  "sala_comercial",
  "galpao",
  "fazenda",
  "chacara",
  "indefinido",
]);

export const PropertySearchFiltersSchema = z.object({
  rawText: z.string().describe("Texto original falado ou digitado pelo corretor."),
  normalizedText: z.string().describe("Texto limpo, mantendo o sentido da fala."),

  transaction: TransactionSchema.describe(
    "Tipo de negociação: compra, aluguel, temporada ou indefinido."
  ),

  propertyType: PropertyTypeSchema.describe(
    "Tipo de imóvel mencionado. Use indefinido quando a fala não especificar."
  ),

  location: z.object({
    neighborhoods: z.array(z.string()).describe("Bairros citados explicitamente."),
    cities: z.array(z.string()).describe("Cidades citadas explicitamente."),
    states: z.array(z.string()).describe("Estados ou UFs citados explicitamente."),
    zones: z.array(z.string()).describe("Zonas como zona sul, zona oeste, centro etc."),
    referencePoints: z.array(z.string()).describe("Pontos de referência: metrô, shopping, praia, escola, avenida etc."),
  }),

  price: z.object({
    min: z.number().int().nullable().describe("Preço mínimo em BRL, sem centavos. Null se não houver."),
    max: z.number().int().nullable().describe("Preço máximo em BRL, sem centavos. Null se não houver."),
    currency: z.literal("BRL"),
    includesCondoOrFees: z.boolean().describe("True se a fala indicar que condomínio/IPTU/taxas entram no teto."),
    note: z.string().nullable().describe("Observação de preço, como 'aceita proposta' ou 'valor fechado'."),
  }),

  condoFee: z.object({
    max: z.number().int().nullable().describe("Condomínio máximo em BRL, sem centavos."),
  }),

  iptu: z.object({
    max: z.number().int().nullable().describe("IPTU máximo em BRL, sem centavos."),
  }),

  bedrooms: z.object({
    min: z.number().int().nullable(),
    exact: z.number().int().nullable(),
  }),

  suites: z.object({
    min: z.number().int().nullable(),
    exact: z.number().int().nullable(),
  }),

  bathrooms: z.object({
    min: z.number().int().nullable(),
    exact: z.number().int().nullable(),
  }),

  parkingSpaces: z.object({
    min: z.number().int().nullable(),
    exact: z.number().int().nullable(),
  }),

  area: z.object({
    minM2: z.number().int().nullable(),
    maxM2: z.number().int().nullable(),
  }),

  floor: z.object({
    min: z.number().int().nullable(),
    max: z.number().int().nullable(),
    note: z.string().nullable(),
  }),

  features: z.object({
    mustHave: z.array(z.string()).describe("Características obrigatórias: varanda gourmet, piscina, elevador etc."),
    niceToHave: z.array(z.string()).describe("Características desejadas, mas não obrigatórias."),
    negative: z.array(z.string()).describe("Coisas que o cliente não quer: térreo, rua barulhenta, sem vaga etc."),
  }),

  clientProfile: z.object({
    urgency: z.enum(["alta", "media", "baixa", "indefinida"]),
    financing: z.enum(["sim", "nao", "indefinido"]),
    acceptsExchange: z.enum(["sim", "nao", "indefinido"]),
    notes: z.array(z.string()).describe("Observações comerciais sobre o cliente ou negociação."),
  }),

  rankingHints: z.object({
    prioritize: z.array(z.string()).describe("Critérios para ordenar resultados: menor preço, maior área, perto do metrô etc."),
    sortBy: z.enum([
      "relevance",
      "price_asc",
      "price_desc",
      "area_desc",
      "newest",
    ]),
  }),

  confidence: z.number().min(0).max(1).describe("Confiança geral da interpretação."),
  missingCriticalFields: z.array(z.string()).describe("Campos importantes ausentes na fala."),
});

export type PropertySearchFilters = z.infer<typeof PropertySearchFiltersSchema>;

export function emptyPropertySearchFilters(rawText = ""): PropertySearchFilters {
  return {
    rawText,
    normalizedText: rawText.trim(),
    transaction: "indefinido",
    propertyType: "indefinido",
    location: {
      neighborhoods: [],
      cities: [],
      states: [],
      zones: [],
      referencePoints: [],
    },
    price: {
      min: null,
      max: null,
      currency: "BRL",
      includesCondoOrFees: false,
      note: null,
    },
    condoFee: { max: null },
    iptu: { max: null },
    bedrooms: { min: null, exact: null },
    suites: { min: null, exact: null },
    bathrooms: { min: null, exact: null },
    parkingSpaces: { min: null, exact: null },
    area: { minM2: null, maxM2: null },
    floor: { min: null, max: null, note: null },
    features: { mustHave: [], niceToHave: [], negative: [] },
    clientProfile: {
      urgency: "indefinida",
      financing: "indefinido",
      acceptsExchange: "indefinido",
      notes: [],
    },
    rankingHints: { prioritize: [], sortBy: "relevance" },
    confidence: 0,
    missingCriticalFields: [],
  };
}
