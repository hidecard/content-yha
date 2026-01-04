import { ContentItem } from "../types";

// Declare the global puter object from Puter.js
declare global {
  interface Window {
    puter: any;
  }
}

const puter = window.puter;

// Custom error class for AI service errors
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Default model for Puter.js - using gemini-3-flash for fast, free access
const DEFAULT_MODEL = 'gemini-3-flash-preview';

// Helper function to parse JSON from response text
const parseJSON = (text: string, fallback: any) => {
  try {
    return JSON.parse(text || '[]');
  } catch {
    return fallback;
  }
};

// Helper to clean JSON string (remove markdown code blocks if present)
const cleanJSONString = (text: string): string => {
  return text
    .replace(/```json\n/g, '')
    .replace(/```\n/g, '')
    .replace(/```/g, '')
    .trim();
};

// Helper to make AI calls with error handling
async function callAI(prompt: string, operationName: string): Promise<string> {
  try {
    if (!window.puter?.ai?.chat) {
      throw new AIServiceError(
        'AI service မရနိုင်သေးပါ။ ကျေးဇူးပြု၍ စောင့်ပါ။',
        'SERVICE_UNAVAILABLE',
        true
      );
    }

    const response = await window.puter.ai.chat(prompt, {
      model: DEFAULT_MODEL,
    });

    const text = typeof response === 'string' ? response : response?.text || '';
    return text;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for 401 Unauthorized
    if (errorMessage.includes('401')) {
      throw new AIServiceError(
        'AI service ချိတ်ဆက်မှု ပျက်ပြယ်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ပြီး ပြန်လည်ကြိုးစားပါ။',
        'UNAUTHORIZED',
        true
      );
    }

    // Check for API key leaked error
    if (errorMessage.includes('API key was reported as leaked')) {
      throw new AIServiceError(
        'AI service တွင် ပြဿနာရှိနေပါသည်။ API key အတွက် အခက်အခဲရှိနေပါသည်။ နောက်မှ ပြန်လည်ကြိုးစားပါ။',
        'API_KEY_LEAKED',
        false
      );
    }

    // Check for permission denied
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Permission denied')) {
      throw new AIServiceError(
        'AI service သို့ ဝင်မရပါ။ ခွင့်ပြုချက်မရှိပါ။',
        'PERMISSION_DENIED',
        false
      );
    }

    // Check for whoami errors (authentication check)
    if (errorMessage.includes('whoami')) {
      throw new AIServiceError(
        'AI service ချိတ်ဆက်မှု ပြဿနာရှိနေပါသည်။ ကျေးဇူးပြု၍ စောင့်ပြီး ပြန်လည်ကြိုးစားပါ။',
        'AUTH_CHECK_FAILED',
        true
      );
    }

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      throw new AIServiceError(
        'အင်တာနက် ချိတ်ဆက်မှု ပြဿနာရှိနေပါသည်။ ကျေးဇူးပြု၍ ချိတ်ဆက်မှုစစ်ပြီး ပြန်လည်ကြိုးစားပါ။',
        'NETWORK_ERROR',
        true
      );
    }

    // Generic error
    throw new AIServiceError(
      `${operationName} ဆောင်ရွက်ရာတွင် အမှားဖြစ်ပွားခဲ့ပါသည်။ ပြန်လည်ကြိုးစားပါ။`,
      'UNKNOWN_ERROR',
      true
    );
  }
}

export const geminiService = {
  async generateIdeas(theme: string) {
    if (!theme.trim()) {
      throw new AIServiceError(
        'ခေါင်းစဉ်ထည့်ပါ။',
        'INVALID_INPUT',
        false
      );
    }

    const prompt = `Generate 5-10 content ideas based on the theme: "${theme}". 
    IMPORTANT: The response MUST be in Myanmar language (Burmese script). 
    Return only a JSON array of objects with "title" and "description".`;

    const text = await callAI(prompt, 'အိုင်ဒီယာ ထုတ်ခြင်း');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, []);
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

    const text = await callAI(prompt, 'မူကြမ်း ထုတ်ခြင်း');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, { draft: '' });
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

    const text = await callAI(prompt, 'Engagement အကြံပြုချက်');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, {});
  },

  async generateVisualIdeas(title: string, description: string) {
    const prompt = `Based on the content title: "${title}" and description: "${description}", 
    suggest creative visual ideas to produce assets for this post.
    1. Suggest 2 specific IMAGE IDEAS (composition, style, what to show).
    2. Suggest 1 short VIDEO IDEA (TikTok/Reels style script or visual hook).
    
    IMPORTANT: The response MUST be in Myanmar language (Burmese script).
    Return a JSON object with "imageIdeas" (array of strings) and "videoIdea" (string).`;

    const text = await callAI(prompt, 'Visual အိုင်ဒီယာ ထုတ်ခြင်း');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, { imageIdeas: [], videoIdea: '' });
  },

  async generateFutureStrategy(existingTitles: string[], timeframe: 'week' | 'month') {
    const prompt = `You are a strategic content planner. Based on the following existing content titles: [${existingTitles.join(', ')}], 
    suggest a strategic content plan for the ${timeframe === 'week' ? 'NEXT WEEK (7 days)' : 'NEXT MONTH (30 days)'}. 
    Your goal is to suggest fresh, non-repetitive topics that complement the existing ones.
    Provide 5 specific content ideas. 
    IMPORTANT: The response MUST be in Myanmar language (Burmese script). 
    Return only a JSON array of objects with "title", "description", and "reasoning" (why this is good for the strategy).`;

    const text = await callAI(prompt, 'ရှေ့လုပ်ငန်းစဉ် စီစဉ်ခြင်း');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, []);
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

    const text = await callAI(prompt, 'စာရင်းဇယား အကြံပြုချက်');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, []);
  },

  async optimizeEngagement(content: string) {
    const prompt = `Analyze this content draft for social media: "${content}".
    Provide specific tips in Myanmar language on how to improve this draft BEFORE PUBLISHING to maximize:
    1. Views (e.g., keyword optimization, hook)
    2. Likes (e.g., emotional connection, value)
    3. Comments (e.g., call to action, asking questions)
    Return a JSON object with keys "forViews", "forLikes", and "forComments", each being a string.`;

    const text = await callAI(prompt, 'Engagement မြှင့်တင်ခြင်း');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, {});
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

    const text = await callAI(prompt, 'တင်မည်မတင်မီ အကြံပြုချက်');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, {});
  },

  async refineContent(content: string, type: 'hook' | 'rewrite' | 'hashtags') {
    const prompt = type === 'hook' 
      ? `Write 3 catchy hooks in Myanmar language for this content: "${content}"`
      : type === 'hashtags'
      ? `Suggest relevant trending hashtags (can be English/Myanmar) for this content: "${content}"`
      : `Rewrite this content in Myanmar language to be more engaging and polished, including emojis: "${content}"`;

    const text = await callAI(prompt, 'ပြင်ဆင်ခြင်း');
    return text.trim();
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

    const text = await callAI(prompt, 'အကြံပြုချက်များ');
    const cleanedText = cleanJSONString(text);
    return parseJSON(cleanedText, []);
  }
};
