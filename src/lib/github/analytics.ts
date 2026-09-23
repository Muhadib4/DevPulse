import type { GitEvent, Repository } from "./types";
export const totalStars = (repos: Repository[]) =>
  repos.reduce((sum, r) => sum + r.stargazers_count, 0);
export const totalForks = (repos: Repository[]) =>
  repos.reduce((sum, r) => sum + r.forks_count, 0);
export const palette = [
  "#40d9cc",
  "#7396ff",
  "#ba92f5",
  "#efba6e",
  "#ed80a8",
  "#6ed6a0",
  "#91a0b5",
];
export function languageDistribution(repos: Repository[]) {
  const counts: Record<string, number> = {};
  for (const r of repos)
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      percent: total ? (value / total) * 100 : 0,
      color: palette[i % palette.length],
    }));
}
export function groupEventsByDay(
  events: GitEvent[],
  days: number,
  now = new Date(),
) {
  const map = new Map<
    string,
    { date: string; count: number; types: Record<string, number> }
  >();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - days + 1);
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    map.set(key, { date: key, count: 0, types: {} });
  }
  for (const event of events) {
    const row = map.get(event.created_at.slice(0, 10));
    if (row) {
      row.count++;
      row.types[event.type] = (row.types[event.type] || 0) + 1;
    }
  }
  return [...map.values()];
}
export function eventDistribution(events: GitEvent[]) {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.type] = (counts[e.type] || 0) + 1;
  return Object.entries(counts)
    .map(([name, value]) => ({ name: name.replace("Event", ""), value }))
    .sort((a, b) => b.value - a.value);
}
export function pulseScore(
  events: GitEvent[],
  repos: Repository[],
  now = Date.now(),
) {
  const recent = events.filter(
    (e) =>
      now - Date.parse(e.created_at) >= 0 &&
      now - Date.parse(e.created_at) < 30 * 864e5,
  );
  const activeDays = new Set(recent.map((e) => e.created_at.slice(0, 10))).size;
  const updates = repos.filter(
    (r) =>
      now - Date.parse(r.pushed_at) >= 0 &&
      now - Date.parse(r.pushed_at) < 30 * 864e5,
  ).length;
  const factors = [
    { name: "Public events", value: Math.min(40, recent.length * 2), max: 40 },
    { name: "Active days", value: Math.min(30, activeDays * 3), max: 30 },
    { name: "Updated repositories", value: Math.min(20, updates * 2), max: 20 },
    {
      name: "Event variety",
      value: Math.min(10, new Set(recent.map((e) => e.type)).size * 2),
      max: 10,
    },
  ];
  const score = factors.reduce((a, f) => a + f.value, 0);
  return {
    score,
    factors,
    label:
      score >= 75
        ? "Highly Active"
        : score >= 50
          ? "Active"
          : score >= 25
            ? "Moderate Activity"
            : "Low Activity",
  };
}
export function activityPatterns(events: GitEvent[]) {
  const weekday = Array.from({ length: 7 }, (_, i) => ({
    name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    value: 0,
  }));
  const hours = Array.from({ length: 24 }, (_, i) => ({
    name: String(i).padStart(2, "0"),
    value: 0,
  }));
  for (const e of events) {
    const d = new Date(e.created_at);
    weekday[d.getUTCDay()].value++;
    hours[d.getUTCHours()].value++;
  }
  const dates = [
    ...new Set(events.map((e) => e.created_at.slice(0, 10))),
  ].sort();
  let longest = 0,
    current = 0,
    last = 0;
  for (const date of dates) {
    const t = Date.parse(date);
    current = t - last === 864e5 ? current + 1 : 1;
    longest = Math.max(longest, current);
    last = t;
  }
  return { weekday, hours, longest };
}
export type RepoSort =
  "stars" | "forks" | "updated" | "created" | "name" | "best";
export function sortRepositories(
  repos: Repository[],
  sort: RepoSort,
  order = "desc",
) {
  if (sort === "best") return [...repos];
  return [...repos].sort((a, b) => {
    const value =
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "stars"
          ? a.stargazers_count - b.stargazers_count
          : sort === "forks"
            ? a.forks_count - b.forks_count
            : Date.parse(sort === "created" ? a.created_at : a.updated_at) -
              Date.parse(sort === "created" ? b.created_at : b.updated_at);
    return order === "asc" ? value : -value;
  });
}
export function eventLabel(e: GitEvent) {
  const action = e.payload.action;
  const labels: Record<string, string> = {
    PushEvent: "Pushed to",
    PullRequestEvent: `${action || "Updated"} pull request in`,
    IssuesEvent: `${action || "Updated"} issue in`,
    CreateEvent: `Created ${e.payload.ref_type || "reference"} in`,
    ForkEvent: "Forked",
    WatchEvent: "Starred",
    ReleaseEvent: "Published release in",
    IssueCommentEvent: "Commented in",
    DeleteEvent: "Deleted reference in",
    PullRequestReviewEvent: "Reviewed pull request in",
  };
  return labels[e.type] || e.type.replace(/Event$/, "");
}
