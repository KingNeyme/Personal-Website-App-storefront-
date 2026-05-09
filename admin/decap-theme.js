const applyDecapTheme = () => {
  document.body.classList.add("caribai-decap-theme");

  const title = document.querySelector("title");
  if (title) {
    title.textContent = "CaribAI CMS Workspace";
  }

  document.querySelectorAll("button, [role='button']").forEach((element) => {
    element.classList.add("caribai-theme-button");
  });

  document.querySelectorAll("input, textarea, select").forEach((element) => {
    element.classList.add("caribai-theme-field");
  });
};

const observer = new MutationObserver(() => {
  applyDecapTheme();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyDecapTheme);
} else {
  applyDecapTheme();
}
