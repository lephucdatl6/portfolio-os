import DesktopIcons from '../components/DesktopIcons';
import Taskbar from '../components/Taskbar';
import './DesktopLayout.css';

export default function DesktopLayout({ onOpenApp, openApps, onCloseApp, minimizedApps, maximizedApps, onMinimizeApp, onMaximizeApp, appOpenOrder, onShutdown }) {
  return (
    <div className="desktop-layout">
      <DesktopIcons 
        onOpenApp={onOpenApp}
        openApps={openApps}
        minimizedApps={minimizedApps}
        onMinimizeApp={onMinimizeApp}
      />
      <Taskbar 
        openApps={openApps} 
        onOpenApp={onOpenApp} 
        onCloseApp={onCloseApp}
        minimizedApps={minimizedApps}
        onMinimizeApp={onMinimizeApp}
        appOpenOrder={appOpenOrder}
        onShutdown={onShutdown}
      />
    </div>
  );
}
