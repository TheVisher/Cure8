import React from "react";
import { AppShell } from "../components/AppShell.js";
import { Sidebar } from "../components/Sidebar.js";
import { Card } from "../components/Card.js";

export default function GridScreen() {
  const [active, setActive] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  // Listen to omnibox events
  React.useEffect(() => {
    const onSearch = (e) => setQ(e.detail.q || "");
    const onAdd = async (e) => {
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
    window.addEventListener("cure8.search", onSearch);
    window.addEventListener("cure8.add-url", onAdd);
    return () => {
      window.removeEventListener("cure8.search", onSearch);
      window.removeEventListener("cure8.add-url", onAdd);
    };
  }, []);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleDeleteItem = (itemId) => {
    const item = items.find(it => it.id === itemId);
    if (item && window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      setItems(prev => prev.filter(it => it.id !== itemId));
      setShowDetailsModal(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cure8-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedItems = JSON.parse(e.target.result);
          if (Array.isArray(importedItems)) {
            setItems(prev => [...importedItems, ...prev]);
            alert(`Successfully imported ${importedItems.length} bookmarks!`);
          } else {
            alert('Invalid file format. Please select a valid Cure8 export file.');
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const filtered = items.filter(it => {
    const t = (it.title || "").toLowerCase();
    const d = (it.domain || "").toLowerCase();
    const s = q.toLowerCase();
    return !s || t.includes(s) || d.includes(s);
  });

  return (
    <AppShell sidebar={<Sidebar active={active} onChange={setActive} onExport={handleExport} onImport={handleImport} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map(it => (
          <Card 
            key={it.id} 
            title={it.title} 
            domain={it.domain} 
            image={it.image} 
            state={it.state}
            onClick={() => handleCardClick(it)}
          />
        ))}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-surface rounded-card p-6 max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-text-primary">Bookmark Details</h2>
              <button 
                className="text-text-muted hover:text-text-primary text-2xl"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Title</label>
                <p className="text-text-primary">{selectedItem.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">URL</label>
                <p className="text-text-primary break-all">{selectedItem.url || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Domain</label>
                <p className="text-text-primary">{selectedItem.domain}</p>
              </div>
              
              {selectedItem.image && (
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Thumbnail</label>
                  <img src={selectedItem.image} alt="Thumbnail" className="w-full h-32 object-cover rounded" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                className="flex-1 bg-accent-purple text-white px-4 py-2 rounded-pill hover:brightness-110 transition"
                onClick={() => {
                  if (selectedItem.url) {
                    window.open(selectedItem.url, '_blank');
                  }
                }}
              >
                Open Link
              </button>
              <button 
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-pill hover:brightness-110 transition"
                onClick={() => handleDeleteItem(selectedItem.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
