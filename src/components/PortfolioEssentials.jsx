import { useEffect, useRef, useState } from "react";
import resume from "../resumeData.json";
import { profile } from "../portfolioContent";

const Arrow = () => <span aria-hidden="true">↗</span>;

export function ResumeDocument() {
  return (
    <article className="resume-document">
      <div className="resume-document-head">
        <div>
          <span className="eyebrow">CURRICULUM VITAE / WORKING DRAFT</span>
          <h2>{resume.name}</h2>
          <p>{resume.title}</p>
        </div>
        <span className="resume-monogram">m↗</span>
      </div>
      <div className="resume-contact-line">
        <span>{resume.email}</span>
        <a href={resume.github} target="_blank" rel="noreferrer">
          github.com/iiMaximus
        </a>
      </div>
      <p className="resume-summary">{resume.summary}</p>
      <section>
        <h3>Education</h3>
        <div className="resume-entry-head">
          <strong>{resume.education.institution}</strong>
          <span>{resume.education.status}</span>
        </div>
        <p>{resume.education.degree}</p>
        <p className="resume-placeholder">{resume.education.dates}</p>
        <p className="resume-placeholder">{resume.education.details}</p>
      </section>
      <section>
        <h3>Selected projects</h3>
        {resume.projects.map((item) => (
          <div className="resume-project" key={item.name}>
            <div className="resume-entry-head">
              <strong>{item.name}</strong>
              <span>{item.status}</span>
            </div>
            <p>{item.description}</p>
            <p className="resume-placeholder">{item.evidence}</p>
          </div>
        ))}
      </section>
      <section>
        <h3>Academic direction</h3>
        <p>{resume.direction}</p>
      </section>
      <section>
        <h3>Technical skills & languages</h3>
        <p className="resume-placeholder">{resume.skills}</p>
        <p className="resume-placeholder">{resume.languages}</p>
      </section>
      <section>
        <h3>Experience & activities</h3>
        <p className="resume-placeholder">{resume.experience}</p>
      </section>
      <footer>
        Draft · {resume.updated} · Bracketed fields need to be completed before
        use.
      </footer>
    </article>
  );
}

export function AcademicProfile() {
  return (
    <section
      id="education"
      className="academic-section section-pad"
      data-section
    >
      <div className="academic-intro">
        <p className="eyebrow">05 — EDUCATION & DIRECTION</p>
        <h2>
          Grounded in mechanics.
          <br />
          <em>Looking towards flight.</em>
        </h2>
        <p>
          Building the foundations now. Preparing for the next chapter in
          aerospace.
        </p>
      </div>
      <div className="academic-path">
        <article>
          <span className="path-marker" />
          <div className="path-meta">
            <span className="eyebrow">CURRENTLY</span>
            <span className="status">
              <i /> In progress
            </span>
          </div>
          <h3>Politecnico di Torino</h3>
          <p className="degree-name">Bachelor’s in Mechanical Engineering</p>
          <p>
            My current academic home, and the foundation for the engineering
            work in this portfolio.
          </p>
        </article>
        <article>
          <span className="path-marker path-marker-future" />
          <div className="path-meta">
            <span className="eyebrow">NEXT CHAPTER</span>
            <span className="eyebrow">APPLICATIONS IN PREPARATION</span>
          </div>
          <h3>Master’s in Aerospace Engineering</h3>
          <p className="degree-name">Exploring programmes and universities</p>
          <p>
            I’m preparing applications for November–December 2026. My next step
            is to take the mechanical engineering foundation further into
            aerospace.
          </p>
        </article>
      </div>
      <div className="focus-strip">
        <span className="eyebrow">AREAS I’M EXPLORING</span>
        <span>CAD & physical assembly</span>
        <span>Flight & aerospace</span>
        <span>Software & product</span>
      </div>
    </section>
  );
}

export function ResumeSection({ onOpen }) {
  return (
    <section id="resume" className="resume-section section-pad" data-section>
      <div className="resume-section-copy">
        <p className="eyebrow">06 — THE ESSENTIALS</p>
        <h2>
          The work.
          <br />
          The background.
          <br />
          <em>One document.</em>
        </h2>
        <p>
          A concise CV alongside the projects: education, current work, and the
          direction I want to take next.
        </p>
        <div className="resume-actions">
          <a
            className="solid-button"
            href="/resume/Maksym-CV-draft.pdf"
            download
          >
            Download CV draft <span>↓</span>
          </a>
          <button className="text-link" onClick={onOpen}>
            Read the CV <Arrow />
          </button>
        </div>
        <p className="document-note">
          Working draft · Identity, dates, and further experience to be
          completed.
        </p>
        <a
          className="editable-link"
          href="/resume/Maksym-CV-editable.txt"
          download
        >
          Editable text version <Arrow />
        </a>
      </div>
      <button
        className="resume-preview"
        onClick={onOpen}
        aria-label="Open résumé preview"
      >
        <div className="paper-topline">
          <span>CURRICULUM VITAE</span>
          <span>01 / 01</span>
        </div>
        <span className="preview-name">
          Maksym<span>[Surname]</span>
        </span>
        <span className="preview-role">
          Mechanical engineering undergraduate
        </span>
        <span className="paper-rule" />
        <span className="preview-section-label">EDUCATION</span>
        <strong>Politecnico di Torino</strong>
        <span>Bachelor’s in Mechanical Engineering · In progress</span>
        <span className="preview-section-label">SELECTED WORK</span>
        <strong>Drone development</strong>
        <span>CAD geometry · Ongoing physical build</span>
        <strong>Allergify, Absorb & Quarter</strong>
        <span>Mobile software · Ongoing development</span>
        <span className="preview-section-label">NEXT CHAPTER</span>
        <strong>Aerospace engineering</strong>
        <span>Preparing for master’s applications</span>
        <div className="paper-bottomline">
          <span>WORKING DRAFT / OCT 2026</span>
          <span>↗</span>
        </div>
      </button>
    </section>
  );
}

const collections = [
  {
    id: "photography",
    number: "01",
    title: "Photography",
    detail: "Images, observations, and the details worth keeping.",
    label: "PHOTO ARCHIVE",
  },
  {
    id: "film",
    number: "02",
    title: "Film & process",
    detail: "Build footage, motion studies, and visual stories.",
    label: "MOTION ARCHIVE",
  },
  {
    id: "notebook",
    number: "03",
    title: "The notebook",
    detail: "Sketches, drawings, and early ideas from the workbench.",
    label: "DRAWINGS & IDEAS",
  },
];

export function ArchiveSection({ onOpenDesktop, onOpenMedia }) {
  return (
    <section id="archive" className="archive-section section-pad" data-section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">07 — THE REST OF THE DESK</p>
          <h2>A little beyond engineering.</h2>
        </div>
        <p>
          The visual work, the early ideas,
          <br />
          and the personality behind the projects.
        </p>
      </div>
      <div className="archive-layout">
        <div className="archive-collections">
          {collections.map((item) => (
            <button key={item.id} onClick={() => onOpenMedia(item.id)}>
              <span className="eyebrow">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <span className="collection-status">
                  Collection being prepared
                </span>
              </div>
              <Arrow />
            </button>
          ))}
        </div>
        <button className="desktop-invitation" onClick={onOpenDesktop}>
          <div className="desktop-miniature" aria-hidden="true">
            <div className="mini-os-menu">
              m↗ <span>File &nbsp; Edit &nbsp; Special</span>
            </div>
            <div className="mini-os-folders">
              <span>
                ▱<small>Projects</small>
              </span>
              <span>
                ▤<small>CV</small>
              </span>
              <span>
                ▱<small>Media</small>
              </span>
            </div>
            <div className="mini-os-window">
              <i />
              <span>Welcome back.</span>
              <small>EVERYTHING HAS A PLACE.</small>
            </div>
          </div>
          <div className="desktop-invitation-label">
            <span className="eyebrow">A WINDOW INTO MY WORLD</span>
            <h3>
              There’s more on the computer. <Arrow />
            </h3>
            <p>
              CV, folders, terminal, and a few distractions.
              <br />
              Open Maksym OS.
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}

export function ContactDetails() {
  return (
    <div className="full-contact-details">
      <a href={profile.github} target="_blank" rel="noreferrer">
        <span className="contact-type">GITHUB</span>
        <span>iiMaximus</span>
        <Arrow />
      </a>
      <div>
        <span className="contact-type">EMAIL</span>
        <span className="contact-missing">[Email address to be added]</span>
      </div>
      <div>
        <span className="contact-type">LINKEDIN</span>
        <span className="contact-missing">[Profile to be added]</span>
      </div>
      <div>
        <span className="contact-type">EDUCATION</span>
        <span>
          Politecnico di Torino
          <br />
          <small>Mechanical Engineering · Bachelor’s</small>
        </span>
      </div>
      <span className="contact-footnote">
        Open to conversations about aerospace, engineering projects, and further
        study.
      </span>
    </div>
  );
}

export default function ResourceDialog({ resource, onClose }) {
  const ref = useRef();
  const [collection, setCollection] = useState(
    resource?.collection || "photography",
  );
  useEffect(() => {
    if (!resource) return;
    const element = ref.current,
      previous = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    setCollection(resource.collection || "photography");
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [resource]);
  if (!resource) return null;
  const cv = resource.type === "resume";
  const current = collections.find((item) => item.id === collection);
  return (
    <dialog
      ref={ref}
      className={`resource-dialog ${cv ? "resource-dialog-cv" : ""}`}
      onCancel={onClose}
      aria-labelledby="resource-title"
    >
      <div className="resource-toolbar">
        <h2 id="resource-title">
          {cv ? "Curriculum vitae" : "The visual archive"}
        </h2>
        <button onClick={onClose} aria-label="Close document">
          ×
        </button>
      </div>
      {cv ? (
        <>
          <div className="document-download-bar">
            <span>
              Working draft · Complete the bracketed fields before applying.
            </span>
            <a href="/resume/Maksym-CV-draft.pdf" download>
              Download PDF ↓
            </a>
          </div>
          <ResumeDocument />
        </>
      ) : (
        <div className="media-dialog-body">
          <div
            className="media-tabs"
            role="group"
            aria-label="Archive collections"
          >
            {collections.map((item) => (
              <button
                key={item.id}
                aria-pressed={item.id === collection}
                onClick={() => setCollection(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="media-empty">
            <span className="empty-frame" aria-hidden="true">
              +
            </span>
            <p className="eyebrow">{current.label}</p>
            <h3>A space for what’s next.</h3>
            <p>
              No work has been added to this collection yet. Photographs,
              footage, and drawings will appear here as they’re selected.
            </p>
            <span>Collection being prepared</span>
          </div>
        </div>
      )}
    </dialog>
  );
}
