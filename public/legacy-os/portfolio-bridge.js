(() => {
  const allowed = new Set([
    "cv",
    "projects",
    "apps",
    "about",
    "profile",
    "contact",
    "scrapbook",
    "terminal",
    "games",
  ]);
  window.addEventListener("message", (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== window.parent
    )
      return;
    if (
      event.data?.type !== "portfolio-open-window" ||
      !allowed.has(event.data.name)
    )
      return;
    document.querySelector(`[data-open-window="${event.data.name}"]`)?.click();
  });
  document.addEventListener("click", (event) => {
    const section = event.target.closest("[data-portfolio-section]")?.dataset
      .portfolioSection;
    if (section)
      window.parent.postMessage(
        { type: "portfolio-navigate", section },
        window.location.origin,
      );
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && window.parent !== window)
      window.parent.postMessage(
        { type: "portfolio-desktop-close" },
        window.location.origin,
      );
  });
  window.setMountedPortfolioDisk?.({
    id: "code",
    label: "Archive",
    color: "#c2cfac",
    status: "Personal archive mounted: CV, projects, media, and the arcade.",
  });
})();
