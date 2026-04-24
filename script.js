const leadForm = document.querySelector("#lead-form");
const formNote = document.querySelector("#form-note");

if (leadForm && formNote) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "Thanks. Your form UI is working and ready to be connected to a real email list or backend.";
    leadForm.reset();
  });
}
