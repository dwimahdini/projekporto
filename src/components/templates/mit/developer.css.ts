// CSS asli template MIT (mmrahmanbappi/100-free-html-templates),
// dibatasi ke .tpl-developer oleh scripts scope-css.py.
// Font developer diganti ke JetBrains Mono + DM Sans
// (sudah dimuat layout) supaya tidak ada unduhan font ekstra.
export const CSS_DEVELOPER = `.tpl-developer{--ink:#0E0E10;--tx:#26262B;--mu:#6C6C75;--ln:#E6E6EA;--bg:#FAFAFA;--tl:#0D9488;--tl-l:#E6F5F3;--m:"JetBrains Mono",ui-monospace,monospace;--b:"DM Sans",system-ui,sans-serif}
.tpl-developer{margin:0;font-family:var(--b);font-size:18px;line-height:1.65;color:var(--tx);background:var(--bg)}
.tpl-developer img{max-width:100%;height:auto;display:block}
.tpl-developer a{color:inherit}
.tpl-developer h1, .tpl-developer h2, .tpl-developer h3{margin:0;line-height:1.1;color:var(--ink);font-weight:800;letter-spacing:-.02em}
.tpl-developer .wrap{max-width:1000px;margin:0 auto;padding:0 22px}
.tpl-developer .skip{position:absolute;left:-999px}
.tpl-developer .skip:focus{left:10px;top:10px;background:var(--tl);color:#fff;padding:8px;z-index:99}
.tpl-developer :focus-visible{outline:2px solid var(--tl);outline-offset:3px;border-radius:4px}
.tpl-developer .hd{position:sticky;top:0;z-index:40;background:rgba(250,250,250,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--ln)}
.tpl-developer .nav{display:flex;align-items:center;justify-content:space-between;height:64px}
.tpl-developer .logo{font-family:var(--m);font-weight:500;text-decoration:none;color:var(--ink)}
.tpl-developer .logo span{color:var(--tl)}
.tpl-developer .menu{display:flex;gap:24px;list-style:none;margin:0;padding:0;font-family:var(--m);font-size:15px}
.tpl-developer .menu a{text-decoration:none}
.tpl-developer .menu a:hover{color:var(--tl)}
.tpl-developer .burger{display:none;background:none;border:1px solid var(--ln);border-radius:6px;padding:6px 10px;cursor:pointer}
.tpl-developer .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:8px;font-weight:600;text-decoration:none;border:1px solid var(--ink);font-family:var(--b);font-size:16px;cursor:pointer}
.tpl-developer .btn-k{background:var(--ink);color:#fff}
.tpl-developer .btn-o{background:transparent;color:var(--ink)}
.tpl-developer .hero{padding:80px 0 60px}
.tpl-developer .av{display:flex;align-items:center;gap:14px;margin-bottom:26px}
.tpl-developer .av img{width:64px;height:64px;border-radius:50%;object-fit:cover}
.tpl-developer .status{display:inline-flex;align-items:center;gap:8px;font-family:var(--m);font-size:14px;background:var(--tl-l);color:var(--tl);border-radius:999px;padding:4px 12px}
.tpl-developer .status i{width:8px;height:8px;border-radius:50%;background:var(--tl)}
.tpl-developer .hero h1{font-size:clamp(40px,6vw,74px)}
.tpl-developer .hero h1 span{color:var(--tl)}
.tpl-developer .hero p{font-size:21px;color:var(--mu);max-width:48ch;margin:22px 0 28px}
.tpl-developer .ac{display:flex;gap:10px;flex-wrap:wrap}
.tpl-developer .term{margin-top:40px;background:var(--ink);color:#C8C8D0;border-radius:12px;padding:20px 22px;font-family:var(--m);font-size:15px;line-height:1.8}
.tpl-developer .term .p{color:var(--tl)}
.tpl-developer .term .c{color:#77777F}
.tpl-developer section{padding:70px 0;border-top:1px solid var(--ln)}
.tpl-developer .sh{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:26px;flex-wrap:wrap}
.tpl-developer .sh h2{font-size:34px}
.tpl-developer .sh .k{font-family:var(--m);font-size:14px;color:var(--tl);display:block;margin-bottom:6px}
.tpl-developer .chips{display:flex;gap:6px;flex-wrap:wrap}
.tpl-developer .chips button{font-family:var(--m);font-size:13px;border:1px solid var(--ln);background:#fff;border-radius:6px;padding:6px 12px;cursor:pointer}
.tpl-developer .chips button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.tpl-developer .proj{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.tpl-developer .pj{background:#fff;border:1px solid var(--ln);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.tpl-developer .pj img{aspect-ratio:16/9;object-fit:cover;width:100%;border-bottom:1px solid var(--ln)}
.tpl-developer .pj .bd{padding:18px;display:flex;flex-direction:column;gap:8px;flex:1}
.tpl-developer .pj h3{font-size:21px}
.tpl-developer .pj p{margin:0;color:var(--mu);font-size:16px}
.tpl-developer .tags{display:flex;gap:6px;flex-wrap:wrap}
.tpl-developer .tags span{font-family:var(--m);font-size:12px;background:var(--bg);border:1px solid var(--ln);border-radius:4px;padding:2px 8px}
.tpl-developer .pj .lk{display:flex;gap:16px;margin-top:auto;font-family:var(--m);font-size:14px}
.tpl-developer .pj .lk a{color:var(--tl)}
.tpl-developer .heat{background:#fff;border:1px solid var(--ln);border-radius:14px;padding:18px;overflow-x:auto}
.tpl-developer .hm{display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;grid-auto-columns:12px;gap:3px;min-width:680px}
.tpl-developer .hm i{border-radius:2px;background:#EBEDF0}
.tpl-developer .hm .l1{background:#B3E4DE}
.tpl-developer .hm .l2{background:#5CC7BA}
.tpl-developer .hm .l3{background:#14A394}
.tpl-developer .hm .l4{background:#0B6E64}
.tpl-developer .hl{display:flex;justify-content:space-between;font-size:14px;color:var(--mu);margin-top:10px;font-family:var(--m)}
.tpl-developer .skills{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.tpl-developer .sk{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:16px}
.tpl-developer .sk h3{font-size:16px;font-family:var(--m);font-weight:500;color:var(--tl);margin-bottom:8px}
.tpl-developer .sk ul{list-style:none;padding:0;margin:0;font-size:16px}
.tpl-developer .sk li{display:flex;justify-content:space-between;padding:4px 0}
.tpl-developer .sk li span{color:var(--mu);font-family:var(--m);font-size:13px}
.tpl-developer .xp{list-style:none;padding:0;margin:0}
.tpl-developer .xp li{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:18px 0;border-bottom:1px dashed var(--ln)}
.tpl-developer .xp time{font-family:var(--m);font-size:14px;color:var(--mu)}
.tpl-developer .xp h3{font-size:19px}
.tpl-developer .xp b{color:var(--tl);font-weight:600}
.tpl-developer .xp p{margin:6px 0 0;color:var(--mu);font-size:16px}
.tpl-developer .ct{background:var(--ink);color:#C8C8D0;border-radius:18px;padding:44px;text-align:center}
.tpl-developer .ct h2{color:#fff;font-size:clamp(32px,4.4vw,52px)}
.tpl-developer .ct p{margin:14px auto 22px;max-width:44ch}
.tpl-developer .mail{display:inline-flex;align-items:center;gap:12px;background:#1C1C21;border:1px solid #33333A;border-radius:10px;padding:10px 12px 10px 18px;font-family:var(--m)}
.tpl-developer .mail button{background:var(--tl);color:#fff;border:0;border-radius:6px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}
.tpl-developer .soc{display:flex;gap:18px;justify-content:center;margin-top:20px;font-family:var(--m);font-size:15px}
.tpl-developer .soc a{color:#fff}
.tpl-developer footer{padding:30px 0;font-family:var(--m);font-size:13px;color:var(--mu);text-align:center}
@media(max-width:760px){
.tpl-developer .menu{display:none}
.tpl-developer .burger{display:block}
.tpl-developer .menu.open{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--bg);padding:18px 22px;border-bottom:1px solid var(--ln);gap:12px}
.tpl-developer .proj, .tpl-developer .skills{grid-template-columns:1fr}
.tpl-developer .xp li{grid-template-columns:1fr;gap:4px}
.tpl-developer .ct{padding:30px 20px}
.tpl-developer .mail{flex-direction:column}
}`;
