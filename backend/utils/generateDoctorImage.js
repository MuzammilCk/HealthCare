const axios = require('axios');
const logger = require('../config/logger');

/**
 * Generate a professional doctor profile image using AI
 * Uses multiple fallback services for reliability
 * 
 * @param {string} doctorName - Full name of the doctor
 * @param {string} specialization - Doctor's specialization
 * @returns {Promise<string>} - URL of the generated image
 */
const generateDoctorImage = async (doctorName, specialization = 'doctor') => {
  try {
    // Method 1: Try UI Avatars API (free, no API key needed)
    // This creates professional initials-based avatars
    const initials = doctorName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&size=400&background=0D8ABC&color=fff&bold=true&format=png`;
    
    // Verify the URL is accessible
    const response = await axios.head(uiAvatarUrl, { timeout: 5000 });
    if (response.status === 200) {
      logger.info(`Generated avatar for ${doctorName} using UI Avatars`);
      return uiAvatarUrl;
    }
  } catch (error) {
    logger.warn(`UI Avatars failed for ${doctorName}, trying fallback...`);
  }

  try {
    // Method 2: DiceBear Avatars API (free, professional avatars)
    const diceBearUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(doctorName)}&backgroundColor=0D8ABC&fontSize=40`;
    
    const response = await axios.head(diceBearUrl, { timeout: 5000 });
    if (response.status === 200) {
      logger.info(`Generated avatar for ${doctorName} using DiceBear`);
      return diceBearUrl;
    }
  } catch (error) {
    logger.warn(`DiceBear failed for ${doctorName}, trying fallback...`);
  }

  try {
    // Method 3: Robohash (unique robot/avatar based on name)
    const robohashUrl = `https://robohash.org/${encodeURIComponent(doctorName)}?set=set5&size=400x400`;
    
    const response = await axios.head(robohashUrl, { timeout: 5000 });
    if (response.status === 200) {
      logger.info(`Generated avatar for ${doctorName} using Robohash`);
      return robohashUrl;
    }
  } catch (error) {
    logger.warn(`Robohash failed for ${doctorName}, using default fallback`);
  }

  // Final fallback: Default doctor image
  logger.warn(`All image generation methods failed for ${doctorName}, using default image`);
  return 'https://ui-avatars.com/api/?name=Doctor&size=400&background=0D8ABC&color=fff&bold=true';
};

/**
 * Generate doctor image using OpenAI DALL-E (if API key is available)
 * This is a premium option that requires API key
 * 
 * @param {string} doctorName - Full name of the doctor
 * @param {string} specialization - Doctor's specialization
 * @returns {Promise<string>} - URL of the generated image
 */
const generateDoctorImageWithDALLE = async (doctorName, specialization = 'doctor') => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY not found, falling back to free avatar service');
    return generateDoctorImage(doctorName, specialization);
  }

  try {
    const prompt = `Professional portrait photograph of ${doctorName}, a ${specialization}, wearing medical attire in a modern clinic setting. High quality, professional lighting, neutral background, photorealistic, medical professional appearance`;

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      const imageUrl = response.data.data[0].url;
      logger.success(`Generated DALL-E image for ${doctorName}`);
      return imageUrl;
    }

    throw new Error('Invalid response from DALL-E API');
  } catch (error) {
    logger.error(`DALL-E image generation failed for ${doctorName}:`, error.message);
    // Fallback to free service
    return generateDoctorImage(doctorName, specialization);
  }
};

/**
 * Generate doctor image using Stable Diffusion (if API key is available)
 * 
 * @param {string} doctorName - Full name of the doctor
 * @param {string} specialization - Doctor's specialization
 * @returns {Promise<string>} - URL of the generated image
 */
const generateDoctorImageWithStableDiffusion = async (doctorName, specialization = 'doctor') => {
  const apiKey = process.env.STABILITY_API_KEY;
  
  if (!apiKey) {
    logger.warn('STABILITY_API_KEY not found, falling back to free avatar service');
    return generateDoctorImage(doctorName, specialization);
  }

  try {
    const prompt = `professional portrait of ${doctorName}, ${specialization}, medical professional, clinic setting, high quality, photorealistic`;

    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    if (response.data && response.data.artifacts && response.data.artifacts[0]) {
      // Stable Diffusion returns base64 image, would need to upload to storage
      // For now, fallback to free service
      logger.warn('Stable Diffusion requires image storage setup, using fallback');
      return generateDoctorImage(doctorName, specialization);
    }

    throw new Error('Invalid response from Stability API');
  } catch (error) {
    logger.error(`Stable Diffusion image generation failed for ${doctorName}:`, error.message);
    return generateDoctorImage(doctorName, specialization);
  }
};

module.exports = {
  generateDoctorImage,
  generateDoctorImageWithDALLE,
  generateDoctorImageWithStableDiffusion,
};
