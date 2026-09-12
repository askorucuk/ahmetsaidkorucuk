import { type Project } from '../../data/siteConfig';

type ProjectSectionProps = {
  project: Project;
  index: number;
  active: boolean;
};

export function ProjectSection({ project, index, active }: ProjectSectionProps) {
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
        <ul className="projectDetails" aria-label={`${project.name} engineering details`}>
          {project.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <dl>
          <div>
            <dt>Rol</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Teknolojiler</dt>
            <dd>{project.technologies.join(', ')}</dd>
          </div>
          <div>
            <dt>Yıl</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>
        <a href={project.href} target="_blank" rel="noreferrer" className="textLink">
          Projeyi görüntüle
        </a>
      </div>
    </section>
  );
}
