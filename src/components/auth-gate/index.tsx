"use client";

import { FormEvent, useEffect, useState } from "react";

import { Dashboard } from "../../widgets";
import {
  getCurrentSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  supabase,
} from "../../shared/lib/supabase";

import s from "./style.module.css";

export function AuthGate() {
  const [session, setSession] =
    useState<
      ReturnType<typeof getCurrentSession> extends Promise<infer T> ? T : never
    >(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Введите email и пароль.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
        setMessage("Проверьте почту и подтвердите регистрацию.");
      }
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Не удалось выполнить вход.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setSession(null);
    } catch (error) {
      console.error(error);
    }
  }

  if (!supabase) {
    return (
      <div className={s.authCard}>
        <h1>Авторизация</h1>
        <p className={s.error}>
          Добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в
          .env.local.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={s.authCard}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className={s.authWrap} id="auth-root">
      <div className={s.authCard}>
        <p className={s.eyebrow}>tempo</p>
        <h1>{mode === "signin" ? "Вход" : "Регистрация"}</h1>

        <form onSubmit={handleSubmit} className={s.form}>
          <label className={s.fieldWrap}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={s.fieldWrap}>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              minLength={6}
              required
            />
          </label>

          {message ? <p className={s.message}>{message}</p> : null}

          <button
            type="submit"
            className={s.primaryButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "signin"
                ? "Входим..."
                : "Создаём..."
              : mode === "signin"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        <button
          type="button"
          className={s.switchButton}
          onClick={() => {
            setMode((current) => (current === "signin" ? "signup" : "signin"));
            setMessage("");
          }}
        >
          {mode === "signin"
            ? "Ещё нет аккаунта? Создать"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
