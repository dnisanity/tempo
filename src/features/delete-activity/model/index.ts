import { Activity } from "../../../shared/types";

export function deleteActivity(activities: Activity[], id: number): Activity[] {
  return activities.filter((activity) => activity.id !== id);
}
