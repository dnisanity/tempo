import { Category, Activity } from "../../../shared/types";

export function createActivity(
  activities: Activity[],
  activity: string,
  minutes: number,
  category: Category,
): Activity[] {
  const newActivity: Activity = {
    id: Date.now(),
    activity,
    minutes,
    category,
  };

  return [newActivity, ...activities];
}
