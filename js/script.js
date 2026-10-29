
"use strict";

/*
  ENDAST RESULTATTAVLA.
  Lagringsnyckel: quiztajm_results_v1

  När ditt befintliga quiz avslutas kan det spara ett resultat med:
  window.saveQuizResult({
    title: "Mitt quiz",
    score: 8,
    total: 10,
    answers: [
      {
        question: "Exempelfråga?",
        options: ["Svar A", "Svar B", "Svar C", "Svar D"],
        selected: 1,
        correct: 1,
        explanation: "Förklaring."
      }
    ]
  });
*/

const STORAGE_KEY = "quiztajm_results_v1";
const THEME_KEY = "quiztajm_theme_v1";

const latestElement = document.getElementById("latestResult");
const reviewElement = document.getElementById("answerReview");
const historyElement = document.getElementById("historyList");
const answerCountElement = document.getElementById("answerCount");
const toggleHistoryButton = document.getElementById("toggleHistory");

let showAllHistory = false;
let selectedResultId = null;

function readResults() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeResults(results) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    return true;
  } catch (error) {
    console.error("Kunde inte spara resultaten:", error);
    return false;
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function percentage(score, total) {
  return total > 0 ? Math.round(score / total * 100) : 0;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Okänt datum";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function sortedResults() {
  return readResults().sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/*
  Den här funktionen kan anropas av quizets befintliga script.js.
  Den sparar försöket och uppdaterar resultattavlan.
*/
window.saveQuizResult = function (data) {
  if (!data || typeof data !== "object") {
    throw new TypeError("Ett giltigt resultatobjekt krävs.");
  }

  const total = Math.max(0, Number(data.total) || 0);
  const score = Math.max(
    0,
    Math.min(total, Number(data.score) || 0)
  );

  const result = {
    id: makeId(),
    title: String(data.title || "Quiz Tajm"),
    date: new Date().toISOString(),
    score,
    total,
    answers: Array.isArray(data.answers)
      ? data.answers.map(answer => ({
          question: String(answer.question || ""),
          options: Array.isArray(answer.options)
            ? answer.options.map(String)
            : [],
          selected: Number.isInteger(answer.selected)
            ? answer.selected
            : null,
          correct: Number.isInteger(answer.correct)
            ? answer.correct
            : null,
          explanation: String(answer.explanation || "")
        }))
      : []
  };

  const results = readResults();
  results.push(result);

  if (!writeResults(results)) {
    throw new Error("Resultatet kunde inte sparas i webbläsaren.");
  }

  selectedResultId = result.id;
  renderBoard();
  return result;
};

function renderLatest(result) {
  if (!result) {
    latestElement.innerHTML = `
      <div class="empty-state">
        Inget resultat har sparats ännu.
      </div>
    `;
    return;
  }

  const score = Number(result.score) || 0;
  const total = Number(result.total) || 0;
  const percent = percentage(score, total);
  const answers = Array.isArray(result.answers) ? result.answers : [];

  const correct = answers.filter(answer =>
    answer.selected !== null &&
    answer.selected !== undefined &&
    answer.selected === answer.correct
  ).length;

  const wrong = answers.filter(answer =>
    answer.selected !== null &&
    answer.selected !== undefined &&
    answer.selected !== answer.correct
  ).length;

  latestElement.innerHTML = `
    <div class="result-top">
      <span class="result-date">${escapeHTML(formatDate(result.date))}</span>
      <span class="score-pill">${percent}% rätt</span>
    </div>

    <div class="score-row">
      <div class="score-box">
        <span class="score-value">${score} av ${total}</span>
        <span class="score-label">Dina poäng</span>
      </div>

      <div class="score-box">
        <span class="score-value green">${correct}</span>
        <span class="score-label">Rätt svar</span>
      </div>

      <div class="score-box">
        <span class="score-value red">${wrong}</span>
        <span class="score-label">Fel svar</span>
      </div>
    </div>
  `;
}

function renderReview(result) {
  const answers = Array.isArray(result?.answers) ? result.answers : [];

  answerCountElement.textContent = answers.length
    ? `${answers.length} frågor`
    : "";

  if (!answers.length) {
    reviewElement.innerHTML = `
      <div class="empty-state">
        Det finns ingen sparad svarsfördelning för det här försöket.
      </div>
    `;
    return;
  }

  reviewElement.innerHTML = answers.map((answer, index) => {
    const selected = answer.selected;
    const correct = answer.correct;

    const skipped = selected === null || selected === undefined;
    const isCorrect = !skipped && selected === correct;

    const options = Array.isArray(answer.options)
      ? answer.options
      : [];

    const selectedText = skipped
      ? "Överhoppad"
      : options[selected] ?? "Okänt svar";

    const correctText = correct === null ||
      correct === undefined
      ? "Ej angivet"
      : options[correct] ?? "Okänt svar";

    return `
      <article class="card review-item ${isCorrect ? "" : "wrong"}">
        <div class="review-meta">
          <span class="review-status">
            ${isCorrect ? "✓ RÄTT SVAR" : "✕ FEL SVAR"}
          </span>
          <span class="muted small">FRÅGA ${index + 1}</span>
        </div>

        <p class="review-question">
          ${escapeHTML(answer.question || `Fråga ${index + 1}`)}
        </p>

        <p class="review-answer">
          Ditt svar:
          <strong>${escapeHTML(selectedText)}</strong>
        </p>

        ${
          !isCorrect
            ? `<p class="review-answer">
                 Rätt svar: <strong>${escapeHTML(correctText)}</strong>
               </p>`
            : ""
        }

        ${
          answer.explanation
            ? `<div class="review-explanation">
                 ${escapeHTML(answer.explanation)}
               </div>`
            : ""
        }
      </article>
    `;
  }).join("");
}

function renderHistory() {
  const results = sortedResults();
  const visibleResults = showAllHistory
    ? results
    : results.slice(0, 3);

  toggleHistoryButton.hidden = results.length <= 3;
  toggleHistoryButton.textContent = showAllHistory
    ? "Visa färre"
    : "Visa alla resultat";

  if (!results.length) {
    historyElement.innerHTML = `
      <div class="empty-state">
        Dina tidigare försök kommer att visas här.
      </div>
    `;
    return;
  }

  historyElement.innerHTML = visibleResults.map(result => `
    <button
      type="button"
      class="history-item"
      data-result-id="${escapeHTML(result.id)}"
      aria-label="Visa resultat från ${escapeHTML(formatDate(result.date))}">

      <span class="history-score">
        ${Number(result.score) || 0}/${Number(result.total) || 0}
      </span>

      <span class="history-info">
        <span class="history-name">${escapeHTML(result.title || "Quiz Tajm")}</span>
        <span class="history-date">
          ${escapeHTML(formatDate(result.date))}
          · ${percentage(Number(result.score) || 0, Number(result.total) || 0)}% rätt
        </span>
      </span>

      <span class="history-arrow" aria-hidden="true">›</span>
    </button>
  `).join("");
}

function renderBoard() {
  const results = sortedResults();

  let current = selectedResultId
    ? results.find(result => result.id === selectedResultId)
    : results[0];

  if (!current && results.length) {
    current = results[0];
  }

  renderLatest(current);

  if (current) {
    renderReview(current);
  } else {
    answerCountElement.textContent = "";
    reviewElement.innerHTML = "";
  }

  renderHistory();
}

/* Visa ett tidigare försök i resultattavlan. */
historyElement.addEventListener("click", event => {
  const button = event.target.closest("[data-result-id]");
  if (!button) return;

  selectedResultId = button.dataset.resultId;
  renderBoard();

  document.querySelector(".latest-card").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

toggleHistoryButton.addEventListener("click", () => {
  showAllHistory = !showAllHistory;
  renderHistory();
});

/* Temaväxling */
const themeToggle = document.getElementById("themeToggle");
const brandLogo = document.querySelector(".brand-logo");

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "☀" : "☾";
  brandLogo.src = isDark
    ? "../assets/quiz-tajm-logo-dark.png"
    : "../assets/quiz-tajm-logo.png";

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Temat fungerar även om lagring inte är tillgänglig.
  }
}

themeToggle.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("dark") ? "light" : "dark");
});

/*
  Dessa knappar navigerar inte till en påhittad quizsida.
  Koppla dem till dina faktiska sidor om du har separata quizfiler.
*/
document.getElementById("playAgain").addEventListener("click", () => {
  window.history.back();
});

document.getElementById("homeButton").addEventListener("click", () => {
  window.location.href = "index.html";
});

/* Initiering */
try {
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
} catch {
  applyTheme("light");
}

renderBoard();
