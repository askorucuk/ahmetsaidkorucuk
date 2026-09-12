import { type Project, type SiteContent } from '../../data/content';

type ProjectSectionProps = {
  content: SiteContent;
  project: Project;
  index: number;
  active: boolean;
};

export function ProjectSection({ content, project, index, active }: ProjectSectionProps) {
  return (
    <section
      id={`project-${project.id}`}
      className={`storySection projectStory ${active ? 'isActive' : ''}`}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="projectIndex">0{index + 1}</div>
      <div className="projectPanel">
        <h2 id={`${project.id}-title`}>{project.name}</h2>
        <p>{project.description}</p>
        <ul className="projectDetails" aria-label={`${project.name} ${content.ui.projectDetailsSuffix}`}>
          {project.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <dl>
          <div>
            <dt>{content.ui.roleLabel}</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>{content.ui.technologiesLabel}</dt>
            <dd>{project.technologies.join(', ')}</dd>
          </div>
          <div>
            <dt>{content.ui.yearLabel}</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>
        <a href={project.href} target="_blank" rel="noreferrer" className="textLink">
          {content.ui.viewProject}
        </a>
      </div>
    </section>
  );
}
