(function () {
  const shell = document.querySelector(".os-shell");
  const desktop = document.getElementById("desktop");
  const clock = document.getElementById("desktop-clock");
  const alertBox = document.getElementById("desktop-alert");
  const triggers = [...document.querySelectorAll(".menu-trigger")];
  const dropdowns = [...document.querySelectorAll(".dropdown")];
  const windows = [...document.querySelectorAll(".window")];
  let topZ = 50;
  let alertTimer = 0;
  let audioContext = null;
  let mountedDisk = null;

  const defaultMessage = "That command is wired for the next pass.";
  const desktopIconStorageKey = "maksym-os.desktop-icons.v3";
  const desktopIconDefaults = {
    apps: { x: "34px", y: "72px" },
    projects: { x: "34px", y: "150px" },
    about: { x: "34px", y: "228px" },
    contact: { x: "34px", y: "306px" },
    cv: { x: "34px", y: "384px" },
    games: { x: "calc(100% - 210px)", y: "54px" },
    untitled: { x: "calc(100% - 96px)", y: "54px" },
    trash: { x: "calc(100% - 86px)", y: "calc(100% - 92px)" }
  };
  let selectedDesktopIcon = null;
  let desktopIconDrag = null;
  let desktopDropTarget = null;
  const labelClasses = ["label-red", "label-blue", "label-green"];
  const labelNames = {
    "label-red": "Urgent Red",
    "label-blue": "Deep Blue",
    "label-green": "Ready Green"
  };
  const launchAliases = {
    about: "about",
    apps: "apps",
    calculator: "calculator",
    cad: "fpv-detail",
    contact: "contact",
    controls: "control-panels",
    "control-panels": "control-panels",
    cv: "cv",
    drone: "fpv-detail",
    email: "email",
    find: "find",
    flappy: "flappy-game",
    games: "games",
    graphics: "graphics",
    juice: "juice-detail",
    mine: "minesweeper-game",
    mines: "minesweeper-game",
    minesweeper: "minesweeper-game",
    "minesweeper-game": "minesweeper-game",
    note: "note",
    notepad: "note",
    portfolio: "portfolio-detail",
    printers: "printers",
    profile: "profile",
    projects: "projects",
    puzzle: "puzzle",
    readme: "readme",
    recent: "recent",
    scrapbook: "scrapbook",
    snake: "snake-game",
    sound: "sound",
    stickies: "stickies",
    tasks: "tasks",
    terminal: "terminal",
    trash: "trash",
    untitled: "untitled",
    resume: "cv"
  };
  const diskLockedWindows = new Set(["games", "flappy-game", "snake-game", "minesweeper-game"]);

  function getDesktopScale() {
    const shellRect = shell.getBoundingClientRect();
    return shell.offsetWidth ? shellRect.width / shell.offsetWidth : 1;
  }

  function setClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function showAlert(message) {
    window.clearTimeout(alertTimer);
    alertBox.textContent = message;
    alertBox.classList.add("show");
    alertTimer = window.setTimeout(() => {
      alertBox.classList.remove("show");
    }, 1800);
  }

  function isDiskMounted() {
    return Boolean(mountedDisk);
  }

  function updateMountedDiskUI() {
    document.body.classList.toggle("disk-mounted", isDiskMounted());
    shell.dataset.mountedDisk = mountedDisk?.id || "";
    document.querySelectorAll(".disk-mounted-only").forEach((item) => {
      item.toggleAttribute("aria-hidden", !isDiskMounted());
    });
    document.querySelectorAll(".disk-icon span:last-child").forEach((label) => {
      label.textContent = mountedDisk ? `${mountedDisk.label} Disk` : "No Disk";
    });
  }

  function setMountedPortfolioDisk(disk) {
    const nextDisk = disk || null;
    const previousId = mountedDisk?.id || "";
    const nextId = nextDisk?.id || "";
    mountedDisk = nextDisk;
    updateMountedDiskUI();
    if (!mountedDisk) {
      diskLockedWindows.forEach((name) => {
        const win = document.querySelector(`[data-window="${name}"]`);
        if (win) closeWindow(win);
      });
    }
    if (previousId !== nextId) {
      showAlert(mountedDisk ? mountedDisk.status : "Disk ejected. Hidden folder unmounted.");
    }
  }

  window.setMountedPortfolioDisk = setMountedPortfolioDisk;
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.data?.type !== "portfolio-disk") return;
    setMountedPortfolioDisk(event.data.disk || null);
  });

  function getAudioContext() {
    if (audioContext) {
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
      return audioContext;
    }
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return null;
    audioContext = new AudioEngine();
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function playTone(frequency = 440, duration = 0.1, delay = 0, type = "square") {
    const context = getAudioContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playSound(name = "beep") {
    const patterns = {
      alert: [
        [260, 0.08, 0],
        [180, 0.12, 0.09]
      ],
      beep: [[520, 0.09, 0]],
      boot: [
        [330, 0.08, 0],
        [440, 0.08, 0.1],
        [660, 0.12, 0.2]
      ],
      click: [[760, 0.04, 0]]
    };
    (patterns[name] || patterns.beep).forEach(([frequency, duration, delay]) => {
      playTone(frequency, duration, delay);
    });
  }

  function desktopIconKey(icon) {
    return icon.dataset.openWindow || icon.getAttribute("aria-label") || "";
  }

  function setDesktopIconPosition(icon, position) {
    if (!position) return;
    icon.style.setProperty("--x", position.x);
    icon.style.setProperty("--y", position.y);
  }

  function readStoredDesktopIconPositions() {
    try {
      return JSON.parse(window.localStorage.getItem(desktopIconStorageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveDesktopIconPositions() {
    const positions = {};
    document.querySelectorAll(".desktop-icon").forEach((icon) => {
      const key = desktopIconKey(icon);
      if (!key) return;
      positions[key] = {
        x: icon.style.getPropertyValue("--x").trim(),
        y: icon.style.getPropertyValue("--y").trim()
      };
    });

    try {
      window.localStorage.setItem(desktopIconStorageKey, JSON.stringify(positions));
    } catch (error) {
      // Local storage can be unavailable in hardened previews; dragging still works for the session.
    }
  }

  function applyDesktopIconPositions(positions = readStoredDesktopIconPositions()) {
    document.querySelectorAll(".desktop-icon").forEach((icon) => {
      const key = desktopIconKey(icon);
      setDesktopIconPosition(icon, positions[key] || desktopIconDefaults[key]);
    });
  }

  function clearDesktopIconSelection() {
    selectedDesktopIcon?.classList.remove("is-selected");
    selectedDesktopIcon = null;
  }

  function selectDesktopIcon(icon) {
    if (selectedDesktopIcon !== icon) {
      clearDesktopIconSelection();
    }
    selectedDesktopIcon = icon;
    icon.classList.add("is-selected");
  }

  function desktopIconLabel(icon) {
    return icon.querySelector("span:last-child")?.textContent.trim() || "Item";
  }

  function snapToDesktopGrid(value) {
    return Math.round(value / 8) * 8;
  }

  function clampDesktopIconPosition(icon, x, y) {
    const width = icon.offsetWidth;
    const height = icon.offsetHeight;
    const controlStripSpace = 28;
    const maxX = Math.max(6, desktop.clientWidth - width - 6);
    const maxY = Math.max(6, desktop.clientHeight - height - controlStripSpace);

    return {
      x: Math.min(Math.max(6, x), maxX),
      y: Math.min(Math.max(6, y), maxY)
    };
  }

  function moveDesktopIcon(icon, x, y, snap = false) {
    const next = clampDesktopIconPosition(icon, snap ? snapToDesktopGrid(x) : x, snap ? snapToDesktopGrid(y) : y);
    icon.style.setProperty("--x", `${Math.round(next.x)}px`);
    icon.style.setProperty("--y", `${Math.round(next.y)}px`);
  }

  function clearDesktopDropTarget() {
    desktopDropTarget?.classList.remove("is-drop-target");
    desktopDropTarget = null;
  }

  function updateDesktopDropTarget(icon) {
    clearDesktopDropTarget();
    if (!desktopIconDrag?.moved) return;

    const iconRect = icon.getBoundingClientRect();
    const centerX = iconRect.left + iconRect.width / 2;
    const centerY = iconRect.top + iconRect.height / 2;
    const targets = [...document.querySelectorAll(".desktop-icon.folder-icon, .desktop-icon.disk-icon, .desktop-icon.trash-icon")]
      .filter((target) => target !== icon);

    desktopDropTarget = targets.find((target) => {
      const rect = target.getBoundingClientRect();
      return centerX >= rect.left && centerX <= rect.right && centerY >= rect.top && centerY <= rect.bottom;
    }) || null;
    desktopDropTarget?.classList.add("is-drop-target");
  }

  function handleDesktopIconDrop(icon, target) {
    if (!target) return;

    if (target.classList.contains("trash-icon")) {
      showAlert(`${desktopIconLabel(icon)} stays out of the Trash for now.`);
      return;
    }

    showAlert(`${desktopIconLabel(icon)} dropped on ${desktopIconLabel(target)}.`);
    if (target.dataset.openWindow) {
      openWindow(target.dataset.openWindow);
    }
  }

  function closeMenus() {
    dropdowns.forEach((menu) => menu.classList.remove("open"));
    triggers.forEach((trigger) => trigger.classList.remove("active"));
  }

  function openMenu(name) {
    closeMenus();
    const dropdown = document.querySelector(`[data-dropdown="${name}"]`);
    const trigger = document.querySelector(`[data-menu="${name}"]`);
    if (!dropdown || !trigger) return;
    dropdown.classList.add("open");
    trigger.classList.add("active");
  }

  function activateWindow(win) {
    if (!win) return;
    topZ += 1;
    windows.forEach((item) => item.classList.remove("active"));
    win.classList.add("active");
    win.style.zIndex = String(topZ);
  }

  function stashWindowFrame(win) {
    win.dataset.restoreLeft = win.style.left || "";
    win.dataset.restoreTop = win.style.top || "";
    win.dataset.restoreWidth = win.style.width || "";
    win.dataset.restoreHeight = win.style.height || "";
  }

  function restoreWindowFrame(win) {
    if (!win.classList.contains("is-zoomed")) return;

    win.classList.remove("is-zoomed");
    win.style.left = win.dataset.restoreLeft || "";
    win.style.top = win.dataset.restoreTop || "";
    win.style.width = win.dataset.restoreWidth || "";
    win.style.height = win.dataset.restoreHeight || "";
    delete win.dataset.restoreLeft;
    delete win.dataset.restoreTop;
    delete win.dataset.restoreWidth;
    delete win.dataset.restoreHeight;
  }

  function toggleZoomWindow(win) {
    if (win.classList.contains("is-zoomed")) {
      restoreWindowFrame(win);
      return;
    }

    stashWindowFrame(win);
    win.classList.add("is-zoomed");
    activateWindow(win);
  }

  function closeWindow(win) {
    restoreWindowFrame(win);
    win.classList.remove("open", "active");
  }

  function openWindow(name) {
    if (diskLockedWindows.has(name) && !isDiskMounted()) {
      showAlert("Insert a floppy disk to mount Do Not Open.");
      return "locked";
    }

    const win = document.querySelector(`[data-window="${name}"]`);
    if (!win) {
      showAlert(defaultMessage);
      return false;
    }
    win.classList.add("open");
    activateWindow(win);
    win.dispatchEvent(new CustomEvent("window-opened"));
    return true;
  }

  function clearWindows() {
    windows.forEach((win) => {
      closeWindow(win);
    });
  }

  function arrangeIcons() {
    if (window.matchMedia("(max-width: 720px)").matches) return;
    try {
      window.localStorage.removeItem(desktopIconStorageKey);
    } catch (error) {
      // Ignore storage failures; the visible reset still happens.
    }
    clearDesktopIconSelection();
    applyDesktopIconPositions({});
    showAlert("Desktop icons arranged.");
  }

  function launchTarget(name) {
    const cleaned = name.toLowerCase().replace(/\.md$/, "").trim();
    const target = launchAliases[cleaned];
    if (!target) return false;
    return openWindow(target);
  }

  function setSelectedIconLabel(labelClass) {
    if (!selectedDesktopIcon) {
      showAlert("Select a desktop icon first.");
      return;
    }
    selectedDesktopIcon.classList.remove(...labelClasses);
    selectedDesktopIcon.classList.add(labelClass);
    showAlert(`${desktopIconLabel(selectedDesktopIcon)} labeled ${labelNames[labelClass]}.`);
  }

  function cycleSelectedIconLabel() {
    if (!selectedDesktopIcon) {
      showAlert("Select a desktop icon first.");
      return;
    }
    const currentIndex = labelClasses.findIndex((labelClass) => selectedDesktopIcon.classList.contains(labelClass));
    const next = labelClasses[(currentIndex + 1) % labelClasses.length];
    setSelectedIconLabel(next);
  }

  function handleDesktopMessage(target) {
    const label = target?.textContent.trim() || "Command";
    const messages = {
      "Copy": "Copied selected portfolio vibes to clipboard-ish memory.",
      "Paste": "Paste buffer is empty. Very vintage.",
      "Select All": "Selected everything emotionally. Use icons for real selection.",
      "Open Case Study": "Case study placeholder. Real write-up goes here.",
      "View Build Log": "Build log placeholder. The workbench story will live here.",
      "Inspect Parts": "Parts inspection will connect to the real CAD model later.",
      "Open Sketches": "Sketch archive placeholder. Blender/CAD exports go here."
    };
    showAlert(messages[label] || defaultMessage);
  }

  function handleAction(action, target) {
    if (action === "clear-windows") {
      clearWindows();
      return;
    }
    if (action === "toggle-dither") {
      shell.classList.toggle("no-dither");
      return;
    }
    if (action === "arrange-icons") {
      arrangeIcons();
      return;
    }
    if (action === "new-note") {
      openWindow("note");
      showAlert("New note opened.");
      return;
    }
    if (action === "desktop-message") {
      handleDesktopMessage(target);
      return;
    }
    if (action?.startsWith("label-")) {
      setSelectedIconLabel(action);
      return;
    }
    if (action === "cycle-label") {
      cycleSelectedIconLabel();
      return;
    }
    if (action === "system-beep") {
      playSound("beep");
      showAlert("Beep.");
      return;
    }
    if (action === "print-cv") {
      showAlert("CV printer queued. Add the real PDF and this becomes a download.");
      return;
    }
    showAlert(defaultMessage);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const name = trigger.dataset.menu;
      const menu = document.querySelector(`[data-dropdown="${name}"]`);
      if (menu?.classList.contains("open")) {
        closeMenus();
      } else {
        openMenu(name);
      }
    });

    trigger.addEventListener("mouseenter", () => {
      if (dropdowns.some((menu) => menu.classList.contains("open"))) {
        openMenu(trigger.dataset.menu);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const openTarget = event.target.closest("[data-open-window]");
    const actionTarget = event.target.closest("[data-action]");

    if (!event.target.closest(".desktop-icon") && !event.target.closest(".dropdown") && !actionTarget) {
      clearDesktopIconSelection();
    }

    if (openTarget) {
      event.preventDefault();
      openWindow(openTarget.dataset.openWindow);
      if (!openTarget.classList.contains("menu-trigger")) {
        closeMenus();
      }
      return;
    }

    if (actionTarget) {
      event.preventDefault();
      handleAction(actionTarget.dataset.action, actionTarget);
      closeMenus();
      return;
    }

    if (!event.target.closest(".dropdown") && !event.target.closest(".menu-bar")) {
      closeMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
      const active = document.querySelector(".window.active");
      active?.classList.remove("active");
    }
  });

  windows.forEach((win) => {
    const titleBar = win.querySelector(".title-bar");
    const closeButton = win.querySelector(".close-window");
    const zoomButton = win.querySelector(".zoom-window");
    const resizeHandle = document.createElement("span");
    let drag = null;
    let resize = null;

    resizeHandle.className = "resize-handle";
    resizeHandle.setAttribute("aria-hidden", "true");
    win.appendChild(resizeHandle);

    win.addEventListener("pointerdown", () => activateWindow(win));

    closeButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      closeWindow(win);
    });

    zoomButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleZoomWindow(win);
    });

    titleBar?.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button") || win.classList.contains("is-zoomed")) return;

      const rect = win.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top
      };
      activateWindow(win);
      titleBar.setPointerCapture(event.pointerId);
    });

    titleBar?.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;

      const shellRect = shell.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();
      const winRect = win.getBoundingClientRect();
      const scale = getDesktopScale();
      const nextLeft = drag.left + event.clientX - drag.startX;
      const nextTop = drag.top + event.clientY - drag.startY;
      const minLeft = shellRect.left + 6;
      const maxLeft = shellRect.right - winRect.width - 6;
      const minTop = desktopRect.top + 6;
      const maxTop = desktopRect.bottom - 40;
      const clampedLeft = Math.min(Math.max(nextLeft, minLeft), Math.max(minLeft, maxLeft));
      const clampedTop = Math.min(Math.max(nextTop, minTop), Math.max(minTop, maxTop));

      win.style.left = `${(clampedLeft - desktopRect.left) / scale}px`;
      win.style.top = `${(clampedTop - desktopRect.top) / scale}px`;
    });

    titleBar?.addEventListener("pointerup", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      titleBar.releasePointerCapture(event.pointerId);
      drag = null;
    });

    titleBar?.addEventListener("pointercancel", () => {
      drag = null;
    });

    resizeHandle.addEventListener("pointerdown", (event) => {
      if (win.classList.contains("is-zoomed")) return;

      const rect = win.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();
      const scale = getDesktopScale();
      resize = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: (rect.left - desktopRect.left) / scale,
        top: (rect.top - desktopRect.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale
      };
      event.preventDefault();
      event.stopPropagation();
      activateWindow(win);
      win.classList.add("is-resized");
      document.body.classList.add("window-resizing");
      resizeHandle.setPointerCapture(event.pointerId);
    });

    function moveResize(event) {
      if (!resize || event.pointerId !== resize.pointerId) return;

      const scale = getDesktopScale();
      const desktopWidth = desktop.getBoundingClientRect().width / scale;
      const desktopHeight = desktop.getBoundingClientRect().height / scale;
      const minWidth = 210;
      const minHeight = 118;
      const maxWidth = Math.max(minWidth, desktopWidth - resize.left - 8);
      const maxHeight = Math.max(minHeight, desktopHeight - resize.top - 30);
      const nextWidth = Math.min(Math.max(resize.width + (event.clientX - resize.startX) / scale, minWidth), maxWidth);
      const nextHeight = Math.min(Math.max(resize.height + (event.clientY - resize.startY) / scale, minHeight), maxHeight);

      event.preventDefault();
      win.style.width = `${Math.round(nextWidth)}px`;
      win.style.height = `${Math.round(nextHeight)}px`;
    }

    function stopResize(event) {
      if (!resize || event.pointerId !== resize.pointerId) return;
      if (resizeHandle.hasPointerCapture(event.pointerId)) {
        resizeHandle.releasePointerCapture(event.pointerId);
      }
      resize = null;
      document.body.classList.remove("window-resizing");
    }

    resizeHandle.addEventListener("pointermove", moveResize);
    resizeHandle.addEventListener("pointerup", stopResize);
    document.addEventListener("pointermove", moveResize);
    document.addEventListener("pointerup", stopResize);
    resizeHandle.addEventListener("pointercancel", () => {
      resize = null;
      document.body.classList.remove("window-resizing");
    });
    resizeHandle.addEventListener("lostpointercapture", () => {
      resize = null;
      document.body.classList.remove("window-resizing");
    });
  });

  applyDesktopIconPositions();

  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    function dragEventId(event) {
      return event.pointerId ?? "mouse";
    }

    function startDesktopIconDrag(event) {
      if (window.matchMedia("(max-width: 720px)").matches) return;
      if (event.button && event.button !== 0) return;
      if (desktopIconDrag) return;

      const desktopRect = desktop.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const scale = getDesktopScale();
      const pointerId = dragEventId(event);

      event.preventDefault();
      event.stopPropagation();
      closeMenus();
      selectDesktopIcon(icon);
      desktopIconDrag = {
        icon,
        pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: (iconRect.left - desktopRect.left) / scale,
        top: (iconRect.top - desktopRect.top) / scale,
        moved: false
      };
      if (typeof icon.setPointerCapture === "function" && event.pointerId !== undefined) {
        icon.setPointerCapture(event.pointerId);
      }
    }

    function moveDesktopIconDrag(event) {
      if (!desktopIconDrag || desktopIconDrag.icon !== icon || desktopIconDrag.pointerId !== dragEventId(event)) return;

      const scale = getDesktopScale();
      const dx = (event.clientX - desktopIconDrag.startX) / scale;
      const dy = (event.clientY - desktopIconDrag.startY) / scale;

      if (!desktopIconDrag.moved && Math.hypot(dx, dy) < 4) return;

      event.preventDefault();
      desktopIconDrag.moved = true;
      icon.classList.add("is-dragging");
      document.body.classList.add("desktop-dragging");
      moveDesktopIcon(icon, desktopIconDrag.left + dx, desktopIconDrag.top + dy);
      updateDesktopDropTarget(icon);
    }

    function stopDesktopIconDrag(event) {
      if (!desktopIconDrag || desktopIconDrag.icon !== icon || desktopIconDrag.pointerId !== dragEventId(event)) return;

      event.preventDefault();
      if (typeof icon.hasPointerCapture === "function" && event.pointerId !== undefined && icon.hasPointerCapture(event.pointerId)) {
        icon.releasePointerCapture(event.pointerId);
      }

      if (desktopIconDrag.moved) {
        const x = parseFloat(icon.style.getPropertyValue("--x")) || desktopIconDrag.left;
        const y = parseFloat(icon.style.getPropertyValue("--y")) || desktopIconDrag.top;
        const target = desktopDropTarget;

        moveDesktopIcon(icon, x, y, true);
        handleDesktopIconDrop(icon, target);
        saveDesktopIconPositions();
        icon.dataset.dragged = "true";
        window.setTimeout(() => {
          delete icon.dataset.dragged;
        }, 0);
      }

      icon.classList.remove("is-dragging");
      document.body.classList.remove("desktop-dragging");
      clearDesktopDropTarget();
      desktopIconDrag = null;
    }

    icon.addEventListener("pointerdown", startDesktopIconDrag);
    icon.addEventListener("mousedown", startDesktopIconDrag);
    icon.addEventListener("pointermove", moveDesktopIconDrag);
    document.addEventListener("pointermove", moveDesktopIconDrag);
    document.addEventListener("mousemove", moveDesktopIconDrag);
    icon.addEventListener("pointerup", stopDesktopIconDrag);
    document.addEventListener("pointerup", stopDesktopIconDrag);
    document.addEventListener("mouseup", stopDesktopIconDrag);
    icon.addEventListener("pointercancel", (event) => {
      if (!desktopIconDrag || desktopIconDrag.icon !== icon || desktopIconDrag.pointerId !== dragEventId(event)) return;
      icon.classList.remove("is-dragging");
      document.body.classList.remove("desktop-dragging");
      clearDesktopDropTarget();
      desktopIconDrag = null;
    });
    icon.addEventListener("lostpointercapture", () => {
      if (!desktopIconDrag || desktopIconDrag.icon !== icon) return;
      icon.classList.remove("is-dragging");
      document.body.classList.remove("desktop-dragging");
      clearDesktopDropTarget();
      desktopIconDrag = null;
    });

    icon.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (icon.dataset.dragged === "true") return;
      closeMenus();
      selectDesktopIcon(icon);
    });

    icon.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (icon.dataset.dragged === "true") return;
      const target = icon.dataset.openWindow;
      if (target) openWindow(target);
    });
  });

  document.querySelector(".power")?.addEventListener("click", () => {
    playSound("alert");
    showAlert("Nice try. The portfolio is staying awake.");
  });

  function initCalculatorApp() {
    const output = document.getElementById("calc-output");
    const buttons = [...document.querySelectorAll("[data-calc]")];
    if (!output || !buttons.length) return;

    let expression = "";
    let justCalculated = false;

    function render(value = expression || "0") {
      output.textContent = value.slice(-18);
    }

    function calculate() {
      const parts = expression.trim().split(/\s+/);
      if (parts.length < 3) return expression || "0";

      let total = Number(parts[0]);
      for (let index = 1; index < parts.length; index += 2) {
        const operator = parts[index];
        const value = Number(parts[index + 1]);
        if (!Number.isFinite(value)) continue;
        if (operator === "+") total += value;
        if (operator === "-") total -= value;
      }
      return Number.isFinite(total) ? String(total) : "0";
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.calc;
        playSound("click");

        if (key === "clear") {
          expression = "";
          justCalculated = false;
          render();
          return;
        }

        if (key === "back") {
          expression = expression.trimEnd().slice(0, -1).trimEnd();
          justCalculated = false;
          render();
          return;
        }

        if (key === "sign") {
          const match = expression.match(/(^|[+-]\s)(-?\d+)$/);
          if (!match) return;
          const prefix = expression.slice(0, match.index) + match[1];
          const value = match[2].startsWith("-") ? match[2].slice(1) : `-${match[2]}`;
          expression = `${prefix}${value}`;
          justCalculated = false;
          render();
          return;
        }

        if (key === "=") {
          expression = calculate();
          justCalculated = true;
          render(expression);
          return;
        }

        if (/^\d$/.test(key)) {
          if (justCalculated) expression = "";
          expression += key;
          justCalculated = false;
          render();
          return;
        }

        if (key === "+" || key === "-") {
          if (!expression || /[+-]\s*$/.test(expression)) return;
          expression = `${expression.trim()} ${key} `;
          justCalculated = false;
          render();
        }
      });
    });

    render();
  }

  function initFindApp() {
    const input = document.querySelector("[data-find-input]");
    const button = document.querySelector("[data-find-submit]");
    const results = document.querySelector("[data-find-results]");
    if (!input || !button || !results) return;

    const items = [
      { label: "Apps", target: "apps", type: "folder", keywords: "mobile apps allergify absorb quarter product" },
      { label: "Projects", target: "projects", type: "folder", keywords: "projects personality hardware software" },
      { label: "FPV Drone CAD", target: "fpv-detail", type: "project", keywords: "drone cad hardware blueprint mechanical" },
      { label: "Juice Maker", target: "juice-detail", type: "project", keywords: "juice machine product prototype" },
      { label: "CV Packet", target: "cv", type: "document", keywords: "cv resume download mechanical engineering" },
      { label: "Terminal", target: "terminal", type: "app", keywords: "command shell terminal print fun" },
      { label: "Email", target: "email", type: "app", keywords: "contact send message email" },
      { label: "Do Not Open", target: "games", type: "folder", keywords: "games snake flappy minesweeper mines", requiresDisk: true },
      { label: "Minesweeper", target: "minesweeper-game", type: "game", keywords: "minesweeper mines logic grid game", requiresDisk: true },
      { label: "Control Panels", target: "control-panels", type: "utility", keywords: "settings controls dither icons sound" }
    ];

    function renderResults() {
      const stopWords = new Set(["a", "and", "for", "of", "the", "to", "with"]);
      const terms = input.value.toLowerCase().trim().split(/\s+/).filter((term) => term && !stopWords.has(term));
      const matches = items.filter((item) => {
        if (item.requiresDisk && !isDiskMounted()) return false;
        const haystack = `${item.label} ${item.type} ${item.keywords}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      }).slice(0, 5);

      results.textContent = "";
      if (!matches.length) {
        const empty = document.createElement("p");
        empty.textContent = isDiskMounted()
          ? "No matches. Try drone, apps, email, games, or CV."
          : "No matches. Try drone, apps, email, contact, or CV.";
        results.appendChild(empty);
        return;
      }

      matches.forEach((item) => {
        const row = document.createElement("button");
        row.type = "button";
        row.innerHTML = `<span>${item.label}</span><em>${item.type}</em>`;
        row.addEventListener("click", () => openWindow(item.target));
        results.appendChild(row);
      });
    }

    button.addEventListener("click", renderResults);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        renderResults();
      }
    });

    document.querySelector('[data-window="find"]')?.addEventListener("window-opened", () => {
      renderResults();
      window.setTimeout(() => input.focus(), 60);
    });
  }

  function initUtilityApps() {
    document.querySelectorAll("[data-task]").forEach((taskButton) => {
      taskButton.addEventListener("click", () => {
        const task = taskButton.dataset.task;
        taskButton.querySelector(".status-led")?.classList.add("on");
        playSound("boot");

        if (task === "open-apps") {
          openWindow("apps");
          showAlert("App catalog indexed.");
        }
        if (task === "launch-drone") {
          openWindow("fpv-detail");
          showAlert("CAD viewer warmed up.");
        }
        if (task === "open-email") {
          openWindow("email");
          showAlert("Contact draft prepared.");
        }
      });
    });

    document.querySelectorAll("[data-sound]").forEach((button) => {
      button.addEventListener("click", () => {
        playSound(button.dataset.sound);
      });
    });
  }

  function initTerminalApp() {
    const terminalWindow = document.querySelector('[data-window="terminal"]');
    const screen = document.querySelector("[data-terminal-screen]");
    const form = document.querySelector("[data-terminal-form]");
    const input = document.querySelector("[data-terminal-input]");
    if (!terminalWindow || !screen || !form || !input) return;

    const history = [];
    let historyIndex = 0;

    const fortunes = [
      "A prototype with personality beats a perfect empty page.",
      "Good CAD tells a story before the render even loads.",
      "Recruiter detected. Hide the rough edges, keep the charm.",
      "The best portfolio object is the one visitors want to poke twice.",
      "Measure once, sketch twice, make the interface memorable."
    ];

    function appendLine(text = "", type = "") {
      const line = document.createElement("div");
      line.className = `terminal-line ${type}`.trim();
      line.textContent = text;
      screen.appendChild(line);
      screen.scrollTop = screen.scrollHeight;
    }

    function writeBlock(lines, type = "") {
      lines.forEach((line) => appendLine(line, type));
    }

    function runCommand(rawCommand) {
      const command = rawCommand.trim();
      if (!command) return;

      appendLine(`guest@maksym-os:~$ ${command}`, "command");
      const [verb = "", ...args] = command.split(/\s+/);
      const normalized = verb.toLowerCase();
      const rest = args.join(" ");

      if (normalized === "clear" || normalized === "cls") {
        screen.textContent = "";
        return;
      }

      if (normalized === "help") {
        writeBlock([
          "Available commands:",
          "  help              show this list",
          "  ls / dir          list desktop things",
          "  open <name>       open apps, drone, email, minesweeper, controls...",
          "  projects          show project folders",
          "  games             show mounted game disk contents",
          "  cat <file>        read readme, contact, projects",
          "  print <text>      print text to the terminal",
          "  launch drone      open the CAD window with fake boot logs",
          "  skills            list engineering/software interests",
          "  fortune           print a useful tiny prophecy",
          "  coffee            run the productivity subsystem",
          "  beep              make a vintage beep",
          "  date              print local date/time",
          "  whoami            identify current user",
          "  clear             wipe terminal output"
        ]);
        return;
      }

      if (normalized === "ls" || normalized === "dir") {
        const desktopThings = [
          "Applications/",
          "Projects/",
          "CV Packet",
          "Contact.card",
          "Email.app",
          "Terminal.app"
        ];
        if (isDiskMounted()) desktopThings.splice(2, 0, "Do Not Open/");
        writeBlock(desktopThings);
        return;
      }

      if (normalized === "apps") {
        openWindow("apps");
        writeBlock([
          "Opening Applications...",
          "Allergify.app",
          "Absorb.app",
          "Quarter.app",
          "Terminal.app",
          "Email.app"
        ], "system");
        return;
      }

      if (normalized === "projects") {
        writeBlock([
          "Apps                  product, iOS, Android",
          "This Portfolio        interface lab",
          "FPV Drone             hardware + CAD",
          "Juice Maker           machine concept"
        ]);
        return;
      }

      if (normalized === "games") {
        if (!isDiskMounted()) {
          appendLine("Insert a floppy disk first. The hidden games folder is not mounted.", "error");
          return;
        }
        writeBlock([
          "Flappy Byte           open flappy",
          "Snake                 open snake",
          "Minesweeper           open minesweeper"
        ]);
        return;
      }

      if (normalized === "open" || normalized === "run" || normalized === "start") {
        const targetName = rest.toLowerCase().replace(/\.md$/, "");
        const launchResult = launchTarget(targetName);
        if (launchResult === "locked") {
          appendLine("Insert a floppy disk first. The hidden folder is offline.", "error");
          return;
        }
        if (launchResult) {
          appendLine(`Opening ${rest || targetName}...`, "system");
          return;
        }
        appendLine(`No launch target named "${rest}". Try: open apps`, "error");
        return;
      }

      if (normalized === "cat") {
        const file = rest.toLowerCase().replace(/\.md$/, "").trim();
        if (file === "readme" || file === "readme.md") {
          writeBlock([
            "# README.md",
            "STATUS: portfolio shell 0.4",
            "MOOD: desktop utilities waking up",
            "NEXT: wire real case studies, CV, and email endpoint"
          ], "system");
          return;
        }
        if (file === "contact" || file === "contact.card") {
          writeBlock([
            "Contact.card",
            "Email: connect endpoint later",
            "Mode: mechanical engineering portfolio with software side quests"
          ], "system");
          return;
        }
        if (file === "projects") {
          writeBlock([
            "Projects/",
            "- FPV Drone: CAD, assembly, electronics",
            "- Juice Maker: product/mechanism concept",
            "- Apps: Allergify, Absorb, Quarter",
            "- Portfolio OS: the interface you are inside"
          ], "system");
          return;
        }
        appendLine(`No readable file named "${rest}". Try: cat readme`, "error");
        return;
      }

      if (normalized === "launch" && rest.toLowerCase() === "drone") {
        writeBlock([
          "arming CAD viewer...",
          "checking prop clearance...",
          "loading wireframe cube placeholder...",
          "opening FPV Drone CAD"
        ], "system");
        playSound("boot");
        openWindow("fpv-detail");
        return;
      }

      if (normalized === "skills") {
        writeBlock([
          "Mechanical: CAD, prototyping, mechanisms, assemblies",
          "Hardware: FPV builds, electronics packaging, testing",
          "Software: React, mobile apps, interactive portfolio systems",
          "Taste: tactile interfaces, weird-but-useful UX, polished details"
        ], "system");
        return;
      }

      if (normalized === "fortune") {
        appendLine(fortunes[Math.floor(Math.random() * fortunes.length)], "system");
        return;
      }

      if (normalized === "coffee") {
        writeBlock([
          "warming mug...",
          "checking deadline pressure...",
          "productivity subsystem online"
        ], "system");
        playSound("boot");
        return;
      }

      if (normalized === "beep" || normalized === "sound") {
        playSound(rest.toLowerCase() || "beep");
        appendLine("beep", "system");
        return;
      }

      if (normalized === "theme") {
        shell.classList.toggle("no-dither");
        appendLine(shell.classList.contains("no-dither") ? "dither disabled" : "dither enabled", "system");
        return;
      }

      if (normalized === "mail" || normalized === "contact") {
        openWindow(normalized === "mail" ? "email" : "contact");
        appendLine(`Opening ${normalized}...`, "system");
        return;
      }

      if (normalized === "cv" || normalized === "resume") {
        openWindow("cv");
        appendLine("Opening CV packet...", "system");
        return;
      }

      if (normalized === "panic") {
        writeBlock([
          "panic report:",
          "screen: alive",
          "projects: recoverable",
          "taste level: still under supervision"
        ], "system");
        return;
      }

      if (normalized === "date" || normalized === "time") {
        appendLine(new Date().toLocaleString(), "system");
        return;
      }

      if (normalized === "whoami") {
        appendLine("guest, currently exploring Maksym OS", "system");
        return;
      }

      if (normalized === "pwd") {
        appendLine("/desktop/portfolio", "system");
        return;
      }

      if (normalized === "echo") {
        appendLine(rest);
        return;
      }

      if (normalized === "print") {
        appendLine(rest || "usage: print something cool");
        return;
      }

      if (normalized === "boot") {
        writeBlock([
          "checking portfolio disk... ok",
          "mounting projects... ok",
          "loading unnecessary charm... ok"
        ], "system");
        return;
      }

      if (normalized === "sudo") {
        appendLine("permission denied: this portfolio cannot be made boring", "error");
        return;
      }

      appendLine(`command not found: ${verb}. Type "help".`, "error");
    }

    function submitTerminalCommand() {
      const command = input.value;
      input.value = "";
      if (command.trim()) {
        history.push(command);
        historyIndex = history.length;
      }
      runCommand(command);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitTerminalCommand();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitTerminalCommand();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex] || "";
        input.setSelectionRange(input.value.length, input.value.length);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] || "";
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });

    terminalWindow.addEventListener("window-opened", () => {
      window.setTimeout(() => input.focus(), 60);
    });

    screen.addEventListener("click", () => input.focus());
    writeBlock([
      "Maksym OS Terminal 0.1",
      "Type \"help\" to see available commands.",
      ""
    ], "system");
  }

  function initEmailApp() {
    const emailWindow = document.querySelector('[data-window="email"]');
    const form = document.querySelector("[data-email-form]");
    const status = document.querySelector("[data-email-status]");
    const clearButton = document.querySelector("[data-email-clear]");
    if (!emailWindow || !form || !status) return;

    const sendEndpoint = "";
    const nameInput = document.querySelector("[data-email-name]");
    const replyInput = document.querySelector("[data-email-reply]");
    const subjectInput = document.querySelector("[data-email-subject]");
    const messageInput = document.querySelector("[data-email-message]");

    function setStatus(message, tone = "") {
      status.textContent = message;
      status.dataset.tone = tone;
    }

    function payload() {
      return {
        name: nameInput.value.trim(),
        replyTo: replyInput.value.trim(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim()
      };
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = payload();

      if (!data.message) {
        setStatus("Message is empty.", "error");
        return;
      }

      if (!sendEndpoint) {
        setStatus("Draft saved locally. Send link not connected yet.", "draft");
        return;
      }

      setStatus("Sending...", "sending");
      try {
        await fetch(sendEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        setStatus("Sent.", "sent");
      } catch (error) {
        setStatus("Could not send. Draft kept locally.", "error");
      }
    });

    clearButton?.addEventListener("click", () => {
      form.reset();
      subjectInput.value = "Portfolio hello";
      messageInput.value = "";
      setStatus("Draft cleared.", "draft");
    });

    emailWindow.addEventListener("window-opened", () => {
      window.setTimeout(() => nameInput.focus(), 60);
    });
  }

  function initFlappyGame() {
    const canvas = document.querySelector("[data-flappy-canvas]");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scoreEl = document.querySelector("[data-flappy-score]");
    const bestEl = document.querySelector("[data-flappy-best]");
    const startButton = document.querySelector("[data-flappy-start]");
    const flapButton = document.querySelector("[data-flappy-flap]");
    const resetButton = document.querySelector("[data-flappy-reset]");
    const gameWindow = canvas.closest(".window");
    const width = canvas.width;
    const height = canvas.height;
    const groundY = 158;
    const birdSize = 14;
    const pipeWidth = 26;
    const gapSize = 66;
    let state = "ready";
    let bird = null;
    let pipes = [];
    let score = 0;
    let best = 0;
    let lastTime = 0;
    let spawnTimer = 0;
    let animationFrame = 0;

    function updateHud() {
      scoreEl.textContent = String(score);
      bestEl.textContent = String(best);
    }

    function stopLoop() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }

    function reset(nextState = "ready") {
      stopLoop();
      bird = { x: 54, y: 76, vy: 0 };
      pipes = [];
      score = 0;
      spawnTimer = 0;
      lastTime = 0;
      state = nextState;
      updateHud();
      drawFlappy();
    }

    function drawTextPanel(label) {
      ctx.fillStyle = "#f8f8f8";
      ctx.fillRect(78, 68, 100, 35);
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = 2;
      ctx.strokeRect(78, 68, 100, 35);
      ctx.fillStyle = "#050505";
      ctx.font = "700 12px Courier New, monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, 128, 90);
      ctx.textAlign = "left";
    }

    function drawFlappy() {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#8be1f2";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.38)";
      for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < groundY; y += 8) {
          if ((x + y) % 16 === 0) ctx.fillRect(x, y, 2, 2);
        }
      }

      ctx.fillStyle = "#f8f8f8";
      ctx.fillRect(28, 28, 20, 8);
      ctx.fillRect(42, 22, 16, 8);
      ctx.fillRect(166, 40, 26, 8);
      ctx.fillRect(188, 34, 12, 8);

      pipes.forEach((pipe) => {
        const bottomY = pipe.gapTop + gapSize;
        ctx.fillStyle = "#35c764";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapTop);
        ctx.fillRect(pipe.x, bottomY, pipeWidth, groundY - bottomY);
        ctx.fillStyle = "#d4ffd8";
        ctx.fillRect(pipe.x + 4, 0, 5, pipe.gapTop);
        ctx.fillRect(pipe.x + 4, bottomY, 5, groundY - bottomY);
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, -2, pipeWidth, pipe.gapTop + 2);
        ctx.strokeRect(pipe.x, bottomY, pipeWidth, groundY - bottomY + 2);
        ctx.fillStyle = "#050505";
        ctx.fillRect(pipe.x - 3, pipe.gapTop - 7, pipeWidth + 6, 5);
        ctx.fillRect(pipe.x - 3, bottomY + 2, pipeWidth + 6, 5);
      });

      ctx.fillStyle = "#6cda62";
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, groundY, width, 2);
      ctx.fillStyle = "#4caf55";
      for (let x = 0; x < width; x += 14) {
        ctx.fillRect(x, groundY + 8, 7, 4);
      }

      ctx.fillStyle = "#ffe75c";
      ctx.fillRect(bird.x, bird.y, birdSize, birdSize);
      ctx.fillStyle = "#ff72a5";
      ctx.fillRect(bird.x - 4, bird.y + 6, 7, 6);
      ctx.fillStyle = "#050505";
      ctx.fillRect(bird.x, bird.y, birdSize, birdSize);
      ctx.fillStyle = "#ffe75c";
      ctx.fillRect(bird.x + 2, bird.y + 2, birdSize - 4, birdSize - 4);
      ctx.fillStyle = "#050505";
      ctx.fillRect(bird.x + 9, bird.y + 4, 2, 2);
      ctx.fillStyle = "#ff9c4a";
      ctx.fillRect(bird.x + 12, bird.y + 7, 5, 4);

      if (state === "ready") drawTextPanel("START");
      if (state === "over") drawTextPanel("GAME OVER");
    }

    function spawnPipe() {
      pipes.push({
        x: width + 8,
        gapTop: 26 + Math.floor(Math.random() * 66),
        passed: false
      });
    }

    function endGame() {
      state = "over";
      stopLoop();
      best = Math.max(best, score);
      updateHud();
      drawFlappy();
    }

    function updateFlappy(dt) {
      bird.vy += 0.00065 * dt;
      bird.y += bird.vy * dt;
      spawnTimer += dt;

      if (spawnTimer > 1450) {
        spawnPipe();
        spawnTimer = 0;
      }

      pipes.forEach((pipe) => {
        pipe.x -= 0.067 * dt;
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
          pipe.passed = true;
          score += 1;
          best = Math.max(best, score);
          updateHud();
        }
      });

      pipes = pipes.filter((pipe) => pipe.x + pipeWidth > -10);

      const hitGround = bird.y < 0 || bird.y + birdSize > groundY;
      const hitPipe = pipes.some((pipe) => {
        const inPipeX = bird.x + birdSize > pipe.x && bird.x < pipe.x + pipeWidth;
        const inPipeY = bird.y < pipe.gapTop || bird.y + birdSize > pipe.gapTop + gapSize;
        return inPipeX && inPipeY;
      });

      if (hitGround || hitPipe) endGame();
    }

    function gameLoop(now) {
      if (state !== "playing" || !gameWindow.classList.contains("open")) {
        animationFrame = 0;
        return;
      }

      const dt = Math.min(34, now - (lastTime || now));
      lastTime = now;
      updateFlappy(dt || 16);
      if (state === "playing") {
        drawFlappy();
        animationFrame = window.requestAnimationFrame(gameLoop);
      } else {
        animationFrame = 0;
      }
    }

    function ensureLoop() {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(gameLoop);
    }

    function startGame() {
      stopLoop();
      reset("playing");
      bird.vy = -0.25;
      ensureLoop();
    }

    function flap() {
      if (state !== "playing") {
        startGame();
        return;
      }
      bird.vy = -0.25;
      ensureLoop();
    }

    startButton?.addEventListener("click", startGame);
    resetButton?.addEventListener("click", () => reset());
    flapButton?.addEventListener("click", flap);
    canvas.addEventListener("pointerdown", flap);
    gameWindow.addEventListener("window-opened", () => {
      if (state === "playing") ensureLoop();
      drawFlappy();
    });

    document.addEventListener("keydown", (event) => {
      if (!gameWindow.classList.contains("active") || !gameWindow.classList.contains("open")) return;
      if (event.key === " " || event.key === "ArrowUp" || event.key === "Enter") {
        event.preventDefault();
        flap();
      }
    });

    reset();
  }

  function initSnakeGame() {
    const canvas = document.querySelector("[data-snake-canvas]");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scoreEl = document.querySelector("[data-snake-score]");
    const bestEl = document.querySelector("[data-snake-best]");
    const startButton = document.querySelector("[data-snake-start]");
    const resetButton = document.querySelector("[data-snake-reset]");
    const gameWindow = canvas.closest(".window");
    const cell = 12;
    const cells = canvas.width / cell;
    let snake = [];
    let food = null;
    let dir = "right";
    let nextDir = "right";
    let score = 0;
    let best = 0;
    let state = "ready";

    function updateHud() {
      scoreEl.textContent = String(score);
      bestEl.textContent = String(best);
    }

    function sameCell(a, b) {
      return a.x === b.x && a.y === b.y;
    }

    function placeFood() {
      do {
        food = {
          x: Math.floor(Math.random() * cells),
          y: Math.floor(Math.random() * cells)
        };
      } while (snake.some((segment) => sameCell(segment, food)));
    }

    function reset(nextState = "ready") {
      snake = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      dir = "right";
      nextDir = "right";
      score = 0;
      state = nextState;
      placeFood();
      updateHud();
      drawSnake();
    }

    function drawSnakePanel(label) {
      ctx.fillStyle = "#f8f8f8";
      ctx.fillRect(68, 104, 104, 34);
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = 2;
      ctx.strokeRect(68, 104, 104, 34);
      ctx.fillStyle = "#050505";
      ctx.font = "700 12px Courier New, monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, 120, 126);
      ctx.textAlign = "left";
    }

    function drawSnake() {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#d9ffd9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0,0,0,0.13)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= cells; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(canvas.width, i * cell);
        ctx.stroke();
      }

      ctx.fillStyle = "#ff4d74";
      ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
      ctx.fillStyle = "#050505";
      ctx.fillRect(food.x * cell + 4, food.y * cell + 4, cell - 8, cell - 8);

      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#225f38" : "#53db77";
        ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
      });

      if (state === "ready") drawSnakePanel("START");
      if (state === "over") drawSnakePanel("GAME OVER");
    }

    function setDirection(next) {
      const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
      };
      if (next !== opposite[dir]) nextDir = next;
    }

    function endGame() {
      state = "over";
      best = Math.max(best, score);
      updateHud();
      drawSnake();
    }

    function tick() {
      if (state !== "playing" || !gameWindow.classList.contains("open")) return;
      dir = nextDir;

      const head = { ...snake[0] };
      if (dir === "up") head.y -= 1;
      if (dir === "down") head.y += 1;
      if (dir === "left") head.x -= 1;
      if (dir === "right") head.x += 1;

      const wallHit = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
      const selfHit = snake.some((segment) => sameCell(segment, head));
      if (wallHit || selfHit) {
        endGame();
        return;
      }

      snake.unshift(head);
      if (sameCell(head, food)) {
        score += 1;
        best = Math.max(best, score);
        updateHud();
        placeFood();
      } else {
        snake.pop();
      }

      drawSnake();
    }

    function startGame() {
      if (state !== "playing") {
        reset("playing");
      }
    }

    startButton?.addEventListener("click", startGame);
    resetButton?.addEventListener("click", () => reset());
    canvas.addEventListener("pointerdown", startGame);
    document.querySelectorAll("[data-snake-dir]").forEach((button) => {
      button.addEventListener("click", () => {
        startGame();
        setDirection(button.dataset.snakeDir);
      });
    });
    gameWindow.addEventListener("window-opened", drawSnake);

    document.addEventListener("keydown", (event) => {
      if (!gameWindow.classList.contains("active") || !gameWindow.classList.contains("open")) return;
      const keyDirections = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right"
      };
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        startGame();
        return;
      }
      if (keyDirections[event.key]) {
        event.preventDefault();
        startGame();
        setDirection(keyDirections[event.key]);
      }
    });

    window.setInterval(tick, 105);
    reset();
  }

  function initMinesweeperGame() {
    const boardEl = document.querySelector("[data-minesweeper-board]");
    if (!boardEl) return;

    const gameWindow = boardEl.closest(".window");
    const mineCountEl = document.querySelector("[data-mine-count]");
    const timeEl = document.querySelector("[data-mine-time]");
    const statusEl = document.querySelector("[data-mine-status]");
    const resetButton = document.querySelector("[data-minesweeper-reset]");
    const flagButton = document.querySelector("[data-minesweeper-flag-mode]");
    const size = 8;
    const mineTotal = 10;
    let cells = [];
    let state = "ready";
    let flagMode = false;
    let elapsed = 0;
    let timer = 0;

    function indexFor(row, col) {
      return row * size + col;
    }

    function neighbors(cell) {
      const result = [];
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          if (rowOffset === 0 && colOffset === 0) continue;
          const row = cell.row + rowOffset;
          const col = cell.col + colOffset;
          if (row >= 0 && row < size && col >= 0 && col < size) {
            result.push(cells[indexFor(row, col)]);
          }
        }
      }
      return result;
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    }

    function startTimer() {
      if (timer) return;
      timer = window.setInterval(() => {
        if (state !== "playing") return;
        elapsed += 1;
        timeEl.textContent = String(elapsed);
      }, 1000);
    }

    function setStatus(label) {
      statusEl.textContent = label;
    }

    function updateHud() {
      const flagged = cells.filter((cell) => cell.flagged).length;
      mineCountEl.textContent = String(Math.max(0, mineTotal - flagged));
      timeEl.textContent = String(elapsed);
      flagButton.setAttribute("aria-pressed", flagMode ? "true" : "false");
    }

    function createCells() {
      cells = Array.from({ length: size * size }, (_, index) => ({
        adjacent: 0,
        col: index % size,
        element: null,
        flagged: false,
        mine: false,
        revealed: false,
        row: Math.floor(index / size)
      }));
    }

    function plantMines(safeIndex) {
      const forbidden = new Set([safeIndex, ...neighbors(cells[safeIndex]).map((cell) => indexFor(cell.row, cell.col))]);
      let planted = 0;

      while (planted < mineTotal) {
        const index = Math.floor(Math.random() * cells.length);
        if (cells[index].mine || forbidden.has(index)) continue;
        cells[index].mine = true;
        planted += 1;
      }

      cells.forEach((cell) => {
        cell.adjacent = neighbors(cell).filter((neighbor) => neighbor.mine).length;
      });
    }

    function renderCell(cell) {
      const button = cell.element;
      button.className = "mine-cell";
      button.textContent = "";
      button.setAttribute("aria-label", `Cell ${cell.row + 1}, ${cell.col + 1}`);

      if (cell.revealed) {
        button.classList.add("is-revealed");
        button.disabled = true;
        if (cell.mine) {
          button.classList.add("is-mine");
          button.textContent = "*";
          button.setAttribute("aria-label", "Mine");
        } else if (cell.adjacent > 0) {
          button.classList.add(`n${cell.adjacent}`);
          button.textContent = String(cell.adjacent);
          button.setAttribute("aria-label", `${cell.adjacent} nearby mines`);
        } else {
          button.setAttribute("aria-label", "Empty cell");
        }
        return;
      }

      button.disabled = state === "won" || state === "lost";
      if (cell.flagged) {
        button.classList.add("is-flagged");
        button.textContent = "F";
        button.setAttribute("aria-label", "Flagged cell");
      }
    }

    function renderBoard() {
      cells.forEach(renderCell);
      updateHud();
    }

    function revealCell(cell) {
      if (cell.revealed || cell.flagged) return;
      cell.revealed = true;
      if (cell.adjacent !== 0 || cell.mine) return;
      neighbors(cell).forEach(revealCell);
    }

    function revealAllMines() {
      cells.forEach((cell) => {
        if (cell.mine) cell.revealed = true;
      });
    }

    function checkWin() {
      const coveredSafeCells = cells.filter((cell) => !cell.mine && !cell.revealed).length;
      if (coveredSafeCells > 0) return;
      state = "won";
      stopTimer();
      setStatus("Cleared");
      cells.forEach((cell) => {
        if (cell.mine) cell.flagged = true;
      });
      renderBoard();
      showAlert("Minesweeper cleared.");
    }

    function handleReveal(cell) {
      if (state === "lost" || state === "won" || cell.flagged || cell.revealed) return;
      if (state === "ready") {
        plantMines(indexFor(cell.row, cell.col));
        state = "playing";
        setStatus("Running");
        startTimer();
      }

      if (cell.mine) {
        state = "lost";
        stopTimer();
        revealAllMines();
        setStatus("Boom");
        renderBoard();
        showAlert("Boom. Reset and sweep again.");
        return;
      }

      revealCell(cell);
      renderBoard();
      checkWin();
    }

    function toggleFlag(cell) {
      if (state === "lost" || state === "won" || cell.revealed) return;
      cell.flagged = !cell.flagged;
      renderBoard();
    }

    function reset() {
      stopTimer();
      createCells();
      state = "ready";
      flagMode = false;
      elapsed = 0;
      boardEl.textContent = "";
      cells.forEach((cell) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mine-cell";
        button.setAttribute("role", "gridcell");
        button.addEventListener("click", () => {
          if (flagMode) {
            toggleFlag(cell);
          } else {
            handleReveal(cell);
          }
        });
        button.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          toggleFlag(cell);
        });
        cell.element = button;
        boardEl.appendChild(button);
      });
      setStatus("Ready");
      renderBoard();
    }

    resetButton?.addEventListener("click", reset);
    flagButton?.addEventListener("click", () => {
      flagMode = !flagMode;
      updateHud();
    });
    gameWindow.addEventListener("window-opened", () => {
      if (!cells.length) reset();
    });

    reset();
  }

  document.querySelectorAll("[data-cad-scene]").forEach((scene) => {
    const cube = scene.querySelector(".cad-cube");
    if (!cube) return;

    let view = { x: -24, y: 36 };
    let drag = null;
    let pendingView = null;
    let renderFrame = 0;

    function render() {
      scene.style.setProperty("--rx", `${view.x}deg`);
      scene.style.setProperty("--ry", `${view.y}deg`);
    }

    function scheduleRender(nextView) {
      pendingView = nextView;
      if (renderFrame) return;

      renderFrame = window.requestAnimationFrame(() => {
        renderFrame = 0;
        if (!pendingView) return;
        view = pendingView;
        pendingView = null;
        render();
      });
    }

    function stopDrag() {
      drag = null;
      scene.classList.remove("is-dragging");
      document.body.classList.remove("cad-dragging");
    }

    scene.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      drag = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        viewX: view.x,
        viewY: view.y
      };
      scene.setPointerCapture(event.pointerId);
      scene.classList.add("is-dragging");
      document.body.classList.add("cad-dragging");
      scene.focus();
    });

    scene.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      scheduleRender({
        y: drag.viewY + (event.clientX - drag.x) * 0.55,
        x: Math.max(-72, Math.min(72, drag.viewX - (event.clientY - drag.y) * 0.55))
      });
    });

    scene.addEventListener("pointerup", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      scene.releasePointerCapture(event.pointerId);
      stopDrag();
    });

    scene.addEventListener("pointercancel", () => {
      stopDrag();
    });

    scene.addEventListener("lostpointercapture", () => {
      stopDrag();
    });

    scene.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") view.y -= 8;
      if (event.key === "ArrowRight") view.y += 8;
      if (event.key === "ArrowUp") view.x = Math.max(-72, view.x - 8);
      if (event.key === "ArrowDown") view.x = Math.min(72, view.x + 8);
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        render();
      }
    });

    render();
  });

  initCalculatorApp();
  initFindApp();
  initUtilityApps();
  initTerminalApp();
  initEmailApp();
  initFlappyGame();
  initSnakeGame();
  initMinesweeperGame();
  updateMountedDiskUI();
  setClock();
  window.setInterval(setClock, 15000);
})();
