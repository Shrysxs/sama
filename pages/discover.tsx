import { useState } from 'react';
import Head from 'next/head';
import ToolCard, { Tool } from '@/components/ToolCard';
import tools from '@/data/tools.json';
import styles from '../styles/Discover.module.css';

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const list = tools as Tool[];
  
  // Get unique categories
  const categories = Array.from(
    new Set(list.map(tool => tool.category).filter(Boolean))
  ) as string[];
  
  const filteredTools = list.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = selectedCategory 
      ? tool.category === selectedCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Discover AI Tools | Sama.dev</title>
        <meta name="description" content="Discover and explore AI tools and micro-SaaS products" />
      </Head>
      
      <div className={styles.header}>
        <h1 className={styles.title}>Discover AI Tools</h1>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search tools by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {(searchTerm || selectedCategory) && (
              <button 
                onClick={clearFilters}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category:</span>
              <div className={styles.categoryButtons}>
                <button
                  className={`${styles.categoryButton} ${!selectedCategory ? styles.activeCategory : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.activeCategory : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <p className={styles.resultCount}>
          {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found
          {(searchTerm || selectedCategory) && (
            <button 
              onClick={clearFilters}
              className={styles.clearLink}
            >
              Clear all filters
            </button>
          )}
        </p>
      </div>

      {filteredTools.length > 0 ? (
        <div className={styles.toolsGrid}>
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <h2>No tools found</h2>
          <p>We couldn't find any tools matching your search "{searchTerm}" 
            {selectedCategory && ` in the ${selectedCategory} category`}.</p>
          <button 
            onClick={clearFilters}
            className={styles.clearButtonLarge}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
