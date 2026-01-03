
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  FileWarning,
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Camera,
  Film,
  FileText,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Wand2
} from 'lucide-react';
import { ContentItem, AIRecommendation } from '../types';
import { geminiService } from '../services/geminiService';

interface Props {
  items: ContentItem[];
}

const PAGE_SIZE = 5;

const TaskTracker: React.FC<Props> = ({ items }) => {
  const [recommendations, setRecommendations] = useState<Record<string, AIRecommendation[]>>({});
  const [visualIdeas, setVisualIdeas] = useState<Record<string, { imageIdeas: string[]; videoIdea: string } | null>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [engagementBoosts, setEngagementBoosts] = useState<Record<string, { viewsTips: string; likesTips: string; commentsTips: string } | null>>({});
  
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [loadingVisuals, setLoadingVisuals] = useState<Record<string, boolean>>({});
  const [loadingDrafts, setLoadingDrafts] = useState<Record<string, boolean>>({});
  const [loadingBoosts, setLoadingBoosts] = useState<Record<string, boolean>>({});
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);

  const incompleteItems = items.filter(item => !item.textReady || !item.imageReady || !item.videoReady);
  const scheduledItems = items.filter(item => item.fbUploadDate || item.ttUploadDate || item.tgUploadDate);

  const tasksTotalPages = Math.ceil(incompleteItems.length / PAGE_SIZE);
  const currentTasks = incompleteItems.slice((tasksPage - 1) * PAGE_SIZE, tasksPage * PAGE_SIZE);

  const scheduleTotalPages = Math.ceil(scheduledItems.length / PAGE_SIZE);
  const currentSchedule = scheduledItems.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);

  const fetchVisualIdeas = async (item: ContentItem) => {
    if (visualIdeas[item.id]) return;
    setLoadingVisuals(prev => ({ ...prev, [item.id]: true }));
    try {
      const ideas = await geminiService.generateVisualIdeas(item.title, item.description);
      setVisualIdeas(prev => ({ ...prev, [item.id]: ideas }));
    } catch (error) {
      console.error("Failed to fetch visual ideas:", error);
    } finally {
      setLoadingVisuals(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const fetchAIRecommendations = async (item: ContentItem) => {
    // If we're missing visuals, we trigger both general recommendations and visual ideas
    const isMissingVisuals = !item.imageReady || !item.videoReady;
    
    setLoadingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      // 1. Get general task recommendations
      if (!recommendations[item.id]) {
        const recs = await geminiService.getRecommendations(item);
        setRecommendations(prev => ({ ...prev, [item.id]: recs }));
      }

      // 2. TRIGGER VISUAL IDEAS AUTOMATICALLY if missing image/video
      if (isMissingVisuals && !visualIdeas[item.id]) {
        await fetchVisualIdeas(item);
      }
    } finally {
      setLoadingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const fetchDraft = async (item: ContentItem) => {
    if (drafts[item.id]) return;
    setLoadingDrafts(prev => ({ ...prev, [item.id]: true }));
    try {
      const result = await geminiService.generateDraft(item.title, item.description);
      setDrafts(prev => ({ ...prev, [item.id]: result.draft }));
    } finally {
      setLoadingDrafts(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const fetchEngagementBoost = async (item: ContentItem) => {
    if (engagementBoosts[item.id]) return;
    setLoadingBoosts(prev => ({ ...prev, [item.id]: true }));
    try {
      const result = await geminiService.getEngagementBooster(item, drafts[item.id]);
      setEngagementBoosts(prev => ({ ...prev, [item.id]: result }));
    } finally {
      setLoadingBoosts(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const copyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Pending Tasks Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="text-indigo-600" />
            လုပ်ငန်းစဉ်များနှင့် လိုအပ်ချက်များ
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
            {incompleteItems.length} ခု ကျန်ရှိပါသည်
          </span>
        </div>

        <div className="space-y-4">
          {currentTasks.map((item) => {
            const missingText = !item.textReady;
            const missingImage = !item.imageReady;
            const missingVideo = !item.videoReady;
            const isMissingAnyVisual = missingImage || missingVideo;

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:border-indigo-200 group">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                        <div className="flex gap-1">
                          {missingText && <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 border border-rose-100"><FileText size={10} /> စာသား</span>}
                          {missingImage && <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 border border-amber-100"><Camera size={10} /> ပုံ</span>}
                          {missingVideo && <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 border border-orange-100"><Film size={10} /> ဗီဒီယို</span>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {missingText && (
                        <button 
                          onClick={() => fetchDraft(item)}
                          disabled={loadingDrafts[item.id]}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                        >
                          {loadingDrafts[item.id] ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                          စာသားရေးရန်
                        </button>
                      )}
                      
                      <button 
                        onClick={() => fetchAIRecommendations(item)}
                        disabled={loadingItems[item.id] || loadingVisuals[item.id]}
                        className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 ${
                          isMissingAnyVisual ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'
                        }`}
                      >
                        {loadingItems[item.id] || loadingVisuals[item.id] ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isMissingAnyVisual ? (
                          <Wand2 size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {isMissingAnyVisual ? 'Production Plan ရယူရန်' : 'အကြံပြုချက်'}
                      </button>

                      <button 
                        onClick={() => fetchEngagementBoost(item)}
                        disabled={loadingBoosts[item.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                      >
                        {loadingBoosts[item.id] ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                        Booster
                      </button>
                    </div>
                  </div>

                  {/* Engagement Booster Result Panel */}
                  {engagementBoosts[item.id] && (
                    <div className="mt-6 pt-6 border-t border-emerald-50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center gap-2 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                        <TrendingUp size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Pre-upload Engagement Booster</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 group hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 uppercase mb-2">
                            <Eye size={14} /> Views Booster
                          </div>
                          <p className="text-xs text-blue-900 leading-relaxed font-medium">
                            {engagementBoosts[item.id]?.viewsTips}
                          </p>
                        </div>
                        <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 group hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-pink-700 uppercase mb-2">
                            <ThumbsUp size={14} /> Likes Booster
                          </div>
                          <p className="text-xs text-pink-900 leading-relaxed font-medium">
                            {engagementBoosts[item.id]?.likesTips}
                          </p>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 group hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 uppercase mb-2">
                            <MessageSquare size={14} /> Comments Booster
                          </div>
                          <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                            {engagementBoosts[item.id]?.commentsTips}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Draft Panel */}
                  {drafts[item.id] && (
                    <div className="mt-6 pt-6 border-t border-indigo-50 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                       <div className="flex justify-between items-center bg-indigo-50 px-3 py-1.5 rounded-lg">
                          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={10} /> Content Draft (AI မှ ရေးသားပေးထားသည်)
                          </div>
                          <button 
                            onClick={() => copyDraft(item.id, drafts[item.id])}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-bold"
                          >
                            {copiedId === item.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copiedId === item.id ? 'Copied' : 'Copy Text'}
                          </button>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-xl border border-indigo-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {drafts[item.id]}
                       </div>
                    </div>
                  )}

                  {/* Combined Production Guide Panel (When assets are missing and triggered) */}
                  {(visualIdeas[item.id] || recommendations[item.id]) && (
                    <div className="mt-6 pt-6 border-t border-gray-50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                      
                      {/* 1. Visual Recommendations Section (Only for items missing assets) */}
                      {visualIdeas[item.id] && isMissingAnyVisual && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 bg-amber-50 w-fit px-2 py-0.5 rounded border border-amber-100">
                            <Zap size={10} /> Production Guide (ထုတ်လုပ်ရေးလမ်းညွှန်)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {missingImage && (
                              <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 shadow-sm">
                                <h5 className="text-[10px] font-bold text-amber-700 uppercase mb-3 flex items-center gap-1.5">
                                  <Camera size={12} /> ပုံအတွက် AI အိုင်ဒီယာ
                                </h5>
                                <ul className="space-y-2">
                                  {visualIdeas[item.id]?.imageIdeas.map((idea, idx) => (
                                    <li key={idx} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                      {idea}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {missingVideo && (
                              <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100 shadow-sm">
                                <h5 className="text-[10px] font-bold text-orange-700 uppercase mb-3 flex items-center gap-1.5">
                                  <Film size={12} /> ဗီဒီယို (TikTok/Reel) Concept
                                </h5>
                                <p className="text-xs text-gray-800 leading-relaxed italic bg-white/40 p-2 rounded-lg">
                                  {visualIdeas[item.id]?.videoIdea}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. General Task Recommendations Section */}
                      {recommendations[item.id] && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 bg-indigo-50 w-fit px-2 py-0.5 rounded border border-indigo-100">
                            <ArrowRight size={10} /> Next Actions (နောက်ထပ်လုပ်ဆောင်ရန်)
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {recommendations[item.id].map((rec, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 group/rec hover:bg-white transition-colors">
                                <div className={`p-1.5 rounded-lg shrink-0 ${
                                  rec.priority === 'high' ? 'bg-rose-100 text-rose-600' : 
                                  rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  <AlertTriangle size={14} />
                                </div>
                                <p className="text-xs text-gray-700 font-medium leading-relaxed">{rec.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Tasks Pagination */}
          {tasksTotalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                စာမျက်နှာ {tasksPage} / {tasksTotalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTasksPage(p => Math.max(1, p - 1))}
                  disabled={tasksPage === 1}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setTasksPage(p => Math.min(tasksTotalPages, p + 1))}
                  disabled={tasksPage === tasksTotalPages}
                  className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          
          {incompleteItems.length === 0 && (
            <div className="bg-emerald-50 text-emerald-700 p-12 rounded-3xl text-center border border-emerald-100 shadow-sm">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckSquare size={32} />
              </div>
              <p className="font-black text-xl mb-1">အားလုံး အဆင်သင့်ဖြစ်ပါပြီ။</p>
              <p className="text-sm opacity-80">ကျန်ရှိနေသော လုပ်ငန်းစဉ်များ မရှိတော့ပါ။</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Sidebar */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="text-amber-600" />
          အချိန်ဇယား
        </h3>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
            {currentSchedule.length > 0 ? currentSchedule.map((item, idx) => (
              <div key={idx} className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-indigo-500 shadow-sm z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                </div>
                <div className="mb-1 text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {item.date || 'မကြာမီ'}
                </div>
                <h5 className="text-sm font-bold text-gray-900 mb-2 leading-tight">{item.title}</h5>
                <div className="flex flex-wrap gap-2">
                  {item.fbUploadDate && <span className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold border border-blue-100">FB: {item.fbUploadDate}</span>}
                  {item.ttUploadDate && <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-bold border border-gray-200">TT: {item.ttUploadDate}</span>}
                  {item.tgUploadDate && <span className="text-[9px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md font-bold border border-sky-100">TG: {item.tgUploadDate}</span>}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <FileWarning size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm italic">တင်ရန် ရက်ချိန်းများ မရှိသေးပါ</p>
              </div>
            )}
          </div>

          {/* Schedule Pagination */}
          {scheduleTotalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{schedulePage} / {scheduleTotalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSchedulePage(p => Math.max(1, p - 1))}
                  disabled={schedulePage === 1}
                  className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => setSchedulePage(p => Math.min(scheduleTotalPages, p + 1))}
                  disabled={schedulePage === scheduleTotalPages}
                  className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTracker;
