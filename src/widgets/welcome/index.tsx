import { formatDate, formatDuration } from "../../shared/utils";
import s from "./style.module.css";

interface Props {
  periodLabel: string;
  totalMinutes: number;
}

export const Welcome = ({ periodLabel, totalMinutes }: Props) => {
  return (
    <section className={s.welcome}>
      <p className={s.eyebrow}>СВОДКА</p>

      <div className={s.titleRow}>
        <h1>{periodLabel}</h1>
        <span className={s.pill}>{formatDuration(totalMinutes)}</span>
      </div>

      <p className={s.description}>
        {formatDate()} · меньше хаоса, больше контроля.
      </p>
    </section>
  );
};
