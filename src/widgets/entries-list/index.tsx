"use client";

import { useState } from "react";

import type { Activity, Category } from "../../shared/types";
import { CATEGORIES } from "../../shared/constants";
import { formatDuration } from "../../shared/utils";

import s from "./style.module.css";

const formatDateInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 10);
};

const formatHistoryDate = (dateValue: string) => {
  const value = new Date(dateValue);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
};

const formatTimeRange = (
  startTime?: string | null,
  endTime?: string | null,
) => {
  if (!startTime && !endTime) {
    return "";
  }

  if (startTime && endTime) {
    return `${startTime}–${endTime}`;
  }

  return startTime ? `с ${startTime}` : `до ${endTime}`;
};

interface Props {
  entries: Activity[];
  onDelete: (id: number) => void;
  onEdit: (
    id: number,
    activity: string,
    minutes: number,
    category: Category,
    date: string,
    startTime?: string | null,
    endTime?: string | null,
  ) => void;
  periodLabel: string;
}

export const EntriesList = ({
  entries,
  onDelete,
  onEdit,
  periodLabel,
}: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className={s.panel}>
      <div className={s.heading}>
        <div>
          <p className={s.eyebrow}>ИСТОРИЯ</p>
          <h2>{periodLabel}</h2>
        </div>
        <span className={s.count}>{entries.length}</span>
      </div>

      {entries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>◷</div>
          <h3 className={s.emptyTitle}>Пока нет записей</h3>
          <p className={s.emptyDescription}>
            Добавь первую активность, чтобы начать видеть картину по выбранному
            периоду.
          </p>
        </div>
      ) : (
        <div className={s.list}>
          {entries.map((entry) => {
            const category = CATEGORIES.find(
              (item) => item.id === entry.category,
            );
            const entryLabel = entry.activity || category?.label || "Запись";

            if (editingId === entry.id) {
              return (
                <form
                  key={entry.id}
                  className={s.editForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const rawActivity = String(
                      formData.get("activity") ?? entry.activity,
                    ).trim();
                    const rawMinutes = Number(
                      formData.get("minutes") ?? entry.minutes,
                    );
                    const startTime =
                      String(
                        formData.get("startTime") ?? entry.startTime ?? "",
                      ).trim() || null;
                    const endTime =
                      String(
                        formData.get("endTime") ?? entry.endTime ?? "",
                      ).trim() || null;
                    const categoryValue = String(
                      formData.get("category") ?? entry.category,
                    ) as Category;
                    const date = String(formData.get("date") ?? entry.date);

                    const rangeMinutes =
                      startTime && endTime
                        ? Math.max(
                            0,
                            Math.round(
                              (new Date(`1970-01-02T${endTime}:00`).getTime() -
                                new Date(
                                  `1970-01-02T${startTime}:00`,
                                ).getTime()) /
                                60000,
                            ),
                          )
                        : null;

                    const minutes =
                      rangeMinutes !== null && rangeMinutes > 0
                        ? rangeMinutes
                        : Number.isFinite(rawMinutes) && rawMinutes > 0
                          ? rawMinutes
                          : 0;

                    if (!date || minutes <= 0) {
                      return;
                    }

                    const activity =
                      rawActivity ||
                      CATEGORIES.find((item) => item.id === categoryValue)
                        ?.label ||
                      "Активность";

                    onEdit(
                      entry.id,
                      activity,
                      minutes,
                      categoryValue,
                      date,
                      startTime,
                      endTime,
                    );
                    setEditingId(null);
                  }}
                >
                  <label className={s.field}>
                    <input
                      className={s.editInput}
                      name="activity"
                      defaultValue={entry.activity}
                      placeholder="Что делал?"
                    />
                  </label>

                  <div className={s.editGrid}>
                    <label className={s.field}>
                      <input
                        className={s.editInput}
                        name="minutes"
                        type="number"
                        min="1"
                        defaultValue={entry.minutes}
                        placeholder="мин"
                      />
                    </label>

                    <label className={s.field}>
                      <input
                        className={s.editInput}
                        name="date"
                        type="date"
                        defaultValue={formatDateInputValue(
                          new Date(entry.date),
                        )}
                        required
                      />
                    </label>

                    <label className={s.field}>
                      <input
                        className={s.editInput}
                        name="startTime"
                        type="time"
                        defaultValue={entry.startTime ?? ""}
                        aria-label="Время начала"
                        placeholder="с"
                      />
                    </label>

                    <label className={s.field}>
                      <input
                        className={s.editInput}
                        name="endTime"
                        type="time"
                        defaultValue={entry.endTime ?? ""}
                        aria-label="Время завершения"
                        placeholder="до"
                      />
                    </label>

                    <label className={s.field}>
                      <select
                        className={s.editInput}
                        name="category"
                        defaultValue={entry.category}
                        aria-label="Категория"
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className={s.editActions}>
                    <button className={s.saveButton} type="submit">
                      Сохранить
                    </button>
                    <button
                      className={s.cancelButton}
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div className={s.item} key={entry.id}>
                <div className={s.indicator} />

                <div className={s.info}>
                  <strong>{entryLabel}</strong>
                  <div className={s.metaRow}>
                    <span>{category?.label ?? "Другое"}</span>
                    {entry.startTime || entry.endTime ? (
                      <span>
                        {formatTimeRange(entry.startTime, entry.endTime)}
                      </span>
                    ) : null}
                    <span>{formatHistoryDate(entry.date)}</span>
                  </div>
                </div>

                <div className={s.duration}>
                  {formatDuration(entry.minutes)}
                </div>

                <div className={s.actionRow}>
                  <button
                    className={s.editButton}
                    onClick={() => setEditingId(entry.id)}
                    aria-label={`Редактировать запись ${entryLabel}`}
                    type="button"
                  >
                    ✎
                  </button>

                  <button
                    className={s.deleteButton}
                    onClick={() => {
                      if (window.confirm(`Удалить запись "${entryLabel}"?`)) {
                        onDelete(entry.id);
                      }
                    }}
                    aria-label={`Удалить запись ${entryLabel}`}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
