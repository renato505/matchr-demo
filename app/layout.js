export const metadata = {
  title: "Matchr — Demo",
  description: "Demo navegável do Matchr para corretores e investidores"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
