
"use client"
import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* FIX: Add the `toggled` class (defined in custom CSS) to the wrapper 
        when the sidebar is NOT open. This allows the main content to take 
        full width when the sidebar is hidden.
      */}
      <div 
        id="page-content-wrapper" 
        className={`flex-grow-1 ${isOpen ? '' : 'toggled'}`}
      >
        {/* <Header isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        {/* Main Content Area */}
        <div className="container-fluid p-4">
          {children}
        </div>
        <div className="mt-auto">
          <div className="p-3">
            <div className="header-blue p-3 d-flex justify-content-between align-items-center">
              <span className="text-white-50 small">© {new Date().getFullYear()} LMS</span>
              {/* <span className="text-white-50 small">Powered by Next.js</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
