// Hämtar alla HTML-element med klassen .toggle-button.
// querySelectorAll skapar en NodeList (samling av DOM-noder).
// Varje knapp får ett index (0, 1, 2 osv).
const categoryButtons = document.querySelectorAll(".toggle-button");
const infoHeading = document.querySelector(".info-box-content-left p");
const startButton = document.querySelector(".start-quiz-button");

// Går igenom alla knappar och lägger till en klicklyssnare.
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Går igenom alla knappar och tar bort active.
    categoryButtons.forEach((otherButton) => {
      otherButton.classList.remove("active");
      // Tillgänglighet
      otherButton.setAttribute("aria-pressed", "false");
    });

    // Gör den klickade knappen aktiv.
    button.classList.add("active");

    // Uppdaterar H3 med texten från den klickade knappen.
    infoHeading.textContent = button.querySelector("h3").textContent.trim();
  });
});

// När användaren trycker på start kopplas den valda kategorin till localStorage
startButton.addEventListener("click", () => {
  const selectedButton = document.querySelector(".toggle-button.active");
  const selectedCategory = selectedButton.dataset.category;

  sessionStorage.setItem("selectedCategory", selectedCategory);
  window.location.href = "questions.html";

  console.log(`Vald kategori sparad i sessionStorage: ${selectedCategory}`);
});
