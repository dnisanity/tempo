"use client";

import { useState } from "react";

import type { Entry, Category } from "../../types";

import { Header } from "../header";
import { Welcome } from "../welcome";
import { DailyStats } from "../daily-stats";
import { EntryForm } from "../entry-form";
import { EntriesList } from "../entries-list";

import s from "./style.module.css";

export const Dashboard = () => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const totalMinutes = entries.reduce(
    (total, entry) => total + entry.minutes,
    0,
  );

  function addEntry(activity: string, minutes: number, category: Category) {
    const newEntry: Entry = {
      id: Date.now(),
      activity,
      minutes,
      category,
    };

    setEntries((current) => [newEntry, ...current]);
  }

  function deleteEntry(id: number) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <main className={s.container}>
      <Header />

      <Welcome />

      <DailyStats totalMinutes={totalMinutes} entriesCount={entries.length} />

      <section className={s.contentGrid}>
        <EntryForm onSubmit={addEntry} />

        <EntriesList entries={entries} onDelete={deleteEntry} />
      </section>

      <footer className={s.footer}>
        <span>tempo</span>
        <span>Твоё время — твой ресурс.</span>
      </footer>
    </main>
  );
};
