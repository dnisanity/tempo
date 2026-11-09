import { ReactNode } from "react";

export const metadata = {
  title: "Tempo",
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
