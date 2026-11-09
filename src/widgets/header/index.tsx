import Link from "next/link";
import { formatDate } from "../../shared/utils";

import s from "./style.module.css";

export const Header = () => {
  return (
    <header className={s.header}>
      <Link className={s.logo} href="/">
        <span className={s.logoMark}>t</span>
        tempo
      </Link>

      <div className={s.date}>{formatDate()}</div>
    </header>
  );
};
