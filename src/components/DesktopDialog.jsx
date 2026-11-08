import { useEffect, useRef } from "react";

export default function DesktopDialog({
  onClose,
  onNavigate,
  returnToWorkbench,
}) {
  const ref = useRef(),
    frame = useRef();
  const handlers = useRef({ onClose, onNavigate });
  handlers.current = { onClose, onNavigate };
  useEffect(() => {
    const previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.showModal();
    const handle = (event) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      if (event.data?.type === "portfolio-desktop-close")
        handlers.current.onClose();
      if (
        event.data?.type === "portfolio-navigate" &&
        ["work", "apps", "archive", "contact", "education"].includes(
          event.data.section,
        )
      )
        handlers.current.onNavigate(event.data.section);
    };
    window.addEventListener("message", handle);
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
      window.removeEventListener("message", handle);
    };
  }, []);
  function openWindow(name) {
    frame.current?.contentWindow?.postMessage(
      { type: "portfolio-open-window", name },
      window.location.origin,
    );
  }
  return (
    <dialog
      ref={ref}
      className="desktop-dialog"
      onCancel={onClose}
      aria-labelledby="desktop-dialog-title"
    >
      <header className="desktop-shell-header">
        <div>
          <span className="eyebrow">PERSONAL ARCHIVE</span>
          <h2 id="desktop-dialog-title">Maksym OS</h2>
        </div>
        <div className="desktop-shortcuts" aria-label="Desktop shortcuts">
          <button onClick={() => openWindow("cv")}>CV</button>
          <button onClick={() => openWindow("projects")}>Projects</button>
          <button onClick={() => openWindow("scrapbook")}>Media</button>
          <button onClick={() => openWindow("contact")}>Contact</button>
        </div>
        <button className="desktop-close" onClick={onClose}>
          {returnToWorkbench ? "Back to workbench" : "Back to portfolio"}{" "}
          <span>×</span>
        </button>
      </header>
      <iframe
        ref={frame}
        className="portfolio-desktop-frame"
        src="/legacy-os/index.html?surface=screen&scale=1"
        title="Maksym OS: CV, projects, contact, media, terminal, and games"
      />
      <footer className="desktop-shell-footer">
        <span>Maksym OS</span>
        <span>ESC TO RETURN</span>
      </footer>
    </dialog>
  );
}
