import type { CATEGORIES } from "../constants/categories";

export type Category = (typeof CATEGORIES)[number]["id"];

export interface Entry {
  id: number;
  activity: string;
  minutes: number;
  category: Category;
}
