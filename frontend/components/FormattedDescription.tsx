'use client';

import styles from './FormattedDescription.module.css';

interface Props {
  text: string;
}

export default function FormattedDescription({ text }: Props) {
  if (!text) return null;

  // Split by double newlines or numbered items for paragraph breaks
  // Also detect patterns like "1)", "2)", numbered lists
  const formatText = (raw: string) => {
    // Normalize line endings
    let cleaned = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split into sections by double newlines or numbered patterns
    // Match patterns like "1)", "2)", "1.", "2.", or bullet points
    const sections = cleaned.split(/\n{2,}|(?=\d+[\)\.]\s)/g).filter(s => s.trim());
    
    return sections.map((section, i) => {
      const trimmed = section.trim();
      
      // Check if it's a URL
      if (trimmed.match(/^https?:\/\/\S+$/)) {
        return (
          <a key={i} href={trimmed} target="_blank" rel="noopener noreferrer" className={styles.link}>
            🔗 {trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed}
          </a>
        );
      }
      
      // Check if it starts with a label like "Template video:" or "What you get:"
      const labelMatch = trimmed.match(/^([A-Za-z\s]+(?:video|inside|get|includes|features|contents|overview)?)\s*:\s*(.*)/is);
      if (labelMatch && labelMatch[1].length < 40) {
        const label = labelMatch[1].trim();
        const rest = labelMatch[2].trim();
        
        // If the rest is a URL
        if (rest.match(/^https?:\/\/\S+$/)) {
          return (
            <div key={i} className={styles.labelBlock}>
              <span className={styles.label}>{label}:</span>
              <a href={rest} target="_blank" rel="noopener noreferrer" className={styles.link}>
                🔗 View Link
              </a>
            </div>
          );
        }
        
        return (
          <div key={i} className={styles.labelBlock}>
            <span className={styles.label}>{label}:</span>
            <span>{rest}</span>
          </div>
        );
      }
      
      // Check if it's a numbered item like "1) Dashboard..." or "2. Daily Planner..."
      const numberedMatch = trimmed.match(/^(\d+)[\)\.]\s*(.*)/s);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const content = numberedMatch[2].trim();
        
        // Further split content by sub-items (like "choose your Top 1 goal choose your...")
        // Look for inner sections separated by common patterns
        const titleMatch = content.match(/^([^\(]+?)(?:\s*\(([^)]+)\))?\s*(.*)/s);
        
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const subtitle = titleMatch[2] || '';
          const body = titleMatch[3].trim();
          
          return (
            <div key={i} className={styles.numberedItem}>
              <div className={styles.numberedHeader}>
                <span className={styles.number}>{num}</span>
                <div>
                  <strong className={styles.itemTitle}>{title}</strong>
                  {subtitle && <span className={styles.itemSubtitle}>({subtitle})</span>}
                </div>
              </div>
              {body && <p className={styles.itemBody}>{body}</p>}
            </div>
          );
        }
        
        return (
          <div key={i} className={styles.numberedItem}>
            <div className={styles.numberedHeader}>
              <span className={styles.number}>{num}</span>
              <p>{content}</p>
            </div>
          </div>
        );
      }
      
      // Regular paragraph — also handle inline URLs
      const parts = trimmed.split(/(https?:\/\/\S+)/g);
      return (
        <p key={i} className={styles.paragraph}>
          {parts.map((part, j) => {
            if (part.match(/^https?:\/\/\S+$/)) {
              return (
                <a key={j} href={part} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                  {part.length > 50 ? part.substring(0, 50) + '...' : part}
                </a>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className={styles.formattedDescription}>
      {formatText(text)}
    </div>
  );
}
