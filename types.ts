
export interface ContentItem {
  id: string;
  date: string;
  facebook: boolean;
  tiktok: boolean;
  telegram: boolean;
  title: string;
  description: string;
  textReady: boolean;
  imageReady: boolean;
  videoReady: boolean;
  fbLikes: number;
  fbViews: number;
  fbComments: number;
  ttLikes: number;
  ttViews: number;
  ttComments: number;
  tgLikes: number;
  tgViews: number;
  tgComments: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  fbUploadDate: string;
  ttUploadDate: string;
  tgUploadDate: string;
}

export type Platform = 'Facebook' | 'TikTok' | 'Telegram';

export interface AIRecommendation {
  type: 'improvement' | 'missing' | 'task';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ChartDataPoint {
  name: string;
  likes: number;
  views: number;
  comments: number;
}
