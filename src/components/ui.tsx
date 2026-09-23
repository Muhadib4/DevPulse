"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  Search,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/stores/workspace";
import { validUsername } from "@/lib/utils";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="DevPulse home">
      <span className="brand-mark">
        <Activity size={22} />
      </span>
      <span>
        dev<span className="brand-light">pulse</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}
export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="card-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Activity size={25} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <TriangleAlert size={24} />
      <div>
        <h2>We couldn’t load this data</h2>
        <p>{error.message}</p>
        {retry && (
          <button className="button secondary" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function Loading() {
  return (
    <div
      aria-label="Loading GitHub data"
      role="status"
      className="loading-grid"
    >
      <div className="skeleton profile-skeleton" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton stat-skeleton" />
      ))}
      <div className="skeleton chart-skeleton" />
      <div className="skeleton chart-skeleton" />
      <span className="sr-only">Loading GitHub data…</span>
    </div>
  );
}
export function External({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}
export function CopyButton({
  value,
  label = "Copy URL",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      className="button secondary small"
      title={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(`${label.replace("Copy ", "")} copied`);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Clipboard access is unavailable in this browser.");
        }
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
      {copied ? "Copied" : label}
    </button>
  );
}
export function Entrance({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useWorkspace((s) => s.preferences.reducedMotion);
  useEffect(() => {
    if (
      reduced ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !ref.current
    )
      return;
    const animation = animate(ref.current.children, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 420,
      delay: stagger(45),
      ease: "outQuad",
    });
    return () => {
      animation.revert();
    };
  }, [reduced]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
export function DeveloperSearch({
  large = false,
  analyzer = false,
}: {
  large?: boolean;
  analyzer?: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className={`developer-search ${large ? "large" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        const name = value.trim().replace(/^@/, "");
        if (!validUsername(name)) {
          setError("Enter a valid GitHub username.");
          return;
        }
        setError("");
        router.push(
          analyzer
            ? `/analyzer?username=${encodeURIComponent(name)}`
            : `/developer/${encodeURIComponent(name)}`,
        );
      }}
    >
      <label className="search-input">
        <Search size={19} />
        <input
          aria-label="GitHub username"
          placeholder="Enter a GitHub username"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <span className="mono muted">↵</span>
      </label>
      <button className="button primary" type="submit">
        Analyze developer <ArrowUpRight size={16} />
      </button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
