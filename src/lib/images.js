// Image service for fetching curated images from Unsplash or using placeholders
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_KEY;

/**
 * Fetch images from Unsplash by keyword
 * @param {string} keyword - Search keyword
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchUnsplashImages = async (keyword, count = 10) => {
  if (!UNSPLASH_ACCESS_KEY) {
    return getPlaceholderImages(keyword, count);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${keyword}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.small,
      alt: photo.alt_description || keyword,
      author: photo.user.name,
      authorUrl: photo.user.links.html
    }));
  } catch (error) {
    console.warn('Failed to fetch from Unsplash, using placeholders:', error);
    return getPlaceholderImages(keyword, count);
  }
};

/**
 * Fetch images from Pexels by keyword
 * @param {string} keyword - Search keyword
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchPexelsImages = async (keyword, count = 10) => {
  if (!PEXELS_API_KEY) {
    return getPlaceholderImages(keyword, count);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${keyword}&per_page=${count}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.large2x || photo.src.large,
      thumb: photo.src.medium,
      alt: photo.alt || keyword,
      author: photo.photographer,
      authorUrl: photo.photographer_url
    }));
  } catch (error) {
    console.warn('Failed to fetch from Pexels, using placeholders:', error);
    return getPlaceholderImages(keyword, count);
  }
};

/**
 * Get placeholder images from a CDN
 * @param {string} keyword - Search keyword (used for categorization)
 * @param {number} count - Number of images to generate
 * @returns {Array} Array of placeholder image objects
 */
export const getPlaceholderImages = (keyword, count = 10) => {
  // Map keywords to placeholder image categories with more specific mappings
  const categoryMap = {
    'healthcare': 'medical',
    'elderly care': 'senior',
    'medicine': 'medical',
    'futuristic ui': 'technology',
    'dashboard': 'business',
    'analytics': 'business',
    'profile': 'people',
    'settings': 'business',
    'prescription': 'medical',
    'medication': 'medical',
    'reminders': 'clock',
    'ai': 'technology',
    'doctor': 'medical',
    'hospital': 'medical'
  };
  
  const category = categoryMap[keyword.toLowerCase()] || 'medical';
  
  // Generate more relevant placeholder images
  const placeholderUrls = {
    medical: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    senior: [
      'https://images.unsplash.com/photo-1594322496933-751e7725d180?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594322497055-320b4c4dd50d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594322496896-0d0bde0d8c19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    technology: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558346490-a72e53ae6b91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    business: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    people: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    clock: [
      'https://images.unsplash.com/photo-1504703341055-dee1b3ef09cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534643961798-65c0a0d587d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ]
  };

  const urls = placeholderUrls[category] || placeholderUrls.medical;
  
  return Array.from({ length: count }, (_, i) => ({
    id: `placeholder-${i}`,
    url: urls[i % urls.length],
    thumb: urls[i % urls.length].replace('w=800', 'w=200'),
    alt: `${keyword} placeholder image ${i + 1}`,
    author: 'Placeholder Image',
    authorUrl: '#'
  }));
};

/**
 * Get a single curated image by keyword
 * @param {string} keyword - Search keyword
 * @returns {Promise<Object>} Image object
 */
export const getCuratedImage = async (keyword) => {
  // Try Unsplash first, then Pexels, then placeholders
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const images = await fetchUnsplashImages(keyword, 1);
      return images[0];
    } catch (error) {
      console.warn('Unsplash failed, trying Pexels:', error);
    }
  }
  
  if (PEXELS_API_KEY) {
    try {
      const images = await fetchPexelsImages(keyword, 1);
      return images[0];
    } catch (error) {
      console.warn('Pexels failed, using placeholders:', error);
    }
  }
  
  const images = getPlaceholderImages(keyword, 1);
  return images[0];
};

/**
 * Get multiple curated images by keywords
 * @param {Array<string>} keywords - Array of search keywords
 * @returns {Promise<Object>} Object with keywords as keys and image objects as values
 */
export const getCuratedImages = async (keywords) => {
  const images = {};
  
  for (const keyword of keywords) {
    images[keyword] = await getCuratedImage(keyword);
  }
  
  return images;
};

export default {
  fetchUnsplashImages,
  fetchPexelsImages,
  getPlaceholderImages,
  getCuratedImage,
  getCuratedImages
};