const STORAGE_KEY = "gambleRoyaleData";
const ADMIN_CODE = "Admin123G";

const state = {
  balance: 0,
  currentChoice: "Kopf",
  authView: "login",
  adminUnlocked: false,
  currentProfile: null,
  blackjack: {
    deck: [],
    dealer: [],
    hands: [],
    active: false,
    busy: false,
    phase: "idle",
    activeHandIndex: 0,
    dealerRevealed: false,
    splitUsed: false,
    aceChoice: null,
  },
  coinBusy: false,
  raceBusy: false,
  slotsBusy: false,
  roulette: {
    busy: false,
    selection: null,
    wheelRotation: 0,
    ballRotation: 0,
    lastNumber: null,
  },
  appData: loadAppData(),
};

const balanceEl = document.querySelector("#balance");
const currentUserLabel = document.querySelector("#currentUserLabel");
const activityLog = document.querySelector("#activityLog");
const coinVisual = document.querySelector("#coinVisual");
const slotsResult = document.querySelector("#slotsResult");
const slotReels = [
  document.querySelector("#reel1"),
  document.querySelector("#reel2"),
  document.querySelector("#reel3"),
];
const menuSwitchButtons = [...document.querySelectorAll(".menu-switch-button")];
const menuPanels = [...document.querySelectorAll("[data-menu-panel]")];
const gameMenuButtons = [...document.querySelectorAll(".menu-button[data-game-target]")];
const gamePanels = [...document.querySelectorAll("[data-game-panel]")];
const authTabs = [...document.querySelectorAll(".auth-tab")];
const authViews = {
  login: document.querySelector("#loginView"),
  register: document.querySelector("#registerView"),
};
const authMessage = document.querySelector("#authMessage");
const logoutUserButton = document.querySelector("#logoutUser");
const profileUsername = document.querySelector("#profileUsername");
const profileEmail = document.querySelector("#profileEmail");
const profilePlayerId = document.querySelector("#profilePlayerId");
const profileCoins = document.querySelector("#profileCoins");
const profileLuckBoost = document.querySelector("#profileLuckBoost");
const changeUsernameInput = document.querySelector("#changeUsernameInput");
const changeUsernameButton = document.querySelector("#changeUsernameButton");
const friendsList = document.querySelector("#friendsList");
const friendRequestsList = document.querySelector("#friendRequestsList");
const friendOutgoingList = document.querySelector("#friendOutgoingList");
const leaderboardList = document.querySelector("#leaderboardList");
const localPlayersList = document.querySelector("#localPlayersList");
const friendPlayerIdInput = document.querySelector("#friendPlayerId");
const adminStatus = document.querySelector("#adminStatus");
const adminCodeInput = document.querySelector("#adminCode");
const adminControls = document.querySelector("#adminControls");
const adminSelfCoinsInput = document.querySelector("#adminSelfCoins");
const adminLuckBoostInput = document.querySelector("#adminLuckBoost");
const adminTargetPlayerIdInput = document.querySelector("#adminTargetPlayerId");
const adminTargetCoinsInput = document.querySelector("#adminTargetCoins");
const adminTargetLuckBoostInput = document.querySelector("#adminTargetLuckBoost");
const adminAccountsList = document.querySelector("#adminAccountsList");
const dailyStatusText = document.querySelector("#dailyStatusText");
const workCounter = document.querySelector("#workCounter");
const workQuestion = document.querySelector("#workQuestion");
const workAnswer = document.querySelector("#workAnswer");
const workStatusText = document.querySelector("#workStatusText");
const allCardsPreview = document.querySelector("#allCardsPreview");
const blackjackBetInput = document.querySelector("#blackjackBet");
const coinBetInput = document.querySelector("#coinBet");
const raceBetInput = document.querySelector("#raceBet");
const slotsBetInput = document.querySelector("#slotsBet");
const rouletteBetInput = document.querySelector("#rouletteBet");
const rouletteSelectionLabel = document.querySelector("#rouletteSelection");
const rouletteNumbersGrid = document.querySelector("#rouletteNumbersGrid");
const rouletteWheel = document.querySelector("#rouletteWheel");
const rouletteWheelNumbers = document.querySelector("#rouletteWheelNumbers");
const rouletteBallTrack = document.querySelector("#rouletteBallTrack");
const rouletteResult = document.querySelector("#rouletteResult");
const rouletteLastNumber = document.querySelector("#rouletteLastNumber");
const resultOverlay = document.querySelector("#gameResultOverlay");
const resultGameLabel = document.querySelector("#resultGameLabel");
const resultTitle = document.querySelector("#resultTitle");
const resultAmount = document.querySelector("#resultAmount");
const resultDetail = document.querySelector("#resultDetail");
const resultCoinBurst = document.querySelector("#resultCoinBurst");
const resultLossTrend = document.querySelector("#resultLossTrend");
const closeGameResultButton = document.querySelector("#closeGameResult");
const blackjackAceOverlay = document.querySelector("#blackjackAceOverlay");
const aceChoiceText = document.querySelector("#aceChoiceText");
const aceChoiceTotals = document.querySelector("#aceChoiceTotals");
const aceAsOneButton = document.querySelector("#aceAsOne");
const aceAsElevenButton = document.querySelector("#aceAsEleven");
const friendActionOverlay = document.querySelector("#friendActionOverlay");
const friendActionTitle = document.querySelector("#friendActionTitle");
const friendActionInfo = document.querySelector("#friendActionInfo");
const friendTransferAmountInput = document.querySelector("#friendTransferAmount");
const friendActionStatus = document.querySelector("#friendActionStatus");
const closeFriendActionButton = document.querySelector("#closeFriendAction");
const removeFriendActionButton = document.querySelector("#removeFriendAction");
const sendFriendCoinsButton = document.querySelector("#sendFriendCoins");

const symbols = ["seven", "cherry", "lemon", "grapes", "bell", "diamond"];
const slotSymbolMap = {
  seven: { display: "7", className: "slot-seven" },
  cherry: { display: "🍒", className: "slot-cherry" },
  lemon: { display: "🍋", className: "slot-lemon" },
  grapes: { display: "🍇", className: "slot-grapes" },
  bell: { display: "🔔", className: "slot-bell" },
  diamond: { display: "💎", className: "slot-diamond" },
};
const slotPayoutMultipliers = {
  seven: 8,
  diamond: 6,
  bell: 5,
  cherry: 4,
  grapes: 3,
  lemon: 2.5,
  pair: 1.5,
};
const horseNames = ["Blaze", "Storm", "Nova", "Comet"];
const rouletteSequence = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const rouletteRedNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const ROULETTE_POCKET_STEP = 360 / rouletteSequence.length;
const WORK_LIMIT_PER_DAY = 10;
const RESULT_SCREEN_DURATION = 3200;
const COIN_FLIP_DURATION = 1400;
const BLACKJACK_DEAL_DELAY = 420;
const DEALER_DRAW_DELAY = 750;
const MAX_BLACKJACK_HANDS = 4;
const RACE_STEP_DELAY = 320;
const SLOT_REEL_START_DELAY = 1080;
const SLOT_REEL_STEP_DELAY = 520;
const SLOT_REEL_STOP_DURATION = 980;
const DEALER_HITS_SOFT_17 = false;
const SLOT_AUDIO_VOLUME = 2.35;
const SLOT_MACHINE_SOUND_ENABLED = false;

let resultOverlayTimer = null;
let gameAudioContext = null;
let gameAudioOutput = null;
let blackjackCardSequence = 0;
let blackjackAceOverlayTimer = null;
let friendActionSubmitHandler = null;
let friendActionRemoveHandler = null;

coinVisual.innerHTML = `
  <div class="coin-face front" aria-label="Kopf"><span>K</span></div>
  <div class="coin-face back" aria-label="Zahl"><span>Z</span></div>
`;

closeGameResultButton?.addEventListener("click", () => {
  hideGameResult();
});

resultOverlay?.addEventListener("click", (event) => {
  if (event.target === resultOverlay) {
    hideGameResult();
  }
});

function setFriendActionStatus(message = "", tone = "") {
  if (!friendActionStatus) return;
  friendActionStatus.textContent = message;
  friendActionStatus.classList.remove("success", "error");
  if (tone) {
    friendActionStatus.classList.add(tone);
  }
}

function closeFriendActionMenu() {
  friendActionSubmitHandler = null;
  friendActionRemoveHandler = null;
  setFriendActionStatus("");
  removeFriendActionButton?.classList.add("hidden");
  friendActionOverlay?.classList.remove("visible");
  window.setTimeout(() => {
    friendActionOverlay?.classList.add("hidden");
  }, 180);
}

function openFriendActionMenu({ title, info, defaultAmount = 100, onSubmit, onRemove = null }) {
  if (!friendActionOverlay) return;
  friendActionTitle.textContent = title;
  friendActionInfo.textContent = info;
  friendTransferAmountInput.value = String(Math.max(1, Math.floor(Number(defaultAmount) || 100)));
  friendActionSubmitHandler = onSubmit;
  friendActionRemoveHandler = onRemove;
  removeFriendActionButton?.classList.toggle("hidden", typeof onRemove !== "function");
  setFriendActionStatus("");
  friendActionOverlay.classList.remove("hidden");
  window.requestAnimationFrame(() => {
    friendActionOverlay.classList.add("visible");
  });
}

closeFriendActionButton?.addEventListener("click", () => {
  closeFriendActionMenu();
});

friendActionOverlay?.addEventListener("click", (event) => {
  if (event.target === friendActionOverlay) {
    closeFriendActionMenu();
  }
});

sendFriendCoinsButton?.addEventListener("click", async () => {
  if (typeof friendActionSubmitHandler !== "function") return;

  const amount = Math.floor(Number(friendTransferAmountInput.value));
  if (!Number.isFinite(amount) || amount < 1) {
    setFriendActionStatus("Bitte gib mindestens 1 Coin ein.", "error");
    return;
  }

  setFriendActionStatus("Coins werden geschickt...");
  try {
    const result = await friendActionSubmitHandler(amount);
    if (result?.ok) {
      setFriendActionStatus(result.message || "Coins wurden geschickt.", "success");
      window.setTimeout(() => {
        closeFriendActionMenu();
      }, 700);
      return;
    }

    setFriendActionStatus(result?.message || "Coins konnten nicht geschickt werden.", "error");
  } catch (error) {
    setFriendActionStatus(error?.message || "Coins konnten nicht geschickt werden.", "error");
  }
});

removeFriendActionButton?.addEventListener("click", async () => {
  if (typeof friendActionRemoveHandler !== "function") return;
  if (!window.confirm("Freund wirklich löschen?")) return;

  setFriendActionStatus("Freund wird entfernt...");
  try {
    const result = await friendActionRemoveHandler();
    if (result?.ok) {
      setFriendActionStatus(result.message || "Freund wurde entfernt.", "success");
      window.setTimeout(() => {
        closeFriendActionMenu();
      }, 700);
      return;
    }

    setFriendActionStatus(result?.message || "Freund konnte nicht entfernt werden.", "error");
  } catch (error) {
    setFriendActionStatus(error?.message || "Freund konnte nicht entfernt werden.", "error");
  }
});

function hideBlackjackAceChoice() {
  if (!blackjackAceOverlay) return;
  if (blackjackAceOverlayTimer) {
    window.clearTimeout(blackjackAceOverlayTimer);
    blackjackAceOverlayTimer = null;
  }
  blackjackAceOverlay.classList.remove("visible");
  blackjackAceOverlayTimer = window.setTimeout(() => {
    blackjackAceOverlay.classList.add("hidden");
    blackjackAceOverlayTimer = null;
  }, 180);
}

function submitBlackjackAceChoice(value) {
  const pendingChoice = state.blackjack.aceChoice;
  if (!pendingChoice) return;

  state.blackjack.aceChoice = null;
  hideBlackjackAceChoice();
  renderBlackjack();
  pendingChoice.resolve(value);
}

aceAsOneButton?.addEventListener("click", () => {
  submitBlackjackAceChoice(1);
});

aceAsElevenButton?.addEventListener("click", () => {
  submitBlackjackAceChoice(11);
});

function loadAppData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { users: [], currentUserId: null, friendRequests: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users)
        ? parsed.users.map((user) => ({
          ...user,
          friends: Array.isArray(user.friends) ? user.friends : [],
          luckBoost: clampLuckBoost(user.luckBoost ?? user.luck_boost ?? 1),
        }))
        : [],
      currentUserId: parsed.currentUserId ?? null,
      friendRequests: Array.isArray(parsed.friendRequests) ? parsed.friendRequests : [],
    };
  } catch {
    return { users: [], currentUserId: null, friendRequests: [] };
  }
}

function clampLuckBoost(value) {
  const numericValue = Math.floor(Number(value));
  if (!Number.isFinite(numericValue)) return 1;
  return Math.min(100, Math.max(1, numericValue));
}

function saveAppData() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.appData));
}

function generatePlayerId() {
  let nextId = "";
  do {
    nextId = `PLY${Math.floor(100000 + Math.random() * 900000)}`;
  } while (state.appData.users.some((user) => user.playerId === nextId));
  return nextId;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentUser() {
  if (state.currentProfile) {
    return state.currentProfile;
  }
  return state.appData.users.find((user) => user.id === state.appData.currentUserId) || null;
}

function findUserByPlayerId(playerId) {
  return state.appData.users.find((user) => user.playerId.toUpperCase() === playerId.toUpperCase()) || null;
}

function getPendingFriendRequests() {
  return Array.isArray(state.appData.friendRequests) ? state.appData.friendRequests : [];
}

function getIncomingFriendRequestsForUser(userId) {
  return getPendingFriendRequests()
    .filter((request) => request.toUserId === userId)
    .map((request) => ({
      ...request,
      user: state.appData.users.find((entry) => entry.id === request.fromUserId) || null,
    }))
    .filter((request) => request.user);
}

function getOutgoingFriendRequestsForUser(userId) {
  return getPendingFriendRequests()
    .filter((request) => request.fromUserId === userId)
    .map((request) => ({
      ...request,
      user: state.appData.users.find((entry) => entry.id === request.toUserId) || null,
    }))
    .filter((request) => request.user);
}

function createLocalFriendRequest(fromUserId, toUserId) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    fromUserId,
    toUserId,
    createdAt: new Date().toISOString(),
  };
}

function areUsersFriends(userA, userB) {
  if (!userA || !userB) return false;
  return userA.friends.includes(userB.playerId) && userB.friends.includes(userA.playerId);
}

function addFriendshipBetweenUsers(userA, userB) {
  if (!userA.friends.includes(userB.playerId)) {
    userA.friends.push(userB.playerId);
  }
  if (!userB.friends.includes(userA.playerId)) {
    userB.friends.push(userA.playerId);
  }
}

function removeFriendshipBetweenUsers(userA, userB) {
  if (!userA || !userB) return;
  userA.friends = userA.friends.filter((friendId) => friendId !== userB.playerId);
  userB.friends = userB.friends.filter((friendId) => friendId !== userA.playerId);
}

function removeFriendRequest(requestId) {
  state.appData.friendRequests = getPendingFriendRequests().filter((request) => request.id !== requestId);
}

function renderFriendSections({
  friends = [],
  incomingRequests = [],
  outgoingRequests = [],
  onOpenFriendMenu = null,
  onAcceptRequest = null,
  onDeclineRequest = null,
  onCancelRequest = null,
}) {
  const renderEmpty = (list, text) => {
    list.innerHTML = "";
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  };

  if (!friendsList || !friendRequestsList || !friendOutgoingList) return;

  if (friends.length === 0) {
    renderEmpty(friendsList, "Keine Freunde hinzugefügt.");
  } else {
    friendsList.innerHTML = "";
    friends.forEach((friend) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <div class="friend-entry">
          <div class="friend-main">
            <div class="friend-name">${friend.username}</div>
            <div class="friend-meta">${friend.playerId} · ${friend.coins} Coins</div>
          </div>
          <div class="friend-inline-actions">
            <button class="button secondary icon-button" type="button" data-friend-menu="${friend.playerId}" aria-label="Freund-Menü öffnen">⚙</button>
          </div>
        </div>
      `;
      friendsList.appendChild(item);
    });

    if (typeof onOpenFriendMenu === "function") {
      friendsList.querySelectorAll("[data-friend-menu]").forEach((button) => {
        button.addEventListener("click", () => {
          const friend = friends.find((entry) => entry.playerId === button.dataset.friendMenu);
          if (friend) onOpenFriendMenu(friend);
        });
      });
    }
  }

  if (incomingRequests.length === 0) {
    renderEmpty(friendRequestsList, "Keine offenen Anfragen.");
  } else {
    friendRequestsList.innerHTML = "";
    incomingRequests.forEach((request) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <div class="friend-entry">
          <div class="friend-main">
            <div class="friend-name">${request.username}</div>
            <div class="friend-meta">${request.playerId}</div>
          </div>
          <div class="friend-inline-actions">
            <button class="button secondary small-button" type="button" data-accept-request="${request.id}">Annehmen</button>
            <button class="button secondary small-button" type="button" data-decline-request="${request.id}">Ablehnen</button>
          </div>
        </div>
      `;
      friendRequestsList.appendChild(item);
    });

    if (typeof onAcceptRequest === "function") {
      friendRequestsList.querySelectorAll("[data-accept-request]").forEach((button) => {
        button.addEventListener("click", () => {
          void onAcceptRequest(button.dataset.acceptRequest);
        });
      });
    }

    if (typeof onDeclineRequest === "function") {
      friendRequestsList.querySelectorAll("[data-decline-request]").forEach((button) => {
        button.addEventListener("click", () => {
          void onDeclineRequest(button.dataset.declineRequest);
        });
      });
    }
  }

  if (outgoingRequests.length === 0) {
    renderEmpty(friendOutgoingList, "Keine gesendeten Anfragen.");
  } else {
    friendOutgoingList.innerHTML = "";
    outgoingRequests.forEach((request) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <div class="friend-entry">
          <div class="friend-main">
            <div class="friend-name">${request.username}</div>
            <div class="friend-meta">${request.playerId}</div>
          </div>
          <div class="friend-inline-actions">
            <button class="button secondary small-button" type="button" data-cancel-request="${request.id}">Zurückziehen</button>
          </div>
        </div>
      `;
      friendOutgoingList.appendChild(item);
    });

    if (typeof onCancelRequest === "function") {
      friendOutgoingList.querySelectorAll("[data-cancel-request]").forEach((button) => {
        button.addEventListener("click", () => {
          void onCancelRequest(button.dataset.cancelRequest);
        });
      });
    }
  }
}

function sendCoinsToLocalFriend(targetPlayerId, amount) {
  const currentUser = getCurrentUser();
  const targetUser = findUserByPlayerId(targetPlayerId);
  const numericAmount = Math.floor(Number(amount));

  if (!currentUser) {
    return { ok: false, message: "Bitte zuerst einloggen." };
  }
  if (!targetUser || !areUsersFriends(currentUser, targetUser)) {
    return { ok: false, message: "Dieser Spieler ist nicht in deiner Freundesliste." };
  }
  if (!Number.isFinite(numericAmount) || numericAmount < 1) {
    return { ok: false, message: "Bitte gib mindestens 1 Coin ein." };
  }
  if (currentUser.coins < numericAmount) {
    return { ok: false, message: "Du hast nicht genug Coins." };
  }

  currentUser.coins -= numericAmount;
  targetUser.coins += numericAmount;
  syncCurrentUser();
  logActivity(`${currentUser.username} hat ${targetUser.username} ${numericAmount} Coins geschickt.`);
  return { ok: true, message: `${numericAmount} Coins an ${targetUser.username} geschickt.` };
}

function updateBalance() {
  const currentUser = getCurrentUser();
  state.balance = currentUser ? currentUser.coins : 0;
  balanceEl.textContent = String(state.balance);
  currentUserLabel.textContent = currentUser ? currentUser.username : "Nicht eingeloggt";
  syncBetInputs();
}

function logActivity(message) {
  const item = document.createElement("li");
  item.textContent = message;
  activityLog.prepend(item);

  while (activityLog.children.length > 8) {
    activityLog.removeChild(activityLog.lastChild);
  }
}

function setStatus(id, text) {
  document.querySelector(id).textContent = text;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showAuthMessage(message) {
  authMessage.textContent = message;
}

function getGameAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!gameAudioContext) {
    gameAudioContext = new AudioContextClass();
  }

  return gameAudioContext;
}

async function unlockGameAudio() {
  const context = getGameAudioContext();
  if (!context) return null;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }

  return context;
}

function getGameAudioOutput(context) {
  if (!context) return null;

  if (!gameAudioOutput || gameAudioOutput.context !== context) {
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-22, context.currentTime);
    compressor.knee.setValueAtTime(24, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0.0015, context.currentTime);
    compressor.release.setValueAtTime(0.16, context.currentTime);

    const master = context.createGain();
    master.gain.setValueAtTime(1.08, context.currentTime);

    compressor.connect(master);
    master.connect(context.destination);
    gameAudioOutput = { context, compressor, master };
  }

  return gameAudioOutput.compressor;
}

function scheduleTone({
  context,
  frequency = 440,
  startTime = 0,
  duration = 0.12,
  type = "sine",
  gain = 0.03,
  endFrequency = null,
}) {
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (typeof endFrequency === "number") {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), startTime + duration);
  }

  const scaledGain = Math.min(gain * SLOT_AUDIO_VOLUME, 0.24);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(scaledGain, startTime + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(getGameAudioOutput(context) || context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function createNoiseBuffer(context, duration = 0.12) {
  const sampleRate = context.sampleRate;
  const frameCount = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function scheduleNoiseBurst({
  context,
  startTime = 0,
  duration = 0.08,
  gain = 0.02,
  filterType = "bandpass",
  frequency = 1200,
  q = 1.6,
}) {
  if (!context) return;

  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(context, duration);

  const filter = context.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startTime);
  filter.Q.setValueAtTime(q, startTime);

  const gainNode = context.createGain();
  const scaledGain = Math.min(gain * SLOT_AUDIO_VOLUME, 0.22);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(scaledGain, startTime + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(getGameAudioOutput(context) || context.destination);
  source.start(startTime);
  source.stop(startTime + duration + 0.02);
}

function playSlotSpinSound(stopMoments = [3.5]) {
  if (!SLOT_MACHINE_SOUND_ENABLED) return;
  const context = getGameAudioContext();
  if (!context) return;

  const startTime = context.currentTime;
  const lastStopMoment = stopMoments.length ? stopMoments[stopMoments.length - 1] : 3.5;
  const totalDuration = Math.max((lastStopMoment || 3.5) + 0.22, 1.5);
  const pulseInterval = 0.095;
  const pulseCount = Math.max(10, Math.floor(totalDuration / pulseInterval));

  scheduleTone({
    context,
    frequency: 82,
    startTime,
    duration: totalDuration + 0.24,
    type: "sawtooth",
    gain: 0.018,
    endFrequency: 66,
  });

  scheduleTone({
    context,
    frequency: 128,
    startTime,
    duration: totalDuration + 0.12,
    type: "triangle",
    gain: 0.012,
    endFrequency: 92,
  });

  for (let i = 0; i < pulseCount; i += 1) {
    const time = startTime + i * pulseInterval;
    const mechanicalBase = 232 + (i % 4) * 24;

    scheduleTone({
      context,
      frequency: mechanicalBase,
      startTime: time,
      duration: 0.045,
      type: "square",
      gain: 0.026,
      endFrequency: mechanicalBase - 42,
    });

    scheduleTone({
      context,
      frequency: 146 + (i % 3) * 12,
      startTime: time + 0.008,
      duration: 0.055,
      type: "triangle",
      gain: 0.017,
      endFrequency: 104,
    });

    scheduleNoiseBurst({
      context,
      startTime: time,
      duration: 0.042,
      gain: 0.012,
      filterType: "bandpass",
      frequency: 1650 - (i % 4) * 115,
      q: 2.3,
    });

    if (i % 2 === 0) {
      scheduleNoiseBurst({
        context,
        startTime: time + 0.035,
        duration: 0.03,
        gain: 0.008,
        filterType: "highpass",
        frequency: 2600,
        q: 0.9,
      });
    }
  }

  stopMoments.forEach((stopTime, index) => {
    const accentBase = 340 + index * 40;
    const preStopTimes = [stopTime - 0.22, stopTime - 0.11].filter((time) => time > 0.06);

    preStopTimes.forEach((time, pulseIndex) => {
      scheduleTone({
        context,
        frequency: accentBase + pulseIndex * 30,
        startTime: startTime + time,
        duration: 0.05,
        type: "square",
        gain: 0.03,
        endFrequency: accentBase - 30,
      });

      scheduleNoiseBurst({
        context,
        startTime: startTime + time,
        duration: 0.035,
        gain: 0.014,
        filterType: "bandpass",
        frequency: 2200,
        q: 2.9,
      });
    });
  });

  const tailTimes = [totalDuration - 0.46, totalDuration - 0.18].filter((time) => time > 0);
  tailTimes.forEach((time, index) => {
    scheduleTone({
      context,
      frequency: 360 + index * 55,
      startTime: startTime + time,
      duration: 0.08,
      type: "square",
      gain: 0.035,
      endFrequency: 250,
    });

    scheduleNoiseBurst({
      context,
      startTime: startTime + time,
      duration: 0.045,
      gain: 0.018,
      filterType: "bandpass",
      frequency: 2100,
      q: 2.6,
    });
  });
}

function playSlotStopSound(index) {
  if (!SLOT_MACHINE_SOUND_ENABLED) return;
  const context = getGameAudioContext();
  if (!context) return;

  const startTime = context.currentTime;
  const base = 372 + index * 82;

  scheduleTone({
    context,
    frequency: base,
    startTime,
    duration: 0.09,
    type: "square",
    gain: 0.05,
    endFrequency: base - 92,
  });

  scheduleTone({
    context,
    frequency: base * 2.1,
    startTime: startTime + 0.006,
    duration: 0.082,
    type: "triangle",
    gain: 0.032,
    endFrequency: base * 1.5,
  });

  scheduleTone({
    context,
    frequency: base * 0.62,
    startTime: startTime + 0.024,
    duration: 0.16,
    type: "triangle",
    gain: 0.036,
    endFrequency: base * 0.42,
  });

  scheduleNoiseBurst({
    context,
    startTime,
    duration: 0.07,
    gain: 0.024,
    filterType: "highpass",
    frequency: 1650,
    q: 1.1,
  });

  scheduleNoiseBurst({
    context,
    startTime: startTime + 0.018,
    duration: 0.06,
    gain: 0.018,
    filterType: "bandpass",
    frequency: 2400,
    q: 3.1,
  });
}

function playSlotResultSound(isWin, isBigWin = false) {
  const context = getGameAudioContext();
  if (!context) return;

  const startTime = context.currentTime + 0.02;

  if (isWin) {
    const notes = isBigWin
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
      : [523.25, 659.25, 783.99, 987.77];

    scheduleTone({
      context,
      frequency: isBigWin ? 146.83 : 130.81,
      startTime,
      duration: isBigWin ? 0.82 : 0.56,
      type: "sawtooth",
      gain: 0.03,
      endFrequency: isBigWin ? 164.81 : 146.83,
    });

    notes.forEach((note, index) => {
      scheduleTone({
        context,
        frequency: note,
        startTime: startTime + index * 0.12,
        duration: isBigWin ? 0.28 : 0.21,
        type: index % 2 === 0 ? "square" : "triangle",
        gain: isBigWin ? 0.085 : 0.062,
        endFrequency: note * 1.025,
      });

      scheduleNoiseBurst({
        context,
        startTime: startTime + index * 0.12,
        duration: 0.045,
        gain: 0.016,
        filterType: "bandpass",
        frequency: 2400 + index * 180,
        q: 3.2,
      });
    });
    return;
  }

  scheduleTone({
    context,
    frequency: 210,
    startTime,
    duration: 0.16,
    type: "sawtooth",
    gain: 0.04,
    endFrequency: 150,
  });

  scheduleTone({
    context,
    frequency: 160,
    startTime: startTime + 0.1,
    duration: 0.22,
    type: "square",
    gain: 0.028,
    endFrequency: 90,
  });

  scheduleNoiseBurst({
    context,
    startTime,
    duration: 0.06,
    gain: 0.022,
    filterType: "highpass",
    frequency: 900,
    q: 1.2,
  });
}

function playOverlayResultSound(variant, game = "") {
  const context = getGameAudioContext();
  if (!context) return;

  const startTime = context.currentTime + 0.02;
  const isBlackjack = game === "Blackjack";

  if (variant === "win") {
    const notes = isBlackjack
      ? [392.0, 523.25, 659.25, 783.99]
      : [440.0, 587.33, 698.46];

    scheduleTone({
      context,
      frequency: isBlackjack ? 196.0 : 220.0,
      startTime,
      duration: isBlackjack ? 0.55 : 0.42,
      type: "triangle",
      gain: 0.028,
      endFrequency: isBlackjack ? 246.94 : 261.63,
    });

    notes.forEach((note, index) => {
      scheduleTone({
        context,
        frequency: note,
        startTime: startTime + index * 0.12,
        duration: 0.2,
        type: index % 2 === 0 ? "triangle" : "sine",
        gain: isBlackjack ? 0.05 : 0.042,
        endFrequency: note * 1.02,
      });
    });
    return;
  }

  if (variant === "push") {
    scheduleTone({
      context,
      frequency: 392.0,
      startTime,
      duration: 0.18,
      type: "sine",
      gain: 0.02,
      endFrequency: 392.0,
    });

    scheduleTone({
      context,
      frequency: 493.88,
      startTime: startTime + 0.13,
      duration: 0.18,
      type: "sine",
      gain: 0.02,
      endFrequency: 493.88,
    });
    return;
  }

  scheduleTone({
    context,
    frequency: 246.94,
    startTime,
    duration: 0.15,
    type: "sawtooth",
    gain: 0.03,
    endFrequency: 185.0,
  });

  scheduleTone({
    context,
    frequency: 164.81,
    startTime: startTime + 0.1,
    duration: 0.18,
    type: "triangle",
    gain: 0.022,
    endFrequency: 123.47,
  });
}

function clearResultCoinBurst() {
  if (!resultCoinBurst) return;
  resultCoinBurst.innerHTML = "";
}

function clearResultLossTrend() {
  if (!resultLossTrend) return;
  resultLossTrend.classList.remove("active");
  resultLossTrend.innerHTML = "";
}

function spawnResultLossTrend() {
  if (!resultLossTrend) return;

  clearResultLossTrend();
  const svgNs = "http://www.w3.org/2000/svg";
  const width = 320;
  const height = 120;

  const defs = document.createElementNS(svgNs, "defs");
  const gradient = document.createElementNS(svgNs, "linearGradient");
  gradient.setAttribute("id", "resultLossFill");
  gradient.setAttribute("x1", "0");
  gradient.setAttribute("y1", "0");
  gradient.setAttribute("x2", "0");
  gradient.setAttribute("y2", "1");

  const startStop = document.createElementNS(svgNs, "stop");
  startStop.setAttribute("offset", "0%");
  startStop.setAttribute("stop-color", "rgba(255, 93, 82, 0.34)");
  const endStop = document.createElementNS(svgNs, "stop");
  endStop.setAttribute("offset", "100%");
  endStop.setAttribute("stop-color", "rgba(255, 93, 82, 0)");

  gradient.appendChild(startStop);
  gradient.appendChild(endStop);
  defs.appendChild(gradient);
  resultLossTrend.appendChild(defs);

  [24, 52, 80, 108].forEach((y) => {
    const line = document.createElementNS(svgNs, "line");
    line.setAttribute("x1", "8");
    line.setAttribute("x2", String(width - 8));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("class", "result-loss-grid-line");
    resultLossTrend.appendChild(line);
  });

  const points = [];
  let currentY = 18 + Math.random() * 10;
  for (let i = 0; i < 7; i += 1) {
    const x = 14 + i * 48;
    if (i === 0) {
      points.push({ x, y: currentY });
      continue;
    }

    const stepDown = 7 + Math.random() * 14;
    const bounce = i === 2 || i === 4 ? -(Math.random() * 6) : 0;
    currentY = Math.min(104, Math.max(18, currentY + stepDown + bounce));
    points.push({ x, y: currentY });
  }

  points[points.length - 1].y = Math.max(points[points.length - 1].y, 98);

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const area = document.createElementNS(svgNs, "path");
  area.setAttribute("d", areaPath);
  area.setAttribute("class", "result-loss-area");
  resultLossTrend.appendChild(area);

  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("d", linePath);
  path.setAttribute("class", "result-loss-line");
  resultLossTrend.appendChild(path);

  points.forEach((point, index) => {
    const dot = document.createElementNS(svgNs, "circle");
    dot.setAttribute("cx", String(point.x));
    dot.setAttribute("cy", String(point.y));
    dot.setAttribute("r", index === points.length - 1 ? "5.5" : "3.5");
    dot.setAttribute("class", "result-loss-dot");
    dot.style.animationDelay = `${160 + index * 90}ms`;
    resultLossTrend.appendChild(dot);
  });

  const lastPoint = points[points.length - 1];
  const arrow = document.createElementNS(svgNs, "path");
  arrow.setAttribute(
    "d",
    `M ${lastPoint.x + 4} ${lastPoint.y - 2} L ${lastPoint.x + 22} ${lastPoint.y + 6} L ${lastPoint.x + 10} ${lastPoint.y + 18} Z`,
  );
  arrow.setAttribute("class", "result-loss-arrow");
  resultLossTrend.appendChild(arrow);

  resultLossTrend.classList.add("active");
}

function spawnResultCoinBurst(amount = 0) {
  if (!resultCoinBurst) return;

  clearResultCoinBurst();
  const intensity = Math.min(26, Math.max(12, Math.round(Math.abs(Number(amount) || 0) / 120)));

  for (let i = 0; i < intensity; i += 1) {
    const coin = document.createElement("span");
    coin.className = "result-coin";
    coin.style.setProperty("--coin-left", `${8 + Math.random() * 84}%`);
    coin.style.setProperty("--coin-delay", `${Math.random() * 240}ms`);
    coin.style.setProperty("--coin-drift", `${-44 + Math.random() * 88}px`);
    coin.style.setProperty("--coin-rise", `${54 + Math.random() * 72}px`);
    coin.style.setProperty("--coin-rotate", `${-220 + Math.random() * 440}deg`);
    coin.style.width = `${26 + Math.random() * 14}px`;
    coin.style.height = coin.style.width;
    coin.style.fontSize = `${0.9 + Math.random() * 0.28}rem`;
    resultCoinBurst.appendChild(coin);
  }
}

function playCoinPayoutSound(amount = 0) {
  const context = getGameAudioContext();
  if (!context) return;

  const startTime = context.currentTime + 0.02;
  const intensity = Math.min(12, Math.max(5, Math.round(Math.abs(Number(amount) || 0) / 160)));

  for (let i = 0; i < intensity; i += 1) {
    const time = startTime + i * 0.065;
    const sparkle = 980 + (i % 4) * 130 + Math.random() * 70;

    scheduleTone({
      context,
      frequency: sparkle,
      startTime: time,
      duration: 0.085,
      type: "triangle",
      gain: 0.04,
      endFrequency: sparkle * 0.9,
    });

    scheduleTone({
      context,
      frequency: sparkle * 1.48,
      startTime: time + 0.012,
      duration: 0.06,
      type: "sine",
      gain: 0.024,
      endFrequency: sparkle * 1.25,
    });

    scheduleNoiseBurst({
      context,
      startTime: time,
      duration: 0.035,
      gain: 0.01,
      filterType: "bandpass",
      frequency: 2400 + (i % 3) * 220,
      q: 3.4,
    });
  }
}

function syncBetInputs() {
  const maxBet = Math.max(0, Math.floor(Number(state.balance) || 0));
  const betInputs = [blackjackBetInput, coinBetInput, raceBetInput, slotsBetInput, rouletteBetInput];

  betInputs.forEach((input) => {
    if (!input) return;
    input.min = maxBet > 0 ? "1" : "0";
    input.step = "1";
    input.max = String(maxBet);

    const currentValue = Number(input.value);
    if (!Number.isFinite(currentValue) || currentValue < 1) {
      input.value = maxBet > 0 ? String(Math.min(50, maxBet)) : "0";
      return;
    }

    if (currentValue > maxBet && maxBet > 0) {
      input.value = String(maxBet);
    }
  });
}

function formatCoinDelta(amount) {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  const absolute = Number.isInteger(Math.abs(rounded))
    ? Math.abs(rounded).toFixed(0)
    : Math.abs(rounded).toFixed(2);

  if (rounded > 0) return `+${absolute} Coins`;
  if (rounded < 0) return `-${absolute} Coins`;
  return "0 Coins";
}

function hideGameResult() {
  if (!resultOverlay) return;
  if (resultOverlayTimer) {
    window.clearTimeout(resultOverlayTimer);
    resultOverlayTimer = null;
  }

  clearResultCoinBurst();
  clearResultLossTrend();

  resultOverlay.classList.remove("visible");
  window.setTimeout(() => {
    resultOverlay.classList.add("hidden");
  }, 220);
}

function showGameResult({ game, title, amount = 0, detail = "", variant = "push", duration = RESULT_SCREEN_DURATION, playSound = true }) {
  if (!resultOverlay) return;

  if (resultOverlayTimer) {
    window.clearTimeout(resultOverlayTimer);
    resultOverlayTimer = null;
  }

  resultOverlay.dataset.variant = variant;
  resultGameLabel.textContent = game;
  resultTitle.textContent = title;
  resultAmount.textContent = formatCoinDelta(amount);
  resultDetail.textContent = detail;
  resultOverlay.classList.remove("hidden");

  window.requestAnimationFrame(() => {
    resultOverlay.classList.add("visible");
  });

  if (variant === "win") {
    spawnResultCoinBurst(amount);
    clearResultLossTrend();
    void unlockGameAudio().then(() => {
      playCoinPayoutSound(amount);
    });
  } else if (variant === "loss") {
    clearResultCoinBurst();
    spawnResultLossTrend();
  } else {
    clearResultCoinBurst();
    clearResultLossTrend();
  }

  if (playSound) {
    void unlockGameAudio().then(() => {
      playOverlayResultSound(variant, game);
    });
  }

  if (duration > 0) {
    resultOverlayTimer = window.setTimeout(() => {
      hideGameResult();
    }, duration);
  }
}

function buildBalanceLine(extra = "") {
  const currentCoins = Number(getCurrentUser()?.coins ?? state.balance ?? 0);
  return extra
    ? `${extra} Neue Balance: ${currentCoins} Coins.`
    : `Neue Balance: ${currentCoins} Coins.`;
}

function showGamePanel(target) {
  gameMenuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.gameTarget === target);
  });

  gamePanels.forEach((panel) => {
    panel.classList.toggle("active-game", panel.dataset.gamePanel === target);
  });

  if (target === "roulette") {
    window.requestAnimationFrame(() => {
      renderRouletteWheel();
    });
  }
}

function showMenuPanel(target) {
  menuSwitchButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.menuView === target);
  });

  menuPanels.forEach((panel) => {
    panel.classList.toggle("active-menu-view", panel.dataset.menuPanel === target);
  });
}

function setAuthView(nextView) {
  state.authView = nextView;
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authView === nextView);
  });
  Object.entries(authViews).forEach(([key, view]) => {
    view.classList.toggle("hidden", key !== nextView);
    view.classList.toggle("active-auth-view", key === nextView);
  });
}

function renderAuthState() {
  const currentUser = getCurrentUser();
  logoutUserButton?.classList.toggle("hidden", !currentUser);
  document.querySelector("#loginUser").classList.toggle("hidden", !!currentUser);
  document.querySelector("#registerUser").classList.toggle("hidden", !!currentUser);
  authViews.login.classList.toggle("hidden", !!currentUser || state.authView !== "login");
  authViews.register.classList.toggle("hidden", !!currentUser || state.authView !== "register");

  if (currentUser) {
    showAuthMessage(`Eingeloggt als ${currentUser.username}.`);
  } else if (state.authView === "login") {
    showAuthMessage("Logge dich ein, um Coins zu spielen und dein Profil zu sehen.");
  } else {
    showAuthMessage("Registriere einen neuen Spieler mit Benutzername, Passwort und E-Mail.");
  }
}

function renderProfile() {
  const currentUser = getCurrentUser();
  profileUsername.textContent = currentUser ? currentUser.username : "-";
  profileEmail.textContent = currentUser ? currentUser.email : "-";
  profilePlayerId.textContent = currentUser ? currentUser.playerId : "-";
  profileCoins.textContent = currentUser ? String(currentUser.coins) : "0";
  profileLuckBoost.textContent = `x${getCurrentLuckBoost(currentUser)}`;
  changeUsernameInput.value = currentUser ? currentUser.username : "";
  if (adminLuckBoostInput) {
    adminLuckBoostInput.value = String(getCurrentLuckBoost(currentUser));
  }

  if (!currentUser) {
    renderFriendSections({});
    return;
  }

  const friends = currentUser.friends
    .map((friendId) => findUserByPlayerId(friendId))
    .filter(Boolean)
    .map((friend) => ({
      id: friend.id,
      username: friend.username,
      playerId: friend.playerId,
      coins: friend.coins,
    }));

  const incomingRequests = getIncomingFriendRequestsForUser(currentUser.id).map((request) => ({
    id: request.id,
    username: request.user.username,
    playerId: request.user.playerId,
  }));

  const outgoingRequests = getOutgoingFriendRequestsForUser(currentUser.id).map((request) => ({
    id: request.id,
    username: request.user.username,
    playerId: request.user.playerId,
  }));

  renderFriendSections({
    friends,
    incomingRequests,
    outgoingRequests,
    onOpenFriendMenu: (friend) => {
      openFriendActionMenu({
        title: `${friend.username} (${friend.playerId})`,
        info: "Schicke diesem bestätigten Freund einen Betrag aus deinem Coin-Guthaben.",
        onSubmit: async (amount) => sendCoinsToLocalFriend(friend.playerId, amount),
        onRemove: async () => {
          const activeUser = getCurrentUser();
          const targetUser = findUserByPlayerId(friend.playerId);

          if (!activeUser) {
            return { ok: false, message: "Bitte zuerst einloggen." };
          }
          if (!targetUser || !areUsersFriends(activeUser, targetUser)) {
            return { ok: false, message: "Dieser Spieler ist nicht mehr in deiner Freundesliste." };
          }

          removeFriendshipBetweenUsers(activeUser, targetUser);
          syncCurrentUser();
          showAuthMessage(`${targetUser.username} wurde aus deiner Freundesliste entfernt.`);
          logActivity(`${activeUser.username} hat ${targetUser.username} aus der Freundesliste entfernt.`);
          return { ok: true, message: `${targetUser.username} wurde entfernt.` };
        },
      });
    },
    onAcceptRequest: async (requestId) => {
      const request = getIncomingFriendRequestsForUser(currentUser.id).find((entry) => entry.id === requestId);
      if (!request || !request.user) return;
      addFriendshipBetweenUsers(currentUser, request.user);
      removeFriendRequest(requestId);
      syncCurrentUser();
      showAuthMessage(`${request.user.username} ist jetzt mit dir befreundet.`);
      logActivity(`${currentUser.username} und ${request.user.username} sind jetzt befreundet.`);
    },
    onDeclineRequest: async (requestId) => {
      const request = getIncomingFriendRequestsForUser(currentUser.id).find((entry) => entry.id === requestId);
      removeFriendRequest(requestId);
      syncCurrentUser();
      if (request?.user) {
        showAuthMessage(`Anfrage von ${request.user.username} abgelehnt.`);
      }
    },
    onCancelRequest: async (requestId) => {
      const request = getOutgoingFriendRequestsForUser(currentUser.id).find((entry) => entry.id === requestId);
      removeFriendRequest(requestId);
      syncCurrentUser();
      if (request?.user) {
        showAuthMessage(`Anfrage an ${request.user.username} zurückgezogen.`);
      }
    },
  });
}

function renderLeaderboard() {
  const topUsers = [...state.appData.users]
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 20);

  leaderboardList.innerHTML = "";
  renderLocalPlayers();

  if (topUsers.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Spieler registriert.";
    leaderboardList.appendChild(item);
    return;
  }

  topUsers.forEach((user, index) => {
    const item = document.createElement("li");
    item.textContent = `#${index + 1} ${user.username} - ${user.coins} Coins - ${user.playerId}`;
    leaderboardList.appendChild(item);
  });
}

function renderLocalPlayers() {
  localPlayersList.innerHTML = "";

  if (state.appData.users.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine lokalen Spieler vorhanden.";
    localPlayersList.appendChild(item);
    return;
  }

  state.appData.users.forEach((user) => {
    const item = document.createElement("li");
    item.textContent = `${user.username} - ${user.playerId}`;
    localPlayersList.appendChild(item);
  });
}

function ensureUserProgress(user) {
  if (!user.daily) {
    user.daily = { lastClaimDate: null, workDate: null, workCompleted: 0 };
  }
  if (!user.daily.workDate) {
    user.daily.workDate = todayKey();
  }
  if (user.daily.workDate !== todayKey()) {
    user.daily.workDate = todayKey();
    user.daily.workCompleted = 0;
  }
}

function renderDailyPanel() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    dailyStatusText.textContent = "Logge dich ein, um deine tägliche Belohnung abzuholen.";
    workCounter.textContent = "Heute gelöst: 0 / 10";
    workQuestion.textContent = "Logge dich ein und starte eine Aufgabe.";
    workStatusText.textContent = "Je nach Schwierigkeit bekommst du zwischen 50 und 1.000 Coins.";
    return;
  }

  ensureUserProgress(currentUser);
  const claimedToday = currentUser.daily.lastClaimDate === todayKey();
  dailyStatusText.textContent = claimedToday
    ? "Die tägliche Belohnung wurde heute bereits abgeholt."
    : "Du kannst heute 1.000 Coins claimen.";
  workCounter.textContent = `Heute gelöst: ${currentUser.daily.workCompleted} / ${WORK_LIMIT_PER_DAY}`;
}

function setAdminMode(isUnlocked) {
  state.adminUnlocked = isUnlocked;
  adminStatus.textContent = isUnlocked ? "Offen" : "Gesperrt";
  adminControls.classList.toggle("hidden", !isUnlocked);
  renderAdminAccounts();
}

function syncCurrentUser() {
  if (state.appData.currentUserId) {
    state.currentProfile = state.appData.users.find((user) => user.id === state.appData.currentUserId) || null;
  } else {
    state.currentProfile = null;
  }
  updateBalance();
  renderProfile();
  renderLeaderboard();
  renderDailyPanel();
  renderAuthState();
  renderAdminAccounts();
  saveAppData();
}

function renderAdminAccounts() {
  if (!adminAccountsList) return;
  adminAccountsList.innerHTML = "";

  if (!state.adminUnlocked) {
    const item = document.createElement("li");
    item.textContent = "Admin-Login nötig.";
    adminAccountsList.appendChild(item);
    return;
  }

  if (state.appData.users.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Accounts vorhanden.";
    adminAccountsList.appendChild(item);
    return;
  }

  state.appData.users.forEach((user) => {
    const item = document.createElement("li");
    item.className = "admin-account-item";
    item.innerHTML = `
      <div class="admin-account-row">
        <span>${user.username} - ${user.playerId}</span>
        <button class="button secondary danger-button" data-delete-user="${user.id}">Löschen</button>
      </div>
    `;
    adminAccountsList.appendChild(item);
  });

  adminAccountsList.querySelectorAll("[data-delete-user]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.deleteUser;
      const user = state.appData.users.find((entry) => entry.id === targetId);
      if (!user) return;

      const wrapper = document.createElement("div");
      wrapper.className = "confirm-delete";
      wrapper.innerHTML = `
        <span>Account ${user.username} wirklich löschen?</span>
        <div class="actions">
          <button class="button secondary danger-button" data-confirm-delete="${user.id}">Ja, endgültig löschen</button>
          <button class="button secondary" data-cancel-delete="true">Abbrechen</button>
        </div>
      `;

      const parent = button.closest(".admin-account-item");
      const existingConfirm = parent.querySelector(".confirm-delete");
      if (existingConfirm) {
        existingConfirm.remove();
        return;
      }

      parent.appendChild(wrapper);

      wrapper.querySelector("[data-cancel-delete]").addEventListener("click", () => {
        wrapper.remove();
      });

      wrapper.querySelector("[data-confirm-delete]").addEventListener("click", () => {
        deleteUserById(user.id);
      });
    });
  });
}

function deleteUserById(userId) {
  const user = state.appData.users.find((entry) => entry.id === userId);
  if (!user) return;

  state.appData.users = state.appData.users.filter((entry) => entry.id !== userId);
  state.appData.friendRequests = getPendingFriendRequests().filter((request) => request.fromUserId !== userId && request.toUserId !== userId);
  state.appData.users.forEach((entry) => {
    entry.friends = entry.friends.filter((friendId) => friendId !== user.playerId);
  });

  if (state.appData.currentUserId === userId) {
    state.appData.currentUserId = null;
    setAdminMode(false);
  }

  syncCurrentUser();
  logActivity(`Admin hat den Account ${user.username} gelöscht.`);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createWorkTask() {
  const difficulty = randomInt(1, 3);
  let question = "";
  let answer = 0;
  let reward = 100;

  if (difficulty === 1) {
    const a = randomInt(8, 40);
    const b = randomInt(4, 25);
    question = `${a} + ${b}`;
    answer = a + b;
    reward = randomInt(50, 220);
  } else if (difficulty === 2) {
    const a = randomInt(4, 12);
    const b = randomInt(3, 10);
    const c = randomInt(2, 12);
    question = `${a} × ${b} + ${c}`;
    answer = a * b + c;
    reward = randomInt(250, 650);
  } else {
    const divisor = randomInt(2, 10);
    const quotient = randomInt(3, 12);
    const product = divisor * quotient;
    const extra = randomInt(5, 25);
    question = `${product} ÷ ${divisor} + ${extra}`;
    answer = quotient + extra;
    reward = randomInt(700, 1000);
  }

  return { question, answer, reward };
}

function requireUser(statusSelector) {
  const currentUser = getCurrentUser();
  if (currentUser) return currentUser;

  if (statusSelector) {
    setStatus(statusSelector, "Login nötig");
  }
  showAuthMessage("Bitte erst einloggen.");
  return null;
}

async function adjustBalance(amount, user = getCurrentUser()) {
  if (!user) return false;

  if (!state.appData.currentUserId && typeof window.liveAdjustBalance === "function") {
    return window.liveAdjustBalance(amount, user);
  }

  user.coins = Math.max(0, Number(user.coins || 0) + amount);
  syncCurrentUser();
  return true;
}

function getBetValue(selector) {
  const value = Number(document.querySelector(selector).value);
  return Number.isFinite(value) ? value : 0;
}

function canAfford(bet) {
  return bet >= 1 && bet <= state.balance;
}

function getCurrentLuckBoost(user = getCurrentUser()) {
  return clampLuckBoost(user?.luckBoost ?? user?.luck_boost ?? 1);
}

function getLuckProgress(user = getCurrentUser()) {
  return (getCurrentLuckBoost(user) - 1) / 99;
}

function getRouletteNumbersForSelection(selection) {
  if (!selection) return [];

  const numericValue = Number(selection.value);
  switch (selection.type) {
    case "straight":
      return [numericValue];
    case "color":
      return rouletteSequence.filter((number) => number !== 0 && getRouletteColor(number) === selection.value);
    case "parity":
      return rouletteSequence.filter((number) => number !== 0 && (selection.value === "even" ? number % 2 === 0 : number % 2 === 1));
    case "range":
      return rouletteSequence.filter((number) => number !== 0 && (selection.value === "low"
        ? number >= 1 && number <= 18
        : number >= 19 && number <= 36));
    case "dozen":
      return rouletteSequence.filter((number) => number !== 0 && (
        (numericValue === 1 && number >= 1 && number <= 12)
        || (numericValue === 2 && number >= 13 && number <= 24)
        || (numericValue === 3 && number >= 25 && number <= 36)
      ));
    default:
      return [];
  }
}

function generateRouletteWinningNumber(selection, user = getCurrentUser()) {
  const baseNumber = rouletteSequence[randomInt(0, rouletteSequence.length - 1)];
  const winningNumbers = getRouletteNumbersForSelection(selection);
  const luckChance = getLuckProgress(user) * 0.96;

  if (!winningNumbers.length || Math.random() >= luckChance) {
    return baseNumber;
  }

  return winningNumbers[randomInt(0, winningNumbers.length - 1)];
}

function formatSlotSymbol(symbol) {
  return slotSymbolMap[symbol]?.display || String(symbol);
}

function getSlotSymbolClass(symbol) {
  return slotSymbolMap[symbol]?.className || "";
}

function getRandomSlotSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function buildReelSequence(finalSymbol, loops = 20) {
  const sequence = [];
  for (let i = 0; i < loops; i += 1) {
    sequence.push(getRandomSlotSymbol());
  }
  sequence.push(finalSymbol);
  return sequence;
}

function generateSlotOutcome(user = getCurrentUser()) {
  const result = [getRandomSlotSymbol(), getRandomSlotSymbol(), getRandomSlotSymbol()];
  const uniqueCount = new Set(result).size;
  const luckProgress = getLuckProgress(user);

  // Hebt die Gewinnchance nur leicht an, indem manche Nieten zu einem Paar werden.
  if (uniqueCount === 3 && Math.random() < (0.08 + luckProgress * 0.5)) {
    const sourceIndex = Math.random() < 0.5 ? 0 : 1;
    result[2] = result[sourceIndex];
    if (Math.random() < (0.08 + luckProgress * 0.72)) {
      result[1] = result[0];
    }
  }

  return result;
}

function getSlotPayoutDetails(result, bet) {
  const uniqueCount = new Set(result).size;

  if (uniqueCount === 1) {
    const symbol = result[0];
    const multiplier = slotPayoutMultipliers[symbol] || 3;
    const profit = Math.max(1, Math.round(bet * multiplier));
    return {
      profit,
      payout: profit + bet,
      multiplier,
      label: `3x ${formatSlotSymbol(symbol)}`,
    };
  }

  if (uniqueCount === 2) {
    const multiplier = slotPayoutMultipliers.pair;
    const profit = Math.max(1, Math.round(bet * multiplier));
    return {
      profit,
      payout: profit + bet,
      multiplier,
      label: "2 gleiche",
    };
  }

  return {
    profit: 0,
    payout: 0,
    multiplier: 0,
    label: "Keine Kombination",
  };
}

function normalizeAngle(angle) {
  return ((Number(angle) || 0) % 360 + 360) % 360;
}

function getRouletteColor(number) {
  if (number === 0) return "green";
  return rouletteRedNumbers.has(number) ? "red" : "black";
}

function getRoulettePocketAngle(number) {
  const index = rouletteSequence.indexOf(number);
  if (index < 0) return 0;
  return index * ROULETTE_POCKET_STEP + (ROULETTE_POCKET_STEP / 2);
}

function buildRouletteWheelGradient() {
  const segments = rouletteSequence.map((number, index) => {
    const start = (index * ROULETTE_POCKET_STEP).toFixed(3);
    const end = ((index + 1) * ROULETTE_POCKET_STEP).toFixed(3);
    const color = getRouletteColor(number) === "red"
      ? "#8b1f27"
      : getRouletteColor(number) === "black"
        ? "#171b25"
        : "#237644";
    return `${color} ${start}deg ${end}deg`;
  });

  return `
    radial-gradient(circle at center, rgba(7, 13, 23, 0.1) 0 32%, transparent 33%),
    conic-gradient(${segments.join(", ")})
  `;
}

function buildRouletteLastNumberMarkup(number) {
  const color = getRouletteColor(number);
  return `Letzte Zahl: <span class="roulette-number-pill ${color}">${number}</span>`;
}

function setRouletteVisualState(wheelAngle = state.roulette.wheelRotation, ballAngle = state.roulette.ballRotation, immediate = false) {
  if (rouletteWheel) {
    if (immediate) {
      rouletteWheel.style.transition = "none";
    }
    rouletteWheel.style.transform = `rotate(${wheelAngle}deg)`;
  }

  if (rouletteBallTrack) {
    if (immediate) {
      rouletteBallTrack.style.transition = "none";
    }
    rouletteBallTrack.style.transform = `rotate(${ballAngle}deg)`;
  }
}

function renderRouletteWheel() {
  if (!rouletteWheel || !rouletteWheelNumbers) return;

  rouletteWheel.style.background = buildRouletteWheelGradient();
  rouletteWheelNumbers.innerHTML = "";
  const wheelSize = rouletteWheel.clientWidth || 320;
  const center = wheelSize / 2;
  const radius = wheelSize * 0.415;

  rouletteSequence.forEach((number, index) => {
    const angle = index * ROULETTE_POCKET_STEP + (ROULETTE_POCKET_STEP / 2);
    const radians = ((angle - 90) * Math.PI) / 180;
    const x = center + Math.cos(radians) * radius;
    const y = center + Math.sin(radians) * radius;
    const label = document.createElement("div");
    const color = getRouletteColor(number);
    label.className = `roulette-pocket-label ${color}`;
    label.textContent = String(number);
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = "translate(-50%, -50%)";
    rouletteWheelNumbers.appendChild(label);
  });
}

function createRouletteNumberButton(number) {
  const color = getRouletteColor(number);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `roulette-bet-button roulette-${color}`;
  button.dataset.rouletteType = "straight";
  button.dataset.rouletteValue = String(number);
  button.dataset.rouletteLabel = `Zahl ${number}`;
  button.dataset.roulettePayout = "35";
  button.textContent = String(number);
  return button;
}

function getRouletteBetButtons() {
  return [...document.querySelectorAll(".roulette-bet-button[data-roulette-type]")];
}

function describeRouletteSelection(selection = state.roulette.selection) {
  if (!selection) return "Kein Feld gewählt.";
  return `${selection.label} · Auszahlung ${selection.payout}:1`;
}

function setRouletteSelection(selection) {
  state.roulette.selection = selection;
  if (rouletteSelectionLabel) {
    rouletteSelectionLabel.textContent = describeRouletteSelection(selection);
  }

  getRouletteBetButtons().forEach((button) => {
    const isSelected =
      button.dataset.rouletteType === selection?.type
      && button.dataset.rouletteValue === String(selection?.value);
    button.classList.toggle("selected", isSelected);
  });
}

function handleRouletteBetButtonClick(button) {
  if (!button || state.roulette.busy) return;
  setRouletteSelection({
    type: button.dataset.rouletteType,
    value: button.dataset.rouletteValue,
    label: button.dataset.rouletteLabel,
    payout: Number(button.dataset.roulettePayout || 0),
  });
}

function renderRouletteBoard() {
  if (!rouletteNumbersGrid) return;

  rouletteNumbersGrid.innerHTML = "";
  for (let number = 1; number <= 36; number += 1) {
    rouletteNumbersGrid.appendChild(createRouletteNumberButton(number));
  }

  getRouletteBetButtons().forEach((button) => {
    button.addEventListener("click", () => {
      handleRouletteBetButtonClick(button);
    });
  });

  const defaultSelectionButton = document.querySelector('.roulette-bet-button[data-roulette-type="color"][data-roulette-value="red"]');
  if (defaultSelectionButton) {
    handleRouletteBetButtonClick(defaultSelectionButton);
  }
}

function evaluateRouletteBet(selection, winningNumber, bet) {
  if (!selection) {
    return { won: false, profit: 0, payout: 0 };
  }

  let won = false;
  const numericValue = Number(selection.value);

  switch (selection.type) {
    case "straight":
      won = winningNumber === numericValue;
      break;
    case "color":
      won = winningNumber !== 0 && getRouletteColor(winningNumber) === selection.value;
      break;
    case "parity":
      won = winningNumber !== 0 && (selection.value === "even" ? winningNumber % 2 === 0 : winningNumber % 2 === 1);
      break;
    case "range":
      won = winningNumber !== 0 && (selection.value === "low"
        ? winningNumber >= 1 && winningNumber <= 18
        : winningNumber >= 19 && winningNumber <= 36);
      break;
    case "dozen":
      won = winningNumber !== 0 && (
        (numericValue === 1 && winningNumber >= 1 && winningNumber <= 12)
        || (numericValue === 2 && winningNumber >= 13 && winningNumber <= 24)
        || (numericValue === 3 && winningNumber >= 25 && winningNumber <= 36)
      );
      break;
    default:
      won = false;
  }

  const profit = won ? Math.round(bet * Number(selection.payout || 0)) : 0;
  return {
    won,
    profit,
    payout: won ? profit + bet : 0,
  };
}

function renderReel(reel, sequence) {
  reel.innerHTML = "";
  sequence.forEach((symbol) => {
    const item = document.createElement("div");
    const symbolClass = getSlotSymbolClass(symbol);
    item.className = `reel-symbol ${symbolClass}`.trim();
    item.innerHTML = `<span class="slot-symbol-badge ${symbolClass}">${formatSlotSymbol(symbol)}</span>`;
    reel.appendChild(item);
  });
}

function renderAllCardsPreview() {
  if (!allCardsPreview) return;

  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  allCardsPreview.innerHTML = "";

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      allCardsPreview.appendChild(createCardElement({ rank, suit }));
    });
  });
}

function setBetLocked(input, locked) {
  input.disabled = locked;
}

function createDeck(numberOfDecks = 6) {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck = [];

  for (let shoeIndex = 0; shoeIndex < numberOfDecks; shoeIndex += 1) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }

  return deck;
}

function drawCard() {
  const card = state.blackjack.deck.pop();
  if (!card) return null;

  blackjackCardSequence += 1;
  return {
    ...card,
    id: `bj-${blackjackCardSequence}`,
  };
}

function normalizeSuit(suit) {
  const suitMap = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
    "♠": "♠",
    "♥": "♥",
    "♦": "♦",
    "♣": "♣",
  };

  return suitMap[suit] || suit;
}

function getCardValue(rank) {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return Number(rank);
}

function getAceOverride(aceValues = {}, card, index = 0) {
  if (!card || card.rank !== "A") return null;

  const primaryKey = card.id || `index-${index}`;
  const fallbackKey = `index-${index}`;
  const rawValue = Object.prototype.hasOwnProperty.call(aceValues, primaryKey)
    ? aceValues[primaryKey]
    : aceValues[fallbackKey];
  const value = Number(rawValue);

  return value === 1 || value === 11 ? value : null;
}

function calculateHandDetails(cards, aceValues = {}, options = {}) {
  const { autoAdjust = true } = options;
  let total = 0;
  let flexibleAces = 0;

  cards.forEach((card, index) => {
    if (card.rank === "A") {
      const override = getAceOverride(aceValues, card, index);
      if (override === 1 || override === 11) {
        total += override;
      } else {
        total += 11;
        flexibleAces += 1;
      }
      return;
    }

    total += getCardValue(card.rank);
  });

  while (autoAdjust && total > 21 && flexibleAces > 0) {
    total -= 10;
    flexibleAces -= 1;
  }

  return {
    total,
    isSoft: flexibleAces > 0 && total <= 21,
  };
}

function calculateHand(cards, aceValues = {}, options = {}) {
  return calculateHandDetails(cards, aceValues, options).total;
}

function getHandDetails(hand, options = {}) {
  return calculateHandDetails(hand.cards, hand.aceValues || {}, options);
}

function getHandScore(hand, options = {}) {
  return getHandDetails(hand, options).total;
}

function shouldDealerDraw(cards) {
  const details = calculateHandDetails(cards);
  return details.total < 17 || (DEALER_HITS_SOFT_17 && details.total === 17 && details.isSoft);
}

function isBlackjack(cards, aceValues = {}) {
  return cards.length === 2 && calculateHand(cards, aceValues) === 21;
}

function getSplitValue(card) {
  const rawValue = getCardValue(card.rank);
  return rawValue === 11 ? 11 : rawValue;
}

function getBlackjackProfit(bet) {
  return Math.round((Number(bet) || 0) * 1.5 * 100) / 100;
}

function getBlackjackPayout(bet) {
  return Math.round(((Number(bet) || 0) + getBlackjackProfit(bet)) * 100) / 100;
}

function canSplitHand(hand) {
  return !!hand
    && !hand.finished
    && !hand.doubled
    && hand.cards.length === 2
    && state.blackjack.hands.length < MAX_BLACKJACK_HANDS
    && getSplitValue(hand.cards[0]) === getSplitValue(hand.cards[1]);
}

function getActiveHand() {
  return state.blackjack.hands[state.blackjack.activeHandIndex];
}

function isSplitAcesHand(hand) {
  return !!hand?.splitAces;
}

function findPendingAceChoiceInHand(hand) {
  if (!hand || hand.cards.length < 2) return null;

  return hand.cards.find((card, index) => {
    if (card.rank !== "A") return false;
    if (getAceOverride(hand.aceValues || {}, card, index)) return false;

    const asOne = calculateHand(hand.cards, {
      ...(hand.aceValues || {}),
      [card.id || `index-${index}`]: 1,
    });
    const asEleven = calculateHand(hand.cards, {
      ...(hand.aceValues || {}),
      [card.id || `index-${index}`]: 11,
    });

    return asOne !== asEleven;
  }) || null;
}

function promptBlackjackAceChoice(handIndex, aceCard) {
  const hand = state.blackjack.hands[handIndex];
  const aceKey = aceCard.id || `index-${hand.cards.indexOf(aceCard)}`;
  const asOne = calculateHand(hand.cards, {
    ...(hand.aceValues || {}),
    [aceKey]: 1,
  });
  const asEleven = calculateHand(hand.cards, {
    ...(hand.aceValues || {}),
    [aceKey]: 11,
  });

  return new Promise((resolve) => {
    state.blackjack.aceChoice = {
      handIndex,
      cardId: aceKey,
      resolve,
    };

    aceChoiceText.textContent = `Hand ${handIndex + 1}: Du hast ein Ass gezogen. Soll es als 11 oder 1 zählen?`;
    aceChoiceTotals.textContent = `Als 11 wärst du bei ${asEleven} Punkten. Als 1 wärst du bei ${asOne} Punkten.`;
    if (blackjackAceOverlayTimer) {
      window.clearTimeout(blackjackAceOverlayTimer);
      blackjackAceOverlayTimer = null;
    }
    blackjackAceOverlay?.classList.remove("hidden");
    window.requestAnimationFrame(() => {
      blackjackAceOverlay?.classList.add("visible");
    });
    renderBlackjack();
  });
}

function cancelBlackjackAceChoice(defaultValue = 1) {
  const pendingChoice = state.blackjack.aceChoice;
  if (!pendingChoice) return;

  state.blackjack.aceChoice = null;
  hideBlackjackAceChoice();
  pendingChoice.resolve(defaultValue);
}

async function resolvePendingAceChoicesForHand(handIndex) {
  const hand = state.blackjack.hands[handIndex];
  if (!hand) return;

  while (true) {
    const pendingAce = findPendingAceChoiceInHand(hand);
    if (!pendingAce) break;

    state.blackjack.busy = true;
    setStatus("#blackjackStatus", "Ass wählen");
    renderBlackjack();
    const chosenValue = await promptBlackjackAceChoice(handIndex, pendingAce);
    hand.aceValues = {
      ...(hand.aceValues || {}),
      [pendingAce.id || `index-${hand.cards.indexOf(pendingAce)}`]: chosenValue,
    };
    renderBlackjack();
  }
}

function createCardElement(card, hidden = false) {
  const element = document.createElement("div");

  if (hidden) {
    element.className = "card hidden-card";
    element.innerHTML = `
      <div class="card-back-frame">
        <span class="card-back-brand">GAMBLE</span>
        <span class="card-back-suit">♠</span>
        <span class="card-back-mark">ROYAL</span>
      </div>
    `;
    return element;
  }

  const suit = normalizeSuit(card.suit);
  const isRed = suit === "♥" || suit === "♦";
  const suitClass = isRed ? "red-suit" : "black-suit";
  const pipLayouts = {
    A: ["center"],
    "2": ["top-center", "bottom-center"],
    "3": ["top-center", "center", "bottom-center"],
    "4": ["top-left", "top-right", "bottom-left", "bottom-right"],
    "5": ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
    "6": ["top-left", "top-right", "mid-left", "mid-right", "bottom-left", "bottom-right"],
    "7": ["top-left", "top-right", "mid-left", "mid-right", "middle-top", "bottom-left", "bottom-right"],
    "8": ["top-left", "top-right", "upper-mid-left", "upper-mid-right", "lower-mid-left", "lower-mid-right", "bottom-left", "bottom-right"],
    "9": ["top-left", "top-right", "upper-mid-left", "upper-mid-right", "center", "lower-mid-left", "lower-mid-right", "bottom-left", "bottom-right"],
    "10": ["top-left", "top-right", "upper-top-left", "upper-top-right", "upper-mid-left", "upper-mid-right", "lower-mid-left", "lower-mid-right", "bottom-left", "bottom-right"],
  };
  const faceRanks = ["J", "Q", "K"];
  const centerContent = faceRanks.includes(card.rank)
    ? `
      <div class="face-card ${suitClass}">
        <div class="face-medallion">
          <span class="face-rank">${card.rank}</span>
          <span class="face-suit">${suit}</span>
        </div>
      </div>
    `
    : card.rank === "A"
      ? `<div class="card-pips"><span class="card-pip ace center ${suitClass}">${suit}</span></div>`
      : `<div class="card-pips">${(pipLayouts[card.rank] || []).map((slot) => `<span class="card-pip ${slot} ${suitClass}">${suit}</span>`).join("")}</div>`;

  element.className = `card ${isRed ? "red" : ""}`;
  element.innerHTML = `
    <div class="card-corner top">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit ${suitClass}">${suit}</span>
    </div>
    <div class="card-center">${centerContent}</div>
    <div class="card-corner bottom">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit ${suitClass}">${suit}</span>
    </div>
  `;
  return element;
}

function renderDealer() {
  const dealerCards = document.querySelector("#dealerCards");
  dealerCards.innerHTML = "";

  state.blackjack.dealer.forEach((card, index) => {
    const hidden = !state.blackjack.dealerRevealed && index === 1;
    dealerCards.appendChild(createCardElement(card, hidden));
  });

  const visibleCards = state.blackjack.dealerRevealed ? state.blackjack.dealer : [state.blackjack.dealer[0]].filter(Boolean);
  document.querySelector("#dealerScore").textContent = `Punkte: ${visibleCards.length ? calculateHand(visibleCards) : 0}`;
}

function renderBlackjackHandsView() {
  const container = document.querySelector("#playerCards");
  const scoreEl = document.querySelector("#playerScore");
  const infoEl = document.querySelector("#blackjackInfo");

  container.innerHTML = "";
  container.classList.toggle("split-layout", state.blackjack.hands.length > 1);

  if (state.blackjack.hands.length === 0) {
    scoreEl.textContent = "Punkte: 0";
    infoEl.textContent = "Blackjack zahlt 3:2. Split bis 4 Hände, Double mit den ersten zwei Karten, geteilte Asse bekommen eine Karte.";
    return;
  }

  if (state.blackjack.hands.length === 1) {
    const hand = state.blackjack.hands[0];
    hand.cards.forEach((card) => container.appendChild(createCardElement(card)));
    scoreEl.textContent = `Punkte: ${getHandScore(hand)}`;
  } else {
    state.blackjack.hands.forEach((hand, index) => {
      const handWrap = document.createElement("div");
      handWrap.className = `player-hand ${state.blackjack.active && index === state.blackjack.activeHandIndex ? "active-hand" : ""}`;

      const label = document.createElement("p");
      label.className = "mini-label";
      label.textContent = `Hand ${index + 1} - ${getHandScore(hand)} Punkte`;
      handWrap.appendChild(label);

      const cardsWrap = document.createElement("div");
      cardsWrap.className = "cards";
      hand.cards.forEach((card) => cardsWrap.appendChild(createCardElement(card)));
      handWrap.appendChild(cardsWrap);
      container.appendChild(handWrap);
    });

    scoreEl.textContent = `Aktive Hand: ${state.blackjack.activeHandIndex + 1} von ${state.blackjack.hands.length}`;
  }

  if (!state.blackjack.active) {
    infoEl.textContent = "Blackjack zahlt 3:2. Split bis 4 Hände, Double mit den ersten zwei Karten, geteilte Asse bekommen eine Karte.";
    return;
  }

  const activeHand = getActiveHand();
  const splitText = canSplitHand(activeHand) ? ", Split" : "";

  if (state.blackjack.aceChoice) {
    infoEl.textContent = `Hand ${state.blackjack.aceChoice.handIndex + 1}: Wähle im Menü, ob das Ass als 11 oder 1 zählt.`;
    return;
  }

  if (state.blackjack.phase === "dealing") {
    infoEl.textContent = "Die Startkarten werden gerade wie am Tisch ausgegeben.";
    return;
  }

  if (state.blackjack.phase === "dealer") {
    infoEl.textContent = "Dealer deckt auf und spielt seine Hand aus.";
    return;
  }

  if (isSplitAcesHand(activeHand)) {
    infoEl.textContent = `Hand ${state.blackjack.activeHandIndex + 1}: Geteilte Asse bekommen nur eine Karte und stehen danach.`;
    return;
  }

  infoEl.textContent = `Hand ${state.blackjack.activeHandIndex + 1}: Hit, Stand, Double${splitText}.`;
}

function renderPlayerHands() {
  const container = document.querySelector("#playerCards");
  const scoreEl = document.querySelector("#playerScore");
  const infoEl = document.querySelector("#blackjackInfo");

  container.innerHTML = "";
  container.classList.toggle("split-layout", state.blackjack.hands.length > 1);

  if (state.blackjack.hands.length === 0) {
    scoreEl.textContent = "Punkte: 0";
    infoEl.textContent = "Blackjack zahlt 3:2. Split bis 4 Hände, Double mit den ersten zwei Karten, geteilte Asse bekommen eine Karte.";
    return;
  }

  if (state.blackjack.hands.length === 1) {
    const hand = state.blackjack.hands[0];
    hand.cards.forEach((card) => container.appendChild(createCardElement(card)));
    scoreEl.textContent = `Punkte: ${getHandScore(hand)}`;
  } else {
    state.blackjack.hands.forEach((hand, index) => {
      const handWrap = document.createElement("div");
      handWrap.className = `player-hand ${state.blackjack.active && index === state.blackjack.activeHandIndex ? "active-hand" : ""}`;

      const label = document.createElement("p");
      label.className = "mini-label";
      label.textContent = `Hand ${index + 1} - ${getHandScore(hand)} Punkte`;
      handWrap.appendChild(label);

      const cardsWrap = document.createElement("div");
      cardsWrap.className = "cards";
      hand.cards.forEach((card) => cardsWrap.appendChild(createCardElement(card)));
      handWrap.appendChild(cardsWrap);
      container.appendChild(handWrap);
    });

    scoreEl.textContent = `Aktive Hand: ${state.blackjack.activeHandIndex + 1} von ${state.blackjack.hands.length}`;
  }

  if (!state.blackjack.active) {
    infoEl.textContent = "Blackjack zahlt 3:2. Split bis 4 Hände, Double mit den ersten zwei Karten, geteilte Asse bekommen eine Karte.";
    return;
  }

  const activeHand = getActiveHand();
  const splitText = canSplitHand(activeHand) ? ", Split" : "";
  if (state.blackjack.aceChoice) {
    infoEl.textContent = `Hand ${state.blackjack.aceChoice.handIndex + 1}: Wähle im Menü, ob das Ass als 11 oder 1 zählt.`;
    return;
  }
  if (isSplitAcesHand(activeHand)) {
    infoEl.textContent = `Hand ${state.blackjack.activeHandIndex + 1}: Geteilte Asse bekommen nur eine Karte und stehen danach.`;
    return;
  }
  infoEl.textContent = state.blackjack.busy
    ? "Dealer spielt gerade seinen Zug aus."
    : `Hand ${state.blackjack.activeHandIndex + 1}: Du kannst mehrfach Hit spielen, dann Stand, Double${splitText}.`;
}

function renderBlackjack() {
  renderDealer();
  renderBlackjackHandsView();
}

function resetBlackjackBoard() {
  cancelBlackjackAceChoice(1);
  state.blackjack.dealer = [];
  state.blackjack.hands = [];
  state.blackjack.active = false;
  state.blackjack.busy = false;
  state.blackjack.phase = "idle";
  state.blackjack.activeHandIndex = 0;
  state.blackjack.dealerRevealed = false;
  state.blackjack.splitUsed = false;
  state.blackjack.aceChoice = null;
  hideBlackjackAceChoice();
  setBetLocked(blackjackBetInput, false);
  renderBlackjack();
}

async function settleDealer() {
  state.blackjack.busy = true;
  state.blackjack.phase = "dealer";
  state.blackjack.dealerRevealed = true;
  setStatus("#blackjackStatus", "Dealer zieht");
  renderBlackjack();
  await wait(DEALER_DRAW_DELAY);

  while (shouldDealerDraw(state.blackjack.dealer)) {
    state.blackjack.dealer.push(drawCard());
    renderBlackjack();
    await wait(DEALER_DRAW_DELAY);
  }
}

async function dealOpeningBlackjackCards() {
  setStatus("#blackjackStatus", "Karten werden gegeben");
  renderBlackjack();
  await wait(280);

  state.blackjack.hands[0].cards.push(drawCard());
  renderBlackjack();
  await wait(BLACKJACK_DEAL_DELAY);

  state.blackjack.dealer.push(drawCard());
  renderBlackjack();
  await wait(BLACKJACK_DEAL_DELAY);

  state.blackjack.hands[0].cards.push(drawCard());
  renderBlackjack();
  await wait(BLACKJACK_DEAL_DELAY);

  state.blackjack.dealer.push(drawCard());
  renderBlackjack();
  await wait(BLACKJACK_DEAL_DELAY);
}

async function settleBlackjackRound() {
  await settleDealer();

  const dealerHasBlackjack = isBlackjack(state.blackjack.dealer);
  const dealerScore = calculateHand(state.blackjack.dealer);
  const results = [];
  let totalNet = 0;
  const currentUser = getCurrentUser();

  for (const [index, hand] of state.blackjack.hands.entries()) {
    const score = getHandScore(hand);
    const label = `Hand ${index + 1}`;

    if (score > 21) {
      results.push(`${label} bustet`);
      totalNet -= hand.bet;
      continue;
    }

    if (hand.naturalBlackjack && !hand.wasSplit && !dealerHasBlackjack) {
      const blackjackProfit = getBlackjackProfit(hand.bet);
      const blackjackPayout = getBlackjackPayout(hand.bet);
      await adjustBalance(blackjackPayout, currentUser);
      results.push(`${label} hat Blackjack (3:2: ${blackjackProfit} Gewinn, ${blackjackPayout} Auszahlung)`);
      totalNet += blackjackProfit;
      continue;
    }

    if (dealerHasBlackjack && !(hand.naturalBlackjack && !hand.wasSplit)) {
      results.push(`${label} verliert gegen Dealer-Blackjack`);
      totalNet -= hand.bet;
      continue;
    }

    if (dealerScore > 21 || score > dealerScore) {
      await adjustBalance(hand.bet * 2, currentUser);
      results.push(`${label} gewinnt`);
      totalNet += hand.bet;
      continue;
    }

    if (score === dealerScore) {
      await adjustBalance(hand.bet, currentUser);
      results.push(`${label} ist Push`);
      continue;
    }

    results.push(`${label} verliert`);
    totalNet -= hand.bet;
  }

  state.blackjack.active = false;
  state.blackjack.busy = false;
  state.blackjack.phase = "finished";
  renderBlackjack();
  const variant = totalNet > 0 ? "win" : totalNet < 0 ? "loss" : "push";
  const title = totalNet > 0 ? "Blackjack gewonnen" : totalNet < 0 ? "Blackjack verloren" : "Blackjack Push";
  setStatus("#blackjackStatus", totalNet > 0 ? "Gewonnen" : totalNet < 0 ? "Verloren" : "Push");
  showGameResult({
    game: "Blackjack",
    title,
    amount: totalNet,
    detail: `${results.join(" • ")}. ${buildBalanceLine()}`,
    variant,
    duration: RESULT_SCREEN_DURATION + 400,
  });
  logActivity(`Blackjack beendet: ${results.join(", ")}.`);
  await wait(RESULT_SCREEN_DURATION + 400);
  resetBlackjackBoard();
  setStatus("#blackjackStatus", "Bereit");
}

async function moveToNextHandOrDealer() {
  state.blackjack.busy = true;
  await wait(320);
  const nextIndex = state.blackjack.hands.findIndex((hand, index) => index > state.blackjack.activeHandIndex && !hand.finished);

  if (nextIndex !== -1) {
    state.blackjack.activeHandIndex = nextIndex;
    state.blackjack.phase = "player";
    renderBlackjack();
    await resolvePendingAceChoicesForHand(nextIndex);

    const nextHand = getActiveHand();
    if (isSplitAcesHand(nextHand)) {
      nextHand.finished = true;
      setStatus("#blackjackStatus", `Hand ${nextIndex + 1} steht nach Split-Ass`);
      renderBlackjack();
      await wait(320);
      return moveToNextHandOrDealer();
    }

    if (getHandScore(nextHand) >= 21) {
      nextHand.finished = true;
      setStatus("#blackjackStatus", `Hand ${nextIndex + 1}`);
      renderBlackjack();
      await wait(320);
      return moveToNextHandOrDealer();
    }

    state.blackjack.busy = false;
    setStatus("#blackjackStatus", `Hand ${nextIndex + 1}`);
    renderBlackjack();
    return;
  }

  await settleBlackjackRound();
}

async function startBlackjackRound(bet) {
  const currentUser = requireUser("#blackjackStatus");
  if (!currentUser) return;

  const deducted = await adjustBalance(-bet, currentUser);
  if (!deducted) {
    setStatus("#blackjackStatus", "Fehler");
    return;
  }
  state.blackjack.deck = createDeck();
  state.blackjack.dealer = [];
  state.blackjack.hands = [
    {
      cards: [],
      bet,
      finished: false,
      naturalBlackjack: false,
      doubled: false,
      aceValues: {},
      wasSplit: false,
      splitAces: false,
    },
  ];
  state.blackjack.active = true;
  state.blackjack.busy = true;
  state.blackjack.phase = "dealing";
  state.blackjack.activeHandIndex = 0;
  state.blackjack.dealerRevealed = false;
  state.blackjack.splitUsed = false;
  setBetLocked(blackjackBetInput, true);
  hideGameResult();

  await dealOpeningBlackjackCards();
  await resolvePendingAceChoicesForHand(0);
  state.blackjack.hands[0].naturalBlackjack = isBlackjack(state.blackjack.hands[0].cards, state.blackjack.hands[0].aceValues);
  state.blackjack.busy = false;
  state.blackjack.phase = "player";
  renderBlackjack();
  setStatus("#blackjackStatus", "Hand 1");
  logActivity(`Blackjack gestartet mit ${bet} Coins Einsatz.`);

  if (state.blackjack.hands[0].naturalBlackjack || isBlackjack(state.blackjack.dealer)) {
    state.blackjack.hands[0].finished = true;
    state.blackjack.busy = true;
    await settleBlackjackRound();
  }
}

document.querySelector("#dealBlackjack").addEventListener("click", async () => {
  const currentUser = requireUser("#blackjackStatus");
  const bet = getBetValue("#blackjackBet");
  if (!currentUser) return;
  if (!canAfford(bet) || state.blackjack.active || state.blackjack.busy) {
    setStatus("#blackjackStatus", "Ungültig");
    return;
  }

  await startBlackjackRound(bet);
});

document.querySelector("#hitBlackjack").addEventListener("click", async () => {
  if (!requireUser("#blackjackStatus")) return;
  if (!state.blackjack.active || state.blackjack.busy) return;

  const hand = getActiveHand();
  if (isSplitAcesHand(hand)) {
    setStatus("#blackjackStatus", "Geteilte Asse stehen nach einer Karte");
    return;
  }
  state.blackjack.busy = true;
  hand.cards.push(drawCard());
  renderBlackjack();
  await wait(320);
  await resolvePendingAceChoicesForHand(state.blackjack.activeHandIndex);

  if (getHandScore(hand) >= 21) {
    hand.finished = true;
    await moveToNextHandOrDealer();
    return;
  }

  state.blackjack.busy = false;
  setStatus("#blackjackStatus", `Hand ${state.blackjack.activeHandIndex + 1}`);
});

document.querySelector("#standBlackjack").addEventListener("click", async () => {
  if (!requireUser("#blackjackStatus")) return;
  if (!state.blackjack.active || state.blackjack.busy) return;

  getActiveHand().finished = true;
  await moveToNextHandOrDealer();
});

document.querySelector("#doubleBlackjack").addEventListener("click", async () => {
  const currentUser = requireUser("#blackjackStatus");
  if (!currentUser) return;
  if (!state.blackjack.active || state.blackjack.busy) return;

  const hand = getActiveHand();
  if (isSplitAcesHand(hand)) {
    setStatus("#blackjackStatus", "Double auf geteilten Assen nicht möglich");
    return;
  }
  if (hand.cards.length !== 2 || hand.doubled || !canAfford(hand.bet)) {
    setStatus("#blackjackStatus", "Double nicht möglich");
    return;
  }

  const deducted = await adjustBalance(-hand.bet, currentUser);
  if (!deducted) {
    setStatus("#blackjackStatus", "Fehler");
    return;
  }
  hand.bet *= 2;
  hand.doubled = true;
  state.blackjack.busy = true;
  hand.cards.push(drawCard());
  await resolvePendingAceChoicesForHand(state.blackjack.activeHandIndex);
  hand.finished = true;
  renderBlackjack();
  await wait(320);
  await moveToNextHandOrDealer();
});

document.querySelector("#splitBlackjack").addEventListener("click", async () => {
  const currentUser = requireUser("#blackjackStatus");
  if (!currentUser) return;
  if (!state.blackjack.active || state.blackjack.busy) return;

  const hand = getActiveHand();
  if (!canSplitHand(hand) || !canAfford(hand.bet)) {
    setStatus("#blackjackStatus", "Split nicht möglich");
    return;
  }

  const deducted = await adjustBalance(-hand.bet, currentUser);
  if (!deducted) {
    setStatus("#blackjackStatus", "Fehler");
    return;
  }
  const movedCard = hand.cards.pop();
  const movedAceValue = movedCard?.rank === "A" ? getAceOverride(hand.aceValues || {}, movedCard, hand.cards.length) : null;
  if (movedCard?.id && hand.aceValues && Object.prototype.hasOwnProperty.call(hand.aceValues, movedCard.id)) {
    delete hand.aceValues[movedCard.id];
  }
  const isAceSplit = hand.cards[0]?.rank === "A" && movedCard?.rank === "A";
  hand.cards.push(drawCard());
  hand.naturalBlackjack = false;
  hand.wasSplit = true;
  hand.splitAces = isAceSplit;

  const newHand = {
    cards: [movedCard, drawCard()],
    bet: hand.bet,
    finished: false,
    naturalBlackjack: false,
    doubled: false,
    aceValues: movedAceValue ? { [movedCard.id]: movedAceValue } : {},
    wasSplit: true,
    splitAces: isAceSplit,
  };

  state.blackjack.hands.splice(state.blackjack.activeHandIndex + 1, 0, newHand);
  state.blackjack.busy = true;
  renderBlackjack();
  await wait(320);
  await resolvePendingAceChoicesForHand(state.blackjack.activeHandIndex);
  if (isAceSplit) {
    await resolvePendingAceChoicesForHand(state.blackjack.activeHandIndex + 1);
    hand.finished = true;
    newHand.finished = true;
    setStatus("#blackjackStatus", "Geteilte Asse bekommen je eine Karte");
    renderBlackjack();
    await wait(320);
    await moveToNextHandOrDealer();
    return;
  }

  if (getHandScore(hand) >= 21) {
    hand.finished = true;
    setStatus("#blackjackStatus", `Hand ${state.blackjack.activeHandIndex + 1}`);
    renderBlackjack();
    await wait(320);
    await moveToNextHandOrDealer();
    return;
  }

  state.blackjack.busy = false;
  setStatus("#blackjackStatus", `Hand ${state.blackjack.activeHandIndex + 1} nach Split`);
});

document.querySelectorAll(".choice-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.currentChoice = button.dataset.choice;
  });
});

document.querySelector("#flipCoin").addEventListener("click", async () => {
  const currentUser = requireUser("#coinStatus");
  const bet = getBetValue("#coinBet");
  if (!currentUser) return;
  if (!canAfford(bet) || state.coinBusy) {
    setStatus("#coinStatus", "Ungültig");
    return;
  }

  state.coinBusy = true;
  setBetLocked(coinBetInput, true);
  hideGameResult();
  const deducted = await adjustBalance(-bet, currentUser);
  if (!deducted) {
    state.coinBusy = false;
    setBetLocked(coinBetInput, false);
    setStatus("#coinStatus", "Fehler");
    return;
  }
  setStatus("#coinStatus", "Flip...");
  coinVisual.classList.remove("flipping", "show-tails");
  void coinVisual.offsetWidth;
  coinVisual.classList.add("flipping");
  document.querySelector("#coinResult").textContent = "Die Münze ist in der Luft...";

  const coinWinChance = 0.5 + getLuckProgress(currentUser) * 0.495;
  const outcome = Math.random() < coinWinChance
    ? state.currentChoice
    : (state.currentChoice === "Kopf" ? "Zahl" : "Kopf");
  const outcomeShort = outcome === "Kopf" ? "K" : "Z";
  await wait(COIN_FLIP_DURATION / 2);
  coinVisual.classList.toggle("show-tails", outcome === "Zahl");
  await wait(COIN_FLIP_DURATION / 2);
  coinVisual.classList.remove("flipping");

  if (outcome === state.currentChoice) {
    await adjustBalance(bet * 2, currentUser);
    setStatus("#coinStatus", "Gewonnen");
    document.querySelector("#coinResult").textContent = `${outcomeShort}! Du gewinnst ${bet} Coins Profit.`;
    showGameResult({
      game: "Coin Flip",
      title: "Coin Flip gewonnen",
      amount: bet,
      detail: `${outcomeShort} ist gefallen. Auszahlung: ${bet * 2} Coins. ${buildBalanceLine()}`,
      variant: "win",
    });
    logActivity(`Coin Flip gewonnen auf ${outcomeShort}.`);
    state.coinBusy = false;
    setBetLocked(coinBetInput, false);
    return;
  }

  setStatus("#coinStatus", "Verloren");
  document.querySelector("#coinResult").textContent = `${outcomeShort}! Diesmal verloren.`;
  showGameResult({
    game: "Coin Flip",
    title: "Coin Flip verloren",
    amount: -bet,
    detail: `${outcomeShort} ist gefallen. Dein Einsatz ist verloren. ${buildBalanceLine()}`,
    variant: "loss",
  });
  logActivity(`Coin Flip verloren. Ergebnis war ${outcomeShort}.`);
  state.coinBusy = false;
  setBetLocked(coinBetInput, false);
});

document.querySelector("#startRace").addEventListener("click", async () => {
  const currentUser = requireUser("#raceStatus");
  const bet = getBetValue("#raceBet");
  const selectedHorse = document.querySelector("#raceHorse").value;
  if (!currentUser) return;

  if (!canAfford(bet) || state.raceBusy) {
    setStatus("#raceStatus", "Ungültig");
    return;
  }

  state.raceBusy = true;
  setBetLocked(raceBetInput, true);
  hideGameResult();
  const deducted = await adjustBalance(-bet, currentUser);
  if (!deducted) {
    state.raceBusy = false;
    setBetLocked(raceBetInput, false);
    setStatus("#raceStatus", "Fehler");
    return;
  }
  setStatus("#raceStatus", "Rennen läuft");
  logActivity(`Pferderennen gestartet. Tipp auf ${selectedHorse}.`);

  const positions = {
    Blaze: 0,
    Storm: 0,
    Nova: 0,
    Comet: 0,
  };
  const finishPositions = {};

  const runners = [...document.querySelectorAll(".runner")];
  runners.forEach((runner) => {
    const lane = runner.closest(".lane");
    const laneWidth = lane?.clientWidth || 520;
    const runnerWidth = runner.offsetWidth || 56;
    const lineLeft = laneWidth - 22 - 18;
    const stopAt = Math.max(0, lineLeft - 90 - runnerWidth + 12);
    finishPositions[runner.dataset.horse] = stopAt;
    lane?.classList.remove("winner-lane");
    lane?.querySelector(".lane-winner-badge")?.remove();
    runner.classList.remove("winner-runner");
    runner.style.transform = "translateX(0px)";
  });

  let winner = null;

  while (!winner) {
    await wait(RACE_STEP_DELAY);

    horseNames.forEach((horse) => {
      const finishAt = finishPositions[horse] ?? 390;
      const baseStep = Math.floor(Math.random() * 22) + 12;
      const luckStep = horse === selectedHorse
        ? Math.round(getLuckProgress(currentUser) * 18) + randomInt(0, Math.round(getLuckProgress(currentUser) * 10))
        : 0;
      positions[horse] = Math.min(finishAt, positions[horse] + baseStep + luckStep);
      const runner = document.querySelector(`[data-horse="${horse}"]`);
      runner.style.transform = `translateX(${positions[horse]}px)`;

      if (positions[horse] >= finishAt && !winner) {
        winner = horse;
      }
    });
  }

  await wait(440);

  const winnerRunner = document.querySelector(`[data-horse="${winner}"]`);
  const winnerLane = winnerRunner?.closest(".lane");
  winnerRunner?.classList.add("winner-runner");
  winnerLane?.classList.add("winner-lane");

  if (winnerLane) {
    const badge = document.createElement("div");
    badge.className = "lane-winner-badge";
    badge.textContent = "Gewinner";
    winnerLane.appendChild(badge);
  }

  if (winner === selectedHorse) {
    await adjustBalance(bet * 3, currentUser);
    setStatus("#raceStatus", `${winner} gewinnt`);
    showGameResult({
      game: "Pferderennen",
      title: "Rennen gewonnen",
      amount: bet * 2,
      detail: `${winner} hat dein Rennen gewonnen. Auszahlung: ${bet * 3} Coins. ${buildBalanceLine()}`,
      variant: "win",
    });
    logActivity(`Pferderennen gewonnen mit ${winner}.`);
    state.raceBusy = false;
    setBetLocked(raceBetInput, false);
    return;
  }

  setStatus("#raceStatus", `${winner} gewinnt`);
  showGameResult({
    game: "Pferderennen",
    title: "Rennen verloren",
    amount: -bet,
    detail: `${winner} hat gewonnen, dein Tipp war ${selectedHorse}. ${buildBalanceLine()}`,
    variant: "loss",
  });
  logActivity(`Pferderennen verloren. Sieger: ${winner}.`);
  state.raceBusy = false;
  setBetLocked(raceBetInput, false);
});

document.querySelector("#spinSlots").addEventListener("click", async () => {
  const currentUser = requireUser("#slotsStatus");
  const bet = getBetValue("#slotsBet");
  if (!currentUser) return;
  if (!canAfford(bet) || state.slotsBusy) {
    setStatus("#slotsStatus", "Ungültig");
    return;
  }

  state.slotsBusy = true;
  setBetLocked(slotsBetInput, true);
  hideGameResult();
  const deducted = await adjustBalance(-bet, currentUser);
  if (!deducted) {
    state.slotsBusy = false;
    setBetLocked(slotsBetInput, false);
    setStatus("#slotsStatus", "Fehler");
    return;
  }
  setStatus("#slotsStatus", "Spinning");
  await unlockGameAudio();
  const finalSymbols = generateSlotOutcome(currentUser);
  const sequences = finalSymbols.map((symbol, index) => buildReelSequence(symbol, 20 + index * 6));
  const reelDurations = sequences.map((_, index) => 2200 + index * 850);
  playSlotSpinSound(reelDurations.map((duration) => duration / 1000));

  slotReels.forEach((reel, index) => {
    renderReel(reel, sequences[index]);
    reel.classList.remove("settling");
    reel.classList.add("rolling");
    reel.style.transition = "none";
    reel.style.transform = "translateY(0)";
  });
  slotsResult.textContent = "Die Walzen laufen...";

  await wait(30);

  slotReels.forEach((reel, index) => {
    const offset = (sequences[index].length - 1) * 120;
    reel.style.transition = `transform ${reelDurations[index]}ms cubic-bezier(0.06, 0.8, 0.14, 1)`;
    reel.style.transform = `translateY(-${offset + 26}px)`;
  });

  let previousDuration = 0;
  for (let i = 0; i < slotReels.length; i += 1) {
    const reel = slotReels[i];
    const offset = (sequences[i].length - 1) * 120;
    const waitForThisStop = reelDurations[i] - previousDuration;
    await wait(waitForThisStop);
    previousDuration = reelDurations[i];
    reel.classList.remove("rolling");
    reel.classList.add("settling");
    reel.style.transition = "transform 220ms ease-out, filter 220ms ease-out";
    reel.style.transform = `translateY(-${offset}px)`;
    playSlotStopSound(i);
    await wait(250);
  }

  slotReels.forEach((reel, index) => {
    reel.classList.remove("rolling", "settling");
    reel.style.transition = "none";
    renderReel(reel, [finalSymbols[index]]);
    reel.style.transform = "translateY(0)";
  });

  const slotPayout = getSlotPayoutDetails(finalSymbols, bet);
  const payout = slotPayout.payout;
  const profit = slotPayout.profit;

  if (payout > 0) {
    await adjustBalance(payout, currentUser);
    setStatus("#slotsStatus", "Treffer");
    slotsResult.textContent = `Treffer! ${slotPayout.label} zahlt ${profit} Coins Gewinn + ${bet} Einsatz = ${payout} Coins.`;
    showGameResult({
      game: "Slots",
      title: "Slots gewonnen",
      amount: profit,
      detail: `${slotPayout.label} zahlt x${slotPayout.multiplier} Gewinn plus deinen Einsatz zurück. Gesamtauszahlung: ${payout} Coins. ${buildBalanceLine()}`,
      variant: "win",
    });
    logActivity(`Slots: ${slotPayout.label} zahlt ${profit} Coins Gewinn und ${payout} Coins gesamt aus.`);
    state.slotsBusy = false;
    setBetLocked(slotsBetInput, false);
    return;
  }

  setStatus("#slotsStatus", "Niete");
  slotsResult.textContent = "Keine Kombination. Noch ein Spin?";
  showGameResult({
    game: "Slots",
    title: "Slots verloren",
    amount: -bet,
    detail: `Keine Gewinnlinie dieses Mal. ${buildBalanceLine()}`,
    variant: "loss",
  });
  logActivity("Slots leider ohne Gewinn.");
  state.slotsBusy = false;
  setBetLocked(slotsBetInput, false);
});

document.querySelector("#spinRoulette").addEventListener("click", async () => {
  const currentUser = requireUser("#rouletteStatus");
  const bet = getBetValue("#rouletteBet");
  const selection = state.roulette.selection;

  if (!currentUser) return;
  if (!selection) {
    setStatus("#rouletteStatus", "Feld wählen");
    rouletteResult.textContent = "Wähle zuerst ein Feld auf dem Tableau.";
    return;
  }
  if (!canAfford(bet) || state.roulette.busy) {
    setStatus("#rouletteStatus", "Ungültig");
    return;
  }

  state.roulette.busy = true;
  setBetLocked(rouletteBetInput, true);
  hideGameResult();

  const deducted = await adjustBalance(-bet, currentUser);
  if (!deducted) {
    state.roulette.busy = false;
    setBetLocked(rouletteBetInput, false);
    setStatus("#rouletteStatus", "Fehler");
    return;
  }

  const winningNumber = generateRouletteWinningNumber(selection, currentUser);
  const pocketAngle = getRoulettePocketAngle(winningNumber);
  const wheelDuration = 5600;
  const ballDuration = 6200;
  const currentWheelAngle = normalizeAngle(state.roulette.wheelRotation);
  const currentBallAngle = normalizeAngle(state.roulette.ballRotation);
  const targetWheelAngle = normalizeAngle(360 - pocketAngle);
  let wheelDelta = targetWheelAngle - currentWheelAngle;
  if (wheelDelta < 0) {
    wheelDelta += 360;
  }
  const animatedWheelRotation = state.roulette.wheelRotation + randomInt(5, 7) * 360 + wheelDelta;
  const animatedBallRotation = state.roulette.ballRotation - currentBallAngle - randomInt(8, 10) * 360;

  setStatus("#rouletteStatus", "Spinning");
  rouletteResult.textContent = "Kessel und Kugel drehen...";

  if (rouletteWheel && rouletteBallTrack) {
    rouletteWheel.style.transition = `transform ${wheelDuration}ms cubic-bezier(0.08, 0.88, 0.18, 1)`;
    rouletteBallTrack.style.transition = `transform ${ballDuration}ms cubic-bezier(0.08, 0.9, 0.16, 1)`;
    window.requestAnimationFrame(() => {
      setRouletteVisualState(animatedWheelRotation, animatedBallRotation);
    });
  }

  await wait(ballDuration + 140);

  state.roulette.wheelRotation = targetWheelAngle;
  state.roulette.ballRotation = 0;
  state.roulette.lastNumber = winningNumber;
  setRouletteVisualState(targetWheelAngle, 0, true);

  const color = getRouletteColor(winningNumber);
  const colorLabel = color === "red" ? "Rot" : color === "black" ? "Schwarz" : "Grün";
  const outcome = evaluateRouletteBet(selection, winningNumber, bet);

  rouletteResult.innerHTML = `Die Kugel landet auf <strong>${winningNumber}</strong> (${colorLabel}).`;
  rouletteLastNumber.innerHTML = buildRouletteLastNumberMarkup(winningNumber);

  if (outcome.won) {
    await adjustBalance(outcome.payout, currentUser);
    setStatus("#rouletteStatus", "Gewonnen");
    showGameResult({
      game: "Roulette",
      title: "Roulette gewonnen",
      amount: outcome.profit,
      detail: `${selection.label} trifft ${winningNumber}. Gewinn: ${outcome.profit} Coins. Gesamtauszahlung: ${outcome.payout} Coins. ${buildBalanceLine()}`,
      variant: "win",
    });
    logActivity(`Roulette gewonnen auf ${selection.label}. Zahl war ${winningNumber}.`);
    state.roulette.busy = false;
    setBetLocked(rouletteBetInput, false);
    return;
  }

  setStatus("#rouletteStatus", "Verloren");
  showGameResult({
    game: "Roulette",
    title: "Roulette verloren",
    amount: -bet,
    detail: `${selection.label} verliert gegen ${winningNumber} (${colorLabel}). Dein Einsatz ist verloren. ${buildBalanceLine()}`,
    variant: "loss",
  });
  logActivity(`Roulette verloren. Feld: ${selection.label}. Zahl war ${winningNumber}.`);
  state.roulette.busy = false;
  setBetLocked(rouletteBetInput, false);
});

document.querySelector("#loginUser").addEventListener("click", () => {
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value.trim();
  const user = state.appData.users.find((entry) =>
    entry.email.toLowerCase() === email.toLowerCase()
    && entry.password === password
  );

  if (!user) {
    showAuthMessage("Login fehlgeschlagen. E-Mail oder Passwort stimmt nicht.");
    return;
  }

  state.appData.currentUserId = user.id;
  syncCurrentUser();
  logActivity(`${user.username} hat sich eingeloggt.`);
});

document.querySelector("#registerUser")?.addEventListener("click", () => {
  const username = document.querySelector("#registerUsername").value.trim();
  const email = document.querySelector("#registerEmail").value.trim();
  const password = document.querySelector("#registerPassword").value.trim();

  if (!username || !email || !password) {
    showAuthMessage("Bitte Benutzername, E-Mail und Passwort ausfüllen.");
    return;
  }

  const userExists = state.appData.users.some((user) => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    showAuthMessage("Benutzername oder E-Mail ist bereits vergeben.");
    return;
  }

  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    playerId: generatePlayerId(),
    username,
    email,
    password,
    coins: 1000,
    luckBoost: 1,
    friends: [],
    daily: {
      lastClaimDate: null,
      workDate: todayKey(),
      workCompleted: 0,
    },
    createdAt: new Date().toISOString(),
  };

  state.appData.users.push(newUser);
  state.appData.currentUserId = newUser.id;
  syncCurrentUser();
  setAuthView("login");
  showAuthMessage(`Account erstellt. Deine Spieler-ID ist ${newUser.playerId}.`);
  logActivity(`${newUser.username} wurde neu registriert.`);
});

logoutUserButton?.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    logActivity(`${currentUser.username} hat sich ausgeloggt.`);
  }
  state.appData.currentUserId = null;
  setAdminMode(false);
  syncCurrentUser();
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthView(tab.dataset.authView);
    renderAuthState();
  });
});

document.querySelector("#addFriendButton").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showAuthMessage("Bitte zuerst einloggen, um Freunde hinzuzufügen.");
    return;
  }

  const friendId = friendPlayerIdInput.value.trim().toUpperCase();
  const friend = findUserByPlayerId(friendId);

  if (!friend) {
    showAuthMessage("Spieler-ID nicht gefunden.");
    return;
  }

  if (friend.playerId === currentUser.playerId) {
    showAuthMessage("Du kannst dich nicht selbst adden.");
    return;
  }

  if (areUsersFriends(currentUser, friend)) {
    showAuthMessage("Dieser Spieler ist bereits in deiner Freundesliste.");
    return;
  }

  const outgoingRequest = getOutgoingFriendRequestsForUser(currentUser.id).find((request) => request.user?.id === friend.id);
  if (outgoingRequest) {
    showAuthMessage("An diesen Spieler wurde bereits eine Anfrage gesendet.");
    return;
  }

  const incomingRequest = getIncomingFriendRequestsForUser(currentUser.id).find((request) => request.user?.id === friend.id);
  if (incomingRequest) {
    showAuthMessage("Dieser Spieler hat dir schon eine Anfrage geschickt. Nimm sie unten an.");
    return;
  }

  state.appData.friendRequests.push(createLocalFriendRequest(currentUser.id, friend.id));
  friendPlayerIdInput.value = "";
  syncCurrentUser();
  showAuthMessage(`Freundesanfrage an ${friend.username} gesendet.`);
  logActivity(`${currentUser.username} hat ${friend.username} eine Freundesanfrage geschickt.`);
});

changeUsernameButton.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showAuthMessage("Bitte zuerst einloggen, um deinen Benutzernamen zu ändern.");
    return;
  }

  const nextUsername = changeUsernameInput.value.trim();
  if (!nextUsername) {
    showAuthMessage("Bitte gib einen Benutzernamen ein.");
    return;
  }

  const duplicate = state.appData.users.find((user) =>
    user.id !== currentUser.id && user.username.toLowerCase() === nextUsername.toLowerCase()
  );

  if (duplicate) {
    showAuthMessage("Dieser Benutzername ist bereits vergeben.");
    return;
  }

  currentUser.username = nextUsername;
  syncCurrentUser();
  showAuthMessage(`Dein Benutzername wurde auf ${nextUsername} geändert.`);
  logActivity(`${nextUsername} hat den Benutzernamen geändert.`);
});

document.querySelector("#unlockAdmin").addEventListener("click", () => {
  if (adminCodeInput.value !== ADMIN_CODE) {
    adminStatus.textContent = "Falscher Code";
    return;
  }

  adminCodeInput.value = "";
  setAdminMode(true);
  logActivity("Admin Panel wurde entsperrt.");
});

document.querySelector("#adminGiveSelf").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  const amount = Number(adminSelfCoinsInput.value);
  if (!state.adminUnlocked || !currentUser || !Number.isFinite(amount) || amount < 0) return;

  adjustBalance(amount, currentUser);
  logActivity(`Admin hat ${currentUser.username} ${amount} Coins gegeben.`);
});

document.querySelector("#adminTakeSelf").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  const amount = Number(adminSelfCoinsInput.value);
  if (!state.adminUnlocked || !currentUser || !Number.isFinite(amount) || amount < 0) return;

  adjustBalance(-amount, currentUser);
  logActivity(`Admin hat ${currentUser.username} ${amount} Coins abgezogen.`);
});

document.querySelector("#adminSetLuckBoost").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!state.adminUnlocked || !currentUser) return;

  const multiplier = clampLuckBoost(adminLuckBoostInput.value);
  currentUser.luckBoost = multiplier;
  adminStatus.textContent = `Luck Boost x${multiplier}`;
  syncCurrentUser();
  logActivity(`Admin hat ${currentUser.username} den Luck Boost auf x${multiplier} gesetzt.`);
});

document.querySelector("#adminGiveOther").addEventListener("click", () => {
  const playerId = adminTargetPlayerIdInput.value.trim();
  const amount = Number(adminTargetCoinsInput.value);
  if (!state.adminUnlocked || !Number.isFinite(amount) || amount < 0) return;

  const targetUser = findUserByPlayerId(playerId);
  if (!targetUser) {
    adminStatus.textContent = "ID nicht gefunden";
    return;
  }

  targetUser.coins += amount;
  syncCurrentUser();
  logActivity(`Admin hat ${targetUser.username} ${amount} Coins gegeben.`);
});

document.querySelector("#adminTakeOther").addEventListener("click", () => {
  const playerId = adminTargetPlayerIdInput.value.trim();
  const amount = Number(adminTargetCoinsInput.value);
  if (!state.adminUnlocked || !Number.isFinite(amount) || amount < 0) return;

  const targetUser = findUserByPlayerId(playerId);
  if (!targetUser) {
    adminStatus.textContent = "ID nicht gefunden";
    return;
  }

  targetUser.coins = Math.max(0, targetUser.coins - amount);
  syncCurrentUser();
  logActivity(`Admin hat ${targetUser.username} ${amount} Coins abgezogen.`);
});

document.querySelector("#adminSetOtherLuckBoost").addEventListener("click", () => {
  const playerId = adminTargetPlayerIdInput.value.trim();
  if (!state.adminUnlocked) return;

  const targetUser = findUserByPlayerId(playerId);
  if (!targetUser) {
    adminStatus.textContent = "ID nicht gefunden";
    return;
  }

  const multiplier = clampLuckBoost(adminTargetLuckBoostInput.value);
  targetUser.luckBoost = multiplier;
  adminStatus.textContent = `${targetUser.username} hat jetzt Luck Boost x${multiplier}`;
  syncCurrentUser();
  logActivity(`Admin hat ${targetUser.username} den Luck Boost auf x${multiplier} gesetzt.`);
});

document.querySelector("#claimDailyReward").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    dailyStatusText.textContent = "Bitte zuerst einloggen.";
    return;
  }

  ensureUserProgress(currentUser);
  if (currentUser.daily.lastClaimDate === todayKey()) {
    dailyStatusText.textContent = "Du hast die tägliche Belohnung heute schon abgeholt.";
    return;
  }

  currentUser.daily.lastClaimDate = todayKey();
  adjustBalance(1000, currentUser);
  dailyStatusText.textContent = "1.000 Coins wurden gutgeschrieben.";
  logActivity(`${currentUser.username} hat die tägliche Belohnung abgeholt.`);
});

document.querySelector("#generateWorkTask").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    workStatusText.textContent = "Bitte zuerst einloggen.";
    return;
  }

  ensureUserProgress(currentUser);
  if (currentUser.daily.workCompleted >= WORK_LIMIT_PER_DAY) {
    workStatusText.textContent = "Dein tägliches Work-Limit ist erreicht.";
    return;
  }

  currentUser.activeWorkTask = createWorkTask();
  workQuestion.textContent = currentUser.activeWorkTask.question;
  workAnswer.value = "";
  workStatusText.textContent = `Diese Aufgabe bringt ${currentUser.activeWorkTask.reward} Coins bei richtiger Antwort.`;
  saveAppData();
});

document.querySelector("#submitWorkTask").addEventListener("click", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    workStatusText.textContent = "Bitte zuerst einloggen.";
    return;
  }

  ensureUserProgress(currentUser);
  if (currentUser.daily.workCompleted >= WORK_LIMIT_PER_DAY) {
    workStatusText.textContent = "Dein tägliches Work-Limit ist erreicht.";
    return;
  }

  if (!currentUser.activeWorkTask) {
    workStatusText.textContent = "Erzeuge zuerst eine Aufgabe.";
    return;
  }

  const submitted = Number(String(workAnswer.value).replace(",", "."));
  if (!Number.isFinite(submitted)) {
    workStatusText.textContent = "Bitte gib eine gültige Zahl ein.";
    return;
  }

  const correct = Math.abs(submitted - currentUser.activeWorkTask.answer) < 0.0001;
  currentUser.daily.workCompleted += 1;

  if (correct) {
    adjustBalance(currentUser.activeWorkTask.reward, currentUser);
    workStatusText.textContent = `Richtig! Du bekommst ${currentUser.activeWorkTask.reward} Coins.`;
    logActivity(`${currentUser.username} hat eine Work-Aufgabe gelöst.`);
  } else {
    workStatusText.textContent = `Leider falsch. Richtige Antwort: ${currentUser.activeWorkTask.answer}`;
  }

  currentUser.activeWorkTask = null;
  workQuestion.textContent = "Neue Aufgabe erzeugen oder morgen wiederkommen.";
  workAnswer.value = "";
  syncCurrentUser();
});

gameMenuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showGamePanel(button.dataset.gameTarget);
  });
});

menuSwitchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showMenuPanel(button.dataset.menuView);
  });
});

renderRouletteWheel();
renderRouletteBoard();
setRouletteVisualState(0, 0, true);
if (rouletteLastNumber) {
  rouletteLastNumber.textContent = "Letzte Zahl: -";
}
window.addEventListener("resize", () => {
  renderRouletteWheel();
});
slotReels.forEach((reel) => renderReel(reel, ["seven"]));
renderAllCardsPreview();
showMenuPanel("account");
setAuthView("login");
setAdminMode(false);
state.appData.currentUserId = null;
state.currentProfile = null;
syncCurrentUser();
resetBlackjackBoard();
