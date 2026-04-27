const demoForms = document.querySelectorAll("[data-demo-form]");

demoForms.forEach((form) => {
  const note = form.querySelector("[data-form-note]");

  if (!note) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message =
      form.getAttribute("data-success-message") ||
      "Thanks. Your form UI is working and ready to be connected to a real email list or backend.";

    note.textContent = message;
    form.reset();
  });
});
