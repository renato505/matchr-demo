"use client";

import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import type { PropertySearchFilters } from "../lib/propertySearchSchema";
import type { PropertySearchParams } from "../lib/toSearchQuery";

type ParseResponse = {
  filters: PropertySearchFilters;
  searchParams: PropertySearchParams;
  parser: "openai" | "local-fallback";
};

export type VoiceSearchBoxProps = {
  parseEndpoint?: string;
  knownNeighborhoods?: string[];
  knownCities?: string[];
  knownStates?: string[];
  onParsed?: (response: ParseResponse) => void;
  onSearch?: (params: PropertySearchParams, filters: PropertySearchFilters) => void;
};

const buttonStyle: CSSProperties = {
  border: "1px solid #111827",
  borderRadius: 999,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "transparent",
};

function formatCurrency(value: number | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function FilterPreview({ filters }: { filters: PropertySearchFilters }) {
  const chips = useMemo(() => {
    const result: string[] = [];
    if (filters.transaction !== "indefinido") result.push(filters.transaction);
    if (filters.propertyType !== "indefinido") result.push(filters.propertyType.replace("_", " "));
    result.push(...filters.location.neighborhoods);
    result.push(...filters.location.cities);
    if (filters.price.min) result.push(`a partir de ${formatCurrency(filters.price.min)}`);
    if (filters.price.max) result.push(`até ${formatCurrency(filters.price.max)}`);
    if (filters.bedrooms.min) result.push(`${filters.bedrooms.min}+ quartos`);
    if (filters.suites.min) result.push(`${filters.suites.min}+ suítes`);
    if (filters.parkingSpaces.min) result.push(`${filters.parkingSpaces.min}+ vagas`);
    if (filters.area.minM2) result.push(`${filters.area.minM2}+ m²`);
    result.push(...filters.features.mustHave);
    return result;
  }, [filters]);

  if (chips.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {chips.map((chip) => (
        <span
          key={chip}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 13,
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

export function VoiceSearchBox({
  parseEndpoint = "/api/parse-property-search",
  knownNeighborhoods = [],
  knownCities = [],
  knownStates = [],
  onParsed,
  onSearch,
}: VoiceSearchBoxProps) {
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    confidence,
    error,
    start,
    stop,
    reset,
    setTranscript,
  } = useSpeechToText({ language: "pt-BR", continuous: false, interimResults: true });

  const [manualText, setManualText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ParseResponse | null>(null);

  const textToParse = (transcript || manualText).trim();

  async function parseAndSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!textToParse) {
      setParseError("Fale ou digite o que o cliente procura.");
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch(parseEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToParse,
          context: { knownNeighborhoods, knownCities, knownStates },
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Não consegui interpretar a busca agora.");
      }

      const payload = (await response.json()) as ParseResponse;
      setLastResponse(payload);
      onParsed?.(payload);
      onSearch?.(payload.searchParams, payload.filters);
    } catch (caught) {
      setParseError(caught instanceof Error ? caught.message : "Erro inesperado ao interpretar a fala.");
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <form
      onSubmit={parseAndSearch}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 18,
        maxWidth: 760,
        background: "#fff",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <label htmlFor="voice-search-text" style={{ display: "block", fontWeight: 800, marginBottom: 8 }}>
        Busca por voz do corretor
      </label>

      <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.5 }}>
        Exemplo: “Apartamento para compra na Vila Madalena até 1 milhão e meio, 3 quartos,
        2 suítes, 2 vagas e varanda gourmet.”
      </p>

      <textarea
        id="voice-search-text"
        value={textToParse}
        onChange={(event) => {
          setManualText(event.target.value);
          setTranscript(event.target.value);
        }}
        placeholder="Fale a busca ou digite aqui como fallback..."
        rows={4}
        style={{
          width: "100%",
          border: "1px solid #d1d5db",
          borderRadius: 14,
          padding: 12,
          resize: "vertical",
          fontSize: 16,
          lineHeight: 1.5,
        }}
      />

      {interimTranscript && (
        <p style={{ color: "#6b7280", marginBottom: 0 }}>Ouvindo: {interimTranscript}</p>
      )}

      {confidence !== null && (
        <p style={{ color: "#6b7280", marginBottom: 0 }}>
          Confiança do reconhecimento de voz: {Math.round(confidence * 100)}%
        </p>
      )}

      {!isSupported && (
        <p style={{ color: "#92400e" }}>
          Seu navegador não suporta reconhecimento de voz nativo. O campo de texto continua funcionando.
        </p>
      )}

      {(error || parseError) && <p style={{ color: "#b91c1c" }}>{error || parseError}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        {!isListening ? (
          <button type="button" onClick={start} style={buttonStyle} disabled={!isSupported || isParsing}>
            🎙️ Falar busca
          </button>
        ) : (
          <button type="button" onClick={stop} style={buttonStyle}>
            Parar gravação
          </button>
        )}

        <button type="submit" style={buttonStyle} disabled={isParsing}>
          {isParsing ? "Interpretando..." : "Interpretar e buscar"}
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
            setManualText("");
            setLastResponse(null);
            setParseError(null);
          }}
          style={ghostButtonStyle}
          disabled={isParsing}
        >
          Limpar
        </button>
      </div>

      {lastResponse && (
        <section style={{ marginTop: 16 }}>
          <strong>Filtros extraídos</strong>
          <FilterPreview filters={lastResponse.filters} />
          {lastResponse.filters.missingCriticalFields.length > 0 && (
            <p style={{ color: "#92400e" }}>
              Faltou na fala: {lastResponse.filters.missingCriticalFields.join(", ")}.
            </p>
          )}
          <details style={{ marginTop: 10 }}>
            <summary>Ver JSON enviado para o motor de busca</summary>
            <pre style={{ overflowX: "auto", background: "#f9fafb", padding: 12, borderRadius: 12 }}>
              {JSON.stringify(lastResponse.searchParams, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </form>
  );
}
