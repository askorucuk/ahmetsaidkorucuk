import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { siteConfig } from '../../data/siteConfig';

const socialIcons = {
  Email: FiMail,
  LinkedIn: FiLinkedin,
  GitHub: FiGithub
} as const;

export function ContactSection() {
  return (
    <section className="storySection contactStory" aria-labelledby="contact-title">
      <div className="contactBlock">
        <h2 id="contact-title">Yeni bağlantılar yeni fikirler yaratır.</h2>
        <p>Birlikte üretelim.</p>
        <nav aria-label="Contact links" className="contactLinks">
          {siteConfig.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
              aria-label={`${social.label} bağlantısı`}
            >
              {(() => {
                const Icon = socialIcons[social.label];
                return <Icon aria-hidden="true" focusable="false" />;
              })()}
              {social.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
