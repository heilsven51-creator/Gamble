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
  },
  coinBusy: false,
  raceBusy: false,
  slotsBusy: false,
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
const changeUsernameInput = document.querySelector("#changeUsernameInput");
const changeUsernameButton = document.querySelector("#changeUsernameButton");
const friendsList = document.querySelector("#friendsList");
const leaderboardList = document.querySelector("#leaderboardList");
const localPlayersList = document.querySelector("#localPlayersList");
const friendPlayerIdInput = document.querySelector("#friendPlayerId");
const adminStatus = document.querySelector("#adminStatus");
const adminCodeInput = document.querySelector("#adminCode");
const adminControls = document.querySelector("#adminControls");
const adminSelfCoinsInput = document.querySelector("#adminSelfCoins");
const adminTargetPlayerIdInput = document.querySelector("#adminTargetPlayerId");
const adminTargetCoinsInput = document.querySelector("#adminTargetCoins");
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
const resultOverlay = document.querySelector("#gameResultOverlay");
const resultGameLabel = document.querySelector("#resultGameLabel");
const resultTitle = document.querySelector("#resultTitle");
const resultAmount = document.querySelector("#resultAmount");
const resultDetail = document.querySelector("#resultDetail");
const closeGameResultButton = document.querySelector("#closeGameResult");

const symbols = ["seven", "cherry", "lemon", "grapes", "bell", "diamond"];
const slotSymbolMap = {
  seven: { display: "7", className: "slot-seven" },
  cherry: { display: "🍒", className: "slot-cherry" },
  lemon: { display: "🍋", className: "slot-lemon" },
  grapes: { display: "🍇", className: "slot-grapes" },
  bell: { display: "🔔", className: "slot-bell" },
  diamond: { display: "💎", className: "slot-diamond" },
};
const horseNames = ["Blaze", "Storm", "Nova", "Comet"];
const WORK_LIMIT_PER_DAY = 10;
const RESULT_SCREEN_DURATION = 3200;
const COIN_FLIP_DURATION = 1400;
const BLACKJACK_DEAL_DELAY = 420;
const DEALER_DRAW_DELAY = 750;
const RACE_STEP_DELAY = 320;
const SLOT_REEL_START_DELAY = 1080;
const SLOT_REEL_STEP_DELAY = 520;
const SLOT_REEL_STOP_DURATION = 980;
const DEALER_HITS_SOFT_17 = false;

let resultOverlayTimer = null;

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

function loadAppData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { users: [], currentUserId: null };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      currentUserId: parsed.currentUserId ?? null,
    };
  } catch {
    return { users: [], currentUserId: null };
  }
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

function updateBalance() {
  const currentUser = getCurrentUser();
  state.balance = currentUser ? currentUser.coins : 0;
  balanceEl.textContent = String(state.balance);
  currentUserLabel.textContent = currentUser ? currentUser.username : "Nicht eingeloggt";
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

  resultOverlay.classList.remove("visible");
  window.setTimeout(() => {
    resultOverlay.classList.add("hidden");
  }, 220);
}

function showGameResult({ game, title, amount = 0, detail = "", variant = "push", duration = RESULT_SCREEN_DURATION }) {
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
  logoutUserButton.classList.toggle("hidden", !currentUser);
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
  changeUsernameInput.value = currentUser ? currentUser.username : "";
  friendsList.innerHTML = "";

  if (!currentUser || currentUser.friends.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Keine Freunde hinzugefügt.";
    friendsList.appendChild(item);
    return;
  }

  currentUser.friends.forEach((friendId) => {
    const friend = findUserByPlayerId(friendId);
    const item = document.createElement("li");
    item.textContent = friend ? `${friend.username} (${friend.playerId})` : friendId;
    friendsList.appendChild(item);
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
  return bet >= 10 && bet <= state.balance;
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

function generateSlotOutcome() {
  const result = [getRandomSlotSymbol(), getRandomSlotSymbol(), getRandomSlotSymbol()];
  const uniqueCount = new Set(result).size;

  // Hebt die Gewinnchance nur leicht an, indem manche Nieten zu einem Paar werden.
  if (uniqueCount === 3 && Math.random() < 0.12) {
    const sourceIndex = Math.random() < 0.5 ? 0 : 1;
    result[2] = result[sourceIndex];
  }

  return result;
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
  return state.blackjack.deck.pop();
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

function calculateHandDetails(cards) {
  let total = cards.reduce((sum, card) => sum + getCardValue(card.rank), 0);
  let aces = cards.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return {
    total,
    isSoft: aces > 0 && total <= 21,
  };
}

function calculateHand(cards) {
  return calculateHandDetails(cards).total;
}

function shouldDealerDraw(cards) {
  const details = calculateHandDetails(cards);
  return details.total < 17 || (DEALER_HITS_SOFT_17 && details.total === 17 && details.isSoft);
}

function isBlackjack(cards) {
  return cards.length === 2 && calculateHand(cards) === 21;
}

function canSplitHand(hand) {
  return hand.cards.length === 2 && getCardValue(hand.cards[0].rank) === getCardValue(hand.cards[1].rank);
}

function getActiveHand() {
  return state.blackjack.hands[state.blackjack.activeHandIndex];
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
    infoEl.textContent = "Blackjack zahlt 3:2. Dealer steht auf Soft 17. Double nur mit den ersten zwei Karten.";
    return;
  }

  if (state.blackjack.hands.length === 1) {
    const hand = state.blackjack.hands[0];
    hand.cards.forEach((card) => container.appendChild(createCardElement(card)));
    scoreEl.textContent = `Punkte: ${calculateHand(hand.cards)}`;
  } else {
    state.blackjack.hands.forEach((hand, index) => {
      const handWrap = document.createElement("div");
      handWrap.className = `player-hand ${state.blackjack.active && index === state.blackjack.activeHandIndex ? "active-hand" : ""}`;

      const label = document.createElement("p");
      label.className = "mini-label";
      label.textContent = `Hand ${index + 1} - ${calculateHand(hand.cards)} Punkte`;
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
    infoEl.textContent = "Blackjack zahlt 3:2. Dealer steht auf Soft 17. Double nur mit den ersten zwei Karten.";
    return;
  }

  const activeHand = getActiveHand();
  const splitText = canSplitHand(activeHand) && !state.blackjack.splitUsed ? ", Split" : "";

  if (state.blackjack.phase === "dealing") {
    infoEl.textContent = "Die Startkarten werden gerade wie am Tisch ausgegeben.";
    return;
  }

  if (state.blackjack.phase === "dealer") {
    infoEl.textContent = "Dealer deckt auf und spielt seine Hand aus.";
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
    infoEl.textContent = "Natürliches Blackjack zahlt 3:2. Split und Double Down aktiv.";
    return;
  }

  if (state.blackjack.hands.length === 1) {
    const hand = state.blackjack.hands[0];
    hand.cards.forEach((card) => container.appendChild(createCardElement(card)));
    scoreEl.textContent = `Punkte: ${calculateHand(hand.cards)}`;
  } else {
    state.blackjack.hands.forEach((hand, index) => {
      const handWrap = document.createElement("div");
      handWrap.className = `player-hand ${state.blackjack.active && index === state.blackjack.activeHandIndex ? "active-hand" : ""}`;

      const label = document.createElement("p");
      label.className = "mini-label";
      label.textContent = `Hand ${index + 1} - ${calculateHand(hand.cards)} Punkte`;
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
    infoEl.textContent = "Natürliches Blackjack zahlt 3:2. Split und Double Down aktiv.";
    return;
  }

  const activeHand = getActiveHand();
  const splitText = canSplitHand(activeHand) && !state.blackjack.splitUsed ? ", Split" : "";
  infoEl.textContent = state.blackjack.busy
    ? "Dealer spielt gerade seinen Zug aus."
    : `Hand ${state.blackjack.activeHandIndex + 1}: Du kannst mehrfach Hit spielen, dann Stand, Double${splitText}.`;
}

function renderBlackjack() {
  renderDealer();
  renderBlackjackHandsView();
}

function resetBlackjackBoard() {
  state.blackjack.dealer = [];
  state.blackjack.hands = [];
  state.blackjack.active = false;
  state.blackjack.busy = false;
  state.blackjack.phase = "idle";
  state.blackjack.activeHandIndex = 0;
  state.blackjack.dealerRevealed = false;
  state.blackjack.splitUsed = false;
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
    const score = calculateHand(hand.cards);
    const label = `Hand ${index + 1}`;

    if (score > 21) {
      results.push(`${label} bustet`);
      totalNet -= hand.bet;
      continue;
    }

    if (hand.naturalBlackjack && !dealerHasBlackjack) {
      await adjustBalance(hand.bet * 2.5, currentUser);
      results.push(`${label} hat Blackjack`);
      totalNet += hand.bet * 1.5;
      continue;
    }

    if (dealerHasBlackjack && !hand.naturalBlackjack) {
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
    state.blackjack.busy = false;
    state.blackjack.phase = "player";
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
  state.blackjack.hands[0].naturalBlackjack = isBlackjack(state.blackjack.hands[0].cards);
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
  state.blackjack.busy = true;
  hand.cards.push(drawCard());
  renderBlackjack();
  await wait(320);

  if (calculateHand(hand.cards) >= 21) {
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
  if (state.blackjack.splitUsed || !canSplitHand(hand) || !canAfford(hand.bet)) {
    setStatus("#blackjackStatus", "Split nicht möglich");
    return;
  }

  const deducted = await adjustBalance(-hand.bet, currentUser);
  if (!deducted) {
    setStatus("#blackjackStatus", "Fehler");
    return;
  }
  const movedCard = hand.cards.pop();
  hand.cards.push(drawCard());
  hand.naturalBlackjack = false;

  const newHand = {
    cards: [movedCard, drawCard()],
    bet: hand.bet,
    finished: false,
    naturalBlackjack: false,
    doubled: false,
  };

  state.blackjack.hands.splice(state.blackjack.activeHandIndex + 1, 0, newHand);
  state.blackjack.splitUsed = true;
  state.blackjack.busy = true;
  renderBlackjack();
  await wait(320);
  state.blackjack.busy = false;
  setStatus("#blackjackStatus", "Split aktiv");
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

  const outcome = Math.random() < 0.5 ? "Kopf" : "Zahl";
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
      positions[horse] = Math.min(finishAt, positions[horse] + Math.floor(Math.random() * 22) + 12);
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
  const finalSymbols = generateSlotOutcome();
  const sequences = finalSymbols.map((symbol, index) => buildReelSequence(symbol, 20 + index * 6));
  const reelDurations = sequences.map((_, index) => 2200 + index * 850);

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
    await wait(250);
  }

  slotReels.forEach((reel, index) => {
    reel.classList.remove("rolling", "settling");
    reel.style.transition = "none";
    renderReel(reel, [finalSymbols[index]]);
    reel.style.transform = "translateY(0)";
  });

  const uniqueCount = new Set(finalSymbols).size;
  let payout = 0;

  if (uniqueCount === 1) {
    payout = bet * 5;
  } else if (uniqueCount === 2) {
    payout = bet * 2;
  }

  if (payout > 0) {
    await adjustBalance(payout, currentUser);
    setStatus("#slotsStatus", "Treffer");
    slotsResult.textContent = `Treffer! Auszahlung: ${payout} Coins.`;
    showGameResult({
      game: "Slots",
      title: "Slots gewonnen",
      amount: payout - bet,
      detail: `Die Walzen zahlen ${payout} Coins aus. ${buildBalanceLine()}`,
      variant: "win",
    });
    logActivity(`Slots zahlen ${payout} Coins aus.`);
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

logoutUserButton.addEventListener("click", () => {
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
    showAuthMessage("Bitte zuerst einloggen, um Freunde hinzuzufuegen.");
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

  if (currentUser.friends.includes(friend.playerId)) {
    showAuthMessage("Dieser Spieler ist bereits in deiner Freundesliste.");
    return;
  }

  currentUser.friends.push(friend.playerId);
  friendPlayerIdInput.value = "";
  syncCurrentUser();
  showAuthMessage(`${friend.username} wurde als Freund hinzugefügt.`);
  logActivity(`${currentUser.username} hat ${friend.username} geaddet.`);
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

slotReels.forEach((reel) => renderReel(reel, ["seven"]));
renderAllCardsPreview();
showMenuPanel("account");
setAuthView("login");
setAdminMode(false);
state.appData.currentUserId = null;
state.currentProfile = null;
syncCurrentUser();
resetBlackjackBoard();
