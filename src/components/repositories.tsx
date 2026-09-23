"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  GitFork,
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { Repository } from "@/lib/github/types";
import { sortRepositories, type RepoSort } from "@/lib/github/analytics";
import { useSearch } from "@/lib/github/queries";
import { number, relative, safeUrl } from "@/lib/utils";
import { useWorkspace } from "@/stores/workspace";
import {
  Empty,
  Entrance,
  ErrorState,
  External,
  Loading,
  PageHeading,
} from "./ui";
export function RepositoryCard({ repo }: { repo: Repository }) {
  const [now] = useState(Date.now);
  const saved = useWorkspace((s) =>
    s.repositories.some((r) => r.id === repo.id),
  );
  const toggle = useWorkspace((s) => s.toggleRepository);
  return (
    <article className="repository-card">
      <div className="repo-card-top">
        <BookOpen size={17} />
        <Link href={`/repository/${repo.full_name}`} className="repo-title">
          {repo.name}
        </Link>
        <span className="repo-visibility">
          {repo.archived ? "Archived" : repo.fork ? "Fork" : "Public"}
        </span>
        <button
          className={`icon-button save-button ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${repo.name}`}
          title={saved ? "Remove saved repository" : "Save repository"}
          onClick={() => {
            toggle(repo);
            toast.success(saved ? "Repository removed" : "Repository saved");
          }}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={`/developer/${repo.owner.login}`} className="repo-owner mono">
        {repo.owner.login}
      </Link>
      <p className="repo-description">
        {repo.description || "This repository lets its code do the talking."}
      </p>
      <div className="repo-topics">
        {repo.topics.slice(0, 3).map((topic) => (
          <Link
            key={topic}
            href={`/explore?q=${encodeURIComponent(`topic:${topic}`)}`}
          >
            {topic}
          </Link>
        ))}
      </div>
      <div className="repo-metadata">
        {repo.language && (
          <span>
            <i className="language-dot" />
            {repo.language}
          </span>
        )}
        <span title="Stars">
          <Star size={13} />
          {number(repo.stargazers_count)}
        </span>
        <span title="Forks">
          <GitFork size={13} />
          {number(repo.forks_count)}
        </span>
        <span title="Open issues and pull requests">
          {number(repo.open_issues_count)} issues
        </span>
      </div>
      <div className="repo-card-bottom">
        <span>
          <i
            className={`status-dot ${now - Date.parse(repo.pushed_at) < 30 * 864e5 ? "" : "muted-dot"}`}
          />{" "}
          Updated {relative(repo.updated_at)}
        </span>
        <div>
          {repo.license && <span>{repo.license.spdx_id}</span>}
          {safeUrl(repo.homepage) && (
            <External href={safeUrl(repo.homepage)!} className="repo-external">
              Demo
            </External>
          )}
          <External href={repo.html_url} className="repo-external">
            GitHub
          </External>
        </div>
      </div>
    </article>
  );
}
export function RepositoryGrid({
  repos,
  view = "grid",
}: {
  repos: Repository[];
  view?: "grid" | "list";
}) {
  return (
    <div className={`repository-grid ${view === "list" ? "list-view" : ""}`}>
      {repos.map((repo) => (
        <RepositoryCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
interface Filters {
  language: string;
  stars: string;
  updated: string;
  owner: string;
  topics: boolean;
  homepage: boolean;
  archived: string;
  fork: string;
}
const initial: Filters = {
  language: "",
  stars: "",
  updated: "",
  owner: "",
  topics: false,
  homepage: false,
  archived: "false",
  fork: "",
};
export function Explorer() {
  const params = useSearchParams();
  return <ExplorerContent key={params.get('q') || ''}/>;
}
function ExplorerContent() {
  const [now] = useState(Date.now);
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState<RepoSort>("best");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const { preferences, setPreferences, addRecent } = useWorkspace();
  const update = (key: keyof Filters, value: string | boolean) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const query = [
    q,
    filters.language ? `language:${filters.language}` : "",
    filters.stars ? `stars:>=${filters.stars}` : "",
    filters.owner ? `user:${filters.owner}` : "",
    filters.updated
      ? `pushed:>=${new Date(now - Number(filters.updated) * 864e5).toISOString().slice(0, 10)}`
      : "",
    filters.archived ? `archived:${filters.archived}` : "",
    filters.fork ? `fork:${filters.fork}` : "",
    filters.topics ? "topics:>0" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const result = useSearch(q ? query : "", sort, order, page);
  const items = sortRepositories(
    (result.data?.items || []).filter(
      (r) => !filters.homepage || !!safeUrl(r.homepage),
    ),
    sort,
    order,
  );
  useEffect(() => {
    if (q)
      addRecent({
        kind: "repository",
        label: q,
        url: `/explore?q=${encodeURIComponent(q)}`,
      });
  }, [q, addRecent]);
  const submit = (value: string) => {
    const term = value.trim();
    setPage(1);
    router.push(`/explore${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };
  return (
    <Entrance>
      <PageHeading
        eyebrow="FOLLOW YOUR CURIOSITY"
        title="Repository explorer"
        description="Somewhere out there, someone is building your next favorite thing."
      />
      <form
        className="explorer-search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <Search size={20} />
        <input
          aria-label="Search repositories"
          placeholder="Search repositories, topics, or an idea…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={150}
        />
        {input && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setInput("");
              submit("");
            }}
          >
            Clear
          </button>
        )}
        <button className="button primary">
          Search <ArrowRight size={16} />
        </button>
      </form>
      <div className="explorer-toolbar">
        <button
          className={`button secondary ${filterOpen ? "selected" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
        >
          <SlidersHorizontal size={15} /> Filters{" "}
          {Object.entries(filters).filter(
            ([k, v]) => v !== initial[k as keyof Filters],
          ).length > 0 && (
            <span className="filter-count">
              {
                Object.entries(filters).filter(
                  ([k, v]) => v !== initial[k as keyof Filters],
                ).length
              }
            </span>
          )}
        </button>
        <div className="toolbar-right">
          <label className="sort-label">
            Sort by{" "}
            <select
              aria-label="Sort repositories"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as RepoSort);
                setPage(1);
              }}
            >
              <option value="best">Best match</option>
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Recently updated</option>
              <option value="created">Newest on page</option>
              <option value="name">Name on page</option>
            </select>
          </label>
          <select
            aria-label="Sort direction"
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <div className="segmented view-toggle">
            <button
              title="Grid view"
              aria-label="Grid view"
              className={preferences.repoView === "grid" ? "selected" : ""}
              onClick={() => setPreferences({ repoView: "grid" })}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              title="List view"
              aria-label="List view"
              className={preferences.repoView === "list" ? "selected" : ""}
              onClick={() => setPreferences({ repoView: "list" })}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
      {filterOpen && (
        <div className="filter-panel">
          <label>
            Language
            <select
              value={filters.language}
              onChange={(e) => update("language", e.target.value)}
            >
              <option value="">All languages</option>
              {[
                "TypeScript",
                "JavaScript",
                "Python",
                "Go",
                "Rust",
                "Java",
                "C++",
                "C#",
                "Ruby",
                "Swift",
                "Kotlin",
                "PHP",
              ].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum stars
            <input
              type="number"
              min="0"
              max="1000000"
              value={filters.stars}
              placeholder="Any"
              onChange={(e) => update("stars", e.target.value)}
            />
          </label>
          <label>
            Updated
            <select
              value={filters.updated}
              onChange={(e) => update("updated", e.target.value)}
            >
              <option value="">Any time</option>
              <option value="7">Last week</option>
              <option value="30">Last month</option>
              <option value="365">Last year</option>
            </select>
          </label>
          <label>
            Owner
            <input
              placeholder="GitHub username"
              value={filters.owner}
              onChange={(e) =>
                update("owner", e.target.value.replace(/[^a-z\d-]/gi, ""))
              }
            />
          </label>
          <label>
            Archived
            <select
              value={filters.archived}
              onChange={(e) => update("archived", e.target.value)}
            >
              <option value="">Include all</option>
              <option value="false">Exclude archived</option>
              <option value="true">Archived only</option>
            </select>
          </label>
          <label>
            Repository type
            <select
              value={filters.fork}
              onChange={(e) => update("fork", e.target.value)}
            >
              <option value="">Original repositories</option>
              <option value="true">Include forks</option>
              <option value="only">Forks only</option>
            </select>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.topics}
              onChange={(e) => update("topics", e.target.checked)}
            />{" "}
            Has topics
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.homepage}
              onChange={(e) => update("homepage", e.target.checked)}
            />{" "}
            Has homepage (this page)
          </label>
          <button
            className="text-button"
            onClick={() => {
              setFilters(initial);
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      {!q ? (
        <>
          <div className="explore-intro">
            <span className="empty-icon">
              <Search size={28} />
            </span>
            <h2>Great projects start with curiosity.</h2>
            <p>Search the open-source universe, or follow a thread below.</p>
            <div className="suggestion-chips">
              {[
                "react dashboard",
                "machine learning",
                "developer tools",
                "nextjs",
                "creative coding",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setInput(term);
                    submit(term);
                  }}
                >
                  {term}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
          </div>
          <div className="explore-hint">
            <Check size={16} />
            <span>
              Pro tip: GitHub search syntax works here. Try{" "}
              <code>topic:ai stars:&gt;100</code>
            </span>
          </div>
        </>
      ) : result.isPending ? (
        <Loading />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : (
        <>
          <div className="results-heading">
            <span>
              <strong>{number(result.data?.total_count || 0)}</strong>{" "}
              repositories found <span className="muted">for “{q}”</span>
            </span>
            <span className="fine-print">Page {page} · up to 30 results</span>
          </div>
          {result.data?.incomplete_results && (
            <p className="notice">
              GitHub returned partial search results. Refine your query for
              better coverage.
            </p>
          )}
          {items.length ? (
            <RepositoryGrid repos={items} view={preferences.repoView} />
          ) : (
            <Empty
              title="No repositories in this view"
              description="Try a broader search or relax your filters."
            />
          )}
          <div className="pagination">
            <button
              className="button secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <span className="mono">
              {page} /{" "}
              {Math.max(
                1,
                Math.ceil(Math.min(result.data?.total_count || 0, 1000) / 30),
              )}
            </span>
            <button
              className="button secondary"
              disabled={
                page * 30 >= Math.min(result.data?.total_count || 0, 1000)
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
          <p className="fine-print">
            GitHub exposes the first 1,000 search matches. Name, creation date,
            and homepage filters apply to the current page.
          </p>
        </>
      )}
    </Entrance>
  );
}
