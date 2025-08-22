import { useState, useEffect } from "react";

const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: "desktop", // 'mobile', 'tablet', 'desktop'
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    orientation: "landscape",
    screenSize: "large",
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // More accurate device detection using multiple factors
      let deviceType = "desktop";
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      // Check for mobile patterns in user agent
      const mobilePatterns = [
        /android.*mobile/,
        /iphone/,
        /ipod/,
        /blackberry/,
        /windows phone/,
        /mobile/,
      ];

      // Check for tablet patterns
      const tabletPatterns = [
        /ipad/,
        /android(?!.*mobile)/,
        /tablet/,
        /kindle/,
        /playbook/,
        /surface/,
      ];

      // First check user agent
      const isMobileUA = mobilePatterns.some((pattern) =>
        pattern.test(userAgent)
      );
      const isTabletUA = tabletPatterns.some((pattern) =>
        pattern.test(userAgent)
      );

      if (isMobileUA) {
        deviceType = "mobile";
        isMobile = true;
        isTablet = false;
        isDesktop = false;
      } else if (isTabletUA) {
        deviceType = "tablet";
        isMobile = false;
        isTablet = true;
        isDesktop = false;
      } else {
        // Fallback to screen size + touch for edge cases
        if (hasTouch && width <= 768) {
          deviceType = "mobile";
          isMobile = true;
          isTablet = false;
          isDesktop = false;
        } else if (hasTouch && width <= 1024) {
          deviceType = "tablet";
          isMobile = false;
          isTablet = true;
          isDesktop = false;
        } else {
          deviceType = "desktop";
          isMobile = false;
          isTablet = false;
          isDesktop = true;
        }
      }

      // Determine screen size category
      let screenSize = "large";
      if (width <= 640) screenSize = "small";
      else if (width <= 768) screenSize = "medium";
      else if (width <= 1024) screenSize = "large";
      else screenSize = "xlarge";

      // Determine orientation
      const orientation = width > height ? "landscape" : "portrait";

      setDeviceInfo({
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice: hasTouch,
        orientation,
        screenSize,
        width,
        height,
        userAgent: userAgent.substring(0, 100), // First 100 chars for debugging
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize events (orientation changes, window resizing)
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;
