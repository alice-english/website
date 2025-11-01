/* 
  Paste your data into CANDY_DATA as an array of objects with:
  { name: string, weight: number (grams), count: number }
  Example shape matches your file, but per your request we leave it blank.
  const CANDY_DATA = [ ... ];
*/
const CANDY_DATA = JSON.parse(`

[

{
"name": "Butterfingers",
"weight":77,
"count": 4
},
{
"name": "Payday",
"weight": 60,
"count": 4
},
{
"name": "KitKat",
"weight": 411,
"count": 36
},
{
"name": "Nerds",
"weight": 273,
"count": 18
},
{
"name": "Three Musketeers",
"weight": 33,
"count": 5
},
{
"name": "Rolo",
"weight": 42,
"count": 9
},
{
"name": "Twix",
"weight": 480,
"count": 40
},
{
"name": "Reeses",
"weight": 335,
"count": 25
},
{
"name": "Lollipops",
"weight": 478,
"count": 61
},
{
"name": "Milky Way",
"weight": 208,
"count": 18
},
{
"name": "Twizzlers",
"weight": 98,
"count": 12
},
{
"name": "Hershey",
"weight": 218,
"count": 22
},
{
"name": "Misc Taffy",
"weight": 67,
"count": 8
},
{
"name": "Skittles",
"weight": 166,
"count": 8
},
{
"name": "Almond Joys",
"weight": 51,
"count": 3
},
{
"name": "Gummies",
"weight": 448,
"count": 35
},
{
"name": "Snickers",
"weight": 423,
"count": 31
},
{
"name": "M&M",
"weight": 219,
"count": 15
},
{
"name": "Starburst",
"weight": 71,
"count": 8
},
{
"name": "Peanut M&M",
"weight": 63,
"count": 3
},
{
"name": "Jolly Rancher",
"weight": 61,
"count": 10
},
{
"name": "Milk Duds",
"weight": 57,
"count": 4
},
{
"name": "Toxic Waste",
"weight": 3,
"count": 1
},
{
"name": "Kinder Mini",
"weight": 12,
"count": 2
},
{
"name": "Fruit Chews",
"weight": 18,
"count": 3
},
{
"name": "Juice",
"weight": 561,
"count": 3
},
{
"name": "Whoopers",
"weight": 14,
"count": 2
},
{
"name": "Non-food",
"weight": 53,
"count": 13
}
]`);



// ---- Category inference ----
const CHOC_WORDS = ["kitkat","twix","snickers","milky","hershey","reese","m&m","rolo","three musketeers","almond joy","milk duds","whoppers","payday","butterfinger","kinder","mr. goodbar","dove","godiva"];
const FRUIT_WORDS = ["skittles","starburst","nerds","twizzlers","jolly rancher","gummies","taffy","fruit","toxic waste","airheads","smarties","sour patch","lifesavers","hi-chew"];

function isJuice(name){
  return (name || "").toLowerCase().includes("juice");
}

function inferCategory(name){
  const s = (name||"").toLowerCase();
  if (CHOC_WORDS.some(w => s.includes(w))) return "chocolate";
  if (FRUIT_WORDS.some(w => s.includes(w))) return "fruity";

  return "other";
}

// ---- Utils ----
const $ = sel => document.querySelector(sel);
function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
function fmt(n, d=0){ return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:d, minimumFractionDigits:d}); }
function sum(arr, f){ return arr.reduce((a,b)=>a+(f?f(b):b),0); }
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi,x)); }

// Tooltip
const tip = $("#tooltip");
function showTip(html, x, y){ tip.innerHTML = html; tip.hidden = false; tip.style.left = x+"px"; tip.style.top = (y-8)+"px"; }
function hideTip(){ tip.hidden = true; }

// ---- Data transforms ----
function withDerived(data){
  return (data||[]).map(d => ({
    ...d,
    avg: d.count ? d.weight / d.count : 0,
    category: inferCategory(d.name)
  }));
}
function filtered(data){
  const activeCats = new Set(
    Array.from(document.querySelectorAll(".cat-filter"))
      .filter(cb => cb.checked)
      .map(cb => cb.value)
  );
  const juiceOn = document.getElementById("juiceFilter")?.checked ?? true;

  return data.filter(d =>
    activeCats.has(d.category) &&
    (juiceOn || !isJuice(d.name)) // if Juice is OFF, exclude juice items
  );
}

function stats(rows){
  const totalPieces = sum(rows, r=>r.count||0);
  const totalWeight = sum(rows, r=>r.weight||0);
  const avgWeight = totalPieces ? totalWeight/totalPieces : 0;
  return { totalPieces, totalWeight, avgWeight, uniqueTypes: rows.length };
}

// Flat palette
const CAT_FILL = { chocolate: "#ff7a1a", fruity: "#7b61ff", other: "#ffb300", juice: "#ffb300" };
// extra colors to cycle donut slices (flat)
const SLICE_COLORS = ["#ff7a1a","#7b61ff","#ffb300","#2ed17a","#f97316","#a78bfa","#f59e0b","#10b981"];

// ---- Core renderers ----
function renderHero(s){
  $("#totalPieces").textContent = fmt(s.totalPieces);
  $("#totalWeight").textContent = `${fmt(s.totalWeight)} g`;
  $("#avgWeight").textContent = `${fmt(s.avgWeight,1)} g`;
  $("#uniqueTypes").textContent = fmt(s.uniqueTypes);
}
function renderMVP(containerId, d, line){
  $(containerId).innerHTML = `
    <div class="badge">MVP</div>
    <div class="text">
      <div class="name">${d ? d.name : "—"}</div>
      <div class="sub">${d ? line(d) : "No data."}</div>
    </div>
  `;
}
function renderTable(rows){
  const tbody = $("#dataTable tbody");
  clear(tbody);
  rows.forEach(d=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.name}</td>
      <td class="num">${fmt(d.count)}</td>
      <td class="num">${fmt(d.weight)}</td>
      <td class="num">${fmt(d.avg,1)}</td>
      <td>${d.category}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---- SVG helpers ----
function svgEl(tag){ return document.createElementNS("http://www.w3.org/2000/svg", tag); }
function attachTip(node, html){
  node.addEventListener("mousemove", e => showTip(html, e.clientX, e.clientY));
  node.addEventListener("mouseleave", hideTip);
}

// ---- Bars (count) ----
function renderBarChart(svgId, rows){
  const svg = $(svgId); clear(svg);
  const P = {t:22,r:64,b:36,l:170};              // more right padding to avoid clipping
  const W=800, H=Math.max(120, 30*rows.length + P.t + P.b);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const maxVal = Math.max(1, ...rows.map(d=>d.count));
  const barH = 20;
  const x = v => P.l + (W-P.l-P.r)*(v/maxVal);
  const y = i => P.t + i*(barH+10);

  rows.forEach((d,i)=>{
    const rect = svgEl("rect");
    rect.setAttribute("class","bar");
    rect.setAttribute("x", P.l);
    rect.setAttribute("y", y(i));
    rect.setAttribute("width", Math.max(1, x(d.count)-P.l));
    rect.setAttribute("height", barH);
    rect.setAttribute("fill", CAT_FILL[d.category] || SLICE_COLORS[i%SLICE_COLORS.length]);
    attachTip(rect, `<strong>${d.name}</strong><br/>${fmt(d.count)} pieces`);
    svg.appendChild(rect);

    // label left
    const name = svgEl("text");
    name.setAttribute("x", P.l-8); name.setAttribute("y", y(i)+barH*0.75);
    name.setAttribute("text-anchor","end"); name.textContent = d.name;
    svg.appendChild(name);

    // value right, clamped to stay inside viewBox
    const vx = clamp(x(d.count) + 8, P.l + 24, W - P.r + 8);
    const val = svgEl("text");
    val.setAttribute("x", vx); val.setAttribute("y", y(i)+barH*0.75);
    val.textContent = fmt(d.count);
    svg.appendChild(val);
  });
}

// ---- Donut (weight share) with measured labels + safe clamping ----
function renderDonut(svgId, rows){
  const svg = document.querySelector(svgId);
  while (svg.lastChild) svg.removeChild(svg.lastChild);

  // Wider canvas for labels
  const W = 640, H = 460;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const cx = W/2, cy = H/2;
  const r = 160, inner = 98;
  const PAD = 10;                 // minimum margin from edges
  const LEADER_OUT = 56;          // label distance from arc

  const total = Math.max(1, rows.reduce((a,b)=>a+(b.weight||0),0));
  let ang = -Math.PI/2;

  rows.forEach((d,i)=>{
    const w = d.weight || 0;
    const slice = (w/total) * Math.PI*2;
    const a0 = ang, a1 = ang + slice; ang = a1;
    const large = slice > Math.PI ? 1 : 0;

    // Arc path
    const p1=[cx + r*Math.cos(a0), cy + r*Math.sin(a0)];
    const p2=[cx + r*Math.cos(a1), cy + r*Math.sin(a1)];
    const p3=[cx + inner*Math.cos(a1), cy + inner*Math.sin(a1)];
    const p4=[cx + inner*Math.cos(a0), cy + inner*Math.sin(a0)];

    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("class","slice");
    path.setAttribute("fill", SLICE_COLORS[i % SLICE_COLORS.length]);
    path.setAttribute("d", `M ${p1} A ${r} ${r} 0 ${large} 1 ${p2} L ${p3} A ${inner} ${inner} 0 ${large} 0 ${p4} Z`);
    attachTip(path, `<strong>${d.name}</strong><br/>${fmt(w)} g (${fmt((w/total)*100,1)}%)`);
    svg.appendChild(path);

    // Labels for non-tiny slices
    const pct = w/total;
    if (pct >= 0.035) {
      const mid = a0 + slice/2;
      const lx = cx + (r + 14) * Math.cos(mid);
      const ly = cy + (r + 14) * Math.sin(mid);
      let tx = cx + (r + LEADER_OUT) * Math.cos(mid);
      let ty = cy + (r + LEADER_OUT) * Math.sin(mid);

      // Create text first (hidden) to measure true width
      const textEl = document.createElementNS("http://www.w3.org/2000/svg","text");
      textEl.textContent = `${d.name} — ${fmt(pct*100,1)}%`;
      textEl.setAttribute("visibility","hidden");
      textEl.setAttribute("x", 0);
      textEl.setAttribute("y", 0);
      svg.appendChild(textEl);
      const { width: tw } = textEl.getBBox();

      // Decide side and clamp so the text never overflows the viewBox
      const onRight = Math.cos(mid) >= 0;
      if (onRight) {
        // start-anchored text extends to the right
        tx = Math.min(tx, W - PAD - tw);
        textEl.setAttribute("text-anchor","start");
      } else {
        // end-anchored text extends to the left
        tx = Math.max(tx, PAD + tw);
        textEl.setAttribute("text-anchor","end");
      }

      // Now position text and show it
      textEl.setAttribute("x", tx);
      textEl.setAttribute("y", ty);
      textEl.removeAttribute("visibility");

      // Leader line to the clamped text point
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("x1", lx); line.setAttribute("y1", ly);
      line.setAttribute("x2", tx); line.setAttribute("y2", ty);
      line.setAttribute("stroke", "#cbd5e1"); line.setAttribute("stroke-width","1");
      svg.insertBefore(line, textEl); // keep line under text
    }
  });

  // Center labels
  const t1 = document.createElementNS("http://www.w3.org/2000/svg","text");
  t1.setAttribute("x", cx); t1.setAttribute("y", cy-4);
  t1.setAttribute("text-anchor","middle"); t1.textContent = "Total Weight";
  svg.appendChild(t1);

  const t2 = document.createElementNS("http://www.w3.org/2000/svg","text");
  t2.setAttribute("x", cx); t2.setAttribute("y", cy+18);
  t2.setAttribute("text-anchor","middle"); t2.textContent = `${fmt(total)} g`;
  svg.appendChild(t2);
}



// ---- Bubble (pieces) ----
function renderBubble(svgId, rows){
  const svg = $(svgId); clear(svg);
  const W=800,H=420,pad=40; svg.setAttribute("viewBox",`0 0 ${W} ${H}`);

  const maxCount = Math.max(1, ...rows.map(d=>d.count));
  const r = d => 14 + 36 * (d.count / maxCount);

  const placed = [];
  function collide(x,y,R){ return placed.some(p => ((p.x-x)**2 + (p.y-y)**2) < (p.r+R+4)**2); }
  rows.forEach(d=>{
    let angle=0,rad=20,X=W/2,Y=H/2,R=r(d),tries=0;
    while(tries<220 && (collide(X,Y,R) || X-R<pad || X+R>W-pad || Y-R<pad || Y+R>H-pad)){
      angle+=0.45; rad+=4; X=W/2 + rad*Math.cos(angle); Y=H/2 + rad*Math.sin(angle); tries++;
    }
    placed.push({x:X,y:Y,r:R,d});
  });

  placed.forEach((p,i)=>{
    const c = svgEl("circle");
    c.setAttribute("class","bubble");
    c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", p.r);
    c.setAttribute("fill", CAT_FILL[p.d.category] || SLICE_COLORS[i%SLICE_COLORS.length]);
    c.setAttribute("stroke","rgba(255,255,255,.25)"); c.setAttribute("stroke-width","1");
    attachTip(c, `<strong>${p.d.name}</strong><br/>${fmt(p.d.count)} pcs, ${fmt(p.d.weight)} g`);
    svg.appendChild(c);

    const label = svgEl("text");
    label.setAttribute("x", p.x); label.setAttribute("y", p.y+4);
    label.setAttribute("text-anchor","middle"); label.setAttribute("font-size","11");
    label.textContent = p.d.name.length>16 ? p.d.name.slice(0,15)+"…" : p.d.name;
    svg.appendChild(label);
  });
}

// ---- Lollipop (avg) ----
function renderLollipop(svgId, rows){
  const svg = $(svgId); clear(svg);
  const P={t:28,r:24,b:48,l:180};
  const W=800,H=Math.max(120, rows.length*26 + P.t + P.b);
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);

  const maxAvg = Math.max(1, ...rows.map(d=>d.avg));
  const x = v => P.l + (W-P.l-P.r) * (v/maxAvg);
  const y = i => P.t + i*24;

  rows.forEach((d,i)=>{
    const yy = y(i);
    const stem = svgEl("line");
    stem.setAttribute("class","stem");
    stem.setAttribute("x1", P.l); stem.setAttribute("y1", yy);
    stem.setAttribute("x2", x(d.avg)); stem.setAttribute("y2", yy);
    stem.setAttribute("stroke", CAT_FILL[d.category]); stem.setAttribute("stroke-width","3");
    svg.appendChild(stem);

    const dot = svgEl("circle");
    dot.setAttribute("class","dot");
    dot.setAttribute("cx", x(d.avg)); dot.setAttribute("cy", yy); dot.setAttribute("r","6.5");
    dot.setAttribute("fill", CAT_FILL[d.category]);
    svg.appendChild(dot);

    const name = svgEl("text");
    name.setAttribute("x", P.l - 10); name.setAttribute("y", yy+4);
    name.setAttribute("text-anchor","end"); name.textContent = d.name;
    svg.appendChild(name);

    const val = svgEl("text");
    val.setAttribute("x", clamp(x(d.avg)+10, P.l+20, W-P.r)); val.setAttribute("y", yy+4);
    val.textContent = fmt(d.avg,1)+" g";
    svg.appendChild(val);
  });
}

// ---- Stacked by category (counts) ----
function renderStacked(svgId, rows){
  const svg = $(svgId); clear(svg);
  const P={t:28,r:24,b:48,l:60}; const W=800,H=420;
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);

  const cats = ["chocolate","fruity","other", "juice"];
  const byCat = cats.map(c => ({ cat:c, count: sum(rows.filter(r=>r.category===c), r=>r.count) }));
  const total = Math.max(1, sum(byCat, d=>d.count));
  let x0 = P.l; const barW = W - P.l - P.r, barH = 240, y0 = P.t + 40;

  byCat.forEach(d=>{
    const w = barW * (d.count/total);
    const rect = svgEl("rect");
    rect.setAttribute("class","stack");
    rect.setAttribute("x", x0); rect.setAttribute("y", y0);
    rect.setAttribute("width", Math.max(1,w)); rect.setAttribute("height", barH);
    rect.setAttribute("fill", CAT_FILL[d.cat]);
    svg.appendChild(rect);

    const label = svgEl("text");
    label.setAttribute("x", x0 + w/2); label.setAttribute("y", y0 + barH/2);
    label.setAttribute("text-anchor","middle");
    label.textContent = `${d.cat} — ${fmt(d.count)}`;
    svg.appendChild(label);

    x0 += w;
  });

  const title = svgEl("text");
  title.setAttribute("x", P.l); title.setAttribute("y", y0 - 12);
  title.textContent = `Total: ${fmt(total)} pieces`;
  svg.appendChild(title);
}

// ---- Heatmap (count vs weight) ----
function renderHeatmap(svgId, rows){
  const svg = $(svgId); clear(svg);
  const P={t:32,r:24,b:80,l:200};
  const W=800,H=Math.max(160, rows.length*26 + P.t + P.b);
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);

  const maxCount = Math.max(1, ...rows.map(d=>d.count));
  const maxWeight = Math.max(1, ...rows.map(d=>d.weight));
  const y = i => P.t + i*24;
  const cols = [
    { key:"count", label:"Count", max:maxCount },
    { key:"weight", label:"Weight", max:maxWeight }
  ];
  const colW = (W - P.l - P.r) / cols.length;
  const cellH = 18;

  cols.forEach((c, j)=>{
    const th = svgEl("text");
    th.setAttribute("x", P.l + j*colW + colW/2);
    th.setAttribute("y", P.t - 8);
    th.setAttribute("text-anchor","middle");
    th.textContent = c.label;
    svg.appendChild(th);
  });

  rows.forEach((d,i)=>{
    const name = svgEl("text");
    name.setAttribute("x", P.l - 10);
    name.setAttribute("y", y(i) + cellH*0.9);
    name.setAttribute("text-anchor","end");
    name.textContent = d.name;
    svg.appendChild(name);

    cols.forEach((c, j)=>{
      const val = d[c.key] || 0;
      const intensity = val / (c.max || 1);
      const rect = svgEl("rect");
      rect.setAttribute("class","cell");
      rect.setAttribute("x", P.l + j*colW);
      rect.setAttribute("y", y(i));
      rect.setAttribute("width", colW - 6);
      rect.setAttribute("height", cellH);
      rect.setAttribute("fill", CAT_FILL[d.category] || "#888");
      rect.setAttribute("fill-opacity", clamp(0.25 + 0.75*intensity, 0.25, 1));
      svg.appendChild(rect);

      const t = svgEl("text");
      t.setAttribute("x", P.l + j*colW + (colW-6)/2);
      t.setAttribute("y", y(i)+cellH*0.8);
      t.setAttribute("text-anchor","middle");
      t.textContent = fmt(val);
      svg.appendChild(t);
    });
  });
}

// ---- Main flow ----
function renderAll(raw){
  const derived = withDerived(raw);
  const rows = filtered(derived);

  renderHero(stats(rows));

  // MVPs
  const mCount = [...rows].sort((a,b)=>b.count-a.count)[0];
  const mWeight = [...rows].sort((a,b)=>b.weight-a.weight)[0];
  renderMVP("#mvpCount", mCount, d=>`${fmt(d.count)} pieces`);
  renderMVP("#mvpWeight", mWeight, d=>`${fmt(d.weight)} g total`);

  // Charts
  renderBarChart("#barChart", [...rows].sort((a,b)=>a.count-b.count));
  renderDonut("#donutChart", [...rows].sort((a,b)=>b.weight-a.weight));
  renderBubble("#bubbleChart", [...rows].sort((a,b)=>b.count-a.count));
  renderLollipop("#lollipopChart", [...rows].sort((a,b)=>a.avg-b.avg));
  renderStacked("#stackedChart", rows);
  renderHeatmap("#heatmapChart", [...rows].sort((a,b)=>a.name.localeCompare(b.name)));

  renderTable(rows);
}

// ---- Wire up ----
function init(){
  const cbs = document.querySelectorAll(".cat-filter");
  cbs.forEach(cb => cb.addEventListener("change", ()=>renderAll(CANDY_DATA)));

  // NEW: Juice toggle
  const juiceCb = document.getElementById("juiceFilter");
  if (juiceCb){
    juiceCb.addEventListener("change", ()=>renderAll(CANDY_DATA));
    juiceCb.checked = false; // default OFF on load
  }

  document.getElementById("resetBtn").addEventListener("click", ()=>{
    cbs.forEach(cb=>cb.checked = true);  // categories back ON
    if (juiceCb) juiceCb.checked = false; // Juice stays OFF by default
    renderAll(CANDY_DATA);
  });

  document.addEventListener("scroll", hideTip);
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") hideTip(); });

  renderAll(CANDY_DATA);
}

document.addEventListener("DOMContentLoaded", init);
