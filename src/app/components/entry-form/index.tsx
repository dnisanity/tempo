import type { FormEvent } from "react";
import { CATEGORIES } from "../../constants";
import type { Category } from "../../types";

import s from "./style.module.css";

interface Props {
  onSubmit: (activity: string, minutes: number, category: Category) => void;
}

export const EntryForm = ({ onSubmit }: Props) => {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const activity = String(formData.get("activity") ?? "").trim();
    const minutes = Number(formData.get("minutes"));
    const category = String(formData.get("category")) as Category;

    if (!activity || !Number.isInteger(minutes) || minutes <= 0) return;

    onSubmit(activity, minutes, category);
    event.currentTarget.reset();
  }

  return (
    <div className={s.panel}>
      <div className={s.heading}>
        <div>
          <p className={s.eyebrow}>НОВАЯ ЗАПИСЬ</p>
          <h2>Добавить время</h2>
        </div>
        <span className={s.plusIcon}>+</span>
      </div>

      <form onSubmit={handleSubmit} className={s.form}>
        <label>
          Чем занимался?
          <input
            name="activity"
            type="text"
            placeholder="Например, работа над проектом"
            required
          />
        </label>

        <div className={s.row}>
          <label>
            Время, минут
            <input
              name="minutes"
              type="number"
              min="1"
              step="1"
              placeholder="60"
              required
            />
          </label>

          <label>
            Категория
            <select name="category" defaultValue={CATEGORIES[0].id}>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" className={s.submitButton}>
          Добавить запись <span>→</span>
        </button>
      </form>
    </div>
  );
};
