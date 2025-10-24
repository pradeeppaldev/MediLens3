// API utility functions for the MediLens application

/**
 * Unsplash API integration
 */
export const unsplash = {
  // Search for medical-related images
  searchMedicalImages: async (query = 'medical', page = 1, perPage = 10) => {
    try {
      // In a real implementation, you would use the Unsplash API
      // For now, we'll return placeholder data
      return {
        results: [
          {
            id: '1',
            urls: {
              small: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
              regular: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
            },
            alt_description: 'Medical equipment',
            user: {
              name: 'Unsplash User'
            }
          },
          {
            id: '2',
            urls: {
              small: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
              regular: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
            },
            alt_description: 'Doctor with stethoscope',
            user: {
              name: 'Unsplash User'
            }
          }
        ],
        total: 2,
        total_pages: 1
      };
    } catch (error) {
      console.error('Error fetching medical images:', error);
      return { results: [], total: 0, total_pages: 0 };
    }
  }
};

import { GoogleGenAI } from '@google/genai';

/**
 * Gemini API integration
 */
export const gemini = {
  // Analyze medical image description
  analyzeImage: async (imageData) => {
    try {
      // In a real implementation, you would call the Gemini API
      // For now, we'll return placeholder data
      return {
        analysis: 'This appears to be a medical image showing normal anatomical structures. No abnormalities detected.',
        confidence: 0.95,
        suggestions: [
          'Consider consulting with a specialist for detailed analysis',
          'Follow up with patient for any symptoms'
        ]
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  },

  // Chat with AI assistant
  chat: async (messages) => {
    console.log('chat function called with messages:', messages);

    try {
      // Use the provided API key pattern from the sample
      const ai = new GoogleGenAI({ apiKey: 'AIzaSyBJ-qgBq_qLXSkCWzcfL56JZp8YAmDGJ7s' });

      const conversation = messages.map(msg => `${msg.type === 'ai' ? 'Assistant' : 'User'}: ${msg.content}`).join('\n');
      console.log('Conversation:', conversation);
      const prompt = `You are a helpful AI health assistant. Provide accurate, empathetic, and general health information. Always recommend consulting a healthcare professional for medical advice. Do not diagnose or prescribe treatments.\n\n${conversation}\nAssistant:`;
      console.log('Prompt to API:', prompt);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      console.log('API response text:', response.text);
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
};

/**
 * Tesseract OCR integration
 */
export const ocr = {
  // Extract text from medical documents
  extractText: async (imageFile) => {
    try {
      // In a real implementation, you would use Tesseract.js
      // For now, we'll return placeholder data
      return {
        text: 'Patient Name: John Doe\nDOB: 01/15/1980\nDiagnosis: Normal\nNotes: Patient shows no signs of abnormalities.',
        confidence: 0.92
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      return null;
    }
  }
};

export default {
  unsplash,
  gemini,
  ocr
};
