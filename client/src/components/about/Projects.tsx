import { useTranslation } from 'react-i18next'
import { MdConstruction } from 'react-icons/md'
import type { Language } from '@/i18n'
import { projects } from '@/data/projects'

// Featured projects, personal and made with companies, below the road
const Projects = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as Language

  return (
    <section className="about_projects" aria-labelledby="about-projects-title">
      <h2 id="about-projects-title" className="about_projects_title">{t('about.projects.title')}</h2>

      <ul className="about_projects_grid">
        {projects.map((project) => (
          <li key={project.id} className="project_card">
            {project.inProgress && (
              <span className="project_badge" title={t('about.projects.inProgress')}>
                <MdConstruction aria-label={t('about.projects.inProgress')} role="img" />
              </span>
            )}
            <p className="project_meta">{project.company ?? t('about.projects.personal')}</p>
            <h3 className="project_name">{project.name}</h3>
            <p className="project_role">{project.role[lang]}</p>
            <p className="project_description">{project.description[lang]}</p>
            <ul className="project_stack">
              {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
            </ul>
            {(project.link || project.code) && (
              <p className="project_links">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    {t('about.projects.visit')} →
                  </a>
                )}
                {project.code && (
                  <a href={project.code} target="_blank" rel="noopener noreferrer">
                    {t('about.projects.code')} →
                  </a>
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Projects
