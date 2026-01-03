
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  BarChart3, 
  CheckSquare, 
  RefreshCw, 
  Table as TableIcon,
  ChevronRight,
  PlusCircle,
  FileText,
  AlertCircle,
  Hash,
  MessageSquare
} from 'lucide-react';
import { ContentItem } from './types';
import { fetchSheetData } from './services/sheets';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import Analytics from './components/Analytics';
import TaskTracker from './components/TaskTracker';

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SsDkmW0R6FAqs2UyK-pwzg1Mwuq63ZKYzyAHaPj3Ipg/edit?usp=sharing';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'analytics' | 'tasks'>('dashboard');
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSheetData(sheetUrl);
      setContent(data);
    } catch (err) {
      setError('ဒေတာရယူ၍မရပါ။ လင့်ခ်မှန်ကန်မှုရှိမရှိ စစ်ဆေးပေးပါ။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => {
    return content.reduce((acc, item) => ({
      likes: acc.likes + item.totalLikes,
      views: acc.views + item.totalViews,
      comments: acc.comments + item.totalComments
    }), { likes: 0, views: 0, comments: 0 });
  }, [content]);

  const navItems = [
    { id: 'dashboard', label: 'ပင်မစာမျက်နှာ', icon: LayoutDashboard },
    { id: 'ai', label: 'AI လက်ထောက်', icon: Sparkles },
    { id: 'analytics', label: 'စာရင်းဇယားများ', icon: BarChart3 },
    { id: 'tasks', label: 'အလုပ်မှတ်တမ်းများ', icon: CheckSquare },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white fixed h-full hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ContentGenius</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-indigo-950/50">
          <div className="text-xs text-indigo-400 mb-2 uppercase tracking-wider font-semibold">လုပ်ဆောင်ဆဲ ပရောဂျက်</div>
          <div className="flex items-center gap-2 overflow-hidden">
            <RefreshCw size={14} className="text-emerald-400 animate-spin-slow" />
            <span className="truncate text-sm font-medium">ပင်မ အကြောင်းအရာ စီးဆင်းမှု</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24 lg:pb-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-gray-500 text-sm">သင့်ရဲ့ ကွန်တန့်တွေကို အကောင်းဆုံး စီမံခန့်ခွဲပါ။</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Google Sheet လင့်ခ် ထည့်ပါ..."
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
              <button 
                onClick={loadData}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium uppercase">ကြည့်ရှုမှု စုစုပေါင်း</span>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><BarChart3 size={18} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totals.views.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <span>လွန်ခဲ့တဲ့လထက် +12.5% တိုးလာပါသည်</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium uppercase">Like စုစုပေါင်း</span>
              <div className="bg-pink-50 text-pink-600 p-2 rounded-lg"><PlusCircle size={18} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totals.likes.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <span>လွန်ခဲ့တဲ့လထက် +8.2% တိုးလာပါသည်</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm font-medium uppercase">မှတ်ချက် စုစုပေါင်း</span>
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><MessageSquare size={18} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totals.comments.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <span>လွန်ခဲ့တဲ့လထက် +4.1% တိုးလာပါသည်</span>
            </div>
          </div>
        </section>

        {/* Content Area */}
        {loading && content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw size={48} className="animate-spin mb-4 text-indigo-400" />
            <p className="text-lg">ဒေတာများကို စစ်ဆေးနေပါသည်...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {activeTab === 'dashboard' && <Dashboard items={content} />}
            {activeTab === 'ai' && <AIAssistant content={content} />}
            {activeTab === 'analytics' && <Analytics items={content} />}
            {activeTab === 'tasks' && <TaskTracker items={content} />}
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 flex justify-around items-center shadow-lg">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 ${
              activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
