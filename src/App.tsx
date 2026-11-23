import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useGithubProjects } from './github';
import type { Project } from './github';

/* ------------------------------------------------------------------
   DATA: ganti bagian ini dengan datamu. Sisanya tidak perlu diubah.
------------------------------------------------------------------- */
const PROFILE = {
    name: 'Lional Juan Berwulo',
    whatsapp: 'https://wa.me/6282199735077', // 0821-9973-5077 dalam format internasional
    email: 'laurenz.berwulo@gmail.com',
    github: 'https://github.com/LionalJuanBrwl',
    githubUser: 'LionalJuanBrwl', // dipakai untuk mengambil proyek bertopik \"portfolio\"
};

// Foto latar hero, mis. '/images/langit.webp' (lebar 2000px, format webp, di bawah 300 KB).
// Kalau null, hero memakai gradasi biru dengan awan halftone.
const HERO_BG: string | null = '/images/langit.webp';

// Karakter 3D (PNG transparan di public/images/). Kalau null, kartu Tentang memakai inisial.
const CHARACTER: string | null = null;

// Kosong dulu. Setiap kali selesai membuat web, salin template di bawah ke dalam array ini.
// Hero dan bagian Karya akan terisi otomatis.
const PROJECTS: Project[] = [
    {
        title: 'Topi Lokal',
        kind: 'Website',
        text: 'Toko topi dengan keranjang dan checkout lewat WhatsApp.',
        stack: ['React', 'TypeScript', 'Vite'],
        shot: '/images/topi.webp',
        demo: 'https://web-pembelian-topi.vercel.app',
    },
];

const STACK = ['Laravel', 'React', 'TypeScript', 'Inertia', 'MySQL', 'Docker', 'Tailwind CSS', 'Git'];

// Isi kalau sudah punya angka asli, mis. { value: '3', label: 'proyek sudah dirilis' }.
const STATS: { value: string; label: string }[] = [];

/* ------------------------------------------------------------------
   TEKS DUA BAHASA: ubah kalimat di sini. Bahasa awal mengikuti bahasa browser pengunjung.
------------------------------------------------------------------- */
const COPY = {
    en: {
        role: 'Freelance Developer',
        metaDesc: 'Freelance developer for websites and web apps. Laravel and React, from design to launch.',
        navServices: 'Services',
        navWork: 'Work',
        navAbout: 'About',
        contactBtn: 'Contact me',
        heroLines: ['I build websites', 'and tools that', 'people really use.'],
        heroText: (name: string) =>
            `I’m ${name}, a freelance developer. I use Laravel and React, from design to launch, and I keep you updated at every step.`,
        ctaMain: 'Talk about your project',
        ctaWork: 'See my work',
        waiting: 'Waiting for a project',
        first: 'First project coming soon',
        servicesTitle: 'What I can build for you',
        services: [
            { title: 'Business websites', text: 'Company sites, landing pages, and online shops that load fast on phones and are easy to find on Google.' },
            { title: 'Custom web apps', text: 'Dashboards, booking systems, and internal apps made to fit how your business works.' },
            { title: 'Tools and integrations', text: 'Small tools, automation for repeat tasks, and links between services through APIs.' },
        ],
        workTitle: 'Work you can try right now',
        emptyTitle: 'My first project is on the way.',
        emptyText: 'Every finished website will show up here with a link you can open and try.',
        tryIt: 'Try it live',
        aboutTitle: 'A developer who builds your project personally',
        aboutText:
            'I build websites and web apps with Laravel and React. Replace this paragraph with your own short story: how long you have been building websites and which projects you enjoy most.',
        statsFallback: [
            { value: 'New', label: 'this portfolio just started' },
            { value: 'Open', label: 'for new projects' },
        ],
        quote: 'You talk directly to the person who writes the code.',
        contactTitle: 'Have a project? Tell me what you need.',
        contactText: 'Send a short message about what you want to build. I will reply with an estimate of time and cost.',
        chat: 'Chat on WhatsApp',
        email: 'Send an email',
    },
    id: {
        role: 'Developer Freelance',
        metaDesc: 'Developer freelance untuk website dan aplikasi web. Laravel dan React, dari desain sampai rilis.',
        navServices: 'Layanan',
        navWork: 'Karya',
        navAbout: 'Tentang',
        contactBtn: 'Hubungi saya',
        heroLines: ['Saya buat website', 'dan tools yang', 'benar-benar dipakai.'],
        heroText: (name: string) =>
            `Saya ${name}, developer freelance. Saya memakai Laravel dan React, dari desain sampai rilis, dan selalu memberi kabar di setiap tahap.`,
        ctaMain: 'Diskusi proyek',
        ctaWork: 'Lihat karya',
        waiting: 'Menunggu proyek',
        first: 'Proyek pertama segera hadir',
        servicesTitle: 'Yang bisa saya kerjakan untukmu',
        services: [
            { title: 'Website bisnis', text: 'Company profile, landing page, dan toko online yang cepat dibuka di HP dan mudah ditemukan di Google.' },
            { title: 'Aplikasi web custom', text: 'Dashboard, sistem pemesanan, dan aplikasi internal yang mengikuti alur kerja usahamu.' },
            { title: 'Tools dan integrasi', text: 'Tools kecil, otomasi pekerjaan berulang, dan sambungan antar layanan lewat API.' },
        ],
        workTitle: 'Karya yang bisa langsung dicoba',
        emptyTitle: 'Proyek pertama sedang dibuat.',
        emptyText: 'Setiap website yang selesai akan muncul di sini dengan tautan yang bisa langsung dicoba.',
        tryIt: 'Coba langsung',
        aboutTitle: 'Developer yang mengerjakan proyekmu sendiri',
        aboutText:
            'Saya membangun website dan aplikasi web dengan Laravel dan React. Ganti paragraf ini dengan cerita singkatmu: sudah berapa lama membuat web dan jenis proyek yang paling kamu nikmati.',
        statsFallback: [
            { value: 'Baru', label: 'portofolio ini baru dimulai' },
            { value: 'Buka', label: 'untuk proyek baru' },
        ],
        quote: 'Kamu bicara langsung dengan orang yang menulis kodenya.',
        contactTitle: 'Punya proyek? Ceritakan kebutuhanmu.',
        contactText: 'Kirim pesan singkat tentang apa yang ingin dibuat. Saya balas dengan perkiraan waktu dan biaya.',
        chat: 'Chat lewat WhatsApp',
        email: 'Kirim email',
    },
};

type Lang = keyof typeof COPY;

/* ------------------------------------------------------------------
   STYLE
------------------------------------------------------------------- */
const BLUE = '#1f4bff';
const LIME = '#c8f542';
const INK = '#050505';
const SURFACE = '#f3f4f6';

// Awan titik halftone di latar hero: posisi, ukuran, dan jeda animasi.
const HALFTONE_CLOUDS = [
    { top: '6%', left: '-12%', w: '58%', h: '40%', delay: 0 },
    { top: '34%', left: '48%', w: '62%', h: '42%', delay: -7 },
    { top: '58%', left: '-6%', w: '52%', h: '38%', delay: -13 },
];

const headline: CSSProperties = {
    fontStretch: '62%',
    fontWeight: 800,
    lineHeight: 0.95,
    letterSpacing: '-0.01em',
};

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current';

const CSS = `
html { scroll-behavior: smooth; }
@keyframes lineUp { from { transform: translateY(105%); } to { transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes cardIn { from { opacity: 0; translate: 0 110px; } to { opacity: 1; translate: 0 0; } }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes drift { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
.line { display: block; overflow: hidden; padding-bottom: 0.08em; }
.line > span { display: block; animation: lineUp 0.9s cubic-bezier(.2,.8,.2,1) both; }
.fade { animation: fadeIn 0.8s ease both; }
.card-in { animation: cardIn 1s cubic-bezier(.2,.8,.2,1) both; }
.arc { --ch: min(12vh, 6rem); --gap: calc(var(--ch) * 1.4); }
@media (min-width: 640px) { .arc { --ch: min(16vh, 9rem); } }
.arc-card {
    --shift: 0rem;
    transform: translateX(calc(-50% + var(--o) * var(--gap) + var(--shift))) translateY(var(--y)) translateZ(var(--z)) rotateY(calc(var(--r) + var(--mx) * 12deg));
    transition: transform 0.4s cubic-bezier(.2,.8,.2,1);
}
.arc-card:hover ~ .arc-card { --shift: 2.5rem; }
.arc-card:has(~ .arc-card:hover) { --shift: -2.5rem; }
.arc-card::after { content: ''; position: absolute; left: 0; right: 0; top: 100%; height: 44px; }
.arc-card:hover {
    z-index: 30 !important;
    transform: translateX(calc(-50% + var(--o) * var(--gap))) translateY(-28px) translateZ(70px) rotateY(0deg) scale(1.04);
}
.marquee-track { animation: marquee 32s linear infinite; }
.marquee:hover .marquee-track { animation-play-state: paused; }
.lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.lift:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0 ${INK}; }
.service { transition: background-color 0.2s ease; }
.service:hover { background-color: ${LIME}; }
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;

/* ------------------------------------------------------------------
   KOMPONEN
------------------------------------------------------------------- */
function Shot({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-white ${className}`}>
            <span
                className="absolute inset-0 flex items-center justify-center p-3 text-center text-sm font-bold"
                style={{ background: LIME, color: INK, fontStretch: '75%' }}
            >
                {alt}
            </span>
            {src && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="relative h-full w-full object-cover object-top"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                />
            )}
        </div>
    );
}

// Kartu proyek tersusun melengkung. Bergeser mengikuti kursor.
function ShotArc({ items, waiting, first }: { items: Project[]; waiting: string; first: string }) {
    const wrap = useRef<HTMLDivElement>(null);
    const list: Project[] = items.length
        ? items.slice(0, 5)
        : Array.from({ length: 5 }, (_, i) => ({ title: i === 2 ? first : waiting, kind: '', text: '', stack: [], shot: '', demo: '' }));
    const mid = (list.length - 1) / 2;

    const onMove = (e: ReactPointerEvent) => {
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5));
    };

    return (
        <div
            ref={wrap}
            onPointerMove={onMove}
            onPointerLeave={() => wrap.current?.style.setProperty('--mx', '0')}
            className="arc relative mx-auto mt-auto h-[calc(var(--ch)+2.5rem)] w-full max-w-5xl"
            style={{ perspective: '1500px', ['--mx' as string]: 0 }}
        >
            {list.map((p, i) => {
                const off = i - mid;
                const abs = Math.abs(off);
                return (
                    <div
                        key={i}
                        className="arc-card absolute bottom-0 left-1/2"
                        style={{
                            zIndex: 10 - Math.round(abs * 2),
                            ['--o' as string]: off,
                            ['--y' as string]: `${abs * 16}px`,
                            ['--z' as string]: `${-abs * 90}px`,
                            ['--r' as string]: `${off * -15}deg`,
                        }}
                    >
                        <div className="card-in" style={{ animationDelay: `${0.7 + i * 0.12}s` }}>
                            <Shot
                                src={p.shot}
                                alt={p.title}
                                className="h-[var(--ch)] w-[calc(var(--ch)*1.6)] rounded-xl border-2"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Marquee() {
    const items = [...STACK, ...STACK];
    return (
        <div className="marquee overflow-hidden border-b-2 bg-white py-4" style={{ borderColor: INK }}>
            <div className="marquee-track flex w-max gap-10 pr-10 text-xl font-bold sm:text-2xl" style={{ fontStretch: '70%' }}>
                {items.map((s, i) => (
                    <span key={i} aria-hidden={i >= STACK.length}>
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------
   HALAMAN
------------------------------------------------------------------- */
// Proyek dari GitHub (repo bertopik "portfolio") diambil otomatis. Proyek yang kamu tulis manual di PROJECTS tetap tampil setelahnya.
export default function Welcome() {
    const projects = useGithubProjects(PROFILE.githubUser);
    const all = [...projects, ...PROJECTS];

    // Bahasa awal 'en' agar sama di server dan browser. Setelah halaman terbuka, ikuti pilihan tersimpan atau bahasa browser.
    const [lang, setLang] = useState<Lang>('en');
    useEffect(() => {
        try {
            const saved = localStorage.getItem('lang');
            setLang(saved === 'id' || saved === 'en' ? saved : navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en');
        } catch {
            /* abaikan */
        }
    }, []);
    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);
    const switchLang = (l: Lang) => {
        setLang(l);
        try {
            localStorage.setItem('lang', l);
        } catch {
            /* abaikan */
        }
    };
    const t = COPY[lang];

    useEffect(() => {
        document.title = `${PROFILE.name} | ${t.role}`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDesc);
    }, [t]);
    return (
        <>
            <style>{CSS}</style>

            <div className="min-h-screen" style={{ background: SURFACE, color: INK, fontFamily: 'Archivo, system-ui, sans-serif' }}>
                {/* HERO */}
                <section
                    className="relative flex min-h-[100svh] flex-col overflow-hidden text-white"
                    style={{
                        background:
                            'radial-gradient(60% 45% at 85% 25%, rgba(110,190,255,0.55), transparent 70%), linear-gradient(180deg, #1237d9 0%, #1f4bff 45%, #4a82ff 100%)',
                    }}
                >
                    {HERO_BG ? (
                        <>
                            <img
                                src={HERO_BG}
                                alt=""
                                fetchPriority="high"
                                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_35%]"
                            />
                            {/* lapisan biru tipis agar teks putih tetap terbaca */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background:
                                        'linear-gradient(180deg, rgba(18,55,217,0.78) 0%, rgba(31,75,255,0.62) 45%, rgba(31,75,255,0.38) 100%)',
                                }}
                            />
                        </>
                    ) : HALFTONE_CLOUDS.map((c, i) => (
                        <div
                            key={i}
                            aria-hidden="true"
                            className="pointer-events-none absolute"
                            style={{
                                top: c.top,
                                left: c.left,
                                width: c.w,
                                height: c.h,
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1.4px, transparent 1.9px)',
                                backgroundSize: '9px 9px',
                                WebkitMaskImage: 'radial-gradient(closest-side, #000 25%, transparent 100%)',
                                maskImage: 'radial-gradient(closest-side, #000 25%, transparent 100%)',
                                animation: `drift 22s ease-in-out ${c.delay}s infinite alternate`,
                            }}
                        />
                    ))}

                    <nav className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
                        <a href="#" className={`fade text-lg font-bold ${focus}`}>
                            {PROFILE.name}
                        </a>
                        <div className="fade flex items-center gap-7 text-sm">
                            <a href="#layanan" className={`hidden hover:underline sm:inline ${focus}`}>{t.navServices}</a>
                            <a href="#karya" className={`hidden hover:underline sm:inline ${focus}`}>{t.navWork}</a>
                            <a href="#tentang" className={`hidden hover:underline sm:inline ${focus}`}>{t.navAbout}</a>
                            <div className="flex items-center rounded-full border border-white/60 p-0.5 text-xs font-medium" role="group" aria-label="Language">
                                {(['en', 'id'] as Lang[]).map((l) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => switchLang(l)}
                                        aria-pressed={lang === l}
                                        className={`rounded-full px-2.5 py-1 ${focus}`}
                                        style={lang === l ? { background: '#fff', color: INK } : undefined}
                                    >
                                        {l.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <a
                                href={PROFILE.whatsapp}
                                target="_blank"
                                rel="noreferrer"
                                className={`rounded-full px-5 py-2 font-medium ${focus}`}
                                style={{ background: LIME, color: INK }}
                            >
                                {t.contactBtn}
                            </a>
                        </div>
                    </nav>

                    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-10 pt-4 text-center sm:pt-6">
                        <h1 className="mx-auto max-w-4xl text-[2.6rem] sm:[font-size:min(4.25rem,9vh)] lg:[font-size:min(5.5rem,9.5vh)]" style={headline}>
                            {t.heroLines.map((line, i) => (
                                <span key={i} className="line">
                                    <span style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{line}</span>{' '}
                                </span>
                            ))}
                        </h1>

                        <p className="fade mx-auto mt-4 max-w-lg text-base sm:mt-5" style={{ animationDelay: '0.6s', color: '#dbe3ff' }}>
                            {t.heroText(PROFILE.name)}
                        </p>

                        <div className="fade mb-8 mt-5 flex flex-wrap justify-center gap-3" style={{ animationDelay: '0.7s' }}>
                            <a
                                href={PROFILE.whatsapp}
                                target="_blank"
                                rel="noreferrer"
                                className={`rounded-full px-7 py-3 text-sm font-medium ${focus}`}
                                style={{ background: LIME, color: INK }}
                            >
                                {t.ctaMain}
                            </a>
                            <a href="#karya" className={`rounded-full border-2 border-white px-7 py-3 text-sm font-medium ${focus}`}>
                                {t.ctaWork}
                            </a>
                        </div>

                        <ShotArc items={all} waiting={t.waiting} first={t.first} />
                    </div>
                </section>

                <Marquee />

                {/* LAYANAN */}
                <section id="layanan" className="mx-auto max-w-6xl scroll-mt-4 px-5 py-16">
                    <h2 className="max-w-3xl text-3xl sm:text-5xl" style={headline}>
                        {t.servicesTitle}
                    </h2>
                    <ul className="mt-8 grid gap-4 md:grid-cols-3">
                        {t.services.map((s) => (
                            <li key={s.title} className="service flex min-h-44 flex-col justify-between rounded-3xl border-2 bg-white p-6" style={{ borderColor: INK }}>
                                <h3 className="text-2xl font-bold" style={{ fontStretch: '70%' }}>{s.title}</h3>
                                <p className="mt-6 max-w-xs">{s.text}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* KARYA */}
                <section id="karya" className="scroll-mt-4 border-y-2 bg-white" style={{ borderColor: INK }}>
                    <div className="mx-auto max-w-6xl px-5 py-16">
                        <h2 className="max-w-3xl text-3xl sm:text-5xl" style={headline}>
                            {t.workTitle}
                        </h2>
                        {all.length === 0 && (
                            <div className="mt-8 rounded-2xl border-2 border-dashed p-8 sm:p-10" style={{ borderColor: INK }}>
                                <p className="max-w-xl text-3xl sm:text-4xl" style={headline}>
                                    {t.emptyTitle}
                                </p>
                                <p className="mt-4 max-w-md">
                                    {t.emptyText}
                                </p>
                            </div>
                        )}
                        <ul className="mt-8 grid gap-8 md:grid-cols-2">
                            {all.map((p) => (
                                <li key={p.title} className="lift overflow-hidden rounded-2xl border-2 bg-white" style={{ borderColor: INK }}>
                                    <Shot src={p.shot} alt={p.title} className="aspect-[16/10] border-b-2" />
                                    <div className="p-5">
                                        <p className="text-sm" style={{ color: '#55575d' }}>{p.kind}</p>
                                        <h3 className="mt-1 text-3xl" style={headline}>{p.title}</h3>
                                        <p className="mt-3 max-w-md">{p.text}</p>
                                        <p className="mt-4 text-sm font-medium">{p.stack.join(', ')}</p>
                                        <a
                                            href={p.demo}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`mt-5 inline-block rounded-full px-5 py-2 text-sm font-medium ${focus}`}
                                            style={{ background: INK, color: '#fff' }}
                                        >
                                            {t.tryIt}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* TENTANG */}
                <section id="tentang" className="mx-auto max-w-6xl scroll-mt-4 px-5 py-16">
                    <h2 className="max-w-3xl text-3xl sm:text-5xl" style={headline}>
                        {t.aboutTitle}
                    </h2>
                    <div className="mt-8 grid auto-rows-[9rem] gap-4 md:grid-cols-4">
                        <div className="relative overflow-hidden rounded-3xl p-7 text-white md:col-span-2 md:row-span-2" style={{ background: INK }}>
                            {CHARACTER ? (
                                <img src={CHARACTER} alt={PROFILE.name} className="absolute -bottom-2 right-0 h-4/5 object-contain" />
                            ) : (
                                <span className="absolute bottom-0 right-4 text-[8rem] leading-none" style={{ ...headline, color: BLUE }}>
                                    LJ
                                </span>
                            )}
                            <p className="relative max-w-xs text-base">
                                {t.aboutText}
                            </p>
                        </div>

                        {(STATS.length ? STATS : t.statsFallback).map((s, i) => (
                            <div
                                key={s.label}
                                className="flex flex-col justify-between rounded-3xl border-2 p-6"
                                style={{ borderColor: INK, background: i === 0 ? LIME : '#fff' }}
                            >
                                <span className="text-5xl" style={headline}>{s.value}</span>
                                <span className="text-sm font-medium">{s.label}</span>
                            </div>
                        ))}

                        <div className="flex items-end rounded-3xl p-6 text-white md:col-span-2" style={{ background: BLUE }}>
                            <p className="text-2xl" style={{ ...headline, lineHeight: 1 }}>
                                {t.quote}
                            </p>
                        </div>
                    </div>
                </section>

                {/* KONTAK */}
                <section id="kontak" className="relative overflow-hidden" style={{ background: LIME }}>
                    <div className="mx-auto max-w-6xl px-5 py-20 text-center">
                        <h2 className="mx-auto max-w-4xl text-3xl sm:text-6xl" style={headline}>
                            {t.contactTitle}
                        </h2>
                        <p className="mx-auto mt-6 max-w-md">
                            {t.contactText}
                        </p>
                        <div className="mt-9 flex flex-wrap justify-center gap-3">
                            <a
                                href={PROFILE.whatsapp}
                                target="_blank"
                                rel="noreferrer"
                                className={`rounded-full px-7 py-3 text-sm font-medium text-white ${focus}`}
                                style={{ background: INK }}
                            >
                                {t.chat}
                            </a>
                            <a
                                href={`mailto:${PROFILE.email}`}
                                className={`rounded-full border-2 px-7 py-3 text-sm font-medium ${focus}`}
                                style={{ borderColor: INK }}
                            >
                                {t.email}
                            </a>
                        </div>
                    </div>
                </section>

                <footer className="px-5 py-6 text-sm" style={{ background: INK, color: '#c9c9c9' }}>
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                        <span>© {new Date().getFullYear()} {PROFILE.name}</span>
                        <a href={PROFILE.github} target="_blank" rel="noreferrer" className={`underline underline-offset-4 ${focus}`}>
                            GitHub
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
