import { createClient } from "@supabase/supabase-js";

import type { Activity, Category } from "../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

function normalizeOptionalTime(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, 5) : null;
}

function mapActivity(row: Record<string, unknown>): Activity {
  const fallbackDate = new Date().toISOString();

  return {
    id: Number(row.id ?? 0),
    activity: String(row.activity ?? ""),
    minutes: Number(row.minutes ?? 0),
    startTime: normalizeOptionalTime(row.start_time ?? row.startTime),
    endTime: normalizeOptionalTime(row.end_time ?? row.endTime),
    category: String(row.category ?? "other") as Category,
    date: String(row.date ?? row.created_at ?? row.createdAt ?? fallbackDate),
    createdAt: String(row.created_at ?? row.createdAt ?? fallbackDate),
  };
}

export async function fetchActivities(): Promise<Activity[]> {
  if (!supabase) {
    return [];
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const query = supabase
    .from("activity")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error } = await query.eq("user_id", user.id);

  if (error && (error as { code?: string }).code === "42703") {
    const fallback = await supabase
      .from("activity")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    return (fallback.data ?? []).map((row) => mapActivity(row));
  }

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapActivity(row));
}

export async function createActivityRecord(
  activity: string,
  minutes: number,
  category: Category,
  date: string,
  startTime?: string | null,
  endTime?: string | null,
): Promise<Activity> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const activityDate = new Date(`${date}T12:00:00`).toISOString();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Пользователь не авторизован.");
  }

  const payload: Record<string, unknown> = {
    activity,
    minutes,
    category,
    date: activityDate,
    start_time: startTime ?? null,
    end_time: endTime ?? null,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("activity")
    .insert([payload])
    .select()
    .single();

  if (error && (error as { code?: string }).code === "42703") {
    const fallbackPayload: Record<string, unknown> = {
      activity,
      minutes,
      category,
      date: activityDate,
    };

    const fallback = await supabase
      .from("activity")
      .insert([fallbackPayload])
      .select()
      .single();

    if (fallback.error) {
      throw fallback.error;
    }

    return mapActivity(fallback.data);
  }

  if (error) {
    throw error;
  }

  return mapActivity(data);
}

export async function updateActivityRecord(
  id: number,
  activity: string,
  minutes: number,
  category: Category,
  date: string,
  startTime?: string | null,
  endTime?: string | null,
): Promise<Activity> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const activityDate = new Date(`${date}T12:00:00`).toISOString();

  const { data, error } = await supabase
    .from("activity")
    .update({
      activity,
      minutes,
      category,
      date: activityDate,
      start_time: startTime ?? null,
      end_time: endTime ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapActivity(data);
}

export async function deleteActivityRecord(id: number): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("activity").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
