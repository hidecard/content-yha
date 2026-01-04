
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { ContentItem } from '../types';
import { TrendingUp, Users, Target } from 'lucide-react';

interface Props {
  items: ContentItem[];
}

const Analytics: React.FC<Props> = ({ items }) => {
  const chartData = useMemo(() => {
    return items.map(item => ({
      name: item.title.substring(0, 10),
      likes: item.totalLikes,
      views: item.totalViews,
      comments: item.totalComments
    })).slice(-8);
  }, [items]);

  const platformShare = useMemo(() => {
    const data = [
      { name: 'Facebook', value: items.reduce((sum, i) => sum + i.fbViews, 0), color: '#3b82f6' },
      { name: 'TikTok', value: items.reduce((sum, i) => sum + i.ttViews, 0), color: '#111827' },
      { name: 'Telegram', value: items.reduce((sum, i) => sum + i.tgViews, 0), color: '#0ea5e9' },
    ];
    return data.filter(d => d.value > 0);
  }, [items]);

  const topPerformer = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => b.totalViews - a.totalViews)[0];
  }, [items]);

  return (
    <div className="space-y-8">
      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">တိုးတက်မှု အကောင်းဆုံး</h4>
            {topPerformer ? (
              <>
                <div className="text-xl font-bold text-gray-900 truncate max-w-[200px]">{topPerformer.title}</div>
                <div className="text-emerald-600 font-semibold">{topPerformer.totalViews.toLocaleString()} ကြည့်ရှုမှု</div>
              </>
            ) : (
              <div className="text-gray-300">ဒေတာ မရှိသေးပါ</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <Target size={32} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">တုံ့ပြန်မှု နှုန်းထား</h4>
            <div className="text-xl font-bold text-gray-900">4.8%</div>
            <div className="text-indigo-600 font-semibold">ပုံမှန်ထက် +0.5% ပိုများပါသည်</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Engagement Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900">တုံ့ပြန်မှု အခြေအနေ</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Likes</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-pink-500 rounded-full"></span> မှတ်ချက်များ</div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="likes" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="comments" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
          <h3 className="font-bold text-gray-900 mb-8">ပလက်ဖောင်းအလိုက် ဝေစု</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformShare}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {platformShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>အဓိက ရောက်ရှိမှု</span>
            <span className="text-indigo-600">ပလက်ဖောင်းအလိုက် ကြည့်ရှုမှု</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
