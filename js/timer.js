// Hämta elementen för progress

const questionCount = document.getElementById("question-count");
const questionsLeft = document.getElementById("questions-left");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-fill");

//Hämta timer elementet

const timerDisplay = document.querySelector(".time-left");

// Hämta timer container

const timerContainer = document.querySelector(".quiz-timer");

// Hämtar avbryt knappen

const cancelButton = document.getElementById("cancel-button");

// Hämta time-up modal elementen

const timeUpModal = document.getElementById("time-up-modal");
const timeUpButton = document.getElementById("time-up-button");

// Funktion som uppdaterar quiz framstegen

function updateProgress(currentQuestion, totalQuestions) {

  // Räknar hur många frågor som är kvar

  const remainingQuestions = totalQuestions - currentQuestion;

  // Räknar hur många frågor som är klara 

  const progress = (currentQuestion / totalQuestions) * 100;

  // Uppdaterar texten

  questionCount.textContent = `Fråga ${currentQuestion} av ${totalQuestions}`;

  questionsLeft.textContent = `${remainingQuestions} kvar`;

  // Uppdaterar progressbaren

  progressFill.style.width = progress + "%";

  // Uppdaterar informationen för visuellt hjälpmedel

  progressBar.setAttribute("aria-valuemax", totalQuestions);
  progressBar.setAttribute("aria-valuenow", currentQuestion);
}

// Testar med fråga 5 av 10, så att progressbaren ändras

updateProgress(5, 10);

// Lyssnar efter klick på avbryt knappen

cancelButton.addEventListener("click", function () {
  const confirmCancel = confirm("Är du säker på att du vill avbryta quizet?");

  if (confirmCancel) {
    window.location = "./index.html";
  }
});

// Quizets timer sätts på 4 minuter 

let timeLeft = 5/* 4 * 60 */;

// Funktion som visar tiden som är kvar av quizet

function displayTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  timerDisplay.textContent = `${formattedMinutes} . ${formattedSeconds}`;
}

// Nedräkningen startar

function startTimer() {
  displayTime();

  const timerInterval = setInterval(function () {
    timeLeft--;

    displayTime();

    // Ändra färg när det bara är 1 minut eller mindre kvar

    if (timeLeft <= 60 && timeLeft > 0) {
      timerContainer.classList.add("warning");
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      timeLeft = 0;
      displayTime();

      timeUpModal.hidden = false;
      timeUpButton.focus();
    }
  }, 1000);
}
startTimer();

// Stäng time-up meddelande

timeUpButton.addEventListener("click", function () {
  timeUpModal.hidden = true;
});
