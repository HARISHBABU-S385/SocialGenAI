import React, { useEffect, useState } from 'react';
import './PageTransition.css';

const PageTransition = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`page-transition ${visible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

export default PageTransition;