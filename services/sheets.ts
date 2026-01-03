
import { ContentItem } from '../types';

export const fetchSheetData = async (sheetUrl: string): Promise<ContentItem[]> => {
  try {
    // Transform edit URL to export URL
    const csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    // Simplistic CSV parser (not for production with complex quoted fields, but works for most sheets)
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, idx) => {
      const values = line.split(',');
      const getVal = (header: string) => {
        const index = headers.indexOf(header);
        return values[index]?.trim() || '';
      };

      const parseBool = (val: string) => val.toLowerCase() === 'yes';
      const parseNum = (val: string) => parseInt(val.replace(/[^0-9]/g, '')) || 0;

      return {
        id: `item-${idx}`,
        date: getVal('Date'),
        facebook: parseBool(getVal('Facebook')),
        tiktok: parseBool(getVal('TikTok')),
        telegram: parseBool(getVal('Telegram')),
        title: getVal('Title'),
        description: getVal('Content Description'),
        textReady: parseBool(getVal('Text Ready')),
        imageReady: parseBool(getVal('Image Ready')),
        videoReady: parseBool(getVal('Video Ready')),
        fbLikes: parseNum(getVal('FB Likes')),
        fbViews: parseNum(getVal('FB Views')),
        fbComments: parseNum(getVal('FB Comments')),
        ttLikes: parseNum(getVal('TT Likes')),
        ttViews: parseNum(getVal('TT Views')),
        ttComments: parseNum(getVal('TT Comments')),
        tgLikes: parseNum(getVal('TG Likes')),
        tgViews: parseNum(getVal('TG Views')),
        tgComments: parseNum(getVal('TG Comments')),
        totalLikes: parseNum(getVal('Total Likes')),
        totalViews: parseNum(getVal('Total Views')),
        totalComments: parseNum(getVal('Total Comments')),
        fbUploadDate: getVal('FB Upload Date'),
        ttUploadDate: getVal('TT Upload Date'),
        tgUploadDate: getVal('TG Upload Date'),
      };
    });
  } catch (error) {
    console.error('Failed to fetch sheet data:', error);
    return [];
  }
};
