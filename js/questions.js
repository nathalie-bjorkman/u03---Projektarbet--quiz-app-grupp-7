/*
    Fil: questions.js
    Beskrivning: Logik som inhämtar slumpmässig fråga från offentligt API med svarshantering
    Författare: Lumi Hyväri -- @lumiwyou <lumi.hyvari@gmail.com>
*/

const API_ENDPOINT = "https://opentdb.com/api.php";
const RESULT_STORAGE_KEY = "quiztajm_results_v1";

const categoryMap = {
  blandat: null,
  natur: [17, 22],
  kultur: [23, 12, 25],
};

const answerTitleElements = [
  document.querySelector("#answer-titel-1"),
  document.querySelector("#answer-titel-2"),
  document.querySelector("#answer-titel-3"),
];
const answerElements = [
  document.querySelector("#answer-1"),
  document.querySelector("#answer-2"),
  document.querySelector("#answer-3"),
];
const questionTitleElement = document.querySelector("#question-titel");
const questionCategoryElement = document.querySelector("#question-category");
const submitBtn = document.querySelector("#submit");

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let correctAnswerIndex = null;
let currentOptions = [];
let quizAnswers = [];

// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-22, License - CC BY-SA 4.0
function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// @brief Inhämta och skapa en lista av kategorier med dess respektive namn och id
async function getCategoryNames() {
  const response = await fetch("https://opentdb.com/api_category.php");
  if (!response.ok) {
    throw new Error(`Kunde inte hämta kategorier: ${response.status}`);
  }

  const data = await response.json();
  return data.trivia_categories.map(({ id, name }) => ({
    id,
    name: name.trim(),
  }));
}

// @brief Inhämtar flertals slumpmässig frågor från offentligt API
async function getAPIQuestions(categoryId, difficulty = "easy", amount = 10) {
  const params = new URLSearchParams({
    amount: String(amount),
    difficulty,
    type: "multiple",
  });
  if (categoryId !== undefined && categoryId !== null) {
    params.set("category", String(categoryId));
  }

  const response = await fetch(`${API_ENDPOINT}?${params}`);
  if (!response.ok) {
    throw new Error(`Kunde inte hämta frågor: ${response.status}`);
  }

  const data = await response.json();
  if (data.response_code !== 0) {
    throw new Error(`Fråge-API:t returnerade felkod ${data.response_code}`);
  }
  return data.results;
}

function decodeHTML(value) {
  return new DOMParser().parseFromString(value, "text/html").documentElement
    .textContent;
}

function resetAnswers() {
  answerElements.forEach((answerElement) => {
    answerElement.classList.remove(
      "answer-wrong",
      "answer-correct",
      "answer-selected"
    );
  });
  selectedAnswerIndex = null;
}

function selectAnswer(answerIndex) {
  resetAnswers();
  selectedAnswerIndex = answerIndex;
  answerElements[answerIndex].classList.add("answer-selected");
}

function askQuestion(question) {
  questionTitleElement.textContent = decodeHTML(question.question);
  questionCategoryElement.textContent = decodeHTML(question.category);

  const answers = shuffle([
    ...question.incorrect_answers.slice(0, answerTitleElements.length - 1),
    question.correct_answer,
  ]);
  currentOptions = answers.map(decodeHTML);
  correctAnswerIndex = answers.indexOf(question.correct_answer);

  resetAnswers();
  currentOptions.forEach((answer, index) => {
    answerTitleElements[index].textContent = answer;
  });

  if (currentQuestionIndex === 0 && typeof window.startQuizTimer === "function") {
    window.startQuizTimer();
  }
  if (typeof window.updateProgress === "function") {
    window.updateProgress(currentQuestionIndex + 1, questions.length);
  }
}

function validateAnswers() {
  if (selectedAnswerIndex === null) return null;
  return selectedAnswerIndex === correctAnswerIndex;
}

function submitAnswer(event) {
  event.preventDefault();
  const isCorrect = validateAnswers();
  if (isCorrect === null) {
    alert("Vänligen ge ett svar");
    return;
  }

  quizAnswers.push({
    question: decodeHTML(questions[currentQuestionIndex].question),
    options: currentOptions,
    selected: selectedAnswerIndex,
    correct: correctAnswerIndex,
  });
  currentQuestionIndex++;

  if (currentQuestionIndex === questions.length) {
    const savedResults = JSON.parse(
      localStorage.getItem(RESULT_STORAGE_KEY) ?? "[]"
    );
    savedResults.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: "Quiz Tajm",
      date: new Date().toISOString(),
      score: quizAnswers.filter((answer) => answer.selected === answer.correct)
        .length,
      total: quizAnswers.length,
      answers: quizAnswers,
    });
    localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(savedResults));
    window.location.href = "./result.html";
    return;
  }

  askQuestion(questions[currentQuestionIndex]);
}

async function loadQuestions(categoryId) {
  const storedCategoryId = localStorage.getItem("questionsCategoryId");
  let storedQuestions;

  try {
    storedQuestions = JSON.parse(localStorage.getItem("questions") ?? "null");
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  if (
    Array.isArray(storedQuestions) &&
    storedQuestions.length > 0 &&
    storedCategoryId === String(categoryId)
  ) {
    return storedQuestions;
  }

  const fetchedQuestions = await getAPIQuestions(categoryId);
  localStorage.setItem("questions", JSON.stringify(fetchedQuestions));
  localStorage.setItem("questionsCategoryId", String(categoryId));
  return fetchedQuestions;
}

async function init() {
  const selectedCategory =
    sessionStorage.getItem("selectedCategory") ?? "blandat";
  const categoryIds = categoryMap[selectedCategory] ?? null;
  const categoryId =
    categoryIds === null
      ? null
      : categoryIds[Math.floor(Math.random() * categoryIds.length)];

  questions = await loadQuestions(categoryId);
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Det finns inga frågor att visa.");
  }

  answerElements.forEach((answerElement, index) => {
    answerElement.addEventListener("click", () => selectAnswer(index));
  });
  submitBtn.addEventListener("click", submitAnswer);
  askQuestion(questions[currentQuestionIndex]);
}

init();
