import React, { useState } from 'react';
import './ImageGen.css'; // Assuming you have a CSS file for styling

const ImageGen = () => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageSrc, setGeneratedImageSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Handle Image Generation (Updated for Gemini base64 response)
  const handleImageGenerate = async (e) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setLoading(true);
    setSaveStatus('');
    setGeneratedImageSrc('');

    try {
      const response = await fetch('http://localhost:5000/api/imagegenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      const data = await response.json();
      if (data.image) {
        // Directly set the returned base64 string as the image source in your state
        setGeneratedImageSrc(data.image); 
      } else {
        alert(data.message || 'Generation failed');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert('An error occurred while generating the image.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Saving the Image to your History/Database
  const handleSaveImage = async () => {
    if (!generatedImageSrc) return;

    try {
      const response = await fetch('http://localhost:5000/api/imagegenerate/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          imageUrl: generatedImageSrc, // Sends the base64 string to the database
          prompt: imagePrompt
        })
      });

      const data = await response.json();
      if (data.success) {
        setSaveStatus('Image saved successfully!');
      } else {
        setSaveStatus('Failed to save image.');
      }
    } catch (error) {
      console.error("Error saving image:", error);
      setSaveStatus('Error saving image.');
    }
  };

  return (
    <div className="image-gen-container">
      <h2>AI Image Generator</h2>
      
      <form onSubmit={handleImageGenerate} className="prompt-form">
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe the image you want to generate in detail (e.g., 'A futuristic city at sunset, cinematic lighting, 8k resolution')..."
          rows="4"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating Art...' : 'Generate Image'}
        </button>
      </form>

      {/* Display Area */}
      <div className="result-container">
        {loading && (
          <div className="loading-spinner">
            <p>Creating your masterpiece with Gemini...</p>
          </div>
        )}

        {generatedImageSrc && !loading && (
          <div className="image-preview-box">
            <h3>Your Generated Image</h3>
            <img src={generatedImageSrc} alt="Generated AI Output" className="generated-image" />
            
            <div className="action-buttons">
              <button onClick={handleSaveImage} className="save-btn">
                Save to Dashboard
              </button>
            </div>
            
            {saveStatus && <p className="status-message">{saveStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGen;