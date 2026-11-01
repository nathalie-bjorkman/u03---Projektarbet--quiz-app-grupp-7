const categoryButtons = document.querySelectorAll(".toggle-button");

// Går igenom alla knappar och lägger till en klicklyssnare.
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Går igenom alla knappar och tar bort active.
    categoryButtons.forEach((otherButton) => {
      otherButton.classList.remove("active");
    });

    // Gör den klickade knappen aktiv.
    button.classList.add("active");
  });
});
