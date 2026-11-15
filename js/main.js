/* Indian Heritage Learning Hub: interactive features. Plain JavaScript, no libraries. */
(function () {
  "use strict";
  var T = window.I18N || {};
  var t = function (k, d) { return T[k] != null ? T[k] : d; };
  /* Path to the site root, so pictures load from language folders (/hi/, /ta/ ...) too */
  var mainScript = document.querySelector('script[src$="js/main.js"]');
  var BASE = mainScript ? mainScript.getAttribute("src").replace("js/main.js", "") : "";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menuBtn"), scrim = $("#scrim");
  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
  if (scrim) scrim.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* Open the right lesson when a link points to it (e.g. history.html#maurya) */
  function openHash() {
    if (!location.hash) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView(); }
  }
  openHash();
  window.addEventListener("hashchange", openHash);

  /* ---------- Quizzes ---------- */
  function buildQuiz(box, items) {
    var score = 0, answered = 0;
    box.innerHTML = "";
    items.forEach(function (it, qi) {
      var wrap = document.createElement("div");
      wrap.style.marginBottom = "16px";
      wrap.innerHTML = '<div class="q">' + (qi + 1) + ". " + it.q + '</div><div class="opts"></div><div class="fb" aria-live="polite"></div>';
      var opts = $(".opts", wrap), fb = $(".fb", wrap), done = false;
      it.o.forEach(function (o, oi) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = o;
        b.addEventListener("click", function () {
          if (done) return;
          done = true; answered++;
          if (oi === it.a) { b.classList.add("right"); score++; fb.textContent = t("correct", "Correct!") + " " + (it.e || ""); }
          else { b.classList.add("wrong"); opts.children[it.a].classList.add("right"); fb.textContent = t("wrong", "Not quite.") + " " + (it.e || ""); }
          if (answered === items.length) {
            scoreEl.textContent = t("score", "You scored {s} out of {n}.").replace("{s}", score).replace("{n}", items.length) + " " + (score === items.length ? t("perfect", "Wonderful!") : t("tried", "Well done for trying!"));
            again.style.display = "inline-block";
          }
        });
        opts.appendChild(b);
      });
      box.appendChild(wrap);
    });
    var scoreEl = document.createElement("p"); scoreEl.className = "score"; box.appendChild(scoreEl);
    var again = document.createElement("button"); again.className = "btn ghost"; again.type = "button";
    again.textContent = t("again", "Try again"); again.style.display = "none";
    again.addEventListener("click", function () { buildQuiz(box, items); });
    box.appendChild(again);
  }
  $$(".quiz[data-quiz]").forEach(function (box) {
    try { buildQuiz(box, JSON.parse(box.getAttribute("data-quiz"))); } catch (e) { box.textContent = t("quizErr", "Quiz could not load."); }
  });

  /* ---------- Generic tag filters (Teerth Sthal, recipes) ---------- */
  function tagFilter(barSel, itemSel, emptySel) {
    var bar = $(barSel); if (!bar) return;
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      $$("button", bar).forEach(function (x) { x.classList.toggle("on", x === b); });
      var t = b.getAttribute("data-t"), shown = 0;
      $$(itemSel).forEach(function (el) {
        var ok = t === "all" || (" " + el.getAttribute("data-t") + " ").indexOf(" " + t + " ") > -1;
        el.style.display = ok ? "" : "none"; if (ok) shown++;
      });
      if (emptySel && $(emptySel)) $(emptySel).style.display = shown ? "none" : "block";
    });
  }
  tagFilter("#teerthFilters", "#teerthGrid > .card");
  tagFilter("#dietFilters", "#recipeGrid > .recipe", "#recipeEmpty");

  /* ---------- Festivals Compass ---------- */
  var MONTHS = t("months", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]);
  var festGrid = $("#festGrid"), festJump = null;
  if (festGrid) {
    var month = String(new Date().getMonth()), trad = "all";
    var render = function () {
      var shown = 0;
      $$(".fest-card", festGrid).forEach(function (c) {
        var okM = month === "all" || c.getAttribute("data-month") === month;
        var okT = trad === "all" || (" " + c.getAttribute("data-tags") + " ").indexOf(" " + trad + " ") > -1;
        c.classList.toggle("show", okM && okT); if (okM && okT) shown++;
      });
      $$(".month-tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-m") === month); });
      $("#monthTitle").textContent = month === "all" ? t("allYear", "All year") : MONTHS[+month];
      $("#festEmpty").style.display = shown ? "none" : "block";
    };
    $(".month-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (b) { month = b.getAttribute("data-m"); render(); }
    });
    $(".filters").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      trad = b.getAttribute("data-t");
      $$(".filters button").forEach(function (x) { x.classList.toggle("on", x === b); });
      render();
    });
    render();
    festJump = function (idx) {
      var card = document.getElementById("fest-" + idx); if (!card) return;
      month = card.getAttribute("data-month"); trad = "all";
      $$(".filters button").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-t") === "all"); });
      render();
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      card.classList.add("flash"); setTimeout(function () { card.classList.remove("flash"); }, 2200);
    };
  }

  /* ---------- Live festival calendar ---------- */
  var festCal = $("#festCal");
  if (festCal && window.FEST_DATES) {
    var CL = {}; try { CL = JSON.parse(festCal.getAttribute("data-l")); } catch (e) {}
    var lab = function (k, d) { return CL[k] != null ? CL[k] : d; };
    var notes = CL.notes || {};
    var lang = document.documentElement.lang || "en";
    var loc = lang === "en" ? "en-IN" : lang + "-IN";
    var fmt = function (d, o) { try { return d.toLocaleDateString(loc, o); } catch (e) { return d.toDateString(); } };
    var toD = function (s) { var a = s.split("-"); return new Date(+a[0], +a[1] - 1, +a[2]); };
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var nameOf = function (ev) {
      var c = document.getElementById("fest-" + ev.f), h = c && $("h3", c);
      return h ? h.textContent : "";
    };
    var EV = window.FEST_DATES.map(function (ev) {
      var o = { f: ev.f, s: ev.s, m: ev.m, d0: toD(ev.d), d1: toD(ev.e || ev.d), n: ev.n ? (notes[ev.n] || ev.n) : "" };
      o.name = nameOf(o); return o;
    }).sort(function (a, b) { return a.d0 - b.d0; });
    var days = function (a) { return Math.round((a - today) / 86400000); };
    var when = function (ev) {
      if (ev.d0 <= today && ev.d1 >= today) return lab("istoday", "today!");
      var n = days(ev.d0);
      return n === 1 ? lab("tomorrow", "tomorrow") : lab("indays", "in {n} days").replace("{n}", n);
    };
    var dateTxt = function (ev, long) {
      var o = long ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { weekday: "short", day: "numeric", month: "short" };
      var t1 = fmt(ev.d0, o);
      return ev.d1 > ev.d0 ? t1 + " – " + fmt(ev.d1, o) : t1;
    };
    var srcTag = function (ev) {
      var t1 = { gov: lab("sgov", "Government of India list"), pan: lab("span", "Drik Panchang"), rule: lab("srule", "Fixed date") }[ev.s] || "";
      return '<span class="cal-src-tag s-' + ev.s + '">' + t1 + "</span>" + (ev.m ? ' <span class="cal-moon" title="' + lab("moon", "") + '">☾ ' + lab("moon", "") + "</span>" : "");
    };
    var item = function (ev, cls) {
      return '<li class="' + (cls || "") + (ev.d1 < today ? " past" : "") + '"><button type="button" class="cal-item" data-f="' + ev.f + '">' +
        '<span class="cal-date">' + dateTxt(ev) + '</span><span class="cal-name">' + ev.name + (ev.n ? ' <small>· ' + ev.n + "</small>" : "") + "</span></button></li>";
    };
    var up = EV.filter(function (ev) { return ev.d1 >= today; });
    var html = '<p class="cal-today"><strong>' + lab("today", "Today") + ":</strong> " + fmt(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + "</p>";
    if (up.length) {
      var nx = up[0];
      html += '<div class="cal-next"><p class="cal-kicker">' + lab("next", "Coming up next") + '</p><h3>' + nx.name + "</h3>" +
        (nx.n ? '<p class="cal-sub">' + nx.n + "</p>" : "") +
        '<p class="cal-when"><span>' + dateTxt(nx, true) + '</span> <span class="cal-count">' + when(nx) + "</span></p>" +
        "<p>" + srcTag(nx) + '</p><button type="button" class="btn cal-item" data-f="' + nx.f + '">' + lab("read", "Read about it") + " →</button></div>";
      html += "<h3>" + lab("upcoming", "The next festivals") + '</h3><ol class="cal-list">' +
        up.slice(1, 9).map(function (ev) { return item(ev).replace("</button></li>", '<span class="cal-count">' + when(ev) + "</span></button></li>"); }).join("") + "</ol>";
    } else {
      html += '<p class="note">' + lab("ended", "New dates for next year are on the way.") + "</p>";
    }
    var years = []; EV.forEach(function (ev) { var y = ev.d0.getFullYear(); if (years.indexOf(y) < 0) years.push(y); });
    var yr = years.indexOf(today.getFullYear()) > -1 && up.some(function (e) { return e.d0.getFullYear() === today.getFullYear(); }) ? today.getFullYear() : (years.filter(function (y) { return y > today.getFullYear(); })[0] || years[years.length - 1]);
    html += '<h3>' + lab("year", "Year at a glance") + '</h3><div class="cal-years">' +
      years.map(function (y) { return '<button type="button" data-y="' + y + '">' + y + "</button>"; }).join("") + '</div><div class="cal-grid" id="calGrid"></div>' +
      '<p><button type="button" class="btn ghost" id="calIcs">⬇ ' + lab("ics", "Download all dates for your calendar (.ics)") + "</button></p>";
    festCal.innerHTML = html;
    var drawYear = function (y) {
      $$(".cal-years button", festCal).forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-y") === y); });
      var out = "";
      for (var mi = 0; mi < 12; mi++) {
        var list = EV.filter(function (ev) { return ev.d0.getFullYear() === y && ev.d0.getMonth() === mi; });
        if (!list.length) continue;
        out += '<div class="cal-month' + (list.length ? "" : " empty") + '"><h4>' + fmt(new Date(y, mi, 1), { month: "long" }) + "</h4>" +
          (list.length ? '<ul class="cal-list">' + list.map(function (ev) { return item(ev); }).join("") + "</ul>" : "<p>—</p>") + "</div>";
      }
      $("#calGrid").innerHTML = out;
    };
    drawYear(yr);
    festCal.addEventListener("click", function (e) {
      var yb = e.target.closest(".cal-years button"); if (yb) { drawYear(+yb.getAttribute("data-y")); return; }
      var b = e.target.closest(".cal-item"); if (b && festJump) festJump(b.getAttribute("data-f"));
    });
    $("#calIcs").addEventListener("click", function () {
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      var ds = function (d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
      var esc = function (t1) { return String(t1).replace(/([,;\\])/g, "\\$1"); };
      var L1 = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//bharatroots.net//Festival Calendar//EN", "CALSCALE:GREGORIAN"];
      EV.forEach(function (ev, i) {
        var end = new Date(ev.d1.getFullYear(), ev.d1.getMonth(), ev.d1.getDate() + 1);
        L1.push("BEGIN:VEVENT", "UID:fest-" + i + "-" + ds(ev.d0) + "@bharatroots.net", "DTSTAMP:" + ds(today) + "T000000Z",
          "DTSTART;VALUE=DATE:" + ds(ev.d0), "DTEND;VALUE=DATE:" + ds(end),
          "SUMMARY:" + esc(ev.name + (ev.n ? " (" + ev.n + ")" : "")), "URL:https://bharatroots.net/" + (lang === "en" ? "" : lang + "/") + "festivals.html#fest-" + ev.f, "END:VEVENT");
      });
      L1.push("END:VCALENDAR");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([L1.join("\r\n")], { type: "text/calendar" }));
      a.download = "indian-festivals.ics"; document.body.appendChild(a); a.click(); a.remove();
    });
  }
  var festHash = function () { if (festJump && /^#fest-\d+$/.test(location.hash)) festJump(location.hash.slice(6)); };
  setTimeout(festHash, 50); window.addEventListener("hashchange", festHash);

  /* ---------- State tile map + layers ---------- */
  var tilemap = $("#tilemap");
  var isEn = (document.documentElement.lang || "en") === "en";
  var RECIPES = window.STATE_RECIPES || {};
  var recipeBox = $("#recipeBox");
  if (tilemap && window.INDIA_STATES && T.states) {
    window.INDIA_STATES.forEach(function (s) { var x = T.states[s.id]; if (x) for (var k in x) s[k] = x[k]; });
  }
  if (tilemap && window.INDIA_STATES && window.INDIA_MAP) {
    var panel = $("#statePanel");
    var REG = t("regions", { north: "North India", south: "South India", east: "East India", west: "West India", central: "Central India", ne: "Northeast India" });
    var FAM = t("fams", { ia: "Indo-Aryan", dr: "Dravidian", tb: "Tibeto-Burman", aa: "Austroasiatic" });
    var LAYERS = [
      { k: "region", label: t("lyRegion", "Regions") },
      { k: "fam", label: t("lyFam", "Language families"), en: true },
      { k: "unesco", label: t("lyUnesco", "UNESCO World Heritage"), en: true },
      { k: "dance", label: t("lyDance", "Dance"), en: true },
      { k: "craft", label: t("lyCraft", "Crafts"), en: true },
      { k: "fest", label: t("lyFest", "Festivals") },
      { k: "food", label: t("lyFood", "Food"), en: !!recipeBox }
    ].filter(function (l) { return !l.en || isEn || T.layersAll; });
    var layer = "region";
    var bar = document.createElement("div");
    bar.className = "layer-bar"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", t("lyAria", "Map layers"));
    bar.innerHTML = "<span>" + t("lyShow", "Show:") + "</span>" + LAYERS.map(function (l) { return '<button type="button" data-ly="' + l.k + '">' + l.label + "</button>"; }).join("");
    var legend = $(".legend");
    (legend || tilemap).parentNode.insertBefore(bar, legend || tilemap);
    var listBox = document.createElement("div"); listBox.className = "layer-list"; listBox.id = "layerList";
    tilemap.parentNode.parentNode.insertBefore(listBox, tilemap.parentNode.nextSibling);
    var legendHTML = ["north", "west", "central", "east", "ne", "south"].map(function (k) { return '<span><i class="r-' + k + '"></i>' + REG[k].replace(/ India$/, "") + "</span>"; }).join("");
    var tiles = {};
    var ucount = function (s) { return (s.unesco || []).length; };
    var showState = function (s, b) {
      $$(".st", tilemap).forEach(function (x) { x.classList.toggle("on", x === b); });
      if (b && b.parentNode) b.parentNode.appendChild(b);
      var extra = "";
      if (isEn || T.layersAll) {
        if (s.dance) extra += "<p><strong>" + t("lyDance", "Dance") + ":</strong> " + s.dance + "</p>";
        if (s.craft) extra += "<p><strong>" + t("lyCraft", "Crafts") + ":</strong> " + s.craft + "</p>";
        if (s.unesco) extra += "<p><strong>" + t("lyUnesco", "UNESCO World Heritage") + ":</strong> " + (s.unesco.length ? s.unesco.join("; ") : t("noneYet", "none yet")) + "</p>";
      }
      var r = RECIPES[s.id];
      panel.innerHTML =
        '<h3 style="margin-top:0">' + s.n + "</h3>" +
        '<div class="tags"><span class="tag">' + (s.ut ? t("ut", "Union territory") : t("state", "State")) + '</span><span class="tag">' + REG[s.region] + "</span></div>" +
        "<p><strong>" + t("capital", "Capital") + ":</strong> " + s.cap + "</p>" +
        "<p><strong>" + t("languages", "Main languages") + ":</strong> " + s.lang + "</p>" +
        "<p><strong>" + t("festivals", "Festivals") + ":</strong> " + s.fest + "</p>" +
        "<p><strong>" + t("food", "Signature food") + ":</strong> " + s.food + "</p>" +
        "<p><strong>" + t("see", "Places to see") + ":</strong> " + s.see + "</p>" + extra +
        '<div class="activity"><strong>' + t("kidFact", "Kid-friendly fact") + ':</strong> ' + s.kid + "</div>" +
        (r && recipeBox ? '<p><button type="button" class="btn" data-cook="' + s.id + '">🍲 ' + t("cook", "Cook") + ": " + r.dish + " →</button></p>" : "");
      if (window.innerWidth < 860) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    var M = window.INDIA_MAP, NS = "http://www.w3.org/2000/svg";
    var mk = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; };
    var svg = mk("svg", { viewBox: M.vb, role: "group", "aria-label": t("mapAria", "Map of India's states and union territories") }, tilemap);
    var gShapes = mk("g", {}, svg), gLab = mk("g", { "class": "st-labels", "aria-hidden": "true" }, svg), gBadge = mk("g", { "class": "st-badges", "aria-hidden": "true" }, svg);
    var labelAt = {};
    window.INDIA_STATES.forEach(function (s) {
      var g = mk("g", { "class": "st r-" + s.region + (s.ut ? " ut" : ""), tabindex: "0", role: "button", "data-id": s.id, "aria-label": s.n + (s.ut ? " (" + t("ut", "Union territory") + ")" : "") }, gShapes);
      mk("path", { d: M.p[s.id] }, g);
      mk("title", {}, g).textContent = s.n;
      var go = function () { showState(s, g); };
      g.addEventListener("click", go);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      tiles[s.id] = g;
      var c = M.c[s.id], l = M.l[s.id];
      if (c) {
        var cg = mk("g", { "class": "callout", "data-id": s.id }, gLab);
        mk("line", { x1: c[0], y1: c[1], x2: c[2], y2: c[3] }, cg);
        mk("circle", { cx: c[2], cy: c[3], r: 1.4 }, cg);
        mk("rect", { x: c[0] - 9, y: c[1] - 6, width: 18, height: 12, rx: 3 }, cg);
        mk("text", { x: c[0], y: c[1] }, cg).textContent = s.id;
        cg.addEventListener("click", go);
        labelAt[s.id] = [c[0], c[1]];
      } else if (l) {
        mk("text", { x: l[0], y: l[1] }, gLab).textContent = s.id;
        labelAt[s.id] = l;
      }
    });
    var esc = function (x) { return String(x).replace(/</g, "&lt;"); };
    var drawLayer = function () {
      $$("button", bar).forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-ly") === layer); });
      gBadge.innerHTML = "";
      window.INDIA_STATES.forEach(function (s) {
        var b = tiles[s.id];
        b.setAttribute("class", "st" + (s.ut ? " ut" : "") + (b.classList.contains("on") ? " on" : ""));
        if (layer === "fam") b.classList.add("f-" + (s.fam || "ia"));
        else if (layer === "unesco") {
          var n = ucount(s); b.classList.add("u-" + Math.min(n, 4));
          var p = labelAt[s.id];
          if (n && p) { var bg = mk("g", {}, gBadge); mk("circle", { cx: p[0] + 11, cy: p[1] - 7, r: 5.2 }, bg); mk("text", { x: p[0] + 11, y: p[1] - 7 }, bg).textContent = n; }
        }
        else b.classList.add("r-" + s.region);
      });
      if (legend) {
        if (layer === "fam") legend.innerHTML = Object.keys(FAM).map(function (k) { return '<span><i class="f-' + k + '"></i>' + FAM[k] + "</span>"; }).join("");
        else if (layer === "unesco") legend.innerHTML = [0, 1, 2, 3, 4].map(function (n) { return '<span><i class="u-' + n + '"></i>' + (n === 4 ? "4+" : n) + "</span>"; }).join("") + "<span>" + t("lyUnescoNote", "Number of World Heritage sites (or parts of them)") + "</span>";
        else legend.innerHTML = legendHTML;
      }
      if (layer === "region") { listBox.innerHTML = ""; return; }
      var L1 = LAYERS.filter(function (l) { return l.k === layer; })[0];
      var rows = window.INDIA_STATES.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).map(function (s) {
        var v;
        if (layer === "fam") v = FAM[s.fam] + " · " + s.lang;
        else if (layer === "unesco") v = (s.unesco || []).length ? s.unesco.join("; ") : "—";
        else if (layer === "food") v = RECIPES[s.id] ? '<button type="button" class="linkish" data-cook="' + s.id + '">🍲 ' + esc(RECIPES[s.id].dish) + "</button>" : s.food;
        else v = s[layer];
        return '<li><button type="button" class="linkish st" data-st="' + s.id + '">' + s.n + "</button><span>" + v + "</span></li>";
      }).join("");
      listBox.innerHTML = "<h3>" + L1.label + '</h3><ul class="layer-rows">' + rows + "</ul>";
    };
    bar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { layer = b.getAttribute("data-ly"); drawLayer(); } });
    document.addEventListener("click", function (e) {
      var st = e.target.closest("[data-st]");
      if (st) { var s = window.INDIA_STATES.filter(function (x) { return x.id === st.getAttribute("data-st"); })[0]; showState(s, tiles[s.id]); tilemap.scrollIntoView({ behavior: "smooth", block: "center" }); }
    });
    drawLayer();
  }

  /* ---------- State recipe box ---------- */
  if (recipeBox && window.STATE_RECIPES) {
    var DIET = { veg: t("dVeg", "Vegetarian"), vegan: t("dVegan", "Vegan"), nonveg: t("dNonveg", "Non-vegetarian") };
    var STN = {}; (window.INDIA_STATES || []).forEach(function (s) { STN[s.id] = s.n; });
    var ids = Object.keys(RECIPES).sort(function (a, b) { return (STN[a] || a).localeCompare(STN[b] || b); });
    var diet = "all", cur = null;
    recipeBox.innerHTML =
      '<div class="filters rb-filters"><span>' + t("rbShow", "Show:") + '</span><button type="button" data-d="all" class="on">' + t("all", "All") + "</button>" +
      Object.keys(DIET).map(function (k) { return '<button type="button" data-d="' + k + '">' + DIET[k] + "</button>"; }).join("") + "</div>" +
      '<label class="rb-pick">' + t("rbPick", "Choose a state:") + ' <select id="rbSel"></select></label>' +
      '<div class="rb-grid" id="rbGrid"></div><article class="card recipe" id="rbCard" hidden></article>';
    var sel = $("#rbSel"), grid = $("#rbGrid"), card = $("#rbCard");
    var badge = function (r) { return '<span class="tag diet-' + r.diet + '">' + DIET[r.diet] + "</span>"; };
    var drawList = function () {
      var list = ids.filter(function (id) { return diet === "all" || RECIPES[id].diet === diet || (diet === "veg" && RECIPES[id].diet === "vegan"); });
      sel.innerHTML = '<option value="">—</option>' + list.map(function (id) { return '<option value="' + id + '"' + (id === cur ? " selected" : "") + ">" + STN[id] + " · " + RECIPES[id].dish + "</option>"; }).join("");
      grid.innerHTML = list.map(function (id) { var r = RECIPES[id]; return '<button type="button" class="rb-tile' + (id === cur ? " on" : "") + '" data-cook="' + id + '"><strong>' + r.dish + "</strong><span>" + STN[id] + "</span>" + badge(r) + "</button>"; }).join("");
    };
    var openRecipe = function (id, scroll) {
      var r = RECIPES[id]; if (!r) return; cur = id;
      var AL = t("allergens", { dairy: "dairy", gluten: "gluten", nuts: "tree nuts", peanuts: "peanuts", soy: "soy", fish: "fish", shellfish: "shellfish", sesame: "sesame", mustard: "mustard" });
      card.hidden = false;
      card.innerHTML = '<p class="meta">' + STN[id] + '</p><h3>' + r.dish + "</h3>" + '<div class="tags">' + badge(r) +
        '<span class="tag">⏱ ' + r.time + '</span><span class="tag">🍽 ' + (t("serves", "Serves").indexOf("{n}") > -1 ? t("serves", "Serves").replace("{n}", r.serves) : t("serves", "Serves") + " " + r.serves) + "</span></div>" +
        "<p>" + r.about + "</p>" +
        '<p class="allergy"><strong>' + t("contains", "Contains") + ":</strong> " + (r.al.length ? r.al.map(function (a) { return AL[a] || a; }).join(", ") : t("noMajor", "none of the common allergens listed here")) + ". " + t("checkLabels", "Always check packet labels (for example, hing often contains wheat).") + "</p>" +
        '<div class="grid grid-2 rb-cols"><div><h4>' + t("ingredients", "Ingredients") + '</h4><ul>' + r.ing.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
        "<div><h4>" + t("method", "Method") + "</h4><ol>" + r.steps.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div></div>" +
        '<div class="activity"><strong>' + t("kidsHelp", "Children can help") + ":</strong> " + r.kids + "</div>" +
        '<div class="note"><strong>' + t("tipSwap", "Tip and swaps") + ":</strong> " + r.tip + "</div>" +
        '<p class="meta">' + t("adultNote", "An adult should handle knives, pressure cookers, ovens and hot oil.") + '</p>' +
        '<p class="no-print"><button type="button" class="btn ghost" id="rbPrint">🖨 ' + t("printRecipe", "Print this recipe card") + "</button></p>";
      drawList();
      if (scroll) card.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    recipeBox.addEventListener("click", function (e) {
      var d = e.target.closest("[data-d]");
      if (d) { diet = d.getAttribute("data-d"); $$(".rb-filters button").forEach(function (x) { x.classList.toggle("on", x === d); }); drawList(); return; }
      if (e.target.closest("#rbPrint")) { document.body.classList.add("print-recipe"); window.print(); setTimeout(function () { document.body.classList.remove("print-recipe"); }, 500); }
    });
    document.addEventListener("click", function (e) { var c = e.target.closest("[data-cook]"); if (c) openRecipe(c.getAttribute("data-cook"), true); });
    sel.addEventListener("change", function () { if (sel.value) openRecipe(sel.value, false); });
    drawList();
    var hm = /^#recipe-([A-Z]{2})$/.exec(location.hash); if (hm) openRecipe(hm[1], true);
  }

  /* ---------- Picture stories ---------- */
  var STORIES = {
    ramayana: { title: "The Ramayana", pages: [
      ["spot-lotus.svg", "Long ago in the city of Ayodhya lived King Dasharatha and his four sons: Rama, Lakshmana, Bharata and Shatrughna. Rama was kind, brave and honest."],
      ["spot-heart.svg", "At a great contest, Rama lifted and strung the mighty bow of Shiva, which no one else could even move. He married the wise Princess Sita."],
      ["spot-mountain.svg", "To keep his father's promise, Rama went to live in the forest for fourteen years. Sita and his loyal brother Lakshmana went with him."],
      ["spot-book.svg", "Back home, Bharata would not take the throne. He placed Rama's sandals on it and looked after the kingdom until his brother returned."],
      ["spot-rangoli.svg", "In the forest, Ravana, the ten-headed king of Lanka, tricked them with a golden deer and carried Sita away to his island kingdom."],
      ["spot-kite.svg", "Rama made friends with Hanuman, who was strong and devoted. Hanuman leapt across the ocean, found Sita, and gave her Rama's ring so she knew help was coming."],
      ["spot-train.svg", "Rama's friends built a bridge of stones across the sea. After a great struggle, good won over evil and Sita was free."],
      ["spot-diya.svg", "Rama, Sita and Lakshmana came home to Ayodhya. The happy people lit rows of lamps to welcome them. Many families remember this at Diwali."]
    ]},
    arjuna: { title: "Arjuna and the Bird's Eye", pages: [
      ["spot-book.svg", "The Pandava and Kaurava princes learned archery from their wise teacher, Guru Drona."],
      ["spot-mountain.svg", "One day, Drona placed a small wooden bird high on a tree branch. \"Aim for its eye,\" he said, \"but first tell me what you see.\""],
      ["spot-kite.svg", "\"I see the tree, the branches, the leaves, the sky and my brothers,\" said the first prince. Drona asked him to step back. Others gave similar answers."],
      ["spot-lotus.svg", "Then Arjuna took aim. \"What do you see?\" asked Drona. \"Only the bird's eye,\" said Arjuna. \"Shoot!\" said Drona, and the arrow hit the eye perfectly."],
      ["spot-heart.svg", "The lesson: when you truly focus on one goal, you can achieve it. What is one thing you want to focus on this week?"]
    ]},
    ganesha: { title: "Ganesha's Race Around the World", pages: [
      ["spot-lotus.svg", "Lord Shiva and Goddess Parvati had two sons: Kartikeya, who rode a swift peacock, and Ganesha, who rode a tiny mouse."],
      ["spot-mountain.svg", "One day their parents held a contest: \"Whoever goes around the whole world three times first will win this special fruit.\""],
      ["spot-kite.svg", "Kartikeya jumped onto his peacock and zoomed off across mountains, rivers and oceans."],
      ["spot-heart.svg", "Ganesha thought for a moment. Then he slowly walked around his parents three times. \"You are my whole world,\" he said."],
      ["spot-diya.svg", "His parents smiled and gave him the fruit. The lesson: being wise and thoughtful can matter more than being fast. And family means the world."]
    ]}
  };
  if (T.stories) Object.keys(T.stories).forEach(function (k) {
    if (!STORIES[k]) return;
    STORIES[k].title = T.stories[k].title;
    T.stories[k].pages.forEach(function (txt, i) { if (STORIES[k].pages[i]) STORIES[k].pages[i][1] = txt; });
  });
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canSpeak = "speechSynthesis" in window;
  $$(".story[data-story]").forEach(function (box) {
    var key = box.getAttribute("data-story"), st = STORIES[key]; if (!st) return;
    var i = 0, playing = false, timer = null, speak = false;
    var scene = window.STORY_SCENES;
    box.innerHTML = '<h3 style="margin-top:0">' + st.title + "</h3>" +
      (scene ? '<div class="story-stage"></div>' : '<img class="story-img" alt="">') +
      '<p class="story-text" aria-live="polite"></p>' +
      '<div class="story-nav"><button class="btn ghost" type="button">← ' + t("back", "Back") + '</button><span class="story-count"></span><button class="btn" type="button">' + t("next", "Next") + " →</button></div>" +
      '<div class="story-tools"><button type="button" class="btn ghost st-play">▶ ' + t("playStory", "Play story") + "</button>" +
      (canSpeak ? '<label class="st-speak"><input type="checkbox"> 🔊 ' + t("readAloud", "Read aloud") + "</label>" : "") + "</div>";
    var stage = $(".story-stage", box), img = $(".story-img", box), txt = $(".story-text", box), cnt = $(".story-count", box), btns = $$(".story-nav button", box);
    var playBtn = $(".st-play", box), spk = $(".st-speak input", box);
    var lang = document.documentElement.lang || "en";
    var stopTalk = function () { if (canSpeak) window.speechSynthesis.cancel(); };
    var schedule = function () {
      clearTimeout(timer); if (!playing) return;
      var go = function () { if (!playing) return; if (i < st.pages.length - 1) { i++; show(); } else stop(); };
      if (speak && canSpeak) {
        var u = new SpeechSynthesisUtterance(st.pages[i][1]); u.lang = lang === "en" ? "en-IN" : lang + "-IN"; u.rate = 0.92;
        u.onend = function () { timer = setTimeout(go, 900); };
        stopTalk(); window.speechSynthesis.speak(u);
      } else timer = setTimeout(go, Math.max(5000, st.pages[i][1].length * 65));
    };
    var stop = function () { playing = false; clearTimeout(timer); stopTalk(); playBtn.textContent = "▶ " + t("playStory", "Play story"); };
    function show() {
      if (stage) {
        stage.innerHTML = scene(key, i);
        stage.classList.remove("enter"); void stage.offsetWidth; stage.classList.add("enter");
      } else img.src = BASE + "images/" + st.pages[i][0];
      txt.textContent = st.pages[i][1];
      txt.classList.remove("enter"); void txt.offsetWidth; txt.classList.add("enter");
      cnt.textContent = (i + 1) + " / " + st.pages.length;
      btns[0].disabled = i === 0;
      btns[1].textContent = i === st.pages.length - 1 ? t("readAgain", "Read again") + " ↺" : t("next", "Next") + " →";
      if (playing) schedule(); else if (speak && canSpeak) { var u = new SpeechSynthesisUtterance(st.pages[i][1]); u.lang = lang === "en" ? "en-IN" : lang + "-IN"; u.rate = 0.92; stopTalk(); window.speechSynthesis.speak(u); }
    }
    btns[0].addEventListener("click", function () { if (i > 0) { i--; show(); } });
    btns[1].addEventListener("click", function () { i = i === st.pages.length - 1 ? 0 : i + 1; show(); });
    playBtn.addEventListener("click", function () {
      if (playing) { stop(); return; }
      playing = true; playBtn.textContent = "⏸ " + t("pauseStory", "Pause");
      if (i === st.pages.length - 1) { i = 0; show(); } else schedule();
    });
    if (spk) spk.addEventListener("change", function () { speak = spk.checked; if (!speak) stopTalk(); else if (!playing) show(); });
    if (reduceMotion) box.classList.add("still");
    show();
  });

  /* ---------- Alphabet flashcards + letter quiz ---------- */
  var SCRIPTS = {
    hi: { name: "Hindi", letters: [["अ","a"],["आ","aa"],["इ","i"],["ई","ee"],["उ","u"],["ऊ","oo"],["ए","e"],["ऐ","ai"],["ओ","o"],["औ","au"],["क","ka"],["म","ma"]] },
    ta: { name: "Tamil", letters: [["அ","a"],["ஆ","aa"],["இ","i"],["ஈ","ee"],["உ","u"],["ஊ","oo"],["எ","e"],["ஏ","ē (long e)"],["ஐ","ai"],["ஒ","o"],["க","ka"],["ம","ma"]] },
    te: { name: "Telugu", letters: [["అ","a"],["ఆ","aa"],["ఇ","i"],["ఈ","ee"],["ఉ","u"],["ఊ","oo"],["ఎ","e"],["ఏ","ē (long e)"],["ఐ","ai"],["ఒ","o"],["క","ka"],["మ","ma"]] },
    gu: { name: "Gujarati", letters: [["અ","a"],["આ","aa"],["ઇ","i"],["ઈ","ee"],["ઉ","u"],["ઊ","oo"],["એ","e"],["ઐ","ai"],["ઓ","o"],["ઔ","au"],["ક","ka"],["મ","ma"]] },
    bn: { name: "Bengali", letters: [["অ","ô (as in 'on')"],["আ","a"],["ই","i"],["ঈ","ee"],["উ","u"],["ঊ","oo"],["এ","e"],["ঐ","oi"],["ও","o"],["ঔ","ou"],["ক","kô"],["ম","mô"]] }
  };
  var flash = $("#flashGrid");
  if (flash) {
    var cur = "hi";
    var drawFlash = function () {
      flash.innerHTML = "";
      SCRIPTS[cur].letters.forEach(function (l) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "flash"; b.lang = cur;
        b.innerHTML = '<span class="glyph">' + l[0] + '</span><span class="say">' + l[1] + "</span>";
        b.addEventListener("click", function () { b.classList.toggle("flip"); });
        flash.appendChild(b);
      });
      var L = SCRIPTS[cur].letters, items = [];
      var pick = L.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
      pick.forEach(function (p) {
        var others = L.filter(function (x) { return x !== p; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3);
        var opts = others.concat([p]).sort(function () { return Math.random() - 0.5; });
        items.push({ q: t("letterQ", "Which {s} letter says “{x}”?").replace("{s}", t("scripts", {})[cur] || SCRIPTS[cur].name).replace("{x}", p[1]), o: opts.map(function (x) { return x[0]; }), a: opts.indexOf(p), e: p[0] + " = " + p[1] });
      });
      buildQuiz($("#letterQuiz"), items);
      $$("#letterQuiz .opts button").forEach(function (b) { b.classList.add("glyph-opt"); b.lang = cur; });
    };
    $("#scriptPick").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      cur = b.getAttribute("data-s");
      $$("#scriptPick button").forEach(function (x) { x.classList.toggle("on", x === b); });
      drawFlash();
    });
    drawFlash();
  }

  /* ---------- Tap-to-colour rangoli ---------- */
  var cbox = $("#colourBox");
  if (cbox) {
    var COLORS = ["#e86f6f", "#f2b84b", "#f7d36b", "#6fb38a", "#7aa6d9", "#b48ad9", "#f4a9c0", "#d9733a", "#ffffff"];
    var current = COLORS[0];
    var pal = $("#palette");
    COLORS.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "swatch" + (i === 0 ? " on" : "");
      b.style.background = c; b.setAttribute("aria-label", "Colour " + (i + 1));
      b.addEventListener("click", function () { current = c; $$(".swatch").forEach(function (x) { x.classList.toggle("on", x === b); }); });
      pal.appendChild(b);
    });
    var draw = function () {
      var r = 140, s = '<svg viewBox="-160 -160 320 320" role="img" aria-label="Rangoli to colour">';
      s += '<circle class="fillable" r="150" fill="#fff" stroke="#5a3a1a" stroke-width="2"/>';
      s += '<circle class="fillable" r="118" fill="#fff" stroke="#5a3a1a" stroke-width="2"/>';
      for (var k = 0; k < 8; k++) s += '<path class="fillable" transform="rotate(' + (k * 45 + 22.5) + ')" d="M0 -70 C26 -90 22 -128 0 -146 C-22 -128 -26 -90 0 -70Z" fill="#fff" stroke="#5a3a1a" stroke-width="2"/>';
      for (k = 0; k < 8; k++) s += '<path class="fillable" transform="rotate(' + (k * 45) + ')" d="M0 -26 C30 -50 24 -96 0 -112 C-24 -96 -30 -50 0 -26Z" fill="#fff" stroke="#5a3a1a" stroke-width="2"/>';
      for (k = 0; k < 8; k++) s += '<circle class="fillable" transform="rotate(' + (k * 45 + 22.5) + ')" cx="0" cy="-56" r="9" fill="#fff" stroke="#5a3a1a" stroke-width="2"/>';
      s += '<circle class="fillable" r="26" fill="#fff" stroke="#5a3a1a" stroke-width="2"/><circle class="fillable" r="11" fill="#fff" stroke="#5a3a1a" stroke-width="2"/></svg>';
      cbox.innerHTML = s;
    };
    cbox.addEventListener("click", function (e) {
      var t = e.target.closest(".fillable"); if (t) t.setAttribute("fill", current);
    });
    $("#colourReset").addEventListener("click", draw);
    draw();
  }
})();

/* ---------- Language switcher ---------- */
(function () {
  var sels = document.querySelectorAll("select.lang-switch");
  for (var i = 0; i < sels.length; i++) {
    sels[i].addEventListener("change", function (e) {
      var url = e.target.value;
      if (url) {
        try { localStorage.setItem("ihl-lang", e.target.selectedOptions[0].getAttribute("lang")); } catch (err) {}
        window.location.href = url + window.location.hash;
      }
    });
  }
})();
