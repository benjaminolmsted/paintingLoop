import { describeImage, critiqueImage } from '../src/lib/imageAnalysis';

async function testImageAnalysis() {
  const sampleImageUrl = "https://images.unsplash.com/photo-1541961017774-22349e4a1262";
  
  console.log("=== Testing Image Analysis ===");
  console.log("Sample Image URL:", sampleImageUrl);
  console.log("\n");
  
  try {
    console.log("=== DESCRIPTION ===");
    const description = await describeImage(sampleImageUrl);
    console.log(description);
    console.log("\n");
    
    console.log("=== CRITIQUE ===");
    const critique = await critiqueImage(sampleImageUrl);
    console.log(critique);
    
  } catch (error) {
    console.error("Error during image analysis:", error);
  }
}

testImageAnalysis();
