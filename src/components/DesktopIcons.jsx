import { useState, useEffect } from 'react';
import './DesktopIcons.css';

const GRID_SIZE = 100;

const INITIAL_ICONS = [
  {
    id: 1,
    name: 'Resume',
    image: '/assets/icons/pdf.jpg',
    x: 20,
    y: 20,
  },
  {
    id: 2,
    name: 'VS Code',
    image: '/assets/icons/vs code.svg',
    x: 20,
    y: 120,
  },
  {
    id: 3,
    name: 'Projects',
    image: '/assets/icons/folder.png',
    x: 20,
    y: 220,
  },
  {
    id: 4,
    name: 'Contact Me',
    image: '/assets/icons/mail.png',
    x: 20,
    y: 320,
    appKey: 'mail',
  },
];

export default function DesktopIcons({ onOpenApp, openApps = {}, minimizedApps = {}, onMinimizeApp }) {
  const [icons, setIcons] = useState(() => {
    // Initialize icons with proper grid positions (auto-arranged)
    return INITIAL_ICONS.map((icon, index) => ({
      ...icon,
      x: 0,
      y: index * GRID_SIZE,
    }));
  });
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  const handleMouseDown = (e, icon) => {
    if (e.button !== 0) return;
    
    setDragging(icon.id);
    setSelected(icon.id);
    setOffset({
      x: e.clientX - icon.x,
      y: e.clientY - icon.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    setIcons(icons.map(icon => 
      icon.id === dragging
        ? { ...icon, x: e.clientX - offset.x, y: e.clientY - offset.y }
        : icon
    ));
  };

  const handleMouseUp = () => {
    if (dragging) {
      // Snap to grid on drop (auto-arrange)
      setIcons(icons.map(icon => 
        icon.id === dragging
          ? {
              ...icon,
              x: Math.round(icon.x / GRID_SIZE) * GRID_SIZE,
              y: Math.round(icon.y / GRID_SIZE) * GRID_SIZE,
            }
          : icon
      ));
    }
    setDragging(null);
  };

  const handleDoubleClick = (icon) => {
    console.log(`Opening ${icon.name}`);
    
    // Use explicit appKey if provided, otherwise convert icon name to app key
    const appKey = icon.appKey || icon.name.toLowerCase().replace(/\s+/g, '');
    
    if (onOpenApp) {
      // If app is already open and minimized, restore it
      if (openApps[appKey] && minimizedApps[appKey]) {
        onMinimizeApp(appKey);
      } else if (!openApps[appKey]) {
        // If app is not open, open it
        onOpenApp(appKey);
      }
    }
  };

  const handleContainerClick = (e) => {
    // Deselect when clicking on empty space
    if (e.target === e.currentTarget) {
      setSelected(null);
    }
  };

  return (
    <div 
      className="desktop-icons-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleContainerClick}
    >
      {icons.map(icon => (
        <div
          key={icon.id}
          className={`desktop-icon ${selected === icon.id ? 'selected' : ''} ${dragging === icon.id ? 'dragging' : ''}`}
          style={{
            left: `${icon.x}px`,
            top: `${icon.y}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e, icon)}
          onDoubleClick={() => handleDoubleClick(icon)}
        >
          <img src={icon.image} alt={icon.name} className="icon-image" />
          <div className="icon-label">{icon.name}</div>
        </div>
      ))}
    </div>
  );
}
