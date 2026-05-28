import type { ReactNode } from "react";

export const metadata = {
  title: "Zodiacs SDK Example",
  description: "A read-only Zodiacs SDK integration example."
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0f0d0a", margin: 0 }}>{children}</body>
    </html>
  );
}
