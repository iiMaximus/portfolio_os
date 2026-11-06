import resume from "../resumeData.json";

const teamUrls = {
  "Squadra Corse PoliTO": "https://www.squadracorsepolito.com/",
  "DRAFT PoliTO": "https://www.draftpolito.it/",
};

export default function AboutSection() {
  return (
    <section id="about" className="about-section section-pad" data-section>
      <div className="about-identity">
        <p className="eyebrow">02 — ABOUT ME</p>
        <h2>
          It started
          <br />
          with <em>airplanes.</em>
        </h2>
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
          At five, I was drawing imaginary machines. Airplanes were always my
          favourites.
        </p>
        <p>
          By middle school, I knew I wanted to study aerospace. I’m now in my
          third year of Mechanical Engineering at Politecnico di Torino,
          building the foundations and working on projects of my own.
        </p>
        <p>
          I like having a whole design to think through. For my drone, I started
          with an empty SolidWorks assembly, designed the frame and where every
          component would go, and had the parts cut from carbon fibre. Then came
          assembly, soldering, and the first flights. The electronics and motors
          are off the shelf; the mechanical design and integration are my work.
        </p>
        <p>
          Software is another part of that curiosity. I built and released
          Lychee, a food and cosmetics scanner, and Absorb, a word-by-word
          reading app, with help from AI coding tools. I handle Lychee’s
          development and work with a friend on distribution, which is our
          focus now.
        </p>
        <div className="about-interests">
          <span className="eyebrow">AWAY FROM THE WORKBENCH</span>
          <p>{resume.interests}</p>
        </div>
      </div>
      <div className="experience-block">
        <div className="experience-heading">
          <p className="eyebrow">EXPERIENCE ALONG THE WAY</p>
          <p>
            Two student teams.
            <br />
            Different parts of engineering.
          </p>
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
