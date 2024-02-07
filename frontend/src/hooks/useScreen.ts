import { useEffect, useState } from "react";

const useScreen = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const getScreenSize = () => {
      setIsMobile(window.window.innerWidth <= 760);
    };
    getScreenSize();
    window.addEventListener("resize", getScreenSize);
    return () => window.removeEventListener("resize", getScreenSize);
  });

  return { isMobile };
};

export default useScreen;
