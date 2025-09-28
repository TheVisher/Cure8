import React from "react";
import { AppShell } from "../components/AppShell";
import { Sidebar } from "../components/Sidebar";
import { Card } from "../components/Card";

export default function GridScreen() {
  const [active, setActive] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<any[]>([]);

  // Listen to omnibox events
  React.useEffect(() => {
    const onSearch = (e: any) => setQ(e.detail.q || "");
    const onAdd = async (e: any) => {
      const url = e.detail.url;
      // optimistic card
      const id = crypto.randomUUID();
      setItems(x => [{ id, title: url, domain: new URL(url).hostname.replace(/^www\./,""), state: "pending" }, ...x]);
      // call your preview API
      try {
        const res = await fetch(`http://localhost:8787/preview?url=${encodeURIComponent(url)}`);
        const meta = await res.json();
        setItems(x => x.map(it => it.id === id ? {
          ...it, title: meta.title || it.title, domain: meta.domain || it.domain, image: meta.cardImage || meta.heroImage || null, state: "ok"
        } : it));
      } catch {
        setItems(x => x.map(it => it.id === id ? { ...it, state: "error" } : it));
      }
    };
    window.addEventListener("cure8.search", onSearch as any);
    window.addEventListener("cure8.add-url", onAdd as any);
    return () => {
      window.removeEventListener("cure8.search", onSearch as any);
      window.removeEventListener("cure8.add-url", onAdd as any);
    };
  }, []);

  const filtered = items.filter(it => {
    const t = (it.title || "").toLowerCase();
    const d = (it.domain || "").toLowerCase();
    const s = q.toLowerCase();
    return !s || t.includes(s) || d.includes(s);
  });

  return (
    <AppShell sidebar={<Sidebar active={active} onChange={setActive} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map(it => (
          <Card key={it.id} title={it.title} domain={it.domain} image={it.image} state={it.state} />
        ))}
      </div>
    </AppShell>
  );
}
