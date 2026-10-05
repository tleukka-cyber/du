let lang="ru";
try{lang=localStorage.getItem("du-lang")||"ru"}catch(e){}
const t=k=>T[lang][k];

/* ---------- state ---------- */
const YEARS=["2025-2026","2024-2025","2023-2024","2022-2023","2021-2022"];
const S={view:"settings",page:1,per:30,year:null};

/* ---------- theme ---------- */
function isDark(){const a=document.documentElement.dataset.theme;return a?a==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
function setTheme(m){document.documentElement.dataset.theme=m;try{localStorage.setItem("du-theme",m)}catch(e){}paintTheme()}
function paintTheme(){$("themeBtn").innerHTML=ic(isDark()?"sun":"moon",24,1.5);$("themeBtn").setAttribute("aria-label",isDark()?"Светлая тема":"Тёмная тема")}
try{const m=localStorage.getItem("du-theme");if(m)document.documentElement.dataset.theme=m}catch(e){}
$("themeBtn").onclick=()=>setTheme(isDark()?"light":"dark");

/* ---------- static icons ---------- */
$("eye").innerHTML=ic("eyeOff");
$("bellBtn").innerHTML=ic("bell",24,1.5);
$("userChev").innerHTML=ic("chevDown");
$("toastIc").innerHTML=ic("check",14,3);
paintTheme();

/* ---------- i18n apply ---------- */
function applyLang(){
  document.documentElement.lang=lang==="kz"?"kk":lang;
  document.querySelectorAll("[data-t]").forEach(el=>el.textContent=t(el.dataset.t));
  document.querySelectorAll("[data-tp]").forEach(el=>el.placeholder=t(el.dataset.tp));
  $("langBtn").textContent=lang.toUpperCase();
  document.querySelectorAll("#langMenu button").forEach(b=>b.setAttribute("aria-checked",b.dataset.lang===lang));
  $("grpIcon").innerHTML=ic("spell")+`<span>${t("gradebook")}</span>`;
  $("grpChev").innerHTML=ic("chevUp");
  if(lastErr) showErrors(lastErr);
  if(!$("app").hidden) render();
}

/* ---------- popovers ---------- */
const pops=[["langBtn","langMenu"],["bellBtn","bellMenu"],["userBtn","userMenu"]];
function closePops(except){pops.forEach(([b,m])=>{if(m!==except){$(m).hidden=true;$(b).setAttribute("aria-expanded","false")}})}
pops.forEach(([b,m])=>$(b).onclick=e=>{e.stopPropagation();const o=$(m).hidden;closePops(m);$(m).hidden=!o;$(b).setAttribute("aria-expanded",o)});
document.addEventListener("click",e=>{if(!e.target.closest(".pop"))closePops()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePops()});
document.querySelectorAll("#langMenu button").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem("du-lang",lang)}catch(e){}closePops();applyLang()});

/* ---------- auth ---------- */
let lastErr=null;
$("eye").onclick=e=>{e.preventDefault();const p=$("pass"),show=p.type==="password";p.type=show?"text":"password";$("eye").innerHTML=ic(show?"eye":"eyeOff");$("eye").setAttribute("aria-pressed",show)};
function setField(id,msg,on){$("f-"+id).classList.toggle("error",!!on);$("h-"+id).textContent=msg?t(msg):"";$(id).setAttribute("aria-invalid",!!on)}
function showErrors(e){lastErr=e;setField("login",e.login,e.lOn);setField("pass",e.pass,e.pOn);$("alert").classList.toggle("show",!!e.alert)}
function reset(){showErrors({});lastErr=null}
["login","pass"].forEach(id=>$(id).addEventListener("input",()=>{setField(id);$("alert").classList.remove("show");lastErr=null}));
$("form").onsubmit=e=>{
  e.preventDefault();
  const l=$("login").value.trim(),p=$("pass").value;reset();
  if(!l||!p){showErrors({login:!l&&"emptyLogin",lOn:!l,pass:!p&&"emptyPass",pOn:!p});(!l?$("login"):$("pass")).focus();return}
  const b=$("submit");b.disabled=true;b.innerHTML='<span class="spinner"></span>';
  setTimeout(()=>{
    b.disabled=false;b.textContent=t("signin");
    const u=l==="admin",pw=p==="admin123";
    if(u&&pw){enter();return}
    if(!u&&!pw){showErrors({lOn:1,pOn:1,alert:1});$("login").focus()}
    else if(!u){showErrors({login:"errLogin",lOn:1});$("login").focus()}
    else{showErrors({pass:"errPass",pOn:1});$("pass").focus()}
  },600);
};
$("demo").onclick=enter;
function enter(){reset();$("auth").hidden=true;$("app").hidden=false;S.view="settings";S.year=null;S.page=1;render()}
$("logout").onclick=()=>{closePops();$("app").hidden=true;$("auth").hidden=false;$("pass").value="";$("login").focus()};

/* ---------- sidebar ---------- */
$("grpHead").onclick=()=>{const g=$("grp"),o=g.dataset.open==="true";g.dataset.open=!o;$("grpHead").setAttribute("aria-expanded",!o)};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{S.view=b.dataset.view;S.year=null;render()});

/* ---------- views ---------- */
function render(){
  document.querySelectorAll(".tab").forEach(b=>{if(b.dataset.view===S.view)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  const m=$("main");
  const head=(title)=>`<section class="headbar"><span class="eyebrow">${t("gradebook")}</span><h2>${title}</h2></section>`;
  if(S.view==="journal"){
    m.innerHTML=head(t("journal"))+`<div class="empty-state"><b>${t("soonT")}</b>${t("soonD")}</div>`;return;
  }
  if(S.year){
    m.innerHTML=`<nav class="crumbs"><button id="crumbBack">${t("settings")}</button><span>/</span><span>${S.year}</span></nav>`+head(t("openYear")(S.year))+`<div class="empty-state">${t("yearSoon")}</div>`;
    $("crumbBack").onclick=()=>{S.year=null;render()};return;
  }
  const total=YEARS.length,pages=Math.max(1,Math.ceil(total/S.per));
  S.page=Math.min(S.page,pages);
  const rows=YEARS.slice((S.page-1)*S.per,S.page*S.per);
  m.innerHTML=head(t("settings"))+`
  <section class="panel">
    <div class="total">${t("total")}: ${total}</div>
    <div class="table-wrap"><table>
      <thead><tr><th>${t("year")}</th><th class="act">${t("actions")}</th></tr></thead>
      <tbody>${rows.map(y=>`<tr><td><button class="year" data-y="${y}">${y}</button></td><td class="act"><button class="pill" data-copy="${y}">${t("copy")}</button></td></tr>`).join("")}</tbody>
    </table></div>
    <div class="pager">
      <label class="per">${t("perPage")}
        <span class="select"><select id="per">${[10,30,50].map(n=>`<option ${n===S.per?"selected":""}>${n}</option>`).join("")}</select>${ic("updown")}</span>
      </label>
      <nav class="pages" aria-label="Страницы">${pager(pages)}</nav>
    </div>
  </section>`;
  m.querySelectorAll(".year").forEach(b=>b.onclick=()=>{S.year=b.dataset.y;render()});
  m.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>toast(t("copied")(b.dataset.copy)));
  $("per").onchange=e=>{S.per=+e.target.value;S.page=1;render()};
  m.querySelectorAll("[data-pg]").forEach(b=>b.onclick=()=>{S.page=+b.dataset.pg;render()});
}
function pager(n){
  const p=S.page,btn=(to,html,label,dis)=>`<button class="pg" data-pg="${to}" aria-label="${label}" ${dis?"disabled":""}>${html}</button>`;
  let nums=[];
  if(n<=7) nums=[...Array(n)].map((_,i)=>i+1);
  else if(p<=4) nums=[1,2,3,4,5,"…",n];
  else if(p>=n-3) nums=[1,"…",n-4,n-3,n-2,n-1,n];
  else nums=[1,"…",p-1,p,p+1,"…",n];
  return btn(1,ic("chevsLeft",20),"Первая",p===1)+btn(p-1,ic("chevLeft",20),"Назад",p===1)
   +nums.map(x=>x==="…"?`<span class="pg dots" aria-hidden="true">${ic("dots",20)}</span>`:`<button class="pg" data-pg="${x}" ${x===p?'aria-current="page"':""}>${x}</button>`).join("")
   +btn(p+1,ic("chevRight",20),"Вперёд",p===n)+btn(n,ic("chevsRight",20),"Последняя",p===n);
}
let tt;function toast(msg){$("toastText").textContent=msg;$("toast").classList.add("show");clearTimeout(tt);tt=setTimeout(()=>$("toast").classList.remove("show"),2600)}

applyLang();
