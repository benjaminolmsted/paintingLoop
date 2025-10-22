# Stability AI Setup Guide

This app now uses the [Stability AI API](https://platform.stability.ai/docs/api-reference#tag/Generate) to generate 512x512 images.

## Setup Instructions

### 1. Get Your API Key
1. Go to [platform.stability.ai](https://platform.stability.ai)
2. Sign up for an account
3. Navigate to [Account Keys](https://platform.stability.ai/account/keys)
4. Create a new API key

### 2. Set Environment Variable
Create a `.env` file in your project root:

```env
VITE_STABILITY_API_KEY=your-actual-api-key-here
```

### 3. Run the Application
```bash
npm run tauri dev
```

## Features

- **Real Image Generation**: Uses Stability AI's SDXL model
- **1024x1024 Resolution**: High-quality images for the quadrant layout
- **Interactive UI**: Edit prompts and generate new images
- **Loading States**: Visual feedback during generation
- **Error Handling**: Graceful fallbacks if generation fails
- **Direct API Integration**: Uses Stability AI REST API directly

## API Configuration

The app is configured with these parameters:
- **Model**: stable-diffusion-xl-1024-v1-0
- **Width**: 1024px
- **Height**: 1024px
- **Steps**: 20 (quality vs speed balance)
- **CFG Scale**: 7 (prompt adherence)
- **Style Preset**: 'photographic' (realistic images)
- **Samples**: 1 (single image per generation)
- **Endpoint**: https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image

## Cost Information

- **Free Tier**: Limited generations per month
- **Paid Plans**: Starting at $10/month for more generations
- **Per Generation**: ~$0.01-0.05 per image

## Troubleshooting

- **API Key Issues**: Ensure your key is valid and has credits
- **Network Errors**: Check your internet connection
- **Generation Failures**: Try simpler prompts or check API status
- **Rate Limits**: Wait a moment between generations

## Usage

1. Enter your prompt in the upper-right quadrant
2. Click "Generate Artwork"
3. Wait for the image to be generated (usually 10-30 seconds)
4. The AI description and critic assessment will update automatically
