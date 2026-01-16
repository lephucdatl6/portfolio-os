import { useState, useEffect } from 'react';
import './GitHubWindow.css';

export default function GitHubWindow({ onClose, onMinimize, onMaximize, isMaximized, isMinimized }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(true);
  const [commitError, setCommitError] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);
  const [loadingRepo, setLoadingRepo] = useState(true);

  // Initialize position to center on mount
  useEffect(() => {
    const centerX = window.innerWidth / 2 - 450;
    const centerY = window.innerHeight / 2 - 350; 
    setPosition({ x: centerX, y: centerY });
  }, []);

  // Fetch commits from GitHub API
  const fetchCommits = async () => {
    try {
      setLoadingCommits(true);
      setCommitError(null);
      const response = await fetch('https://api.github.com/repos/lephucdatl6/portfolio-os/commits?per_page=5');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }
      
      const commitsData = await response.json();
      setCommits(commitsData);
    } catch (error) {
      console.error('Error fetching commits:', error);
      setCommitError(error.message);
      // Fallback to mock data if API fails
      setCommits([
        {
          sha: 'mock1',
          commit: {
            message: 'Add GitHub Desktop window',
            author: {
              date: new Date(Date.now() - 2 * 60 * 1000).toISOString()
            }
          }
        },
        {
          sha: 'mock2',
          commit: {
            message: 'Initial portfolio setup',
            author: {
              date: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            }
          }
        }
      ]);
    } finally {
      setLoadingCommits(false);
    }
  };

  // Fetch repository information from GitHub API
  const fetchRepoInfo = async () => {
    try {
      setLoadingRepo(true);
      const response = await fetch('https://api.github.com/repos/lephucdatl6/portfolio-os');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch repo info: ${response.status}`);
      }
      
      const repoData = await response.json();
      setRepoInfo(repoData);
    } catch (error) {
      console.error('Error fetching repository info:', error);
      // Fallback to mock data if API fails
      setRepoInfo({
        updated_at: new Date().toISOString(),
        stargazers_count: 1
      });
    } finally {
      setLoadingRepo(false);
    }
  };

  // Fetch commits and repo info on component mount
  useEffect(() => {
    fetchCommits();
    fetchRepoInfo();
  }, []);

  // Helper function to format commit date
  const formatCommitDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.github-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }

    if (isResizing && resizeType) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      if (resizeType.includes('right')) {
        newWidth = Math.max(400, resizeStart.width + deltaX);
      }
      if (resizeType.includes('left')) {
        newWidth = Math.max(400, resizeStart.width - deltaX);
        newX = resizeStart.posX + deltaX;
        if (newWidth === 400) {
          newX = resizeStart.posX + (resizeStart.width - 400);
        }
      }
      if (resizeType.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
      }
      if (resizeType.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        newY = resizeStart.posY + deltaY;
        if (newHeight === 300) {
          newY = resizeStart.posY + (resizeStart.height - 300);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeType('');
  };

  const handleResizeStart = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeType]);

  if (isMinimized) return null;

  return (
    <div 
      className={`github-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={!isMaximized ? { 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      } : {}}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handles */}
      {!isMaximized && (
        <>
          <div className="resize-handle resize-top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
          <div className="resize-handle resize-right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
          <div className="resize-handle resize-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
          <div className="resize-handle resize-left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
          <div className="resize-handle resize-top-left" onMouseDown={(e) => handleResizeStart(e, 'top left')} />
          <div className="resize-handle resize-top-right" onMouseDown={(e) => handleResizeStart(e, 'top right')} />
          <div className="resize-handle resize-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom left')} />
          <div className="resize-handle resize-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom right')} />
        </>
      )}

      {/* Window header */}
      <div className="github-header">
        <div className="github-title">
          <span>My GitHub</span>
        </div>
        <div className="github-controls">
          <button className="control-btn minimize-btn" onClick={onMinimize}>
            <span>−</span>
          </button>
          <button className="control-btn maximize-btn" onClick={onMaximize}>
            <span>{isMaximized ? '❐' : '□'}</span>
          </button>
          <button className="control-btn close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
      </div>

      {/* GitHub content */}
      <div className="github-content">
        <div className="github-sidebar">
          <div className="sidebar-section">
            <h3>Current repository</h3>
            <div className="repo-info">
              <div className="repo-name">portfolio-os</div>
              <div className="repo-path">~/portfolio-os</div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>History</h3>
            <div className="commit-list">
              {loadingCommits ? (
                <div className="commit-item">
                  <div className="commit-message">Loading commits...</div>
                  <div className="commit-meta">Fetching from GitHub</div>
                </div>
              ) : commitError ? (
                <div className="commit-item">
                  <div className="commit-message">Failed to load commits</div>
                  <div className="commit-meta">{commitError}</div>
                </div>
              ) : commits.length > 0 ? (
                commits.map((commit) => (
                  <div 
                    key={commit.sha} 
                    className="commit-item"
                    onClick={() => window.open(`https://github.com/lephucdatl6/portfolio-os/commit/${commit.sha}`, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="commit-message" title={commit.commit.message}>
                      {commit.commit.message}
                    </div>
                    <div className="commit-meta">
                      {formatCommitDate(commit.commit.author.date)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="commit-item">
                  <div className="commit-message">No commits found</div>
                  <div className="commit-meta">Repository may be empty</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="github-main">
          <div className="main-header">
            <h2>Welcome to my GitHub</h2>
            <p>Explore my development journey and projects through this interactive GitHub Desktop showcase</p>
          </div>

          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => window.open('https://github.com/lephucdatl6/portfolio-os', '_blank')}>
              <span>📂</span>
              View on GitHub
            </button>
            <button className="action-btn secondary" onClick={() => window.open('https://github.com/lephucdatl6?tab=repositories', '_blank')}>
              <span>📊</span>
              View All Repositories
            </button>
            <button className="action-btn secondary" onClick={() => window.open('https://github.com/lephucdatl6', '_blank')}>
              <span>👤</span>
              View Profile
            </button>
          </div>

          <div className="recent-repos">
            <h3>Recent repositories</h3>
            <div className="repo-list">
              <div className="repo-card" onClick={() => window.open('https://github.com/lephucdatl6/portfolio-os', '_blank')}>
                <div className="repo-header">
                  <h4>portfolio-os</h4>
                  <span className="repo-type">Public</span>
                </div>
                <p>Interactive portfolio website built as an operating system interface</p>
                <div className="repo-meta">
                  <span className="language">
                    <span className="lang-dot javascript"></span>
                    JavaScript
                  </span>
                  <span className="stars">⭐ {repoInfo?.stargazers_count || 1}</span>
                  <span className="updated">
                    {loadingRepo ? 'Loading...' : `Updated ${formatCommitDate(repoInfo?.updated_at || new Date().toISOString())}`}
                  </span>
                </div>
              </div>

              <div className="repo-card" onClick={() => window.open('https://github.com/lephucdatl6?tab=repositories', '_blank')}>
                <div className="repo-header">
                  <h4>Click to view more repositories</h4>
                  <span className="repo-type">GitHub Profile</span>
                </div>
                <p>Explore all my projects and contributions on GitHub</p>
                <div className="repo-meta">
                  <span>🔗 Visit GitHub Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}