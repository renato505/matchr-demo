import type { PropertySearchFilters } from "./propertySearchSchema";

export type PropertySearchParams = {
  transaction?: "compra" | "aluguel" | "temporada";
  property_type?: string;
  neighborhoods?: string[];
  cities?: string[];
  states?: string[];
  zones?: string[];
  reference_points?: string[];
  price_min?: number;
  price_max?: number;
  condo_fee_max?: number;
  iptu_max?: number;
  bedrooms_min?: number;
  bedrooms_exact?: number;
  suites_min?: number;
  suites_exact?: number;
  bathrooms_min?: number;
  bathrooms_exact?: number;
  parking_spaces_min?: number;
  parking_spaces_exact?: number;
  area_min_m2?: number;
  area_max_m2?: number;
  floor_min?: number;
  floor_max?: number;
  must_have?: string[];
  nice_to_have?: string[];
  must_not_have?: string[];
  sort_by?: "relevance" | "price_asc" | "price_desc" | "area_desc" | "newest";
  free_text?: string;
};

function defined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function nonEmpty(value: string[] | undefined): string[] | undefined {
  return value && value.length > 0 ? value : undefined;
}

export function toPropertySearchParams(filters: PropertySearchFilters): PropertySearchParams {
  const params: PropertySearchParams = {
    transaction: filters.transaction !== "indefinido" ? filters.transaction : undefined,
    property_type: filters.propertyType !== "indefinido" ? filters.propertyType : undefined,
    neighborhoods: nonEmpty(filters.location.neighborhoods),
    cities: nonEmpty(filters.location.cities),
    states: nonEmpty(filters.location.states),
    zones: nonEmpty(filters.location.zones),
    reference_points: nonEmpty(filters.location.referencePoints),
    price_min: defined(filters.price.min) ? filters.price.min : undefined,
    price_max: defined(filters.price.max) ? filters.price.max : undefined,
    condo_fee_max: defined(filters.condoFee.max) ? filters.condoFee.max : undefined,
    iptu_max: defined(filters.iptu.max) ? filters.iptu.max : undefined,
    bedrooms_min: defined(filters.bedrooms.min) ? filters.bedrooms.min : undefined,
    bedrooms_exact: defined(filters.bedrooms.exact) ? filters.bedrooms.exact : undefined,
    suites_min: defined(filters.suites.min) ? filters.suites.min : undefined,
    suites_exact: defined(filters.suites.exact) ? filters.suites.exact : undefined,
    bathrooms_min: defined(filters.bathrooms.min) ? filters.bathrooms.min : undefined,
    bathrooms_exact: defined(filters.bathrooms.exact) ? filters.bathrooms.exact : undefined,
    parking_spaces_min: defined(filters.parkingSpaces.min) ? filters.parkingSpaces.min : undefined,
    parking_spaces_exact: defined(filters.parkingSpaces.exact) ? filters.parkingSpaces.exact : undefined,
    area_min_m2: defined(filters.area.minM2) ? filters.area.minM2 : undefined,
    area_max_m2: defined(filters.area.maxM2) ? filters.area.maxM2 : undefined,
    floor_min: defined(filters.floor.min) ? filters.floor.min : undefined,
    floor_max: defined(filters.floor.max) ? filters.floor.max : undefined,
    must_have: nonEmpty(filters.features.mustHave),
    nice_to_have: nonEmpty(filters.features.niceToHave),
    must_not_have: nonEmpty(filters.features.negative),
    sort_by: filters.rankingHints.sortBy,
    free_text: filters.normalizedText,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as PropertySearchParams;
}
