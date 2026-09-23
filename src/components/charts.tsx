"use client";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Info } from "lucide-react";
import { Card, Empty } from "./ui";
import {
  activityPatterns,
  eventDistribution,
  groupEventsByDay,
  languageDistribution,
  palette,
  pulseScore,
} from "@/lib/github/analytics";
import type { GitEvent, Repository } from "@/lib/github/types";
import { number } from "@/lib/utils";
import { useWorkspace } from "@/stores/workspace";
const tooltipStyle = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 12,
};
export function ActivityChart({ events }: { events: GitEvent[] }) {
  const [now] = useState(Date.now);
  const [days, setDays] = useState(30);
  const allDays = events.length
    ? Math.min(
        90,
        Math.max(
          7,
          Math.ceil(
            (now -
              Math.min(...events.map((e) => Date.parse(e.created_at)))) /
              864e5,
          ) + 1,
        ),
      )
    : 90;
  const data = groupEventsByDay(events, days === 0 ? allDays : days);
  const reduced = useWorkspace((s) => s.preferences.reducedMotion);
  return (
    <Card
      title="Activity overview"
      subtitle="A little context behind the commits. Public events, in UTC."
      actions={
        <div className="segmented">
          {[7, 30, 90, 0].map((n) => (
            <button
              key={n}
              className={days === n ? "selected" : ""}
              onClick={() => setDays(n)}
            >
              {n ? `${n}D` : "All"}
            </button>
          ))}
        </div>
      }
      className="activity-card"
    >
      <div className="chart-summary">
        <strong className="mono">
          {number(data.reduce((a, b) => a + b.count, 0))}
        </strong>
        <span>events in this window</span>
        <span className="chart-key">
          <i /> Public activity
        </span>
      </div>
      {events.length ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: -25, right: 5, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#40d9cc" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#40d9cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v + "T00:00:00Z").toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })
                }
                minTickGap={40}
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="chart-tooltip">
                      <strong>{label}</strong>
                      <p>{String(payload[0].value)} public events</p>
                      {Object.entries(
                        (
                          payload[0].payload as {
                            types: Record<string, number>;
                          }
                        ).types,
                      ).map(([name, count]) => (
                        <small key={name}>
                          {name.replace("Event", "")}: {count}
                          <br />
                        </small>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#40d9cc"
                strokeWidth={2.2}
                fill="url(#activityFill)"
                isAnimationActive={!reduced}
                activeDot={{ r: 4, stroke: "#0d141b", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty
          title="A quiet signal"
          description="No public events were returned by GitHub. Private work is not reflected here."
        />
      )}
      <div className="chart-footnote">
        <Info size={12} /> Up to 300 events from the last 90 days. This is not a
        complete commit history.
      </div>
    </Card>
  );
}
export function Pulse({
  events,
  repos,
}: {
  events: GitEvent[];
  repos: Repository[];
}) {
  const pulse = pulseScore(events, repos);
  return (
    <Card
      title="Developer pulse"
      actions={<Activity size={17} className="accent" />}
      className="pulse-card"
    >
      <div className="pulse-ring">
        <svg
          viewBox="0 0 160 160"
          aria-label={`Activity score ${pulse.score} out of 100`}
          role="img"
        >
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            stroke="var(--surface-raised)"
            strokeWidth="9"
          />
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="9"
            strokeDasharray={`${pulse.score * 4.021} 402.1`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div>
          <strong className="mono">{pulse.score}</strong>
          <span>OUT OF 100</span>
        </div>
      </div>
      <span className="pulse-label">
        <span className="status-dot" />
        {pulse.label}
      </span>
      <div className="pulse-factors">
        {pulse.factors.map((f) => (
          <div key={f.name}>
            <span>{f.name}</span>
            <span className="mono">
              {f.value}
              <span className="muted"> / {f.max}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="fine-print">
        30-day visible activity indicator.
        <br />A measure of activity, never of skill.
      </p>
    </Card>
  );
}
export function LanguageChart({ repos }: { repos: Repository[] }) {
  const data = languageDistribution(repos);
  return (
    <Card
      title="Language landscape"
      subtitle="Primary languages across retrieved repositories."
    >
      {data.length ? (
        <>
          <div className="language-layout">
            <div className="donut-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={73}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-label">
                <strong className="mono">{data.length}</strong>
                <span>languages</span>
              </div>
            </div>
            <div className="language-legend">
              {data.slice(0, 5).map((d) => (
                <div key={d.name}>
                  <i style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <strong className="mono">{d.percent.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </div>
          <p className="fine-print">
            Repository frequency, not lines of code.{" "}
            {data.reduce((a, d) => a + d.value, 0)} repositories with a detected
            language.
          </p>
        </>
      ) : (
        <Empty
          title="Languages yet to discover"
          description="No primary languages were returned for these repositories."
        />
      )}
    </Card>
  );
}
export function PatternCharts({ events }: { events: GitEvent[] }) {
  const { weekday, hours, longest } = activityPatterns(events);
  const distribution = eventDistribution(events);
  return (
    <>
      <div className="analytics-pair">
        {[
          {
            title: "The shape of the week",
            subtitle: "Events by weekday · UTC",
            data: weekday,
          },
          {
            title: "When ideas become commits",
            subtitle: "Events by hour · UTC",
            data: hours,
          },
        ].map((chart) => (
          <Card key={chart.title} title={chart.title} subtitle={chart.subtitle}>
            <div className="chart-container compact">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart.data}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted)", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--surface-raised)" }}
                  />
                  <Bar
                    dataKey="value"
                    name="Events"
                    fill="#7396ff"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>
      <Card
        title="What’s in the signal"
        subtitle={`${longest} days · longest consecutive activity run in the retrieved sample`}
      >
        <div className="distribution-grid">
          {distribution.length ? (
            distribution.map((d, i) => (
              <div key={d.name}>
                <div>
                  <span>{d.name}</span>
                  <strong className="mono">{d.value}</strong>
                </div>
                <div className="bar-track">
                  <span
                    style={{
                      width: `${(d.value / events.length) * 100}%`,
                      background: palette[i % palette.length],
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No events available to analyze.</p>
          )}
        </div>
      </Card>
    </>
  );
}
export function Heatmap({
  days,
  title = "Public activity calendar",
  subtitle = "Daily public events · last 90 days · UTC",
}: {
  days: { date: string; count: number; types?: Record<string, number> }[];
  title?: string;
  subtitle?: string;
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="heatmap-scroll">
        <div
          className="heatmap"
          role="img"
          aria-label={`${days.reduce((a, d) => a + d.count, 0)} events across ${days.length} days`}
        >
          {days.map((d) => (
            <span
              key={d.date}
              tabIndex={0}
              className="heat-cell"
              data-level={
                d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4))
              }
              aria-label={`${d.date}: ${d.count} events`}
              title={`${d.date}: ${d.count}${
                d.types
                  ? " events · " +
                    Object.entries(d.types)
                      .map(([k, v]) => `${k.replace("Event", "")} ${v}`)
                      .join(",")
                  : " contributions"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="heatmap-key">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <i className="heat-cell" data-level={n} key={n} />
        ))}
        <span>More</span>
        <span className="heatmap-total mono">
          {number(days.reduce((a, d) => a + d.count, 0))} total
        </span>
      </div>
    </Card>
  );
}
