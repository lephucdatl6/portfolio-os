import DesktopIcons from '../components/DesktopIcons';
import Taskbar from '../components/Taskbar';
import './DesktopLayout.css';

export default function DesktopLayout() {
  return (
    <div className="desktop-layout">
      <DesktopIcons />
      <Taskbar />
    </div>
  );
}
