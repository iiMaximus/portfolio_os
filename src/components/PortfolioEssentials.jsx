import { useEffect, useRef, useState } from "react";
import resume from "../resumeData.json";
import { profile } from "../portfolioContent";

const Arrow = () => <span aria-hidden="true">↗</span>;

const cvUrl = "/resume/Maksym-CV-2026.pdf";
const cvPreview = "/resume/Maksym-CV-2026.webp";

export function ResumeDocument() {
  return (
    <article className="resume-document">
      <div className="resume-document-head">
        <div>
          <span className="eyebrow">CURRICULUM VITAE</span>
          <h2>{resume.name}</h2>
          <p>{resume.title}</p>
        </div>
      </div>
      <div className="resume-contact-line">
        {resume.contacts.map((contact) => contact.url ? (
          <a key={contact.label} href={contact.url}>{contact.label}</a>
        ) : <span key={contact.label}>{contact.label}</span>)}
      </div>
      <section>
        <h3>Education</h3>
        <strong>{resume.education.institution}</strong>
        <p>{resume.education.degree}</p>
        <p>{resume.education.dates}</p>
      </section>
      <section>
        <h3>Selected projects</h3>
        {resume.projects.map((item) => (
          <div className="resume-project" key={item.name}>
            <div className="resume-entry-head">
              <strong>{item.name}</strong>
              <span>{item.label}</span>
            </div>
            {item.bullets.map((bullet) => <p key={bullet}>{bullet}</p>)}
            {item.links?.map((link) => (
              <a className="resume-app-link" key={link.url} href={link.url} target="_blank" rel="noreferrer">
                {link.label} on the App Store <Arrow />
              </a>
            ))}
          </div>
        ))}
      </section>
      <section>
        <h3>Technical skills</h3>
        {resume.skills.map(([label, value]) => (
          <p key={label}><strong>{label}:</strong> {value}</p>
        ))}
      </section>
      <section>
        <h3>Languages</h3>
        <p>{resume.languages}</p>
      </section>
      <section>
        <h3>University teams</h3>
        {resume.experience.map((item) => (
          <div className="resume-project" key={item.name}>
            <div className="resume-entry-head">
              <strong>{item.name}</strong>
              <span>{item.dates}</span>
            </div>
            <p>{item.role}</p>
            {item.bullets.map((bullet) => <p key={bullet}>{bullet}</p>)}
          </div>
        ))}
      </section>
      <section>
        <h3>Interests</h3>
        <p>{resume.interests}</p>
      </section>
    </article>
  );
}

export function ResumeSection({ onOpen }) {
  return (
    <section id="resume" className="resume-section section-pad" data-section>
      <div className="resume-section-copy">
        <h2>Curriculum vitae</h2>
        <p>My degree, projects, and work with the DRAFT and Squadra Corse student teams.</p>
        <div className="resume-actions">
          <a className="solid-button" href={cvUrl} download>
            Download CV <span>↓</span>
          </a>
          <button className="text-link" onClick={onOpen}>
            Read the CV <Arrow />
          </button>
        </div>
        <p className="document-note">One-page PDF · Updated November 2026</p>
      </div>
      <button className="resume-preview" onClick={onOpen} aria-label="Open résumé preview">
        <img src={cvPreview} alt="Preview of Maksym Kacper Horoszczak’s one-page CV" width="1530" height="1980" loading="lazy" />
      </button>
    </section>
  );
}

const collections = [
  {
    id: "photography",
    number: "01",
    title: "Photography",
    detail: "Photographs",
    label: "PHOTO ARCHIVE",
  },
  {
    id: "film",
    number: "02",
    title: "Film & process",
    detail: "Build footage and film",
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
    <section id="archive" className="personal-corner section-pad">
      <div>
        <h2>Maksym OS</h2>
        <p>The desktop was the first version of this portfolio. It still opens my projects, CV, terminal, and games.</p>
      </div>
      <div className="personal-actions">
        <button className="solid-button" onClick={onOpenDesktop}>
          Open Maksym OS <Arrow />
        </button>
        <details>
          <summary>Browse the personal archive</summary>
          <div>
            {collections.map((item) => (
              <button key={item.id} onClick={() => onOpenMedia(item.id)}>
                {item.title} <Arrow />
              </button>
            ))}
            <p>Collections are being prepared.</p>
          </div>
        </details>
      </div>
    </section>
  );
}

export function ContactDetails() {
  return (
    <div className="full-contact-details">
      <a href={`mailto:${profile.email}`}>
        <span className="contact-type">EMAIL</span>
        <span>{profile.email}</span>
        <Arrow />
      </a>
      <div>
        <span className="contact-type">EDUCATION</span>
        <span>
          Politecnico di Torino
          <br />
          <small>Mechanical Engineering · Bachelor’s</small>
        </span>
      </div>
      <div>
        <span className="contact-type">BASED IN</span>
        <span>Turin, Italy</span>
      </div>
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
              One page · Updated November 2026
            </span>
            <a href={cvUrl} download>
              Download PDF ↓
            </a>
          </div>
          <img className="cv-page-image" src={cvPreview} alt="The one-page CV. A readable text version follows below." width="1530" height="1980" />
          <details className="cv-text-version">
            <summary>Read as text</summary>
            <ResumeDocument />
          </details>
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
            <h3>No items yet</h3>
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
