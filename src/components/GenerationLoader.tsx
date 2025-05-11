import React, { useEffect, useState } from 'react';
import Loader from './Loader';

interface GenerationLoaderProps {
  isLoading: boolean;
  operation: 'create' | 'edit';
}

const GenerationLoader: React.FC<GenerationLoaderProps> = ({ isLoading, operation }) => {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [dots, setDots] = useState('');

  // Creative loading messages
  const createMessages = [
    'Crafting your image',
    'Bringing your idea to life',
    'Generating visual magic',
    'Painting with pixels',
    'Creating something beautiful'
  ];
  
  const editMessages = [
    'Transforming your image',
    'Applying artistic changes',
    'Blending visual elements',
    'Enhancing your creation',
    'Perfecting the details'
  ];

  // Select messages based on operation
  const messages = operation === 'create' ? createMessages : editMessages;

  // Rotate through messages
  useEffect(() => {
    if (!isLoading) return;
    
    // Initial message
    setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // Change message every 5 seconds
    const messageInterval = setInterval(() => {
      setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 5000);
    
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, [isLoading, operation, messages]);

  if (!isLoading) return null;

  return (
    <div className="generation-overlay">
      <Loader size="large" text={`${loadingMessage}${dots}`} />
    </div>
  );
};

export default GenerationLoader;
