const liveClient = supabase.createClient(
  window.SUPABASE_CONFIG?.url || "",
  window.SUPABASE_CONFIG?.anonKey || "",
);

const liveState = {
  user: null,
  profile: null,
  profiles: [],
  friends: [],
  activeWorkTask: null,
};

function replaceNode(selector) {
  const oldNode = document.querySelector(selector);
  const newNode = oldNode.cloneNode(true);
  oldNode.replaceWith(newNode);
  return newNode;
}

function normalizeProfile(profile) {
  return {
    ...profile,
    coins: Number(profile?.coins ?? 0),
    work_completed: Number(profile?.work_completed ?? 0),
  };
}

function mapProfile(profile, authUser) {
  const normalizedProfile = normalizeProfile(profile);
  return {
    ...normalizedProfile,
    id: normalizedProfile.id || authUser?.id || null,
    playerId: normalizedProfile.player_id,
    email: authUser?.email || normalizedProfile.email || "-",
  };
}

function resolveProfileId(profile = liveState.profile) {
  return profile?.id || liveState.user?.id || null;
}

function buildFallbackUsername(authUser, preferredUsername = "") {
  const cleanedPreferred = preferredUsername.trim();
  if (cleanedPreferred) return cleanedPreferred;

  const metadataName = authUser?.user_metadata?.username?.trim();
  if (metadataName) return metadataName;

  const emailName = authUser?.email?.split("@")?.[0]?.trim();
  return emailName || `Spieler${Math.floor(1000 + Math.random() * 9000)}`;
}

function buildFallbackPlayerId(authUser) {
  const metadataId = authUser?.user_metadata?.player_id?.trim();
  if (metadataId) return metadataId;

  const safeId = String(authUser?.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `PLY${safeId || Math.floor(100000 + Math.random() * 900000)}`;
}

async function ensureLiveProfile(authUser, preferredUsername = "") {
  if (!authUser) return null;

  const { data: existingProfile, error: existingError } = await liveClient
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existingError) {
    authMessage.textContent = existingError.message || "Profil konnte nicht geladen werden.";
    return null;
  }

  if (existingProfile) {
    return mapProfile(existingProfile, authUser);
  }

  const username = buildFallbackUsername(authUser, preferredUsername);
  const playerId = buildFallbackPlayerId(authUser);

  const { data: createdProfile, error: createError } = await liveClient
    .from("profiles")
    .insert({
      id: authUser.id,
      username,
      player_id: playerId,
      coins: 1000,
      work_date: todayKey(),
      work_completed: 0,
    })
    .select()
    .single();

  if (createError) {
    authMessage.textContent = createError.message || "Profil konnte nicht erstellt werden.";
    return null;
  }

  return mapProfile(createdProfile, authUser);
}

async function liveFetchProfiles() {
  const { data, error } = await liveClient.from("profiles").select("*").order("coins", { ascending: false });
  if (error) {
    liveState.profiles = [];
    return;
  }
  liveState.profiles = (data || []).map((profile) => normalizeProfile(profile));
}

async function liveFetchProfile() {
  const { data: authData } = await liveClient.auth.getUser();
  liveState.user = authData?.user || null;

  if (!liveState.user) {
    liveState.profile = null;
    liveState.friends = [];
    state.currentProfile = null;
    return;
  }

  liveState.profile = await ensureLiveProfile(liveState.user);

  if (!liveState.profile) {
    liveState.friends = [];
    state.currentProfile = null;
    return;
  }

  const { data: friendsData } = await liveClient
    .from("friends")
    .select("friend:friend_id(id, username, player_id, coins)")
    .eq("user_id", liveState.user.id);

  liveState.friends = (friendsData || []).map((row) => row.friend).filter(Boolean);
  state.currentProfile = liveState.profile;
}

function liveRenderProfile() {
  profileUsername.textContent = liveState.profile?.username || "-";
  profileEmail.textContent = liveState.profile?.email || "-";
  profilePlayerId.textContent = liveState.profile?.playerId || "-";
  profileCoins.textContent = String(liveState.profile?.coins || 0);
  changeUsernameInput.value = liveState.profile?.username || "";
  currentUserLabel.textContent = liveState.profile?.username || "Nicht eingeloggt";
  balanceEl.textContent = String(liveState.profile?.coins || 0);
  state.balance = liveState.profile?.coins || 0;
  if (typeof syncBetInputs === "function") {
    syncBetInputs();
  }

  friendsList.innerHTML = "";
  if (liveState.friends.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Keine Freunde hinzugefügt.";
    friendsList.appendChild(item);
    return;
  }

  liveState.friends.forEach((friend) => {
    const item = document.createElement("li");
    item.textContent = `${friend.username} (${friend.player_id})`;
    friendsList.appendChild(item);
  });
}

function liveRenderLeaderboard() {
  leaderboardList.innerHTML = "";
  localPlayersList.innerHTML = "";

  if (liveState.profiles.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Spieler registriert.";
    leaderboardList.appendChild(item);
  } else {
    liveState.profiles.slice(0, 20).forEach((profile, index) => {
      const item = document.createElement("li");
      item.textContent = `#${index + 1} ${profile.username} - ${profile.coins} Coins - ${profile.player_id}`;
      leaderboardList.appendChild(item);
    });
  }

  if (liveState.profiles.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Spieler vorhanden.";
    localPlayersList.appendChild(item);
    return;
  }

  liveState.profiles.forEach((profile) => {
    const item = document.createElement("li");
    item.textContent = `${profile.username} - ${profile.player_id}`;
    localPlayersList.appendChild(item);
  });
}

function liveRenderDaily() {
  if (!liveState.profile) {
    dailyStatusText.textContent = "Logge dich ein, um deine tägliche Belohnung abzuholen.";
    workCounter.textContent = "Heute gelöst: 0 / 10";
    workQuestion.textContent = "Logge dich ein und starte eine Aufgabe.";
    workStatusText.textContent = "Je nach Schwierigkeit bekommst du zwischen 50 und 1.000 Coins.";
    return;
  }

  const today = todayKey();
  const claimed = liveState.profile.daily_last_claim === today;
  dailyStatusText.textContent = claimed
    ? "Die tägliche Belohnung wurde heute bereits abgeholt."
    : "Du kannst heute 1.000 Coins claimen.";

  const solvedToday = liveState.profile.work_date === today ? liveState.profile.work_completed : 0;
  workCounter.textContent = `Heute gelöst: ${solvedToday} / ${WORK_LIMIT_PER_DAY}`;
}

function liveRenderAuth() {
  const loggedIn = !!liveState.profile;
  logoutUserButton.classList.toggle("hidden", !loggedIn);
  document.querySelector("#loginUser").classList.toggle("hidden", loggedIn);
  document.querySelector("#registerUser")?.classList.toggle("hidden", loggedIn);
  document.querySelector("#loginView").classList.toggle("hidden", loggedIn || state.authView !== "login");
  document.querySelector("#registerView")?.classList.toggle("hidden", loggedIn || state.authView !== "register");
  authMessage.textContent = loggedIn
    ? `Eingeloggt als ${liveState.profile.username}.`
    : state.authView === "login"
      ? "Logge dich ein, um Coins zu spielen und dein Profil zu sehen."
      : "Registriere einen neuen Spieler mit Benutzername, Passwort und E-Mail.";
}

async function liveSync() {
  await liveFetchProfiles();
  await liveFetchProfile();
  liveRenderProfile();
  liveRenderLeaderboard();
  liveRenderDaily();
  liveRenderAuth();
  renderAdminAccountsLive();
}

async function liveAdjustBalance(amount, user = liveState.profile) {
  if (!user) return false;
  const profileId = resolveProfileId(user);
  if (!profileId) {
    authMessage.textContent = "Profil-ID fehlt. Bitte neu einloggen.";
    return false;
  }

  const { data: currentProfile, error: readError } = await liveClient
    .from("profiles")
    .select("coins")
    .eq("id", profileId)
    .single();

  if (readError) {
    authMessage.textContent = readError.message || "Coins konnten nicht gelesen werden.";
    return false;
  }

  const currentCoins = Number(currentProfile?.coins ?? 0);
  const nextCoins = Math.max(0, currentCoins + amount);

  const { error } = await liveClient.from("profiles").update({ coins: nextCoins }).eq("id", profileId);
  if (error) {
    authMessage.textContent = error.message || "Coins konnten nicht aktualisiert werden.";
    return false;
  }
  await liveSync();
  return true;
}

function ensureLiveAdminAccess() {
  if (!state.adminUnlocked) {
    adminStatus.textContent = "Admin-Login nÃ¶tig";
    return false;
  }

  if (!liveState.profile) {
    adminStatus.textContent = "Bitte zuerst einloggen";
    return false;
  }

  if (!liveState.profile.is_admin) {
    adminStatus.textContent = "Dein Account braucht is_admin = true in Supabase";
    return false;
  }

  return true;
}

async function liveAdjustOtherPlayerBalance(playerId, amount) {
  const normalizedPlayerId = playerId.trim().toUpperCase();
  if (!ensureLiveAdminAccess()) return false;

  if (!normalizedPlayerId) {
    adminStatus.textContent = "Spieler-ID fehlt";
    return false;
  }

  if (!Number.isFinite(amount)) {
    adminStatus.textContent = "UngÃ¼ltiger Coin-Wert";
    return false;
  }

  const { data: targetProfile, error: targetError } = await liveClient
    .from("profiles")
    .select("id, username, player_id, coins")
    .eq("player_id", normalizedPlayerId)
    .maybeSingle();

  if (targetError) {
    adminStatus.textContent = targetError.message || "Spieler konnte nicht geladen werden";
    return false;
  }

  if (!targetProfile) {
    adminStatus.textContent = "ID nicht gefunden";
    return false;
  }

  const currentCoins = Number(targetProfile.coins ?? 0);
  const nextCoins = Math.max(0, currentCoins + amount);

  const { error: updateError } = await liveClient
    .from("profiles")
    .update({ coins: nextCoins })
    .eq("id", targetProfile.id);

  if (updateError) {
    adminStatus.textContent = updateError.message || "Coins konnten nicht aktualisiert werden";
    return false;
  }

  await liveSync();
  adminStatus.textContent = amount >= 0
    ? `${targetProfile.username} bekam ${Math.abs(amount)} Coins`
    : `${targetProfile.username} verlor ${Math.abs(amount)} Coins`;
  return true;
}

async function liveRequireUser(statusSelector) {
  if (liveState.profile) return liveState.profile;
  if (statusSelector) setStatus(statusSelector, "Login nötig");
  authMessage.textContent = "Bitte erst einloggen.";
  return null;
}

function renderAdminAccountsLive() {
  adminAccountsList.innerHTML = "";
  if (!state.adminUnlocked) {
    const item = document.createElement("li");
    item.textContent = "Admin-Login nötig.";
    adminAccountsList.appendChild(item);
    return;
  }

  if (liveState.profiles.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Accounts vorhanden.";
    adminAccountsList.appendChild(item);
    return;
  }

  liveState.profiles.forEach((profile) => {
    const item = document.createElement("li");
    item.className = "admin-account-item";
    item.innerHTML = `
      <div class="admin-account-row">
        <span>${profile.username} - ${profile.player_id}</span>
      </div>
    `;
    adminAccountsList.appendChild(item);
  });
}

function createLiveWorkTask() {
  return createWorkTask();
}

function installLiveHandlers() {
  const loginButton = replaceNode("#loginUser");
  loginButton.addEventListener("click", async () => {
    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value.trim();

    if (!email || !password) {
      authMessage.textContent = "Bitte E-Mail und Passwort eingeben.";
      return;
    }

    const { error } = await liveClient.auth.signInWithPassword({ email, password });
    if (error) {
      authMessage.textContent = error.message || "Login fehlgeschlagen.";
      return;
    }

    await liveFetchProfiles();
    liveState.profile = await ensureLiveProfile(liveClient.auth.getUser ? (await liveClient.auth.getUser()).data?.user : null);
    await liveFetchProfile();
    liveRenderProfile();
    liveRenderLeaderboard();
    liveRenderDaily();
    liveRenderAuth();
    renderAdminAccountsLive();

    if (!liveState.profile) {
      authMessage.textContent = "Login hat funktioniert, aber dein Profil konnte nicht geladen werden.";
      return;
    }

    logActivity(`${liveState.profile.username} hat sich eingeloggt.`);
  });

  const registerButton = document.querySelector("#registerUser");
  if (registerButton) {
    replaceNode("#registerUser").addEventListener("click", async () => {
      const username = document.querySelector("#registerUsername").value.trim();
      const email = document.querySelector("#registerEmail").value.trim();
      const password = document.querySelector("#registerPassword").value.trim();

      if (!username || !email || !password) {
        authMessage.textContent = "Bitte Benutzername, E-Mail und Passwort ausfüllen.";
        return;
      }

      if (password.length < 6) {
        authMessage.textContent = "Das Passwort muss mindestens 6 Zeichen lang sein.";
        return;
      }

      const playerId = `PLY${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await liveClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            player_id: playerId,
          },
        },
      });

      if (error || !data.user) {
        authMessage.textContent = error?.message || "Registrierung fehlgeschlagen.";
        return;
      }

      if (!data.session) {
        setAuthView("login");
        authMessage.textContent = `Account erstellt. Bestätige jetzt deine E-Mail und logge dich danach ein. Deine Spieler-ID ist ${playerId}.`;
        logActivity(`${username} wurde neu registriert.`);
        return;
      }

      const profile = await ensureLiveProfile(data.user);
      if (!profile) return;

      await liveSync();
      setAuthView("login");
      authMessage.textContent = `Account erstellt. Deine Spieler-ID ist ${playerId}.`;
      logActivity(`${username} wurde neu registriert.`);
    });
  }

  const logoutButton = replaceNode("#logoutUser");
  logoutButton.addEventListener("click", async () => {
    if (liveState.profile) logActivity(`${liveState.profile.username} hat sich ausgeloggt.`);
    await liveClient.auth.signOut();
    state.adminUnlocked = false;
    setAdminMode(false);
    await liveSync();
  });

  const renameButton = replaceNode("#changeUsernameButton");
  renameButton.addEventListener("click", async () => {
    if (!liveState.profile) {
      authMessage.textContent = "Bitte zuerst einloggen, um deinen Benutzernamen zu ändern.";
      return;
    }

    const nextUsername = changeUsernameInput.value.trim();
    if (!nextUsername) {
      authMessage.textContent = "Bitte gib einen Benutzernamen ein.";
      return;
    }

    const duplicate = liveState.profiles.find((profile) =>
      profile.id !== resolveProfileId() && profile.username.toLowerCase() === nextUsername.toLowerCase()
    );

    if (duplicate) {
      authMessage.textContent = "Dieser Benutzername ist bereits vergeben.";
      return;
    }

    const { error } = await liveClient
      .from("profiles")
      .update({ username: nextUsername })
      .eq("id", resolveProfileId());

    if (error) {
      authMessage.textContent = error.message || "Benutzername konnte nicht geändert werden.";
      return;
    }

    await liveSync();
    authMessage.textContent = `Dein Benutzername wurde auf ${nextUsername} geändert.`;
    logActivity(`${nextUsername} hat den Benutzernamen geändert.`);
  });

  const addFriendButton = replaceNode("#addFriendButton");
  addFriendButton.addEventListener("click", async () => {
    if (!liveState.profile) {
      authMessage.textContent = "Bitte zuerst einloggen, um Freunde hinzuzufügen.";
      return;
    }

    const friendId = friendPlayerIdInput.value.trim().toUpperCase();
    const target = liveState.profiles.find((profile) => profile.player_id.toUpperCase() === friendId);
    if (!target) {
      authMessage.textContent = "Spieler-ID nicht gefunden.";
      return;
    }
    if (target.id === resolveProfileId()) {
      authMessage.textContent = "Du kannst dich nicht selbst adden.";
      return;
    }

    const alreadyFriend = liveState.friends.some((friend) => friend.id === target.id);
    if (alreadyFriend) {
      authMessage.textContent = "Dieser Spieler ist bereits in deiner Freundesliste.";
      return;
    }

    const { error } = await liveClient.from("friends").insert({ user_id: resolveProfileId(), friend_id: target.id });
    if (error) {
      authMessage.textContent = error.message || "Freund konnte nicht hinzugefügt werden.";
      return;
    }

    friendPlayerIdInput.value = "";
    await liveSync();
    authMessage.textContent = `${target.username} wurde als Freund hinzugefügt.`;
  });

  const claimDailyButton = replaceNode("#claimDailyReward");
  claimDailyButton.addEventListener("click", async () => {
    if (!liveState.profile) {
      dailyStatusText.textContent = "Bitte zuerst einloggen.";
      return;
    }
    if (liveState.profile.daily_last_claim === todayKey()) {
      dailyStatusText.textContent = "Du hast die tägliche Belohnung heute schon abgeholt.";
      return;
    }

    const { error } = await liveClient
      .from("profiles")
      .update({ daily_last_claim: todayKey(), coins: liveState.profile.coins + 1000 })
      .eq("id", resolveProfileId());
    if (error) {
      dailyStatusText.textContent = error.message;
      return;
    }

    await liveSync();
    dailyStatusText.textContent = "1.000 Coins wurden gutgeschrieben.";
  });

  const generateWorkButton = replaceNode("#generateWorkTask");
  generateWorkButton.addEventListener("click", async () => {
    if (!liveState.profile) {
      workStatusText.textContent = "Bitte zuerst einloggen.";
      return;
    }

    const solvedToday = liveState.profile.work_date === todayKey() ? liveState.profile.work_completed : 0;
    if (solvedToday >= WORK_LIMIT_PER_DAY) {
      workStatusText.textContent = "Dein tägliches Work-Limit ist erreicht.";
      return;
    }

    liveState.activeWorkTask = createLiveWorkTask();
    workQuestion.textContent = liveState.activeWorkTask.question;
    workAnswer.value = "";
    workStatusText.textContent = `Diese Aufgabe bringt ${liveState.activeWorkTask.reward} Coins bei richtiger Antwort.`;
  });

  const submitWorkButton = replaceNode("#submitWorkTask");
  submitWorkButton.addEventListener("click", async () => {
    if (!liveState.profile) {
      workStatusText.textContent = "Bitte zuerst einloggen.";
      return;
    }
    if (!liveState.activeWorkTask) {
      workStatusText.textContent = "Erzeuge zuerst eine Aufgabe.";
      return;
    }

    const submitted = Number(String(workAnswer.value).replace(",", "."));
    if (!Number.isFinite(submitted)) {
      workStatusText.textContent = "Bitte gib eine gültige Zahl ein.";
      return;
    }

    const correct = Math.abs(submitted - liveState.activeWorkTask.answer) < 0.0001;
    const solvedToday = liveState.profile.work_date === todayKey() ? liveState.profile.work_completed : 0;
    const nextCompleted = solvedToday + 1;
    const nextCoins = correct ? liveState.profile.coins + liveState.activeWorkTask.reward : liveState.profile.coins;

    const { error } = await liveClient
      .from("profiles")
      .update({ work_date: todayKey(), work_completed: nextCompleted, coins: nextCoins })
      .eq("id", resolveProfileId());
    if (error) {
      workStatusText.textContent = error.message;
      return;
    }

    await liveSync();
    workStatusText.textContent = correct
      ? `Richtig! Du bekommst ${liveState.activeWorkTask.reward} Coins.`
      : `Leider falsch. Richtige Antwort: ${liveState.activeWorkTask.answer}`;
    workQuestion.textContent = "Neue Aufgabe erzeugen oder morgen wiederkommen.";
    workAnswer.value = "";
    liveState.activeWorkTask = null;
  });

  const unlockAdminButton = replaceNode("#unlockAdmin");
  unlockAdminButton.addEventListener("click", () => {
    if (adminCodeInput.value !== "Admin123G") {
      adminStatus.textContent = "Falscher Code";
      return;
    }
    adminCodeInput.value = "";
    setAdminMode(true);
  });

  replaceNode("#adminGiveSelf").addEventListener("click", async () => {
    const amount = Number(adminSelfCoinsInput.value);
    if (!state.adminUnlocked || !liveState.profile || !Number.isFinite(amount) || amount < 0) return;
    await liveAdjustBalance(amount, liveState.profile);
  });

  replaceNode("#adminTakeSelf").addEventListener("click", async () => {
    const amount = Number(adminSelfCoinsInput.value);
    if (!state.adminUnlocked || !liveState.profile || !Number.isFinite(amount) || amount < 0) return;
    await liveAdjustBalance(-amount, liveState.profile);
  });

  replaceNode("#adminGiveOther").addEventListener("click", async () => {
    const amount = Number(adminTargetCoinsInput.value);
    const playerId = adminTargetPlayerIdInput.value.trim();
    if (!Number.isFinite(amount) || amount < 0) {
      adminStatus.textContent = "UngÃ¼ltiger Coin-Wert";
      return;
    }

    await liveAdjustOtherPlayerBalance(playerId, amount);
  });

  replaceNode("#adminTakeOther").addEventListener("click", async () => {
    const amount = Number(adminTargetCoinsInput.value);
    const playerId = adminTargetPlayerIdInput.value.trim();
    if (!Number.isFinite(amount) || amount < 0) {
      adminStatus.textContent = "UngÃ¼ltiger Coin-Wert";
      return;
    }

    await liveAdjustOtherPlayerBalance(playerId, -amount);
  });
}

async function installLiveSupabase() {
  if (!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.anonKey) return;

  adjustBalance = liveAdjustBalance;
  requireUser = liveRequireUser;
  syncCurrentUser = liveSync;

  installLiveHandlers();
  await liveClient.auth.signOut();
  liveState.user = null;
  liveState.profile = null;
  liveState.friends = [];
  state.currentProfile = null;
  await liveSync();

  liveClient.auth.onAuthStateChange(async () => {
    await liveSync();
  });
}

installLiveSupabase();
