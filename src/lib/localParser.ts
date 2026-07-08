import { emptyPropertySearchFilters, type PropertySearchFilters } from "./propertySearchSchema";

type PropertyType = PropertySearchFilters["propertyType"];

export type ParseContext = {
  knownNeighborhoods?: string[];
  knownCities?: string[];
  knownStates?: string[];
};

const PROPERTY_TYPE_PATTERNS: Array<[PropertyType, RegExp]> = [
  ["apartamento", /\b(apartamento|apto|apt\.?|ape|apê|ap)\b/i],
  ["cobertura", /\b(cobertura|penthouse)\b/i],
  ["casa", /\b(casa|casas)\b/i],
  ["studio", /\b(studio|estudio|estúdio)\b/i],
  ["kitnet", /\b(kitnet|quitinete|kitchenette)\b/i],
  ["loft", /\b(loft)\b/i],
  ["sobrado", /\b(sobrado)\b/i],
  ["terreno", /\b(terreno|lote)\b/i],
  ["sala_comercial", /\b(sala comercial|comercial|consultorio|consultório|escritorio|escritório)\b/i],
  ["galpao", /\b(galpao|galpão|barracao|barracão)\b/i],
  ["fazenda", /\b(fazenda)\b/i],
  ["chacara", /\b(chacara|chácara|sitio|sítio)\b/i],
];

const FEATURE_TERMS = [
  "varanda gourmet",
  "varanda",
  "sacada",
  "piscina",
  "churrasqueira",
  "elevador",
  "portaria 24 horas",
  "portaria",
  "mobiliado",
  "reformado",
  "novo",
  "andar alto",
  "vista livre",
  "vista mar",
  "perto do metrô",
  "perto do metro",
  "metrô",
  "metro",
  "academia",
  "coworking",
  "salão de festas",
  "salao de festas",
  "pet friendly",
  "ar condicionado",
  "sol da manhã",
  "sol da manha",
];

const NEGATIVE_MARKERS = ["sem", "não quero", "nao quero", "evitar", "não pode", "nao pode", "menos"];

function removeDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function lowerPlain(value: string): string {
  return removeDiacritics(value).toLowerCase();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.map((v) => v.trim()).filter(Boolean)) {
    const key = lowerPlain(value);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

function parseNumber(value: string): number | null {
  const raw = value.trim();
  const looksLikeDecimal = /^\d+[.,]\d{1,2}$/.test(raw);
  const normalized = looksLikeDecimal
    ? raw.replace(",", ".")
    : raw.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMoneyValue(fragment: string): number | null {
  const text = lowerPlain(fragment)
    .replace(/reais?|r\$/g, " ")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  const millionAndThousands = text.match(/(\d+(?:\.\d+)?)\s*(milhao|milhoes)\s*e\s*(\d{1,3})\b/);
  if (millionAndThousands) {
    const million = parseNumber(millionAndThousands[1]);
    const thousands = parseNumber(millionAndThousands[3]);
    if (million !== null && thousands !== null) return Math.round(million * 1_000_000 + thousands * 1_000);
  }

  const oneAndHalfMillion = text.match(/(?:um|1)\s*milhao\s*e\s*meio/);
  if (oneAndHalfMillion) return 1_500_000;

  const million = text.match(/(\d+(?:\.\d+)?)\s*(milhao|milhoes)\b/);
  if (million) {
    const number = parseNumber(million[1]);
    if (number !== null) return Math.round(number * 1_000_000);
  }

  const thousand = text.match(/(\d+(?:\.\d+)?)\s*mil\b/);
  if (thousand) {
    const number = parseNumber(thousand[1]);
    if (number !== null) return Math.round(number * 1_000);
  }

  const explicitFull = text.match(/\b(\d{1,3}(?:\.\d{3}){1,3}|\d{6,})\b/);
  if (explicitFull) {
    const number = parseNumber(explicitFull[1]);
    if (number !== null) return Math.round(number);
  }

  // In Brazilian broker speech, "até 1.5" near a price marker usually means 1.5M.
  const looseDecimal = text.match(/\b(\d+\.\d+)\b/);
  if (looseDecimal) {
    const number = parseNumber(looseDecimal[1]);
    if (number !== null && number < 20) return Math.round(number * 1_000_000);
  }

  return null;
}

function parsePrice(text: string): { min: number | null; max: number | null } {
  const plain = lowerPlain(text).replace(/,/g, ".");
  let min: number | null = null;
  let max: number | null = null;

  const between = plain.match(/(?:entre|de)\s+(.+?)\s+(?:e|a|ate)\s+(.+)/);
  if (between) {
    min = parseMoneyValue(between[1]);
    max = parseMoneyValue(between[2]);
  }

  const upper = plain.match(/(?:ate|no maximo|maximo|teto de|limite de|por ate)\s+(.+)/);
  if (upper) max = parseMoneyValue(upper[1]);

  const lower = plain.match(/(?:a partir de|acima de|desde|minimo de)\s+(.+)/);
  if (lower) min = parseMoneyValue(lower[1]);

  if (min === null && max === null) {
    const money = parseMoneyValue(plain);
    if (money !== null) max = money;
  }

  return { min, max };
}

const NUMBER_WORDS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
};

function toSmallNumber(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);
  return NUMBER_WORDS[value] ?? null;
}

function numberBefore(text: string, words: string): number | null {
  const match = lowerPlain(text).match(
    new RegExp(`\\b(\\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\\s*(?:${words})\\b`, "i")
  );
  if (!match) return null;
  return toSmallNumber(match[1]);
}

function extractListFromKnownTerms(text: string, terms: string[] | undefined): string[] {
  if (!terms || terms.length === 0) return [];
  const plain = lowerPlain(text);
  return unique(
    terms.filter((term) => {
      const normalized = lowerPlain(term);
      return new RegExp(`(^|\\W)${escapeRegExp(normalized)}($|\\W)`, "i").test(plain);
    })
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferLooseLocations(text: string): string[] {
  const original = text.trim();
  const chunks = original.match(/(?:\b(?:no|na|nos|nas|em|para|perto de|próximo de|proximo de)\s+)([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\wÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç' -]{2,40})/g);
  if (!chunks) return [];

  return unique(
    chunks
      .map((chunk) =>
        chunk
          .replace(/^(no|na|nos|nas|em|para|perto de|próximo de|proximo de)\s+/i, "")
          .replace(/\s+(até|ate|com|de|por|e|ou).*$/i, "")
          .trim()
      )
      .filter((value) => value.length >= 3)
  );
}

function extractZones(text: string): string[] {
  const plain = lowerPlain(text);
  const zones: string[] = [];
  for (const zone of ["zona sul", "zona norte", "zona leste", "zona oeste", "centro", "regiao central"]) {
    if (plain.includes(zone)) zones.push(zone);
  }
  return unique(zones);
}

function extractFeatures(text: string): { mustHave: string[]; negative: string[] } {
  const plain = lowerPlain(text);
  const mustHave: string[] = [];
  const negative: string[] = [];

  for (const feature of FEATURE_TERMS) {
    const featurePlain = lowerPlain(feature);
    const index = plain.indexOf(featurePlain);
    if (index === -1) continue;

    const before = plain.slice(Math.max(0, index - 24), index);
    const isNegative = NEGATIVE_MARKERS.some((marker) => before.includes(marker));
    if (isNegative) negative.push(feature);
    else mustHave.push(feature);
  }

  return { mustHave: unique(mustHave), negative: unique(negative) };
}

function extractReferencePoints(text: string): string[] {
  const points: string[] = [];
  const original = text;
  const matches = original.match(/(?:perto|próximo|proximo|ao lado)\s+(?:do|da|de)?\s*([\wÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç' -]{3,45})/gi);
  if (matches) {
    for (const match of matches) {
      points.push(
        match
          .replace(/^(perto|próximo|proximo|ao lado)\s+(do|da|de)?\s*/i, "")
          .replace(/\s+(com|até|ate|por|e|ou).*$/i, "")
          .trim()
      );
    }
  }
  return unique(points);
}

export function localParsePropertySearchText(text: string, context: ParseContext = {}): PropertySearchFilters {
  const filters = emptyPropertySearchFilters(text);
  const plain = lowerPlain(text);

  if (/\b(alugar|aluguel|locacao|locação|locar)\b/.test(plain)) filters.transaction = "aluguel";
  if (/\b(comprar|compra|venda|vender|adquirir)\b/.test(plain)) filters.transaction = "compra";
  if (/\b(temporada|airbnb|curta temporada)\b/.test(plain)) filters.transaction = "temporada";

  for (const [propertyType, pattern] of PROPERTY_TYPE_PATTERNS) {
    if (pattern.test(text)) {
      filters.propertyType = propertyType;
      break;
    }
  }

  filters.location.neighborhoods = unique([
    ...extractListFromKnownTerms(text, context.knownNeighborhoods),
    ...inferLooseLocations(text),
  ]);
  filters.location.cities = extractListFromKnownTerms(text, context.knownCities);
  filters.location.states = extractListFromKnownTerms(text, context.knownStates);
  filters.location.zones = extractZones(text);
  filters.location.referencePoints = extractReferencePoints(text);

  const price = parsePrice(text);
  filters.price.min = price.min;
  filters.price.max = price.max;
  filters.price.includesCondoOrFees = /\b(condominio|condomínio|iptu|taxas?|tudo incluso|pacote)\b/i.test(text);

  const condo = lowerPlain(text).match(/condominio.{0,20}?(?:ate|até|maximo|máximo)?\s*(.{1,25})/);
  if (condo) filters.condoFee.max = parseMoneyValue(condo[1]);

  const iptu = lowerPlain(text).match(/iptu.{0,20}?(?:ate|até|maximo|máximo)?\s*(.{1,25})/);
  if (iptu) filters.iptu.max = parseMoneyValue(iptu[1]);

  const bedrooms = numberBefore(text, "quartos?|dormitorios?|dormitórios?|dorms?");
  if (bedrooms !== null) filters.bedrooms.min = bedrooms;

  const suites = numberBefore(text, "suites?|suítes?");
  if (suites !== null) filters.suites.min = suites;

  const bathrooms = numberBefore(text, "banheiros?|lavabos?");
  if (bathrooms !== null) filters.bathrooms.min = bathrooms;

  const parking = numberBefore(text, "vagas?");
  if (parking !== null) filters.parkingSpaces.min = parking;

  const minArea = plain.match(/(?:acima de|a partir de|minimo de|mínimo de|mais de)\s*(\d+)\s*m(?:2|²|etros)?/);
  const maxArea = plain.match(/(?:ate|até|maximo|máximo)\s*(\d+)\s*m(?:2|²|etros)?/);
  const exactArea = plain.match(/\b(\d+)\s*m(?:2|²|etros quadrados)?\b/);
  if (minArea) filters.area.minM2 = Number(minArea[1]);
  else if (exactArea) filters.area.minM2 = Number(exactArea[1]);
  if (maxArea) filters.area.maxM2 = Number(maxArea[1]);

  const features = extractFeatures(text);
  filters.features.mustHave = features.mustHave;
  filters.features.negative = features.negative;

  if (/\b(urgente|essa semana|hoje|amanha|amanhã|ja|já)\b/.test(plain)) filters.clientProfile.urgency = "alta";
  else if (/\b(sem pressa|calma|proximo mes|próximo mês)\b/.test(plain)) filters.clientProfile.urgency = "baixa";

  if (/\b(financiamento|financiar|financiado)\b/.test(plain)) filters.clientProfile.financing = "sim";
  if (/\b(permuta)\b/.test(plain)) filters.clientProfile.acceptsExchange = "sim";

  if (/\b(menor preco|menor preço|barato|mais barato)\b/.test(plain)) filters.rankingHints.sortBy = "price_asc";
  if (/\b(maior area|maior área|metragem)\b/.test(plain)) filters.rankingHints.sortBy = "area_desc";

  const missing: string[] = [];
  if (filters.transaction === "indefinido") missing.push("transaction");
  if (
    filters.location.neighborhoods.length === 0 &&
    filters.location.cities.length === 0 &&
    filters.location.zones.length === 0 &&
    filters.location.referencePoints.length === 0
  ) {
    missing.push("location");
  }
  if (filters.price.min === null && filters.price.max === null) missing.push("price");
  filters.missingCriticalFields = missing;

  const knownFields = [
    filters.transaction !== "indefinido",
    filters.propertyType !== "indefinido",
    missing.length < 3,
    filters.price.min !== null || filters.price.max !== null,
    filters.bedrooms.min !== null,
    filters.suites.min !== null,
    filters.parkingSpaces.min !== null,
    filters.features.mustHave.length > 0,
  ].filter(Boolean).length;
  filters.confidence = Math.min(0.85, 0.2 + knownFields * 0.09);

  return filters;
}
