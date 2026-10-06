import { Tooltip, Anchor, Text } from "@mantine/core";
import { useI18n } from "../../i18n";
import { useFormat, timeline } from "../../journal/useJournal";
import { columnLabels, formatDate } from "../../journal/calc";
import RdBadge from "./RdBadge";

function HeadAbbr({ short, full, sub }) {
  return (
    <Tooltip label={full} withArrow>
      <span className="du-jt-head">
        <abbr title={full}>{short}</abbr>
        {sub && <span className="du-jt-sub">{sub}</span>}
      </span>
    </Tooltip>
  );
}

const below = (v, min) => v != null && min != null && v < min;

export default function JournalTable({ journal, columns, rows, rules, onOpenStudent }) {
  const { t } = useI18n();
  const fmt = useFormat();
  const labels = columnLabels(columns);
  const items = timeline(columns, journal);

  const rkCell = (r, key, first) => {
    const v = r.scores[key];
    return (
      <td
        key={`${key}-${first ? "total" : "tl"}`}
        className={`du-jt-num du-jt-rk${first ? " du-jt-sep" : ""}`}
        data-empty={v == null || undefined}
        data-bad={below(v, rules.minRk) || undefined}
      >
        {fmt(v)}
      </td>
    );
  };

  return (
    <div className="du-jt-wrap" tabIndex={0} role="region" aria-label={t("journal")}>
      <table className="du-jt">
        <thead>
          <tr>
            <th className="du-jt-name">{t("colStudent")}</th>
            <th className="du-jt-num du-jt-att">{t("attFull")}</th>
            {items.map((it) => {
              if (it.kind === "rk") {
                return (
                  <th key={it.id} className="du-jt-num du-jt-rk">
                    <HeadAbbr short={t(it.id)} full={t(`${it.id}Full`)} sub={formatDate(it.date)} />
                  </th>
                );
              }
              const l = labels[it.id];
              const head = (
                <span className="du-jt-head">
                  {t("gradeCol")}
                  {l.of > 1 && ` #${l.n}`}
                  <span className="du-jt-sub">{l.date}</span>
                </span>
              );
              return (
                <th key={it.id} className="du-jt-num">
                  {l.of > 1 ? (
                    <Tooltip label={t("gradeOf")(l.n, l.of, l.time)} withArrow>
                      {head}
                    </Tooltip>
                  ) : (
                    head
                  )}
                </th>
              );
            })}
            <th className="du-jt-num du-jt-rk du-jt-sep">
              <HeadAbbr short={t("rk1")} full={t("rk1Full")} />
            </th>
            <th className="du-jt-num du-jt-rk">
              <HeadAbbr short={t("rk2")} full={t("rk2Full")} />
            </th>
            {["rd", "ik", "io"].map((k) => (
              <th key={k} className="du-jt-num du-jt-total">
                <HeadAbbr short={t(k)} full={t(`${k}Full`)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.student.id}>
              <td className="du-jt-name">
                <Anchor component="button" type="button" fz="sm" fw={600} ta="left" lh="20px" onClick={() => onOpenStudent(r.student.id)}>
                  {r.student.name}
                </Anchor>
                <Text fz="xs" c="dimmed" lh="16px">
                  {r.student.group}
                </Text>
              </td>
              <td
                className="du-jt-num du-jt-att"
                data-empty={r.student.attendance == null || undefined}
                data-bad={below(r.student.attendance, rules.minAtt) || undefined}
              >
                {r.student.attendance == null ? "—" : `${fmt(r.student.attendance)}%`}
              </td>
              {items.map((it) => {
                if (it.kind === "rk") return rkCell(r, it.id, false);
                const v = r.dailyValues[it.index];
                return (
                  <td key={it.id} className="du-jt-num" data-empty={v == null || undefined}>
                    {fmt(v)}
                  </td>
                );
              })}
              {rkCell(r, "rk1", true)}
              {rkCell(r, "rk2", false)}
              <td className="du-jt-num du-jt-rd" data-status={r.admission.status}>
                <RdBadge row={r} rules={rules} variant="cell" />
              </td>
              <td className="du-jt-num du-jt-total" data-empty={r.ik == null || undefined}>
                {fmt(r.ik, rules.pIk)}
              </td>
              <td className="du-jt-num du-jt-total" data-empty={r.io == null || undefined}>
                {r.io == null ? (
                  <Tooltip label={r.rd == null ? t("ioNoRd") : t("ioNoIk")} withArrow>
                    <span tabIndex={0} aria-label={r.rd == null ? t("ioNoRd") : t("ioNoIk")}>
                      —
                    </span>
                  </Tooltip>
                ) : (
                  <strong>{fmt(r.io, rules.pIo)}</strong>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
