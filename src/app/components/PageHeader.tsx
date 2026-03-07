import React from "react";
import "../styles/PageHeader.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode; // for buttons, filters, etc.
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  rightContent,
}) => {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {rightContent && (
        <div className="page-header-right">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
