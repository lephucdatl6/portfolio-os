import { useState, useEffect } from 'react';
import './FolderWindow.css';

export default function FolderWindow({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const TASKBAR_HEIGHT = 60;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const basePath = ['This PC', 'Projects'];
  const [path, setPath] = useState(basePath);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const centerX = window.innerWidth / 2 - size.width / 2;
    const centerY = (window.innerHeight - 70) / 2 - size.height / 2;
    setPosition({ x: centerX, y: centerY });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.projects-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const MIN_VISIBLE = 200;
      const HEADER_GRAB_HEIGHT = 60;
      const clampedX = Math.min(
        Math.max(newX, -size.width + MIN_VISIBLE),
        window.innerWidth - MIN_VISIBLE
      );
      const clampedY = Math.min(
        Math.max(newY, -HEADER_GRAB_HEIGHT),
        window.innerHeight - MIN_VISIBLE
      );
      setPosition({ x: clampedX, y: clampedY });
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
        newWidth = Math.min(newWidth, window.innerWidth - resizeStart.posX);
      }
      if (resizeType.includes('left')) {
        newWidth = Math.max(400, resizeStart.width - deltaX);
        newX = resizeStart.posX + deltaX;
        if (newX < 0) {
          newX = 0;
          newWidth = resizeStart.width + resizeStart.posX;
        }
        if (newWidth === 400) {
          newX = resizeStart.posX + (resizeStart.width - 400);
        }
      }
      if (resizeType.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
        const maxHeight = window.innerHeight - resizeStart.posY;
        newHeight = Math.min(newHeight, maxHeight);
      }
      if (resizeType.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        newY = resizeStart.posY + deltaY;
        if (newY < 0) {
          newY = 0;
          newHeight = resizeStart.height + resizeStart.posY;
        }
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

  const openFolder = (name) => {
    setSelectedProject(null);
    setPath((prev) => [...basePath, name]);
  };

  const openSubfolder = (parent, name) => {
    if (parent === 'Main Projects' || parent === 'Experiments') {
      setPath([...basePath, parent, name]);
      setSelectedProject(name);
      return;
    }
    setSelectedProject(null);
    setPath([...basePath, parent, name]);
  };

  const goUp = () => {
    setSelectedProject(null);
    setPath((prev) => (prev.length > basePath.length ? prev.slice(0, prev.length - 1) : prev));
  };

  const goToIndex = (index) => {
    setPath((prev) => {
      const newPath = prev.slice(0, index + 1);
      if (
        newPath.length >= basePath.length + 2 &&
        (newPath[newPath.length - 2] === 'Main Projects' || newPath[newPath.length - 2] === 'Experiments')
      ) {
        setSelectedProject(newPath[newPath.length - 1]);
      } else {
        setSelectedProject(null);
      }
      return newPath;
    });
  };

  const navigateTo = (target) => {
    if (target === 'This PC') {
      setPath(basePath);
    } else if (target === 'Windows (C:)') {
      setPath(['This PC', 'Windows (C:)']);
    } else {
      setPath(['This PC', target]);
    }
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
      className={`projects-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={!isMaximized ? { 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex || 1000
      } : {
        zIndex: zIndex || 1000
      }}
      onMouseDown={(e) => {
        handleMouseDown(e);
        if (onFocus) onFocus();
      }}
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
      <div className="projects-header">
        <div className="projects-title">
          <span>Projects</span>
        </div>
        <div className="projects-controls">
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

      {/* Explorer content */}
      <div className="projects-content explorer-container">
        <div className="explorer-toolbar">
          <div className="nav-buttons">
            <button
              className="nav-btn"
              onClick={goUp}
              disabled={path.length === basePath.length}
              title="Back"
              aria-label="Back"
            >
              <img src="/assets/icons/back_arrow.svg" alt="Back" className="nav-icon" />
            </button>
          </div>
          <div className="address-bar" role="navigation" aria-label="Address bar">
            <div className="address-path">
              {path.map((segment, idx) => (
                <span key={idx} className="path-wrapper">
                  <button
                    className="path-segment"
                    onClick={() => goToIndex(idx)}
                    aria-current={idx === path.length - 1 ? 'page' : undefined}
                  >
                    {segment}
                  </button>
                  {idx < path.length - 1 && (
                    <img src="/assets/icons/arrow_right.svg" alt="" className="chevron-icon" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="explorer-body">
          <div className="explorer-main">
            {path.length === basePath.length ? (
              <div className="explorer-grid">
                <button className="folder-item" title="Main Projects" onDoubleClick={() => openFolder('Main Projects')}>
                  <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                  <span className="folder-name">Main Projects</span>
                </button>
                <button className="folder-item" title="Experiments" onDoubleClick={() => openFolder('Experiments')}>
                  <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                  <span className="folder-name">Experiments</span>
                </button>
              </div>
              ) : (
              selectedProject ? (
                <div className="folder-view">
                  <div className="info-card">
                    <div className="about-card">
                      <div className="info-title"><span>{selectedProject}</span></div>
                      <div className="about-content">
                        {selectedProject === 'RecipeForum' ? (
                          <>
                            <p><strong>Duration:</strong> Jun 2025 – Nov 2025</p>

                            <h4>Brief</h4>
                            <p>RecipeForum is a community-based web application where users can share recipes, interact through comments, and explore cooking ideas together.</p>

                            <h4>Description</h4>
                            <p>I built this project to practice full-stack development and understand how real applications work end to end. The platform supports user authentication, recipe posting, and commenting features, with basic AI-assisted validation to help check content and support moderation. I worked on both frontend and backend logic to manage data flow, user interactions, and data consistency. </p>
                            <p>Through this project, I improved my problem-solving skills, learned how to structure a complete application, and gained hands-on experience working with databases, APIs, and simple content moderation logic.</p>
                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">React Native</span>
                              <span className="tag">Node.js</span>
                              <span className="tag">Express</span>
                              <span className="tag">PostgreSQL</span>
                              <span className="tag">MongoDB</span>
                              <span className="tag">REST APIs</span>
                            </div>

                            <h4>Links</h4>
                            <p><a href="https://github.com/lephucdatl6/RecipeForum_Expo.git" target="_blank" rel="noopener noreferrer">Project repository</a></p>
                          </>
                        ) : selectedProject === 'Portfolio-OS' ? (
                          <>
                            <p><strong>Duration:</strong> Jan 2026 - Ongoing</p>

                            <h4>Brief</h4>
                            <p>A Windows-style interactive portfolio built with React to present my profile and projects in a familiar desktop environment.</p>

                            <h4>Description</h4>
                            <p>I built this portfolio as a frontend-focused project to explore UI/UX design, component-based architecture, and interactive state management in React. The interface mimics a desktop operating system, including a boot flow, login screen, windows, taskbar, and draggable applications.</p>
                            <p>The goal was to make the experience intuitive for non-technical users while still demonstrating frontend logic, layout structure, and attention to detail. This project reflects how I approach development: structured, practical, and creative, with a strong focus on user experience.</p>

                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">React</span>
                              <span className="tag">Vite</span>
                            </div>

                            <h4>Links</h4>
                            <p><a href="https://github.com/lephucdatl6/portfolio-os.git" target="_blank" rel="noopener noreferrer">Project repository</a></p>
                          </>
                        ) : selectedProject === 'Class Scheduling App' ? (
                          <>
                            <p><strong>Duration:</strong> Jun 2025 - Sep 2025 </p>

                            <h4>Brief</h4>
                            <p>A mobile application prototype designed to manage yoga class schedules, instructors, and bookings.</p>

                            <h4>Description</h4>
                            <p>This project focused on mobile UI design and application structure. I implemented core features such as class creation, scheduling by day and time, capacity management, and basic data handling. The project emphasized usability, layout consistency, and validation of user inputs in a mobile environment.</p>
                            <p>Through this experiment, I gained experience in mobile application design principles, feature planning, and structuring user-friendly interfaces for real-world use cases.</p>

                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">React Native</span>
                              <span className="tag">Android SDK</span>
                              <span className="tag">SQLite</span>
                              <span className="tag">Firebase</span>
                            </div>

                            <h4>Links</h4>
                            <p><a href="https://github.com/lephucdatl6/UniversalYogaAdmin_GCS220237.git" target="_blank" rel="noopener noreferrer">Admin repository</a></p>
                            <p><a href="https://github.com/lephucdatl6/UniversalYogaCustomer_GCS220237.git" target="_blank" rel="noopener noreferrer">Customer repository</a></p>

                          </>
                        ) : selectedProject === 'Web Stack & Database' ? (
                          <>
                            <p><strong>Duration:</strong> Jun 2024 - Oct 2024 </p>

                            <h4>Brief</h4>
                            <p>A comparative study and practical implementation of modern web development stacks and database architectures.</p>

                            <h4>Description</h4>
                            <p>This experiment explored differences between relational and NoSQL databases, as well as modern and traditional web stacks. I compared MEVN (MongoDB, Express, Vue, Node) with XAMPP (Apache, MySQL, PHP), and implemented a CRUD system using MongoDB and REST APIs.</p>
                            <p>The project strengthened my understanding of backend architecture, API design, and how different technology stacks affect scalability and development workflow.</p>

                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">MongoDB</span>
                              <span className="tag">Express</span>
                              <span className="tag">Vue</span>
                              <span className="tag">Node.js</span>
                              <span className="tag">Apache</span>
                              <span className="tag">MySQL</span>
                              <span className="tag">PHP</span>
                              <span className="tag">REST APIs</span>
                            </div>

                            <h4>Links</h4>
                            <p><a href="https://github.com/lephucdatl6/Web-Programming-2.git" target="_blank" rel="noopener noreferrer">Project repository</a></p>
                          </>
                        ) : selectedProject === 'Waste Sorting Microservices' ? (
                          <>
                            <p><strong>Duration:</strong> Oct 2024 - Nov 2024 </p>

                            <h4>Brief</h4>
                            <p>A microservices-based application designed to explore backend architecture, containerization, and API testing.</p>

                            <h4>Description</h4>
                            <p>This experiment focused on understanding microservices architecture using FastAPI, MongoDB, and Docker. The system was split into multiple services, each handling a specific domain such as users, waste categories, items, and challenges. All services were containerized and managed using Docker Compose.</p>
                            <p>I tested API endpoints, CRUD operations, authentication using JWT, and error handling through Postman. The experiment also included basic performance testing using in-memory caching to observe response time improvements. The goal of this project was to gain hands-on experience with backend system structure, service communication, and container-based deployment rather than building a full production application.</p>

                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">FastAPI</span>
                              <span className="tag">MongoDB</span>
                              <span className="tag">Docker</span>
                              <span className="tag">JWT</span>
                              <span className="tag">Postman</span>
                            </div>

                            <h4>Links</h4>
                            <p>No public repository (local experiment)</p>
                          </>
                        ) : selectedProject === 'Python Video Player (OOP)' ? (
                          <>
                            <p><strong>Duration:</strong> Sep 2023 - Nov 2023 </p>

                            <h4>Brief</h4>
                            <p>A Python desktop application built to practice object-oriented programming, GUI development, and basic testing.</p>

                            <h4>Description</h4>
                            <p>This project focuses on core OOP concepts using Python, including class design, modular structure, and data handling. The application allows users to manage videos, create playlists, update ratings, and store data using CSV files.</p>
                            <p>Basic GUI components were built with Tkinter, and unit tests were written using PyTest to validate core logic.</p>
                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">Python</span>
                              <span className="tag">Tkinter</span>
                              <span className="tag">CSV</span>
                              <span className="tag">PyTest</span>
                            </div>

                            <h4>Links</h4>
                            <p>No public repository (Academic project)</p>
                          </>
                        ): selectedProject === 'Academic Records System (CRUD)' ? (
                          <>
                            <p><strong>Duration:</strong> May 2024 - Jul 2024 </p>

                            <h4>Brief</h4>
                            <p>A CRUD-based web platform that allows students to post questions, manage content, and interact through a role-based system.</p>

                            <h4>Description</h4>
                            <p>This project focused on designing and implementing a full CRUD web application with user authentication, role-based access, and content management features. The platform allows users to create, edit, and delete posts, submit feedback, and manage account settings, while administrators can moderate content through dedicated panels.</p>
                            <p>Working on this project helped me better understand backend logic, database design, and security practices such as input validation, password hashing, and basic GDPR considerations. It also gave me experience structuring a system, handling different user roles, and testing common user scenarios.</p>

                            <h4>Tech used</h4>
                            <div className="tag-list">
                              <span className="tag">PHP</span>
                              <span className="tag">MySQL</span>
                              <span className="tag">PDO</span>
                            </div>

                            <h4>Links</h4>
                            <p><a href="https://github.com/lephucdatl6/php-crud-academic.git" target="_blank" rel="noopener noreferrer">Project repository</a></p>
                          </>
                        ) : (
                          <div className="empty-state">
                            <p>No preview available for {selectedProject}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (path[path.length - 1] === 'Main Projects') ? (
                <div className="explorer-grid">
                  <button className="folder-item" title="RecipeForum" onDoubleClick={() => openSubfolder('Main Projects', 'RecipeForum')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">RecipeForum</span>
                  </button>
                  <button className="folder-item" title="Portfolio-OS" onDoubleClick={() => openSubfolder('Main Projects', 'Portfolio-OS')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Portfolio-OS</span>
                  </button>
                </div>
              ) : (path[path.length - 1] === 'Experiments') ? (
                <div className="explorer-grid">
                  <button className="folder-item" title="Class Scheduling App" onDoubleClick={() => openSubfolder('Experiments', 'Class Scheduling App')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Class Scheduling App</span>
                  </button>
                  <button className="folder-item" title="Web Stack & Database" onDoubleClick={() => openSubfolder('Experiments', 'Web Stack & Database')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Web Stack & Database</span>
                  </button>
                  <button className="folder-item" title="Waste Sorting Microservices" onDoubleClick={() => openSubfolder('Experiments', 'Waste Sorting Microservices')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Waste Sorting Microservices</span>
                  </button>
                  <button className="folder-item" title="Python Video Player (OOP)" onDoubleClick={() => openSubfolder('Experiments', 'Python Video Player (OOP)')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Python Video Player (OOP)</span>
                  </button>
                  <button className="folder-item" title="Academic Records System (CRUD)" onDoubleClick={() => openSubfolder('Experiments', 'Academic Records System (CRUD)')}>
                    <img src="/assets/icons/folder.png" alt="Folder" className="folder-icon" />
                    <span className="folder-name">Academic Records System (CRUD)</span>
                  </button>
                </div>
              ) : (
                <div className="folder-view">
                  <div className="empty-state">
                    <img src="/assets/icons/file explorer.png" alt="Folder" className="folder-icon" />
                    <p>This folder is empty</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}