"use client";

import { useState } from "react";

import type { Activity, Category } from "../../shared/types";

import { Welcome } from "../welcome";
import { DailyStats } from "../daily-stats";
import { EntryForm } from "../entry-form";
import { EntriesList } from "../entries-list";

import { createActivity, deleteActivity } from "../../features";
import s from "./style.module.css";

export const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const totalMinutes = activities.reduce(
    (total, entry) => total + entry.minutes,
    0,
  );

  function handleSubmit(activity: string, minutes: number, category: Category) {
    const updatedActivities = createActivity(
      activities,
      activity,
      minutes,
      category,
    );

    setActivities(updatedActivities);
  }

  function handleDelete(id: number) {
    const updatedActivities = deleteActivity(activities, id);
    setActivities(updatedActivities);
  }

  return (
    <>
      <Welcome />
      <DailyStats
        totalMinutes={totalMinutes}
        entriesCount={activities.length}
      />

      <section className={s.contentGrid}>
        <EntryForm onSubmit={handleSubmit} />

        <EntriesList entries={activities} onDelete={handleDelete} />
      </section>
    </>
  );
};
