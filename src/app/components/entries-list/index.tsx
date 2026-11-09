import type { Entry } from "../../types";
import { CATEGORIES } from "../../constants";
import { formatDuration } from "../../utils";

import s from "./style.module.css";

interface Props {
  entries: Entry[];
  onDelete: (id: number) => void;
}

export const EntriesList = ({ entries, onDelete }: Props) => {
  return (
    <div className={s.panel}>
      <div className={s.heading}>
        <div>
          <p className={s.eyebrow}>ИСТОРИЯ</p>
          <h2>Сегодня</h2>
        </div>
        <span className={s.count}>{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>◷</div>
          <h3>Пока нет записей</h3>
          <p>Добавь первую активность, чтобы начать отслеживать свой день.</p>
        </div>
      ) : (
        <div className={s.list}>
          {entries.map((entry) => {
            const category = CATEGORIES.find(
              (item) => item.id === entry.category,
            );

            return (
              <div className={s.item} key={entry.id}>
                <div className={s.indicator} />

                <div className={s.info}>
                  <strong>{entry.activity}</strong>
                  <span>{category?.label ?? "Другое"}</span>
                </div>

                <div className={s.duration}>
                  {formatDuration(entry.minutes)}
                </div>

                <button
                  className={s.deleteButton}
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Удалить запись ${entry.activity}`}
                  type="button"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
