import { formatDuration } from "../../utils";
import s from "./style.module.css";

interface Props {
  totalMinutes: number;
  entriesCount: number;
}

export const DailyStats = ({ totalMinutes, entriesCount }: Props) => {
  return (
    <section className={s.stats}>
      <div className={`${s.card} ${s.main}`}>
        <span className={s.label}>Учтено сегодня</span>
        <strong className={s.value}>{formatDuration(totalMinutes)}</strong>
        <span className={s.hint}>Общее время активностей</span>
      </div>

      <div className={s.card}>
        <span className={s.label}>Записей</span>
        <strong className={s.value}>{entriesCount}</strong>
        <span className={s.hint}>За сегодня</span>
      </div>
    </section>
  );
};
