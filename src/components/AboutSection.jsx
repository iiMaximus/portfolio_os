import resume from "../resumeData.json";

const teamUrls = {
  "Squadra Corse PoliTO": "https://www.squadracorsepolito.com/",
  "DRAFT PoliTO": "https://www.draftpolito.it/",
};

export default function AboutSection() {
  return (
    <section id="about" className="about-section section-pad" data-section>
      <div className="about-identity">
        <h2>About me</h2>
        <div id="education" className="education-card">
          <span className="eyebrow">CURRENT EDUCATION</span>
          <h3>Politecnico di Torino</h3>
          <p>Bachelor’s in Mechanical Engineering</p>
          <dl>
            <div>
              <dt>Year</dt>
              <dd>Third year</dd>
            </div>
            <div>
              <dt>Expected graduation</dt>
              <dd>July 2027</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="about-copy">
        <p className="about-lead">
          When I was five, I drew imaginary machines. Airplanes were my favourites.
        </p>
        <p>
          By middle school I knew I wanted to study aerospace. I’m now finishing
          my mechanical engineering degree in Turin. The drone was my first chance
          to take a design all the way from CAD to flight.
        </p>
        <p>
          One of the harder decisions was where to put the battery. The camera
          belongs at the front, but that shifts the balance. Working out where
          everything could fit made the SolidWorks assembly as much about the
          electronics as the frame itself.
        </p>
        <dl className="profile-skills">
          {resume.skills.map(([label, items]) => (
            <div key={label}><dt>{label}</dt><dd>{items}</dd></div>
          ))}
          <div><dt>Languages</dt><dd>Polish (native), English (C2), Spanish (about B1), Chinese (HSK 3).</dd></div>
        </dl>
        <div className="about-interests">
          <span className="eyebrow">Outside university</span>
          <p>{resume.interests}</p>
        </div>
      </div>
      <div className="experience-block">
        <div className="experience-heading">
          <h3>University teams</h3>
        </div>
        <div className="experience-entries">
          {resume.experience.map((item) => (
            <article key={item.name}>
              <div className="experience-meta">
                <span className="eyebrow">{item.dates}</span>
                <span>{item.role}</span>
              </div>
              <h3>
                <a href={teamUrls[item.name]} target="_blank" rel="noreferrer">
                  {item.name} <span aria-hidden="true">↗</span>
                </a>
              </h3>
              <p>{item.bullets.join(" ")}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
