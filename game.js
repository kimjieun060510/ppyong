(() => {
  "use strict";

  const WORLD_W = 5280;
  const WORLD_H = 3960;
  const ZOOM = 2.25;
  const ROUND_TIME = 40;
  const TOTAL_ROUNDS = 6;
  const WATER_TIME = 5;
  const RABBIT_TIME = 3;
  const POND = { x: 1290, y: 2940, rx: 210, ry: 114 };
  const SAFE_SPAWN = { x: WORLD_W * 0.55, y: WORLD_H * 0.42 };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const el = {
    hud: document.getElementById("hud"),
    login: document.getElementById("login"),
    title: document.getElementById("title"),
    titleMe: document.getElementById("title-me"),
    titleHello: document.getElementById("title-hello"),
    profile: document.getElementById("profile"),
    profileAccount: document.getElementById("profile-account"),
    profileStepLabel: document.getElementById("profile-step-label"),
    profileStepGender: document.getElementById("profile-step-gender"),
    profileStepOutfit: document.getElementById("profile-step-outfit"),
    profileStepHammer: document.getElementById("profile-step-hammer"),
    profileChars: document.getElementById("profile-chars"),
    profileOutfits: document.getElementById("profile-outfits"),
    profileHammers: document.getElementById("profile-hammers"),
    briefing: document.getElementById("briefing"),
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
      desc: "더 빠르게 달려요",
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

  const OUTFITS = [
    {
      id: "lemon",
      name: "레몬 후디",
      vibe: "데일리",
      for: "any",
      cut: "hoodie",
      bottom: "shorts",
      top: "#ffe34a",
      topShade: "#e8c01c",
      bottomGirl: "#ff7a28",
      bottomBoy: "#2f4f9a",
      shoesGirl: "#ff7a28",
      shoesBoy: "#ffe34a",
      shoeStripe: "#ffffff",
      socks: "#ffffff",
      sockStripe: "#ffe34a",
      strings: "#ffffff",
      clip: "#ff7a28",
    },
    {
      id: "track",
      name: "삼선 셋업",
      vibe: "스트릿",
      for: "boy",
      cut: "track",
      bottom: "track",
      top: "#1c1c1c",
      topShade: "#111111",
      bottomGirl: "#1c1c1c",
      bottomBoy: "#1c1c1c",
      shoesGirl: "#f5f5f5",
      shoesBoy: "#f5f5f5",
      shoeStripe: "#ff4d6d",
      socks: "#ffffff",
      sockStripe: "#1c1c1c",
      stripes: "#ffffff",
      clip: "#ff4d6d",
    },
    {
      id: "anorak",
      name: "네온 아노락",
      vibe: "캠퍼스",
      for: "any",
      cut: "anorak",
      bottom: "cargo",
      top: "#8cff4d",
      topShade: "#58c428",
      panel: "#2a3d8f",
      bottomGirl: "#5a6b82",
      bottomBoy: "#5a6b82",
      shoesGirl: "#ffffff",
      shoesBoy: "#ffffff",
      shoeStripe: "#8cff4d",
      socks: "#ffffff",
      sockStripe: "#2a3d8f",
      clip: "#8cff4d",
    },
    {
      id: "rugby",
      name: "럭비 셔츠",
      vibe: "프레피",
      for: "boy",
      cut: "rugby",
      bottom: "bermuda",
      top: "#d62828",
      topShade: "#b51d1d",
      stripe: "#ffffff",
      bottomGirl: "#3d4f3a",
      bottomBoy: "#3d4f3a",
      shoesGirl: "#f4efe4",
      shoesBoy: "#f4efe4",
      shoeStripe: "#d62828",
      socks: "#ffffff",
      sockStripe: "#d62828",
      clip: "#d62828",
    },
    {
      id: "cargo",
      name: "카고 스트릿",
      vibe: "Y2K",
      for: "any",
      cut: "tee",
      bottom: "cargo",
      top: "#9fd8ff",
      topShade: "#6bb8ee",
      bottomGirl: "#6b5a3e",
      bottomBoy: "#6b5a3e",
      shoesGirl: "#e8e0d4",
      shoesBoy: "#e8e0d4",
      shoeStripe: "#9fd8ff",
      socks: "#ffffff",
      sockStripe: "#6b5a3e",
      clip: "#9fd8ff",
    },
    {
      id: "tennis",
      name: "테니스 클럽",
      vibe: "스포츠",
      for: "girl",
      cut: "polo",
      bottom: "tennis",
      top: "#ffffff",
      topShade: "#e6e6e6",
      accent: "#2db36a",
      bottomGirl: "#ffffff",
      bottomBoy: "#2db36a",
      shoesGirl: "#ffffff",
      shoesBoy: "#ffffff",
      shoeStripe: "#2db36a",
      socks: "#ffffff",
      sockStripe: "#2db36a",
      visor: "#2db36a",
      clip: "#2db36a",
    },
    {
      id: "ribbon",
      name: "리본 가디건",
      vibe: "리본룩",
      for: "girl",
      cut: "cardigan",
      bottom: "skirt",
      top: "#ffd6e7",
      topShade: "#f5b6cc",
      inner: "#fff8fb",
      bottomGirl: "#5a6db5",
      bottomBoy: "#5a6db5",
      shoesGirl: "#ff8ab8",
      shoesBoy: "#ff8ab8",
      shoeStripe: "#ffffff",
      socks: "#ffffff",
      sockStripe: "#ff8ab8",
      ribbon: "#ff5e8a",
      clip: "#ff5e8a",
    },
    {
      id: "midnight",
      name: "올블랙",
      vibe: "미니멀",
      for: "boy",
      cut: "hoodie",
      bottom: "wide",
      top: "#222226",
      topShade: "#111114",
      bottomGirl: "#1a1a1e",
      bottomBoy: "#1a1a1e",
      shoesGirl: "#111114",
      shoesBoy: "#111114",
      shoeStripe: "#8a8a90",
      socks: "#2a2a2e",
      sockStripe: "#55555c",
      strings: "#8a8a90",
      clip: "#8a8a90",
    },
    {
      id: "cherry",
      name: "체리 니트",
      vibe: "페어코어",
      for: "girl",
      cut: "knit",
      bottom: "skirt",
      top: "#ff5a6a",
      topShade: "#e04050",
      bottomGirl: "#3a5a9a",
      bottomBoy: "#3a5a9a",
      shoesGirl: "#ffffff",
      shoesBoy: "#ffffff",
      shoeStripe: "#ff5a6a",
      socks: "#ffffff",
      sockStripe: "#ff5a6a",
      clip: "#ff5a6a",
    },
    {
      id: "jersey",
      name: "10번 져지",
      vibe: "유니폼",
      for: "boy",
      cut: "jersey",
      bottom: "shorts",
      top: "#3b6cff",
      topShade: "#2a4fd0",
      bottomGirl: "#3b6cff",
      bottomBoy: "#3b6cff",
      shoesGirl: "#ffffff",
      shoesBoy: "#ffffff",
      shoeStripe: "#ffd15c",
      socks: "#ffffff",
      sockStripe: "#3b6cff",
      number: "#ffffff",
      clip: "#ffd15c",
    },
    {
      id: "ballet",
      name: "발레코어",
      vibe: "발레코어",
      for: "girl",
      cut: "cardigan",
      bottom: "skirt",
      top: "#ffe4f0",
      topShade: "#ffc4dc",
      inner: "#fff8fb",
      bottomGirl: "#ff8ab8",
      bottomBoy: "#ff8ab8",
      shoesGirl: "#ffc4dc",
      shoesBoy: "#ffc4dc",
      shoeStripe: "#ffffff",
      socks: "#ffffff",
      sockStripe: "#ff8ab8",
      ribbon: "#ff5e8a",
      clip: "#ff5e8a",
    },
    {
      id: "hachi",
      name: "비니 레이어드",
      vibe: "하치웨어",
      for: "girl",
      cut: "tee",
      bottom: "wide",
      top: "#5a7cff",
      topShade: "#3d5ad0",
      bottomGirl: "#2a2a32",
      bottomBoy: "#2a2a32",
      shoesGirl: "#f5f5f5",
      shoesBoy: "#f5f5f5",
      shoeStripe: "#5a7cff",
      socks: "#ffffff",
      sockStripe: "#5a7cff",
      beanie: "#e23b3b",
      pom: "#fff6e4",
      clip: "#e23b3b",
    },
    {
      id: "varsity",
      name: "바시티 자켓",
      vibe: "캠퍼스",
      for: "boy",
      cut: "varsity",
      bottom: "bermuda",
      top: "#1c2a6b",
      topShade: "#121c4a",
      sleeve: "#f4f1ea",
      letter: "#ffd15c",
      bottomGirl: "#3d4f3a",
      bottomBoy: "#3d4f3a",
      shoesGirl: "#f4efe4",
      shoesBoy: "#f4efe4",
      shoeStripe: "#1c2a6b",
      socks: "#ffffff",
      sockStripe: "#1c2a6b",
      clip: "#ffd15c",
    },
  ];

  const SKIN = "#f3c4a0";
  const LINE = "#3a2418";
  const HAIR = "#4a2c1c";
  const INK = "#111111";

  const HAMMER_DESIGNS = [
    {
      id: "cherry-stripe",
      name: "체리 사선",
      hint: "빨간 머리에 흰 줄무늬",
      color: "#e23b3b",
      pattern: "stripe",
      handle: "#d4a06a",
      grip: "#4aa3e8",
    },
    {
      id: "heart-pink",
      name: "하트 뿅",
      hint: "분홍 머리에 하트",
      color: "#ff6b9a",
      pattern: "hearts",
      handle: "#c47a3a",
      grip: "#ffd1e0",
    },
    {
      id: "star-lemon",
      name: "별레몬",
      hint: "노란 머리에 별",
      color: "#ffe34a",
      pattern: "stars",
      handle: "#8a5a32",
      grip: "#2b3a24",
    },
    {
      id: "dot-sky",
      name: "하늘점",
      hint: "파란 머리에 도트",
      color: "#4aa3e8",
      pattern: "dots",
      handle: "#d4a06a",
      grip: "#ffffff",
    },
    {
      id: "check-lime",
      name: "라임 체커",
      hint: "연두 머리에 체크",
      color: "#7dff4a",
      pattern: "checker",
      handle: "#3a2418",
      grip: "#222226",
    },
    {
      id: "zig-purple",
      name: "퍼플 지그",
      hint: "보라 머리에 지그재그",
      color: "#9b6dff",
      pattern: "zigzag",
      handle: "#d4a06a",
      grip: "#ffffff",
    },
    {
      id: "mint-solid",
      name: "민트 민무늬",
      hint: "민트색 통짜 머리",
      color: "#5ee0c0",
      pattern: "solid",
      handle: "#c47a3a",
      grip: "#2b3a24",
    },
    {
      id: "orange-stripe",
      name: "오렌지 사선",
      hint: "주황 머리에 사선",
      color: "#ff7a28",
      pattern: "stripe",
      handle: "#5a3518",
      grip: "#ffffff",
    },
    {
      id: "night-stars",
      name: "밤하늘",
      hint: "검정 머리에 노란 별",
      color: "#222226",
      pattern: "stars",
      handle: "#111114",
      grip: "#ffe34a",
    },
    {
      id: "cream-dots",
      name: "크림 도트",
      hint: "아이보리 머리에 빨간 점",
      color: "#f4f1ea",
      pattern: "dots",
      handle: "#c47a3a",
      grip: "#e23b3b",
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
  let scene = "login";
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
  let lastSfxAt = { pop: -9, miss: -9 };
  const ACCOUNT_KEY = "ppyong-account";
  const APPLE_CLIENT_ID = "";
  let account = null;
  let profileStep = 0;
  let avatar = {
    gender: "girl",
    outfitId: "lemon",
    hammerId: "cherry-stripe",
    complete: false,
  };

  function outfitsFor(gender) {
    return OUTFITS.filter((o) => o.for === gender || o.for === "any");
  }

  function hammerOf(id) {
    return HAMMER_DESIGNS.find((h) => h.id === id) || HAMMER_DESIGNS[0];
  }

  function ensureOutfitForGender() {
    const list = outfitsFor(avatar.gender);
    if (!list.some((o) => o.id === avatar.outfitId)) {
      avatar.outfitId = list[0].id;
    }
  }

  function avatarStorageKey() {
    return account ? `ppyong-avatar-${account.id}` : "ppyong-avatar-guest";
  }

  function loadAccount() {
    try {
      const raw = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
      if (raw && typeof raw.id === "string") account = raw;
    } catch (err) {
      account = null;
    }
  }

  function persistAccount() {
    if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    else localStorage.removeItem(ACCOUNT_KEY);
  }

  function loadAvatar() {
    const empty = {
      gender: "girl",
      outfitId: "lemon",
      hammerId: "cherry-stripe",
      complete: false,
    };
    avatar = { ...empty };
    try {
      const raw = JSON.parse(localStorage.getItem(avatarStorageKey()) || "{}");
      const legacy = JSON.parse(localStorage.getItem("mole-avatar") || "{}");
      const src = raw.gender ? raw : legacy;
      if (src.gender === "girl" || src.gender === "boy") avatar.gender = src.gender;
      if (OUTFITS.some((o) => o.id === src.outfitId)) avatar.outfitId = src.outfitId;
      if (HAMMER_DESIGNS.some((h) => h.id === src.hammerId)) avatar.hammerId = src.hammerId;
      else if (src.hammerColor) {
        const match = HAMMER_DESIGNS.find((h) => h.color === src.hammerColor);
        if (match) avatar.hammerId = match.id;
      }
      avatar.complete = Boolean(src.complete);
      ensureOutfitForGender();
    } catch (err) {
      /* keep defaults */
    }
  }

  function persistAvatar() {
    ensureOutfitForGender();
    localStorage.setItem(avatarStorageKey(), JSON.stringify(avatar));
    if (player) {
      player.gender = avatar.gender;
      player.outfitId = avatar.outfitId;
    }
    syncAvatarPickerUI();
    syncHammerButton();
  }

  function appleUserId(res) {
    const token = res && res.authorization && res.authorization.id_token;
    if (!token) return `apple-${Date.now()}`;
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      return String(payload.sub || token.slice(-24));
    } catch (err) {
      return token.slice(-24);
    }
  }

  function localAppleAccount() {
    let id = localStorage.getItem("ppyong-local-id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? `local-${crypto.randomUUID()}`
          : `local-${Date.now()}`;
      localStorage.setItem("ppyong-local-id", id);
    }
    return {
      id,
      name: "플레이어",
      email: "",
      apple: false,
    };
  }

  function finishLogin(next) {
    account = next;
    persistAccount();
    loadAvatar();
    if (avatar.complete) showTitle();
    else openProfile();
  }

  async function signInWithApple() {
    if (APPLE_CLIENT_ID && window.AppleID && window.AppleID.auth) {
      try {
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: "name email",
          redirectURI: window.location.origin,
          usePopup: true,
        });
        const res = await window.AppleID.auth.signIn();
        const user = res.user || {};
        const nameParts = [user.name && user.name.firstName, user.name && user.name.lastName].filter(
          Boolean
        );
        finishLogin({
          id: appleUserId(res),
          name: nameParts.join(" ") || "플레이어",
          email: user.email || "",
          apple: true,
        });
        return;
      } catch (err) {
        if (err && (err.error === "popup_closed_by_user" || err.error === "user_cancelled_authorize")) {
          return;
        }
      }
    }
    finishLogin(localAppleAccount());
  }

  function logout() {
    account = null;
    persistAccount();
    avatar.complete = false;
    scene = "login";
    show("profile", false);
    show("title", false);
    show("briefing", false);
    show("login", true);
  }

  function showTitle() {
    scene = "title";
    show("login", false);
    show("profile", false);
    show("briefing", false);
    show("title", true);
    if (el.profileAccount) {
      el.profileAccount.textContent = account
        ? account.apple
          ? account.email || "Apple ID"
          : "로컬 계정"
        : "Apple ID";
    }
    if (el.titleHello) {
      const who = account && account.name ? `${account.name}님, ` : "";
      el.titleHello.textContent = `${who}공원 구멍마다 누군가 고개를 내민다.`;
    }
  }

  function openProfile() {
    scene = "profile";
    profileStep = 0;
    show("login", false);
    show("title", false);
    show("briefing", false);
    show("profile", true);
    if (el.profileAccount) {
      el.profileAccount.textContent = account
        ? account.apple
          ? account.email || "Apple ID"
          : "로컬 계정"
        : "Apple ID";
    }
    renderProfileStep();
  }

  function openBriefing() {
    scene = "briefing";
    show("title", false);
    show("profile", false);
    show("login", false);
    show("result", false);
    show("roundOver", false);
    show("shop", false);
    show("hud", false);
    show("controls", false);
    show("briefing", true);
  }

  function beginPlay() {
    show("briefing", false);
    startRound();
  }

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
    const now = audioCtx.currentTime;
    if (name === "pop") {
      if (now - lastSfxAt.pop < 0.22) return;
      lastSfxAt.pop = now;
      tone(180, 0.12, "square", 0.04, 320);
      return;
    }
    if (name === "hit") {
      tone(140, 0.1, "sawtooth", 0.06, 60);
      tone(420, 0.08, "square", 0.03, 180);
    }
    if (name === "coin") {
      tone(660, 0.08, "sine", 0.05, 990);
    }
    if (name === "buy") tone(520, 0.16, "triangle", 0.05, 780);
    if (name === "miss") {
      if (now - lastSfxAt.miss < 0.28) return;
      lastSfxAt.miss = now;
      tone(180, 0.14, "sine", 0.04, 90);
      return;
    }
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
      gender: avatar.gender,
      outfitId: avatar.outfitId,
    };
  }

  function placeDecor() {
    const rand = rng(20260817);
    trees = [];
    flowers = [];
    for (let i = 0; i < 78; i++) {
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
    for (let i = 0; i < 270; i++) {
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
    while (list.length < 80 && tries < 9000) {
      tries += 1;
      const x = 130 + Math.random() * (WORLD_W - 260);
      const y = 150 + Math.random() * (WORLD_H - 280);
      if (inPond(x, y, 80)) continue;
      if (Math.hypot(x - SAFE_SPAWN.x, y - SAFE_SPAWN.y) < 90) continue;
      if (list.some((h) => dist(h, { x, y }) < 118)) continue;
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 46)) continue;
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

    for (let i = 0; i < 16000; i++) {
      const x = rand() * WORLD_W;
      const y = rand() * WORLD_H;
      g.fillStyle = rand() > 0.5 ? "rgba(90, 160, 60, 0.35)" : "rgba(180, 220, 90, 0.28)";
      g.fillRect(x, y, 2 + rand() * 2, 3 + rand() * 5);
    }

    const paths = [
      [
        [240, 660],
        [1560, 840, 2100, 1560],
        [2820, 2460, 3840, 2280],
        [4680, 2100, 5100, 2940],
      ],
      [
        [360, 3180],
        [1680, 2100, 2760, 1260],
        [3900, 720, 5040, 480],
      ],
      [
        [720, 1860],
        [1980, 2400, 3180, 1980],
        [4200, 1500, 4860, 1860],
      ],
    ];
    paths.forEach((pts) => {
      g.strokeStyle = "#c9a36b";
      g.lineWidth = 78;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        g.quadraticCurveTo(pts[i][0], pts[i][1], pts[i][2], pts[i][3]);
      }
      g.stroke();
      g.strokeStyle = "#e6c58a";
      g.lineWidth = 48;
      g.stroke();
    });

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

    [
      [3540, 1080, -0.2],
      [1860, 1680, 0.35],
      [4320, 3120, -0.5],
    ].forEach(([x, y, rot]) => {
      g.fillStyle = "#e8d27a";
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillRect(-70, -48, 140, 96);
      g.restore();
    });

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
      stay: 2.1 + Math.random() * 1.2,
      bob: Math.random() * Math.PI * 2,
    };
    if (scene === "play") sfx("pop");
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
    if (scene !== "play") return;
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
    spawnAcc = 1;
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
    show("login", false);
    show("profile", false);
    show("briefing", false);
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
    if (!node) return;
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
      interval: Math.max(0.035, 0.1 - t * 0.0025),
      maxUp: Math.min(70, 32 + Math.floor(t / 5)),
      burst: t > 24 ? 8 : t > 8 ? 6 : 4,
    };
  }

  function updateMoles(dt) {
    const diff = difficulty();
    const upCount = holes.filter((h) => h.mole && h.mole.state !== "hit").length;
    spawnAcc += dt;
    if (scene === "play" && spawnAcc >= diff.interval && upCount < diff.maxUp) {
      spawnAcc = 0;
      const n = Math.min(diff.burst, diff.maxUp - upCount);
      for (let i = 0; i < n; i++) spawnMole();
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
      gameOver("스컹크 방귀가 퍼져서 게임이 끝났어요.");
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
      el.resultTitle.textContent = "오늘은 여기까지!";
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
    if (scene === "title" || scene === "login" || scene === "profile" || scene === "briefing") {
      demoTime += dt;
      if (player) {
        player.runT += dt * 8;
        player.facing = Math.sin(demoTime * 0.8) >= 0 ? 0 : Math.PI;
      }
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
    const x = hole.x;
    const y = hole.y;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = "#cdb67e";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x - 36, y + 8);
    ctx.quadraticCurveTo(x - 30, y - 10, x - 16, y - 5);
    ctx.quadraticCurveTo(x, y - 14, x + 16, y - 5);
    ctx.quadraticCurveTo(x + 30, y - 10, x + 36, y + 8);
    ctx.quadraticCurveTo(x + 10, y + 18, x, y + 16);
    ctx.quadraticCurveTo(x - 10, y + 18, x - 36, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1a120c";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 15, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.7;
    [
      [-20, 6], [-8, 10], [10, 8], [22, 5],
    ].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.lineTo(x + dx + 5, y + dy - 4);
      ctx.stroke();
    });
  }

  function drawAnimalFace(kind, x, faceY) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;

    if (kind === "rabbit") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x - 6.5, faceY, 5.2, 5.8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 6.5, faceY, 5.2, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x - 6.5, faceY + 0.6, 2.4, 0, Math.PI * 2);
      ctx.arc(x + 6.5, faceY + 0.6, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x - 5.4, faceY - 0.8, 1.1, 0, Math.PI * 2);
      ctx.arc(x + 7.6, faceY - 0.8, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8aa8";
      ctx.beginPath();
      ctx.ellipse(x, faceY + 8, 3.4, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 3, faceY + 8);
      ctx.lineTo(x - 14, faceY + 6);
      ctx.moveTo(x - 3, faceY + 10);
      ctx.lineTo(x - 13, faceY + 12);
      ctx.moveTo(x + 3, faceY + 8);
      ctx.lineTo(x + 14, faceY + 6);
      ctx.moveTo(x + 3, faceY + 10);
      ctx.lineTo(x + 13, faceY + 12);
      ctx.stroke();
      return;
    }

    if (kind === "skunk") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x - 6.2, faceY, 4.6, 5.2, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 6.2, faceY, 4.6, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x - 6.2, faceY + 0.8, 2.2, 0, Math.PI * 2);
      ctx.arc(x + 6.2, faceY + 0.8, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4a1020";
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(x - 12, faceY - 7);
      ctx.lineTo(x - 4, faceY - 3);
      ctx.moveTo(x + 12, faceY - 7);
      ctx.lineTo(x + 4, faceY - 3);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x, faceY + 7.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (kind === "raccoon") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x - 6.4, faceY, 4.8, 5.4, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 6.4, faceY, 4.8, 5.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(x - 6.4, faceY + 0.5, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 6.4, faceY + 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x - 5.2, faceY - 0.7, 1, 0, Math.PI * 2);
      ctx.arc(x + 7.6, faceY - 0.7, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x, faceY + 8, 3.2, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (kind === "gold") {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x - 5.8, faceY, 3.4, 4.2, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 5.8, faceY, 3.4, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x - 4.8, faceY - 1, 1.1, 0, Math.PI * 2);
      ctx.arc(x + 6.8, faceY - 1, 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8aa8";
      ctx.beginPath();
      ctx.arc(x, faceY + 6.5, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 3, faceY + 7);
      ctx.lineTo(x - 12, faceY + 5);
      ctx.moveTo(x + 3, faceY + 7);
      ctx.lineTo(x + 12, faceY + 5);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, faceY + 10, 4.2, 0.2, Math.PI - 0.2);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(x - 6, faceY, 2.1, 0, Math.PI * 2);
    ctx.arc(x + 6, faceY, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 3.2, faceY + 7);
    ctx.lineTo(x + 3.2, faceY + 7);
    ctx.stroke();
  }

  function drawAnimal(kind, x, y, pop, parts) {
    const h = 18 + pop * 26;
    const rx = 15 + pop * 3;
    let body = "#5c4033";
    if (kind === "gold") body = "#e8b423";
    else if (kind === "skunk") body = "#2a2a32";
    else if (kind === "rabbit") body = "#e8d0b0";
    else if (kind === "raccoon") body = "#7a6a5a";

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = INK;

    if (parts !== "arms") {
      if (kind === "rabbit") {
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(x + side * 9, y - h + 2);
          ctx.rotate(side * 0.18);
          ctx.fillStyle = body;
          ctx.beginPath();
          ctx.ellipse(0, -18, 6.5, 20, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffb7c8";
          ctx.beginPath();
          ctx.ellipse(0, -16, 2.8, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (kind === "skunk" || kind === "raccoon") {
        [-1, 1].forEach((side) => {
          ctx.fillStyle = body;
          ctx.beginPath();
          ctx.ellipse(x + side * 12, y - h + 8, 6, 7.5, side * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = kind === "raccoon" ? "#f0cbb8" : "#f4f1ea";
          ctx.beginPath();
          ctx.ellipse(x + side * 12, y - h + 9, 2.6, 3.2, side * 0.28, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(x - rx, y);
      ctx.bezierCurveTo(x - rx - 1, y - h * 1.15, x + rx + 1, y - h * 1.15, x + rx, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (kind === "skunk") {
        ctx.fillStyle = "#f4f1ea";
        ctx.beginPath();
        ctx.moveTo(x - 3.8, y - 2);
        ctx.quadraticCurveTo(x, y - h * 0.98, x + 3.8, y - 2);
        ctx.closePath();
        ctx.fill();
      }
      if (kind === "gold") {
        ctx.fillStyle = "#ffe56b";
        ctx.beginPath();
        ctx.moveTo(x - 9, y - h + 10);
        ctx.lineTo(x - 5, y - h - 8);
        ctx.lineTo(x, y - h + 8);
        ctx.lineTo(x + 5, y - h - 8);
        ctx.lineTo(x + 9, y - h + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      if (kind === "raccoon") {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x, y - h * 0.58, rx * 0.82, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      drawAnimalFace(kind, x, y - h * 0.62);
    }

    if (parts !== "body") {
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = INK;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(x + side * (rx - 3), y - h * 0.28);
        ctx.quadraticCurveTo(x + side * 8, y - 2, x + side * 7, y + 3);
        ctx.stroke();
        ctx.fillStyle = "#f2d4c2";
        ctx.beginPath();
        ctx.ellipse(x + side * 8, y + 4, 4.2, 3.2, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 2.6;
      });
    }
  }

  function drawMole(hole) {
    const m = hole.mole;
    if (!m || m.height <= 0.02) return;
    const pop = m.height;
    const x = hole.x;
    const y = hole.y - 2 + Math.sin(m.bob) * 0.6;
    drawShadow(x, hole.y + 8, 14 + pop * 8, 6);
    drawAnimal(m.kind, x, y, pop, "body");
    drawHole(hole);
    drawAnimal(m.kind, x, y, pop, "arms");
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

  function outfitOf(id) {
    return OUTFITS.find((o) => o.id === id) || OUTFITS[0];
  }

  function fillRound(g, x, y, w, h, r, color) {
    g.fillStyle = color;
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, w, h, r);
    else {
      g.rect(x, y, w, h);
    }
    g.fill();
  }

  function strokeRound(g, x, y, w, h, r) {
    g.strokeStyle = LINE;
    g.lineWidth = 1.5;
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, w, h, r);
    else g.rect(x, y, w, h);
    g.stroke();
  }

  function hammerAccent(hex) {
    const n = parseInt((hex || "#e23b3b").slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#2b3a24" : "#fff8e8";
  }

  function paintHammerPattern(g, x, y, w, h, pattern, color) {
    if (!pattern || pattern === "solid") return;
    const acc = hammerAccent(color);
    const s = Math.max(1, Math.min(w, h) / 14);
    g.save();
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, w, h, Math.min(4 * s, 16));
    else g.rect(x, y, w, h);
    g.clip();
    g.fillStyle = acc;
    g.strokeStyle = acc;
    g.globalAlpha = 0.55;
    if (pattern === "stripe") {
      const gap = 7 * s;
      for (let i = -h; i < w + h; i += gap) {
        g.save();
        g.translate(x + i, y);
        g.rotate(0.5);
        g.fillRect(0, -6 * s, 3.2 * s, h + 16 * s);
        g.restore();
      }
    } else if (pattern === "dots") {
      const gap = 7 * s;
      for (let yy = 4 * s; yy < h; yy += gap) {
        for (let xx = 4 * s; xx < w; xx += gap) {
          g.beginPath();
          g.arc(x + xx, y + yy, 1.6 * s, 0, Math.PI * 2);
          g.fill();
        }
      }
    } else if (pattern === "hearts") {
      const gap = 10 * s;
      for (let yy = 4 * s; yy < h - 2; yy += gap) {
        for (let xx = 6 * s; xx < w - 2; xx += gap) {
          g.beginPath();
          g.arc(x + xx - 1.5 * s, y + yy, 1.5 * s, 0, Math.PI * 2);
          g.arc(x + xx + 1.5 * s, y + yy, 1.5 * s, 0, Math.PI * 2);
          g.fill();
          g.beginPath();
          g.moveTo(x + xx - 3 * s, y + yy + 0.4 * s);
          g.lineTo(x + xx, y + yy + 3.6 * s);
          g.lineTo(x + xx + 3 * s, y + yy + 0.4 * s);
          g.fill();
        }
      }
    } else if (pattern === "stars") {
      g.font = `${Math.max(8, 8 * s)}px sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const gap = 10 * s;
      for (let yy = 6 * s; yy < h; yy += gap) {
        for (let xx = 6 * s; xx < w; xx += gap) {
          g.fillText("★", x + xx, y + yy);
        }
      }
    } else if (pattern === "checker") {
      g.globalAlpha = 0.32;
      const cell = 5 * s;
      for (let yy = 0; yy < h; yy += cell) {
        for (let xx = 0; xx < w; xx += cell) {
          if (((xx + yy) / cell) % 2) g.fillRect(x + xx, y + yy, cell, cell);
        }
      }
    } else if (pattern === "zigzag") {
      g.lineWidth = 2 * s;
      g.globalAlpha = 0.55;
      for (let yy = 3 * s; yy < h; yy += 6 * s) {
        g.beginPath();
        g.moveTo(x, y + yy);
        for (let xx = 0; xx <= w; xx += 6 * s) {
          g.lineTo(x + xx, y + yy + ((xx / (6 * s)) % 2 ? 3 * s : 0));
        }
        g.stroke();
      }
    }
    g.restore();
  }

  function drawMallet(g, swing, design) {
    const d = design || hammerOf(avatar.hammerId);
    const color = d.color || "#e23b3b";
    const pattern = d.pattern || "solid";
    const cap = hammerAccent(color);
    g.save();
    g.translate(15, -30);
    g.rotate(-0.85 + swing * 2.35);
    fillRound(g, -2.4, -4, 4.8, 24, 1.8, d.handle || "#d4a06a");
    g.strokeStyle = LINE;
    g.lineWidth = 1.2;
    g.stroke();
    fillRound(g, -3.4, -8, 6.8, 6.4, 1.6, d.grip || "#4aa3e8");
    fillRound(g, -15, -20, 30, 14, 4, color);
    paintHammerPattern(g, -15, -20, 30, 14, pattern, color);
    g.strokeStyle = LINE;
    g.lineWidth = 1.5;
    g.beginPath();
    if (g.roundRect) g.roundRect(-15, -20, 30, 14, 4);
    else g.rect(-15, -20, 30, 14);
    g.stroke();
    fillRound(g, -15, -20, 5.5, 14, 3, cap);
    fillRound(g, 9.5, -20, 5.5, 14, 3, cap);
    g.fillStyle = cap;
    g.beginPath();
    g.arc(0, -21, 2.4, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function drawHammerPortrait(g, design, w, h) {
    g.clearRect(0, 0, w, h);
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#fff8ea");
    sky.addColorStop(1, "#e8d9b0");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.beginPath();
    g.ellipse(w * 0.22, h * 0.16, 28, 12, 0, 0, Math.PI * 2);
    g.ellipse(w * 0.78, h * 0.2, 22, 10, 0, 0, Math.PI * 2);
    g.fill();
    const d = design || hammerOf(avatar.hammerId);
    const color = d.color;
    const cap = hammerAccent(color);
    const hx = w * 0.5;
    const hy = h * 0.18;
    const hw = w * 0.72;
    const hh = h * 0.28;
    const handleW = w * 0.12;
    const handleH = h * 0.48;
    g.save();
    g.translate(hx, hy + hh * 0.55);
    g.rotate(-0.18);
    fillRound(g, -handleW / 2, hh * 0.2, handleW, handleH, handleW * 0.4, d.handle || "#d4a06a");
    g.strokeStyle = LINE;
    g.lineWidth = 3;
    g.stroke();
    fillRound(
      g,
      -handleW * 0.7,
      hh * 0.28,
      handleW * 1.4,
      handleH * 0.18,
      6,
      d.grip || "#4aa3e8"
    );
    fillRound(g, -hw / 2, -hh / 2, hw, hh, 16, color);
    paintHammerPattern(g, -hw / 2, -hh / 2, hw, hh, d.pattern, color);
    g.strokeStyle = LINE;
    g.lineWidth = 4;
    g.beginPath();
    if (g.roundRect) g.roundRect(-hw / 2, -hh / 2, hw, hh, 16);
    else g.rect(-hw / 2, -hh / 2, hw, hh);
    g.stroke();
    fillRound(g, -hw / 2, -hh / 2, hw * 0.16, hh, 10, cap);
    fillRound(g, hw / 2 - hw * 0.16, -hh / 2, hw * 0.16, hh, 10, cap);
    g.fillStyle = "rgba(255,255,255,0.35)";
    fillRound(g, -hw / 2 + 14, -hh / 2 + 10, hw * 0.28, hh * 0.22, 8, "rgba(255,255,255,0.35)");
    g.restore();
  }

  function drawAvatar(g, spec) {
    const o = outfitOf(spec.outfitId);
    const girl = spec.gender !== "boy";
    const run = Math.sin(spec.runT || 0) * 4.2;
    const swing = spec.swingT > 0 ? 1 - spec.swingT / 0.2 : 0;
    const t = performance.now() / 1000;
    const wet = spec.wet;
    const bounce = Math.abs(Math.sin(spec.runT || 0)) * -1.6;
    const kick = wet ? Math.sin(t * 16) * 7 : run;
    const bottom = girl ? o.bottomGirl : o.bottomBoy;
    const shoes = girl ? o.shoesGirl : o.shoesBoy;
    const skirt = girl && (o.bottom === "skirt" || o.bottom === "tennis");

    g.save();
    if (wet) g.globalAlpha = 0.8;
    if (spec.trip) g.rotate(Math.sin(t * 10) * 0.28);
    if (spec.flip) g.scale(-1, 1);
    g.translate(0, bounce);

    g.lineJoin = "round";
    g.lineCap = "round";

    [-1, 1].forEach((side) => {
      const k = side < 0 ? kick : -kick;
      fillRound(g, side * 5.5 - 3.6, -11 + k * 0.12, 7.2, 9, 2, o.socks);
      g.fillStyle = o.sockStripe;
      g.fillRect(side * 5.5 - 3, -6 + k * 0.12, 6, 1.4);
      fillRound(g, side * 5.5 - 5.5, -4 + k * 0.1, 12, 5.5, 2.4, shoes);
      g.fillStyle = o.shoeStripe;
      g.fillRect(side * 5.5 - 4, -1.4 + k * 0.1, 9, 1.5);
    });

    if (skirt) {
      g.fillStyle = bottom;
      g.beginPath();
      g.moveTo(-7, -22);
      g.lineTo(-13, -10);
      g.quadraticCurveTo(0, -7, 13, -10);
      g.lineTo(7, -22);
      g.closePath();
      g.fill();
      g.strokeStyle = LINE;
      g.lineWidth = 1.4;
      g.stroke();
    } else {
      const wide = o.bottom === "wide" || o.bottom === "cargo" ? 11 : 9;
      fillRound(g, -wide, -22, wide * 2, o.bottom === "wide" ? 14 : 12, 4, bottom);
      strokeRound(g, -wide, -22, wide * 2, o.bottom === "wide" ? 14 : 12, 4);
      if (o.bottom === "cargo") {
        fillRound(g, -wide - 1, -16, 6, 6, 1.5, o.topShade || bottom);
        fillRound(g, wide - 5, -16, 6, 6, 1.5, o.topShade || bottom);
      }
      if (o.cut === "track" && o.stripes) {
        g.strokeStyle = o.stripes;
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(-4, -20);
        g.lineTo(-4, -11);
        g.moveTo(-2, -20);
        g.lineTo(-2, -11);
        g.stroke();
      }
    }

    g.fillStyle = SKIN;
    g.beginPath();
    g.ellipse(-13, -28, 4.2, 3.4, -0.4, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(14, -27 + swing * -2, 4.4, 3.6, 0.2, 0, Math.PI * 2);
    g.fill();

    if (o.cut === "hoodie" || o.cut === "track") {
      g.fillStyle = o.topShade;
      g.beginPath();
      g.ellipse(0, -40, 11, 7, 0, 0, Math.PI * 2);
      g.fill();
    }

    fillRound(g, -11, -40, 22, 20, 7, spec.slash ? "#ffb3b3" : wet ? "#7ec8e8" : o.top);
    strokeRound(g, -11, -40, 22, 20, 7);

    if (o.cut === "anorak") {
      fillRound(g, -11, -40, 8, 20, 6, o.panel);
      g.fillStyle = "#d8dee8";
      g.fillRect(-1, -38, 2, 16);
    }
    if (o.cut === "rugby") {
      g.fillStyle = o.stripe;
      g.fillRect(-11, -34, 22, 3.2);
      g.fillRect(-11, -27, 22, 3.2);
    }
    if (o.cut === "track" && o.stripes) {
      g.strokeStyle = o.stripes;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(8, -38);
      g.lineTo(10, -22);
      g.moveTo(10.4, -38);
      g.lineTo(12.2, -22);
      g.stroke();
    }
    if (o.cut === "polo") {
      g.fillStyle = o.accent;
      g.beginPath();
      g.moveTo(-4, -40);
      g.lineTo(0, -35);
      g.lineTo(4, -40);
      g.fill();
    }
    if (o.cut === "cardigan") {
      fillRound(g, -6, -38, 12, 16, 4, o.inner);
      g.strokeStyle = o.ribbon;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(0, -36);
      g.lineTo(0, -24);
      g.stroke();
    }
    if (o.cut === "jersey" && o.number) {
      g.fillStyle = o.number;
      g.font = "bold 9px Jua, sans-serif";
      g.textAlign = "center";
      g.fillText("10", 0, -26);
    }
    if (o.cut === "varsity") {
      fillRound(g, -11, -40, 7, 20, 6, o.sleeve || "#f4f1ea");
      fillRound(g, 4, -40, 7, 20, 6, o.sleeve || "#f4f1ea");
      g.fillStyle = o.letter || "#ffd15c";
      g.font = "bold 11px Jua, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("P", 0, -28);
    }
    if (o.strings) {
      g.strokeStyle = o.strings;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(-3, -39);
      g.lineTo(-4, -32);
      g.moveTo(3, -39);
      g.lineTo(4, -32);
      g.stroke();
    }
    if (o.cut === "hoodie" || o.cut === "tee") {
      fillRound(g, -6, -28, 12, 6, 2, o.topShade);
    }

    g.fillStyle = SKIN;
    g.beginPath();
    g.ellipse(0, -48, 13.2, 14.2, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = LINE;
    g.lineWidth = 1.7;
    g.stroke();

    g.fillStyle = HAIR;
    if (girl) {
      g.beginPath();
      g.ellipse(0, -54, 14.4, 10, 0, Math.PI, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(-11.5, -46, 4.8, 8, 0.25, 0, Math.PI * 2);
      g.ellipse(11.5, -46, 4.8, 8, -0.25, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(-5, -57, 6, 4.5, -0.4, 0, Math.PI * 2);
      g.ellipse(6, -57, 6, 4.5, 0.35, 0, Math.PI * 2);
      g.fill();
    } else {
      g.beginPath();
      g.ellipse(0, -55, 13.4, 8.5, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(-11, -54);
      g.lineTo(-7, -64);
      g.lineTo(-3, -55);
      g.lineTo(1, -63);
      g.lineTo(5, -55);
      g.lineTo(9, -62);
      g.lineTo(12, -52);
      g.closePath();
      g.fill();
    }

    if (o.beanie) {
      fillRound(g, -14, -64, 28, 12, 6, o.beanie);
      g.fillStyle = o.pom || "#fff6e4";
      g.beginPath();
      g.arc(0, -66, 3.2, 0, Math.PI * 2);
      g.fill();
    } else if (o.ribbon) {
      g.fillStyle = o.ribbon;
      g.beginPath();
      g.moveTo(-1, -64);
      g.lineTo(-10, -70);
      g.lineTo(-8, -60);
      g.lineTo(0, -63);
      g.lineTo(8, -60);
      g.lineTo(10, -70);
      g.lineTo(1, -64);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(0, -63, 2.4, 0, Math.PI * 2);
      g.fill();
    } else if (o.visor) {
      fillRound(g, -12, -62, 24, 5, 2, o.visor);
      fillRound(g, -4, -64, 16, 4, 2, o.visor);
    } else if (girl) {
      fillRound(g, -12, -58, 7, 3.6, 1.4, o.clip);
    }

    g.fillStyle = "#1a120c";
    g.beginPath();
    g.ellipse(-5.2, -49, 2.6, 3.2, 0, 0, Math.PI * 2);
    g.ellipse(5.2, -49, 2.6, 3.2, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(-4.2, -50.2, 0.9, 0, Math.PI * 2);
    g.arc(6.2, -50.2, 0.9, 0, Math.PI * 2);
    g.fill();
    if (wet) {
      g.strokeStyle = LINE;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-6, -44);
      g.lineTo(-2, -42);
      g.moveTo(6, -44);
      g.lineTo(2, -42);
      g.stroke();
    } else {
      g.fillStyle = "#ff8aa5";
      g.beginPath();
      g.arc(0, -44.2, 1.7, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = LINE;
      g.lineWidth = 1.3;
      g.beginPath();
      g.arc(0, -42.5, 3.2, 0.15, Math.PI - 0.15);
      g.stroke();
    }

    drawMallet(g, swing + (wet ? Math.sin(t * 14) * 0.25 : 0));
    g.restore();
  }

  function drawPlayer() {
    const p = player;
    const wet = soaked > 0 && stunKind === "water";
    const trip = soaked > 0 && stunKind === "rabbit";
    const t = performance.now() / 1000;
    drawShadow(p.x, p.y, 16, 8);
    ctx.save();
    ctx.translate(p.x, p.y + (wet ? 10 + Math.sin(t * 14) * 3 : 0));
    drawAvatar(ctx, {
      gender: p.gender || avatar.gender,
      outfitId: p.outfitId || avatar.outfitId,
      runT: p.runT,
      swingT: p.swingT,
      wet,
      trip,
      slash: slashT > 0,
      flip: Math.cos(p.facing) < 0,
    });
    ctx.restore();
  }

  function syncAvatarPickerUI() {
    document.querySelectorAll(".char-card").forEach((b) => {
      b.classList.toggle("selected", b.dataset.gender === avatar.gender);
    });
    document.querySelectorAll(".outfit-chip").forEach((b) => {
      b.classList.toggle("selected", b.dataset.outfit === avatar.outfitId);
    });
    document.querySelectorAll(".hammer-card").forEach((b) => {
      b.classList.toggle("selected", b.dataset.hammer === avatar.hammerId);
    });
  }

  function syncHammerButton() {
    const head = document.querySelector("#btn-hammer .mallet-icon rect[width='46']");
    if (head) head.setAttribute("fill", hammerOf(avatar.hammerId).color);
  }

  function paintPreviewBg(g, w, h) {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#8ecfff");
    sky.addColorStop(0.52, "#c8ec8a");
    sky.addColorStop(1, "#6bb34d");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.82)";
    g.beginPath();
    g.ellipse(w * 0.24, h * 0.16, 22, 11, 0, 0, Math.PI * 2);
    g.ellipse(w * 0.74, h * 0.12, 26, 13, 0, 0, Math.PI * 2);
    g.fill();
  }

  function mountGenderCards() {
    const chars = el.profileChars;
    if (!chars) return;
    chars.innerHTML = "";
    ["girl", "boy"].forEach((gender) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "char-card";
      btn.dataset.gender = gender;
      const cv = document.createElement("canvas");
      cv.width = 240;
      cv.height = 270;
      cv.dataset.previewGender = gender;
      const label = document.createElement("span");
      label.textContent = gender === "girl" ? "여자" : "남자";
      btn.append(cv, label);
      btn.addEventListener("click", () => {
        avatar.gender = gender;
        ensureOutfitForGender();
        persistAvatar();
      });
      chars.append(btn);
    });
  }

  function mountOutfitCards() {
    const outfits = el.profileOutfits;
    if (!outfits) return;
    outfits.innerHTML = "";
    outfitsFor(avatar.gender).forEach((o) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "outfit-chip";
      btn.dataset.outfit = o.id;
      const cv = document.createElement("canvas");
      cv.width = 144;
      cv.height = 176;
      cv.dataset.previewOutfit = o.id;
      const txt = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = o.name;
      const vibe = document.createElement("small");
      vibe.textContent = o.vibe;
      txt.append(name, vibe);
      btn.append(cv, txt);
      btn.addEventListener("click", () => {
        avatar.outfitId = o.id;
        persistAvatar();
      });
      outfits.append(btn);
    });
  }

  function mountHammerCards() {
    const root = el.profileHammers;
    if (!root) return;
    root.innerHTML = "";
    HAMMER_DESIGNS.forEach((d) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hammer-card";
      btn.dataset.hammer = d.id;
      const cv = document.createElement("canvas");
      cv.width = 280;
      cv.height = 280;
      cv.dataset.hammerPreview = d.id;
      const txt = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = d.name;
      const hint = document.createElement("small");
      hint.textContent = d.hint;
      txt.append(name, hint);
      btn.append(cv, txt);
      btn.addEventListener("click", () => {
        avatar.hammerId = d.id;
        persistAvatar();
      });
      root.append(btn);
    });
  }

  function renderProfileStep() {
    const labels = ["1. 성별을 정하세요", "2. 코디를 고르세요", "3. 뿅망치를 고르세요"];
    if (el.profileStepLabel) el.profileStepLabel.textContent = labels[profileStep];
    el.profileStepGender.classList.toggle("hidden", profileStep !== 0);
    el.profileStepOutfit.classList.toggle("hidden", profileStep !== 1);
    el.profileStepHammer.classList.toggle("hidden", profileStep !== 2);
    const back = document.getElementById("btn-profile-back");
    const next = document.getElementById("btn-profile-next");
    back.disabled = profileStep === 0 && !avatar.complete;
    back.textContent = profileStep === 0 ? "타이틀로" : "이전";
    next.textContent = profileStep === 2 ? "완료" : "다음";
    if (profileStep === 1) mountOutfitCards();
    if (profileStep === 2) mountHammerCards();
    syncAvatarPickerUI();
    syncHammerButton();
  }

  function finishProfile() {
    avatar.complete = true;
    persistAvatar();
    showTitle();
  }

  function drawAvatarPreviews() {
    document.querySelectorAll("canvas[data-preview-gender]").forEach((cv) => {
      if (cv.closest(".hidden")) return;
      const g = cv.getContext("2d");
      const w = cv.width;
      const h = cv.height;
      g.clearRect(0, 0, w, h);
      paintPreviewBg(g, w, h);
      g.save();
      g.translate(w / 2, h * 0.92);
      g.scale(w / 86, w / 86);
      drawAvatar(g, {
        gender: cv.dataset.previewGender,
        outfitId:
          cv.dataset.previewGender === avatar.gender
            ? avatar.outfitId
            : outfitsFor(cv.dataset.previewGender)[0].id,
        runT: performance.now() / 140,
        swingT: 0,
        flip: false,
      });
      g.restore();
    });
    document.querySelectorAll("canvas[data-preview-outfit]").forEach((cv) => {
      if (cv.closest(".hidden")) return;
      const g = cv.getContext("2d");
      const w = cv.width;
      const h = cv.height;
      g.clearRect(0, 0, w, h);
      paintPreviewBg(g, w, h);
      g.save();
      g.translate(w / 2, h * 0.94);
      g.scale(w / 72, w / 72);
      drawAvatar(g, {
        gender: avatar.gender,
        outfitId: cv.dataset.previewOutfit,
        runT: performance.now() / 160,
        swingT: 0,
        flip: false,
      });
      g.restore();
    });
    document.querySelectorAll("canvas[data-hammer-preview]").forEach((cv) => {
      if (cv.closest(".hidden")) return;
      const g = cv.getContext("2d");
      drawHammerPortrait(g, hammerOf(cv.dataset.hammerPreview), cv.width, cv.height);
    });
    if (el.titleMe && scene === "title") {
      const cv = el.titleMe;
      const g = cv.getContext("2d");
      paintPreviewBg(g, cv.width, cv.height);
      g.save();
      g.translate(cv.width / 2, cv.height * 0.92);
      g.scale(cv.width / 78, cv.width / 78);
      drawAvatar(g, {
        gender: avatar.gender,
        outfitId: avatar.outfitId,
        runT: performance.now() / 140,
        swingT: 0.08,
        flip: false,
      });
      g.restore();
    }
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

    for (const hole of holes) {
      if (!hole.mole) drawHole(hole);
    }

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
    if (scene === "title" || scene === "profile") drawAvatarPreviews();
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
      openBriefing();
    });
    document.getElementById("btn-apple").addEventListener("click", () => {
      ensureAudio();
      signInWithApple();
    });
    document.getElementById("btn-open-profile").addEventListener("click", () => {
      ensureAudio();
      openProfile();
    });
    document.getElementById("btn-profile-back").addEventListener("click", () => {
      if (profileStep === 0) {
        if (avatar.complete) showTitle();
        return;
      }
      profileStep -= 1;
      renderProfileStep();
    });
    document.getElementById("btn-profile-next").addEventListener("click", () => {
      if (profileStep >= 2) {
        finishProfile();
        return;
      }
      profileStep += 1;
      renderProfileStep();
    });
    document.getElementById("btn-logout").addEventListener("click", () => {
      logout();
    });
    document.getElementById("btn-briefing-go").addEventListener("click", () => {
      ensureAudio();
      beginPlay();
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
      openBriefing();
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
    loadAccount();
    loadAvatar();
    mountGenderCards();
    syncHammerButton();
    placeDecor();
    holes = placeHoles();
    parkCanvas = bakePark();
    player = makePlayer();
    resetProgress();
    bindControls();
    if (account && avatar.complete) showTitle();
    else if (account) openProfile();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", ensureAudio, { once: true });
    requestAnimationFrame(loop);
  }

  init();
})();
