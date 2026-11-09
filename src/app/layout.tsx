import { ReactNode } from "react";
import { Header } from "../widgets";

import s from "./style.module.css";

export const metadata = {
  title: "Tempo",
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru">
      <body>
        <main className={s.container}>
          <Header />

          {children}

          <footer className={s.footer}>
            <span>tempo</span>
            <span>Твоё время — твой ресурс.</span>
          </footer>
        </main>
      </body>
    </html>
  );
}
