// CSS asli template MIT (mmrahmanbappi/100-free-html-templates),
// dibatasi ke .tpl-designer oleh scripts scope-css.py.
// Font dimuat lewat @import di baris pertama style ini.
export const CSS_DESIGNER = `@import url("https://fonts.googleapis.com/css2?family=Gloock&family=Manrope:wght@400;600;700&display=swap");
.tpl-designer{--ink:#1E1B2E;--pch:#FFB4A2;--lil:#D9D2FF;--mnt:#C8F1DC;--sun:#FFE08A;--tx:#2C2A3A;--mu:#6F6C80;--ln:#E7E4EE;--s:"Gloock",Georgia,serif;--b:"Manrope",system-ui,sans-serif}
.tpl-designer{margin:0;font-family:var(--b);font-size:18px;line-height:1.6;color:var(--tx);background:#FCFBFF}
.tpl-designer img{max-width:100%;height:auto;display:block}
.tpl-designer a{color:inherit}
.tpl-designer h1, .tpl-designer h2, .tpl-designer h3{font-family:var(--s);font-weight:400;margin:0;line-height:1.05;color:var(--ink)}
.tpl-designer .wrap{max-width:1160px;margin:0 auto;padding:0 22px}
.tpl-designer .skip{position:absolute;left:-999px}
.tpl-designer .skip:focus{left:10px;top:10px;background:var(--sun);padding:8px;z-index:99}
.tpl-designer :focus-visible{outline:3px solid var(--ink);outline-offset:3px;border-radius:6px}
.tpl-designer .hd{padding:20px 0}
.tpl-designer .nav{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid var(--ln);border-radius:999px;padding:10px 12px 10px 24px}
.tpl-designer .logo{font-family:var(--s);font-size:24px;text-decoration:none;color:var(--ink)}
.tpl-designer .menu{display:flex;gap:22px;list-style:none;margin:0;padding:0;font-weight:600}
.tpl-designer .menu a{text-decoration:none}
.tpl-designer .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:700;text-decoration:none;border:0;font-family:var(--b);font-size:16px;cursor:pointer}
.tpl-designer .btn-k{background:var(--ink);color:#fff}
.tpl-designer .btn-p{background:var(--pch);color:var(--ink)}
.tpl-designer .burger{display:none;background:none;border:1px solid var(--ln);border-radius:999px;padding:6px 12px;cursor:pointer}
.tpl-designer .hero{padding:50px 0 60px}
.tpl-designer .hero h1{font-size:clamp(50px,7.6vw,112px);max-width:12ch}
.tpl-designer .hero h1 span{background:var(--pch);border-radius:20px;padding:0 .12em}
.tpl-designer .hero .rw{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end;margin-top:30px}
.tpl-designer .hero p{font-size:21px;color:var(--mu);max-width:46ch;margin:0}
.tpl-designer .me{display:flex;align-items:center;gap:14px}
.tpl-designer .me img{width:72px;height:72px;border-radius:50%;object-fit:cover}
.tpl-designer .me small{display:block;color:var(--mu)}
.tpl-designer .logos{display:flex;gap:40px;flex-wrap:wrap;align-items:center;margin-top:44px;color:#A4A0B5;font-weight:700;font-size:19px}
.tpl-designer .logos span:first-child{font-weight:600;font-size:15px;color:var(--mu)}
.tpl-designer section{padding:70px 0}
.tpl-designer .sh{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px;flex-wrap:wrap}
.tpl-designer .sh h2{font-size:clamp(40px,5vw,66px)}
.tpl-designer .sh p{color:var(--mu);max-width:40ch;margin:0}
.tpl-designer .cases{display:grid;grid-template-columns:repeat(12,1fr);gap:18px}
.tpl-designer .cs{border-radius:28px;padding:24px;display:flex;flex-direction:column;gap:16px;text-decoration:none}
.tpl-designer .cs figure{margin:0;border-radius:18px;overflow:hidden;background:#fff}
.tpl-designer .cs img{width:100%;aspect-ratio:16/10;object-fit:cover;transition:transform .5s}
.tpl-designer .cs:hover img{transform:scale(1.03)}
.tpl-designer .cs h3{font-size:32px}
.tpl-designer .cs p{margin:0;color:#4A4760}
.tpl-designer .cs .meta{display:flex;gap:8px;flex-wrap:wrap}
.tpl-designer .cs .meta span{background:rgba(255,255,255,.7);border-radius:999px;padding:3px 12px;font-size:14px;font-weight:600}
.tpl-designer .cs .res{font-weight:700;color:var(--ink)}
.tpl-designer .c1{grid-column:span 7;background:var(--lil)}
.tpl-designer .c2{grid-column:span 5;background:var(--mnt)}
.tpl-designer .c3{grid-column:span 5;background:var(--sun)}
.tpl-designer .c4{grid-column:span 7;background:var(--pch)}
.tpl-designer .proc{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.tpl-designer .pr{background:#fff;border:1px solid var(--ln);border-radius:22px;padding:22px}
.tpl-designer .pr b{font-family:var(--s);font-weight:400;font-size:40px;color:var(--pch);display:block;line-height:1}
.tpl-designer .pr h3{font-family:var(--b);font-weight:700;font-size:19px;margin:10px 0 6px}
.tpl-designer .pr p{margin:0;color:var(--mu);font-size:16px}
.tpl-designer .tools{display:flex;gap:10px;flex-wrap:wrap}
.tpl-designer .tools span{background:#fff;border:1px solid var(--ln);border-radius:999px;padding:8px 16px;font-weight:600}
.tpl-designer .q{background:var(--ink);color:#CFCBE0;border-radius:32px;padding:50px;display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center}
.tpl-designer .q img{width:120px;height:120px;border-radius:50%;object-fit:cover}
.tpl-designer .q p{font-family:var(--s);font-size:clamp(24px,2.8vw,36px);line-height:1.25;color:#fff;margin:0 0 12px}
.tpl-designer .ct{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
.tpl-designer .ct h2{font-size:clamp(44px,5.6vw,76px)}
.tpl-designer .ct p{color:var(--mu);font-size:19px}
.tpl-designer form{background:#fff;border:1px solid var(--ln);border-radius:28px;padding:28px}
.tpl-designer label{display:block;font-weight:700;font-size:15px;margin-bottom:6px}
.tpl-designer input, .tpl-designer select, .tpl-designer textarea{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1.5px solid var(--ln);border-radius:14px;margin-bottom:14px;background:#fff}
.tpl-designer .chipsel{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.tpl-designer .chipsel label{margin:0;cursor:pointer}
.tpl-designer .chipsel input{position:absolute;opacity:0;width:1px;height:1px}
.tpl-designer .chipsel span{display:inline-block;border:1.5px solid var(--ln);border-radius:999px;padding:7px 14px;font-weight:600;font-size:14px}
.tpl-designer .chipsel input:checked+span{background:var(--ink);color:#fff;border-color:var(--ink)}
.tpl-designer .chipsel input:focus-visible+span{outline:3px solid var(--pch)}
.tpl-designer footer{padding:30px 0;color:var(--mu);font-size:15px}
.tpl-designer .ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){
.tpl-designer .menu{display:none}
.tpl-designer .burger{display:block}
.tpl-designer .menu.open{display:flex;flex-direction:column;position:absolute;top:90px;left:22px;right:22px;background:#fff;padding:18px;border:1px solid var(--ln);border-radius:22px;gap:12px;z-index:30}
.tpl-designer .hero .rw, .tpl-designer .ct{grid-template-columns:1fr}
.tpl-designer .c1, .tpl-designer .c2, .tpl-designer .c3, .tpl-designer .c4{grid-column:span 12}
.tpl-designer .proc{grid-template-columns:1fr 1fr}
.tpl-designer .q{grid-template-columns:1fr;padding:30px}
}
@media(max-width:520px){
.tpl-designer .proc{grid-template-columns:1fr}
.tpl-designer section{padding:54px 0}
}`;
