// Hämta elementen för progress
const questionCount = document.getElementById("question-count");
const questionsLeft = document.getElementById("questions-left");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-fill");

//Hämta timer elementet
const timerDisplay = document.querySelector(".time-left");
const timerContainer = document.querySelector(".quiz-timer");

// Hämtar knappar
const cancelButton = document.getElementById("cancel-button");
const timeUpButton = document.getElementById("time-up-button");

// Hämta modalens element
const timeUpModal = document.getElementById("time-up-modal");
const modalTitle = document.getElementById("time-up-title");
const correctAnswers = document.querySelector(".correct-answer");
const totalQuestionsElement = document.getElementById("total-questions");
const howFast = document.getElementById("how-fast");

// Quizets tid: 4 minuter
let timeLeft = 4 * 60;
let timerInterval = null;

// Funktion som visar tiden
function displayTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// Funktion som uppdaterar progressbaren
window.updateProgress = function (currentQuestion, totalQuestions) {
  if (!questionCount || !questionsLeft || !progressBar || !progressFill) {
    return;
  }

  // Räknar hur många frågor som är kvar
  const remainingQuestions = totalQuestions - currentQuestion;

  // Räknar hur många frågor som är klara
  const progress = (currentQuestion / totalQuestions) * 100;

  // Uppdaterar texten
  questionCount.textContent = `Fråga ${currentQuestion} av ${totalQuestions}`;
  questionsLeft.textContent = `${remainingQuestions} kvar`;

  // Uppdaterar progressbaren
  progressFill.style.width = `${progress}%`;

  // Uppdaterar informationen för visuellt hjälpmedel
  progressBar.setAttribute("aria-valuemax", totalQuestions);
  progressBar.setAttribute("aria-valuenow", currentQuestion);
}

// Testar med fråga 5 av 10, så att progressbaren ändras VIKTIGT - TA BORT DETTA NÄR ALL JAVASCRIPT ÄR KLAR!!
// updateProgress(2, 10);

// Nedräkningen startar
window.startQuizTimer = function () {
  // Förhindra att timern startas flera gånger
  if (timerInterval !== null) return;

  displayTime();

  timerInterval = setInterval(function () {
    timeLeft--;

    displayTime();

    // Ändra färg när det bara är 1 minut eller mindre kvar
    if (timeLeft <= 60 && timeLeft > 0) {
      timerContainer.classList.add("warning");
    }
    // När tiden tar slut
    if (timeLeft <= 0) {
      timeLeft = 0;
      displayTime();

      window.stopQuizTimer();

      // Meddela quistions.js att tiden är slut
      window.finishQuiz("time");

      /*  timeUpModal.hidden = false;
      timeUpButton.focus(); */
    }
  }, 1000);
};

//Ta bort denna sedan
//startQuizTimer();

// Stoppa timern
window.stopQuizTimer = function () {
  clearInterval(timerInterval);
  timerInterval = null;
};

// Hämta tiden som använts
window.getTimeUsed = function () {
  return 4 * 60 - timeLeft;
};

// Omvandla sekunder till mm:ss

window.formatQuizTime = function (seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

// Visa den gemensamma resultatmodalen
window.showQuizEndModal = function (reason, score, total, timeUsed) {
  modalTitle.textContent = reason === "time" ? "Tiden är slut!" : "Bra jobbat!";

  correctAnswers.textContent = score;
  totalQuestionsElement.textContent = total;

  howFast.textContent = `Klart på ${window.formatQuizTime(timeUsed)}. Se svaren och vad du kan ta med dig till nästa omgång.`;

  timeUpModal.hidden = false;
  timeUpButton.focus();
};

// Avbryt quizet
cancelButton.addEventListener("click", function() {
    const confirmCancel = confirm("Är du säker på att du vill avbryta quizet?");

    if (confirmCancel) {
        window.stopQuizTimer();
        window.location.href = "./index.html";
    }
});

// Knappen i resultatmodalen
timeUpButton.addEventListener("click", function() {
    window.location.href = "../html/index.html";
});

// Visa starttiden utan att starta nedräkningen
displayTime();


/* // Stoppa nedräkningen
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Stäng time-up meddelande
timeUpButton.addEventListener("click", function () {
  timeUpModal.hidden = true;
}); */
