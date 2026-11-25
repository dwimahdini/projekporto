// CSS template Astrowind (onWidget, lisensi MIT, didistribusikan ThemeWagon),
// diterjemahkan dari Tailwind v4 (CSS-first) aslinya ke class semantik.
// Token diambil dari src/assets/styles/tailwind.css + CustomStyles.astro:
// primary rgb(1 97 239), secondary rgb(1 84 207), accent rgb(109 40 217),
// halaman terang putih/teks rgb(16 16 16), halaman gelap rgb(3 6 32).
// SEMUA selektor diawali .tpl-astrowind — tidak ada yang bocor ke global.
// Font memakai yang sudah dimuat layout (DM Sans / General Sans).
export const CSS_ASTROWIND = `.tpl-astrowind{--primary:#0161ef;--secondary:#0154cf;--accent:#6d28d9;--heading:#000000;--tx:#101010;--muted:rgba(16,16,16,.66);--bg:#ffffff;--bg-soft:#eff6ff;--line:#e5e7eb;--card:#ffffff;--card-line:#e5e7eb;--shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--sans:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
.tpl-astrowind.dark{--heading:#f7f8f8;--tx:#e5ecf6;--muted:rgba(229,236,246,.66);--bg:#030620;--bg-soft:transparent;--line:rgba(148,163,184,.25);--card:#0a1030;--card-line:#1e293b;--shadow:none}
.tpl-astrowind{margin:0;font-family:var(--sans);font-size:17px;line-height:1.65;color:var(--tx);background:var(--bg)}
.tpl-astrowind img{max-width:100%;height:auto;display:block}
.tpl-astrowind a{color:inherit}
.tpl-astrowind h1, .tpl-astrowind h2, .tpl-astrowind h3{margin:0;line-height:1.15;color:var(--heading);font-weight:700;letter-spacing:-.02em}
.tpl-astrowind p{margin:0}
.tpl-astrowind :focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
.tpl-astrowind .wrap{max-width:80rem;margin:0 auto;padding:0 1rem}
.tpl-astrowind .skip{position:absolute;left:-999px}
.tpl-astrowind .skip:focus{left:10px;top:10px;background:var(--primary);color:#fff;padding:8px 12px;z-index:99}
.tpl-astrowind .hd{position:sticky;top:0;z-index:40;background:var(--bg);border-bottom:1px solid transparent}
.tpl-astrowind .hd.scrolled{box-shadow:0 .375rem 1.5rem 0 rgba(140,152,164,.13)}
.tpl-astrowind .nav{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}
.tpl-astrowind .logo{font-size:20px;font-weight:800;text-decoration:none;color:var(--heading)}
.tpl-astrowind .logo span{color:var(--primary)}
.tpl-astrowind .menu{display:flex;gap:4px;list-style:none;margin:0;padding:0;font-size:15px;font-weight:500}
.tpl-astrowind .menu a{display:block;padding:12px 16px;text-decoration:none;white-space:nowrap}
.tpl-astrowind .menu a:hover{color:var(--primary)}
.tpl-astrowind .nav-actions{display:flex;align-items:center;gap:8px}
.tpl-astrowind .icon-btn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--tx);cursor:pointer}
.tpl-astrowind .icon-btn:hover{background:var(--bg-soft)}
.tpl-astrowind .icon-btn svg{width:20px;height:20px}
.tpl-astrowind .burger{display:none}
.tpl-astrowind .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;border-radius:999px;border:1px solid #9ca3af;background:transparent;font-family:var(--sans);font-size:16px;font-weight:500;text-align:center;text-decoration:none;line-height:1.4;cursor:pointer;transition:background .2s,border-color .2s}
.tpl-astrowind .btn:hover{background:#f3f4f6;border-color:#4b5563}
.tpl-astrowind .btn-primary{background:var(--primary);border-color:var(--primary);color:#fff;font-weight:600}
.tpl-astrowind .btn-primary:hover{background:var(--secondary);border-color:var(--secondary);color:#fff}
.tpl-astrowind .btn-sm{padding:10px 22px;font-size:14px}
.tpl-astrowind .hero{padding:48px 0 64px;text-align:center}
.tpl-astrowind .hero .tagline{font-size:16px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--secondary);margin-bottom:16px}
.tpl-astrowind .hero h1{font-size:clamp(40px,6vw,60px);line-height:1.05}
.tpl-astrowind .hero .sub{max-width:48rem;margin:24px auto;font-size:20px;color:var(--muted)}
.tpl-astrowind .hero .actions{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:8px}
.tpl-astrowind .hero .meta{margin-top:20px;font-size:15px;color:var(--muted)}
.tpl-astrowind section{padding:48px 0}
.tpl-astrowind .sec-head{max-width:48rem;margin:0 auto 32px;text-align:center}
.tpl-astrowind .sec-head.left{margin-left:0;margin-right:0;text-align:left}
.tpl-astrowind .sec-head h2{font-size:clamp(28px,4vw,36px)}
.tpl-astrowind .sec-head p{margin-top:16px;font-size:20px;color:var(--muted)}
.tpl-astrowind .about{background:var(--bg-soft)}
.tpl-astrowind .about-grid{display:flex;gap:64px;align-items:center}
.tpl-astrowind .about-text{flex:1 1 50%}
.tpl-astrowind .about-text h2{font-size:clamp(24px,3vw,30px);margin-bottom:8px}
.tpl-astrowind .about-text p{font-size:18px;color:var(--muted);margin-bottom:12px}
.tpl-astrowind .about-text .loc{font-size:16px;color:var(--tx)}
.tpl-astrowind .about-photo-wrap{flex:1 1 50%}
.tpl-astrowind .photo{width:100%;max-width:500px;aspect-ratio:1/1;object-fit:cover;border-radius:12px;box-shadow:var(--shadow);background:#9ca3af}
.tpl-astrowind div.photo{display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:800;color:#fff;background:var(--primary)}
.tpl-astrowind .soc-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px}
.tpl-astrowind .soc-card{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--card-line);border-radius:10px;background:var(--card);text-decoration:none;font-weight:600;font-size:15px;color:var(--heading)}
.tpl-astrowind .soc-card:hover{border-color:var(--primary);color:var(--primary)}
.tpl-astrowind .soc-card svg{width:20px;height:20px;flex-shrink:0}
.tpl-astrowind .steps{max-width:48rem;margin:0 auto}
.tpl-astrowind .step{display:flex}
.tpl-astrowind .step-rail{display:flex;flex-direction:column;align-items:center;margin-right:16px}
.tpl-astrowind .step-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:2px solid var(--primary);border-radius:50%;color:var(--primary);flex-shrink:0}
.tpl-astrowind .step-icon svg{width:20px;height:20px}
.tpl-astrowind .step-line{width:1px;flex:1;background:rgba(0,0,0,.1)}
.tpl-astrowind .step-body{padding-top:4px;padding-bottom:32px}
.tpl-astrowind .step:last-child .step-body{padding-bottom:0}
.tpl-astrowind .step-body h3{font-size:20px}
.tpl-astrowind .step-body h3 span{font-weight:400}
.tpl-astrowind .step-body .when{font-size:14px;font-weight:400;color:var(--muted)}
.tpl-astrowind .step-body p{margin-top:8px;color:var(--muted)}
.tpl-astrowind .step-body .gpa{margin-top:8px;color:var(--tx);font-weight:600}
.tpl-astrowind .skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px 48px;margin-top:48px}
.tpl-astrowind .skill{display:flex;gap:8px}
.tpl-astrowind .skill svg{width:24px;height:24px;flex-shrink:0;margin-top:4px;color:var(--primary)}
.tpl-astrowind .skill h3{font-size:18px;font-weight:600}
.tpl-astrowind .skill .cat{font-size:14px;color:var(--muted)}
.tpl-astrowind .skill .lvl{display:flex;gap:4px;margin-top:6px}
.tpl-astrowind .skill .lvl i{width:10px;height:10px;border-radius:50%;background:var(--line)}
.tpl-astrowind .skill .lvl i.on{background:var(--primary)}
.tpl-astrowind .proj{display:flex;gap:64px;align-items:center;padding:32px 0}
.tpl-astrowind .proj.rev{flex-direction:row-reverse}
.tpl-astrowind .proj-text{flex:1 1 50%}
.tpl-astrowind .proj-text h3{font-size:clamp(24px,3vw,30px);margin-bottom:8px}
.tpl-astrowind .proj-text h3 span{font-size:24px}
.tpl-astrowind .proj-item{margin-top:16px}
.tpl-astrowind .proj-item h4{margin:0;font-size:18px;font-weight:500;color:var(--heading)}
.tpl-astrowind .proj-item p{margin-top:4px;color:var(--muted)}
.tpl-astrowind .proj-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:16px}
.tpl-astrowind .proj-tags span{font-size:13px;background:var(--bg-soft);border:1px solid var(--card-line);border-radius:6px;padding:2px 10px}
.tpl-astrowind .proj-link{display:inline-flex;align-items:center;gap:4px;margin-top:20px;font-weight:600;color:var(--primary);text-decoration:none}
.tpl-astrowind .proj-link svg{width:18px;height:18px}
.tpl-astrowind .proj-link:hover{text-decoration:underline}
.tpl-astrowind .proj-img{flex:1 1 50%}
.tpl-astrowind .proj-img img{width:100%;border-radius:12px;box-shadow:var(--shadow);background:#9ca3af}
.tpl-astrowind .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.tpl-astrowind .card{background:var(--card);border:1px solid var(--card-line);border-radius:12px;padding:20px}
.tpl-astrowind .card h3{font-size:19px}
.tpl-astrowind .card .issuer{font-size:15px;color:var(--muted);margin-top:4px}
.tpl-astrowind .card p{margin-top:8px;color:var(--muted);font-size:16px}
.tpl-astrowind .card a{display:inline-block;margin-top:12px;font-weight:600;color:var(--primary);text-decoration:none}
.tpl-astrowind .card a:hover{text-decoration:underline}
.tpl-astrowind .langs{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.tpl-astrowind .lang{background:var(--card);border:1px solid var(--card-line);border-radius:999px;padding:10px 20px;font-weight:600;color:var(--heading)}
.tpl-astrowind .lang span{font-weight:400;color:var(--muted)}
.tpl-astrowind .cta-card{max-width:48rem;margin:0 auto;text-align:center;padding:24px;border-radius:8px;box-shadow:var(--shadow);border:1px solid var(--card-line);background:var(--card)}
.tpl-astrowind .cta-card h2{font-size:clamp(28px,4vw,36px)}
.tpl-astrowind .cta-card p{margin-top:16px;font-size:20px;color:var(--muted)}
.tpl-astrowind .cta-card .actions{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:24px}
.tpl-astrowind .cta-links{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:20px;font-size:15px}
.tpl-astrowind .cta-links a{color:var(--primary)}
.tpl-astrowind footer{border-top:1px solid var(--line);padding:32px 0}
.tpl-astrowind .ft{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;font-size:14px;color:var(--muted)}
.tpl-astrowind .ft a{color:var(--primary);font-weight:600}
.tpl-astrowind .ft .brand{font-size:20px;font-weight:800;color:var(--heading);text-decoration:none}
.tpl-astrowind .ft nav{display:flex;gap:16px;flex-wrap:wrap}
.tpl-astrowind .ft nav a{color:var(--muted);font-weight:400;text-decoration:none}
.tpl-astrowind .ft nav a:hover{color:var(--primary)}
@media(max-width:820px){
.tpl-astrowind .menu{display:none}
.tpl-astrowind .burger{display:inline-flex}
.tpl-astrowind .menu.open{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--bg);padding:12px 16px;border-bottom:1px solid var(--line);gap:0}
.tpl-astrowind .nav-actions .btn{display:none}
.tpl-astrowind .about-grid{flex-direction:column;gap:32px}
.tpl-astrowind .skills-grid{grid-template-columns:1fr 1fr}
.tpl-astrowind .proj{flex-direction:column;gap:24px}
.tpl-astrowind .proj.rev{flex-direction:column}
.tpl-astrowind .cards{grid-template-columns:1fr}
.tpl-astrowind .soc-cards{grid-template-columns:1fr 1fr}
}
@media(max-width:560px){
.tpl-astrowind .skills-grid{grid-template-columns:1fr}
.tpl-astrowind .soc-cards{grid-template-columns:1fr}
.tpl-astrowind .ft{flex-direction:column;align-items:flex-start}
}`;
