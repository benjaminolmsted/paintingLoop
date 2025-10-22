import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("A SKULL FULL OF COLORFUL BRAINROT");
  const [generatedImage, setGeneratedImage] = useState("https://via.placeholder.com/512x512/2c3e50/ffffff?text=Click+Generate+to+create+artwork");
  const [debugInfo, setDebugInfo] = useState("Ready to generate");
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [criticAssessment, setCriticAssessment] = useState("");
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [sessionData, setSessionData] = useState<{
    timestamp: string;
    totalGenerations: number;
    loops: Array<{
      generation: number;
      prompt: string;
      imageFilename: string;
      artistStatement: string;
      criticOpinion: string;
      newPrompt: string;
    }>;
  }>({
    timestamp: "",
    totalGenerations: 0,
    loops: []
  });
  const [selectedStyle, setSelectedStyle] = useState("none");

  // Function to generate image and return all data (updates UI immediately when image is ready)
  const generateImageData = async (prompt: string) => {
    console.log('generateImageData called with prompt:', prompt);
    
    try {
      const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
      if (!apiKey || apiKey === 'your-stability-api-key-here') {
        throw new Error('Stability AI API key not configured. Please set VITE_STABILITY_API_KEY in your .env file');
      }
      
      const formData = new FormData();
      formData.append('model', 'sd3.5-medium');
      formData.append('prompt', prompt);
      formData.append('output_format', 'jpeg');
      formData.append('cfg_scale', '7');
      formData.append('height', '1024');
      formData.append('width', '1024');
      formData.append('samples', '1');
      formData.append('steps', '20');
      if (selectedStyle !== "none") {
        formData.append('style_preset', selectedStyle);
      }

      const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      // Convert the binary response to base64
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64Image = btoa(binaryString);
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
      
      // Save the image
      const base64Data = base64Image;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `painting-${timestamp}.png`;
      
      await invoke('save_image', { data: base64Data, filename: filename });
      
      // Show the image immediately!
      setGeneratedImage(imageUrl);
      setDebugInfo('Image generated and displayed!');
      
      // Generate analysis sequentially
      console.log('Step 1: Generating artist statement...');
      const artistStatement = await invoke('artist_statement', { imageUrl: imageUrl }) as string;
      
      console.log('Step 2: Generating critic opinion...');
      const criticOpinion = await invoke('critique_image', { imageUrl: imageUrl }) as string;
      
      console.log('Step 3: Generating new prompt...');
      const newPrompt = await invoke('new_prompt_creation_voice', { 
        artistStatement: artistStatement,
        criticOpinion: criticOpinion
      }) as string;
      
      // Return all the data
      return {
        prompt,
        imageUrl,
        filename,
        artistStatement,
        criticOpinion,
        newPrompt
      };
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw error;
    }
  };

  // Function to save complete session data
  const saveSessionData = async () => {
    setIsSavingSession(true);
    try {
      const result = await invoke('save_session_data', {
        sessionData: JSON.stringify(sessionData)
      });
      setDebugInfo(`Complete session saved: ${result}`);
    } catch (error) {
      console.error('Error saving session:', error);
      setDebugInfo(`Session save failed: ${error}`);
    } finally {
      setIsSavingSession(false);
    }
  };

  // Handle generate button click
  const handleGenerate = async () => {
    console.log('Generate button clicked with prompt:', currentPrompt);
    setDebugInfo('Button clicked, starting...');
    
    // Get the generation count from the input
    const generationInput = document.querySelector('.generation-input') as HTMLInputElement;
    const generationCount = parseInt(generationInput?.value || '1');
    
    // Initialize session data
    const sessionStart = new Date().toISOString();
    setSessionData({
      timestamp: sessionStart,
      totalGenerations: generationCount,
      loops: []
    });
    
    // Set up generation tracking
    setTotalGenerations(generationCount);
    setCurrentGeneration(0);
    
    console.log(`Running ${generationCount} generation(s)`);
    setDebugInfo(`Running ${generationCount} generation(s)...`);
    
    // Start with the current prompt
    let workingPrompt = currentPrompt;
    
    // Run the loop n times
    for (let i = 0; i < generationCount; i++) {
      setCurrentGeneration(i + 1);
      console.log(`Generation ${i + 1} of ${generationCount} with prompt:`, workingPrompt);
      setDebugInfo(`Generation ${i + 1} of ${generationCount} with prompt: ${workingPrompt.substring(0, 50)}...`);
      
      try {
        // Set generating state for this generation
        setIsGenerating(true);
        
        // Generate image with current working prompt and get all data
        const result = await generateImageData(workingPrompt);
        
        // Clear generating state so image can be displayed
        setIsGenerating(false);
        
        // Image is already displayed by generateImageData, now show analysis sequentially
        setDebugInfo(`Generation ${i + 1}: Image generated`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds
        
        // Show artist statement first
        setAiDescription(result.artistStatement);
        setDebugInfo(`Generation ${i + 1}: Artist statement complete`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        // Show critic opinion
        setCriticAssessment(result.criticOpinion);
        setDebugInfo(`Generation ${i + 1}: Critic opinion complete`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        // Show new prompt
        setCurrentPrompt(result.newPrompt);
        setDebugInfo(`Generation ${i + 1}: New prompt complete`);
        
        // Collect data for this generation
        const loopData = {
          generation: i + 1,
          prompt: result.prompt,
          imageFilename: result.filename,
          artistStatement: result.artistStatement,
          criticOpinion: result.criticOpinion,
          newPrompt: result.newPrompt
        };
        
        console.log(`Collected data for generation ${i + 1}:`, loopData);
        
        // Add to session data
        setSessionData(prev => ({
          ...prev,
          loops: [...prev.loops, loopData]
        }));
        
        // Use the new prompt for the next iteration
        workingPrompt = result.newPrompt;
        
        console.log(`Generation ${i + 1} completed. New prompt for next iteration:`, workingPrompt);
        setDebugInfo(`Generation ${i + 1} completed. Next prompt: ${workingPrompt.substring(0, 50)}...`);
        
        // Wait a bit between generations (except for the last one)
        if (i < generationCount - 1) {
          setDebugInfo(`Waiting before next generation...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`Error in generation ${i + 1}:`, error);
        setDebugInfo(`Error in generation ${i + 1}: ${error}`);
        setIsGenerating(false); // Clear generating state on error
        // Continue with next generation even if this one failed
      }
    }
    
    setDebugInfo(`Completed ${generationCount} generation(s)`);
    setCurrentGeneration(0);
  };

  return (
    <div className="museum-container">
      <div className="quadrant-grid">
        {/* Upper Left - Prompt */}
        <div className="quadrant prompt-quadrant">
          <div className="quadrant-header">Generation Prompt</div>
          <div className="text-content">
            <textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              className="prompt-input"
              placeholder="Enter your prompt here..."
              disabled={isGenerating}
            />
            <div className="button-row">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="generate-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Artwork'}
              </button>
              <input
                type="number"
                min="1"
                max="10"
                defaultValue="1"
                className="generation-input"
                placeholder="1"
                disabled={isGenerating}
              />
            </div>
            <div className="style-dropdown-container">
              <label htmlFor="style-select">Style:</label>
              <select
                id="style-select"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                disabled={isGenerating}
                className="style-dropdown"
              >
                <option value="none">none</option>
                <option value="3d-model">3d-model</option>
                <option value="analog-film">analog-film</option>
                <option value="anime">anime</option>
                <option value="cinematic">cinematic</option>
                <option value="comic-book">comic-book</option>
                <option value="digital-art">digital-art</option>
                <option value="enhance">enhance</option>
                <option value="fantasy-art">fantasy-art</option>
                <option value="isometric">isometric</option>
                <option value="line-art">line-art</option>
                <option value="low-poly">low-poly</option>
                <option value="modeling-compound">modeling-compound</option>
                <option value="neon-punk">neon-punk</option>
                <option value="origami">origami</option>
                <option value="photographic">photographic</option>
                <option value="pixel-art">pixel-art</option>
                <option value="tile-texture">tile-texture</option>
              </select>
            </div>
            <button 
              onClick={saveSessionData}
              disabled={isSavingSession || sessionData.loops.length === 0}
              className="save-session-button"
            >
              {isSavingSession ? 'Saving...' : 'Save Complete Session'}
            </button>
            <div style={{fontSize: '17.5px', color: '#999', marginTop: '8px'}}>
              {totalGenerations > 0 && `Generation ${currentGeneration} of ${totalGenerations} | `}Debug: {debugInfo}
            </div>
          </div>
        </div>

        {/* Upper Right - Generated Image */}
        <div className="quadrant image-quadrant">
          <div className="quadrant-header">Generated Image</div>
          <div className="image-container">
            {isGenerating ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Generating artwork...</p>
              </div>
            ) : (
              <img 
                src={generatedImage} 
                alt="Generated artwork" 
                className="artwork-image"
              />
            )}
          </div>
        </div>

        {/* Lower Left - Artist Statement */}
        <div className="quadrant description-quadrant">
          <div className="quadrant-header">Artist Statement</div>
          <div className="text-content">
            <p>{aiDescription}</p>
          </div>
        </div>

        {/* Lower Right - Critic's Opinion */}
        <div className="quadrant critic-quadrant">
          <div className="quadrant-header">Critic's Opinion</div>
          <div className="text-content">
            <p>{criticAssessment}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;