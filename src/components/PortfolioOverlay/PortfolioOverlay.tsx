import { FiArrowUp } from 'react-icons/fi';
import { siteConfig } from '../../data/siteConfig';
import { type ScrollSnapshot } from '../../hooks/useScrollProgress';
import { ContactSection } from '../ContactSection/ContactSection';
import { ProjectSection } from '../ProjectSection/ProjectSection';

type PortfolioOverlayProps = {
  snapshot: ScrollSnapshot;
};

export function PortfolioOverlay({ snapshot }: PortfolioOverlayProps) {
  const showGoTop = snapshot.progress > 0.9;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="overlay">
      <header className="siteChrome" aria-label="Site header">
        <a href={`mailto:${siteConfig.person.email}`} className="brandMark" aria-label="Send email to Ahmet Said Korucuk">
          ASK
        </a>
        <span>{Math.round(snapshot.progress * 100).toString().padStart(2, '0')}%</span>
      </header>

      <section id="intro" className="storySection heroStory" aria-labelledby="hero-title">
        <div className="heroCopy">
          <h1 id="hero-title">{siteConfig.person.name}</h1>
          <p className="heroRole">{siteConfig.person.title}</p>
          <p className="heroTagline">{siteConfig.person.tagline}</p>
        </div>
        <div className="scrollCue" aria-label="Sinir ağını görmek için aşağı kaydır">
          <span className="scrollCueIcon" aria-hidden="true">
            <span className="scrollCueTrack" />
            <span className="scrollCueArrow" />
          </span>
          <span className="srOnly">Aşağı kaydır</span>
        </div>
      </section>

      <section className="storySection aboutStory" aria-labelledby="about-title">
        <div className="copyBlock">
          <h2 id="about-title">Frontend ownership, AI product development ve production disiplini.</h2>
          <p>{siteConfig.person.bio}</p>
          <ul className="profileHighlights" aria-label="Profile highlights">
            {siteConfig.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="storySection skillsStory" aria-labelledby="skills-title">
        <div className="copyBlock compact">
          <h2 id="skills-title">Ölçeklenebilir arayüz mimarisi, ölçülebilir ürün etkisi.</h2>
          <p>
            React, TypeScript, Redux Toolkit, Zustand ve TanStack Query ile karmaşık ürün akışlarını component yapısına, state modeline ve sürdürülebilir data-flow düzenine ayırıyorum.
          </p>
        </div>
        <div className="skillCloud" role="list" aria-label="Skills">
          {[siteConfig.skills.filter((_, index) => index % 2 === 0), siteConfig.skills.filter((_, index) => index % 2 !== 0)].map(
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
          <h2 id="system-title">Ürün akışını uçtan uca sahiplenen frontend yaklaşımı.</h2>
          <p>
            Report Builder, Digest Builder, Boards ve Conversations boyunca feature delivery, kritik hata çözümü, CRUD workflow, drag-and-drop, WebSocket ve AI destekli özellikleri aynı ürün mantığı içinde taşıdım.
          </p>
        </div>
      </section>

      <section className="storySection chronologyStory" aria-labelledby="chronology-title">
        <div className="copyBlock chronologyBlock">
          <h2 id="chronology-title">Mühendislik çizgim ürün sorumluluğuyla derinleşti.</h2>
          <ol className="timelineList" aria-label="Career timeline">
            {siteConfig.timeline.map((item) => (
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
          <h2 id="mind-title">Gerçek zamanlı frontend sistemlerini AI katmanıyla birleştiriyorum.</h2>
          <p>
            Agent tabanlı AI sistemlerini frontend uygulamalarına prompt suggestion, summarization, fallback mekanizmaları ve güvenilir realtime communication prensipleriyle bağlıyorum.
          </p>
        </div>
      </section>

      {siteConfig.projects.map((project, index) => (
        <ProjectSection
          key={project.id}
          project={project}
          index={index}
          active={snapshot.activeProject === index}
        />
      ))}

      <ContactSection />

      {showGoTop && (
        <button className="goTopButton" type="button" aria-label="Sayfanın başına dön" onClick={scrollToTop}>
          <FiArrowUp aria-hidden="true" />
        </button>
      )}
    </main>
  );
}
