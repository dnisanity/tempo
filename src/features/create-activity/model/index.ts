import { Category, Activity } from "../../../shared/types";

export function createActivity(
  activities: Activity[],
  activity: string,
  minutes: number,
  category: Category,
  date: string = new Date().toISOString(),
): Activity[] {
  const normalizedDate = new Date(`${date}T12:00:00`);

  const newActivity: Activity = {
    id: Date.now(),
    activity,
    minutes,
    category,
    date: normalizedDate.toISOString(),
    createdAt: normalizedDate.toISOString(),
  };

  return [newActivity, ...activities];
}
