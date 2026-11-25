// CSS template Picto (ThemeWagon, lisensi MIT) yang diterjemahkan dari
// Tailwind v4 + daisyUI asli ke CSS murni. Semua selektor dibatasi ke
// .tpl-picto supaya tidak bocor ke halaman lain. Font memakai DM Sans /
// General Sans yang sudah dimuat layout — tidak ada unduhan font baru.
// Warna asli dipertahankan: ungu #9929fb, ungu gelap #650fa0,
// soft-white #f0f1f3, soft-dark #87909d, footer #2A374A.
export const CSS_PICTO = `.tpl-picto{--pri:#9929fb;--pri-d:#650fa0;--soft:#f0f1f3;--soft-d:#87909d;--ink:#132238;--mu:#697482;--tile:#edd8ff80;--stat:#f6ebfe;--ft:#2a374a;--ln:#e5e7eb}
.tpl-picto{margin:0;font-family:"DM Sans","General Sans",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.6;color:var(--ink);background:#fff}
.tpl-picto img{max-width:100%;height:auto;display:block}
.tpl-picto a{color:inherit}
.tpl-picto h1, .tpl-picto h2, .tpl-picto h3{font-family:"General Sans","DM Sans",system-ui,sans-serif;font-weight:600;line-height:1.15;margin:0;color:var(--ink)}
.tpl-picto p{margin:0}
.tpl-picto .wrap{max-width:1320px;margin:0 auto;padding:0 16px}
.tpl-picto .skip{position:absolute;left:-999px}
.tpl-picto .skip:focus{left:10px;top:10px;background:#fff;padding:8px 12px;z-index:99;border:2px solid var(--pri);border-radius:8px}
.tpl-picto :focus-visible{outline:3px solid var(--pri);outline-offset:3px;border-radius:6px}
.tpl-picto .hd{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid transparent}
.tpl-picto .hd.scrolled{background:var(--soft);border-bottom-color:#d1d5db}
.tpl-picto .nav{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:10px 0}
.tpl-picto .logo{font-size:28px;font-weight:600;text-decoration:none}
.tpl-picto .logo span{color:var(--pri)}
.tpl-picto .menu{display:flex;gap:4px;list-style:none;margin:0;padding:0;font-weight:500}
.tpl-picto .menu a{display:block;text-decoration:none;padding:10px 16px;border-radius:8px}
.tpl-picto .menu a:hover{color:var(--pri)}
.tpl-picto .burger{display:none;background:none;border:1px solid var(--ln);border-radius:10px;padding:8px 12px;cursor:pointer;font-size:18px;color:var(--ink)}
.tpl-picto .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-weight:600;font-size:16px;text-decoration:none;border:1px solid transparent;cursor:pointer;font-family:inherit;transition:all .3s}
.tpl-picto .btn-p{background:var(--pri);color:#fff;border-color:var(--pri)}
.tpl-picto .btn-p:hover{background:var(--pri-d);transform:scale(1.02)}
.tpl-picto .btn-o{background:#fff;color:var(--ink);border-color:#d1d5db}
.tpl-picto .btn-o:hover{border-color:var(--pri);color:var(--pri)}
.tpl-picto .hero-bg{background:radial-gradient(circle at 12% 100%,#ffe2b0f5 1% 5px,transparent 15%),radial-gradient(circle at 95% -15%,#da4df166 5%,transparent 30%),radial-gradient(circle at center right,#c4f5e9b2 2%,transparent 35%)}
.tpl-picto .hero{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;padding:48px 0 64px}
.tpl-picto .hero h1{font-size:clamp(36px,4.6vw,60px)}
.tpl-picto .hero h1 .nm{display:block}
.tpl-picto .hl{background:linear-gradient(to top,#ffc8c8 40%,transparent 40%);padding:0 2px}
.tpl-picto .lede{font-size:18px;margin:24px 0 0;color:#333}
.tpl-picto .bio{color:#555;margin-top:12px}
.tpl-picto .hero .cta{margin-top:28px}
.tpl-picto .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:fit-content;margin-top:40px}
.tpl-picto .stat{background:var(--stat);text-align:center;padding:16px 20px}
.tpl-picto .stat b{display:block;font-size:32px;font-weight:600;color:#374151}
.tpl-picto .stat span{font-size:14px;color:#6b7280}
.tpl-picto .hero-photo{width:100%;aspect-ratio:536/636;object-fit:cover;border-radius:24px;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
.tpl-picto .hero-photo-fallback{width:100%;aspect-ratio:536/636;border-radius:24px;background:var(--stat);color:var(--pri);font-size:96px}
.tpl-picto .profile-card{position:relative;z-index:10;margin-top:-40px;background:#fff;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);padding:64px}
.tpl-picto .profile-grid{display:flex;gap:48px;justify-content:space-between;align-items:center}
.tpl-picto .prof-photo{max-width:424px;width:100%;flex-shrink:0}
.tpl-picto .prof-photo .ph{width:100%;aspect-ratio:424/480;object-fit:cover;border-radius:12px;background:var(--soft)}
.tpl-picto .prof-photo .ph-fallback{width:100%;aspect-ratio:424/480;border-radius:12px;background:var(--stat);color:var(--pri);font-size:96px}
.tpl-picto .soc{position:relative;margin-top:-24px;display:flex;justify-content:center}
.tpl-picto .soc-in{background:#fff;border-radius:4px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);padding:8px 16px;display:flex;gap:4px;flex-wrap:wrap;justify-content:center}
.tpl-picto .soc-in a{text-decoration:none;color:var(--pri);padding:4px 8px;border-radius:6px;font-weight:600;font-size:15px}
.tpl-picto .soc-in a:hover{background:var(--pri);color:#fff}
.tpl-picto .about-txt{max-width:528px}
.tpl-picto .about-txt h2{font-size:clamp(28px,3vw,38px);margin-bottom:24px}
.tpl-picto .about-txt p{color:#4b5563;font-size:17px}
.tpl-picto .about-txt .acts{display:flex;gap:16px;margin-top:32px;flex-wrap:wrap}
.tpl-picto section{padding:72px 0}
.tpl-picto .sec-head{text-align:center;max-width:576px;margin:0 auto 48px}
.tpl-picto .sec-head h2{font-size:clamp(32px,3.6vw,48px)}
.tpl-picto .sec-head p{color:#9ca3af;font-size:18px;padding-top:20px}
.tpl-picto .sec-head.left{text-align:left;margin:0 0 24px;max-width:none}
.tpl-picto .sec-head.left p{color:var(--mu)}
.tpl-picto .proc-sec{background:var(--soft)}
.tpl-picto .proc-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.tpl-picto .proc-grid .intro p{color:#6b7280;font-size:17px;margin-top:20px}
.tpl-picto .steps{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
.tpl-picto .step{background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;transition:box-shadow .3s}
.tpl-picto .step:nth-child(even){margin-top:24px;margin-bottom:0}
.tpl-picto .step:hover{box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
.tpl-picto .step-ic{width:56px;height:56px;background:var(--tile);color:var(--pri);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;transition:background .3s,color .3s}
.tpl-picto .step:hover .step-ic{background:var(--pri);color:#fff}
.tpl-picto .step h3{font-size:20px;margin-top:20px}
.tpl-picto .step p{color:var(--mu);font-size:15px;margin-top:10px}
.tpl-picto .proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tpl-picto .pj{border:1px solid var(--ln);border-radius:12px;overflow:hidden;background:#fff;transition:box-shadow .3s;display:flex;flex-direction:column}
.tpl-picto .pj:hover{box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}
.tpl-picto .pj img{width:100%;aspect-ratio:16/10;object-fit:cover}
.tpl-picto .pj .bd{padding:24px;display:flex;flex-direction:column;gap:0;flex:1}
.tpl-picto .pj .cat{color:#9ca3af;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.05em}
.tpl-picto .pj h3{font-size:19px;padding-top:4px;margin-bottom:10px}
.tpl-picto .pj p{color:#4b5563;font-size:14px;line-height:1.5}
.tpl-picto .pj .tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.tpl-picto .pj .tags span{background:var(--soft);border-radius:999px;padding:3px 12px;font-size:13px;font-weight:600}
.tpl-picto .pj .lk{margin-top:auto;padding-top:20px}
.tpl-picto .pj .lk a{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--ln);border-radius:8px;padding:10px 20px;font-weight:600;font-size:15px;text-decoration:none}
.tpl-picto .pj .lk a:hover{border-color:var(--pri);color:var(--pri)}
.tpl-picto .edu-list{list-style:none;margin:0;padding:0;max-width:800px}
.tpl-picto .edu-list li{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:20px 0;border-bottom:1px solid var(--ln)}
.tpl-picto .edu-list li:last-child{border-bottom:0}
.tpl-picto .edu-list time{color:var(--mu);font-size:15px}
.tpl-picto .edu-list h3{font-size:19px}
.tpl-picto .edu-list h3 b{font-weight:700}
.tpl-picto .edu-list p{color:var(--mu);font-size:15px;margin-top:4px}
.tpl-picto .svc-sec{background:var(--soft)}
.tpl-picto .svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.tpl-picto .svc-intro h2{font-size:clamp(32px,3.6vw,48px)}
.tpl-picto .svc-intro p{color:#9ca3af;font-size:17px;margin-top:20px}
.tpl-picto .svc-intro .btn{margin-top:32px}
.tpl-picto .role{background:#fff;border-radius:12px;padding:28px;margin-bottom:24px;position:relative;overflow:hidden;transition:box-shadow .3s;border-left:5px solid transparent}
.tpl-picto .role:last-child{margin-bottom:0}
.tpl-picto .role:hover{box-shadow:0 20px 40px -12px rgba(0,0,0,.2);border-left-color:var(--pri)}
.tpl-picto .role h3{font-size:22px;padding-bottom:12px}
.tpl-picto .role .chips{display:flex;gap:8px;flex-wrap:wrap}
.tpl-picto .role .chips span{background:var(--soft);border-radius:999px;padding:6px 14px;font-weight:600;font-size:14px}
.tpl-picto .ach-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.tpl-picto .ach{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:24px}
.tpl-picto .ach h3{font-size:19px}
.tpl-picto .ach .meta{color:var(--mu);font-size:14px;margin-top:6px}
.tpl-picto .ach p{color:#4b5563;font-size:15px;margin-top:10px}
.tpl-picto .ach .doc{display:inline-block;margin-top:12px;color:var(--pri);font-weight:600;text-decoration:none}
.tpl-picto .ach .doc:hover{text-decoration:underline}
.tpl-picto .sub-h{font-size:22px;margin:36px 0 16px}
.tpl-picto .lang-list{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.tpl-picto .lang{background:var(--stat);border-radius:999px;padding:10px 20px;font-weight:600}
.tpl-picto .lang span{color:var(--mu);font-weight:400}
.tpl-picto .contact-card{background:#fff;border-radius:16px;box-shadow:0 0 90px 9px rgba(0,0,0,.1);padding:48px}
.tpl-picto .contact-card h2{font-size:clamp(28px,3vw,38px);color:var(--ink)}
.tpl-picto .contact-card .lead{color:var(--soft-d);font-size:17px;padding-top:14px;max-width:560px}
.tpl-picto .addr-list{margin:32px 0;display:flex;flex-direction:column;gap:12px}
.tpl-picto .addr{display:flex;gap:14px;align-items:center;max-width:340px;padding:14px;border-radius:10px;transition:box-shadow .3s}
.tpl-picto .addr:hover{box-shadow:0 0 37px 5px rgba(0,0,0,.1)}
.tpl-picto .addr-ic{width:48px;height:48px;flex-shrink:0;background:var(--tile);color:var(--pri);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
.tpl-picto .addr:hover .addr-ic{background:var(--pri);color:#fff}
.tpl-picto .addr small{display:block;color:#424e60;font-size:13px}
.tpl-picto .addr b{color:var(--ink);font-size:16px;font-weight:500;word-break:break-word}
.tpl-picto .contact-links{display:flex;gap:4px;flex-wrap:wrap}
.tpl-picto .contact-links a{color:var(--pri);padding:6px 10px;border-radius:6px;font-weight:600;text-decoration:none}
.tpl-picto .contact-links a:hover{background:var(--pri);color:#fff}
.tpl-picto .ft{background:var(--ft);color:#e5e7eb;padding:64px 0 0}
.tpl-picto .ft-in{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.tpl-picto .ft .logo{color:#fff}
.tpl-picto .ft nav{display:flex;gap:4px;flex-wrap:wrap;justify-content:center}
.tpl-picto .ft nav a{color:#e5e7eb;text-decoration:none;font-size:15px;padding:6px 10px}
.tpl-picto .ft nav a:hover{color:#fff;text-decoration:underline}
.tpl-picto .ft .copy{font-size:15px}
.tpl-picto .ft .credit{text-align:center;color:#fff;padding:36px 16px;font-size:15px}
.tpl-picto .ft .credit a{color:#fff;font-weight:700}
.tpl-picto .totop{position:fixed;right:20px;bottom:40px;width:48px;height:48px;border-radius:50%;border:0;background:var(--pri);color:#fff;font-size:22px;cursor:pointer;z-index:60;display:flex;align-items:center;justify-content:center;transition:transform .3s,background .3s}
.tpl-picto .totop:hover{background:var(--pri-d);transform:scale(1.1)}
@media(max-width:1024px){
.tpl-picto .hero{grid-template-columns:1fr;text-align:center}
.tpl-picto .hero .cta{text-align:center}
.tpl-picto .stats{margin-left:auto;margin-right:auto}
.tpl-picto .hero-photo{max-width:536px;margin:0 auto}
.tpl-picto .profile-card{padding:40px 24px}
.tpl-picto .profile-grid{flex-direction:column;text-align:center}
.tpl-picto .about-txt .acts{justify-content:center}
.tpl-picto .proc-grid{grid-template-columns:1fr}
.tpl-picto .proj-grid{grid-template-columns:repeat(2,1fr)}
.tpl-picto .svc-grid{grid-template-columns:1fr}
.tpl-picto .ach-grid{grid-template-columns:1fr}
}
@media(max-width:900px){
.tpl-picto .menu{display:none}
.tpl-picto .burger{display:block}
.tpl-picto .menu.open{display:flex;flex-direction:column;position:absolute;top:64px;left:16px;right:16px;background:#fff;padding:16px;border:1px solid var(--ln);border-radius:16px;gap:4px;z-index:30;box-shadow:0 20px 40px -12px rgba(0,0,0,.2)}
.tpl-picto .edu-list li{grid-template-columns:1fr;gap:4px}
}
@media(max-width:560px){
.tpl-picto section{padding:48px 0}
.tpl-picto .steps{grid-template-columns:1fr}
.tpl-picto .step:nth-child(even){margin-top:0}
.tpl-picto .proj-grid{grid-template-columns:1fr}
.tpl-picto .stats{grid-template-columns:repeat(3,1fr);width:100%}
.tpl-picto .stat b{font-size:24px}
.tpl-picto .contact-card{padding:28px 20px}
.tpl-picto .profile-card{padding:28px 16px}
}`;
