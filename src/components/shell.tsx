"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Command as CommandMenu } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  ArrowUpRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Command,
  Compass,
  GitGraph,
  LayoutDashboard,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Settings,
  StickyNote,
  Sun,
  X,
} from "lucide-react";
import { Brand } from "./ui";
import { useWorkspace } from "@/stores/workspace";
import { useApiStatus, useRate } from "@/lib/github/queries";
import { validUsername } from "@/lib/utils";
import { toast } from "sonner";
const navigation = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Analyzer", path: "/analyzer", icon: Activity },
  { label: "Saved", path: "/saved", icon: Bookmark },
  { label: "Notes", path: "/notes", icon: StickyNote },
];
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const query = useQueryClient();
  const {
    preferences,
    setPreferences,
    selectedUsername,
    repositories,
    developers,
    recent,
    removeRecent,
  } = useWorkspace();
  const [palette, setPalette] = useState(false);
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  useApiStatus();
  const rate = useRate((s) => s.rate);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  const theme = () =>
    setPreferences({ theme: preferences.theme === "light" ? "dark" : "light" });
  const refresh = async () => {
    setRefreshing(true);
    await query.invalidateQueries({
      predicate: (q) => q.queryKey[0] !== "status",
    });
    setRefreshing(false);
    toast.success("Workspace data refreshed");
  };
  const go = (url: string) => {
    router.push(url);
    setPalette(false);
    setSearch("");
    setDrawer(false);
  };
  const active = (url: string) =>
    url === "/"
      ? path === "/" || path.startsWith("/developer")
      : path.startsWith(url);
  const sidebar = (
    <>
      <Brand />
      <div className="workspace-label">
        <span className="status-dot" /> PERSONAL WORKSPACE
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(({ label, path: url, icon: Icon }) => (
          <Link
            key={url}
            href={
              url === "/analyzer" && selectedUsername
                ? `${url}?username=${selectedUsername}`
                : url
            }
            onClick={() => setDrawer(false)}
            title={label}
            aria-current={active(url) ? "page" : undefined}
            className={`nav-item ${active(url) ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
            {label === "Saved" &&
              repositories.length + developers.length > 0 && (
                <small>{repositories.length + developers.length}</small>
              )}
            {active(url) && <span className="nav-active-dot" />}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-tip">
          <span className="tip-icon">
            <Activity size={18} />
          </span>
          <strong>Your code. In perspective.</strong>
          <p>
            A little clarity for your
            <br />
            next big idea.
          </p>
          <Link href="/explore">
            Find your inspiration <ArrowUpRight size={13} />
          </Link>
        </div>
        <Link
          href="/settings"
          className={`nav-item ${active("/settings") ? "active" : ""}`}
          title="Settings"
          onClick={() => setDrawer(false)}
        >
          <Settings size={19} />
          <span>Settings</span>
        </Link>
        <div
          className="sidebar-status"
          title={
            rate
              ? `${rate.remaining} of ${rate.limit} requests left; resets ${new Date(rate.reset * 1000).toLocaleTimeString()}`
              : "Checking GitHub API"
          }
        >
          <span
            className={`status-dot ${rate?.remaining === 0 ? "warning" : ""}`}
          />
          <span>
            {rate?.remaining === 0 ? "API limit reached" : "GitHub API"}
            <small>
              {rate
                ? `${rate.remaining} / ${rate.limit} requests`
                : "Connecting…"}
            </small>
          </span>
        </div>
        <div className="sidebar-footer">
          <a
            href="https://github.com/Muhadib4/DevPulse"
            aria-label="DevPulse on GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitGraph size={18} />
          </a>
          <button
            onClick={theme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <Sun size={17} />
          </button>
          <button
            className="collapse-control"
            onClick={() =>
              setPreferences({ collapsed: !preferences.collapsed })
            }
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            {preferences.collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        </div>
      </div>
    </>
  );
  return (
    <div className={`app-shell ${preferences.collapsed ? "is-collapsed" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">{sidebar}</aside>
      <Dialog.Root open={drawer} onOpenChange={setDrawer}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="mobile-sidebar"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close
              className="mobile-close icon-button"
              aria-label="Close navigation"
            >
              <X size={18} />
            </Dialog.Close>
            {sidebar}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setDrawer(true)}
          >
            <Menu size={20} />
          </button>
          <button className="global-search" onClick={() => setPalette(true)}>
            <Search size={17} />
            <span>Search GitHub developer or repository...</span>
            <kbd>
              <Command size={11} /> K
            </kbd>
          </button>
          <div className="topbar-tools">
            <span className="topbar-clock mono">
              {now?.toLocaleTimeString("en", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: !preferences.hour24,
              }) || "--:--"}
              <span className="clock-zone"> LOCAL</span>
            </span>
            <span className="topbar-separator" />
            <button
              className="icon-button"
              title="Refresh data"
              aria-label="Refresh data"
              disabled={refreshing}
              onClick={refresh}
            >
              <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            </button>
            <button
              className="icon-button"
              title="Toggle theme"
              aria-label="Toggle theme"
              onClick={theme}
            >
              {preferences.theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>
            {selectedUsername ? (
              <img
                className="top-avatar"
                src={`https://github.com/${selectedUsername}.png?size=64`}
                alt={selectedUsername}
              />
            ) : (
              <span className="workspace-avatar">D</span>
            )}
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
          <footer className="page-footer">
            <span>
              <span className="status-dot" /> Built for the way you build.
            </span>
            <span>
              DEVPULSE <span className="muted">/</span> v1.0
            </span>
          </footer>
        </main>
      </div>
      <CommandMenu.Dialog
        open={palette}
        onOpenChange={setPalette}
        label="Workspace commands"
        title="Command palette"
        aria-describedby={undefined}
      >
        <div className="command-search">
          <Search size={20} />
          <CommandMenu.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Where would you like to go?"
          />
          <button
            className="icon-button"
            onClick={() => setPalette(false)}
            aria-label="Close command palette"
          >
            <X size={17} />
          </button>
        </div>
        <CommandMenu.List>
          <CommandMenu.Empty>No matching commands.</CommandMenu.Empty>
          {search.trim() && (
            <CommandMenu.Group heading="Search GitHub">
              {validUsername(search.trim().replace(/^@/, "")) && (
                <CommandMenu.Item
                  value={`developer ${search}`}
                  onSelect={() =>
                    go(`/developer/${search.trim().replace(/^@/, "")}`)
                  }
                >
                  <GitGraph size={17} />
                  Analyze @{search.trim().replace(/^@/, "")}
                </CommandMenu.Item>
              )}
              <CommandMenu.Item
                value={`repositories ${search}`}
                onSelect={() =>
                  go(`/explore?q=${encodeURIComponent(search.trim())}`)
                }
              >
                <Compass size={17} />
                Search repositories for “{search}”
              </CommandMenu.Item>
            </CommandMenu.Group>
          )}
          <CommandMenu.Group heading="Go to">
            {[
              ...navigation,
              { label: "Settings", path: "/settings", icon: Settings },
            ].map((n) => (
              <CommandMenu.Item
                key={n.path}
                onSelect={() => go(n.path)}
                value={`Open ${n.label} ${n.label === "Overview" ? "Dashboard" : ""}`}
              >
                <n.icon size={17} />
                Open {n.label}
              </CommandMenu.Item>
            ))}
          </CommandMenu.Group>
          <CommandMenu.Group heading="Actions">
            <CommandMenu.Item
              onSelect={() => {
                theme();
                setPalette(false);
              }}
            >
              <Sun size={17} />
              Toggle theme
            </CommandMenu.Item>
            <CommandMenu.Item
              onSelect={() => {
                void refresh();
                setPalette(false);
              }}
            >
              <RefreshCw size={17} />
              Refresh data
            </CommandMenu.Item>
            <CommandMenu.Item
              onSelect={() => {
                removeRecent();
                setPalette(false);
              }}
            >
              Clear recent searches
            </CommandMenu.Item>
            <CommandMenu.Item onSelect={() => setSearch("")}>
              Focus search
            </CommandMenu.Item>
          </CommandMenu.Group>
          {recent.length > 0 && (
            <CommandMenu.Group heading="Recently opened">
              {recent.slice(0, 5).map((r) => (
                <CommandMenu.Item key={r.url} onSelect={() => go(r.url)}>
                  {r.label}
                </CommandMenu.Item>
              ))}
            </CommandMenu.Group>
          )}
        </CommandMenu.List>
        <div className="command-footer">
          <span>↑ ↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </CommandMenu.Dialog>
    </div>
  );
}
