"use client";

import { useEffect, useMemo, useState } from "react";

import type { Activity, Category } from "../../shared/types";
import { CATEGORIES } from "../../shared/constants";
import {
  createActivityRecord,
  deleteActivityRecord,
  fetchActivities,
  updateActivityRecord,
} from "../../shared/lib/supabase";
import {
  filterActivitiesByPeriod,
  getPeriodLabel,
  type PeriodKey,
} from "../../shared/utils";

import { DailyStats } from "../daily-stats";
import { EntryForm } from "../entry-form";
import { EntriesList } from "../entries-list";

import s from "./style.module.css";

const PERIODS: PeriodKey[] = ["today", "week", "month", "year"];
const ALL_CATEGORY = "all" as const;

function getPeriodWindow(
  period: PeriodKey,
  now: Date = new Date(),
  offset = 0,
) {
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "today": {
      start.setDate(start.getDate() + offset);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + offset);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "week": {
      const day = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - day + offset * 7);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "month": {
      start.setMonth(start.getMonth() + offset, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "year": {
      start.setFullYear(start.getFullYear() + offset, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(start.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { start, end };
}

function filterByRange(
  activities: Activity[],
  start: Date,
  end: Date,
  categoryFilter?: Category | typeof ALL_CATEGORY,
) {
  return activities.filter((activity) => {
    const dateValue = activity.date ?? activity.createdAt;
    const activityDate = new Date(dateValue);

    if (Number.isNaN(activityDate.getTime())) {
      return false;
    }

    if (categoryFilter && categoryFilter !== ALL_CATEGORY) {
      if (activity.category !== categoryFilter) {
        return false;
      }
    }

    return activityDate >= start && activityDate <= end;
  });
}

export const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [selectedCategory, setSelectedCategory] = useState<
    Category | typeof ALL_CATEGORY
  >(ALL_CATEGORY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchActivities();
        setActivities(data);
      } catch (loadError) {
        console.error(loadError);
        setError("Не удалось загрузить записи. Проверьте переменные Supabase.");
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, []);

  const currentPeriodActivities = useMemo(
    () => filterActivitiesByPeriod(activities, period),
    [activities, period],
  );

  const filteredActivities = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return currentPeriodActivities;
    }

    return currentPeriodActivities.filter(
      (entry) => entry.category === selectedCategory,
    );
  }, [currentPeriodActivities, selectedCategory]);

  const totalMinutes = filteredActivities.reduce(
    (total, entry) => total + entry.minutes,
    0,
  );
  const entriesCount = filteredActivities.length;
  const currentPeriodLabel = getPeriodLabel(period);

  const categoryBreakdown = useMemo(() => {
    const totals = filteredActivities.reduce<Record<string, number>>(
      (acc, entry) => {
        acc[entry.category] = (acc[entry.category] ?? 0) + entry.minutes;
        return acc;
      },
      {},
    );

    return CATEGORIES.map((category) => ({
      ...category,
      minutes: totals[category.id] ?? 0,
      share: totalMinutes ? (totals[category.id] ?? 0) / totalMinutes : 0,
    }))
      .filter((category) => category.minutes > 0)
      .sort((left, right) => right.minutes - left.minutes);
  }, [filteredActivities, totalMinutes]);

  const categoryOrder = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        minutes: currentPeriodActivities.reduce(
          (sum, entry) =>
            entry.category === category.id ? sum + entry.minutes : sum,
          0,
        ),
      }))
        .sort((left, right) => right.minutes - left.minutes)
        .map((category) => category.id),
    [currentPeriodActivities],
  );

  const previousPeriodWindow = useMemo(
    () => getPeriodWindow(period, new Date(), -1),
    [period],
  );

  const previousPeriodMinutes = useMemo(
    () =>
      filterByRange(
        activities,
        previousPeriodWindow.start,
        previousPeriodWindow.end,
        selectedCategory === ALL_CATEGORY ? undefined : selectedCategory,
      ).reduce((sum, entry) => sum + entry.minutes, 0),
    [activities, previousPeriodWindow, selectedCategory],
  );

  const comparisonDelta = totalMinutes - previousPeriodMinutes;
  const comparisonPercent =
    previousPeriodMinutes > 0
      ? (comparisonDelta / previousPeriodMinutes) * 100
      : comparisonDelta > 0
        ? 100
        : 0;

  async function handleSubmit(
    activity: string,
    minutes: number,
    category: Category,
    date: string,
    startTime?: string | null,
    endTime?: string | null,
  ) {
    try {
      const created = await createActivityRecord(
        activity,
        minutes,
        category,
        date,
        startTime ?? null,
        endTime ?? null,
      );
      setActivities((current) => [created, ...current]);
      setError(null);
    } catch (submitError) {
      console.error(submitError);
      setError("Не удалось сохранить запись в Supabase.");
    }
  }

  async function handleEdit(
    id: number,
    activity: string,
    minutes: number,
    category: Category,
    date: string,
    startTime?: string | null,
    endTime?: string | null,
  ) {
    try {
      const updated = await updateActivityRecord(
        id,
        activity,
        minutes,
        category,
        date,
        startTime ?? null,
        endTime ?? null,
      );
      setActivities((current) =>
        current.map((entry) => (entry.id === id ? updated : entry)),
      );
      setError(null);
    } catch (editError) {
      console.error(editError);
      setError("Не удалось обновить запись.");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteActivityRecord(id);
      setActivities((current) => current.filter((entry) => entry.id !== id));
      setError(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError("Не удалось удалить запись.");
    }
  }

  return (
    <div className={s.dashboard}>
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Сводка</p>
          <h1>{currentPeriodLabel}</h1>
        </div>

        <div className={s.periodSelector} aria-label="Выбор периода">
          {PERIODS.map((value) => (
            <button
              key={value}
              type="button"
              className={`${s.periodButton} ${period === value ? s.active : ""}`}
              onClick={() => setPeriod(value)}
              aria-pressed={period === value}
            >
              {getPeriodLabel(value)}
            </button>
          ))}
        </div>
      </header>

      {error ? <p className={s.error}>{error}</p> : null}

      <DailyStats
        totalMinutes={totalMinutes}
        entriesCount={entriesCount}
        categoryBreakdown={categoryBreakdown}
        periodLabel={currentPeriodLabel}
        comparisonDelta={comparisonDelta}
        comparisonPercent={comparisonPercent}
      />

      <section className={s.contentGrid}>
        <EntryForm categoryOrder={categoryOrder} onSubmit={handleSubmit} />

        <div className={s.filterRow} aria-label="Фильтр по категориям">
          <button
            type="button"
            className={`${s.filterButton} ${selectedCategory === ALL_CATEGORY ? s.filterButtonActive : ""}`}
            onClick={() => setSelectedCategory(ALL_CATEGORY)}
          >
            Все
          </button>

          {categoryOrder.map((categoryId) => {
            const category = CATEGORIES.find((item) => item.id === categoryId);
            if (!category) {
              return null;
            }

            return (
              <button
                key={category.id}
                type="button"
                className={`${s.filterButton} ${selectedCategory === category.id ? s.filterButtonActive : ""}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className={s.loading}>Загрузка записей...</p>
        ) : (
          <EntriesList
            entries={filteredActivities}
            onDelete={handleDelete}
            onEdit={handleEdit}
            periodLabel={currentPeriodLabel}
          />
        )}
      </section>
    </div>
  );
};
