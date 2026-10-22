async function getQuestion(category, difficulty) {
    let response = "";
    let response_data;
    error_count = 0;

    // Trial and Error Question Selection
    do {
        try {
            response = await fetch("https://opentdb.com/api.php?amount=1&category=11&difficulty=medium&type=multiple");
            if(response.status != 200) {
                console.log(`API response status: ${response.status}`);
                error_count++;
                continue;
            }
            response_data = await response.json();
            response_data = response_data.results[0];
            console.log(response_data);
        }catch{
            console.log("Unable to retrieve question from API-endpoint");
        }
        // If too many, remove
        let rest = response_data.incorrect_answers.length + 1 - 3;
        if(rest > 0) {
            response_data.incorrect_answers.splice(rest - response_data.incorrect_answers.length + 1);
        }
    } while(response_data == "" || response_data.incorrect_answers.length + 1 < 3 || error_count >= 5);

    // Input the data
    localStorage.setItem("correctAnswer", response_data.correct_answer);
    document.getElementById("question-titel").innerHTML = response_data.question;
    document.getElementById("question-category").innerHTML = response_data.category;

    // Randomize answers
    let answers_values = [
        response_data.incorrect_answers[0],
        response_data.incorrect_answers[1],
        response_data.correct_answer
    ]

    shuffle(answers_values);

    document.getElementById("answer-titel-1").innerHTML = answers_values[0];
    document.getElementById("answer-titel-2").innerHTML = answers_values[1];
    document.getElementById("answer-titel-3").innerHTML = answers_values[2];
}

// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-22, License - CC BY-SA 4.0

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

document.querySelectorAll(".answer").forEach((answerElement, index) => {
    answerElement.addEventListener("click", () => {
        selectAnswer(index + 1);
    });
});

function selectAnswer(answer_number) {
    resetAnswers();
    const answerElement = document.getElementById(`answer-${answer_number}`);
    const answerTitel = document.getElementById(`answer-titel-${answer_number}`);

    if(answerTitel.innerHTML === localStorage.getItem("correctAnswer")) {
        answerElement.classList.add("answer-correct");
    }else{
        answerElement.classList.add("answer-wrong");
    }
}

function resetAnswers() {
    for(let n = 1; n <= 3; n++) {
        document.getElementById(`answer-${n}`).classList.remove("answer-wrong");
        document.getElementById(`answer-${n}`).classList.remove("answer-correct");
    }
}

document.getElementById("submit").addEventListener("click", () => {
    resetAnswers();
    getQuestion();
});