// CSS Logsfolio — terjemahan visual template asli (shadcn + Tailwind,
// variabel HSL di globals.css) ke class semantik yang dibatasi ke
// .tpl-logsfolio. Warna utama asli: ungu primer hsl(262 83% 58%),
// latar putih / gelap hsl(224 71% 4.1%), teks abu-abu, radius 0.5rem,
// kontainer max-w-5xl. Font memakai yang sudah dimuat layout
// (DM Sans / General Sans) — tanpa unduhan font tambahan.
export const CSS_LOGSFOLIO = `.tpl-logsfolio{--bg:#ffffff;--fg:#09090b;--card:#ffffff;--card-fg:#09090b;--primary:#7c3aed;--primary-fg:#fafafa;--secondary:#f4f4f5;--secondary-fg:#18181b;--muted:#f4f4f5;--muted-fg:#71717a;--border:#e4e4e7;--ring:#7c3aed;--radius:0.5rem}
.tpl-logsfolio.dark{--bg:#020817;--fg:#f8fafc;--card:#020817;--card-fg:#f8fafc;--primary:#6d28d9;--primary-fg:#f8fafc;--secondary:#1e293b;--secondary-fg:#f8fafc;--muted:#1e293b;--muted-fg:#94a3b8;--border:#1e293b;--ring:#6d28d9}
.tpl-logsfolio{margin:0;font-family:"DM Sans",system-ui,sans-serif;font-size:17px;line-height:1.6;color:var(--fg);background:var(--bg);scroll-behavior:smooth}
.tpl-logsfolio img{max-width:100%;height:auto;display:block}
.tpl-logsfolio a{color:inherit}
.tpl-logsfolio h1, .tpl-logsfolio h2, .tpl-logsfolio h3, .tpl-logsfolio h4{margin:0;line-height:1.15;color:var(--fg);font-weight:700;letter-spacing:-.02em}
.tpl-logsfolio p{margin:0}
.tpl-logsfolio .lg-wrap{max-width:1024px;margin:0 auto;padding:0 24px}
.tpl-logsfolio :focus-visible{outline:2px solid var(--ring);outline-offset:3px;border-radius:4px}
.tpl-logsfolio .lg-skip{position:absolute;left:-999px}
.tpl-logsfolio .lg-skip:focus{left:10px;top:10px;background:var(--primary);color:var(--primary-fg);padding:8px 12px;z-index:99;border-radius:6px}
.tpl-logsfolio .lg-header{position:sticky;top:0;z-index:40;background:var(--bg);box-shadow:0 1px 3px rgba(0,0,0,.08);border-bottom:1px solid var(--border)}
.tpl-logsfolio .lg-nav{display:flex;align-items:center;justify-content:space-between;min-height:64px;padding-top:8px;padding-bottom:8px}
.tpl-logsfolio .lg-logo{font-weight:800;font-size:20px;letter-spacing:-.02em;text-decoration:none;color:var(--fg)}
.tpl-logsfolio .lg-logo span{color:var(--primary)}
.tpl-logsfolio .lg-menu{display:flex;gap:20px;list-style:none;margin:0;padding:0;align-items:center}
.tpl-logsfolio .lg-menu a{font-size:14px;color:var(--muted-fg);text-decoration:none;transition:color .15s}
.tpl-logsfolio .lg-menu a:hover{color:var(--primary)}
.tpl-logsfolio .lg-theme{background:var(--secondary);color:var(--secondary-fg);border:1px solid var(--border);border-radius:6px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}
.tpl-logsfolio .lg-burger{display:none;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;cursor:pointer;color:var(--fg);font-size:18px}
.tpl-logsfolio .lg-section{padding:48px 0}
.tpl-logsfolio .lg-h2{font-size:clamp(30px,4.5vw,48px);margin-bottom:48px}
.tpl-logsfolio .lg-hero{display:flex;flex-direction:column;align-items:center;gap:48px;padding-top:64px;padding-bottom:64px}
.tpl-logsfolio .lg-photo-col{width:100%;max-width:280px;margin:0 auto}
.tpl-logsfolio .lg-photo{width:280px;height:280px;max-width:100%;border-radius:50%;object-fit:cover;object-position:center;margin:0 auto;background:var(--secondary);color:var(--secondary-fg);font-size:64px}
.tpl-logsfolio .lg-hero-text{width:100%}
.tpl-logsfolio .lg-hero-text h1{font-size:clamp(36px,5vw,48px);letter-spacing:-.03em;margin-bottom:8px}
.tpl-logsfolio .lg-headline{font-size:20px;font-weight:600;color:var(--primary);margin-bottom:4px}
.tpl-logsfolio .lg-bio{max-width:600px;font-size:18px;color:var(--muted-fg);margin:12px 0 20px}
.tpl-logsfolio .lg-loc{font-size:15px;color:var(--muted-fg);margin-bottom:16px}
.tpl-logsfolio .lg-soc{display:flex;gap:12px;flex-wrap:wrap}
.tpl-logsfolio .lg-soc a{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:40px;padding:0 12px;border-radius:6px;background:var(--secondary);color:var(--secondary-fg);font-size:14px;font-weight:500;text-decoration:none;border:1px solid var(--border)}
.tpl-logsfolio .lg-soc a:hover{background:var(--muted)}
.tpl-logsfolio .lg-timeline{position:relative;padding-left:24px;display:grid;gap:40px}
.tpl-logsfolio .lg-timeline::after{content:"";position:absolute;top:0;bottom:0;left:0;width:1px;background:var(--border)}
.tpl-logsfolio .lg-tl-item{position:relative;display:grid;gap:4px}
.tpl-logsfolio .lg-tl-item::before{content:"";position:absolute;left:-29.5px;top:8px;width:12px;height:12px;border-radius:50%;background:var(--fg);z-index:1}
.tpl-logsfolio .lg-tl-item h4{font-size:20px;font-weight:500}
.tpl-logsfolio .lg-tl-item h4 a{color:var(--primary);text-decoration:none;margin-left:8px}
.tpl-logsfolio .lg-tl-sub{font-size:16px;font-weight:500}
.tpl-logsfolio .lg-tl-date{color:var(--muted-fg);font-size:15px}
.tpl-logsfolio .lg-tl-body{margin-top:8px;font-size:15px;color:var(--muted-fg)}
.tpl-logsfolio .lg-tl-body ul{list-style:disc;padding-left:16px;margin:0}
.tpl-logsfolio .lg-gpa{display:inline-block;margin-top:8px;font-size:14px;font-weight:600;background:var(--secondary);color:var(--secondary-fg);border:1px solid var(--border);border-radius:999px;padding:2px 12px}
.tpl-logsfolio .lg-projects{display:grid;grid-template-columns:1fr;gap:16px}
.tpl-logsfolio .lg-card{background:var(--card);color:var(--card-fg);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 1px 2px rgba(0,0,0,.05);display:flex;flex-direction:column;overflow:hidden}
.tpl-logsfolio .lg-proj{flex-direction:column}
.tpl-logsfolio .lg-proj-img{width:100%;padding:8px;display:flex;align-items:center}
.tpl-logsfolio .lg-proj-img img{width:100%;height:200px;object-fit:cover;border-radius:6px}
.tpl-logsfolio .lg-proj-body{width:100%;display:flex;flex-direction:column;padding:8px 24px 24px}
.tpl-logsfolio .lg-proj-body h3{font-size:24px;margin-bottom:8px}
.tpl-logsfolio .lg-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.tpl-logsfolio .lg-badge{display:inline-flex;align-items:center;background:var(--secondary);color:var(--secondary-fg);border:1px solid transparent;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600}
.tpl-logsfolio .lg-proj-desc{font-size:14px;color:var(--muted-fg);margin-bottom:16px}
.tpl-logsfolio .lg-proj-foot{display:flex;gap:12px;flex-wrap:wrap;margin-top:auto}
.tpl-logsfolio .lg-btn{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;border:1px solid transparent}
.tpl-logsfolio .lg-btn-primary{background:var(--primary);color:var(--primary-fg)}
.tpl-logsfolio .lg-btn-primary:hover{opacity:.9}
.tpl-logsfolio .lg-skills{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.tpl-logsfolio .lg-skill-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.tpl-logsfolio .lg-skill-card h3{font-size:16px;color:var(--primary);margin-bottom:12px}
.tpl-logsfolio .lg-skill-card ul{list-style:none;padding:0;margin:0;display:grid;gap:12px}
.tpl-logsfolio .lg-skill-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:15px}
.tpl-logsfolio .lg-dots{display:inline-flex;gap:4px;flex:none}
.tpl-logsfolio .lg-dots i{width:10px;height:10px;border-radius:50%;background:var(--border)}
.tpl-logsfolio .lg-dots i.on{background:var(--primary)}
.tpl-logsfolio .lg-level{font-size:13px;color:var(--muted-fg);white-space:nowrap}
.tpl-logsfolio .lg-ach{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.tpl-logsfolio .lg-ach-card{padding:24px;display:flex;flex-direction:column;gap:6px}
.tpl-logsfolio .lg-ach-card h3{font-size:19px}
.tpl-logsfolio .lg-ach-meta{font-size:14px;color:var(--muted-fg)}
.tpl-logsfolio .lg-ach-desc{font-size:15px;color:var(--muted-fg)}
.tpl-logsfolio .lg-ach-link{font-size:14px;font-weight:600;color:var(--primary);text-decoration:none;margin-top:8px}
.tpl-logsfolio .lg-lang{display:flex;flex-wrap:wrap;gap:12px}
.tpl-logsfolio .lg-lang-card{padding:16px 20px;display:flex;flex-direction:column;gap:2px;min-width:180px}
.tpl-logsfolio .lg-lang-card h3{font-size:17px}
.tpl-logsfolio .lg-lang-card span{font-size:14px;color:var(--muted-fg)}
.tpl-logsfolio footer{padding:16px 0;border-top:1px solid var(--border);margin-top:80px}
.tpl-logsfolio .lg-foot{text-align:center;font-size:14px;color:var(--muted-fg)}
.tpl-logsfolio .lg-foot a{color:var(--primary);text-decoration:none;margin-left:4px}
@media(min-width:1024px){
.tpl-logsfolio .lg-hero{flex-direction:row;justify-content:center}
.tpl-logsfolio .lg-photo-col{width:33.333%;flex:none}
.tpl-logsfolio .lg-hero-text{width:66.666%}
.tpl-logsfolio .lg-proj{flex-direction:row}
.tpl-logsfolio .lg-proj-img{width:33.333%;flex:none}
.tpl-logsfolio .lg-proj-body{width:66.666%}
.tpl-logsfolio .lg-section{padding:64px 0}
}
@media(max-width:1023px){
.tpl-logsfolio .lg-menu{display:none}
.tpl-logsfolio .lg-burger{display:block}
.tpl-logsfolio .lg-menu.open{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--bg);padding:18px 24px;border-bottom:1px solid var(--border);gap:12px;align-items:flex-start}
.tpl-logsfolio .lg-skills{grid-template-columns:1fr}
.tpl-logsfolio .lg-ach{grid-template-columns:1fr}
}`;
