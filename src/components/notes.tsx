"use client";
import { useState } from "react";
import { Check, Pin, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { useWorkspace, type Note } from "@/stores/workspace";
import { relative } from "@/lib/utils";
import { Empty, Entrance, PageHeading } from "./ui";
import { toast } from "sonner";
export function Notes() {
  const { notes, saveNote, deleteNote } = useWorkspace();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated");
  const note = notes.find((n) => n.id === selected);
  const create = () => {
    const now = Date.now();
    const id = crypto.randomUUID();
    saveNote({
      id,
      title: "",
      content: "",
      tag: "",
      pinned: false,
      createdAt: now,
      updatedAt: now,
    });
    setSelected(id);
  };
  const update = (patch: Partial<Note>) => {
    if (note) saveNote({ ...note, ...patch, updatedAt: Date.now() });
  };
  const filtered = notes
    .filter((n) =>
      `${n.title} ${n.content} ${n.tag}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        (sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "created"
            ? b.createdAt - a.createdAt
            : b.updatedAt - a.updatedAt),
    );
  return (
    <Entrance>
      <PageHeading
        eyebrow="A SECOND HOME FOR YOUR IDEAS"
        title="Scratchpad, upgraded."
        description="Capture a thought before it becomes the thing you almost remembered."
        actions={
          <button className="button primary" onClick={create}>
            <Plus size={17} /> New note
          </button>
        }
      />
      <div className="notes-workspace">
        <aside className="notes-sidebar">
          <label className="search-input">
            <Search size={16} />
            <input
              aria-label="Search notes"
              placeholder="Find a thought…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="notes-list-heading">
            <span>{filtered.length} notes</span>
            <select
              aria-label="Sort notes"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="updated">Last edited</option>
              <option value="created">Newest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
          <div className="note-list">
            {filtered.map((n) => (
              <button
                key={n.id}
                className={`note-preview ${n.id === selected ? "selected" : ""}`}
                onClick={() => setSelected(n.id)}
              >
                <div>
                  <strong>{n.title || "Untitled note"}</strong>
                  {n.pinned && <Pin size={13} />}
                </div>
                <p>{n.content || "A blank page, full of possibility."}</p>
                <footer>
                  <time>{relative(n.updatedAt)}</time>
                  {n.tag && <span>{n.tag}</span>}
                </footer>
              </button>
            ))}
            {!filtered.length && (
              <p className="notes-no-results">
                {search ? "No matching notes." : "Your next idea belongs here."}
              </p>
            )}
          </div>
        </aside>
        <section className="note-editor">
          {note ? (
            <>
              <div className="editor-toolbar">
                <span className="saved-indicator">
                  <Check size={13} /> Autosaved locally
                </span>
                <div>
                  <button
                    className={`icon-button ${note.pinned ? "is-saved" : ""}`}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    title={note.pinned ? "Unpin note" : "Pin note"}
                    onClick={() => update({ pinned: !note.pinned })}
                  >
                    <Pin
                      size={17}
                      fill={note.pinned ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label="Delete note"
                    title="Delete note"
                    onClick={() => {
                      if (confirm("Delete this note? This cannot be undone.")) {
                        deleteNote(note.id);
                        setSelected(null);
                        toast.success("Note deleted");
                      }
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <input
                className="note-title-input"
                aria-label="Note title"
                placeholder="Untitled note"
                maxLength={150}
                value={note.title}
                onChange={(e) => update({ title: e.target.value })}
              />
              <div className="note-properties">
                <span className="mono">
                  {new Date(note.createdAt).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <input
                  aria-label="Note tag"
                  placeholder="Add a tag"
                  maxLength={25}
                  value={note.tag}
                  onChange={(e) => update({ tag: e.target.value })}
                />
              </div>
              <textarea
                className="note-content"
                aria-label="Note content"
                placeholder="Let the ideas out. Code snippets, links, a reminder to yourself…"
                value={note.content}
                onChange={(e) => update({ content: e.target.value })}
              />
              <div className="editor-footer">
                <span>
                  <StickyNote size={13} /> Just for you. Stored in this browser.
                </span>
                <span>
                  {note.content.trim()
                    ? note.content.trim().split(/\s+/).length
                    : 0}{" "}
                  words
                </span>
              </div>
            </>
          ) : (
            <Empty
              title="Give that idea a little space."
              description="Choose a note, or start with a fresh page. Everything saves as you type."
            >
              <button className="button secondary" onClick={create}>
                <Plus size={16} /> Create a note
              </button>
            </Empty>
          )}
        </section>
      </div>
    </Entrance>
  );
}
