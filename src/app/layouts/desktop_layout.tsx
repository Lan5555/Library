import React from "react";

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 h-screen shadow-2xl p-2 fixed top-0 left-0 bg-white">
        {/* Sidebar content */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 pl-4">
        {/* Top Bar */}
        <div className="fixed top-0 w-full h-16 shadow-2xl bg-white z-10">
          {/* Top bar content */}
        </div>

        {/* Content area below the top bar */}
        <div className="mt-16 overflow-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
