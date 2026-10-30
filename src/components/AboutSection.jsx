import resume from "../resumeData.json";

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
          component would go, and had the parts cut from carbon fibre. The
          electronics and motors are off the shelf; the mechanical design and
          integration are my work.
        </p>
        <p>
          Software is another part of that curiosity. I developed Allergify,
          Absorb, and Quarter with help from AI coding tools, and I’m now
          working on getting them into people’s hands.
        </p>
        <div className="about-interests">
          <span className="eyebrow">WHAT KEEPS ME CURIOUS</span>
          <p>Aircraft · Mechanical design · Building complete systems</p>
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
                <span className="eyebrow">{item.period}</span>
                <span>{item.role}</span>
              </div>
              <h3>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.name} <span aria-hidden="true">↗</span>
                </a>
              </h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
