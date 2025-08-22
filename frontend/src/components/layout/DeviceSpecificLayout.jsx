import React from "react";

const DeviceSpecificLayout = ({
  deviceInfo,
  children,
  mobileContent,
  tabletContent,
  desktopContent,
}) => {
  // Render content based on actual device type
  if (deviceInfo.isMobile) {
    return <div className="mobile-layout">{mobileContent || children}</div>;
  }

  if (deviceInfo.isTablet) {
    return (
      <div className="tablet-layout">
        {tabletContent || desktopContent || children}
      </div>
    );
  }

  if (deviceInfo.isDesktop) {
    return <div className="desktop-layout">{desktopContent || children}</div>;
  }

  // Fallback
  return <div className="fallback-layout">{children}</div>;
};

export default DeviceSpecificLayout;
