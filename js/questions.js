/*
    Fil: questions.js
    Beskrivning: Logik som inhämtar slumpmässig fråga från offentligt API med svarshantering
    Författare: Lumi Hyväri -- @lumiwyou <lumi.hyvari@gmail.com>
*/

const API_ENDPOINT = "https://opentdb.com/api.php";
let categories = [
    // { id:Integer, name:String }
];

const answerTitleElements = [
    document.querySelector("#answer-titel-1"),
    document.querySelector("#answer-titel-2"),
    document.querySelector("#answer-titel-3")
]
const answerElements = [
    document.querySelector("#answer-1"),
    document.querySelector("#answer-2"),
    document.querySelector("#answer-3")
]
const questionTitleElement = document.querySelector("#question-titel");
const questionCategoryElement = document.querySelector("#question-category");
const submitBtn = document.querySelector("#submit");

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
        name: name.trim()
    }));
}

// @brief Inhämtar flertals slumpmässig frågor från offentligt API
async function getAPIQuestions(categoryId, difficulty = "easy", amount = 10) {
    const params = new URLSearchParams({
        amount: String(amount),
        difficulty,
        type: "multiple"
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

function displayQuestions() {
    const questions = JSON.parse(localStorage.getItem("questions"));
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Det finns inga frågor att visa.");
    }

    const question = questions[0];
    questionTitleElement.textContent = decodeHTML(question.question);
    questionCategoryElement.textContent = decodeHTML(question.category);

    const answers = shuffle([
        ...question.incorrect_answers.slice(0, answerTitleElements.length - 1),
        question.correct_answer
    ]);

    answers.forEach((answer, index) => {
        answerTitleElements[index].textContent = decodeHTML(answer);
    });
}

function decodeHTML(value) {
    return new DOMParser().parseFromString(value, "text/html").documentElement.textContent;
}

function resetAnswers() {
    answerElements.forEach((answerElement) => {
        answerElement.classList.remove("answer-wrong", "answer-correct", "answer-selected");
    });
}

async function selectAnswer(answer_id) {
    // Applicera stilkodning på elementet
    resetAnswers();
    const answerElement = document.getElementById(`answer-${answer_id}`);
    answerElement.classList.add("answer-selected");
}

async function validateAnswers() {
    // Kontrollera svar
    console.log("Validerar svaret");
    answerTitleElements.map((answer) => {
        // Visa rätt eller fel
        if(answerElement.innerHTML == localStorage.getItem("correctAnswer") && answerElement.classList.contains("answer-selected")) { 
            answerElement.classList.add("answer-correct");
            answerElement.classList.remove("answer-selected"); 
        }
        else answerElement.classList.add("answer-wrong");
    });

    // Nästa steg
}

async function init() {
    // Kontrollera om det inte finns frågor inhämtade och cachade
    if(!localStorage.getItem("questions")) {
        // Inhämtar och cachar kategorierna och första omgång frågor
        console.log("Inhämtar kategorier");
        const categoryData = await getCategoryNames();
        localStorage.setItem("categories", JSON.stringify(categoryData));
        console.log("Inhämtar frågeställning");
        const questionData = await getAPIQuestions();
        localStorage.setItem("questions", JSON.stringify(questionData));
    }

    // Visa frågorna
    console.log("Visar frågorna");
    await displayQuestions();

    answerElements.forEach((answerElement, index) => {
        answerElement.addEventListener("click", () => selectAnswer(index + 1));
    });

    // Annars kan vi invänta svar
    console.log("Inväntar submit click (eventListener)");
    submitBtn.addEventListener("click", async () => {
        console.log("SUBMIT CLICK!");
        validate();
    });
}

init();