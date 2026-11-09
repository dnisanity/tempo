import s from "./style.module.css";

export const Welcome = () => {
  return (
    <section className={s.welcome}>
      <p className={s.eyebrow}>ТВОЙ ДЕНЬ</p>
      <h1>Время под контролем.</h1>
      <p className={s.description}>
        Записывай, на что уходит время, и постепенно находи свой баланс.
      </p>
    </section>
  );
};
