import type { CATEGORIES } from "../constants/categories";

export type Category = (typeof CATEGORIES)[number]["id"];

export interface Activity {
  id: number;
  activity: string;
  minutes: number;
  category: Category;
}
