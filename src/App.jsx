import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { apps, profile, projects } from "./portfolioContent";
import AboutSection from "./components/AboutSection";
import DroneDrawing from "./components/FrameDrawing";
import ResourceDialog, {
  ResumeSection,
  ArchiveSection,
  ContactDetails,
} from "./components/PortfolioEssentials";
const ModelViewer = lazy(() => import("./components/ModelViewer"));
const Workbench = lazy(() => import("./components/Workbench"));
const DesktopDialog = lazy(() => import("./components/DesktopDialog"));

function Icon({ name = "arrow", size = 20, ...props }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M12 5l7 7-7 7" />
      </>
    ),
    diagonal: (
      <>
        <path d="M6 18 18 6M6 6h12v12" />
      </>
    ),
    down: (
      <>
        <path d="M12 4v16m-6-6 6 6 6-6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    rotate: (
      <>
        <path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" />
      </>
    ),
    pause: (
      <>
        <path d="M9 5v14M15 5v14" />
      </>
    ),
    play: <path d="m8 4 12 8-12 8V4Z" />,
    grid: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 12h16M12 4v16" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    scan: (
      <>
        <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5M7 12h10" />
      </>
    ),
    book: (
      <>
        <path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6h5" />
      </>
    ),
    plus: <path d="M12 4v16M4 12h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function ProjectDialog({ project, onClose }) {
  const ref = useRef();
  useEffect(() => {
    if (!project) return;
    const element = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [project]);
  if (!project) return null;
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== ref.current) return;
        const r = ref.current.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-top">
        <span className="eyebrow">{project.discipline}</span>
        <button
          className="icon-button"
          aria-label="Close project notes"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <span className="status">
        <i />
        {project.status}
      </span>
      <h2 id="project-title">{project.title}</h2>
      <p className="dialog-intro">{project.intro}</p>
      <dl className="project-facts">
        {project.facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {project.download && (
        <a
          className="text-link project-download"
          href={project.download.href}
          download
        >
          {project.download.label} <Icon name="down" size={16} />
        </a>
      )}
      {project.links && (
        <div className="project-store-links">
          {project.links.map((link) => (
            <a className="text-link" key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label} <Icon name="diagonal" size={16} />
            </a>
          ))}
        </div>
      )}
      <div className="project-notes">
        {project.notes.map(([title, body]) => (
          <section key={title}>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="dialog-foot">
        <span>{project.status}</span>
        <button className="text-link" onClick={onClose}>
          Back to the portfolio <Icon name="arrow" size={17} />
        </button>
      </div>
    </dialog>
  );
}

function Model({ className = "", ...props }) {
  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="model-loading">
            <span />
            <span className="eyebrow">Loading model</span>
          </div>
        }
      >
        <ModelViewer {...props} />
      </Suspense>
    </div>
  );
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [moving, setMoving] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [exploded, setExploded] = useState(false);
  const [frameOnly, setFrameOnly] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [selectedApp, setSelectedApp] = useState(0);
  const [project, setProject] = useState(null);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [returnToWorkbench, setReturnToWorkbench] = useState(false);
  const [resource, setResource] = useState(null);
  const openDesktop = (fromWorkbench = false) => {
    setReturnToWorkbench(fromWorkbench);
    setWorkbenchOpen(false);
    setDesktopOpen(true);
  };
  const [activeSection, setActiveSection] = useState("home");
  const tabRefs = useRef([]);
  useEffect(() => {
    const section = document.getElementById(window.location.hash.slice(1));
    if (section) section.scrollIntoView({ behavior: "instant" });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    document
      .querySelectorAll("[data-section]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const app = apps[selectedApp];
  function selectAppWithKeyboard(event, index) {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % apps.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + apps.length - 1) % apps.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = apps.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setSelectedApp(next);
      tabRefs.current[next]?.focus();
    }
  }
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to projects
      </a>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Maksym, back to top">
          <span className="monogram" aria-hidden="true">
            m<span>↗</span>
          </span>
          <span>
            {profile.name}
            <small>ENGINEERING PORTFOLIO</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a
            className={
              ["work", "apps", "rocket"].includes(activeSection) ? "active" : ""
            }
            href="#work"
          >
            Work
          </a>
          <a
            className={`nav-about ${activeSection === "about" ? "active" : ""}`}
            href="#about"
          >
            About
          </a>
          <a
            className={activeSection === "resume" ? "active" : ""}
            href="#resume"
          >
            CV
          </a>
          <a className="nav-contact" href="#contact">
            Contact <Icon name="diagonal" size={16} />
          </a>
        </nav>
      </header>
      <main>
        <section id="home" className="hero" data-section>
          <div className="hero-heading">
            <p className="eyebrow">Mechanical engineering · Turin, Italy</p>
            <h1>Maksym<br /><em>Horoszczak</em></h1>
            <p className="hero-intro">
              I’m in my final year at Politecnico di Torino, graduating in July 2027.
              I designed and flew the carbon-fibre drone shown here.
            </p>
            <div className="hero-actions">
              <button
                className="primary-link"
                onClick={() => setWorkbenchOpen(true)}
              >
                Enter the workbench{" "}
                <span>
                  <Icon name="diagonal" size={18} />
                </span>
              </button>
              <a href="#work" className="hero-project-link">
                View projects <Icon name="down" size={12} />
              </a>
            </div>
          </div>
          <div className="hero-exhibit">
            <div className="exhibit-grid" aria-hidden="true" />
            <span className="exhibit-cross cross-one" aria-hidden="true">
              +
            </span>
            <span className="exhibit-cross cross-two" aria-hidden="true">
              +
            </span>
            <Model
              className="hero-model"
              paused={
                workbenchOpen ||
                desktopOpen ||
                Boolean(project) ||
                Boolean(resource)
              }
              kind="drone"
              exploded={exploded}
              frameOnly={frameOnly}
              wireframe={wireframe}
              moving={moving}
              reducedMotion={reducedMotion}
              resetKey={resetKey}
              onInteract={() => setMoving(false)}
            />
            <div className="model-caption">
              <span className="caption-rule" />
              <span>
                FPV DRONE
                <span>Custom dead-cat frame · Built & flown</span>
              </span>
            </div>
            <div className="model-controls" aria-label="Drone model controls">
              <div className="segmented-control">
                <button
                  className={!exploded ? "selected" : ""}
                  aria-pressed={!exploded}
                  onClick={() => setExploded(false)}
                >
                  Assembled
                </button>
                <button
                  className={exploded ? "selected" : ""}
                  aria-pressed={exploded}
                  onClick={() => setExploded(true)}
                >
                  <Icon name="layers" size={15} />
                  Exploded
                </button>
              </div>
              <div className="view-controls">
                <button
                  className={`icon-button ${frameOnly ? "selected" : ""}`}
                  aria-label="Toggle frame only"
                  title="Frame only"
                  aria-pressed={frameOnly}
                  onClick={() => setFrameOnly((v) => !v)}
                >
                  <Icon name="layers" size={17} />
                </button>
                <button
                  className={`icon-button ${wireframe ? "selected" : ""}`}
                  aria-label="Toggle wireframe"
                  title="Wireframe"
                  aria-pressed={wireframe}
                  onClick={() => setWireframe(!wireframe)}
                >
                  <Icon name="grid" size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={
                    moving ? "Pause model motion" : "Resume model motion"
                  }
                  title={moving ? "Pause motion" : "Resume motion"}
                  aria-pressed={moving}
                  disabled={reducedMotion}
                  onClick={() => setMoving(!moving)}
                >
                  <Icon
                    name={moving && !reducedMotion ? "pause" : "play"}
                    size={17}
                  />
                </button>
                <button
                  className="icon-button"
                  aria-label="Reset model view"
                  title="Reset view"
                  onClick={() => {
                    setResetKey((v) => v + 1);
                    setExploded(false);
                    setWireframe(false);
                    setFrameOnly(false);
                  }}
                >
                  <Icon name="rotate" size={17} />
                </button>
              </div>
            </div>
            <p className="drag-hint">Drag to rotate the drone</p>
          </div>
        </section>

        <section id="work" className="work-section section-pad" data-section>
          <div className="section-heading">
            <h2>Selected projects</h2>
          </div>
          <article className="drone-project">
            <div className="blueprint-panel">
              <div className="panel-top eyebrow">
                <span>Frame drawing</span>
                <span>Top view</span>
              </div>
              <DroneDrawing />
              <div className="panel-bottom">
                <span className="eyebrow">
                  SolidWorks · DXF cutting profiles
                </span>
              </div>
            </div>
            <div className="project-copy">
              <span className="status">
                <i />
                {projects[0].status}
              </span>
              <h3>{projects[0].title}</h3>
              <p>{projects[0].summary}</p>
              <button
                className="text-link"
                onClick={() => setProject(projects[0])}
              >
                Read the build notes <Icon name="diagonal" size={18} />
              </button>
            </div>
          </article>
        </section>

        <section id="apps" className="apps-section section-pad" data-section>
          <div className="apps-copy">
            <h2>iOS apps</h2>
            <p className="section-description">
              I built Lychee and Absorb. Both are on the App Store.
            </p>
            <div className="app-tabs" role="tablist" aria-label="App projects">
              {apps.map((item, i) => (
                <button
                  key={item.id}
                  ref={(el) => (tabRefs.current[i] = el)}
                  id={`tab-${item.id}`}
                  role="tab"
                  aria-selected={selectedApp === i}
                  aria-controls="app-details"
                  tabIndex={selectedApp === i ? 0 : -1}
                  className={selectedApp === i ? "active" : ""}
                  onClick={() => setSelectedApp(i)}
                  onKeyDown={(event) => selectAppWithKeyboard(event, i)}
                >
                  <span className="app-icon" style={{ background: item.color }}>
                    <Icon name={item.glyph} size={21} />
                  </span>
                  {item.name}
                  <Icon name="diagonal" size={15} />
                </button>
              ))}
            </div>
            <div
              id="app-details"
              role="tabpanel"
              aria-labelledby={`tab-${app.id}`}
              tabIndex={0}
              className="app-details"
              key={app.id}
            >
              <h3>{app.verb}</h3>
              <p>{app.description}</p>
              <a className="text-link app-store-link" href={app.url} target="_blank" rel="noreferrer">
                View {app.name} on the App Store <Icon name="diagonal" size={18} />
              </a>
            </div>
            <button
              className="text-link"
              onClick={() => setProject(projects[1])}
            >
              Development notes <Icon name="diagonal" size={18} />
            </button>
          </div>
          <div className="palm-exhibit">
            <Model
              className="palm-model"
              paused={
                workbenchOpen ||
                desktopOpen ||
                Boolean(project) ||
                Boolean(resource)
              }
              kind="palm"
              app={app}
              onAppSelect={setSelectedApp}
              moving={false}
              reducedMotion={reducedMotion}
            />
            <div className="palm-caption">
              <span>{app.screenCaption}</span>
              <span>Drag to rotate</span>
            </div>
          </div>
        </section>

        <aside id="rocket" className="future-note section-pad">
          <span className="eyebrow">Planned project</span>
          <p>
            I’d like to design a model rocket after I finish testing the drone.
          </p>
          <button className="text-link" onClick={() => setProject(projects[2])}>
            Rocket concept <Icon name="diagonal" size={16} />
          </button>
        </aside>
        <AboutSection />
        <ResumeSection onOpen={() => setResource({ type: "resume" })} />
        <ArchiveSection
          onOpenDesktop={() => openDesktop()}
          onOpenMedia={(collection) =>
            setResource({ type: "media", collection })
          }
        />
        <footer
          id="contact"
          className="contact-section section-pad"
          data-section
        >
          <div className="contact-main">
            <h2>Contact</h2>
            <ContactDetails />
          </div>
          <div className="footer-bottom">
            <a className="footer-name" href="#home">
              {profile.fullName}<span>Mechanical engineering</span>
            </a>
            <a className="back-top" href="#home">
              Back to top <Icon name="arrow" size={15} />
            </a>
          </div>
        </footer>
      </main>
      <Suspense
        fallback={
          workbenchOpen ? (
            <div className="bench-loading" role="status">
              Opening the workbench…
            </div>
          ) : null
        }
      >
        {workbenchOpen && (
          <Workbench
            reducedMotion={reducedMotion}
            onClose={() => setWorkbenchOpen(false)}
            onOpenDesktop={() => openDesktop(true)}
            onReadProject={(item) => {
              setWorkbenchOpen(false);
              setProject(item);
            }}
          />
        )}
      </Suspense>
      <Suspense
        fallback={
          desktopOpen ? (
            <div className="bench-loading" role="status">
              Starting Maksym OS…
            </div>
          ) : null
        }
      >
        {desktopOpen && (
          <DesktopDialog
            returnToWorkbench={returnToWorkbench}
            onClose={() => {
              setDesktopOpen(false);
              if (returnToWorkbench) setWorkbenchOpen(true);
            }}
            onNavigate={(section) => {
              setDesktopOpen(false);
              setReturnToWorkbench(false);
              requestAnimationFrame(() =>
                document.getElementById(section)?.scrollIntoView({
                  behavior: reducedMotion ? "auto" : "smooth",
                }),
              );
            }}
          />
        )}
      </Suspense>
      <ResourceDialog resource={resource} onClose={() => setResource(null)} />
      <ProjectDialog project={project} onClose={() => setProject(null)} />
    </>
  );
}
