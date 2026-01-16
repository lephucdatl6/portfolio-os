import DesktopIcons from '../components/DesktopIcons';
import './DesktopLayout.css';

export default function DesktopLayout({ onOpenApp, openApps, minimizedApps, onMinimizeApp }) {
  return (
    <div className="desktop-layout">
      <DesktopIcons 
        onOpenApp={onOpenApp}
        openApps={openApps}
        minimizedApps={minimizedApps}
        onMinimizeApp={onMinimizeApp}
      />
    </div>
  );
}
