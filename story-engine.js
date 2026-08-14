"use strict";

const CAMPAIGN_PHASES = Object.freeze({
  SCENE: "SCENE",
  EXPLORATION: "EXPLORATION",
  INTERACTION: "INTERACTION",
  DIALOGUE: "DIALOGUE",
  QUEST: "QUEST",
  REWARD: "REWARD",
  COMPLETE_DIALOGUE: "COMPLETE_DIALOGUE",
  ENDING: "ENDING",
});

function getScenes() {
  return typeof scenes !== "undefined" && Array.isArray(scenes) ? scenes : [];
}

function getQuestsList() {
  return typeof quests !== "undefined" && Array.isArray(quests) ? quests : [];
}

function getCharactersList() {
  return typeof characters !== "undefined" && Array.isArray(characters) ? characters : [];
}

function getDialoguesMap() {
  return typeof dialogues !== "undefined" && dialogues && typeof dialogues === "object" ? dialogues : {};
}

function getOrderedScenes() {
  return [...getScenes()].sort((sceneA, sceneB) => sceneA.order - sceneB.order);
}

function getCharacterById(characterId) {
  if (typeof characterId !== "string") {
    return null;
  }

  return getCharactersList().find((character) => character.id === characterId) || null;
}

function getDialogueLines(dialogueId) {
  if (typeof dialogueId !== "string") {
    return [];
  }

  const dialogueLines = getDialoguesMap()[dialogueId];
  return Array.isArray(dialogueLines) ? dialogueLines : [];
}

function getSceneByIndex(sceneIndex) {
  const orderedScenes = getOrderedScenes();

  if (!Number.isInteger(sceneIndex) || sceneIndex < 0 || sceneIndex >= orderedScenes.length) {
    return null;
  }

  return orderedScenes[sceneIndex] || null;
}

function getQuestForScene(scene) {
  if (!scene || typeof scene.id !== "string") {
    return null;
  }

  return getQuestsList().find((quest) => quest.sceneId === scene.id) || null;
}

function getQuestById(questId) {
  if (typeof questId !== "string") {
    return null;
  }

  return getQuestsList().find((quest) => quest.id === questId) || null;
}

function getRequiredCorrectAnswers(quest) {
  if (!quest?.objective) {
    return 0;
  }

  if (Number.isInteger(quest.objective.requiredCorrectAnswers) && quest.objective.requiredCorrectAnswers >= 0) {
    return quest.objective.requiredCorrectAnswers;
  }

  return Array.isArray(quest.objective.questionIds) ? quest.objective.questionIds.length : 0;
}

function getQuestQuestions(quest, quizQuestions) {
  if (!quest || !quest.objective || !Array.isArray(quest.objective.questionIds) || !Array.isArray(quizQuestions)) {
    return [];
  }

  return quest.objective.questionIds
    .map((questionId) => quizQuestions.find((question) => question.id === questionId) || null)
    .filter(Boolean);
}

function getQuestQuestionStartIndex(quest, quizQuestions) {
  const questQuestions = getQuestQuestions(quest, quizQuestions);

  if (questQuestions.length === 0 || !Array.isArray(quizQuestions)) {
    return -1;
  }

  return quizQuestions.findIndex((question) => question.id === questQuestions[0].id);
}

function getInteractionSpeakerId(scene) {
  const dialogueLines = getDialogueLines(scene?.dialogueId);

  if (dialogueLines.length > 0 && typeof dialogueLines[0].speakerId === "string") {
    return dialogueLines[0].speakerId;
  }

  const quest = getQuestForScene(scene);
  const completionLines = getDialogueLines(quest?.completionDialogueId);

  if (completionLines.length > 0 && typeof completionLines[0].speakerId === "string") {
    return completionLines[0].speakerId;
  }

  return "aruna";
}

function createInitialCampaignState() {
  return {
    phase: CAMPAIGN_PHASES.SCENE,
    sceneIndex: 0,
    dialogueLineIndex: 0,
    activeDialogueId: null,
    interactionSpeakerId: null,
    currentQuestId: null,
    completedQuestIds: [],
    earnedBadges: [],
    totalXp: 0,
    questAttempts: {},
    isCampaignComplete: false,
  };
}

function enterScenePhase(campaignState) {
  const scene = getSceneByIndex(campaignState.sceneIndex);

  if (!scene) {
    return {
      ...campaignState,
      phase: CAMPAIGN_PHASES.ENDING,
      isCampaignComplete: true,
    };
  }

  const quest = getQuestForScene(scene);

  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.SCENE,
    dialogueLineIndex: 0,
    activeDialogueId: null,
    interactionSpeakerId: getInteractionSpeakerId(scene),
    currentQuestId: quest ? quest.id : null,
  };
}

function beginInteraction(campaignState) {
  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.INTERACTION,
  };
}

function beginExploration(campaignState) {
  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.EXPLORATION,
  };
}

function beginDialogue(campaignState, dialogueId, dialoguePhase = CAMPAIGN_PHASES.DIALOGUE) {
  const dialogueLines = getDialogueLines(dialogueId);

  if (dialogueLines.length === 0) {
    return advanceAfterDialogue({
      ...campaignState,
      phase: dialoguePhase,
    });
  }

  return {
    ...campaignState,
    phase: dialoguePhase,
    dialogueLineIndex: 0,
    activeDialogueId: dialogueId,
  };
}

function advanceDialogue(campaignState) {
  const dialogueLines = getDialogueLines(campaignState.activeDialogueId);
  const nextLineIndex = campaignState.dialogueLineIndex + 1;

  if (nextLineIndex < dialogueLines.length) {
    return {
      ...campaignState,
      dialogueLineIndex: nextLineIndex,
    };
  }

  return advanceAfterDialogue(campaignState);
}

function advanceAfterDialogue(campaignState) {
  const scene = getSceneByIndex(campaignState.sceneIndex);
  const quest = getQuestForScene(scene);

  if (campaignState.phase === CAMPAIGN_PHASES.COMPLETE_DIALOGUE) {
    return advanceToNextScene(campaignState);
  }

  if (quest && campaignState.activeDialogueId === scene?.dialogueId) {
    return {
      ...campaignState,
      phase: CAMPAIGN_PHASES.QUEST,
      dialogueLineIndex: 0,
      activeDialogueId: null,
      currentQuestId: quest.id,
    };
  }

  if (scene?.id === "nexus-core") {
    return {
      ...campaignState,
      phase: CAMPAIGN_PHASES.ENDING,
      isCampaignComplete: true,
      dialogueLineIndex: 0,
      activeDialogueId: null,
    };
  }

  return advanceToNextScene(campaignState);
}

function advanceToNextScene(campaignState) {
  const nextSceneIndex = campaignState.sceneIndex + 1;
  const nextScene = getSceneByIndex(nextSceneIndex);

  if (!nextScene) {
    return {
      ...campaignState,
      phase: CAMPAIGN_PHASES.ENDING,
      isCampaignComplete: true,
    };
  }

  return enterScenePhase({
    ...campaignState,
    sceneIndex: nextSceneIndex,
  });
}

function beginQuestPhase(campaignState) {
  const quest = getQuestById(campaignState.currentQuestId);

  if (!quest) {
    return advanceToNextScene(campaignState);
  }

  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.QUEST,
    currentQuestId: quest.id,
  };
}

function beginQuestQuiz(campaignState, quizState, quizQuestions) {
  const quest = getQuestById(campaignState.currentQuestId);

  if (!quest) {
    return { campaignState, quizState, error: "MISI AKTIF TIDAK DITEMUKAN." };
  }

  const startIndex = getQuestQuestionStartIndex(quest, quizQuestions);

  if (startIndex < 0) {
    return { campaignState, quizState, error: "SOAL MISI TIDAK DITEMUKAN." };
  }

  if (campaignState.completedQuestIds.length === 0 && quizState.currentGameState === QUIZ_ENGINE.GAME_STATES.MENU) {
    const startResult = QUIZ_ENGINE.startQuiz(quizQuestions);

    if (startResult.error) {
      return { campaignState, quizState, error: startResult.error };
    }

    return {
      campaignState: resetQuestAttempt(campaignState, quest, quizState),
      quizState: startResult.state,
      error: null,
    };
  }

  const segmentResult = QUIZ_ENGINE.prepareQuizSegment(quizState, quizQuestions, startIndex);

  if (segmentResult.error) {
    return { campaignState, quizState, error: segmentResult.error };
  }

  return {
    campaignState: resetQuestAttempt(campaignState, quest, quizState),
    quizState: segmentResult.state,
    error: null,
  };
}

function isLastQuestionInCurrentQuest(quizState, quizQuestions, quest) {
  const currentQuestion = QUIZ_ENGINE.getCurrentQuestion(quizState, quizQuestions);
  const questQuestions = getQuestQuestions(quest, quizQuestions);

  if (!currentQuestion || questQuestions.length === 0) {
    return false;
  }

  return currentQuestion.id === questQuestions[questQuestions.length - 1].id;
}

function completeQuest(campaignState, quest) {
  if (!quest) {
    return campaignState;
  }

  const completedQuestIds = campaignState.completedQuestIds.includes(quest.id)
    ? campaignState.completedQuestIds
    : [...campaignState.completedQuestIds, quest.id];
  const earnedBadges = campaignState.earnedBadges.includes(quest.rewards.badge)
    ? campaignState.earnedBadges
    : [...campaignState.earnedBadges, quest.rewards.badge];

  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.REWARD,
    completedQuestIds,
    earnedBadges,
    totalXp: campaignState.totalXp + (Number.isFinite(quest.rewards.xp) ? quest.rewards.xp : 0),
    dialogueLineIndex: 0,
    activeDialogueId: null,
  };
}

function getQuestAttempt(campaignState, questId) {
  if (!campaignState || typeof questId !== "string") {
    return null;
  }

  const questAttempt = campaignState.questAttempts?.[questId];
  return questAttempt && typeof questAttempt === "object" ? questAttempt : null;
}

function resetQuestAttempt(campaignState, quest, quizState = null) {
  if (!quest) {
    return campaignState;
  }

  const startScore = quizState && Number.isFinite(quizState.currentScore) ? quizState.currentScore : null;

  return {
    ...campaignState,
    questAttempts: {
      ...campaignState.questAttempts,
      [quest.id]: {
        answeredQuestionIds: [],
        correctAnswers: 0,
        lastAttemptCorrectAnswers: 0,
        lastAttemptPassed: null,
        startScore,
      },
    },
  };
}

function recordQuestAnswer(campaignState, quest, questionId, isCorrect) {
  if (!quest || typeof questionId !== "string") {
    return campaignState;
  }

  const currentAttempt = getQuestAttempt(campaignState, quest.id) || {
    answeredQuestionIds: [],
    correctAnswers: 0,
    lastAttemptCorrectAnswers: 0,
    lastAttemptPassed: null,
  };

  if (
    currentAttempt.answeredQuestionIds.includes(questionId) ||
    !Array.isArray(quest.objective?.questionIds) ||
    !quest.objective.questionIds.includes(questionId)
  ) {
    return campaignState;
  }

  return {
    ...campaignState,
    questAttempts: {
      ...campaignState.questAttempts,
      [quest.id]: {
        ...currentAttempt,
        answeredQuestionIds: [...currentAttempt.answeredQuestionIds, questionId],
        correctAnswers: currentAttempt.correctAnswers + (isCorrect ? 1 : 0),
      },
    },
  };
}

function resolveQuestAfterSegment(campaignState, quest, quizState = null) {
  if (!quest) {
    return quizState ? { campaignState, quizState } : campaignState;
  }

  const currentAttempt = getQuestAttempt(campaignState, quest.id) || {
    answeredQuestionIds: [],
    correctAnswers: 0,
    lastAttemptCorrectAnswers: 0,
    lastAttemptPassed: null,
    startScore: null,
  };

  const updatedCampaignState = {
    ...campaignState,
    phase: campaignState.phase,
    dialogueLineIndex: 0,
    activeDialogueId: null,
    questAttempts: {
      ...campaignState.questAttempts,
      [quest.id]: {
        ...currentAttempt,
        lastAttemptCorrectAnswers: currentAttempt.correctAnswers,
        lastAttemptPassed: true,
      },
    },
  };

  return {
    campaignState: completeQuest(updatedCampaignState, quest),
    quizState,
  };
}

function beginRewardPhase(campaignState) {
  return {
    ...campaignState,
    phase: CAMPAIGN_PHASES.REWARD,
  };
}

function advanceFromReward(campaignState) {
  const quest = getQuestById(campaignState.currentQuestId);
  const completionDialogueId = quest?.completionDialogueId;

  if (completionDialogueId && getDialogueLines(completionDialogueId).length > 0) {
    return beginDialogue(campaignState, completionDialogueId, CAMPAIGN_PHASES.COMPLETE_DIALOGUE);
  }

  return advanceToNextScene(campaignState);
}

function getCurrentDialogueLine(campaignState) {
  const dialogueLines = getDialogueLines(campaignState.activeDialogueId);

  if (!Number.isInteger(campaignState.dialogueLineIndex) || campaignState.dialogueLineIndex < 0) {
    return null;
  }

  return dialogueLines[campaignState.dialogueLineIndex] || null;
}

function getCurrentSceneView(campaignState) {
  const scene = getSceneByIndex(campaignState.sceneIndex);
  const quest = getQuestById(campaignState.currentQuestId) || getQuestForScene(scene);
  const dialogueLine = getCurrentDialogueLine(campaignState);
  const speaker = dialogueLine ? getCharacterById(dialogueLine.speakerId) : getCharacterById(campaignState.interactionSpeakerId);

  return {
    scene,
    quest,
    questAttempt: quest ? getQuestAttempt(campaignState, quest.id) : null,
    dialogueLine,
    speaker,
    interactionSpeaker: getCharacterById(campaignState.interactionSpeakerId),
  };
}

function startSceneFlow(campaignState) {
  const scene = getSceneByIndex(campaignState.sceneIndex);

  if (!scene) {
    return {
      ...campaignState,
      phase: CAMPAIGN_PHASES.ENDING,
      isCampaignComplete: true,
    };
  }

  return enterScenePhase({
    ...campaignState,
    sceneIndex: campaignState.sceneIndex,
  });
}

function handleSceneContinue(campaignState) {
  const scene = getSceneByIndex(campaignState.sceneIndex);

  if (!scene || !scene.dialogueId) {
    return advanceToNextScene(campaignState);
  }

  return beginDialogue(campaignState, scene.dialogueId);
}

const STORY_ENGINE = Object.freeze({
  CAMPAIGN_PHASES,
  createInitialCampaignState,
  getOrderedScenes,
  getSceneByIndex,
  getQuestForScene,
  getQuestById,
  getQuestQuestions,
  getQuestQuestionStartIndex,
  getCharacterById,
  getDialogueLines,
  getCurrentSceneView,
  startSceneFlow,
  handleSceneContinue,
  beginInteraction,
  beginExploration,
  beginDialogue,
  advanceDialogue,
  beginQuestPhase,
  beginQuestQuiz,
  isLastQuestionInCurrentQuest,
  getRequiredCorrectAnswers,
  getQuestAttempt,
  recordQuestAnswer,
  resolveQuestAfterSegment,
  completeQuest,
  advanceFromReward,
  advanceToNextScene,
});
