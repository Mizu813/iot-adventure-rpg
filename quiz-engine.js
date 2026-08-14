"use strict";

const GAME_STATES = Object.freeze({
  MENU: "MENU",
  QUIZ: "QUIZ",
  FEEDBACK: "FEEDBACK",
  RESULTS: "RESULTS",
});

const BASE_SCORE_BY_DIFFICULTY = Object.freeze({
  MUDAH: 100,
  SEDANG: 150,
  SULIT: 200,
});

const EXPECTED_QUESTION_COUNT = 10;
const EXPECTED_CHOICE_COUNT = 4;
const QUESTION_TIME_LIMIT = 45;
const MAX_HP = 7;
const MIN_HP = 0;
const HP_BONUS_MULTIPLIER = 30;
const SPEED_BONUS_MAXIMUM = 50;

function createInitialQuizState() {
  return {
    currentGameState: GAME_STATES.MENU,
    currentQuestionIndex: 0,
    selectedAnswerIndex: null,
    answerLocked: false,
    currentScore: 0,
    currentHp: MAX_HP,
    currentTimeRemaining: QUESTION_TIME_LIMIT,
    quizProgress: 0,
  };
}

function getBaseScore(difficulty) {
  const baseScore = BASE_SCORE_BY_DIFFICULTY[difficulty];
  return Number.isFinite(baseScore) ? baseScore : null;
}

function clampHp(hp) {
  if (!Number.isFinite(hp)) {
    return MAX_HP;
  }

  return Math.min(MAX_HP, Math.max(MIN_HP, hp));
}

function clampTimeRemaining(timeRemaining) {
  if (!Number.isFinite(timeRemaining)) {
    return QUESTION_TIME_LIMIT;
  }

  return Math.min(QUESTION_TIME_LIMIT, Math.max(0, timeRemaining));
}

function calculateSpeedBonus(timeRemaining) {
  const safeTimeRemaining = clampTimeRemaining(timeRemaining);
  return Math.round(SPEED_BONUS_MAXIMUM * (safeTimeRemaining / QUESTION_TIME_LIMIT));
}

function calculateHpBonus(currentHp) {
  return Math.round(HP_BONUS_MULTIPLIER * (clampHp(currentHp) / MAX_HP));
}

function getQuestionValidationError(question, expectedOrder) {
  if (!question || typeof question !== "object") {
    return "DATA SOAL TIDAK VALID.";
  }

  if (
    typeof question.id !== "string" ||
    question.order !== expectedOrder ||
    typeof question.title !== "string" ||
    typeof question.context !== "string" ||
    typeof question.prompt !== "string" ||
    typeof question.explanation !== "string" ||
    !Array.isArray(question.choices) ||
    question.choices.length !== EXPECTED_CHOICE_COUNT ||
    !Number.isInteger(question.correctChoiceIndex) ||
    question.correctChoiceIndex < 0 ||
    question.correctChoiceIndex >= EXPECTED_CHOICE_COUNT ||
    question.timeLimit !== QUESTION_TIME_LIMIT ||
    getBaseScore(question.difficulty) === null
  ) {
    return "KONTRAK DATA SOAL TIDAK LENGKAP.";
  }

  const hasInvalidChoice = question.choices.some((choice) => typeof choice !== "string" || choice.trim().length === 0);

  if (
    question.id.trim().length === 0 ||
    question.title.trim().length === 0 ||
    question.context.trim().length === 0 ||
    question.prompt.trim().length === 0 ||
    question.explanation.trim().length === 0 ||
    hasInvalidChoice
  ) {
    return "ISI DATA SOAL TIDAK VALID.";
  }

  return null;
}

function validateQuizQuestions(quizQuestions) {
  if (!Array.isArray(quizQuestions) || quizQuestions.length !== EXPECTED_QUESTION_COUNT) {
    return { isValid: false, error: "DATA QUIZ HARUS BERISI 10 SOAL." };
  }

  const questionIds = new Set();

  for (let questionIndex = 0; questionIndex < quizQuestions.length; questionIndex += 1) {
    const question = quizQuestions[questionIndex];
    const validationError = getQuestionValidationError(question, questionIndex + 1);

    if (validationError) {
      return { isValid: false, error: validationError };
    }

    if (questionIds.has(question.id)) {
      return { isValid: false, error: "ID SOAL HARUS UNIK." };
    }

    questionIds.add(question.id);
  }

  return { isValid: true, error: null };
}

function getCurrentQuestion(quizState, quizQuestions) {
  if (!quizState || !Array.isArray(quizQuestions)) {
    return null;
  }

  const questionIndex = quizState.currentQuestionIndex;

  if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= quizQuestions.length) {
    return null;
  }

  return quizQuestions[questionIndex] || null;
}

function startQuiz(quizQuestions) {
  const validation = validateQuizQuestions(quizQuestions);

  if (!validation.isValid) {
    return { state: createInitialQuizState(), error: validation.error };
  }

  return {
    state: {
      ...createInitialQuizState(),
      currentGameState: GAME_STATES.QUIZ,
    },
    error: null,
  };
}

function processQuestionResult(quizState, quizQuestions, answerIndex, isTimeout) {
  if (
    !quizState ||
    quizState.currentGameState !== GAME_STATES.QUIZ ||
    quizState.answerLocked ||
    (!isTimeout && (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= EXPECTED_CHOICE_COUNT))
  ) {
    return { state: quizState, answerResult: null };
  }

  const question = getCurrentQuestion(quizState, quizQuestions);

  if (!question) {
    return { state: quizState, answerResult: null };
  }

  const isCorrect = !isTimeout && answerIndex === question.correctChoiceIndex;
  const baseScore = isCorrect ? getBaseScore(question.difficulty) : 0;

  if (baseScore === null) {
    return { state: quizState, answerResult: null };
  }

  const currentHp = clampHp(quizState.currentHp);
  const updatedHp = isCorrect ? currentHp : clampHp(currentHp - 1);
  const timeRemaining = isTimeout ? 0 : clampTimeRemaining(quizState.currentTimeRemaining);
  const speedBonus = isCorrect ? calculateSpeedBonus(timeRemaining) : 0;
  const hpBonus = isCorrect ? calculateHpBonus(updatedHp) : 0;
  const earnedScore = isCorrect ? baseScore + speedBonus + hpBonus : 0;
  const currentScore = Number.isFinite(quizState.currentScore) && quizState.currentScore >= 0 ? quizState.currentScore : 0;

  return {
    state: {
      ...quizState,
      currentGameState: GAME_STATES.FEEDBACK,
      selectedAnswerIndex: isTimeout ? null : answerIndex,
      answerLocked: true,
      currentScore: currentScore + earnedScore,
      currentHp: updatedHp,
      currentTimeRemaining: timeRemaining,
      quizProgress: quizState.currentQuestionIndex + 1,
    },
    answerResult: {
      isCorrect,
      isTimeout,
      earnedScore,
      baseScore,
      speedBonus,
      hpBonus,
      hpAfterAnswer: updatedHp,
      timeRemaining,
      correctChoiceIndex: question.correctChoiceIndex,
      explanation: question.explanation,
    },
  };
}

function submitAnswer(quizState, quizQuestions, answerIndex) {
  return processQuestionResult(quizState, quizQuestions, answerIndex, false);
}

function submitTimeout(quizState, quizQuestions) {
  return processQuestionResult(quizState, quizQuestions, null, true);
}

function tickTimer(quizState) {
  if (!quizState || quizState.currentGameState !== GAME_STATES.QUIZ || quizState.answerLocked) {
    return { state: quizState, timedOut: false };
  }

  const currentTimeRemaining = clampTimeRemaining(quizState.currentTimeRemaining);
  const nextTimeRemaining = Math.max(0, currentTimeRemaining - 1);

  return {
    state: {
      ...quizState,
      currentTimeRemaining: nextTimeRemaining,
    },
    timedOut: nextTimeRemaining === 0,
  };
}

function prepareQuizSegment(quizState, quizQuestions, startQuestionIndex) {
  const validation = validateQuizQuestions(quizQuestions);

  if (!validation.isValid) {
    return { state: createInitialQuizState(), error: validation.error };
  }

  if (!Number.isInteger(startQuestionIndex) || startQuestionIndex < 0 || startQuestionIndex >= quizQuestions.length) {
    return { state: quizState, error: "INDEX SOAL MISI TIDAK VALID." };
  }

  return {
    state: {
      ...quizState,
      currentGameState: GAME_STATES.QUIZ,
      currentQuestionIndex: startQuestionIndex,
      selectedAnswerIndex: null,
      answerLocked: false,
      currentTimeRemaining: QUESTION_TIME_LIMIT,
    },
    error: null,
  };
}

function advanceQuiz(quizState, quizQuestions) {
  if (!quizState || !Array.isArray(quizQuestions) || quizState.currentGameState !== GAME_STATES.FEEDBACK || !quizState.answerLocked) {
    return quizState;
  }

  const isLastQuestion = quizState.currentQuestionIndex === quizQuestions.length - 1;

  if (isLastQuestion) {
    return {
      ...quizState,
      currentGameState: GAME_STATES.RESULTS,
    };
  }

  const nextQuestionIndex = quizState.currentQuestionIndex + 1;

  if (nextQuestionIndex < 0 || nextQuestionIndex >= quizQuestions.length) {
    return quizState;
  }

  return {
    ...quizState,
    currentGameState: GAME_STATES.QUIZ,
    currentQuestionIndex: nextQuestionIndex,
    selectedAnswerIndex: null,
    answerLocked: false,
    currentTimeRemaining: QUESTION_TIME_LIMIT,
  };
}

const QUIZ_ENGINE = Object.freeze({
  GAME_STATES,
  BASE_SCORE_BY_DIFFICULTY,
  EXPECTED_QUESTION_COUNT,
  QUESTION_TIME_LIMIT,
  MAX_HP,
  MIN_HP,
  HP_BONUS_MULTIPLIER,
  SPEED_BONUS_MAXIMUM,
  createInitialQuizState,
  calculateSpeedBonus,
  calculateHpBonus,
  validateQuizQuestions,
  getCurrentQuestion,
  startQuiz,
  prepareQuizSegment,
  submitAnswer,
  submitTimeout,
  tickTimer,
  advanceQuiz,
});
