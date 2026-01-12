import { useEffect, useState } from "react";
import BootScreen from "./components/BootScreen";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";

function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isBooting) {
    return <BootScreen />;
  }

  const isMobile = window.innerWidth < 1024;

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default App;
