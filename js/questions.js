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
    document.querySelector("#answer-title-1"),
    document.querySelector("#answer-title-2"),
    document.querySelector("#answer-title-3")
]
const questionTitleElement = document.querySelector("question-titel");
const questionCategoryElement = document.querySelector("question-category");
const submitBtn = document.querySelector("#submit");

// Source - https://stackoverflow.com/a/2450976
// Posted by ChristopheD, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-22, License - CC BY-SA 4.0

submitBtn.addEventListener(() => {
    validate();
});

async function shuffle(array) {
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

// @brief Inhämta och skapa en lista av kategorier med dess respektive namn och id
async function getCategoryNames() {
    let categories = [];
    // Iterera kategori-id för att skapa en tvådimensionell array av id:n och namn
    for(let n = 0; n < max_id; n++) {
        const res = fetch(`?amount=1&category=${n}&difficulty=low&type=single`);
        const res_json = res.json();
        categories.push({
            id:n,
            name:res_json.results[0].category.trim()
        });
    }
    return categories;
}

// @brief Inhämtar flertals slumpmässig frågor från offentligt API
async function getAPIQuestions(category_name, difficulty, amount) {
    // TODO: Implementera exception handling för fetch
    let response = "";
    const get_config = `?amount=${amount}&category=${category_name}&difficulty=${difficulty}&type=multiple`
    let errors = 0;
    const request_url = API_ENDPOINT + get_config;
    const res = await fetch(request_url);
    localStorage.setItem("questions", res.json().results.join())
}

async function displayQuestions() {
    const questions = localStorage.getItem("questions").json();
    questions.map(async (question) => {
        // Validering: vid fall av alltför många svar, ta bort resterande
        let rest = question.incorrect_answers.length + 1 - 3;
        if(rest > 0) {
            question.incorrect_answers.splice(rest - question.incorrect_answers.length + 1);
        }

        // Visa frågan och dess svar
        questionTitleElement.innerHTML = question.question;
        questionCategoryElement.innerHTML = question.category;

        // Shuffla svaren för oförutsägbarhet
        let answers = await shuffle([
            question.incorrect_answers,
            question.correct_answer
        ]);

        // Visa svaren
        // ! Kommer detta att fungera? @lumiwyou
        let zip_answers = (answers, answerTitleElements);
        zip_answers.map((answer, element) => {
            element.innerHTML = answer;
        });
    });
}

function resetAnswers() {
    for(let n = 1; n <= 3; n++) {
        document.getElementById(`answer-${n}`).classList.remove("answer-wrong");
        document.getElementById(`answer-${n}`).classList.remove("answer-correct");
    }
}

async function selectAnswer(answer_id) {
    // Applicera stilkodning på elementet
    resetAnswers();
    const answerElement = document.getElementById(`answer-${answer_id}`);
    const answerTitel = document.getElementById(`answer-titel-${answer_id}`);

    answerElement.classList.add(answer-selected);
    return;
}

async function validateAnswers() {
    // Kontrollera svar
    answerTitleElements.map((answer) => {
        // Visa rätt eller fel
        if(answerElement.innerHTML == localStorage.getItem("correctAnswer")) answerElement.classList.add("answer-correct");
        else answerElement.classList.add("answer-wrong");
    });

    // Nästa steg
}

async function init() {
    // Inhämtar och cachar kategorierna och första omgång frågor
    await localStorage.setItem("categories", getCategoryNames().join());
    await localStorage.setItem("questions", getAPIQuestions().join());
    await displayQuestions();
}