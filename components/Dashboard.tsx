
import React, { useState } from 'react';
import { ContentItem } from '../types';
import { 
  Facebook, 
  Music2, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertTriangle,
  Clock,
  ThumbsUp,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Loader2,
  Rocket,
  Camera,
  Film
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Props {
  items: ContentItem[];
}

const PAGE_SIZE = 5;

const Dashboard: React.FC<Props> = ({ items }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [aiTips, setAiTips] = useState<Record<string, { viewsTip: string; likesTip: string; commentsTip: string } | null>>({});
  const [visualIdeas, setVisualIdeas] = useState<Record<string, { imageIdeas: string[]; videoIdea: string } | null>>({});
  const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({});
  const [loadingVisuals, setLoadingVisuals] = useState<Record<string, boolean>>({});

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setExpandedId(null);
  };

  const fetchEngagementTips = async (item: ContentItem) => {
    if (aiTips[item.id]) return;
    setLoadingTips(prev => ({ ...prev, [item.id]: true }));
    try {
      const tips = await geminiService.getPreUploadTips(item);
      setAiTips(prev => ({ ...prev, [item.id]: tips }));
    } catch (err) {
      console.error("Failed to fetch tips", err);
    } finally {
      setLoadingTips(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const fetchVisualIdeas = async (item: ContentItem) => {
    if (visualIdeas[item.id]) return;
    setLoadingVisuals(prev => ({ ...prev, [item.id]: true }));
    try {
      const ideas = await geminiService.generateVisualIdeas(item.title, item.description);
      setVisualIdeas(prev => ({ ...prev, [item.id]: ideas }));
    } catch (err) {
      console.error("Failed to fetch visual ideas", err);
    } finally {
      setLoadingVisuals(prev => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} className="text-indigo-600" />
          ကွန်တန့် အခြေအနေ ဇယား
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase bg-rose-50 px-2 py-1 rounded">
            <XCircle size={10} /> မပြီးသေးပါ
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">
            <CheckCircle2 size={10} /> အဆင်သင့်ဖြစ်ပါသည်
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px] border-collapse">
          <thead className="bg-gray-100/50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-4"></th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ကွန်တန့် အချက်အလက်</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">အဆင်သင့်ဖြစ်မှု</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">ပလက်ဖောင်းများ</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">တုံ့ပြန်မှု (Engagement)</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">တင်မည့်ရက်စွဲများ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item) => {
              const isNotReady = !item.textReady || !item.imageReady || !item.videoReady;
              const isExpanded = expandedId === item.id;
              
              return (
                <React.Fragment key={item.id}>
                  <tr 
                    onClick={() => toggleRow(item.id)}
                    className={`cursor-pointer transition-colors group ${
                      isNotReady 
                        ? 'bg-rose-50/20 hover:bg-rose-50/40' 
                        : 'hover:bg-gray-50'
                    } ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                  >
                    <td className="px-4 py-5 text-center">
                      {isExpanded ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors`}>
                            {item.title}
                          </span>
                          {isNotReady && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5 shadow-sm">
                              <AlertTriangle size={8} /> လိုအပ်ချက်ရှိ
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 line-clamp-1 max-w-[240px]">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-center items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">စာသား</span>
                          {item.textReady ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">ပုံ</span>
                          {item.imageReady ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">ဗီဒီယို</span>
                          {item.videoReady ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-center gap-2">
                        <span title="Facebook" className={`p-1.5 rounded-md ${item.facebook ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                          <Facebook size={14} />
                        </span>
                        <span title="TikTok" className={`p-1.5 rounded-md ${item.tiktok ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                          <Music2 size={14} />
                        </span>
                        <span title="Telegram" className={`p-1.5 rounded-md ${item.telegram ? 'bg-sky-100 text- sky-600' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                          <Send size={14} />
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                          <Eye size={12} className="text-gray-400" /> {item.totalViews.toLocaleString()}
                          <ThumbsUp size={12} className="text-gray-400 ml-2" /> {item.totalLikes.toLocaleString()}
                          <MessageSquare size={12} className="text-gray-400 ml-2" /> {item.totalComments.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full" 
                            style={{ width: `${Math.min(100, (item.totalViews / 5000) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex flex-col gap-1.5 items-end">
                        {item.fbUploadDate && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <Facebook size={10} /> {item.fbUploadDate}
                          </div>
                        )}
                        {item.ttUploadDate && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                            <Music2 size={10} /> {item.ttUploadDate}
                          </div>
                        )}
                        {item.tgUploadDate && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            <Send size={10} /> {item.tgUploadDate}
                          </div>
                        )}
                        {!item.fbUploadDate && !item.ttUploadDate && !item.tgUploadDate && (
                          <span className="text-[10px] text-gray-400 italic">ရက်ချိန်းမရှိပါ</span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <tr className="bg-indigo-50/20 border-l-4 border-l-indigo-500">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <FileText size={14} /> အသေးစိတ် အချက်အလက်
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                  {item.description || 'အကြောင်းအရာ ဖော်ပြချက် မရှိပါ။'}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3">
                                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${item.textReady ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                  <FileText size={20} />
                                  <span className="text-[10px] font-bold uppercase">စာသား</span>
                                </div>
                                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${item.imageReady ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                  <ImageIcon size={20} />
                                  <span className="text-[10px] font-bold uppercase">ပုံ</span>
                                </div>
                                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${item.videoReady ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                  <Video size={20} />
                                  <span className="text-[10px] font-bold uppercase">ဗီဒီယို</span>
                                </div>
                              </div>

                              {/* Visual Asset Recommendations */}
                              <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                                <div className="p-3 bg-amber-500 text-white flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-white" />
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider">Visual Content အကြံပြုချက်</h4>
                                  </div>
                                  {!visualIdeas[item.id] && (
                                    <button 
                                      onClick={() => fetchVisualIdeas(item)}
                                      disabled={loadingVisuals[item.id]}
                                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                                    >
                                      {loadingVisuals[item.id] ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                      Ideas ရယူပါ
                                    </button>
                                  )}
                                </div>
                                <div className="p-4 space-y-4">
                                  {loadingVisuals[item.id] ? (
                                    <div className="flex flex-col items-center justify-center py-4 gap-2 animate-pulse">
                                      <Camera size={24} className="text-amber-400 animate-bounce" />
                                      <p className="text-[10px] text-gray-400 italic">ဖန်တီးမှုအသစ်များကို AI က စဉ်းစားနေသည်...</p>
                                    </div>
                                  ) : visualIdeas[item.id] ? (
                                    <div className="space-y-4">
                                      <div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 uppercase mb-2">
                                          <Camera size={12} /> ပုံ အတွက် အိုင်ဒီယာများ
                                        </div>
                                        <ul className="space-y-2">
                                          {visualIdeas[item.id]?.imageIdeas.map((idea, idx) => (
                                            <li key={idx} className="text-xs text-gray-700 bg-amber-50/50 p-2 rounded-lg border border-amber-50">
                                              {idea}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-600 uppercase mb-2">
                                          <Film size={12} /> ဗီဒီယို (TikTok/Reel) အိုင်ဒီယာ
                                        </div>
                                        <div className="text-xs text-gray-700 bg-rose-50/50 p-2 rounded-lg border border-rose-50">
                                          {visualIdeas[item.id]?.videoIdea}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-gray-400 text-center italic">ပုံနှင့် ဗီဒီယိုအတွက် AI အကြံပြုချက်များ ရယူရန် အပေါ်မှ ခလုတ်ကို နှိပ်ပါ။</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BarChart size={14} /> ပလက်ဖောင်းအလိုက် တုံ့ပြန်မှုများ
                              </h4>
                              <div className="space-y-3">
                                {item.facebook && (
                                  <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Facebook size={16} /></div>
                                      <span className="text-xs font-bold text-gray-700">Facebook</span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                                      <span className="flex items-center gap-1"><Eye size={12}/> {item.fbViews.toLocaleString()}</span>
                                      <span className="flex items-center gap-1"><ThumbsUp size={12}/> {item.fbLikes.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                                {item.tiktok && (
                                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-gray-100 text-gray-800 rounded-lg"><Music2 size={16} /></div>
                                      <span className="text-xs font-bold text-gray-700">TikTok</span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                                      <span className="flex items-center gap-1"><Eye size={12}/> {item.ttViews.toLocaleString()}</span>
                                      <span className="flex items-center gap-1"><ThumbsUp size={12}/> {item.ttLikes.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                                {item.telegram && (
                                  <div className="bg-white p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg"><Send size={16} /></div>
                                      <span className="text-xs font-bold text-gray-700">Telegram</span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                                      <span className="flex items-center gap-1"><Eye size={12}/> {item.tgViews.toLocaleString()}</span>
                                      <span className="flex items-center gap-1"><ThumbsUp size={12}/> {item.tgLikes.toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Pre-upload Engagement Booster Section */}
                              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                                <div className="p-3 bg-indigo-600 text-white flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-300" />
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider">Engagement မြှင့်တင်ရေး</h4>
                                  </div>
                                  {!aiTips[item.id] && (
                                    <button 
                                      onClick={() => fetchEngagementTips(item)}
                                      disabled={loadingTips[item.id]}
                                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-50"
                                    >
                                      {loadingTips[item.id] ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                      Tips ရယူပါ
                                    </button>
                                  )}
                                </div>
                                <div className="p-4">
                                  {loadingTips[item.id] ? (
                                    <div className="flex flex-col items-center justify-center py-4 gap-2 animate-pulse">
                                      <Rocket size={24} className="text-indigo-400 animate-bounce" />
                                      <p className="text-[10px] text-gray-400 italic">ဗျူဟာများကို တွက်ချက်နေပါသည်...</p>
                                    </div>
                                  ) : aiTips[item.id] ? (
                                    <div className="grid grid-cols-1 gap-3">
                                      <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-50 text-[11px]">
                                        <span className="font-bold text-blue-700">VIEWS:</span> {aiTips[item.id]?.viewsTip}
                                      </div>
                                      <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-50 text-[11px]">
                                        <span className="font-bold text-pink-700">LIKES:</span> {aiTips[item.id]?.likesTip}
                                      </div>
                                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-50 text-[11px]">
                                        <span className="font-bold text-indigo-700">COMMENTS:</span> {aiTips[item.id]?.commentsTip}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-gray-400 text-center italic">အကြံပြုချက်များ ရယူရန် အပေါ်မှ ခလုတ်ကို နှိပ်ပါ။</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            စာမျက်နှာ {currentPage} / {totalPages} (စုစုပေါင်း {items.length} ခု)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BarChart = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

export default Dashboard;
