import React, { useState } from 'react';
import OpenAI from 'openai';
import Loader from './Loader';
import GenerationLoader from './GenerationLoader';
import './GenerationLoader.css';

const CreateImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setErrorMessage(null);
    try {
      const client = new OpenAI({ 
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true 
      });
      
      // Try with gpt-image-1 model
      try {
        const response = await client.images.generate({
          model: 'gpt-image-1',
          prompt,
          size: '1024x1024'
        });
        
        // Ensure we have valid data
        const data = response.data;
        if (!data || data.length === 0 || !data[0].b64_json) {
          throw new Error('No image returned');
        }
        const b64 = data[0].b64_json;
        setResult(`data:image/png;base64,${b64}`);
      } catch (apiError) {
        console.error('GPT-Image-1 API Error:', apiError);
        
        // Try again with a simplified prompt
        console.log('Trying again with simplified prompt...');
        const simplifiedPrompt = prompt.split('.')[0]; // Get first sentence only
        const fallbackResponse = await client.images.generate({
          model: 'gpt-image-1',
          prompt: simplifiedPrompt,
          size: '1024x1024'
        });
        
        const fallbackData = fallbackResponse.data;
        if (!fallbackData || fallbackData.length === 0 || !fallbackData[0].b64_json) {
          throw new Error('No image returned from fallback generation');
        }
        const fallbackB64 = fallbackData[0].b64_json;
        setResult(`data:image/png;base64,${fallbackB64}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error generating image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
          <button className="reset-button" onClick={() => setErrorMessage(null)}>
            Dismiss
          </button>
        </div>
      )}
      
      <textarea
        className="input-area"
        placeholder="Describe what you'd like to create..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="button" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        {loading ? <Loader size="small" /> : 'Create Image'}
      </button>
      <GenerationLoader isLoading={loading} operation="create" />
      {result && (
        <div className="result">
          <img
            src={result}
            alt="Generated"
            onLoad={(e) => e.currentTarget.classList.add('loaded')}
          />
          <a href={result} download="generated.png" className="link">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};

export default CreateImage;
