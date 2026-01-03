
import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateIdeas(theme: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5-10 content ideas based on the theme: "${theme}". 
      IMPORTANT: The response MUST be in Myanmar language (Burmese script). 
      Return only a JSON array of objects with "title" and "description".`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description'],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  },

  async generateDraft(title: string, description: string) {
    const prompt = `Write a complete, engaging social media post draft for:
    Title: "${title}"
    Context: "${description}"
    
    The draft should include:
    1. A powerful hook/intro
    2. The main body with value/info
    3. A clear call to action (CTA)
    4. Relevant emojis
    
    IMPORTANT: The response MUST be in Myanmar language (Burmese script).
    Return a JSON object with a single key "draft" containing the full text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            draft: { type: Type.STRING },
          },
          required: ['draft'],
        },
      },
    });
    return JSON.parse(response.text || '{ "draft": "" }');
  },

  async getEngagementBooster(item: ContentItem, draftText?: string) {
    const prompt = `Analyze this content for pre-upload engagement optimization:
    Title: ${item.title}
    Draft Text: ${draftText || 'No draft yet'}
    Existing Performance: Views: ${item.totalViews}, Likes: ${item.totalLikes}, Comments: ${item.totalComments}
    Scheduled Platforms: ${[item.facebook && 'FB', item.tiktok && 'TT', item.telegram && 'TG'].filter(Boolean).join(', ')}

    Provide 3 specific strategies in Myanmar language to improve performance BEFORE UPLOAD:
    1. VIEWS: How to optimize the hook/thumbnail/headline for better reach.
    2. LIKES: How to increase emotional resonance or value.
    3. COMMENTS: A specific question or call-to-action to spark discussion.

    Return a JSON object with "viewsTips", "likesTips", and "commentsTips".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viewsTips: { type: Type.STRING },
            likesTips: { type: Type.STRING },
            commentsTips: { type: Type.STRING },
          },
          required: ['viewsTips', 'likesTips', 'commentsTips'],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  },

  async generateVisualIdeas(title: string, description: string) {
    const prompt = `Based on the content title: "${title}" and description: "${description}", 
    suggest creative visual ideas to produce assets for this post.
    1. Suggest 2 specific IMAGE IDEAS (composition, style, what to show).
    2. Suggest 1 short VIDEO IDEA (TikTok/Reels style script or visual hook).
    
    IMPORTANT: The response MUST be in Myanmar language (Burmese script).
    Return a JSON object with "imageIdeas" (array of strings) and "videoIdea" (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imageIdeas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            videoIdea: { type: Type.STRING },
          },
          required: ['imageIdeas', 'videoIdea'],
        },
      },
    });
    return JSON.parse(response.text || '{ "imageIdeas": [], "videoIdea": "" }');
  },

  async generateFutureStrategy(existingTitles: string[], timeframe: 'week' | 'month') {
    const prompt = `You are a strategic content planner. Based on the following existing content titles: [${existingTitles.join(', ')}], 
    suggest a strategic content plan for the ${timeframe === 'week' ? 'NEXT WEEK (7 days)' : 'NEXT MONTH (30 days)'}. 
    Your goal is to suggest fresh, non-repetitive topics that complement the existing ones.
    Provide 5 specific content ideas. 
    IMPORTANT: The response MUST be in Myanmar language (Burmese script). 
    Return only a JSON array of objects with "title", "description", and "reasoning" (why this is good for the strategy).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ['title', 'description', 'reasoning'],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  },

  async getGlobalEngagementAnalysis(items: ContentItem[]) {
    const dataSummary = items.map(i => ({
      title: i.title,
      views: i.totalViews,
      likes: i.totalLikes,
      comments: i.totalComments
    }));

    const prompt = `Analyze this engagement data: ${JSON.stringify(dataSummary)}.
    Identify underperforming content (low engagement rate) and provide 5 specific, actionable recommendations in Myanmar language to boost likes, views, and comments.
    Focus on hooks, thumbnails, and calls to action.
    Return a JSON array of objects with "target" (title or 'General'), "suggestion", and "priority" ('High' or 'Medium').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              target: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ['target', 'suggestion', 'priority'],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  },

  async optimizeEngagement(content: string) {
    const prompt = `Analyze this content draft for social media: "${content}".
    Provide specific tips in Myanmar language on how to improve this draft BEFORE PUBLISHING to maximize:
    1. Views (e.g., keyword optimization, hook)
    2. Likes (e.g., emotional connection, value)
    3. Comments (e.g., call to action, asking questions)
    Return a JSON object with keys "forViews", "forLikes", and "forComments", each being a string.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forViews: { type: Type.STRING },
            forLikes: { type: Type.STRING },
            forComments: { type: Type.STRING },
          },
          required: ['forViews', 'forLikes', 'forComments'],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  },

  async getPreUploadTips(item: ContentItem) {
    const prompt = `Analyze this specific upcoming content item:
    Title: ${item.title}
    Description: ${item.description}
    Upcoming Platforms: ${[item.facebook && 'Facebook', item.tiktok && 'TikTok', item.telegram && 'Telegram'].filter(Boolean).join(', ')}
    Upload Dates: FB:${item.fbUploadDate}, TT:${item.ttUploadDate}, TG:${item.tgUploadDate}
    
    Provide strategic engagement improvement tips in Myanmar language to be implemented BEFORE the upload date.
    Suggest 1 specific tip for increasing VIEWS, 1 for LIKES, and 1 for COMMENTS.
    Return a JSON object with keys "viewsTip", "likesTip", "commentsTip".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viewsTip: { type: Type.STRING },
            likesTip: { type: Type.STRING },
            commentsTip: { type: Type.STRING },
          },
          required: ['viewsTip', 'likesTip', 'commentsTip'],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  },

  async refineContent(content: string, type: 'hook' | 'rewrite' | 'hashtags') {
    const prompt = type === 'hook' 
      ? `Write 3 catchy hooks in Myanmar language for this content: "${content}"`
      : type === 'hashtags'
      ? `Suggest relevant trending hashtags (can be English/Myanmar) for this content: "${content}"`
      : `Rewrite this content in Myanmar language to be more engaging and polished, including emojis: "${content}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  },

  async getRecommendations(item: ContentItem) {
    const prompt = `Analyze this content status:
    Title: ${item.title}
    Description: ${item.description}
    Text Ready: ${item.textReady ? 'Yes' : 'No'}
    Image Ready: ${item.imageReady ? 'Yes' : 'No'}
    Video Ready: ${item.videoReady ? 'Yes' : 'No'}
    Platforms: ${[item.facebook && 'FB', item.tiktok && 'TT', item.telegram && 'TG'].filter(Boolean).join(', ')}
    Engagement: Likes:${item.totalLikes}, Views:${item.totalViews}

    Provide 3 specific task recommendations or improvements for this item in Myanmar language. 
    Return a JSON array of objects with "message", "type" (one of: 'improvement', 'missing', 'task'), and "priority" (one of: 'high', 'medium', 'low').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              type: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ['message', 'type', 'priority'],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  }
};
