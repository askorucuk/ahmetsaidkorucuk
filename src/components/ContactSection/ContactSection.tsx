import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { type SiteContent } from '../../data/content';

const socialIcons = {
  Email: FiMail,
  LinkedIn: FiLinkedin,
  GitHub: FiGithub
} as const;

type SocialLabel = keyof typeof socialIcons;

type ContactSectionProps = {
  content: SiteContent;
};

export function ContactSection({ content }: ContactSectionProps) {
  return (
    <section className="storySection contactStory" aria-labelledby="contact-title">
      <div className="contactBlock">
        <h2 id="contact-title">{content.sections.contact.title}</h2>
        <p>{content.sections.contact.description}</p>
        <nav aria-label={content.ui.contactLinksAria} className="contactLinks">
          {content.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
              aria-label={`${social.label} ${content.ui.socialLinkSuffix}`}
            >
              {(() => {
                const Icon = socialIcons[social.label as SocialLabel];
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
