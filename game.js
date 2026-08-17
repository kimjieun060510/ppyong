(() => {
  "use strict";

  const WORLD_W = 1760;
  const WORLD_H = 1320;
  const ZOOM = 2.25;
  const ROUND_TIME = 40;
  const TOTAL_ROUNDS = 6;
  const WATER_TIME = 5;
  const RABBIT_TIME = 3;
  const POND = { x: 430, y: 980, rx: 170, ry: 92 };
  const SAFE_SPAWN = { x: WORLD_W * 0.55, y: WORLD_H * 0.42 };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const el = {
    hud: document.getElementById("hud"),
    title: document.getElementById("title"),
    shop: document.getElementById("shop"),
    shopList: document.getElementById("shop-list"),
    shopCoins: document.getElementById("shop-coins"),
    roundOver: document.getElementById("round-over"),
    roundSummary: document.getElementById("round-summary"),
    result: document.getElementById("result"),
    resultTitle: document.getElementById("result-title"),
    resultSummary: document.getElementById("result-summary"),
    controls: document.getElementById("controls"),
    coins: document.getElementById("coin-count"),
    combo: document.getElementById("combo-count"),
    round: document.getElementById("round-count"),
    time: document.getElementById("time-left"),
    stick: document.getElementById("stick"),
    stickBase: document.getElementById("stick-base"),
    stickKnob: document.getElementById("stick-knob"),
    soaked: document.getElementById("soaked"),
    soakCount: document.getElementById("soak-count"),
    stunTitle: document.getElementById("stun-title"),
    stunLead: document.getElementById("stun-lead"),
  };

  const UPGRADE_DEFS = [
    {
      id: "range",
      name: "뿅망치 범위",
      desc: "더 멀리 있는 두더지도 때려요",
      costs: [40, 90, 160, 260],
      values: [62, 78, 96, 118, 145],
    },
    {
      id: "swing",
      name: "뿅망치 속도",
      desc: "망치를 더 빨리 휘둘러요",
      costs: [40, 90, 160, 260],
      values: [0.46, 0.36, 0.27, 0.2, 0.14],
    },
    {
      id: "move",
      name: "달리기",
      desc: "공원에서 더 빠르게 달려요",
      costs: [35, 80, 140, 230],
      values: [185, 225, 270, 320, 380],
    },
    {
      id: "luck",
      name: "코인 보너스",
      desc: "두더지마다 코인을 더 받아요",
      costs: [50, 110, 190, 300],
      values: [1, 1.25, 1.55, 1.9, 2.4],
    },
    {
      id: "aoe",
      name: "광역 뿅",
      desc: "한 번에 주변 두더지까지 잡아요",
      costs: [220],
      values: [false, true],
    },
  ];

  const keys = Object.create(null);
  const joy = { x: 0, y: 0, pointerId: null };
  let viewW = 800;
  let viewH = 600;
  let camX = 0;
  let camY = 0;
  let shake = 0;
  let lastTs = 0;
  let parkCanvas = null;
  let audioCtx = null;
  let scene = "title";
  let holes = [];
  let trees = [];
  let flowers = [];
  let particles = [];
  let floatTexts = [];
  let player = null;
  let upgrades = null;
  let coins = 0;
  let combo = 0;
  let comboTimer = 0;
  let round = 1;
  let timeLeft = ROUND_TIME;
  let spawnAcc = 0;
  let playTime = 0;
  let roundCaught = 0;
  let totalCaught = 0;
  let demoTime = 0;
  let hammerPulse = 0;
  let soaked = 0;
  let stunKind = null;
  let carrots = [];
  let gasClouds = [];
  let slashes = [];
  let slashT = 0;
  let waterIFrames = 0;

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function inPond(x, y, pad = 0) {
    const dx = (x - POND.x) / (POND.rx + pad);
    const dy = (y - POND.y) / (POND.ry + pad);
    return dx * dx + dy * dy < 1;
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function tone(freq, dur, type, gain, slide) {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    if (!audioCtx) return;
    if (name === "pop") tone(180, 0.12, "square", 0.04, 320);
    if (name === "hit") {
      tone(140, 0.1, "sawtooth", 0.06, 60);
      tone(420, 0.08, "square", 0.03, 180);
    }
    if (name === "coin") {
      tone(660, 0.08, "sine", 0.05, 990);
    }
    if (name === "buy") tone(520, 0.16, "triangle", 0.05, 780);
    if (name === "miss") tone(180, 0.14, "sine", 0.04, 90);
    if (name === "swing") tone(240, 0.06, "triangle", 0.03, 120);
    if (name === "splash") {
      tone(90, 0.22, "sine", 0.06, 40);
      tone(220, 0.16, "triangle", 0.04, 80);
    }
    if (name === "trap") {
      tone(110, 0.2, "sawtooth", 0.07, 50);
      tone(300, 0.12, "square", 0.04, 90);
    }
  }

  function upgradeValue(id) {
    const def = UPGRADE_DEFS.find((d) => d.id === id);
    return def.values[upgrades[id]];
  }

  function resetProgress() {
    upgrades = { range: 0, swing: 0, move: 0, luck: 0, aoe: 0 };
    coins = 0;
    combo = 0;
    comboTimer = 0;
    round = 1;
    totalCaught = 0;
    playTime = 0;
  }

  function makePlayer() {
    return {
      x: SAFE_SPAWN.x,
      y: SAFE_SPAWN.y,
      facing: 0,
      runT: 0,
      swingT: 0,
      swingCd: 0,
      radius: 16,
    };
  }

  function placeDecor() {
    const rand = rng(20260817);
    trees = [];
    flowers = [];
    for (let i = 0; i < 26; i++) {
      const x = 80 + rand() * (WORLD_W - 160);
      const y = 80 + rand() * (WORLD_H - 160);
      if (inPond(x, y, 70)) continue;
      if (Math.hypot(x - WORLD_W * 0.55, y - WORLD_H * 0.42) < 140) continue;
      trees.push({
        x,
        y,
        h: 78 + rand() * 50,
        r: 34 + rand() * 18,
        hue: 110 + rand() * 30,
      });
    }
    for (let i = 0; i < 90; i++) {
      flowers.push({
        x: rand() * WORLD_W,
        y: rand() * WORLD_H,
        c: ["#ff7aa2", "#ffd15c", "#ff8a5b", "#c9a0ff"][(rand() * 4) | 0],
      });
    }
  }

  function placeHoles() {
    const list = [];
    let tries = 0;
    while (list.length < 11 && tries < 700) {
      tries += 1;
      const x = 130 + Math.random() * (WORLD_W - 260);
      const y = 150 + Math.random() * (WORLD_H - 280);
      if (inPond(x, y, 80)) continue;
      if (list.some((h) => dist(h, { x, y }) < 155)) continue;
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 70)) continue;
      list.push({ x, y, mole: null });
    }
    return list;
  }

  function bakePark() {
    const c = document.createElement("canvas");
    c.width = WORLD_W;
    c.height = WORLD_H;
    const g = c.getContext("2d");
    const rand = rng(99);

    const grass = g.createLinearGradient(0, 0, 0, WORLD_H);
    grass.addColorStop(0, "#8ed45f");
    grass.addColorStop(0.45, "#6bb34d");
    grass.addColorStop(1, "#4e9a3c");
    g.fillStyle = grass;
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    for (let i = 0; i < 5200; i++) {
      const x = rand() * WORLD_W;
      const y = rand() * WORLD_H;
      g.fillStyle = rand() > 0.5 ? "rgba(90, 160, 60, 0.35)" : "rgba(180, 220, 90, 0.28)";
      g.fillRect(x, y, 2 + rand() * 2, 3 + rand() * 5);
    }

    g.strokeStyle = "#c9a36b";
    g.lineWidth = 78;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(80, 220);
    g.quadraticCurveTo(520, 280, 700, 520);
    g.quadraticCurveTo(940, 820, 1280, 760);
    g.quadraticCurveTo(1560, 700, 1700, 980);
    g.stroke();
    g.strokeStyle = "#e6c58a";
    g.lineWidth = 48;
    g.stroke();

    g.fillStyle = "#5ec3d8";
    g.beginPath();
    g.ellipse(POND.x, POND.y, POND.rx, POND.ry, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.beginPath();
    g.ellipse(POND.x - 40, POND.y - 18, 70, 18, -0.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#4e9a3c";
    g.beginPath();
    g.ellipse(POND.x, POND.y, POND.rx + 18, POND.ry + 16, 0, 0, Math.PI * 2);
    g.strokeStyle = "#3f8a32";
    g.lineWidth = 18;
    g.stroke();

    g.fillStyle = "#e8d27a";
    g.save();
    g.translate(1180, 360);
    g.rotate(-0.2);
    g.fillRect(-70, -48, 140, 96);
    g.restore();

    for (const f of flowers) {
      if (inPond(f.x, f.y, 10)) continue;
      g.fillStyle = f.c;
      g.beginPath();
      g.arc(f.x, f.y, 4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff38a";
      g.beginPath();
      g.arc(f.x, f.y, 1.6, 0, Math.PI * 2);
      g.fill();
    }

    return c;
  }

  function isTrap(kind) {
    return kind === "skunk" || kind === "rabbit" || kind === "raccoon";
  }

  function spawnMole(forceGold = false) {
    const empty = holes.filter((h) => !h.mole);
    if (!empty.length) return;
    const hole = empty[(Math.random() * empty.length) | 0];
    let kind = "normal";
    if (scene === "play" && !forceGold && Math.random() < 0.22) {
      kind = ["skunk", "rabbit", "raccoon"][(Math.random() * 3) | 0];
    } else if (forceGold || Math.random() < 0.12) {
      kind = "gold";
    }
    hole.mole = {
      kind,
      state: "rise",
      t: 0,
      height: 0,
      stay: 2.8 + Math.random() * 1.4,
      bob: Math.random() * Math.PI * 2,
    };
    sfx("pop");
    burst(hole.x, hole.y - 8, isTrap(kind) ? "#c45c5c" : "#c9a36b", 7);
  }

  function smashMole(hole) {
    const mole = hole.mole;
    if (!mole || mole.state === "hit" || mole.state === "hide") return false;
    mole.state = "hit";
    mole.t = 0;
    if (isTrap(mole.kind)) {
      combo = 0;
      comboTimer = 0;
      shake = 8;
      sfx("trap");
      applyTrap(mole.kind, hole);
      return true;
    }
    combo += 1;
    comboTimer = 2.1;
    const base = mole.kind === "gold" ? 12 : 5;
    const gain = Math.round(base * upgradeValue("luck") * (1 + Math.min(combo, 12) * 0.08));
    coins += gain;
    roundCaught += 1;
    totalCaught += 1;
    shake = mole.kind === "gold" ? 8 : 5;
    sfx("hit");
    sfx("coin");
    burst(hole.x, hole.y - 24, mole.kind === "gold" ? "#ffd15c" : "#fff", 14);
    floatTexts.push({
      x: hole.x,
      y: hole.y - 36,
      text: `+${gain}`,
      t: 0,
      color: "#9a6b00",
    });
    return true;
  }

  function applyTrap(kind, hole) {
    if (kind === "skunk") {
      burst(hole.x, hole.y - 18, "#b6e85a", 20);
      startGas(player.x, player.y);
      startStun(
        "skunk",
        2.4,
        "GAME OVER",
        "스컹크 방귀가 너무 지독해요!"
      );
      el.soaked.classList.add("gas");
      el.soakCount.classList.add("hidden");
      return;
    }
    if (kind === "rabbit") {
      burst(hole.x, hole.y - 18, "#ff9f43", 12);
      throwCarrots(player.x, player.y);
      startStun("rabbit", RABBIT_TIME, "미끄럼!", "토끼가 당근을 잔뜩 뿌렸어요. 3초 동안 못 움직여요.");
      return;
    }
    const loss = Math.max(12, Math.round(coins * 0.35));
    coins = Math.max(0, coins - loss);
    slashT = 0.7;
    slashes = [0, 1, 2].map((i) => ({
      ang: -0.7 + i * 0.55,
      t: 0,
      delay: i * 0.07,
    }));
    burst(player.x, player.y - 18, "#ffd15c", 10);
    burst(player.x, player.y - 10, "#c45c5c", 8);
    floatTexts.push({
      x: player.x,
      y: player.y - 36,
      text: `할퀴힘 -${loss}`,
      t: 0,
      color: "#a33",
    });
    syncHud();
  }

  function gameOver(reason) {
    soaked = 0;
    stunKind = null;
    scene = "result";
    show("soaked", false);
    show("controls", false);
    show("hud", true);
    show("result", true);
    el.resultTitle.textContent = "이런!";
    const best = Number(localStorage.getItem("mole-best") || 0);
    if (totalCaught > best) localStorage.setItem("mole-best", String(totalCaught));
    el.resultSummary.textContent = `${reason} 두더지 ${totalCaught}마리, 코인 ${coins}개였어요.`;
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 40 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 40,
        t: 0,
        life: 0.35 + Math.random() * 0.25,
        color,
        r: 2 + Math.random() * 3,
      });
    }
  }

  function trySwing() {
    if (!player || player.swingCd > 0 || soaked > 0) return;
    const range = upgradeValue("range");
    const targets = [];
    for (const hole of holes) {
      const m = hole.mole;
      if (!m || m.state === "hit" || m.state === "hide") continue;
      const d = dist(player, hole);
      if (d <= range) targets.push({ hole, d });
    }
    targets.sort((a, b) => a.d - b.d);

    player.swingCd = upgradeValue("swing");
    player.swingT = 0.2;
    hammerPulse = 0.18;
    sfx("swing");

    if (!targets.length) return;
    const aoe = upgradeValue("aoe");
    if (aoe) {
      targets
        .filter((t) => t.hole.mole && !isTrap(t.hole.mole.kind))
        .forEach((t) => smashMole(t.hole));
    } else {
      smashMole(targets[0].hole);
    }
  }

  function startRound() {
    scene = "play";
    timeLeft = ROUND_TIME;
    spawnAcc = 0.4;
    roundCaught = 0;
    combo = 0;
    comboTimer = 0;
    holes.forEach((h) => {
      h.mole = null;
    });
    particles = [];
    floatTexts = [];
    carrots = [];
    gasClouds = [];
    slashes = [];
    slashT = 0;
    waterIFrames = 0;
    show("title", false);
    show("shop", false);
    show("roundOver", false);
    show("result", false);
    show("soaked", false);
    show("hud", true);
    show("controls", true);
    soaked = 0;
    stunKind = null;
    el.soaked.classList.remove("gas");
    el.soakCount.classList.remove("hidden");
    resetStick();
    el.round.textContent = String(round);
  }

  function openShop(fromRound) {
    scene = "shop";
    resetStick();
    show("roundOver", false);
    show("shop", true);
    renderShop(fromRound);
  }

  function renderShop(fromRound) {
    el.shopCoins.textContent = String(coins);
    el.shopList.innerHTML = "";
    UPGRADE_DEFS.forEach((def) => {
      const lv = upgrades[def.id];
      const maxed = lv >= def.costs.length;
      const cost = maxed ? 0 : def.costs[lv];
      const item = document.createElement("div");
      item.className = "shop-item";
      const title = document.createElement("h3");
      title.textContent = `${def.name}  Lv.${lv}/${def.costs.length}`;
      const desc = document.createElement("p");
      desc.textContent = def.desc;
      const btn = document.createElement("button");
      btn.type = "button";
      if (maxed) {
        btn.textContent = "MAX";
        btn.disabled = true;
      } else {
        btn.textContent = `${cost} 코인`;
        btn.disabled = coins < cost;
        btn.addEventListener("click", () => {
          if (coins < cost) return;
          coins -= cost;
          upgrades[def.id] += 1;
          sfx("buy");
          renderShop(fromRound);
          syncHud();
        });
      }
      item.append(title, desc, btn);
      el.shopList.append(item);
    });
    el.btnCloseShopLabel(fromRound);
  }

  // helper attached below after buttons exist
  function show(name, on) {
    const node = name === "roundOver" ? el.roundOver : el[name];
    node.classList.toggle("hidden", !on);
  }

  function syncHud() {
    el.coins.textContent = String(coins);
    el.combo.textContent = String(combo);
    el.time.textContent = String(Math.ceil(timeLeft));
    el.round.textContent = String(round);
  }

  function difficulty() {
    const t = playTime + (round - 1) * 18;
    return {
      interval: Math.max(0.38, 1.35 - t * 0.012),
      maxUp: Math.min(6, 2 + Math.floor(t / 28)),
    };
  }

  function updateMoles(dt) {
    const diff = difficulty();
    const upCount = holes.filter((h) => h.mole && h.mole.state !== "hit").length;
    spawnAcc += dt;
    if (scene === "play" && spawnAcc >= diff.interval && upCount < diff.maxUp) {
      spawnAcc = 0;
      spawnMole();
    }

    for (const hole of holes) {
      const m = hole.mole;
      if (!m) continue;
      m.bob += dt * 8;
      if (m.state === "rise") {
        m.t += dt / 0.32;
        m.height = clamp(m.t, 0, 1);
        if (m.t >= 1) {
          m.state = "up";
          m.t = 0;
        }
      } else if (m.state === "up") {
        m.t += dt;
        m.height = 1;
        if (m.t >= (m.stay || 2)) {
          m.state = "hide";
          m.t = 0;
        }
      } else if (m.state === "hide") {
        m.t += dt / 0.18;
        m.height = 1 - clamp(m.t, 0, 1);
        if (m.t >= 1) {
          hole.mole = null;
          if (scene === "play" && !isTrap(m.kind)) {
            combo = 0;
            sfx("miss");
          }
        }
      } else if (m.state === "hit") {
        m.t += dt / 0.22;
        m.height = 1 - clamp(m.t, 0, 1);
        if (m.t >= 1) hole.mole = null;
      }
    }
  }

  function throwCarrots(px, py) {
    carrots = [];
    for (let i = 0; i < 11; i++) {
      const a = (-Math.PI * 0.15) + Math.random() * Math.PI * 1.3;
      const d = 24 + Math.random() * 78;
      carrots.push({
        x: px,
        y: py - 8,
        tx: px + Math.cos(a) * d,
        ty: py + Math.sin(a) * d * 0.7,
        t: 0,
        rot: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.2,
        drawX: px,
        drawY: py - 8,
      });
    }
  }

  function startGas(px, py) {
    gasClouds = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      gasClouds.push({
        x: px + Math.cos(a) * 8,
        y: py + Math.sin(a) * 6,
        r: 10 + Math.random() * 14,
        vr: 55 + Math.random() * 90,
        a: 0.28 + Math.random() * 0.22,
        hue: 72 + Math.random() * 36,
      });
    }
  }

  function startStun(kind, seconds, title, lead) {
    if (scene !== "play") return;
    if (soaked > 0 && kind !== "skunk") return;
    soaked = seconds;
    stunKind = kind;
    combo = 0;
    comboTimer = 0;
    resetStick();
    shake = 8;
    el.stunTitle.textContent = title;
    el.stunLead.textContent = lead;
    el.soakCount.textContent = String(Math.ceil(seconds));
    el.soakCount.classList.toggle("hidden", kind === "skunk");
    el.soaked.classList.toggle("gas", kind === "skunk");
    show("soaked", true);
  }

  function fallInWater() {
    if (soaked > 0 || scene !== "play") return;
    sfx("splash");
    burst(player.x, player.y - 8, "#9fe7ff", 18);
    burst(player.x, player.y - 4, "#5ec3d8", 10);
    startStun("water", WATER_TIME, "풍덩!", "허우적거려서 5초 동안 못 움직여요.");
  }

  function recoverFromStun() {
    const kind = stunKind;
    soaked = 0;
    stunKind = null;
    carrots = [];
    show("soaked", false);
    el.soaked.classList.remove("gas");
    el.soakCount.classList.remove("hidden");
    if (kind === "water") {
      waterIFrames = 2;
      player.runT = 0;
      burst(player.x, player.y - 10, "#9fe7ff", 8);
    }
    if (kind === "skunk") {
      gameOver("스컹크 방귀가 공원에 퍼져서 게임이 끝났어요.");
    }
  }

  function blockedByTree(x, y) {
    return trees.some((t) => Math.hypot(t.x - x, t.y - y) < 26);
  }

  function updatePlayer(dt) {
    let ix = joy.x;
    let iy = joy.y;
    if (keys.a || keys.arrowleft) ix -= 1;
    if (keys.d || keys.arrowright) ix += 1;
    if (keys.w || keys.arrowup) iy -= 1;
    if (keys.s || keys.arrowdown) iy += 1;
    const len = Math.hypot(ix, iy);
    if (len > 1) {
      ix /= len;
      iy /= len;
    }
    if (player.swingCd > 0) player.swingCd -= dt;
    if (player.swingT > 0) player.swingT -= dt;
    if (hammerPulse > 0) hammerPulse -= dt;
    if (waterIFrames > 0) waterIFrames -= dt;
    if (len > 0.12 && soaked <= 0) {
      player.facing = Math.atan2(iy, ix);
      player.runT += dt * 10;
      const sp = upgradeValue("move");
      const nx = clamp(player.x + ix * sp * dt, 36, WORLD_W - 36);
      const ny = clamp(player.y + iy * sp * dt, 48, WORLD_H - 36);
      if (!blockedByTree(nx, player.y)) player.x = nx;
      if (!blockedByTree(player.x, ny)) player.y = ny;
      if (waterIFrames <= 0 && inPond(player.x, player.y, -14)) fallInWater();
    } else {
      player.runT *= 0.85;
    }
  }

  function updateFx(dt) {
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 0;
    }
    shake = Math.max(0, shake - dt * 18);
    particles = particles.filter((p) => {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      return p.t < p.life;
    });
    floatTexts = floatTexts.filter((f) => {
      f.t += dt;
      f.y -= 28 * dt;
      return f.t < 0.8;
    });
    carrots.forEach((c) => {
      c.t += dt;
      const u = clamp((c.t - c.delay) / 0.32, 0, 1);
      c.drawX = c.x + (c.tx - c.x) * u;
      c.drawY = c.y + (c.ty - c.y) * u - Math.sin(u * Math.PI) * 38;
      c.rot += dt * 7;
    });
    gasClouds.forEach((g) => {
      g.r += g.vr * dt;
      g.a = Math.max(0.08, g.a - dt * 0.04);
      g.y -= dt * 12;
    });
    if (slashT > 0) slashT -= dt;
    slashes.forEach((s) => {
      s.t += dt;
    });
  }

  function endRound() {
    if (stunKind === "skunk") {
      recoverFromStun();
      return;
    }
    soaked = 0;
    stunKind = null;
    carrots = [];
    gasClouds = [];
    show("soaked", false);
    if (round >= TOTAL_ROUNDS) {
      scene = "result";
      show("controls", false);
      show("hud", true);
      show("result", true);
      el.resultTitle.textContent = "오늘 공원은 여기까지!";
      const best = Number(localStorage.getItem("mole-best") || 0);
      const score = totalCaught;
      if (score > best) localStorage.setItem("mole-best", String(score));
      el.resultSummary.textContent = `두더지 ${totalCaught}마리, 코인 ${coins}개 모았어요. 최고 기록 ${Math.max(best, score)}마리!`;
      return;
    }
    scene = "roundOver";
    show("roundOver", true);
    el.roundSummary.textContent = `${round}라운드에서 두더지 ${roundCaught}마리를 잡았어요. 코인 ${coins}개로 뿅망치를 키워 보세요.`;
  }

  function update(dt) {
    if (scene === "title") {
      demoTime += dt;
      if (demoTime > 0.9) {
        demoTime = 0;
        spawnMole(Math.random() < 0.2);
      }
      updateMoles(dt);
      updateFx(dt);
      return;
    }
    if (scene === "play") {
      playTime += dt;
      timeLeft -= dt;
      if (soaked > 0) {
        soaked -= dt;
        if (stunKind !== "skunk") {
          el.soakCount.textContent = String(Math.max(1, Math.ceil(soaked)));
        }
        if (stunKind === "water" && Math.random() < 0.45) {
          burst(player.x, player.y - 6, "#9fe7ff", 3);
        }
        updateMoles(dt);
        updateFx(dt);
        if (soaked <= 0) recoverFromStun();
        if (timeLeft <= 0 && scene === "play") endRound();
        syncHud();
        return;
      }
      updatePlayer(dt);
      updateMoles(dt);
      updateFx(dt);
      if (timeLeft <= 0) endRound();
      syncHud();
      return;
    }
    updateMoles(dt * 0.35);
    updateFx(dt);
  }

  function drawShadow(x, y, rx, ry) {
    ctx.fillStyle = "rgba(40, 60, 20, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y + 8, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHole(hole) {
    const lumps = [
      [-18, 8, 14], [18, 9, 13], [0, 12, 16], [-28, 4, 10], [27, 5, 11],
    ];
    ctx.fillStyle = "#6b4324";
    lumps.forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(hole.x + dx, hole.y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#8d572c";
    ctx.beginPath();
    ctx.ellipse(hole.x, hole.y + 2, 40, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a0f0a";
    ctx.beginPath();
    ctx.ellipse(hole.x, hole.y, 30, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPaws(x, y, color) {
    [-1, 1].forEach((side) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x + side * 16, y, 8, 6, side * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f3b89a";
      ctx.beginPath();
      ctx.ellipse(x + side * 16, y + 1.2, 4.5, 3, side * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGlossyEyes(x, y, white) {
    if (white) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x - 8, y, 6.2, 6.8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 8, y, 6.2, 6.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a120c";
      ctx.beginPath();
      ctx.arc(x - 8, y + 0.5, 3.4, 0, Math.PI * 2);
      ctx.arc(x + 8, y + 0.5, 3.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#1a120c";
      ctx.beginPath();
      ctx.ellipse(x - 8, y, 5.6, 6.4, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 8, y, 5.6, 6.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x - 6.5, y - 1.6, 1.6, 0, Math.PI * 2);
    ctx.arc(x + 9.5, y - 1.6, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAnimal(kind, x, y) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.4;
    const gold = kind === "gold";
    let body = "#8a542c";
    let belly = "#d4a06a";
    let paw = "#f3b89a";
    if (gold) {
      body = "#e8b423";
      belly = "#ffe9a8";
      paw = "#e8b423";
    } else if (kind === "skunk") {
      body = "#2a2a32";
      belly = "#f4f1ea";
      paw = "#2a2a32";
    } else if (kind === "rabbit") {
      body = "#f6e0c8";
      belly = "#fff8f0";
      paw = "#f6e0c8";
    } else if (kind === "raccoon") {
      body = "#8b8176";
      belly = "#efe6dc";
      paw = "#8b8176";
    }

    [-1, 1].forEach((side) => {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(x + side * 22, y + 2, 9, 5.5, side * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f3b89a";
      ctx.beginPath();
      ctx.ellipse(x + side * 28, y + 3, 4.5, 3.6, side * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(x + side * 11, y + 26, 6.5, 8.5, side * 0.12, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(40, 24, 12, 0.28)";
    ctx.stroke();
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(x, y + 7, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (kind === "skunk") {
      ctx.fillStyle = "#f4f1ea";
      ctx.beginPath();
      ctx.moveTo(x, y + 26);
      ctx.quadraticCurveTo(x - 6, y, x, y - 26);
      ctx.quadraticCurveTo(x + 6, y, x, y + 26);
      ctx.fill();
    }

    if (kind === "rabbit") {
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(x + side * 10, y - 24);
        ctx.rotate(side * 0.16);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, -16, 7, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffb7c8";
        ctx.beginPath();
        ctx.ellipse(0, -14, 3.2, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    } else if (kind === "skunk" || kind === "raccoon") {
      [-1, 1].forEach((side) => {
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(x + side * 14, y - 26, 6.5, 8, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = kind === "raccoon" ? "#f0cbb8" : "#f4f1ea";
        ctx.beginPath();
        ctx.ellipse(x + side * 14, y - 25, 2.8, 3.4, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(x, y - 28, 4.2, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (gold) {
      ctx.fillStyle = "#ffe56b";
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 26);
      ctx.lineTo(x - 5, y - 40);
      ctx.lineTo(x, y - 27);
      ctx.lineTo(x + 5, y - 40);
      ctx.lineTo(x + 11, y - 26);
      ctx.closePath();
      ctx.fill();
    }

    if (kind === "raccoon") {
      ctx.fillStyle = "#1c120c";
      ctx.beginPath();
      ctx.ellipse(x, y - 8, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const faceY = y - 8;
    drawGlossyEyes(x, faceY, kind === "skunk" || kind === "raccoon");
    if (kind === "skunk") {
      ctx.strokeStyle = "#4a1020";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x - 13, faceY - 8);
      ctx.lineTo(x - 5, faceY - 3);
      ctx.moveTo(x + 13, faceY - 8);
      ctx.lineTo(x + 5, faceY - 3);
      ctx.stroke();
    }
    ctx.fillStyle = kind === "skunk" || kind === "raccoon" ? "#1a120c" : "#ff8aa8";
    ctx.beginPath();
    ctx.arc(x, y, kind === "rabbit" ? 3.2 : 4.2, 0, Math.PI * 2);
    ctx.fill();
    if (kind !== "skunk" && kind !== "raccoon") {
      ctx.strokeStyle = "#3b2418";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 2);
      ctx.lineTo(x - 15, y);
      ctx.moveTo(x - 5, y + 4);
      ctx.lineTo(x - 14, y + 7);
      ctx.moveTo(x + 5, y + 2);
      ctx.lineTo(x + 15, y);
      ctx.moveTo(x + 5, y + 4);
      ctx.lineTo(x + 14, y + 7);
      ctx.stroke();
    }
    ctx.strokeStyle = "#1a120c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 8, 5.5, 0.15, Math.PI - 0.15);
    ctx.stroke();
    return paw;
  }

  function drawMole(hole) {
    const m = hole.mole;
    if (!m || m.height <= 0.02) return;
    const pop = m.height;
    const x = hole.x;
    const bodyY = hole.y - 8 - pop * 30 + Math.sin(m.bob) * 1.2;
    drawShadow(x, hole.y + 6, 16 + pop * 10, 7);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 70, hole.y - 130, 140, 132);
    ctx.clip();
    const paw = drawAnimal(m.kind, x, bodyY);
    ctx.restore();

    ctx.fillStyle = "#6b4324";
    ctx.beginPath();
    ctx.ellipse(hole.x, hole.y + 8, 36, 10, 0, 0.2, Math.PI - 0.2);
    ctx.fill();
    drawPaws(x, hole.y - 2, paw);
  }

  function drawCarrot(c) {
    const x = c.drawX ?? c.x;
    const y = c.drawY ?? c.y;
    if (x == null) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(c.rot);
    ctx.fillStyle = "#ff8a2a";
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.quadraticCurveTo(7, 2, 6, -6);
    ctx.lineTo(-6, -6);
    ctx.quadraticCurveTo(-7, 2, 0, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.quadraticCurveTo(-9, -12, -5, -22);
    ctx.quadraticCurveTo(-2, -12, 0, -6);
    ctx.fill();
    ctx.fillStyle = "#43a047";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.quadraticCurveTo(0, -16, 1, -24);
    ctx.quadraticCurveTo(3, -14, 0, -6);
    ctx.fill();
    ctx.fillStyle = "#66bb6a";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.quadraticCurveTo(9, -12, 6, -22);
    ctx.quadraticCurveTo(2, -12, 0, -6);
    ctx.fill();
    ctx.restore();
  }

  function drawGasClouds() {
    gasClouds.forEach((g) => {
      ctx.fillStyle = `hsla(${g.hue}, 70%, 48%, ${g.a})`;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.r, g.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsla(${g.hue + 20}, 80%, 62%, ${g.a * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(g.x - g.r * 0.2, g.y - g.r * 0.15, g.r * 0.45, g.r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSlashes() {
    if (!player || slashT <= 0) return;
    slashes.forEach((s) => {
      const local = s.t - s.delay;
      if (local < 0 || local > 0.35) return;
      const a = 1 - local / 0.35;
      ctx.save();
      ctx.translate(player.x, player.y - 8);
      ctx.rotate(s.ang);
      ctx.strokeStyle = `rgba(220, 40, 40, ${a})`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-6, -18);
      ctx.lineTo(18, 10);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 220, 220, ${a * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawTree(t) {
    drawShadow(t.x, t.y, 22, 10);
    ctx.fillStyle = "#8a5a32";
    ctx.fillRect(t.x - 7, t.y - t.h * 0.35, 14, t.h * 0.42);
    ctx.fillStyle = `hsl(${t.hue} 42% 36%)`;
    ctx.beginPath();
    ctx.arc(t.x, t.y - t.h * 0.42, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsl(${t.hue} 48% 46%)`;
    ctx.beginPath();
    ctx.arc(t.x - 12, t.y - t.h * 0.5, t.r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer() {
    const p = player;
    const swing = p.swingT > 0 ? 1 - p.swingT / 0.2 : 0;
    const run = Math.sin(p.runT) * 5;
    const wet = soaked > 0 && stunKind === "water";
    const trip = soaked > 0 && stunKind === "rabbit";
    const t = performance.now() / 1000;
    drawShadow(p.x, p.y, 16, 8);
    ctx.save();
    ctx.translate(p.x, p.y + (wet ? 12 + Math.sin(t * 14) * 3 : 0));
    if (wet) ctx.globalAlpha = 0.78;
    if (trip) ctx.rotate(Math.sin(t * 10) * 0.28);
    const flip = Math.cos(p.facing) < 0 ? -1 : 1;
    ctx.scale(flip, 1);

    ctx.strokeStyle = "#2b3a24";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const flap = wet ? Math.sin(t * 16) * 10 : run;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(-16, wet ? -8 + flap : 8);
    ctx.moveTo(8, 2);
    ctx.lineTo(16, wet ? -8 - flap : 8);
    ctx.moveTo(-6, 6);
    ctx.lineTo(-6 + (wet ? flap * 0.4 : run * 0.3), 16);
    ctx.moveTo(6, 6);
    ctx.lineTo(6 - (wet ? flap * 0.4 : run * 0.3), 16);
    ctx.stroke();

    ctx.fillStyle = wet ? "#7ec8e8" : slashT > 0 ? "#ffb3b3" : "#ffd15c";
    ctx.beginPath();
    ctx.ellipse(0, -8, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2b3a24";
    ctx.beginPath();
    ctx.arc(-5, -10, 2, 0, Math.PI * 2);
    ctx.arc(5, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    if (wet) {
      ctx.strokeStyle = "#2b3a24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-2, -1);
      ctx.moveTo(6, -4);
      ctx.lineTo(2, -1);
      ctx.stroke();
    }
    ctx.fillStyle = "#ff8aa5";
    ctx.beginPath();
    ctx.arc(0, -4, 2.4, 0, Math.PI * 2);
    ctx.fill();

    const ang = -1.1 + swing * 2.4 + (wet ? Math.sin(t * 14) * 0.8 : 0);
    ctx.save();
    ctx.translate(12, -6);
    ctx.rotate(ang);
    ctx.fillStyle = "#c47a3a";
    ctx.fillRect(-3, -28, 6, 28);
    ctx.fillStyle = upgrades.aoe ? "#ffd15c" : "#ff6b4a";
    ctx.fillRect(-14, -42, 28, 18);
    ctx.strokeRect(-14, -42, 28, 18);
    ctx.restore();
    ctx.restore();
  }

  function drawWorld() {
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;
    const visW = viewW / ZOOM;
    const visH = viewH / ZOOM;
    const targetX = clamp(player.x - visW / 2, 0, Math.max(0, WORLD_W - visW));
    const targetY = clamp(player.y - visH / 2, 0, Math.max(0, WORLD_H - visH));
    camX += (targetX - camX) * 0.12;
    camY += (targetY - camY) * 0.12;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-camX, -camY);
    ctx.drawImage(parkCanvas, 0, 0);

    for (const hole of holes) drawHole(hole);

    const sprites = trees.map((t) => ({ y: t.y, draw: () => drawTree(t) }));
    holes.forEach((hole) => {
      if (hole.mole) sprites.push({ y: hole.y, draw: () => drawMole(hole) });
    });
    sprites.push({ y: player.y, draw: drawPlayer });
    sprites.sort((a, b) => a.y - b.y);
    sprites.forEach((s) => s.draw());

    carrots.forEach(drawCarrot);
    drawGasClouds();
    drawSlashes();

    for (const p of particles) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    for (const f of floatTexts) {
      ctx.globalAlpha = 1 - f.t / 0.8;
      ctx.fillStyle = f.color;
      ctx.font = "22px Jua, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    if (scene === "play" && player.swingT > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, upgradeValue("range"), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    if (stunKind === "skunk") {
      ctx.fillStyle = "rgba(150, 190, 40, 0.28)";
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  function resize() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loop(ts) {
    const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    update(dt);
    ctx.clearRect(0, 0, viewW, viewH);
    drawWorld();
    requestAnimationFrame(loop);
  }

  function setStick(clientX, clientY) {
    const base = el.stickBase.getBoundingClientRect();
    const cx = base.left + base.width / 2;
    const cy = base.top + base.height / 2;
    const max = Math.max(28, base.width * 0.5 - el.stickKnob.offsetWidth * 0.5);
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    joy.x = dx / max;
    joy.y = dy / max;
    el.stickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  function resetStick() {
    joy.x = 0;
    joy.y = 0;
    joy.pointerId = null;
    el.stick.classList.remove("active");
    el.stickKnob.style.transform = "translate(-50%, -50%)";
  }

  function bindControls() {
    const stick = el.stick;
    stick.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      stick.setPointerCapture(e.pointerId);
      joy.pointerId = e.pointerId;
      stick.classList.add("active");
      setStick(e.clientX, e.clientY);
    });
    stick.addEventListener("pointermove", (e) => {
      if (joy.pointerId !== e.pointerId) return;
      e.preventDefault();
      setStick(e.clientX, e.clientY);
    });
    const endStick = (e) => {
      if (joy.pointerId !== e.pointerId) return;
      resetStick();
    };
    stick.addEventListener("pointerup", endStick);
    stick.addEventListener("pointercancel", endStick);
    stick.addEventListener("lostpointercapture", () => {
      if (joy.pointerId !== null) resetStick();
    });
    stick.addEventListener("contextmenu", (e) => e.preventDefault());

    const hammer = document.getElementById("btn-hammer");
    hammer.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      hammer.classList.add("held");
      ensureAudio();
      trySwing();
    });
    const releaseHammer = () => hammer.classList.remove("held");
    hammer.addEventListener("pointerup", releaseHammer);
    hammer.addEventListener("pointercancel", releaseHammer);
    hammer.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        ensureAudio();
        trySwing();
      }
      if (e.key.toLowerCase() === "e" && scene === "play") openShop(false);
    });
    window.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    document.getElementById("btn-start").addEventListener("click", () => {
      ensureAudio();
      resetProgress();
      player = makePlayer();
      startRound();
    });
    document.getElementById("btn-shop").addEventListener("click", () => {
      ensureAudio();
      openShop(false);
    });
    document.getElementById("btn-close-shop").addEventListener("click", () => {
      ensureAudio();
      if (timeLeft <= 0 && round < TOTAL_ROUNDS) {
        round += 1;
        player.x = SAFE_SPAWN.x;
        player.y = SAFE_SPAWN.y;
        startRound();
      } else {
        scene = "play";
        show("shop", false);
      }
    });
    document.getElementById("btn-to-shop").addEventListener("click", () => {
      ensureAudio();
      openShop(true);
    });
    document.getElementById("btn-retry").addEventListener("click", () => {
      ensureAudio();
      resetProgress();
      player = makePlayer();
      holes = placeHoles();
      startRound();
    });
  }

  // patch renderShop close button label
  el.btnCloseShopLabel = function btnCloseShopLabel(fromRound) {
    const btn = document.getElementById("btn-close-shop");
    btn.textContent =
      fromRound || timeLeft <= 0 ? "다음 라운드" : "다시 잡으러 가기";
  };

  function init() {
    resize();
    placeDecor();
    holes = placeHoles();
    parkCanvas = bakePark();
    player = makePlayer();
    resetProgress();
    bindControls();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", ensureAudio, { once: true });
    requestAnimationFrame(loop);
  }

  init();
})();
