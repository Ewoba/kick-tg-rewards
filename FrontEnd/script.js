document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL = window.BACKEND_URL || "http://localhost:8000";
  const STEAM_KEY = "steamTradeLink";
  const KICK_KEY = "kickProfile";

  const copyBtn = document.getElementById("copyLink");
  const linkInput = document.getElementById("steamLink");
  const kickAction = document.getElementById("kickAction");
  const kickName = document.getElementById("kickName");
  const kickEmail = document.getElementById("kickEmail");
  const twitchAction = document.getElementById("twitchAction");
  const twitchName = document.getElementById("twitchName");
  const twitchHandle = document.getElementById("twitchHandle");
  const participationCard = document.getElementById("participationCard");
  const participationBadge = document.getElementById("participationBadge");
  const participationText = document.getElementById("participationText");
  const steamLink = document.getElementById("steamLink");
  const steamEdit = document.getElementById("steamEdit");
  const steamDelete = document.getElementById("steamDelete");

  copyBtn?.addEventListener("click", async () => {
    try {
      const value = linkInput?.value || "";
      if (!value) return;
      await navigator.clipboard.writeText(value);
      copyBtn.innerText = "✓";
      setTimeout(() => (copyBtn.innerText = "⧉"), 1200);
    } catch (err) {
      console.error("Не удалось скопировать:", err);
    }
  });

  // Kick auth state (simple client-side)
  const params = new URLSearchParams(window.location.search);
  const urlKickUser = params.get("kick_user");
  const urlKickEmail = params.get("kick_email");
  const urlKickId = params.get("kick_id");

  if (urlKickUser) {
    const profile = { user: urlKickUser, email: urlKickEmail, id: urlKickId };
    localStorage.setItem(KICK_KEY, JSON.stringify(profile));
  }

  const savedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem(KICK_KEY));
    } catch (e) {
      return null;
    }
  })();

  const loadSteam = async () => {
    const local = localStorage.getItem(STEAM_KEY);
    if (local) {
      steamLink.value = local;
      return;
    }
    try {
      const resp = await fetch(`${BACKEND_URL}/steam/link`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.steamTradeLink) {
          steamLink.value = data.steamTradeLink;
          localStorage.setItem(STEAM_KEY, data.steamTradeLink);
        }
      }
    } catch (e) {
      console.warn("Не удалось загрузить steam link", e);
    }
  };

  loadSteam();

  const renderKick = (profile) => {
    const connected = profile && profile.user;
    kickName.textContent = connected ? profile.user : "Kick не подключен";
    kickEmail.textContent = connected ? profile.email || "@—" : "@—";
    if (connected) {
      kickAction.textContent = "Отвязать";
      kickAction.classList.remove("btn-success", "ghost");
      kickAction.classList.add("btn-danger");
      kickAction.href = "#";
    } else {
      kickAction.textContent = "Подключить";
      kickAction.classList.add("btn-success", "ghost");
      kickAction.classList.remove("btn-danger");
      kickAction.href = "http://localhost:8000/auth/kick/start";
    }
  };

  renderKick(savedProfile);

  kickAction?.addEventListener("click", (e) => {
    const current = JSON.parse(localStorage.getItem("kickProfile") || "null");
    const connected = current && current.user;
    if (connected) {
      e.preventDefault();
      localStorage.removeItem(KICK_KEY);
      renderKick(null);
    }
  });

  // Simple Twitch button state (placeholder)
  if (twitchAction) {
    twitchAction.textContent = "Подключить";
    twitchAction.classList.add("btn-success");
    twitchAction.addEventListener("click", () => {
      alert("Twitch OAuth не настроен. Добавьте URL авторизации, чтобы подключить.");
    });
  }

  const updateParticipation = () => {
    const profile = JSON.parse(localStorage.getItem(KICK_KEY) || "null");
    const hasKick = profile && profile.user;
    const hasTwitch = false; // placeholder
    const hasSteam = steamLink && steamLink.value && steamLink.value.trim().length > 0;
    const active = (hasKick || hasTwitch) && hasSteam;
    if (active) {
      participationCard.classList.remove("inactive");
      participationBadge.classList.remove("badge-danger");
      participationBadge.classList.add("badge-success");
      participationBadge.textContent = "Активно";
      participationText.textContent = "Вы можете участвовать в розыгрышах";
    } else {
      participationCard.classList.add("inactive");
      participationBadge.classList.remove("badge-success");
      participationBadge.classList.add("badge-danger");
      participationBadge.textContent = "Неактивно";
      participationText.textContent = "Требуется привязать Kick/Twitch и Steam trade link";
    }
  };

  const persistSteam = async (value) => {
    localStorage.setItem(STEAM_KEY, value);
    try {
      await fetch(`${BACKEND_URL}/steam/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamTradeLink: value }),
      });
    } catch (e) {
      console.warn("Не удалось сохранить steam link", e);
    }
  };

  steamEdit?.addEventListener("click", async () => {
    steamLink.value = (steamLink.value || "").trim();
    persistSteam(steamLink.value);
    updateParticipation();
  });

  steamDelete?.addEventListener("click", () => {
    steamLink.value = "";
    localStorage.removeItem(STEAM_KEY);
    persistSteam("");
    updateParticipation();
  });

  updateParticipation();
  kickAction?.addEventListener("click", () => setTimeout(updateParticipation, 200));
  steamLink?.addEventListener("input", updateParticipation);
  steamLink?.addEventListener("blur", () => {
    steamLink.value = (steamLink.value || "").trim();
    persistSteam(steamLink.value);
    updateParticipation();
  });
});
