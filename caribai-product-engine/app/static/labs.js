const promptForm = document.querySelector(".prompt-composer");
const promptChips = document.querySelectorAll(".prompt-chip");
const promptInput = document.querySelector("#prompt-input");
const promptSubmit = document.querySelector("#prompt-submit");
const chatThread = document.querySelector("#labs-chat-thread");
const signalPanel = document.querySelector("#signal-panel");
const signalLoading = document.querySelector("#signal-loading");
const signalProgress = document.querySelector("#signal-progress");
const candidateGrid = document.querySelector("#candidate-grid");
const blueprintPanel = document.querySelector("#blueprint-panel");
const blueprintLoading = document.querySelector("#blueprint-loading");
const blueprintContent = document.querySelector("#blueprint-content");
const blueprintButton = document.querySelector("#blueprint-button");
const forgePanel = document.querySelector("#forge-panel");
const forgeLoading = document.querySelector("#forge-loading");
const forgeProgress = document.querySelector("#forge-progress");
const forgeContent = document.querySelector("#forge-content");
const forgeButton = document.querySelector("#forge-button");

let currentIdeaId = null;
let signalTicker = null;
let forgeTicker = null;

function addMessage(role, title, body) {
  const article = document.createElement("article");
  article.className = `chat-message ${role}`;

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "CaribAI Labs";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.style.whiteSpace = "pre-wrap";
  paragraph.textContent = body;

  article.append(label, heading, paragraph);
  chatThread.appendChild(article);
  article.scrollIntoView({ behavior: "smooth", block: "end" });
}

function hide(element) {
  element?.classList.add("hidden");
}

function show(element) {
  element?.classList.remove("hidden");
}

async function postForm(url, fields = {}) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  const response = await fetch(url, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

function startProgress(listElement, steps, intervalMs = 850) {
  if (!listElement) {
    return () => {};
  }

  listElement.innerHTML = steps
    .map(
      (step, index) => `
        <li class="progress-item ${index === 0 ? "active" : ""}">
          <span class="progress-dot"></span>
          <span>${step}</span>
        </li>
      `
    )
    .join("");

  const items = Array.from(listElement.querySelectorAll(".progress-item"));
  let currentIndex = 0;
  const tick = () => {
    items.forEach((item, index) => {
      item.classList.toggle("done", index < currentIndex);
      item.classList.toggle("active", index === currentIndex);
    });
    currentIndex = Math.min(currentIndex + 1, items.length - 1);
  };

  tick();
  const handle = window.setInterval(tick, intervalMs);
  return () => {
    window.clearInterval(handle);
    items.forEach((item) => item.classList.remove("active"));
    items.forEach((item) => item.classList.add("done"));
  };
}

function renderCandidates(candidates) {
  candidateGrid.innerHTML = "";
  candidates.forEach((candidate, index) => {
    const card = document.createElement("article");
    card.className = `candidate-card ${candidate.is_selected ? "active" : ""}`;
    card.innerHTML = `
      <strong>${candidate.title}</strong>
      <span>${candidate.platform} • ${candidate.niche}</span>
      <span>${candidate.audience}</span>
      <div class="candidate-score">Archetype: ${candidate.product_archetype}</div>
      <div class="candidate-score">Demand: ${candidate.demand_score}/10 • Weighted: ${candidate.weighted_score}</div>
      <p>${candidate.selection_reason}</p>
    `;
    card.style.opacity = "0";
    card.style.transform = "translateY(10px)";
    candidateGrid.appendChild(card);
    window.setTimeout(() => {
      card.style.transition = "opacity 220ms ease, transform 220ms ease";
      card.style.opacity = "1";
      card.style.transform = candidate.is_selected ? "translateY(-4px)" : "translateY(0)";
    }, 90 * index);
  });
}

function renderBlueprint(snapshot) {
  const blueprint = snapshot.blueprint;
  blueprintContent.innerHTML = `
    <article class="detail-card">
      <h3>Product Brief</h3>
      <p><strong>Name:</strong> ${blueprint.product_name ?? "Pending"}</p>
      <p><strong>Archetype:</strong> ${blueprint.product_archetype ?? "Pending"}</p>
      <p><strong>Type:</strong> ${blueprint.product_type ?? "Pending"}</p>
      <p><strong>Customer Problem:</strong> ${blueprint.customer_problem ?? "Pending"}</p>
      <p><strong>Transformation:</strong> ${blueprint.transformation ?? "Pending"}</p>
      <p><strong>Positioning:</strong> ${blueprint.positioning ?? "Pending"}</p>
      <p><strong>Promise:</strong> ${blueprint.promise ?? "Pending"}</p>
      <p><strong>Core Features:</strong></p>
      <pre>${blueprint.core_features ?? "Pending"}</pre>
      <p><strong>Pricing Notes:</strong> ${blueprint.pricing_notes ?? "Pending"}</p>
    </article>
    <article class="detail-card">
      <h3>Package Map</h3>
      <p><strong>Format Architecture:</strong> ${blueprint.format_architecture ?? "Pending"}</p>
      <p><strong>Deliverables:</strong></p>
      <pre>${blueprint.deliverables ?? "Pending"}</pre>
      <p><strong>Module Map:</strong></p>
      <pre>${blueprint.module_map ?? "Pending"}</pre>
      <p><strong>Customer Journey:</strong></p>
      <pre>${blueprint.customer_journey ?? "Pending"}</pre>
      <p><strong>Release Notes:</strong> ${blueprint.release_notes ?? "Pending"}</p>
    </article>
  `;
}

function renderForge(snapshot) {
  const forge = snapshot.forge;
  const packageData = forge.package || {};
  const downloads = forge.downloads || [];
  const links = downloads
    .map((asset) => `<li><a href="${asset.url}" target="_blank" rel="noreferrer">${asset.name}</a></li>`)
    .join("");
  const imageDownloads = downloads.filter((asset) => /\.(png|svg)$/i.test(asset.name));
  const previewMarkup = imageDownloads.length
    ? `
      <div class="preview-grid">
        ${imageDownloads
          .map(
            (asset) => `
              <figure class="preview-card">
                <img src="${asset.url}" alt="${asset.name}" />
                <figcaption>${asset.name}</figcaption>
              </figure>
            `
          )
          .join("")}
      </div>
    `
    : "";

  forgeContent.innerHTML = `
    <article class="detail-card">
      <h3>Digital Product System</h3>
      <p><strong>Archetype:</strong> ${packageData.product_archetype ?? snapshot.blueprint?.product_archetype ?? "Pending"}</p>
      <p><strong>Customer Result:</strong> ${packageData.customer_result ?? "Pending"}</p>
      <p><strong>Bundle Value:</strong> ${packageData.bundle_value ?? "Pending"}</p>
      <p>${forge.product_summary ?? "Pending"}</p>
      <p><strong>AI Product System:</strong></p>
      <pre>${forge.system_overview ?? "Pending"}</pre>
      <p><strong>Examples and Swipes:</strong></p>
      <pre>${forge.examples_preview ?? "Pending"}</pre>
      ${previewMarkup}
    </article>
    <article class="detail-card">
      <h3>Implementation and Downloads</h3>
      <p><strong>Prompt Pack Preview:</strong></p>
      <pre>${forge.prompt_pack_preview ?? "Pending"}</pre>
      <p><strong>Implementation Map:</strong></p>
      <pre>${forge.implementation_map ?? "Pending"}</pre>
      <ul class="download-list">${links}</ul>
      <p><strong>Landing Page Copy:</strong></p>
      <pre>${forge.landing_page_copy ?? "Pending"}</pre>
      <p><strong>Waitlist Copy:</strong></p>
      <pre>${forge.waitlist_copy ?? "Pending"}</pre>
      <p><strong>FAQ:</strong></p>
      <pre>${forge.faq ?? "Pending"}</pre>
    </article>
  `;
}

if (promptForm) {
  promptForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt) {
      return;
    }

    promptSubmit.disabled = true;
    promptSubmit.textContent = "Analyzing...";

    addMessage("user", "Prompt", prompt);
    show(signalPanel);
    show(signalLoading);
    hide(blueprintPanel);
    hide(forgePanel);
    candidateGrid.innerHTML = "";
    blueprintContent.innerHTML = "";
    forgeContent.innerHTML = "";
    if (signalTicker) signalTicker();
    signalTicker = startProgress(signalProgress, [
      "Scanning evergreen markets and buyer intent",
      "Ranking pain points by urgency and repeatability",
      "Stress-testing product formats for speed to market",
      "Selecting the strongest niche candidate",
    ]);

    try {
      const data = await postForm("/ui/api/prompt-intake", { prompt });
      currentIdeaId = data.snapshot.idea.id;
      if (signalTicker) signalTicker();
      hide(signalLoading);
      renderCandidates(data.candidates);
      addMessage(
        "assistant",
        "Signal",
        `Selected ${data.snapshot.idea.title} for ${data.snapshot.idea.audience} in ${data.snapshot.idea.niche}.\n\nArchetype: ${data.snapshot.signal.product_archetype ?? "Pending"}\nTransformation: ${data.snapshot.signal.transformation_promise ?? "Pending"}\n\n${data.snapshot.signal.selection_reason ?? "The engine weighed multiple opportunities and chose the strongest current option."}`
      );
      show(blueprintPanel);
      show(blueprintButton);
    } catch (error) {
      if (signalTicker) signalTicker();
      hide(signalLoading);
      addMessage("assistant", "Error", "Signal failed while analyzing prompt demand and choosing an opportunity.");
    } finally {
      promptSubmit.disabled = false;
      promptSubmit.textContent = "Run CaribAI Labs";
      promptInput.value = "";
    }
  });
}

promptChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const prompt = chip.dataset.prompt || "";
    promptInput.value = prompt;
    promptInput.focus();
  });
});

if (blueprintButton) {
  blueprintButton.addEventListener("click", async () => {
    if (!currentIdeaId) {
      return;
    }

    hide(blueprintButton);
    show(blueprintLoading);

    try {
      const data = await postForm(`/ui/api/ideas/${currentIdeaId}/blueprint`);
      renderBlueprint(data.snapshot);
      hide(blueprintLoading);
      addMessage(
        "assistant",
        "Blueprint",
        `${data.snapshot.blueprint.product_name ?? "The product"} is now structured as a ${data.snapshot.blueprint.product_type ?? "digital product package"}.\n\nArchetype: ${data.snapshot.blueprint.product_archetype ?? "Pending"}\nTransformation: ${data.snapshot.blueprint.transformation ?? "Pending"}`
      );
      show(forgePanel);
      show(forgeButton);
    } catch (error) {
      hide(blueprintLoading);
      show(blueprintButton);
      addMessage("assistant", "Error", "Blueprint generation failed.");
    }
  });
}

if (forgeButton) {
  forgeButton.addEventListener("click", async () => {
    if (!currentIdeaId) {
      return;
    }

    hide(forgeButton);
    show(forgeLoading);
    if (forgeTicker) forgeTicker();
    forgeTicker = startProgress(forgeProgress, [
      "Composing workbook sections and guided exercises",
      "Drafting the prompt pack and quality checklists",
      "Styling the premium PDF and worksheet layouts",
      "Rendering marketplace cover and preview images",
      "Packaging every file into the final bundle",
    ], 950);

    try {
      const data = await postForm(`/ui/api/ideas/${currentIdeaId}/forge`);
      if (forgeTicker) forgeTicker();
      renderForge(data.snapshot);
      hide(forgeLoading);
      addMessage(
        "assistant",
        "Forge",
        `The digital product bundle has been forged.\n\nCustomer result: ${data.snapshot.forge.package?.customer_result ?? "Pending"}\nBundle value: ${data.snapshot.forge.package?.bundle_value ?? "Pending"}`
      );
    } catch (error) {
      if (forgeTicker) forgeTicker();
      hide(forgeLoading);
      show(forgeButton);
      addMessage("assistant", "Error", "Forge failed while building the customer-facing bundle.");
    }
  });
}
