
import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  FileText,
  Edit3,
  Copy,
  Check,
  Send,
  Wand2,
  ListRestart,
  Hash,
  PlusCircle,
  Calendar,
  Zap,
  ChevronRight,
  TrendingUp,
  BarChart,
  Target,
  Rocket,
  Eye,
  Heart,
  MessageCircle,
  ChevronLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { geminiService, AIServiceError } from '../services/geminiService';
import { ContentItem } from '../types';

interface Props {
  content: ContentItem[];
}

const PAGE_SIZE = 5;

const AIAssistant: React.FC<Props> = ({ content }) => {
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<{ title: string; description: string }[]>([]);
  const [ideasPage, setIdeasPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [editorText, setEditorText] = useState('');
  const [refinementResult, setRefinementResult] = useState('');
  const [copied, setCopied] = useState(false);

  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResults, setStrategyResults] = useState<{ title: string; description: string; reasoning: string }[]>([]);
  const [strategyPage, setStrategyPage] = useState(1);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{ target: string; suggestion: string; priority: string }[]>([]);

  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizationTips, setOptimizationTips] = useState<{ forViews: string; forLikes: string; forComments: string } | null>(null);

  const clearError = () => setError(null);

  const handleGenerateIdeas = async () => {
    if (!theme) return;
    clearError();
    setLoading(true);
    setIdeasPage(1);
    try {
      const result = await geminiService.generateIdeas(theme);
      setIdeas(result);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStrategy = async (timeframe: 'week' | 'month') => {
    clearError();
    setStrategyLoading(true);
    setStrategyPage(1);
    const existingTitles = content.map(item => item.title);
    try {
      const result = await geminiService.generateFutureStrategy(existingTitles, timeframe);
      setStrategyResults(result);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      }
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    clearError();
    setAnalysisLoading(true);
    try {
      const result = await geminiService.getGlobalEngagementAnalysis(content);
      setAnalysisResults(result);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleOptimizeDraft = async () => {
    if (!editorText) return;
    clearError();
    setOptimizationLoading(true);
    setRefinementResult('');
    try {
      const result = await geminiService.optimizeEngagement(editorText);
      setOptimizationTips(result);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      }
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleRefine = async (type: 'hook' | 'rewrite' | 'hashtags') => {
    if (!editorText) return;
    clearError();
    setLoading(true);
    setOptimizationTips(null);
    try {
      const result = await geminiService.refineContent(editorText, type);
      setRefinementResult(result);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIdeas = ideas.slice((ideasPage - 1) * PAGE_SIZE, ideasPage * PAGE_SIZE);
  const ideasTotalPages = Math.ceil(ideas.length / PAGE_SIZE);

  const currentStrategy = strategyResults.slice((strategyPage - 1) * PAGE_SIZE, strategyPage * PAGE_SIZE);
  const strategyTotalPages = Math.ceil(strategyResults.length / PAGE_SIZE);

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            ပိတ်ရန်
          </button>
        </div>
      )}

      {/* Strategic Future Planning & Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategy Planner */}
        <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden text-white border border-indigo-700/50 flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Calendar size={20} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold">ရှေ့လုပ်ငန်းစဉ် စီစဉ်ခြင်း</h3>
            </div>
            <p className="text-indigo-200 text-xs mb-6">လက်ရှိခေါင်းစဉ်များကို စစ်ဆေးပြီး လာမည့်ကာလအတွက် အိုင်ဒီယာသစ်များ ရယူပါ။</p>
            
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => handleGenerateStrategy('week')}
                disabled={strategyLoading}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                လာမည့်အပတ်
              </button>
              <button 
                onClick={() => handleGenerateStrategy('month')}
                disabled={strategyLoading}
                className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                လာမည့်လ
              </button>
            </div>

            <div className="space-y-3 min-h-[200px] flex flex-col">
              {strategyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center animate-pulse">
                  <RefreshCw className="animate-spin mb-2 text-indigo-300" size={24} />
                  <span className="text-[10px] text-indigo-300">စီစဉ်နေပါသည်...</span>
                </div>
              ) : currentStrategy.length > 0 ? (
                <>
                  <div className="space-y-3 flex-1">
                    {currentStrategy.map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-all group">
                        <h4 className="text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                          {item.title}
                          <Edit3 
                            size={12} 
                            className="opacity-0 group-hover:opacity-100 cursor-pointer" 
                            onClick={() => setEditorText(`${item.title}\n\n${item.description}`)}
                          />
                        </h4>
                        <p className="text-[10px] text-indigo-100 line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                  {strategyTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => setStrategyPage(p => Math.max(1, p - 1))}
                        disabled={strategyPage === 1}
                        className="disabled:opacity-20"
                      ><ChevronLeft size={16}/></button>
                      <span className="text-[10px] font-bold">{strategyPage} / {strategyTotalPages}</span>
                      <button 
                        onClick={() => setStrategyPage(p => Math.min(strategyTotalPages, p + 1))}
                        disabled={strategyPage === strategyTotalPages}
                        className="disabled:opacity-20"
                      ><ChevronRight size={16}/></button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-indigo-400/50 text-[10px] italic flex-1 flex items-center justify-center">
                  ကာလတစ်ခုကို ရွေးချယ်ပြီး အစီအစဉ်ဆွဲပါ။
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Global Performance Insights */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <BarChart size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">စာရင်းဇယား အကြံပြုချက်</h3>
            </div>
            <button 
              onClick={handleRunAnalysis}
              disabled={analysisLoading}
              className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {analysisLoading ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />}
              ယခု စစ်ဆေးပါ
            </button>
          </div>
          
          <div className="p-6 flex-1">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {analysisLoading ? (
                <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                  <TrendingUp className="animate-bounce mb-2 text-emerald-400" size={32} />
                  <span className="text-xs text-gray-400">ဒေတာများကို ပိုင်းခြားစိတ်ဖြာနေပါသည်...</span>
                </div>
              ) : analysisResults.length > 0 ? (
                analysisResults.map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all">
                    <div className={`mt-0.5 p-1 rounded-full ${item.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      <Target size={12} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{item.target}</div>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{item.suggestion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs italic">ရှိနှင့်ပြီးသား ကွန်တန့်များရဲ့ ဒေတာအပေါ်မူတည်ပြီး AI အကြံပြုချက် ရယူပါ</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Idea Generator */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><Lightbulb size={20} /></div>
              <h3 className="text-lg font-bold text-gray-900">အိုင်ဒီယာ အသစ်များ</h3>
            </div>
            <p className="text-sm text-gray-500">ခေါင်းစဉ်အလိုက် ကွန်တန့် အိုင်ဒီယာသစ်များ ရှာဖွေပါ။</p>
          </div>

          <div className="p-6 space-y-4 flex flex-col flex-1">
            <div className="relative">
              <input 
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="ဥပမာ - နည်းပညာအကြောင်း၊ ကျန်းမာရေးအကြောင်း..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-400 outline-none transition-all"
              />
              <button 
                onClick={handleGenerateIdeas}
                disabled={loading || !theme}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
              </button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              {currentIdeas.length > 0 ? (
                <>
                  <div className="space-y-3 flex-1">
                    {currentIdeas.map((idea, idx) => (
                      <div key={idx} className="group p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-amber-100 rounded-xl transition-all">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-gray-800 text-sm">{idea.title}</h4>
                          <button 
                            onClick={() => setEditorText(`${idea.title}\n\n${idea.description}`)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-amber-500 transition-opacity"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                  {ideasTotalPages > 1 && (
                    <div className="flex items-center justify-between p-2 pt-4 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{ideasPage} / {ideasTotalPages}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIdeasPage(p => Math.max(1, p - 1))}
                          disabled={ideasPage === 1}
                          className="p-1 rounded bg-white border border-gray-200 disabled:opacity-20"
                        ><ChevronLeft size={14}/></button>
                        <button 
                          onClick={() => setIdeasPage(p => Math.min(ideasTotalPages, p + 1))}
                          disabled={ideasPage === ideasTotalPages}
                          className="p-1 rounded bg-white border border-gray-200 disabled:opacity-20"
                        ><ChevronRight size={14}/></button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400 flex-1 flex flex-col justify-center">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm italic">ခေါင်းစဉ်တစ်ခုထည့်ပြီး AI အကြံပြုချက်များ ရယူပါ</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Refiner & Engagement Optimizer */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><Edit3 size={20} /></div>
              <h3 className="text-lg font-bold text-gray-900">မူကြမ်း ပြုပြင်ရန်</h3>
            </div>
            <button 
              onClick={handleOptimizeDraft}
              disabled={optimizationLoading || !editorText}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {optimizationLoading ? <RefreshCw className="animate-spin" size={12} /> : <Rocket size={12} />}
              Engagement Booster
            </button>
          </div>

          <div className="p-6 flex flex-col flex-1 gap-4">
            <textarea 
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder="ဒီနေရာမှာ သင့်စာသားကို ထည့်ပါ..."
              className="flex-1 w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none resize-none text-sm min-h-[150px]"
            />

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleRefine('rewrite')}
                disabled={loading || !editorText}
                className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors text-xs disabled:opacity-50"
              >
                <FileText size={14} /> ပြန်ရေးရန်
              </button>
              <button 
                onClick={() => handleRefine('hook')}
                disabled={loading || !editorText}
                className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 transition-colors text-xs disabled:opacity-50"
              >
                <Hash size={14} /> အစပျိုးစကား
              </button>
              <button 
                onClick={() => handleRefine('hashtags')}
                disabled={loading || !editorText}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-colors text-xs disabled:opacity-50"
              >
                <PlusCircle size={14} /> တဂ်များ
              </button>
            </div>

            {/* Optimization Tips Result */}
            {optimizationTips && (
              <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                  <Rocket size={14} /> Engagement Optimization Checklist (မတင်ခင် ဒါတွေစစ်ပါ)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 uppercase mb-2">
                      <Eye size={12} /> Views တိုးရန်
                    </div>
                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">{optimizationTips.forViews}</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-pink-600 uppercase mb-2">
                      <Heart size={12} /> Likes တိုးရန်
                    </div>
                    <p className="text-[11px] text-pink-900 leading-relaxed font-medium">{optimizationTips.forLikes}</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 uppercase mb-2">
                      <MessageCircle size={12} /> Comments တိုးရန်
                    </div>
                    <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">{optimizationTips.forComments}</p>
                  </div>
                </div>
              </div>
            )}

            {refinementResult && (
              <div className="mt-2 p-4 bg-indigo-900 text-indigo-100 rounded-xl relative group">
                <button 
                  onClick={() => copyToClipboard(refinementResult)}
                  className="absolute right-3 top-3 bg-white/10 hover:bg-white/20 p-1.5 rounded transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <div className="text-xs uppercase font-bold text-indigo-400 mb-2 flex items-center gap-1">
                  <Sparkles size={12} /> AI အကြံပြုချက်
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{refinementResult}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIAssistant;
