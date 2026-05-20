"use client";

import { useMemo, useState } from "react";

function buildMailto(email, subject, body) {
  const params = new URLSearchParams({
    subject,
    body
  });

  return `mailto:${email}?${params.toString()}`;
}

export default function EmailCaptureForm({
  email,
  title = "Join early access",
  buttonLabel = "Submit",
  note,
  mode = "lead"
}) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const mailto = useMemo(() => {
    const subject = mode === "contact" ? `CaribAI inquiry: ${topic || "New message"}` : `CaribAI early access: ${title}`;
    const body = [
      `Name: ${name || "-"}`,
      mode === "contact" ? `Topic: ${topic || "-"}` : `Email: ${value || "-"}`,
      "",
      message || "I'd like to connect."
    ].join("\n");

    return buildMailto(email, subject, body);
  }, [email, message, mode, name, title, topic, value]);

  return (
    <form
      className="capture-form"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailto;
      }}
    >
      <div className="capture-grid">
        <label>
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>
        <label>
          <span>{mode === "contact" ? "Topic" : "Email"}</span>
          <input
            type={mode === "contact" ? "text" : "email"}
            value={mode === "contact" ? topic : value}
            onChange={(event) => (mode === "contact" ? setTopic(event.target.value) : setValue(event.target.value))}
            placeholder={mode === "contact" ? "Partnership, media, launch..." : "name@email.com"}
          />
        </label>
      </div>
      <label>
        <span>{mode === "contact" ? "Message" : "What are you interested in?"}</span>
        <textarea
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={
            mode === "contact"
              ? "Tell CaribAI what you'd like to connect about."
              : "Tell CaribAI which launches, products, or tools you want to hear about."
          }
        />
      </label>
      <div className="capture-actions">
        <button className="button button-primary" type="submit">
          {buttonLabel}
        </button>
        {note ? <p className="helper-copy">{note}</p> : null}
      </div>
    </form>
  );
}
