import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'small', 
  text, 
  fullScreen = false 
}) => (
  <div className={`loader-container ${fullScreen ? 'fullscreen' : ''}`}>
    <div className={`loader ${size}`}></div>
    {text && <p className="loader-text">{text}</p>}
  </div>
);

export default Loader;
