import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ items = [], showHome = true }) => {
  const location = useLocation();
  
  // Generate breadcrumbs from location if no items provided
  const generateBreadcrumbs = () => {
    if (items.length > 0) return items;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [];
    
    if (showHome) {
      breadcrumbs.push({
        name: 'Home',
        href: '/',
        current: pathnames.length === 0
      });
    }
    
    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      const isLast = index === pathnames.length - 1;
      
      // Convert pathname to readable name
      let displayName = name.charAt(0).toUpperCase() + name.slice(1);
      displayName = displayName.replace(/-/g, ' ');
      
      breadcrumbs.push({
        name: displayName,
        href: currentPath,
        current: isLast
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}
              
              {item.current ? (
                <span className="text-sm font-medium text-gray-500" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
