import test from "node:test";
import assert from "node:assert/strict";
import {
  activityPatterns,
  eventDistribution,
  groupEventsByDay,
  languageDistribution,
  pulseScore,
  sortRepositories,
  totalForks,
  totalStars,
} from "../src/lib/github/analytics";
import type { GitEvent, Repository } from "../src/lib/github/types";
import { safeUrl, validUsername } from "../src/lib/utils";
const repository = (values: Partial<Repository> = {}): Repository => ({
  id: 1,
  name: "test",
  full_name: "owner/test",
  owner: { login: "owner", avatar_url: "" },
  description: null,
  html_url: "https://github.com/owner/test",
  homepage: null,
  language: null,
  stargazers_count: 0,
  forks_count: 0,
  open_issues_count: 0,
  topics: [],
  license: null,
  updated_at: "2026-09-20T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  pushed_at: "2026-09-20T00:00:00Z",
  archived: false,
  fork: false,
  default_branch: "main",
  size: 0,
  visibility: "public",
  clone_url: "https://github.com/owner/test.git",
  ...values,
});
const event = (date: string, type = "PushEvent"): GitEvent => ({
  id: date,
  type,
  repo: { name: "owner/test" },
  created_at: date,
  payload: {},
});
test("totals include zero and forked repositories without mutating input", () => {
  const repos = [
    repository({ stargazers_count: 10, forks_count: 3 }),
    repository({ stargazers_count: 5, forks_count: 1, fork: true }),
  ];
  assert.equal(totalStars(repos), 15);
  assert.equal(totalForks(repos), 4);
  assert.equal(totalStars([]), 0);
});
test("language distribution is repository frequency and excludes null", () => {
  const values = languageDistribution([
    repository({ language: "TypeScript" }),
    repository({ language: "TypeScript" }),
    repository({ language: "Python" }),
    repository(),
  ]);
  assert.equal(values[0].name, "TypeScript");
  assert.equal(values[0].value, 2);
  assert.ok(
    Math.abs(values.reduce((sum, v) => sum + v.percent, 0) - 100) < 0.0001,
  );
  assert.deepEqual(languageDistribution([]), []);
});
test("daily grouping fills missing dates, includes UTC boundaries and excludes older events", () => {
  const values = groupEventsByDay(
    [
      event("2026-09-20T23:59:59Z"),
      event("2026-09-20T12:00:00Z", "IssuesEvent"),
      event("2026-09-22T00:00:00Z"),
      event("2026-09-19T23:59:59Z"),
    ],
    3,
    new Date("2026-09-22T12:00:00Z"),
  );
  assert.deepEqual(
    values.map((v) => v.count),
    [2, 0, 1],
  );
  assert.deepEqual(values[0].types, { PushEvent: 1, IssuesEvent: 1 });
});
test("pulse has a zero floor, 100 ceiling, and ignores old or future activity", () => {
  const now = Date.parse("2026-09-22T12:00:00Z");
  assert.equal(pulseScore([], [], now).score, 0);
  assert.equal(
    pulseScore(
      [event("2020-01-01T00:00:00Z"), event("2027-01-01T00:00:00Z")],
      [],
      now,
    ).score,
    0,
  );
  const events = Array.from({ length: 100 }, (_, i) =>
    event(
      new Date(now - (i % 20) * 864e5).toISOString(),
      [
        "PushEvent",
        "IssuesEvent",
        "WatchEvent",
        "CreateEvent",
        "PullRequestEvent",
      ][i % 5],
    ),
  );
  const repos = Array.from({ length: 30 }, () => repository());
  assert.equal(pulseScore(events, repos, now).score, 100);
  assert.equal(
    pulseScore(events, repos, now).factors.reduce((a, f) => a + f.value, 0),
    100,
  );
});
test("sorting respects direction, does not mutate input, and ranks created date", () => {
  const repos = [
    repository({ name: "zeta", stargazers_count: 2 }),
    repository({
      name: "alpha",
      stargazers_count: 10,
      created_at: "2026-09-01T00:00:00Z",
    }),
  ];
  assert.equal(sortRepositories(repos, "stars")[0].name, "alpha");
  assert.equal(sortRepositories(repos, "name", "asc")[0].name, "alpha");
  assert.equal(sortRepositories(repos, "created")[0].name, "alpha");
  assert.equal(repos[0].name, "zeta");
});
test("activity runs deduplicate dates and weekday/hour patterns use UTC", () => {
  const values = [
    event("2026-09-20T23:00:00Z"),
    event("2026-09-20T01:00:00Z"),
    event("2026-09-21T00:00:00Z"),
    event("2026-09-22T00:00:00Z"),
  ];
  const patterns = activityPatterns(values);
  assert.equal(patterns.longest, 3);
  assert.equal(patterns.weekday[0].value, 2);
  assert.equal(patterns.hours[0].value, 2);
  assert.equal(eventDistribution(values)[0].value, 4);
  assert.equal(activityPatterns([]).longest, 0);
});
test("external URLs reject executable schemes and usernames prevent path injection", () => {
  assert.equal(safeUrl("javascript://alert(1)"), undefined);
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
  assert.equal(safeUrl("example.com"), "https://example.com/");
  assert.equal(validUsername("../admin"), false);
  assert.equal(validUsername("a/b"), false);
  assert.equal(validUsername("-bad"), false);
  assert.equal(validUsername("Muhadib4"), true);
  assert.equal(validUsername("a".repeat(40)), false);
});
