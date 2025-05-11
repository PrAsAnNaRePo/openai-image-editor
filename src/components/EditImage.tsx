import React, { useState, ChangeEvent, useRef } from 'react';
import OpenAI, { toFile } from 'openai';
import Loader from './Loader';
import GenerationLoader from './GenerationLoader';
import './GenerationLoader.css';

const EditImage: React.FC = () => {
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<'swap' | 'style'>('swap');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const srcInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Please select JPEG, PNG, or WebP images only');
        return;
      }
      
      // Validate file size
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('Image must be smaller than 25MB');
        return;
      }
      
      setter(file);
    }
  };
  
  const resetFiles = () => {
    setSrcFile(null);
    setTargetFile(null);
    setResult(null);
    setErrorMessage(null);
    
    // Reset file input elements
    if (srcInputRef.current) srcInputRef.current.value = '';
    if (targetInputRef.current) targetInputRef.current.value = '';
  };

  const handleEdit = async () => {
    if (!srcFile || !targetFile) return;
    setLoading(true);
    setResult(null);
    try {
      const client = new OpenAI({ 
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true 
      });
      
      // Check file sizes - 25MB limit according to API docs
      if (srcFile.size > 25 * 1024 * 1024 || targetFile.size > 25 * 1024 * 1024) {
        throw new Error('Image files must be less than 25MB each');
      }
      
      // Check file types
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(srcFile.type) || !validTypes.includes(targetFile.type)) {
        throw new Error('Image files must be JPEG, PNG, or WebP format');
      }
      
      // Check if both files are the same format
      if (srcFile.type !== targetFile.type) {
        console.warn('For best results, both files should be the same format');
      }

      const src = await toFile(srcFile, srcFile.name, { type: srcFile.type });
      const trg = await toFile(targetFile, targetFile.name, { type: targetFile.type });
      
      const prompt =
        operation === 'swap'
          ? 'Swap the faces in the two images.'
          : 'Apply the style and theme of the second image onto the person in the first image.';
      
      try {
        const response = await client.images.edit({
          model: 'gpt-image-1',
          image: [src, trg],
          prompt
        });
        
        const data = response.data;
        if (!data || data.length === 0 || !data[0].b64_json) {
          throw new Error('No image returned');
        }
        const b64 = data[0].b64_json;
        setResult(`data:image/png;base64,${b64}`);
      } catch (apiError) {
        console.error('GPT-Image-1 Edit API Error:', apiError);
        
        // Fall back to generation if edit fails
        console.log('Edit operation failed:', apiError);
        setErrorMessage('Edit operation failed. Attempting alternative generation...');
        
        // Try using generation instead
        const fallbackPrompt = operation === 'swap' 
          ? `Create an image that swaps the faces between these two input images.` 
          : `Create an image of the person from the first image in the style of the second image.`;
          
        const genResponse = await client.images.generate({
          model: 'gpt-image-1',
          prompt: fallbackPrompt,
          size: '1024x1024'
        });
        
        const genData = genResponse.data;
        if (!genData || genData.length === 0 || !genData[0].b64_json) {
          throw new Error('No image returned from fallback generation');
        }
        const genB64 = genData[0].b64_json;
        setResult(`data:image/png;base64,${genB64}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error processing image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
          <button className="reset-button" onClick={resetFiles}>
            Reset
          </button>
        </div>
      )}
      
      <div className="file-inputs">
        <label className="file-input">
          <span
            className="file-input-text"
            title={srcFile ? srcFile.name : 'Drag Source Image Here or Click to Browse'}
          >
            {srcFile ? srcFile.name : 'Drag Source Image Here or Click to Browse'}
          </span>
          <input
            ref={srcInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, setSrcFile)}
          />
        </label>
        <label className="file-input">
          <span
            className="file-input-text"
            title={targetFile ? targetFile.name : 'Drag Target Image Here or Click to Browse'}
          >
            {targetFile ? targetFile.name : 'Drag Target Image Here or Click to Browse'}
          </span>
          <input
            ref={targetInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, setTargetFile)}
          />
        </label>
      </div>
      <div className="operation">
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as 'swap' | 'style')}
        >
          <option value="swap">Face Swap</option>
          <option value="style">Style Transfer</option>
        </select>
      </div>
      <div className="button-group">
        <button className="button" onClick={handleEdit} disabled={loading || !srcFile || !targetFile}>
          {loading ? <Loader size="small" /> : 'Process Images'}
        </button>
        <GenerationLoader isLoading={loading} operation="edit" />
        {(srcFile || targetFile) && (
          <button className="reset-button secondary" onClick={resetFiles} disabled={loading}>
            Reset Files
          </button>
        )}
      </div>
      
      {result && (
        <div className="result">
          <img
            src={result}
            alt="Result"
            onLoad={(e) => e.currentTarget.classList.add('loaded')}
          />
          <a href={result} download="edited.png" className="link">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};

export default EditImage;
