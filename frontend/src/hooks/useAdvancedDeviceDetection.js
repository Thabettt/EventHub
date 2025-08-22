import { useState, useEffect } from "react";

const useAdvancedDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    orientation: "landscape",
    screenSize: "large",
    performance: "high", // 'low', 'medium', 'high'
    connectionType: "unknown", // '2g', '3g', '4g', 'wifi'
    isLowPowerMode: false,
    preferredFormat: "full", // 'minimal', 'compact', 'full'
  });

  useEffect(() => {
    const detectAdvancedDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Basic device detection (same as before)
      let deviceType = "desktop";
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      // Device type detection
      const mobilePatterns = [
        /android.*mobile/,
        /iphone/,
        /ipod/,
        /blackberry/,
        /windows phone/,
        /mobile/,
      ];
      const tabletPatterns = [
        /ipad/,
        /android(?!.*mobile)/,
        /tablet/,
        /kindle/,
        /playbook/,
        /surface/,
      ];

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
        }
      }

      // Performance detection
      let performance = "high";
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const memory = navigator.deviceMemory || 4; // GB

      if (hardwareConcurrency <= 2 || memory <= 2) {
        performance = "low";
      } else if (hardwareConcurrency <= 4 || memory <= 4) {
        performance = "medium";
      }

      // Connection detection
      let connectionType = "unknown";
      if (navigator.connection) {
        const conn = navigator.connection;
        connectionType = conn.effectiveType || conn.type || "unknown";
      }

      // Low power mode detection (mainly for iOS)
      const isLowPowerMode =
        /iPad|iPhone|iPod/.test(userAgent) &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Determine preferred format based on device capabilities
      let preferredFormat = "full";
      if (performance === "low" || connectionType === "2g" || isLowPowerMode) {
        preferredFormat = "minimal";
      } else if (
        performance === "medium" ||
        connectionType === "3g" ||
        isMobile
      ) {
        preferredFormat = "compact";
      }

      // Screen size category
      let screenSize = "large";
      if (width <= 640) screenSize = "small";
      else if (width <= 768) screenSize = "medium";
      else if (width <= 1024) screenSize = "large";
      else screenSize = "xlarge";

      const orientation = width > height ? "landscape" : "portrait";

      setDeviceInfo({
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice: hasTouch,
        orientation,
        screenSize,
        performance,
        connectionType,
        isLowPowerMode,
        preferredFormat,
        width,
        height,
        hardwareConcurrency,
        memory,
        userAgent: userAgent.substring(0, 100),
      });
    };

    detectAdvancedDevice();

    const handleResize = () => detectAdvancedDevice();
    const handleConnectionChange = () => detectAdvancedDevice();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Listen for connection changes
    if (navigator.connection) {
      navigator.connection.addEventListener("change", handleConnectionChange);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (navigator.connection) {
        navigator.connection.removeEventListener(
          "change",
          handleConnectionChange
        );
      }
    };
  }, []);

  return deviceInfo;
};

export default useAdvancedDeviceDetection;
