import type { Activity } from "../types";

export type PeriodKey = "today" | "week" | "month" | "year";

export function getPeriodLabel(period: PeriodKey): string {
  const labels: Record<PeriodKey, string> = {
    today: "Сегодня",
    week: "Неделя",
    month: "Месяц",
    year: "Год",
  };

  return labels[period];
}

export function filterActivitiesByPeriod(
  activities: Activity[],
  period: PeriodKey,
  now: Date = new Date(),
): Activity[] {
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "today": {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "week": {
      const day = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "month": {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "year": {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(start.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    }
  }

  return activities.filter((activity) => {
    const rawDate = activity.date ?? activity.createdAt;
    const activityDate = rawDate ? new Date(rawDate) : null;

    if (!activityDate || Number.isNaN(activityDate.getTime())) {
      return false;
    }

    return activityDate >= start && activityDate <= end;
  });
}
