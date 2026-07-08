"use client";

import { useState } from "react";
import { VoiceSearchBox } from "../../components/VoiceSearchBox";
import type { PropertySearchParams } from "../../lib/toSearchQuery";

const knownNeighborhoods = [
  "Vila Madalena",
  "Pinheiros",
  "Jardins",
  "Moema",
  "Itaim Bibi",
  "Brooklin",
  "Copacabana",
  "Ipanema",
  "Leblon",
  "Savassi",
];

const knownCities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Florianópolis", "Curitiba"];
const knownStates = ["SP", "RJ", "MG", "SC", "PR"];

export default function DemoPage() {
  const [params, setParams] = useState<PropertySearchParams | null>(null);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Demo — busca imobiliária por voz</h1>
      <VoiceSearchBox
        knownNeighborhoods={knownNeighborhoods}
        knownCities={knownCities}
        knownStates={knownStates}
        onSearch={(searchParams) => {
          setParams(searchParams);
          // Troque por sua busca real:
          // router.push(`/imoveis?${new URLSearchParams(flatten(searchParams))}`)
          // ou fetchProperties(searchParams)
        }}
      />

      {params && (
        <section style={{ marginTop: 24 }}>
          <h2>Seu motor de busca receberia:</h2>
          <pre style={{ overflowX: "auto", background: "#f3f4f6", padding: 16, borderRadius: 12 }}>
            {JSON.stringify(params, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
