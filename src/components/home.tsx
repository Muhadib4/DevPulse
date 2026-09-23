"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Compass,
  GitGraph,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DeveloperSearch, Entrance, PageHeading } from "./ui";
import { Widgets } from "./widgets";
import { useWorkspace } from "@/stores/workspace";
export function Home() {
  const username = useWorkspace((s) => s.preferences.defaultUsername);
  const router = useRouter();
  useEffect(() => {
    if (username) router.replace(`/developer/${username}`);
  }, [username, router]);
  return (
    <Entrance>
      <PageHeading
        eyebrow="YOUR DEVELOPER COMMAND CENTER"
        title="A clearer view of your world."
        description="Discover what’s being built. Find your next inspiration."
        actions={
          <span className="live-badge">
            <span className="status-dot" /> All systems ready
          </span>
        }
      />
      <section className="hero">
        <div className="hero-grid" />
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="status-dot" /> LESS NOISE. MORE SIGNAL.
          </span>
          <h2>
            See the pulse
            <br />
            behind the <span>code.</span>
          </h2>
          <p>
            Developers, repositories, and the stories in their activity.
            <br className="desktop-break" /> One workspace to connect the dots.
          </p>
          <DeveloperSearch large />
          <div className="hero-bottom">
            <span>
              <GitGraph size={14} /> Powered by public GitHub data
            </span>
            <span className="hero-dot">·</span>
            <span>No sign-in needed</span>
          </div>
        </div>
        <div className="signal-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="signal-axis" />
          <div className="signal-center">
            <Activity size={68} strokeWidth={1.3} />
          </div>
          <div className="signal-tag signal-tag-one">
            <Code2 size={15} />
            <span>open source</span>
            <span className="status-dot" />
          </div>
          <div className="signal-tag signal-tag-two">
            <Radio size={15} />
            <span>discover. connect. build.</span>
          </div>
          <span className="orbit-node node-one" />
          <span className="orbit-node node-two" />
          <span className="signal-label mono">
            A NEW PERSPECTIVE ON YOUR CODE
          </span>
        </div>
      </section>
      <div className="capability-grid">
        {[
          {
            icon: Activity,
            label: "01 / DEVELOPER ANALYTICS",
            title: "Go beyond the profile.",
            text: "Explore languages, repositories, and the activity that connects them.",
            href: "/analyzer",
          },
          {
            icon: Compass,
            label: "02 / REPOSITORY DISCOVERY",
            title: "Your next rabbit hole.",
            text: "Find interesting projects. Filter the noise. Save what sparks an idea.",
            href: "/explore",
          },
          {
            icon: Sparkles,
            label: "03 / ACTIVITY INTELLIGENCE",
            title: "Turn activity into insight.",
            text: "See public patterns and momentum, with context behind every number.",
            href: "/analyzer",
          },
        ].map((item) => (
          <Link href={item.href} className="capability" key={item.title}>
            <div className="capability-top">
              <item.icon size={20} />
              <ArrowUpRight size={17} />
            </div>
            <span className="eyebrow">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Link>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h2>A workspace with breathing room.</h2>
        </div>
        <Link className="text-link" href="/settings">
          Customize workspace <ArrowRight size={15} />
        </Link>
      </div>
      <Widgets />
      <div className="privacy-strip">
        <ShieldCheck size={16} />
        <span>
          Your notes, saved items, and preferences stay in your browser.
        </span>
        <Link href="/explore">
          Start exploring <ArrowUpRight size={14} />
        </Link>
      </div>
    </Entrance>
  );
}
