//get the elements from HTML
const questionCount = document.getElementById("question-count");
const questionsLeft = document.getElementById("questions-left");
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-fill");

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


//Get the timer element
const timerDisplay = document.querySelector(".time-left");

// Set the quiz timer to 4 minutes

let timeLeft = 4 * 60;

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


        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00.00";
            // Eventuellt lägga till en alert, fråga gruppen
            alert("Tiden är slut!")
        }
    }, 1000);
    
}
startTimer()