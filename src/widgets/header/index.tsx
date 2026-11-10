"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCurrentSession,
  signOut,
  supabase,
} from "../../shared/lib/supabase";
import { formatDate } from "../../shared/utils";

import s from "./style.module.css";

export const Header = () => {
  const [session, setSession] = useState<Awaited<
    ReturnType<typeof getCurrentSession>
  > | null>(null);

  useEffect(() => {
    async function loadSession() {
      const currentSession = await getCurrentSession();
      setSession(currentSession);
    }

    loadSession();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      setSession(null);
    } catch (error) {
      console.error(error);
    }
  }

  function handleLoginFocus() {
    const target = document.getElementById("auth-root");
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <header className={s.header}>
      <Link className={s.logo} href="/">
        <span className={s.logoMark}>t</span>
        tempo
      </Link>

      <div className={s.utility}>
        <div className={s.date}>{formatDate()}</div>

        {session ? (
          <div className={s.userBlock}>
            <span className={s.userEmail}>{session.user.email}</span>
            <button
              type="button"
              className={s.signOutButton}
              onClick={handleSignOut}
            >
              Выйти
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={s.loginButton}
            onClick={handleLoginFocus}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
};
