import { formatDuration } from "../../shared/utils";
import s from "./style.module.css";

interface CategoryBreakdownItem {
  id: string;
  label: string;
  minutes: number;
  share: number;
}

interface Props {
  totalMinutes: number;
  entriesCount: number;
  categoryBreakdown: CategoryBreakdownItem[];
  periodLabel: string;
  comparisonDelta: number;
  comparisonPercent: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  sleep: "#7ea07a",
  work: "#5f7d63",
  rest: "#9db39a",
  health: "#c5d2bf",
  household: "#d7c7b3",
};

export const DailyStats = ({
  totalMinutes,
  entriesCount,
  categoryBreakdown,
  periodLabel,
  comparisonDelta,
  comparisonPercent,
}: Props) => {
  const topCategory = categoryBreakdown[0];
  const donutGradient =
    categoryBreakdown.length > 0
      ? categoryBreakdown
          .map((category, index) => {
            const start = categoryBreakdown
              .slice(0, index)
              .reduce((sum, item) => sum + item.share, 0);
            const end = start + category.share;
            const color = CATEGORY_COLORS[category.id] ?? "#c7cfca";

            return `${color} ${start * 100}% ${end * 100}%`;
          })
          .join(", ")
      : "#edf0f3 0% 100%";

  return (
    <section className={s.stats}>
      <div className={`${s.card} ${s.main}`}>
        <span className={s.label}>Всего</span>
        <strong className={s.value}>{formatDuration(totalMinutes)}</strong>
        <span className={s.hint}>{periodLabel}</span>
      </div>

      <div className={s.card}>
        <span className={s.label}>Записи</span>
        <strong className={s.value}>{entriesCount}</strong>
        <span className={s.hint}>за период</span>
      </div>

      <div className={s.card}>
        <span className={s.label}>Категории</span>
        <strong className={s.value}>{categoryBreakdown.length}</strong>
        <span className={s.hint}>активных</span>
      </div>

      <div className={s.card}>
        <span className={s.label}>Сравнение</span>
        <strong
          className={`${s.value} ${comparisonDelta >= 0 ? s.positive : s.negative}`}
        >
          {comparisonDelta >= 0 ? "+" : "-"}
          {Math.abs(Math.round(comparisonPercent))}%
        </strong>
        <span className={s.hint}>
          {comparisonDelta === 0
            ? "как обычно"
            : comparisonDelta > 0
              ? "выше прошлого периода"
              : "ниже прошлого периода"}
        </span>
      </div>

      <div className={s.donutBlock}>
        <div className={s.donutWrap}>
          <div
            className={s.donut}
            style={{ background: `conic-gradient(${donutGradient})` }}
          >
            <div className={s.donutInner}>
              <strong>
                {topCategory
                  ? `${Math.round((topCategory.share || 0) * 100)}%`
                  : "0%"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className={s.breakdown}>
        {categoryBreakdown.length === 0 ? (
          <div className={s.emptyBreakdown}>Пока нет данных</div>
        ) : (
          categoryBreakdown.map((category) => {
            const color = CATEGORY_COLORS[category.id] ?? "#c7cfca";

            return (
              <div key={category.id} className={s.breakdownRow}>
                <div className={s.breakdownMeta}>
                  <span className={s.metaLabel}>
                    <span
                      className={s.categorySwatch}
                      style={{ background: color }}
                    />
                    {category.label}
                  </span>
                  <strong>{formatDuration(category.minutes)}</strong>
                </div>

                <div className={s.barTrack}>
                  <div
                    className={s.barFill}
                    style={{
                      width: `${Math.max(category.share * 100, 8)}%`,
                      background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
