const fallbackInbox = "caribailabs@gmail.com";

const buildMailtoLink = (form) => {
  const type = form.getAttribute("data-form-type") || "general";
  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim() || "Website visitor";
  const email = formData.get("email")?.toString().trim() || "Not provided";
  const topic = formData.get("company")?.toString().trim() || "General inquiry";
  const message = formData.get("message")?.toString().trim() || "";

  let subject = "CaribAI inquiry";
  let body = `Name: ${name}\nEmail: ${email}\n`;

  if (type === "early-access") {
    subject = "CaribAI early access request";
    body += "\nPlease add me to the CaribAI early access list.\n";
  } else if (type === "storefront-access") {
    subject = "CaribAI storefront early access request";
    body += "\nPlease add me to the CaribAI storefront early access list.\n";
  } else {
    body += `Topic: ${topic}\n\nMessage:\n${message || "No additional message provided."}\n`;
  }

  return `mailto:${fallbackInbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-demo-form]");
  if (!form) {
    return;
  }

  event.preventDefault();

  const note = form.querySelector("[data-form-note]");
  const nameField = form.querySelector('[name="name"]');
  const emailField = form.querySelector('[name="email"]');

  if (nameField && !nameField.value.trim()) {
    if (note) {
      note.textContent = "Please add your name before continuing.";
    }
    nameField.focus();
    return;
  }

  if (emailField && !emailField.value.trim()) {
    if (note) {
      note.textContent = "Please add your email before continuing.";
    }
    emailField.focus();
    return;
  }

  window.location.href = buildMailtoLink(form);

  if (note) {
    note.textContent =
      form.getAttribute("data-success-message") ||
      "Your email app should open with a ready-to-send message for CaribAI.";
  }

  form.reset();
});
