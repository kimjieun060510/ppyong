(() => {
  "use strict";

  const WORLD_W = 5280;
  const WORLD_H = 3960;
  const ZOOM = 1.15;
  const ROUND_TIME = 40;
  const TOTAL_ROUNDS = 6;
  const WATER_TIME = 5;
  const RABBIT_TIME = 3;
  const PONDS = [
    { x: 1290, y: 2940, rx: 210, ry: 114 },
    { x: 780, y: 720, rx: 168, ry: 94 },
    { x: 4020, y: 560, rx: 196, ry: 108 },
    { x: 4680, y: 2160, rx: 154, ry: 88 },
    { x: 2580, y: 3480, rx: 188, ry: 102 },
  ];
  const SAFE_SPAWN = { x: WORLD_W * 0.55, y: WORLD_H * 0.42 };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const el = {
    hud: document.getElementById("hud"),
    login: document.getElementById("login"),
    title: document.getElementById("title"),
    titleMe: document.getElementById("title-me"),
    titleHello: document.getElementById("title-hello"),
    titleWallet: document.getElementById("title-wallet"),
    guestBlock: document.getElementById("guest-block"),
    playBlock: document.getElementById("play-block"),
    titleStages: document.getElementById("title-stages"),
    profileWallet: document.getElementById("profile-wallet"),
    profileHeading: document.getElementById("profile-heading"),
    profileHome: document.getElementById("profile-home"),
    profileCustom: document.getElementById("profile-custom"),
    profileStages: document.getElementById("profile-stages"),
    profileMe: document.getElementById("profile-me"),
    profileStageNow: document.getElementById("profile-stage-now"),
    stageRow: document.getElementById("stage-row"),
    score: document.getElementById("score-count"),
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
    roundOver: document.getElementById("round-over"),
    roundNum: document.getElementById("round-num"),
    roundMoles: document.getElementById("round-moles"),
    result: document.getElementById("result"),
    resultTitle: document.getElementById("result-title"),
    resultScore: document.getElementById("result-score"),
    resultCoins: document.getElementById("result-coins"),
    resultMoles: document.getElementById("result-moles"),
    resultNote: document.getElementById("result-note"),
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

  const STATS = {
    range: 62,
    swing: 0.46,
    move: 185,
    luck: 1,
    aoe: false,
  };

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
    {
      id: "picnic",
      name: "피크닉 체크",
      vibe: "공원 낮",
      for: "any",
      cost: 80,
      cut: "tee",
      bottom: "skirt",
      top: "#fff6e4",
      topShade: "#e8d9b0",
      bottomGirl: "#e23b3b",
      bottomBoy: "#2f4f9a",
      shoesGirl: "#fff6e4",
      shoesBoy: "#fff6e4",
      shoeStripe: "#e23b3b",
      socks: "#ffffff",
      sockStripe: "#e23b3b",
      clip: "#e23b3b",
    },
    {
      id: "sailor",
      name: "세일러 룩",
      vibe: "공원 연못",
      for: "any",
      cost: 140,
      cut: "polo",
      bottom: "bermuda",
      top: "#ffffff",
      topShade: "#e6e6e6",
      accent: "#1c2a6b",
      bottomGirl: "#1c2a6b",
      bottomBoy: "#1c2a6b",
      shoesGirl: "#ffffff",
      shoesBoy: "#ffffff",
      shoeStripe: "#1c2a6b",
      socks: "#ffffff",
      sockStripe: "#1c2a6b",
      clip: "#e23b3b",
    },
    {
      id: "nightglow",
      name: "네온 나이트",
      vibe: "공원 밤",
      for: "any",
      cost: 180,
      cut: "hoodie",
      bottom: "wide",
      top: "#2a1248",
      topShade: "#160a2a",
      bottomGirl: "#111114",
      bottomBoy: "#111114",
      shoesGirl: "#7dff4a",
      shoesBoy: "#7dff4a",
      shoeStripe: "#9b6dff",
      socks: "#2a2a2e",
      sockStripe: "#9b6dff",
      strings: "#7dff4a",
      clip: "#7dff4a",
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
    {
      id: "pond-paddle",
      name: "연못 노",
      hint: "배 패들로 뿅",
      tool: "paddle",
      cost: 120,
      color: "#c47a3a",
      pattern: "solid",
      handle: "#8a5a32",
      grip: "#5a3518",
    },
    {
      id: "park-racket",
      name: "배드민턴 채",
      hint: "공원 밤 랠리용",
      tool: "racket",
      cost: 180,
      color: "#4aa3e8",
      pattern: "solid",
      handle: "#2b3a24",
      grip: "#ffe34a",
    },
  ];

  const STAGES = [
    {
      id: "park-1",
      name: "공원 낮",
      hint: "천천히",
      unlockScore: 0,
      tint: null,
      trap: 0.16,
      intervalBoost: 0,
      maxUpAdd: 0,
      burstAdd: 0,
      stayMin: 2.1,
      stayVar: 1.2,
      riseTime: 0.32,
      hideTime: 0.18,
    },
    {
      id: "park-2",
      name: "공원 노을",
      hint: "빠르게",
      unlockScore: 90,
      tint: "rgba(255,120,50,0.18)",
      trap: 0.24,
      intervalBoost: 0.045,
      maxUpAdd: 12,
      burstAdd: 2,
      stayMin: 1.25,
      stayVar: 0.7,
      riseTime: 0.22,
      hideTime: 0.11,
    },
    {
      id: "park-3",
      name: "공원 밤",
      hint: "아주 빠르게",
      unlockScore: 160,
      tint: "rgba(18,28,70,0.36)",
      trap: 0.3,
      intervalBoost: 0.075,
      maxUpAdd: 24,
      burstAdd: 4,
      stayMin: 0.75,
      stayVar: 0.45,
      riseTime: 0.16,
      hideTime: 0.07,
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
  let bedNodes = null;
  let songNext = 0;
  let songIndex = 0;
  const PARK_MELODY = [
    [392.0, 0.28],
    [440.0, 0.28],
    [523.25, 0.42],
    [0, 0.14],
    [392.0, 0.28],
    [329.63, 0.28],
    [392.0, 0.5],
    [0, 0.22],
    [440.0, 0.28],
    [493.88, 0.28],
    [587.33, 0.42],
    [0, 0.14],
    [523.25, 0.28],
    [493.88, 0.28],
    [392.0, 0.55],
    [0, 0.45],
  ];
  let scene = "title";
  let holes = [];
  let trees = [];
  let flowers = [];
  let particles = [];
  let floatTexts = [];
  let player = null;
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
  let avatar = {
    gender: "girl",
    outfitId: "lemon",
    hammerId: "cherry-stripe",
    complete: false,
  };
  let profileStep = 0;
  let profilePage = "home";
  let runScore = 0;
  let progress = {
    wallet: 0,
    stageId: "park-1",
    unlocked: ["park-1"],
    ownedOutfits: [],
    ownedHammers: [],
    best: {},
  };

  function progressKey() {
    return account ? `ppyong-progress-${account.id}` : "ppyong-progress-guest";
  }

  function freeOutfitIds() {
    return OUTFITS.filter((o) => !o.cost).map((o) => o.id);
  }

  function freeHammerIds() {
    return HAMMER_DESIGNS.filter((h) => !h.cost).map((h) => h.id);
  }

  function loadProgress() {
    progress = {
      wallet: 0,
      stageId: "park-1",
      unlocked: ["park-1"],
      ownedOutfits: freeOutfitIds(),
      ownedHammers: freeHammerIds(),
      best: {},
    };
    try {
      const raw = JSON.parse(localStorage.getItem(progressKey()) || "{}");
      if (typeof raw.wallet === "number") progress.wallet = Math.max(0, raw.wallet);
      if (STAGES.some((s) => s.id === raw.stageId)) progress.stageId = raw.stageId;
      if (Array.isArray(raw.unlocked)) {
        progress.unlocked = STAGES.map((s) => s.id).filter(
          (id) => raw.unlocked.includes(id) || id === "park-1"
        );
      }
      if (Array.isArray(raw.ownedOutfits)) {
        progress.ownedOutfits = [...new Set([...freeOutfitIds(), ...raw.ownedOutfits])];
      }
      if (Array.isArray(raw.ownedHammers)) {
        progress.ownedHammers = [...new Set([...freeHammerIds(), ...raw.ownedHammers])];
      }
      if (raw.best && typeof raw.best === "object") progress.best = raw.best;
    } catch (err) {
      /* keep defaults */
    }
    if (!progress.unlocked.includes(progress.stageId)) progress.stageId = "park-1";
  }

  function persistProgress() {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
    syncWalletUI();
  }

  function currentStage() {
    return STAGES.find((s) => s.id === progress.stageId) || STAGES[0];
  }

  function ownsOutfit(id) {
    const o = outfitOf(id);
    return !o.cost || progress.ownedOutfits.includes(id);
  }

  function ownsHammer(id) {
    const h = hammerOf(id);
    return !h.cost || progress.ownedHammers.includes(id);
  }

  function buyOutfit(id) {
    const o = outfitOf(id);
    if (!o.cost || ownsOutfit(id) || progress.wallet < o.cost) return false;
    progress.wallet -= o.cost;
    progress.ownedOutfits.push(id);
    persistProgress();
    return true;
  }

  function buyHammer(id) {
    const h = hammerOf(id);
    if (!h.cost || ownsHammer(id) || progress.wallet < h.cost) return false;
    progress.wallet -= h.cost;
    progress.ownedHammers.push(id);
    persistProgress();
    return true;
  }

  function scoreToCoins(score) {
    return Math.max(1, Math.floor(score / 4));
  }

  function settleRun(title, note) {
    const payout = scoreToCoins(runScore);
    progress.wallet += payout;
    const st = currentStage();
    progress.best[st.id] = Math.max(progress.best[st.id] || 0, runScore);
    const idx = STAGES.findIndex((s) => s.id === st.id);
    const next = STAGES[idx + 1];
    let extra = "";
    if (next && runScore >= next.unlockScore && !progress.unlocked.includes(next.id)) {
      progress.unlocked.push(next.id);
      extra = `${next.name}이 열렸습니다.`;
    } else if (next && !progress.unlocked.includes(next.id)) {
      extra = `${next.name}은 ${next.unlockScore}점이면 열립니다.`;
    }
    persistProgress();
    if (el.resultTitle) el.resultTitle.textContent = title;
    if (el.resultScore) el.resultScore.textContent = String(runScore);
    if (el.resultCoins) el.resultCoins.textContent = `+${payout}`;
    if (el.resultMoles) el.resultMoles.textContent = String(totalCaught);
    if (el.resultNote) {
      const text = [note, extra].filter(Boolean).join(" ");
      el.resultNote.textContent = text;
      el.resultNote.classList.toggle("hidden", !text);
    }
  }

  function outfitsFor(gender) {
    return OUTFITS.filter((o) => o.for === gender || o.for === "any");
  }

  function hammerOf(id) {
    return HAMMER_DESIGNS.find((h) => h.id === id) || HAMMER_DESIGNS[0];
  }

  function ensureOutfitForGender() {
    const list = outfitsFor(avatar.gender).filter((o) => ownsOutfit(o.id));
    const pick = list.length ? list : outfitsFor(avatar.gender);
    if (!pick.some((o) => o.id === avatar.outfitId)) {
      avatar.outfitId = pick[0].id;
    }
    if (!ownsHammer(avatar.hammerId)) {
      avatar.hammerId = freeHammerIds()[0];
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
    loadProgress();
    loadAvatar();
    if (avatar.complete) showTitle();
    else openProfile();
  }

  function isNativeApple() {
    return Boolean(window.PpyongApple && window.PpyongApple.isNative && window.PpyongApple.isNative());
  }

  function accountFromNative(result) {
    const r = (result && result.response) || result || {};
    const name = [r.givenName, r.familyName].filter(Boolean).join(" ");
    let id = r.user;
    if (!id && r.identityToken) {
      id = appleUserId({ authorization: { id_token: r.identityToken } });
    }
    return {
      id: id || `apple-${Date.now()}`,
      name: name || "플레이어",
      email: r.email || "",
      apple: true,
    };
  }

  function isAppleCancel(err) {
    const msg = String(
      (err && (err.message || err.error || err.code)) || err || ""
    );
    return /cancel|1001|popup_closed_by_user|user_cancelled_authorize/i.test(msg);
  }

  async function signInWithApple() {
    if (isNativeApple()) {
      try {
        const result = await window.PpyongApple.signIn();
        finishLogin(accountFromNative(result));
      } catch (err) {
        if (!isAppleCancel(err)) {
          const code = String((err && (err.code || err.error)) || "");
          if (code === "1000") {
            alert("Apple 로그인을 열 수 없습니다. 잠시 후 다시 시도해 주세요.");
          } else {
            alert("Apple 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          }
        }
      }
      return;
    }
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
        if (isAppleCancel(err)) return;
      }
    }
    finishLogin(localAppleAccount());
  }

  function logout() {
    account = null;
    persistAccount();
    avatar.complete = false;
    show("profile", false);
    show("briefing", false);
    showTitle();
  }

  function deleteAccount() {
    if (!account) return;
    const ok = window.confirm(
      "캐릭터와 기록이 모두 삭제됩니다. 계속할까요?"
    );
    if (!ok) return;
    const id = account.id;
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(`ppyong-progress-${id}`);
    localStorage.removeItem(`ppyong-avatar-${id}`);
    localStorage.removeItem("ppyong-local-id");
    account = null;
    avatar.complete = false;
    loadProgress();
    loadAvatar();
    show("profile", false);
    show("briefing", false);
    showTitle();
  }

  function loggedIn() {
    return Boolean(account && avatar.complete);
  }

  function showTitle() {
    scene = "title";
    show("profile", false);
    show("briefing", false);
    show("title", true);
    const ready = loggedIn();
    if (el.guestBlock) el.guestBlock.classList.toggle("hidden", ready);
    if (el.playBlock) el.playBlock.classList.toggle("hidden", !ready);
    if (el.titleHello) {
      const name = account && account.name && account.name !== "플레이어" ? account.name : "";
      el.titleHello.textContent = name;
      el.titleHello.classList.toggle("hidden", !name);
    }
    const start = document.getElementById("btn-start");
    if (start) start.textContent = "시작";
    syncWalletUI();
    if (ready) {
      mountStageCards(el.titleStages, true);
      mountStageCards(el.stageRow, false);
    }
  }

  function updateProfileHome() {
    const st = currentStage();
    if (el.profileStageNow) {
      const best = progress.best[st.id] || 0;
      el.profileStageNow.textContent = best
        ? `다음 공원 · ${st.name} · 최고 ${best}`
        : `다음 공원 · ${st.name}`;
    }
  }

  function showProfilePage(page) {
    profilePage = page;
    if (el.profileHome) el.profileHome.classList.toggle("hidden", page !== "home");
    if (el.profileCustom) el.profileCustom.classList.toggle("hidden", page !== "custom");
    if (el.profileStages) el.profileStages.classList.toggle("hidden", page !== "stages");
    const titles = { home: "캐릭터", custom: "코디", stages: "공원" };
    if (el.profileHeading) el.profileHeading.textContent = titles[page] || "프로필";
    if (page === "custom") renderProfileStep();
    if (page === "stages") mountStageCards(el.stageRow, false);
    if (page === "home") updateProfileHome();
  }

  function syncWalletUI() {
    const text = `코인 ${progress.wallet}`;
    if (el.titleWallet) el.titleWallet.textContent = text;
    if (el.profileWallet) el.profileWallet.textContent = text;
  }

  function mountStageCards(root, compact) {
    if (!root) return;
    root.innerHTML = "";
    STAGES.forEach((st) => {
      const locked = !progress.unlocked.includes(st.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stage-chip";
      if (progress.stageId === st.id) btn.classList.add("selected");
      if (locked) btn.classList.add("locked");
      const name = document.createElement("b");
      name.textContent = st.name;
      const hint = document.createElement("small");
      const best = progress.best[st.id] || 0;
      if (locked) hint.textContent = `${st.unlockScore}점 필요`;
      else if (compact) hint.textContent = best ? `최고 ${best}` : "기록 없음";
      else hint.textContent = best ? `${st.hint} · 최고 ${best}` : st.hint;
      btn.append(name, hint);
      btn.disabled = locked;
      btn.addEventListener("click", () => {
        if (locked) return;
        progress.stageId = st.id;
        persistProgress();
        mountStageCards(el.titleStages, true);
        mountStageCards(el.stageRow, false);
        updateProfileHome();
        const start = document.getElementById("btn-start");
        if (start) start.textContent = "시작";
      });
      root.append(btn);
    });
  }

  function openProfile() {
    scene = "profile";
    profileStep = 0;
    show("login", false);
    show("title", false);
    show("briefing", false);
    show("profile", true);
    syncWalletUI();
    if (el.profileAccount) {
      el.profileAccount.textContent = account
        ? account.apple
          ? account.email || "Apple ID"
          : "이 기기"
        : "Apple ID";
    }
    renderProfileStep();
    showProfilePage(avatar.complete ? "home" : "custom");
  }

  function openBriefing() {
    scene = "briefing";
    show("title", false);
    show("profile", false);
    show("login", false);
    show("result", false);
    show("roundOver", false);
    show("hud", false);
    show("controls", false);
    show("briefing", true);
    const briefTitle = document.getElementById("briefing-title");
    if (briefTitle) briefTitle.textContent = currentStage().name;
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
    return PONDS.some((p) => {
      const rx = p.rx + pad;
      const ry = p.ry + pad;
      if (rx <= 0 || ry <= 0) return false;
      const dx = (x - p.x) / rx;
      const dy = (y - p.y) / ry;
      return dx * dx + dy * dy < 1;
    });
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      const silent = audioCtx.createBuffer(1, 1, 22050);
      const src = audioCtx.createBufferSource();
      src.buffer = silent;
      src.connect(audioCtx.destination);
      src.start(0);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    startParkSong();
  }

  function startParkSong() {
    if (!audioCtx || bedNodes) return;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    master.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.45);
    master.connect(audioCtx.destination);

    const pad = audioCtx.createGain();
    pad.gain.value = 0.028;
    pad.connect(master);
    const oscs = [196, 246.94].map((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = i === 0 ? 0.5 : 0.3;
      osc.connect(g).connect(pad);
      osc.start();
      return osc;
    });

    bedNodes = { master, oscs, pad };
    songNext = audioCtx.currentTime + 0.25;
    songIndex = 0;
  }

  function playMelodyNote(freq, dur, t0) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.055, t0 + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.92);
    osc.connect(g).connect(bedNodes.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  function tickParkSong() {
    if (!audioCtx || !bedNodes || audioCtx.state === "suspended") return;
    const now = audioCtx.currentTime;
    if (songNext < now - 0.05) songNext = now;
    const horizon = now + 1.2;
    while (songNext < horizon) {
      const [freq, dur] = PARK_MELODY[songIndex % PARK_MELODY.length];
      if (freq) playMelodyNote(freq, dur, songNext);
      songNext += dur;
      songIndex += 1;
    }
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
      tone(180, 0.12, "square", 0.07, 320);
      return;
    }
    if (name === "hit") {
      tone(140, 0.1, "sawtooth", 0.09, 60);
      tone(420, 0.08, "square", 0.05, 180);
    }
    if (name === "coin") {
      tone(660, 0.08, "sine", 0.08, 990);
    }
    if (name === "buy") tone(520, 0.16, "triangle", 0.08, 780);
    if (name === "miss") {
      if (now - lastSfxAt.miss < 0.28) return;
      lastSfxAt.miss = now;
      tone(180, 0.14, "sine", 0.07, 90);
      return;
    }
    if (name === "swing") tone(240, 0.06, "triangle", 0.05, 120);
    if (name === "splash") {
      tone(90, 0.22, "sine", 0.09, 40);
      tone(220, 0.16, "triangle", 0.06, 80);
    }
    if (name === "trap") {
      tone(110, 0.2, "sawtooth", 0.1, 50);
      tone(300, 0.12, "square", 0.06, 90);
    }
  }

  function upgradeValue(id) {
    return STATS[id];
  }

  function resetProgress() {
    coins = 0;
    combo = 0;
    comboTimer = 0;
    round = 1;
    totalCaught = 0;
    runScore = 0;
    playTime = 0;
  }

  function makePlayer() {
    return {
      x: SAFE_SPAWN.x,
      y: SAFE_SPAWN.y,
      facing: 0,
      faceLeft: false,
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
    while (list.length < 150 && tries < 28000) {
      tries += 1;
      const x = 130 + Math.random() * (WORLD_W - 260);
      const y = 150 + Math.random() * (WORLD_H - 280);
      if (inPond(x, y, 80)) continue;
      if (Math.hypot(x - SAFE_SPAWN.x, y - SAFE_SPAWN.y) < 90) continue;
      if (list.some((h) => dist(h, { x, y }) < 92)) continue;
      if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 40)) continue;
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

    PONDS.forEach((p) => {
      g.fillStyle = "#5ec3d8";
      g.beginPath();
      g.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.28)";
      g.beginPath();
      g.ellipse(p.x - p.rx * 0.19, p.y - p.ry * 0.16, p.rx * 0.33, p.ry * 0.16, -0.4, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#3f8a32";
      g.lineWidth = 18;
      g.beginPath();
      g.ellipse(p.x, p.y, p.rx + 18, p.ry + 16, 0, 0, Math.PI * 2);
      g.stroke();
    });

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
    if (scene === "play" && !forceGold && Math.random() < currentStage().trap) {
      kind = ["skunk", "rabbit", "raccoon"][(Math.random() * 3) | 0];
    } else if (forceGold || Math.random() < 0.12) {
      kind = "gold";
    }
    hole.mole = {
      kind,
      state: "rise",
      t: 0,
      height: 0,
      stay: currentStage().stayMin + Math.random() * currentStage().stayVar,
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
    runScore += gain;
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
        "게임 오버",
        "스컹크가 공원을 덮었습니다."
      );
      el.soaked.classList.add("gas");
      el.soakCount.classList.add("hidden");
      return;
    }
    if (kind === "rabbit") {
      burst(hole.x, hole.y - 18, "#ff9f43", 12);
      throwCarrots(player.x, player.y);
      startStun("rabbit", RABBIT_TIME, "당근", "3초 동안 움직일 수 없습니다.");
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
      text: `-${loss}`,
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
    settleRun("게임 오버", reason);
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
    el.round.textContent = `${round}/${TOTAL_ROUNDS}`;
  }

  function nextRound() {
    round += 1;
    player.x = SAFE_SPAWN.x;
    player.y = SAFE_SPAWN.y;
    startRound();
  }

  // helper attached below after buttons exist
  function show(name, on) {
    const node = name === "roundOver" ? el.roundOver : el[name];
    if (!node) return;
    node.classList.toggle("hidden", !on);
  }

  function syncHud() {
    el.coins.textContent = String(coins);
    if (el.score) el.score.textContent = String(runScore);
    el.combo.textContent = String(combo);
    el.time.textContent = String(Math.ceil(timeLeft));
    el.round.textContent = `${round}/${TOTAL_ROUNDS}`;
  }

  function difficulty() {
    const st = currentStage();
    const t = playTime + (round - 1) * 18;
    return {
      interval: Math.max(0.02, 0.1 - t * 0.0025 - st.intervalBoost),
      maxUp: Math.min(80, 32 + Math.floor(t / 5) + st.maxUpAdd),
      burst: (t > 24 ? 8 : t > 8 ? 6 : 4) + st.burstAdd,
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
        m.t += dt / (currentStage().riseTime || 0.32);
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
        m.t += dt / (currentStage().hideTime || 0.18);
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
    startStun("water", WATER_TIME, "풍덩", "5초 동안 움직일 수 없습니다. 시간은 그대로 갑니다.");
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
      gameOver("스컹크가 공원을 덮었습니다.");
    }
  }

  function blocked(x, y) {
    if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 26)) return true;
    return holes.some((h) => {
      const dx = (x - h.x) / 30;
      const dy = (y - h.y) / 18;
      return dx * dx + dy * dy < 1;
    });
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
      if (ix < -0.2) player.faceLeft = true;
      else if (ix > 0.2) player.faceLeft = false;
      player.runT += dt * 10;
      const sp = upgradeValue("move");
      const nx = clamp(player.x + ix * sp * dt, 36, WORLD_W - 36);
      const ny = clamp(player.y + iy * sp * dt, 48, WORLD_H - 36);
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
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
      settleRun("결과");
      return;
    }
    scene = "roundOver";
    show("roundOver", true);
    if (el.roundNum) el.roundNum.textContent = `${round} / ${TOTAL_ROUNDS}`;
    if (el.roundMoles) el.roundMoles.textContent = String(roundCaught);
  }

  function update(dt) {
    if (scene === "title" || scene === "login" || scene === "profile" || scene === "briefing") {
      demoTime += dt;
      if (player) {
        player.runT += dt * 8;
        player.facing = Math.sin(demoTime * 0.8) >= 0 ? 0 : Math.PI;
        player.faceLeft = Math.cos(player.facing) < 0;
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

  function animalPalette(kind) {
    if (kind === "gold") return { fur: "#e8c423", paw: "#d4a318", line: "#6a4a12" };
    if (kind === "skunk") return { fur: "#1c1c22", paw: "#141418", line: INK };
    if (kind === "rabbit") return { fur: "#ead4b4", paw: "#e2c8a6", line: "#5a4030" };
    if (kind === "raccoon") return { fur: "#8b8176", paw: "#3a3530", line: INK };
    return { fur: "#8a542c", paw: "#7a4a26", line: INK };
  }

  function drawPaw(px, py, side, color, line) {
    ctx.fillStyle = color;
    ctx.strokeStyle = line;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(px, py, 7.5, 5.4, side * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f3b89a";
    ctx.beginPath();
    ctx.ellipse(px, py + 1, 4.2, 2.8, side * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGlossyEyes(x, y, white) {
    if (white) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(x - 7.2, y, 5.6, 6.2, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 7.2, y, 5.6, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a120c";
      ctx.beginPath();
      ctx.arc(x - 7.2, y + 0.4, 3.1, 0, Math.PI * 2);
      ctx.arc(x + 7.2, y + 0.4, 3.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#1a120c";
      ctx.beginPath();
      ctx.ellipse(x - 7.2, y, 5.2, 5.8, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 7.2, y, 5.2, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x - 5.8, y - 1.5, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 8.6, y - 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAnimal(kind, x, y, pop, parts) {
    const s = 0.94 + pop * 0.08;
    const pal = animalPalette(kind);
    const rx = 22 * s;
    const ry = 24 * s;
    const eyeY = y - ry * 0.42;
    const noseY = y - ry * 0.12;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2.6;

    if (parts !== "paws") {
      if (kind === "rabbit") {
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(x + side * 9 * s, y - ry * 0.78);
          ctx.rotate(side * 0.1);
          ctx.fillStyle = pal.fur;
          ctx.beginPath();
          ctx.ellipse(0, -15 * s, 6 * s, 18 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffb7c8";
          ctx.beginPath();
          ctx.ellipse(0, -13 * s, 2.6 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else {
        [-1, 1].forEach((side) => {
          ctx.fillStyle = pal.fur;
          ctx.beginPath();
          ctx.ellipse(x + side * 12 * s, y - ry * 0.82, 5 * s, 5.6 * s, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = kind === "skunk" ? "#f4f1ea" : kind === "raccoon" ? "#f0cbb8" : pal.fur;
          ctx.beginPath();
          ctx.ellipse(x + side * 12 * s, y - ry * 0.78, 2.1 * s, 2.4 * s, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.fillStyle = pal.fur;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (kind === "skunk") {
        ctx.fillStyle = "#f4f1ea";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 5 * s, y - ry * 0.35, x, y - ry * 0.95);
        ctx.quadraticCurveTo(x + 5 * s, y - ry * 0.35, x, y);
        ctx.fill();
      }

      if (kind === "gold") {
        ctx.fillStyle = "#ffe56b";
        ctx.strokeStyle = "#6a4a12";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - 10 * s, y - ry * 0.78);
        ctx.lineTo(x - 5.5 * s, y - ry * 1.22);
        ctx.lineTo(x, y - ry * 0.84);
        ctx.lineTo(x + 5.5 * s, y - ry * 1.22);
        ctx.lineTo(x + 10 * s, y - ry * 0.78);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        [
          [-13, -ry * 0.4],
          [14, -ry * 0.55],
          [0, -ry * 1.05],
        ].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(x + dx * (dx === 0 ? 1 : s), y + dy, 1.4 * s, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 2.6;
      }

      const muzzle =
        kind === "gold" ? "#ffe9a8" : kind === "skunk" || kind === "raccoon" || kind === "rabbit"
          ? "#fff8f0"
          : "#d4a06a";
      ctx.fillStyle = muzzle;
      ctx.beginPath();
      ctx.ellipse(x, noseY + 3 * s, 8.5 * s, 6.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      if (kind === "raccoon") {
        ctx.fillStyle = "#1c120c";
        ctx.beginPath();
        ctx.ellipse(x, eyeY, 16 * s, 6.4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      drawGlossyEyes(x, eyeY, kind === "skunk" || kind === "raccoon");

      if (kind === "skunk") {
        ctx.strokeStyle = "#4a1020";
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(x - 11 * s, eyeY - 6 * s);
        ctx.lineTo(x - 3.5 * s, eyeY - 1.5 * s);
        ctx.moveTo(x + 11 * s, eyeY - 6 * s);
        ctx.lineTo(x + 3.5 * s, eyeY - 1.5 * s);
        ctx.stroke();
      }

      ctx.fillStyle = kind === "skunk" || kind === "raccoon" ? "#1a120c" : "#ff8aa8";
      ctx.beginPath();
      ctx.arc(x, noseY + 2 * s, kind === "rabbit" ? 2.8 * s : 3.3 * s, 0, Math.PI * 2);
      ctx.fill();

      if (kind === "normal" || kind === "gold") {
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 3 * s, noseY + 3.5 * s);
        ctx.lineTo(x - 12 * s, noseY + 2 * s);
        ctx.moveTo(x - 3 * s, noseY + 5.5 * s);
        ctx.lineTo(x - 11 * s, noseY + 7 * s);
        ctx.moveTo(x + 3 * s, noseY + 3.5 * s);
        ctx.lineTo(x + 12 * s, noseY + 2 * s);
        ctx.moveTo(x + 3 * s, noseY + 5.5 * s);
        ctx.lineTo(x + 11 * s, noseY + 7 * s);
        ctx.stroke();
      }

      ctx.strokeStyle = pal.line;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      if (kind === "rabbit") {
        ctx.arc(x, noseY + 7 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#3b2418";
        ctx.fill();
      } else {
        ctx.arc(x, noseY + 7 * s, 4 * s, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    }

    if (parts !== "body") {
      const reach = rx * 0.78;
      drawPaw(x - reach, y + 6, -1, pal.paw, pal.line);
      drawPaw(x + reach, y + 6, 1, pal.paw, pal.line);
    }
  }

  function drawMole(hole) {
    const m = hole.mole;
    if (!m || m.height <= 0.02) return;
    const pop = m.height;
    const x = hole.x;
    const y = hole.y + (1 - pop) * 16 + Math.sin(m.bob) * 1.1;
    drawShadow(x, hole.y + 6, 12 + pop * 6, 5);
    drawHole(hole);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 80, hole.y - 140, 160, 140);
    ctx.ellipse(hole.x, hole.y + 2, 18, 8, 0, 0, Math.PI * 2);
    ctx.clip();
    drawAnimal(m.kind, x, y, pop, "body");
    ctx.restore();

    drawAnimal(m.kind, x, hole.y, pop, "paws");
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

  const MALLET_HOLD = { x: -16, y: -64 };

  function paintMalletShape(g, design) {
    const d = design || hammerOf(avatar.hammerId);
    const color = d.color || "#e23b3b";
    const pattern = d.pattern || "solid";
    const cap = hammerAccent(color);
    if (d.tool === "paddle") {
      fillRound(g, -2, -2, 4, 30, 2, d.handle || "#8a5a32");
      g.strokeStyle = LINE;
      g.lineWidth = 1.3;
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(0, -16, 8, 13, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      return;
    }
    if (d.tool === "racket") {
      fillRound(g, -1.5, 0, 3, 22, 1.4, d.handle || "#2b3a24");
      g.strokeStyle = LINE;
      g.lineWidth = 1.2;
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(0, -18, 9, 11, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.save();
      g.beginPath();
      g.ellipse(0, -18, 7, 9, 0, 0, Math.PI * 2);
      g.clip();
      g.strokeStyle = "rgba(255,255,255,0.75)";
      g.lineWidth = 0.7;
      for (let i = -6; i <= 6; i += 3) {
        g.beginPath();
        g.moveTo(i, -28);
        g.lineTo(i, -8);
        g.stroke();
      }
      for (let i = -8; i <= 8; i += 3) {
        g.beginPath();
        g.moveTo(-8, -18 + i);
        g.lineTo(8, -18 + i);
        g.stroke();
      }
      g.restore();
      return;
    }
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
  }

  function drawMallet(g, swing, design) {
    g.save();
    g.translate(MALLET_HOLD.x, MALLET_HOLD.y + swing * -6);
    g.rotate(-0.28 + swing * 1.45);
    paintMalletShape(g, design);
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
    g.save();
    g.translate(w * 0.5, h * 0.56);
    g.rotate(-0.4);
    g.scale(w / 48, w / 48);
    paintMalletShape(g, d);
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
    g.ellipse(13, -28, 4.2, 3.4, 0.4, 0, Math.PI * 2);
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

    const holdX = MALLET_HOLD.x;
    const holdY = MALLET_HOLD.y + swing * -6;
    g.lineCap = "round";
    g.strokeStyle = LINE;
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(-8, -42);
    g.lineTo(holdX, holdY);
    g.stroke();
    g.strokeStyle = SKIN;
    g.lineWidth = 5;
    g.stroke();
    drawMallet(g, swing + (wet ? Math.sin(t * 14) * 0.25 : 0));
    g.fillStyle = SKIN;
    g.beginPath();
    g.ellipse(holdX, holdY, 4.8, 3.8, -0.4, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = LINE;
    g.lineWidth = 1.2;
    g.stroke();

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
      flip: p.faceLeft,
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
      vibe.textContent = o.cost
        ? ownsOutfit(o.id)
          ? `${o.vibe} · 보유`
          : `${o.vibe} · ${o.cost}코인`
        : o.vibe;
      txt.append(name, vibe);
      btn.append(cv, txt);
      if (!ownsOutfit(o.id)) btn.classList.add("locked");
      btn.addEventListener("click", () => {
        if (!ownsOutfit(o.id) && !buyOutfit(o.id)) return;
        avatar.outfitId = o.id;
        persistAvatar();
        mountOutfitCards();
        syncAvatarPickerUI();
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
      hint.textContent = d.cost
        ? ownsHammer(d.id)
          ? `${d.hint} · 보유`
          : `${d.hint} · ${d.cost}코인`
        : d.hint;
      txt.append(name, hint);
      btn.append(cv, txt);
      if (!ownsHammer(d.id)) btn.classList.add("locked");
      btn.addEventListener("click", () => {
        if (!ownsHammer(d.id) && !buyHammer(d.id)) return;
        avatar.hammerId = d.id;
        persistAvatar();
        mountHammerCards();
        syncAvatarPickerUI();
      });
      root.append(btn);
    });
  }

  function renderProfileStep() {
    const labels = ["캐릭터", "옷", "뿅망치"];
    if (el.profileStepLabel) el.profileStepLabel.textContent = labels[profileStep];
    el.profileStepGender.classList.toggle("hidden", profileStep !== 0);
    el.profileStepOutfit.classList.toggle("hidden", profileStep !== 1);
    el.profileStepHammer.classList.toggle("hidden", profileStep !== 2);
    const back = document.getElementById("btn-profile-back");
    const next = document.getElementById("btn-profile-next");
    back.disabled = profileStep === 0 && !avatar.complete;
    back.textContent = profileStep === 0 ? "돌아가기" : "이전";
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
    if (el.titleMe && scene === "title" && loggedIn()) {
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
    if (el.profileMe && scene === "profile" && profilePage === "home") {
      const cv = el.profileMe;
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
    const tint = currentStage().tint;
    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, viewW, viewH);
    }
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
    tickParkSong();
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
    document.getElementById("btn-page-custom").addEventListener("click", () => {
      profileStep = 0;
      showProfilePage("custom");
    });
    document.getElementById("btn-page-stages").addEventListener("click", () => {
      showProfilePage("stages");
    });
    document.getElementById("btn-profile-to-title").addEventListener("click", () => {
      showTitle();
    });
    document.getElementById("btn-stages-back").addEventListener("click", () => {
      showProfilePage("home");
    });
    document.getElementById("btn-profile-back").addEventListener("click", () => {
      if (profileStep === 0) {
        if (avatar.complete) showProfilePage("home");
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
    document.getElementById("btn-delete-account").addEventListener("click", () => {
      deleteAccount();
    });
    document.getElementById("btn-briefing-go").addEventListener("click", () => {
      ensureAudio();
      beginPlay();
    });
    document.getElementById("btn-next-round").addEventListener("click", () => {
      ensureAudio();
      nextRound();
    });
    document.getElementById("btn-retry").addEventListener("click", () => {
      ensureAudio();
      resetProgress();
      player = makePlayer();
      holes = placeHoles();
      openBriefing();
    });
  }

  function init() {
    resize();
    loadAccount();
    loadProgress();
    loadAvatar();
    mountGenderCards();
    syncHammerButton();
    placeDecor();
    holes = placeHoles();
    parkCanvas = bakePark();
    player = makePlayer();
    resetProgress();
    bindControls();
    showTitle();
    if (account && !avatar.complete) openProfile();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 120));
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
    }
    window.addEventListener("pointerdown", ensureAudio);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") ensureAudio();
    });
    window.addEventListener("pageshow", ensureAudio);
    requestAnimationFrame(loop);
  }

  init();
})();
