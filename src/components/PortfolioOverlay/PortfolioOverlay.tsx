import { FiArrowUp } from 'react-icons/fi';
import { type Locale, type SiteContent } from '../../data/content';
import { type ScrollSnapshot } from '../../hooks/useScrollProgress';
import { ContactSection } from '../ContactSection/ContactSection';
import { ProjectSection } from '../ProjectSection/ProjectSection';

type PortfolioOverlayProps = {
  content: SiteContent;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  snapshot: ScrollSnapshot;
};

export function PortfolioOverlay({ content, locale, setLocale, snapshot }: PortfolioOverlayProps) {
  const showGoTop = snapshot.progress > 0.9;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="overlay">
      <header className="siteChrome" aria-label="Site header">
        <a href={`mailto:${content.person.email}`} className="brandMark" aria-label={content.ui.brandEmailAria}>
          ASK
        </a>
        <div className="languageSwitch" aria-label={content.ui.languageAria}>
          {(['en', 'tr'] as const).map((item, index) => (
            <span className="languageSwitchItem" key={item}>
              {index > 0 && <span className="languageDivider" aria-hidden="true">|</span>}
              <button
                type="button"
                className={item === locale ? 'isActive' : ''}
                aria-pressed={item === locale}
                onClick={() => setLocale(item)}
              >
                {content.ui.languageOptions[item]}
              </button>
            </span>
          ))}
        </div>
      </header>

      <section id="intro" className="storySection heroStory" aria-labelledby="hero-title">
        <div className="heroCopy">
          <h1 id="hero-title">{content.person.name}</h1>
          <p className="heroRole">{content.person.title}</p>
          <p className="heroTagline">{content.person.tagline}</p>
        </div>
        <div className="scrollCue" aria-label={content.ui.scrollCueAria}>
          <span className="scrollCueIcon" aria-hidden="true">
            <span className="scrollCueTrack" />
            <span className="scrollCueArrow" />
          </span>
          <span className="srOnly">{content.ui.scrollDown}</span>
        </div>
      </section>

      <section className="storySection aboutStory" aria-labelledby="about-title">
        <div className="copyBlock">
          <h2 id="about-title">{content.sections.about.title}</h2>
          <p>{content.person.bio}</p>
          <ul className="profileHighlights" aria-label={content.ui.profileHighlightsAria}>
            {content.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="storySection skillsStory" aria-labelledby="skills-title">
        <div className="copyBlock compact">
          <h2 id="skills-title">{content.sections.skills.title}</h2>
          <p>{content.sections.skills.description}</p>
        </div>
        <div className="skillCloud" role="list" aria-label={content.ui.skillsAria}>
          {[content.skills.filter((_, index) => index % 2 === 0), content.skills.filter((_, index) => index % 2 !== 0)].map(
            (trackSkills, trackIndex) => (
              <ul className={`skillTrack ${trackIndex === 1 ? 'skillTrackReverse' : ''}`} key={trackIndex}>
                {[...trackSkills, ...trackSkills].map((skill, index) => (
                  <li
                    key={`${trackIndex}-${skill}-${index}`}
                    aria-hidden={index >= trackSkills.length}
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </section>

      <section className="storySection systemStory" aria-labelledby="system-title">
        <div className="copyBlock">
          <h2 id="system-title">{content.sections.system.title}</h2>
          <p>{content.sections.system.description}</p>
        </div>
      </section>

      <section className="storySection chronologyStory" aria-labelledby="chronology-title">
        <div className="copyBlock chronologyBlock">
          <h2 id="chronology-title">{content.sections.chronology.title}</h2>
          <ol className="timelineList" aria-label={content.ui.careerTimelineAria}>
            {content.timeline.map((item) => (
              <li key={item.period}>
                <span>{item.period}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="storySection mindStory" aria-labelledby="mind-title">
        <div className="copyBlock centered">
          <h2 id="mind-title">{content.sections.mind.title}</h2>
          <p>{content.sections.mind.description}</p>
        </div>
      </section>

      {content.projects.map((project, index) => (
        <ProjectSection
          key={project.id}
          content={content}
          project={project}
          index={index}
          active={snapshot.activeProject === index}
        />
      ))}

      <ContactSection content={content} />

      {showGoTop && (
        <button className="goTopButton" type="button" aria-label={content.ui.goTopAria} onClick={scrollToTop}>
          <FiArrowUp aria-hidden="true" />
        </button>
      )}
    </main>
  );
}
