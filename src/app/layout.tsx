import { ReactNode } from "react";
import { Header } from "../widgets";

import "./globals.css";
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
        <div className={s.page}>
          <header className={s.headerBar}>
            <div className={s.container}>
              <Header />
            </div>
          </header>

          <main className={s.container}>{children}</main>

          <footer className={s.footer}>
            <div className={s.container}>
              <span>tempo</span>
              <span>Твоё время — твой ресурс.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
