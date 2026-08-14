"use strict";

const MINIMUM_PLAYER_NAME_LENGTH = 2;
const EMPTY_MESSAGE = "";
const WORLD_MAP_WIDTH = 320;
const WORLD_MAP_HEIGHT = 420;
const PLAYER_MOVE_STEP = 4;
const INTERACTION_RANGE = 26;

let gameElements = null;
let quizState = QUIZ_ENGINE.createInitialQuizState();
let campaignState = STORY_ENGINE.createInitialCampaignState();
let activeQuizQuestions = [];
let activeTimerId = null;
let isCampaignActive = false;
let explorationState = createInitialExplorationState();
let movementRepeatId = null;
let joystickPointerId = null;
let joystickMoveX = 0;
let joystickMoveY = 0;
let gameStartTime = null;
let isResultSaved = false;

function createInitialExplorationState() {
  return {
    sceneId: null,
    playerX: 160,
    playerY: 192,
    currentZoneId: null,
    canInteract: false,
  };
}

function normalizePlayerName(playerName) {
  return playerName.trim().replace(/\s+/g, " ");
}

function getPlayerName() {
  return document.documentElement.dataset.playerName || "";
}

function getTotalGameTime() {
  if (gameStartTime === null) {
    return 0;
  }

  return Math.max(0, Math.round((performance.now() - gameStartTime) / 1000));
}

async function saveFinalResult() {
  if (isResultSaved) {
    return;
  }

  const playerName = getPlayerName();

  if (!playerName) {
    console.error("PLAYER NAME TIDAK DITEMUKAN.");
    return;
  }

  try {
    await saveGameResult({
      name: playerName,
      score: quizState.currentScore,
      totalTime: getTotalGameTime(),
    });

    isResultSaved = true;
    console.log("HASIL GAME BERHASIL DISIMPAN KE FIREBASE.");
  } catch (error) {
    console.error("GAGAL MENYIMPAN HASIL GAME:", error);
  }
}

function setFormMessage(message) {
  gameElements.formMessage.textContent = message;
}

function updateStartButton() {
  const playerName = normalizePlayerName(gameElements.playerNameInput.value);
  gameElements.startButton.disabled = playerName.length < MINIMUM_PLAYER_NAME_LENGTH;
}

function getSceneCopy(scene) {
  if (!scene) {
    return "";
  }

  if (scene.id === "central-plaza") {
    return "Pusat NEXUS CITY masih berdiri, tetapi sinyal IoT dari lima zona utama terputus.";
  }

  if (scene.id === "nexus-core") {
    return "Inti NEXUS CORE menunggu konfirmasi akhir bahwa seluruh zona kota telah pulih.";
  }

  const quest = STORY_ENGINE.getQuestForScene(scene);
  return quest ? quest.briefing : "Zona siap diperiksa.";
}

function getAccentClass(accent) {
  return typeof accent === "string" && accent.length > 0 ? `accent-${accent}` : "accent-lime";
}

function hideStoryPanels() {
  gameElements.storyScenePanel.hidden = true;
  gameElements.storyExplorationPanel.hidden = true;
  gameElements.storyInteractionPanel.hidden = true;
  gameElements.storyDialoguePanel.hidden = true;
  gameElements.storyQuestPanel.hidden = true;
  gameElements.storyRewardPanel.hidden = true;
  gameElements.storyEndingPanel.hidden = true;
}

function updateStoryScore() {
  gameElements.storyScore.textContent = `SCORE ${quizState.currentScore}`;
}

function renderScenePanel(view) {
  hideStoryPanels();
  gameElements.storyScenePanel.hidden = false;
  gameElements.storySceneLabel.textContent = view.scene.label || "ZONA";
  gameElements.storySceneName.textContent = view.scene.name;
  gameElements.storySceneCopy.textContent = getSceneCopy(view.scene);
  updateStoryScore();
}

function renderInteractionPanel(view) {
  hideStoryPanels();
  gameElements.storyInteractionPanel.hidden = false;

  const speaker = view.interactionSpeaker || view.speaker;
  gameElements.storyInteractionAccent.className = `story-npc-badge ${getAccentClass(speaker?.accent)}`;
  gameElements.storyInteractionRole.textContent = speaker?.role || "NPC";
  gameElements.storyInteractionName.textContent = speaker?.name || "UNKNOWN";
  gameElements.storyInteractionCopy.textContent = view.scene?.id === "central-plaza"
    ? "Dr. Aruna dan Tiko menunggu laporan awal sebelum kamu menuju zona pertama."
    : "Objek interaksi zona membutuhkan pemeriksaan teknisi sebelum quiz dimulai.";
  updateStoryScore();
}

function renderDialoguePanel(view) {
  hideStoryPanels();
  gameElements.storyDialoguePanel.hidden = false;

  const speaker = view.speaker;
  gameElements.storyDialogueSpeakerRole.textContent = speaker?.role || "NPC";
  gameElements.storyDialogueSpeakerName.textContent = speaker?.name || "UNKNOWN";
  gameElements.storyDialogueText.textContent = view.dialogueLine?.text || "";
  updateStoryScore();
}

function renderQuestPanel(view) {
  hideStoryPanels();
  gameElements.storyQuestPanel.hidden = false;

  gameElements.storyQuestTitle.textContent = view.quest?.title || "MISI";

  gameElements.storyQuestBriefing.textContent =
    view.quest?.briefing || "";

  gameElements.storyQuestObjective.textContent =
    `TARGET: SELESAIKAN ${view.quest?.objective?.questionIds?.length || 2} SOAL IoT.`;

  gameElements.storyQuestButton.textContent = "MULAI QUIZ";

  updateStoryScore();
}

function renderRewardPanel(view) {
  hideStoryPanels();
  gameElements.storyRewardPanel.hidden = false;
  gameElements.storyRewardTitle.textContent = view.quest?.title || "MISI SELESAI";
  gameElements.storyRewardSummary.textContent = `+${view.quest?.rewards?.xp || 0} XP // BADGE ${view.quest?.rewards?.badge || "-"}. PROGRESS KAMPANYE ${campaignState.completedQuestIds.length}/5.`;
  updateStoryScore();
}

function renderEndingPanel() {
  hideStoryPanels();
  gameElements.storyEndingPanel.hidden = false;

  saveFinalResult();

  gameElements.storyEndingSummary.textContent =
    `KAMU MENYELESAIKAN ${quizState.quizProgress}/${activeQuizQuestions.length || QUIZ_ENGINE.EXPECTED_QUESTION_COUNT} SOAL DENGAN SCORE ${quizState.currentScore}. HP TERSISA ${quizState.currentHp}/${QUIZ_ENGINE.MAX_HP}. TOTAL XP ${campaignState.totalXp}.`;

  gameElements.storyEndingBadges.textContent =
    campaignState.earnedBadges.length > 0
      ? `BADGE: ${campaignState.earnedBadges.join(" // ")}`
      : "BADGE: -";

  updateStoryScore();
}

function getSceneMapZone(scene) {
  return scene?.mapZone || {
    x: 0,
    y: 0,
    width: WORLD_MAP_WIDTH,
    height: WORLD_MAP_HEIGHT,
    spawnPoint: { x: 160, y: 192 },
    interactionPoint: { x: 160, y: 192 },
  };
}

function isPointInsideZone(pointX, pointY, scene) {
  const zone = getSceneMapZone(scene);

  return (
    pointX >= zone.x &&
    pointX <= zone.x + zone.width &&
    pointY >= zone.y &&
    pointY <= zone.y + zone.height
  );
}

function getSceneAtPoint(pointX, pointY) {
  return STORY_ENGINE.getOrderedScenes().find((scene) => isPointInsideZone(pointX, pointY, scene)) || null;
}

function isSceneUnlocked(scene, activeScene) {
  if (!scene) {
    return false;
  }

  if (scene.id === activeScene?.id || scene.id === "central-plaza") {
    return true;
  }

  if (!scene.unlocksAfterQuestId) {
    return true;
  }

  return campaignState.completedQuestIds.includes(scene.unlocksAfterQuestId);
}

function syncExplorationForScene(scene) {
  if (!scene || explorationState.sceneId === scene.id) {
    return;
  }

  const zone = getSceneMapZone(scene);

  explorationState = {
    sceneId: scene.id,
    playerX: zone.spawnPoint.x,
    playerY: zone.spawnPoint.y,
    currentZoneId: null,
    canInteract: false,
  };
}

function updateExplorationStatus(view) {
  const activeScene = view.scene;
  const activeZone = getSceneAtPoint(explorationState.playerX, explorationState.playerY);
  const zone = getSceneMapZone(activeScene);
  const deltaX = explorationState.playerX - zone.interactionPoint.x;
  const deltaY = explorationState.playerY - zone.interactionPoint.y;
  const canInteract =
    activeZone?.id === activeScene?.id &&
    Math.hypot(deltaX, deltaY) <= INTERACTION_RANGE;

  explorationState = {
    ...explorationState,
    currentZoneId: activeZone?.id || null,
    canInteract,
  };
}

function renderExplorationMap(view) {
  const activeScene = view.scene;
  const zones = STORY_ENGINE.getOrderedScenes();
  gameElements.storyWorldZones.replaceChildren();

  zones.forEach((scene) => {
    const zone = getSceneMapZone(scene);
    const zoneElement = document.createElement("div");
    const isLocked = !isSceneUnlocked(scene, activeScene);
    const isCurrentZone = scene.id === explorationState.currentZoneId;
    const isActiveZone = scene.id === activeScene?.id;

    zoneElement.className = "story-world-zone";
    if (isCurrentZone) {
      zoneElement.classList.add("is-current");
    }
    if (isActiveZone) {
      zoneElement.classList.add("is-active");
    }
    if (isLocked) {
      zoneElement.classList.add("is-locked");
    }

    zoneElement.style.left = `${(zone.x / WORLD_MAP_WIDTH) * 100}%`;
    zoneElement.style.top = `${(zone.y / WORLD_MAP_HEIGHT) * 100}%`;
    zoneElement.style.width = `${(zone.width / WORLD_MAP_WIDTH) * 100}%`;
    zoneElement.style.height = `${(zone.height / WORLD_MAP_HEIGHT) * 100}%`;
    zoneElement.textContent = scene.label;
    gameElements.storyWorldZones.append(zoneElement);
  });

  const interactionPoint = getSceneMapZone(activeScene).interactionPoint;
  gameElements.storyWorldInteraction.style.left = `${(interactionPoint.x / WORLD_MAP_WIDTH) * 100}%`;
  gameElements.storyWorldInteraction.style.top = `${(interactionPoint.y / WORLD_MAP_HEIGHT) * 100}%`;
  gameElements.storyWorldPlayer.style.left = `${(explorationState.playerX / WORLD_MAP_WIDTH) * 100}%`;
  gameElements.storyWorldPlayer.style.top = `${(explorationState.playerY / WORLD_MAP_HEIGHT) * 100}%`;
}

function renderExplorationPanel(view) {
  hideStoryPanels();
  syncExplorationForScene(view.scene);
  updateExplorationStatus(view);
  gameElements.storyExplorationPanel.hidden = false;

  const currentZone = getSceneAtPoint(explorationState.playerX, explorationState.playerY);
  const targetZoneName = view.scene?.name || "ZONA AKTIF";
  const currentZoneName = currentZone?.name || "KORIDOR KOTA";

  gameElements.storyExplorationZone.textContent = currentZoneName;
  gameElements.storyExplorationTarget.textContent = targetZoneName;
  gameElements.storyExplorationHint.textContent = explorationState.canInteract
    ? "TARGET SIAP DIINTERAKSIKAN. GUNAKAN TOMBOL INTERAKSI UNTUK MEMULAI KONTAK."
    : `GERAKKAN TEKNISI MENUJU ${targetZoneName} DAN DEKATI PENANDA SINYAL.`;
  gameElements.storyExplorationButton.disabled = !explorationState.canInteract;
  renderExplorationMap(view);
  updateStoryScore();

  if (document.activeElement !== gameElements.storyWorldMap) {
    gameElements.storyWorldMap.focus();
  }
}

function renderCampaignPhase() {
  const view = STORY_ENGINE.getCurrentSceneView(campaignState);

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.SCENE) {
    renderScenePanel(view);
    return;
  }

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.INTERACTION) {
    renderInteractionPanel(view);
    return;
  }

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.EXPLORATION) {
    renderExplorationPanel(view);
    return;
  }

  if (
    campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.DIALOGUE ||
    campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.COMPLETE_DIALOGUE
  ) {
    renderDialoguePanel(view);
    return;
  }

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.QUEST) {
    renderQuestPanel(view);
    return;
  }

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.REWARD) {
    renderRewardPanel(view);
    return;
  }

  if (campaignState.phase === STORY_ENGINE.CAMPAIGN_PHASES.ENDING) {
    renderEndingPanel();
  }
}

function handleStorySceneContinue() {
  campaignState = STORY_ENGINE.beginExploration(campaignState);
  renderCampaignPhase();
}

function handleStoryExplorationContinue() {
  if (!explorationState.canInteract) {
    return;
  }

  campaignState = STORY_ENGINE.beginInteraction(campaignState);
  renderCampaignPhase();
}

function handleStoryInteractionContinue() {
  const scene = STORY_ENGINE.getSceneByIndex(campaignState.sceneIndex);

  if (!scene?.dialogueId) {
    campaignState = STORY_ENGINE.advanceToNextScene(campaignState);
    renderCampaignPhase();
    return;
  }

  campaignState = STORY_ENGINE.beginDialogue(campaignState, scene.dialogueId);
  renderCampaignPhase();
}

function handleStoryDialogueContinue() {
  campaignState = STORY_ENGINE.advanceDialogue(campaignState);
  renderCampaignPhase();
}

function handleStoryQuestContinue() {
  const quizStart = STORY_ENGINE.beginQuestQuiz(campaignState, quizState, activeQuizQuestions);

  if (quizStart.error) {
    showCampaignError(quizStart.error);
    return;
  }

  campaignState = quizStart.campaignState;
  quizState = quizStart.quizState;
  showScreen("quiz");
  renderQuestion();
}

function handleStoryRewardContinue() {
  campaignState = STORY_ENGINE.advanceFromReward(campaignState);
  renderCampaignPhase();
}

function showCampaignError(message) {
  stopQuestionTimer();
  stopMovementRepeat();
  isCampaignActive = false;
  campaignState = STORY_ENGINE.createInitialCampaignState();
  quizState = QUIZ_ENGINE.createInitialQuizState();
  activeQuizQuestions = [];
  explorationState = createInitialExplorationState();
  showScreen("menu");
  setFormMessage(message);
  updateStartButton();
}

function getQuizQuestions() {
  return typeof questions !== "undefined" && Array.isArray(questions) ? questions : [];
}

function getQuests() {
  return typeof quests !== "undefined" && Array.isArray(quests) ? quests : [];
}

function getMissionForQuestion(question) {
  if (!question || typeof question.missionId !== "string") {
    return null;
  }

  return getQuests().find((quest) => quest.id === question.missionId) || null;
}

function getHudQuestion() {
  if (quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.RESULTS) {
    return activeQuizQuestions[activeQuizQuestions.length - 1] || null;
  }

  return QUIZ_ENGINE.getCurrentQuestion(quizState, activeQuizQuestions);
}

function moveExplorationPlayer(deltaX, deltaY) {
  if (
    campaignState.phase !== STORY_ENGINE.CAMPAIGN_PHASES.EXPLORATION ||
    !Number.isFinite(deltaX) ||
    !Number.isFinite(deltaY)
  ) {
    return;
  }

  const activeScene = STORY_ENGINE.getSceneByIndex(campaignState.sceneIndex);
  const nextX = Math.min(WORLD_MAP_WIDTH, Math.max(0, explorationState.playerX + deltaX));
  const nextY = Math.min(WORLD_MAP_HEIGHT, Math.max(0, explorationState.playerY + deltaY));
  const targetZone = getSceneAtPoint(nextX, nextY);

  if (targetZone && !isSceneUnlocked(targetZone, activeScene)) {
    return;
  }

  explorationState = {
    ...explorationState,
    playerX: nextX,
    playerY: nextY,
  };
  renderCampaignPhase();
}

function stopMovementRepeat() {
  if (movementRepeatId !== null) {
    window.clearInterval(movementRepeatId);
    movementRepeatId = null;
  }

  joystickMoveX = 0;
  joystickMoveY = 0;
}

function updateJoystickPosition(clientX, clientY) {
  const joystick = gameElements.movementJoystick;
  const thumb = gameElements.movementJoystickThumb;

  if (!joystick || !thumb) {
    return;
  }

  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxDistance = rect.width * 0.3;

  let offsetX = clientX - centerX;
  let offsetY = clientY - centerY;

  const distance = Math.hypot(offsetX, offsetY);

  if (distance > maxDistance) {
    const scale = maxDistance / distance;
    offsetX *= scale;
    offsetY *= scale;
  }

  thumb.style.transform =
    `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

  if (distance < 8) {
    joystickMoveX = 0;
    joystickMoveY = 0;
    return;
  }

  joystickMoveX = Math.sign(offsetX);
  joystickMoveY = Math.sign(offsetY);
}

function startJoystickMovement() {
  stopMovementRepeat();

  movementRepeatId = window.setInterval(() => {
    if (joystickMoveX === 0 && joystickMoveY === 0) {
      return;
    }

    moveExplorationPlayer(
      joystickMoveX * PLAYER_MOVE_STEP,
      joystickMoveY * PLAYER_MOVE_STEP,
    );
  }, 100);
}

function resetJoystick() {
  joystickPointerId = null;
  stopMovementRepeat();

  if (gameElements?.movementJoystickThumb) {
    gameElements.movementJoystickThumb.style.transform =
      "translate(-50%, -50%)";
  }
}

function handleJoystickPointerDown(event) {
  if (campaignState.phase !== STORY_ENGINE.CAMPAIGN_PHASES.EXPLORATION) {
    return;
  }

  joystickPointerId = event.pointerId;
  gameElements.movementJoystick.setPointerCapture(event.pointerId);

  updateJoystickPosition(event.clientX, event.clientY);
  startJoystickMovement();
}

function handleJoystickPointerMove(event) {
  if (event.pointerId !== joystickPointerId) {
    return;
  }

  updateJoystickPosition(event.clientX, event.clientY);
}

function handleJoystickPointerUp(event) {
  if (event.pointerId !== joystickPointerId) {
    return;
  }

  resetJoystick();
}

function handleExplorationKeydown(event) {
  if (campaignState.phase !== STORY_ENGINE.CAMPAIGN_PHASES.EXPLORATION) {
    return;
  }

  const movementByKey = {
    ArrowUp: [0, -PLAYER_MOVE_STEP],
    ArrowDown: [0, PLAYER_MOVE_STEP],
    ArrowLeft: [-PLAYER_MOVE_STEP, 0],
    ArrowRight: [PLAYER_MOVE_STEP, 0],
  };

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    handleStoryExplorationContinue();
    return;
  }

  const movement = movementByKey[event.key];
  if (!movement) {
    return;
  }

  event.preventDefault();
  moveExplorationPlayer(movement[0], movement[1]);
}

function renderHpPips(currentHp) {
  gameElements.quizHpPips.replaceChildren();

  for (let pipIndex = 0; pipIndex < QUIZ_ENGINE.MAX_HP; pipIndex += 1) {
    const pip = document.createElement("span");
    pip.className = "hp-pip";

    if (pipIndex < currentHp) {
      pip.classList.add("is-full");
    }

    gameElements.quizHpPips.append(pip);
  }

  gameElements.quizHpPips.setAttribute("aria-label", `HP ${currentHp} dari ${QUIZ_ENGINE.MAX_HP}`);
}

function updateQuizHud() {
  const totalQuestions = activeQuizQuestions.length || QUIZ_ENGINE.EXPECTED_QUESTION_COUNT;
  const completedCount =
    quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.RESULTS ? totalQuestions : quizState.quizProgress;
  const isTimerVisible = quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.QUIZ && !quizState.answerLocked;
  const hudQuestion = getHudQuestion();
  const mission = getMissionForQuestion(hudQuestion);

  if (quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.RESULTS) {
    gameElements.quizMission.textContent = "KAMPANYE SELESAI";
  } else if (mission) {
    gameElements.quizMission.textContent = mission.title;
  } else {
    gameElements.quizMission.textContent = "-";
  }

  gameElements.quizScore.textContent = `SCORE ${quizState.currentScore}`;
  gameElements.quizHp.textContent = `${quizState.currentHp}/${QUIZ_ENGINE.MAX_HP}`;
  gameElements.quizProgress.textContent = `${completedCount}/${totalQuestions}`;
  renderHpPips(quizState.currentHp);

  gameElements.quizHpStat.classList.toggle("is-low", quizState.currentHp <= 2);
  gameElements.quizTimerWrap.hidden = !isTimerVisible;
  gameElements.quizTimerWrap.classList.toggle("is-urgent", isTimerVisible && quizState.currentTimeRemaining <= 10);

  if (isTimerVisible) {
    gameElements.quizTimer.textContent = String(quizState.currentTimeRemaining);
    gameElements.quizTimer.setAttribute("aria-label", `Sisa waktu ${quizState.currentTimeRemaining} detik`);
  }
}

function stopQuestionTimer() {
  if (activeTimerId !== null) {
    window.clearInterval(activeTimerId);
    activeTimerId = null;
  }
}

function clearQuizFeedback() {
  gameElements.feedbackPanel.hidden = true;
  gameElements.feedbackStatus.textContent = EMPTY_MESSAGE;
  gameElements.feedbackExplanation.textContent = EMPTY_MESSAGE;
  gameElements.nextButton.hidden = true;
}

function renderChoices(question) {
  gameElements.choiceList.replaceChildren();

  question.choices.forEach((choice, choiceIndex) => {
    const choiceButton = document.createElement("button");
    const choiceLabel = document.createElement("span");
    const choiceText = document.createElement("span");

    choiceButton.type = "button";
    choiceButton.className = "choice-button";
    choiceButton.dataset.choiceIndex = String(choiceIndex);
    choiceButton.setAttribute("aria-label", `Pilihan ${choiceIndex + 1}: ${choice}`);

    choiceLabel.className = "choice-label";
    choiceLabel.textContent = String.fromCharCode(65 + choiceIndex);
    choiceText.className = "choice-text";
    choiceText.textContent = choice;

    choiceButton.append(choiceLabel, choiceText);
    choiceButton.addEventListener("click", handleAnswerSelection);
    gameElements.choiceList.append(choiceButton);
  });
}

function renderQuestion() {
  const question = QUIZ_ENGINE.getCurrentQuestion(quizState, activeQuizQuestions);

  if (!question) {
    showQuizDataError("SOAL AKTIF TIDAK DITEMUKAN. KEMBALI KE MENU DAN MULAI ULANG.");
    return;
  }

  gameElements.quizCard.hidden = false;
  gameElements.resultPanel.hidden = true;
  gameElements.quizContext.textContent = question.context;
  gameElements.quizTitle.textContent = question.title;
  gameElements.questionPrompt.textContent = question.prompt;
  clearQuizFeedback();
  renderChoices(question);
  updateQuizHud();
  startQuestionTimer();
}

function showQuizDataError(message) {
  if (isCampaignActive) {
    showCampaignError(message);
    return;
  }

  stopQuestionTimer();
  quizState = QUIZ_ENGINE.createInitialQuizState();
  activeQuizQuestions = [];
  showScreen("menu");
  setFormMessage(message);
  updateStartButton();
}

function renderAnswerFeedback(answerResult) {
  const choiceButtons = Array.from(gameElements.choiceList.querySelectorAll(".choice-button"));

  choiceButtons.forEach((choiceButton, choiceIndex) => {
    choiceButton.disabled = true;

    if (choiceIndex === answerResult.correctChoiceIndex) {
      choiceButton.classList.add("is-correct");
    }

    if (!answerResult.isCorrect && !answerResult.isTimeout && choiceIndex === quizState.selectedAnswerIndex) {
      choiceButton.classList.add("is-incorrect");
    }
  });

  gameElements.feedbackPanel.hidden = false;

  if (answerResult.isTimeout) {
    gameElements.feedbackStatus.textContent = `WAKTU HABIS. HP ${answerResult.hpAfterAnswer}/${QUIZ_ENGINE.MAX_HP}. +0 SCORE.`;
  } else if (answerResult.isCorrect) {
    gameElements.feedbackStatus.textContent = `BENAR. +${answerResult.earnedScore} SCORE (WAKTU +${answerResult.speedBonus}, HP +${answerResult.hpBonus}).`;
  } else {
    gameElements.feedbackStatus.textContent = `BELUM TEPAT. HP ${answerResult.hpAfterAnswer}/${QUIZ_ENGINE.MAX_HP}. +0 SCORE.`;
  }

  gameElements.feedbackExplanation.textContent = answerResult.explanation;

  const activeQuest = isCampaignActive ? STORY_ENGINE.getQuestById(campaignState.currentQuestId) : null;
  const isLastQuestQuestion =
    activeQuest && STORY_ENGINE.isLastQuestionInCurrentQuest(quizState, activeQuizQuestions, activeQuest);

  if (isLastQuestQuestion) {
    gameElements.nextButton.textContent = "CEK MISI";
  } else if (quizState.currentQuestionIndex === activeQuizQuestions.length - 1) {
    gameElements.nextButton.textContent = "LIHAT HASIL";
  } else {
    gameElements.nextButton.textContent = "SOAL BERIKUTNYA";
  }

  gameElements.nextButton.hidden = false;
  updateQuizHud();
}

function processTimeout() {
  stopQuestionTimer();
  const timeoutSubmission = QUIZ_ENGINE.submitTimeout(quizState, activeQuizQuestions);

  if (!timeoutSubmission.answerResult) {
    return;
  }

  quizState = timeoutSubmission.state;
  recordQuestAnswer(timeoutSubmission.answerResult);
  renderAnswerFeedback(timeoutSubmission.answerResult);
}

function startQuestionTimer() {
  stopQuestionTimer();
  updateQuizHud();

  activeTimerId = window.setInterval(() => {
    const timerTick = QUIZ_ENGINE.tickTimer(quizState);

    if (timerTick.state === quizState) {
      return;
    }

    quizState = timerTick.state;
    updateQuizHud();

    if (timerTick.timedOut) {
      processTimeout();
    }
  }, 1000);
}

function startCampaign() {
  stopQuestionTimer();
  stopMovementRepeat();
  activeQuizQuestions = getQuizQuestions();
  const validation = QUIZ_ENGINE.validateQuizQuestions(activeQuizQuestions);

  if (!validation.isValid) {
    setFormMessage(validation.error);
    return;
  }

  isCampaignActive = true;
  gameStartTime = performance.now();
  isResultSaved = false;
  campaignState = STORY_ENGINE.createInitialCampaignState();
  quizState = QUIZ_ENGINE.createInitialQuizState();
  explorationState = createInitialExplorationState();
  campaignState = STORY_ENGINE.startSceneFlow(campaignState);
  setFormMessage(EMPTY_MESSAGE);
  showScreen("story");
  renderCampaignPhase();
}

function startQuiz() {
  stopQuestionTimer();
  stopMovementRepeat();
  activeQuizQuestions = getQuizQuestions();
  const startResult = QUIZ_ENGINE.startQuiz(activeQuizQuestions);
  quizState = startResult.state;

  if (startResult.error) {
    setFormMessage(startResult.error);
    return;
  }

  isCampaignActive = false;
  setFormMessage(EMPTY_MESSAGE);
  showScreen("quiz");
  renderQuestion();
}

function handleAnswerSelection(event) {
  stopQuestionTimer();
  const selectedButton = event.currentTarget;
  const selectedAnswerIndex = Number(selectedButton.dataset.choiceIndex);
  const answerSubmission = QUIZ_ENGINE.submitAnswer(quizState, activeQuizQuestions, selectedAnswerIndex);

  if (!answerSubmission.answerResult) {
    return;
  }

  quizState = answerSubmission.state;
  recordQuestAnswer(answerSubmission.answerResult);
  renderAnswerFeedback(answerSubmission.answerResult);
}

function recordQuestAnswer(answerResult) {
  if (!isCampaignActive || !answerResult) {
    return;
  }

  const activeQuest = STORY_ENGINE.getQuestById(campaignState.currentQuestId);
  const currentQuestion = QUIZ_ENGINE.getCurrentQuestion(quizState, activeQuizQuestions);

  if (!activeQuest || !currentQuestion) {
    return;
  }

  campaignState = STORY_ENGINE.recordQuestAnswer(
    campaignState,
    activeQuest,
    currentQuestion.id,
    answerResult.isCorrect,
  );
}

function renderResults() {
  stopQuestionTimer();
  gameElements.quizCard.hidden = true;
  gameElements.resultPanel.hidden = false;
  updateQuizHud();
  gameElements.resultSummary.textContent = `KAMU MENYELESAIKAN ${quizState.quizProgress}/${activeQuizQuestions.length} SOAL DENGAN SCORE ${quizState.currentScore}. HP TERSISA ${quizState.currentHp}/${QUIZ_ENGINE.MAX_HP}.`;
}

function handleNextQuestion() {
  stopQuestionTimer();

  if (isCampaignActive) {
    const activeQuest = STORY_ENGINE.getQuestById(campaignState.currentQuestId);

    if (
      activeQuest &&
      quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.FEEDBACK &&
      STORY_ENGINE.isLastQuestionInCurrentQuest(quizState, activeQuizQuestions, activeQuest)
    ) {
      const questResolution = STORY_ENGINE.resolveQuestAfterSegment(campaignState, activeQuest, quizState);
      campaignState = questResolution.campaignState;
      if (questResolution.quizState) {
        quizState = questResolution.quizState;
      }
      showScreen("story");
      renderCampaignPhase();
      return;
    }
  }

  const nextState = QUIZ_ENGINE.advanceQuiz(quizState, activeQuizQuestions);

  if (nextState === quizState) {
    return;
  }

  quizState = nextState;

  if (quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.RESULTS) {
    renderResults();
    return;
  }

  renderQuestion();
}

function returnToMenu() {
  stopQuestionTimer();
  stopMovementRepeat();
  gameStartTime = null;
  isResultSaved = false;
  isCampaignActive = false;
  campaignState = STORY_ENGINE.createInitialCampaignState();
  quizState = QUIZ_ENGINE.createInitialQuizState();
  activeQuizQuestions = [];
  explorationState = createInitialExplorationState();
  gameElements.playerForm.reset();
  setFormMessage(EMPTY_MESSAGE);
  updateStartButton();
  showScreen("menu");
  gameElements.playerNameInput.focus();
}

function showScreen(screenName) {
  gameElements.menuScreen.hidden = screenName !== "menu";
  gameElements.storyScreen.hidden = screenName !== "story";
  gameElements.quizScreen.hidden = screenName !== "quiz";
  gameElements.leaderboardScreen.hidden = screenName !== "leaderboard";
}

async function showLeaderboard() {
  showScreen("leaderboard");
  
  gameElements.leaderboardLoading.hidden = false;
  gameElements.leaderboardEntries.hidden = true;
  gameElements.leaderboardEmpty.hidden = true;
  
  try {
    const leaderboardData = await getLeaderboard(10);
    
    gameElements.leaderboardLoading.hidden = true;
    
    if (leaderboardData.length === 0) {
      gameElements.leaderboardEmpty.hidden = false;
      return;
    }
    
    gameElements.leaderboardEntries.replaceChildren();
    
    leaderboardData.forEach((entry, index) => {
      const rowElement = document.createElement("div");
      rowElement.className = "leaderboard-row";
      
      const rankElement = document.createElement("span");
      rankElement.className = "leaderboard-rank";
      rankElement.textContent = `#${index + 1}`;
      
      const nameElement = document.createElement("span");
      nameElement.className = "leaderboard-name";
      nameElement.textContent = entry.name;
      
      const scoreElement = document.createElement("span");
      scoreElement.className = "leaderboard-score";
      scoreElement.textContent = entry.score.toLocaleString("id-ID");
      
      const timeElement = document.createElement("span");
      timeElement.className = "leaderboard-time";
      timeElement.textContent = formatTime(entry.totalTime);
      
      rowElement.append(rankElement, nameElement, scoreElement, timeElement);
      gameElements.leaderboardEntries.append(rowElement);
    });
    
    gameElements.leaderboardEntries.hidden = false;
  } catch (error) {
    console.error("GAGAL MEMUAT LEADERBOARD:", error);
    gameElements.leaderboardLoading.hidden = true;
    gameElements.leaderboardEmpty.hidden = false;
  }
}

function formatTime(seconds) {
  if (typeof seconds !== "number" || seconds < 0) {
    return "-";
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  
  return `${secs}s`;
}

function returnToMenuFromLeaderboard() {
  showScreen("menu");
  gameElements.playerNameInput.focus();
}

function initializeGame() {
  gameElements = {
    menuScreen: document.querySelector("#menu-screen"),
    storyScreen: document.querySelector("#story-screen"),
    quizScreen: document.querySelector("#quiz-screen"),
    playerForm: document.querySelector("#player-form"),
    playerNameInput: document.querySelector("#player-name"),
    startButton: document.querySelector("#start-button"),
    leaderboardButton: document.querySelector("#leaderboard-button"),
    formMessage: document.querySelector("#form-message"),
    storyScore: document.querySelector("#story-score"),
    storyScenePanel: document.querySelector("#story-scene-panel"),
    storySceneLabel: document.querySelector("#story-scene-label"),
    storySceneName: document.querySelector("#story-scene-name"),
    storySceneCopy: document.querySelector("#story-scene-copy"),
    storySceneButton: document.querySelector("#story-scene-button"),
    storyExplorationPanel: document.querySelector("#story-exploration-panel"),
    storyExplorationZone: document.querySelector("#story-exploration-zone"),
    storyExplorationTarget: document.querySelector("#story-exploration-target"),
    storyExplorationHint: document.querySelector("#story-exploration-hint"),
    storyWorldMap: document.querySelector("#story-world-map"),
    storyWorldZones: document.querySelector("#story-world-zones"),
    storyWorldInteraction: document.querySelector("#story-world-interaction"),
    storyWorldPlayer: document.querySelector("#story-world-player"),
    movementJoystick: document.querySelector("#movement-joystick"),
    movementJoystickThumb: document.querySelector("#movement-joystick-thumb"),
    storyExplorationButton: document.querySelector("#story-exploration-button"),
    storyInteractionPanel: document.querySelector("#story-interaction-panel"),
    storyInteractionAccent: document.querySelector("#story-interaction-accent"),
    storyInteractionRole: document.querySelector("#story-interaction-role"),
    storyInteractionName: document.querySelector("#story-interaction-name"),
    storyInteractionCopy: document.querySelector("#story-interaction-copy"),
    storyInteractionButton: document.querySelector("#story-interaction-button"),
    storyDialoguePanel: document.querySelector("#story-dialogue-panel"),
    storyDialogueSpeakerRole: document.querySelector("#story-dialogue-speaker-role"),
    storyDialogueSpeakerName: document.querySelector("#story-dialogue-speaker-name"),
    storyDialogueText: document.querySelector("#story-dialogue-text"),
    storyDialogueButton: document.querySelector("#story-dialogue-button"),
    storyQuestPanel: document.querySelector("#story-quest-panel"),
    storyQuestTitle: document.querySelector("#story-quest-title"),
    storyQuestBriefing: document.querySelector("#story-quest-briefing"),
    storyQuestObjective: document.querySelector("#story-quest-objective"),
    storyQuestButton: document.querySelector("#story-quest-button"),
    storyRewardPanel: document.querySelector("#story-reward-panel"),
    storyRewardTitle: document.querySelector("#story-reward-title"),
    storyRewardSummary: document.querySelector("#story-reward-summary"),
    storyRewardButton: document.querySelector("#story-reward-button"),
    storyEndingPanel: document.querySelector("#story-ending-panel"),
    storyEndingSummary: document.querySelector("#story-ending-summary"),
    storyEndingBadges: document.querySelector("#story-ending-badges"),
    storyEndingButton: document.querySelector("#story-ending-button"),
    quizScore: document.querySelector("#quiz-score"),
    quizMission: document.querySelector("#quiz-mission"),
    quizProgress: document.querySelector("#quiz-progress"),
    quizHp: document.querySelector("#quiz-hp"),
    quizHpStat: document.querySelector("#quiz-hp-stat"),
    quizHpPips: document.querySelector("#quiz-hp-pips"),
    quizTimerWrap: document.querySelector("#quiz-timer-wrap"),
    quizTimer: document.querySelector("#quiz-timer"),
    quizCard: document.querySelector("#quiz-card"),
    quizContext: document.querySelector("#quiz-context"),
    quizTitle: document.querySelector("#quiz-title"),
    questionPrompt: document.querySelector("#question-prompt"),
    choiceList: document.querySelector("#choice-list"),
    feedbackPanel: document.querySelector("#feedback-panel"),
    feedbackStatus: document.querySelector("#feedback-status"),
    feedbackExplanation: document.querySelector("#feedback-explanation"),
    nextButton: document.querySelector("#next-button"),
    resultPanel: document.querySelector("#result-panel"),
    resultSummary: document.querySelector("#result-summary"),
    returnMenuButton: document.querySelector("#return-menu-button"),
    leaderboardScreen: document.querySelector("#leaderboard-screen"),
    leaderboardContent: document.querySelector("#leaderboard-content"),
    leaderboardEntries: document.querySelector("#leaderboard-entries"),
    leaderboardLoading: document.querySelector("#leaderboard-loading"),
    leaderboardEmpty: document.querySelector("#leaderboard-empty"),
    leaderboardBackButton: document.querySelector("#leaderboard-back-button"),
  };

  if (Object.values(gameElements).some((element) => !element)) {
    return;
  }

  gameElements.playerNameInput.addEventListener("input", () => {
    setFormMessage(EMPTY_MESSAGE);
    updateStartButton();
  });

  gameElements.playerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const playerName = normalizePlayerName(gameElements.playerNameInput.value);

    if (playerName.length < MINIMUM_PLAYER_NAME_LENGTH) {
      setFormMessage("CALLSIGN MEMERLUKAN MINIMAL 2 KARAKTER.");
      gameElements.playerNameInput.focus();
      return;
    }

    document.documentElement.dataset.playerName = playerName;
    startCampaign();
  });

  gameElements.leaderboardButton.addEventListener("click", showLeaderboard);
  gameElements.leaderboardBackButton.addEventListener("click", returnToMenuFromLeaderboard);

  gameElements.storySceneButton.addEventListener("click", handleStorySceneContinue);
  gameElements.storyExplorationButton.addEventListener("click", handleStoryExplorationContinue);
  gameElements.storyInteractionButton.addEventListener("click", handleStoryInteractionContinue);
  gameElements.storyDialogueButton.addEventListener("click", handleStoryDialogueContinue);
  gameElements.storyQuestButton.addEventListener("click", handleStoryQuestContinue);
  gameElements.storyRewardButton.addEventListener("click", handleStoryRewardContinue);
  gameElements.storyEndingButton.addEventListener("click", returnToMenu);

  gameElements.movementJoystick.addEventListener(
    "pointerdown",
    handleJoystickPointerDown,
  );

  gameElements.movementJoystick.addEventListener(
    "pointermove",
    handleJoystickPointerMove,
  );

  gameElements.movementJoystick.addEventListener(
    "pointerup",
    handleJoystickPointerUp,
  );

  gameElements.movementJoystick.addEventListener(
    "pointercancel",
    handleJoystickPointerUp,
  );

  gameElements.nextButton.addEventListener("click", handleNextQuestion);
  gameElements.returnMenuButton.addEventListener("click", returnToMenu);
  document.addEventListener("keydown", handleExplorationKeydown);
  updateStartButton();
}

document.addEventListener("DOMContentLoaded", initializeGame);
