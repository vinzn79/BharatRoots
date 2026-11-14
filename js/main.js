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
  var festGrid = $("#festGrid");
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
  }

  /* ---------- State tile map ---------- */
  var tilemap = $("#tilemap");
  if (tilemap && window.INDIA_STATES && T.states) {
    window.INDIA_STATES.forEach(function (s) { var x = T.states[s.id]; if (x) for (var k in x) s[k] = x[k]; });
  }
  if (tilemap && window.INDIA_STATES) {
    var panel = $("#statePanel");
    window.INDIA_STATES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tile r-" + s.region + (s.ut ? " ut" : "");
      b.style.gridColumn = (s.c + 1) + " / span " + (s.w || 1);
      b.style.gridRow = String(s.r + 1);
      b.textContent = s.id;
      b.title = s.n;
      b.setAttribute("aria-label", s.n + (s.ut ? " (" + t("ut", "Union territory") + ")" : ""));
      b.addEventListener("click", function () {
        $$(".tile", tilemap).forEach(function (t) { t.classList.toggle("on", t === b); });
        panel.innerHTML =
          '<h3 style="margin-top:0">' + s.n + "</h3>" +
          '<div class="tags"><span class="tag">' + (s.ut ? t("ut", "Union territory") : t("state", "State")) + '</span><span class="tag">' +
          t("regions", { north: "North India", south: "South India", east: "East India", west: "West India", central: "Central India", ne: "Northeast India" })[s.region] + "</span></div>" +
          "<p><strong>" + t("capital", "Capital") + ":</strong> " + s.cap + "</p>" +
          "<p><strong>" + t("languages", "Main languages") + ":</strong> " + s.lang + "</p>" +
          "<p><strong>" + t("festivals", "Festivals") + ":</strong> " + s.fest + "</p>" +
          "<p><strong>" + t("food", "Signature food") + ":</strong> " + s.food + "</p>" +
          "<p><strong>" + t("see", "Places to see") + ":</strong> " + s.see + "</p>" +
          '<div class="activity"><strong>' + t("kidFact", "Kid-friendly fact") + ':</strong> ' + s.kid + "</div>";
        if (window.innerWidth < 860) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      tilemap.appendChild(b);
    });
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
  $$(".story[data-story]").forEach(function (box) {
    var st = STORIES[box.getAttribute("data-story")]; if (!st) return;
    var i = 0;
    box.innerHTML = '<h3 style="margin-top:0">' + st.title + '</h3><img class="story-img" alt=""><p class="story-text" aria-live="polite"></p>' +
      '<div class="story-nav"><button class="btn ghost" type="button">← ' + t("back", "Back") + '</button><span class="story-count"></span><button class="btn" type="button">' + t("next", "Next") + ' →</button></div>';
    var img = $(".story-img", box), txt = $(".story-text", box), cnt = $(".story-count", box), btns = $$("button", box);
    function show() {
      img.src = BASE + "images/" + st.pages[i][0];
      txt.textContent = st.pages[i][1];
      cnt.textContent = (i + 1) + " / " + st.pages.length;
      btns[0].disabled = i === 0;
      btns[1].textContent = i === st.pages.length - 1 ? t("readAgain", "Read again") + " ↺" : t("next", "Next") + " →";
    }
    btns[0].addEventListener("click", function () { if (i > 0) { i--; show(); } });
    btns[1].addEventListener("click", function () { i = i === st.pages.length - 1 ? 0 : i + 1; show(); });
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
