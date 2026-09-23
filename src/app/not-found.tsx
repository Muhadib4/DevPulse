import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="eyebrow">404 / SIGNAL NOT FOUND</div>
      <h1>This page wandered off.</h1>
      <p>Return to your workspace and pick up where you left off.</p>
      <Link href="/" className="button primary">
        Back to overview
      </Link>
    </div>
  );
}
