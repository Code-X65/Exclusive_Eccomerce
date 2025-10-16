import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
      <h2 style={{ margin: '1rem 0' }}>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link
        to="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: '#007bff',
          color: '#fff',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
