"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CATEGORIES } from "../../shared/constants";
import type { Category } from "../../shared/types";

import s from "./style.module.css";

const formatDateInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 10);
};

const formatTimeInputValue = (date: Date) =>
  date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const getMinutesFromRange = (
  startTime?: string | null,
  endTime?: string | null,
) => {
  if (!startTime || !endTime) {
    return null;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return null;
  }

  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0, 0);

  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60000),
  );
};

interface Props {
  categoryOrder?: Category[];
  onSubmit: (
    activity: string,
    minutes: number,
    category: Category,
    date: string,
    startTime?: string | null,
    endTime?: string | null,
  ) => void;
}

const formatTimerLength = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const EntryForm = ({ categoryOrder, onSubmit }: Props) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    CATEGORIES[0].id,
  );
  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">(
    "idle",
  );
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [timerDisplayMs, setTimerDisplayMs] = useState(0);

  const orderedCategories =
    categoryOrder && categoryOrder.length > 0
      ? categoryOrder
          .map((categoryId) =>
            CATEGORIES.find((category) => category.id === categoryId),
          )
          .filter((category): category is (typeof CATEGORIES)[number] =>
            Boolean(category),
          )
      : CATEGORIES;

  useEffect(() => {
    if (
      !orderedCategories.some((category) => category.id === selectedCategory)
    ) {
      setSelectedCategory(orderedCategories[0]?.id ?? CATEGORIES[0].id);
    }
  }, [orderedCategories, selectedCategory]);

  function resetFormState() {
    setSelectedCategory(orderedCategories[0]?.id ?? CATEGORIES[0].id);
    setTimerStatus("idle");
    setTimerStartedAt(null);
    setTimerElapsedMs(0);
    setTimerDisplayMs(0);

    if (!formRef.current) {
      return;
    }

    const dateInput = formRef.current.elements.namedItem(
      "date",
    ) as HTMLInputElement | null;
    if (dateInput) {
      dateInput.value = formatDateInputValue(new Date());
    }

    const startInput = formRef.current.elements.namedItem(
      "startTime",
    ) as HTMLInputElement | null;
    const endInput = formRef.current.elements.namedItem(
      "endTime",
    ) as HTMLInputElement | null;
    const minutesInput = formRef.current.elements.namedItem(
      "minutes",
    ) as HTMLInputElement | null;

    if (startInput) startInput.value = "";
    if (endInput) endInput.value = "";
    if (minutesInput) minutesInput.value = "";
  }

  function resetTimeRange() {
    if (!formRef.current) {
      return;
    }

    const startInput = formRef.current.elements.namedItem(
      "startTime",
    ) as HTMLInputElement | null;
    const endInput = formRef.current.elements.namedItem(
      "endTime",
    ) as HTMLInputElement | null;
    const minutesInput = formRef.current.elements.namedItem(
      "minutes",
    ) as HTMLInputElement | null;

    setTimerStatus("idle");
    setTimerStartedAt(null);
    setTimerElapsedMs(0);
    setTimerDisplayMs(0);

    if (startInput) startInput.value = "";
    if (endInput) endInput.value = "";
    if (minutesInput) minutesInput.value = "";
  }

  useEffect(() => {
    if (timerStatus !== "running" || !timerStartedAt) {
      return undefined;
    }

    const updateTimer = () => {
      const form = formRef.current;
      if (!form) {
        return;
      }

      const minutesInput = form.elements.namedItem(
        "minutes",
      ) as HTMLInputElement | null;
      const nextElapsed = timerElapsedMs + (Date.now() - timerStartedAt);
      const nextMinutes = Math.max(1, Math.ceil(nextElapsed / 60000));
      setTimerDisplayMs(nextElapsed);

      if (minutesInput) {
        minutesInput.value = String(nextMinutes);
      }
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerElapsedMs, timerStartedAt, timerStatus]);

  useEffect(() => {
    if (timerStatus === "idle") {
      setTimerDisplayMs(0);
    }
  }, [timerStatus]);

  function handleTimerToggle() {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const startInput = form.elements.namedItem(
      "startTime",
    ) as HTMLInputElement | null;
    const endInput = form.elements.namedItem(
      "endTime",
    ) as HTMLInputElement | null;
    const minutesInput = form.elements.namedItem(
      "minutes",
    ) as HTMLInputElement | null;

    if (timerStatus === "idle") {
      const now = new Date();
      const currentTime = formatTimeInputValue(now);
      setTimerStatus("running");
      setTimerStartedAt(now.getTime());
      setTimerElapsedMs(0);
      setTimerDisplayMs(0);

      if (startInput) startInput.value = currentTime;
      if (endInput) endInput.value = "";
      if (minutesInput) minutesInput.value = "";
      return;
    }

    if (timerStatus === "running") {
      const now = Date.now();
      const totalElapsed = timerElapsedMs + (now - (timerStartedAt ?? now));
      const finishedAt = new Date(now);
      const endValue = formatTimeInputValue(finishedAt);

      setTimerStatus("paused");
      setTimerElapsedMs(totalElapsed);
      setTimerDisplayMs(totalElapsed);
      setTimerStartedAt(null);

      if (startInput) {
        startInput.value =
          startInput.value ||
          formatTimeInputValue(new Date(now - totalElapsed));
      }
      if (endInput) endInput.value = endValue;
      if (minutesInput)
        minutesInput.value = String(
          Math.max(1, Math.ceil(totalElapsed / 60000)),
        );
      return;
    }

    const now = Date.now();
    setTimerStatus("running");
    setTimerStartedAt(now);
    setTimerDisplayMs(timerElapsedMs);

    if (endInput) endInput.value = "";
    if (minutesInput)
      minutesInput.value = String(
        Math.max(1, Math.round(timerElapsedMs / 60000)),
      );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const rawActivity = String(formData.get("activity") ?? "").trim();
    const rawMinutes = Number(formData.get("minutes"));
    const category = String(
      formData.get("category") ?? selectedCategory,
    ) as Category;
    const date = String(
      formData.get("date") ?? formatDateInputValue(new Date()),
    );
    const startTime = String(formData.get("startTime") ?? "").trim() || null;
    const endTime = String(formData.get("endTime") ?? "").trim() || null;

    const rangeMinutes = getMinutesFromRange(startTime, endTime);
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
      CATEGORIES.find((item) => item.id === category)?.label ||
      "Активность";

    onSubmit(activity, minutes, category, date, startTime, endTime);
    event.currentTarget.reset();
    resetFormState();
  }

  return (
    <div className={s.panel}>
      <form ref={formRef} onSubmit={handleSubmit} className={s.form}>
        <div className={s.primaryRow}>
          <input
            className={s.field}
            name="activity"
            type="text"
            placeholder="Что делал?"
            autoComplete="off"
          />

          <input
            className={s.field}
            name="minutes"
            type="number"
            min="1"
            step="1"
            placeholder="мин"
            aria-label="Количество минут"
          />

          <button
            type="submit"
            className={s.submitButton}
            aria-label="Добавить запись"
          >
            +
          </button>
        </div>

        <div className={s.secondaryRow}>
          <input
            className={s.field}
            name="date"
            type="date"
            defaultValue={formatDateInputValue(new Date())}
            aria-label="Дата записи"
            required
          />

          <div className={s.timeRow}>
            <div className={s.timeRangeWrap}>
              <input
                className={s.field}
                name="startTime"
                type="time"
                aria-label="Время начала"
              />

              <span className={s.timeSeparator}>—</span>

              <input
                className={s.field}
                name="endTime"
                type="time"
                aria-label="Время завершения"
              />

              <button
                type="button"
                className={s.resetTimeButton}
                onClick={resetTimeRange}
                aria-label="Сбросить время"
              >
                ×
              </button>
            </div>

            {timerStatus !== "idle" ? (
              <div className={s.timerWrap}>
                <button
                  type="button"
                  className={s.timerButton}
                  onClick={handleTimerToggle}
                >
                  {timerStatus === "running" ? "Пауза" : "Прод."}
                </button>
                <span className={s.timerStatus}>
                  {formatTimerLength(timerDisplayMs)}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className={s.timerButton}
                onClick={handleTimerToggle}
              >
                Старт
              </button>
            )}
          </div>
        </div>

        <input type="hidden" name="category" value={selectedCategory} />

        <div className={s.categoryRow}>
          {orderedCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${s.categoryButton} ${selectedCategory === category.id ? s.categoryButtonActive : ""}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
