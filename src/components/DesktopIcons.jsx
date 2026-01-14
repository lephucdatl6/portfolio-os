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
    appKey: 'resume', // Opens PDF file
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
      // Snap to grid on drop with collision detection
      setIcons(prevIcons => {
        return prevIcons.map(icon => {
          if (icon.id === dragging) {
            const snappedX = Math.round(icon.x / GRID_SIZE) * GRID_SIZE;
            const snappedY = Math.round(icon.y / GRID_SIZE) * GRID_SIZE;
            
            // Check for collisions with other icons
            const isColliding = prevIcons.some(otherIcon => 
              otherIcon.id !== icon.id && 
              otherIcon.x === snappedX && 
              otherIcon.y === snappedY
            );
            
            if (isColliding) {
              // Find nearest empty grid position
              let foundPosition = false;
              let testX = snappedX;
              let testY = snappedY;
              
              // Search in expanding spiral pattern
              for (let radius = 1; radius <= 10 && !foundPosition; radius++) {
                // Try positions around the target
                const positions = [
                  { x: testX + (radius * GRID_SIZE), y: testY },
                  { x: testX - (radius * GRID_SIZE), y: testY },
                  { x: testX, y: testY + (radius * GRID_SIZE) },
                  { x: testX, y: testY - (radius * GRID_SIZE) },
                ];
                
                for (const pos of positions) {
                  if (pos.x >= 0 && pos.y >= 0) { // Keep within bounds
                    const collision = prevIcons.some(otherIcon => 
                      otherIcon.id !== icon.id && 
                      otherIcon.x === pos.x && 
                      otherIcon.y === pos.y
                    );
                    if (!collision) {
                      testX = pos.x;
                      testY = pos.y;
                      foundPosition = true;
                      break;
                    }
                  }
                }
              }
              
              return { ...icon, x: testX, y: testY };
            }
            
            return { ...icon, x: snappedX, y: snappedY };
          }
          return icon;
        });
      });
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
