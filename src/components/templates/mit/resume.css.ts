// CSS asli template MIT (mmrahmanbappi/100-free-html-templates),
// dibatasi ke .tpl-resume oleh scripts scope-css.py.
// Font dimuat lewat @import di baris pertama style ini.
export const CSS_RESUME = `@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&family=Public+Sans:wght@400;600;700&display=swap");
.tpl-resume{--nv:#1F3A5F;--nv-l:#EAF0F7;--ac:#C2782F;--tx:#26303C;--mu:#66707D;--ln:#DDE3EA;--s:"Source Serif 4",Georgia,serif;--b:"Public Sans",system-ui,sans-serif}
.tpl-resume{margin:0;font-family:var(--b);font-size:16px;line-height:1.6;color:var(--tx);background:#EEF1F5}
.tpl-resume img{max-width:100%;height:auto;display:block}
.tpl-resume a{color:inherit}
.tpl-resume h1, .tpl-resume h2, .tpl-resume h3{margin:0;color:var(--nv);line-height:1.15}
.tpl-resume .skip{position:absolute;left:-999px}
.tpl-resume .skip:focus{left:10px;top:10px;background:var(--ac);color:#fff;padding:8px;z-index:99}
.tpl-resume :focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.tpl-resume .bar{position:sticky;top:0;z-index:30;background:var(--nv);color:#fff}
.tpl-resume .bar .in{max-width:980px;margin:0 auto;padding:10px 22px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.tpl-resume .bar a, .tpl-resume .bar button{background:#fff;color:var(--nv);border:0;border-radius:6px;padding:8px 14px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none}
.tpl-resume .bar .g{display:flex;gap:8px}
.tpl-resume .menu{display:flex;gap:18px;list-style:none;margin:0;padding:0;font-size:14px}
.tpl-resume .menu a{background:none;color:#fff;padding:0;font-weight:600}
.tpl-resume .burger{display:none}
.tpl-resume .page{max-width:980px;margin:28px auto 40px;background:#fff;box-shadow:0 20px 50px -30px rgba(31,58,95,.4);display:grid;grid-template-columns:300px 1fr}
.tpl-resume .side{background:var(--nv-l);padding:34px 28px}
.tpl-resume .side img{width:140px;height:140px;border-radius:50%;object-fit:cover;margin-bottom:18px;border:4px solid #fff}
.tpl-resume .side h2{font-size:14px;letter-spacing:.12em;text-transform:uppercase;font-family:var(--b);margin:26px 0 10px;color:var(--nv)}
.tpl-resume .side ul{list-style:none;padding:0;margin:0;font-size:15px}
.tpl-resume .side li{margin-bottom:8px}
.tpl-resume .sk{margin-bottom:10px;font-size:15px}
.tpl-resume .sk .t{height:6px;background:#fff;border-radius:3px;margin-top:4px;overflow:hidden}
.tpl-resume .sk .t i{display:block;height:100%;background:var(--nv)}
.tpl-resume .lang{display:flex;justify-content:space-between;font-size:15px;margin-bottom:6px}
.tpl-resume .lang span{color:var(--mu)}
.tpl-resume .main{padding:36px 38px}
.tpl-resume .main h1{font-family:var(--s);font-size:44px}
.tpl-resume .role{font-size:19px;color:var(--ac);font-weight:700;margin:4px 0 16px}
.tpl-resume .sum{font-size:17px;color:#3B4553;border-left:3px solid var(--ac);padding-left:14px;margin:0 0 26px}
.tpl-resume .main h2{font-family:var(--s);font-size:24px;border-bottom:2px solid var(--nv);padding-bottom:6px;margin:30px 0 14px}
.tpl-resume .job{margin-bottom:20px}
.tpl-resume .job .top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.tpl-resume .job h3{font-size:18px;font-family:var(--b)}
.tpl-resume .job .co{color:var(--ac);font-weight:600}
.tpl-resume .job time{color:var(--mu);font-size:14px;white-space:nowrap}
.tpl-resume .job ul{margin:8px 0 0;padding-left:18px}
.tpl-resume .job li{margin-bottom:4px}
.tpl-resume .edu{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.tpl-resume .edu b{display:block}
.tpl-resume .edu span{color:var(--mu);font-size:15px}
.tpl-resume .refs{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.tpl-resume .refs div{background:var(--nv-l);border-radius:8px;padding:14px;font-size:15px}
.tpl-resume .refs b{display:block;color:var(--nv)}
.tpl-resume .note{max-width:980px;margin:0 auto 40px;padding:0 22px;color:var(--mu);font-size:14px;text-align:center}
@media(max-width:820px){
.tpl-resume .page{grid-template-columns:1fr;margin:0}
.tpl-resume .main{padding:26px 22px}
.tpl-resume .refs{grid-template-columns:1fr}
.tpl-resume .menu{display:none}
}
@media print{
.tpl-resume{background:#fff}
.tpl-resume .bar, .tpl-resume .note, .tpl-resume #template-bar, .tpl-resume .skip{display:none!important}
.tpl-resume .page{box-shadow:none;margin:0;max-width:none}
.tpl-resume a{text-decoration:none}
@page{margin:12mm}
}`;
