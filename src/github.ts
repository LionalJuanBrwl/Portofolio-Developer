import { useEffect, useState } from 'react';

export type Project = {
  title: string;
  kind: string;
  text: string;
  stack: string[];
  shot: string;
  demo: string;
};

type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  topics?: string[];
};

// Topik ini hanya penanda dan tidak ditampilkan sebagai teknologi.
const MARKERS = ['portfolio', 'tool', 'website'];
const TTL = 60 * 60 * 1000; // simpan hasil 1 jam di browser

const toProject = (r: Repo): Project => {
  const topics = r.topics ?? [];
  return {
    title: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    kind: topics.includes('tool') ? 'Tool' : 'Website',
    text: r.description ?? '',
    stack: topics.filter((t) => !MARKERS.includes(t)).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    // Memakai gambar "Social preview" repo kalau kamu unggah, kalau tidak kartu bawaan GitHub.
    shot: `https://opengraph.githubassets.com/1/${r.full_name}`,
    demo: r.homepage || r.html_url,
  };
};

// Mengambil repo publik bertopik "portfolio" dari GitHub langsung di browser pengunjung.
export function useGithubProjects(user: string): Project[] {
  const key = `projects:${user}`;
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw).items as Project[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let alive = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw && Date.now() - JSON.parse(raw).at < TTL) return;
    } catch {
      /* abaikan */
    }

    const q = encodeURIComponent(`user:${user} topic:portfolio fork:false`);
    fetch(`https://api.github.com/search/repositories?q=${q}&sort=updated&per_page=12`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { items?: Repo[] }) => {
        const items = (data.items ?? []).map(toProject);
        if (!alive) return;
        setProjects(items);
        try {
          localStorage.setItem(key, JSON.stringify({ at: Date.now(), items }));
        } catch {
          /* abaikan */
        }
      })
      .catch(() => {
        /* kalau GitHub tidak terjangkau, halaman tetap tampil tanpa proyek otomatis */
      });

    return () => {
      alive = false;
    };
  }, [key, user]);

  return projects;
}
