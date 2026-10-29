// Hämta elementen för progress

const questionCount = document.getElementById("question-count");
const questionsLeft = document.getElementById("questions-left");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-fill");

//Hämta timer elementet

const timerDisplay = document.querySelector(".time-left");

// Hämta timer container

const timerContainer = document.querySelector(".quiz-timer");

// Hämta time-up modal elementen

const timeUpModal = document.getElementById("time-up-modal");
const timeUpButton = document.getElementById("time-up-button");

// Function that updates the quiz progress

function updateProgress(currentQuestion, totalQuestions) {
  // Count how many questions that are left

  const remainingQuestions = totalQuestions - currentQuestion;

  // Count how much of the quiz that are done
  const progress = (currentQuestion / totalQuestions) * 100;

  // Update the text

  questionCount.textContent = `Fråga ${currentQuestion} av ${totalQuestions}`;

  questionsLeft.textContent = `${remainingQuestions} kvar`;

  // Update the progressbar
  progressFill.style.width = progress + "%";

  // Update information for visual aid

  progressBar.setAttribute("aria-valuemax", totalQuestions);
  progressBar.setAttribute("aria-valuenow", currentQuestion);
}

// Testing with question 5 of 10
updateProgress(5, 10);

// Get the cancel button

const cancelButton = document.getElementById("cancel-button");

// Listen after click on the button

cancelButton.addEventListener("click", function () {
  const confirmCancel = confirm("Är du säker på att du vill avbryta quizet?");

  if (confirmCancel) {
    window.location = "../index.html";
  }
});

// Set the quiz timer to 4 minutes

let timeLeft = 5/* 4 * 60 */;

// Function that displays the remaining time

function displayTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  timerDisplay.textContent = `${formattedMinutes} . ${formattedSeconds}`;
}

//Start the countdown

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
