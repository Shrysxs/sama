import Link from 'next/link';
import styles from './ToolCard.module.css';

export type Tool = { 
  id: string; 
  name: string; 
  description: string;
  website_url?: string;
  github_url?: string;
  category?: string;
  tags?: string[];
  created_at?: string;
};

export default function ToolCard({ tool }: { tool: Tool }) {
  // Truncate description if it's too long
  const maxDescriptionLength = 120;
  const truncatedDescription = tool.description.length > maxDescriptionLength 
    ? tool.description.substring(0, maxDescriptionLength) + '...' 
    : tool.description;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article className={styles.card} aria-label={`${tool.name} - ${tool.category || 'Tool'}`}>
      <div className={styles.header}>
        <Link href={`/tools/${tool.id}`} className={styles.toolLink}>
          <h3 className={styles.title}>{tool.name}</h3>
        </Link>
        
        {tool.category && (
          <span className={styles.category} aria-label={`Category: ${tool.category}`}>
            {tool.category}
          </span>
        )}
      </div>
      
      <p className={styles.description}>
        {truncatedDescription}
        {tool.description.length > maxDescriptionLength && (
          <span className="sr-only">... Read more</span>
        )}
      </p>
      
      {tool.tags && tool.tags.length > 0 && (
        <div className={styles.tags} aria-label="Tags">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className={styles.moreTags} aria-label={`${tool.tags.length - 3} more tags`}>
              +{tool.tags.length - 3} more
            </span>
          )}
        </div>
      )}
      
      <footer className={styles.footer}>
        <div className={styles.links}>
          {tool.website_url && (
            <a 
              href={tool.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${styles.link} ${styles.websiteLink}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Visit ${tool.name} website`}
            >
              <span className={styles.icon} aria-hidden="true">🌐</span> Website
            </a>
          )}
          {tool.github_url && (
            <a 
              href={tool.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${styles.link} ${styles.githubLink}`}
              onClick={(e) => e.stopPropagation()}
              aria-label="View source code on GitHub"
            >
              <span className={styles.icon} aria-hidden="true">💻</span> Code
            </a>
          )}
        </div>
        
        {tool.created_at && (
          <time 
            dateTime={new Date(tool.created_at).toISOString()}
            className={styles.date}
            title={`Added on ${formatDate(tool.created_at)}`}
          >
            {formatDate(tool.created_at)}
          </time>
        )}
      </footer>
    </article>
  );
}
