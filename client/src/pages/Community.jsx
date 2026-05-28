import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Heart, Trash2, Bot, CloudSun, TrendingUp, TrendingDown,
  Minus, Search, ChevronDown, X, Wind, Droplets, Eye, Thermometer,
  Leaf, ShoppingBasket, Sprout, Users, RefreshCw, MapPin, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

// ─── ROLE CONFIG ───────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: 'Admin' },
  farmer: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', label: 'Farmer' },
  customer: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Customer' },
};
const TOPICS = [
  { id: 'all', label: 'All Topics', icon: '🌐' },
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'farming', label: 'Farming Tips', icon: '🌾' },
  { id: 'market', label: 'Market Talk', icon: '📊' },
  { id: 'weather', label: 'Weather & Seasons', icon: '🌦️' },
  { id: 'help', label: 'Need Help', icon: '🙋' },
];
const BOT_KB = [
  {
    q: ["hello", "hi", "namaste"],
    a: "Namaste 🙏 How can I help you with farming, prices, or weather?"
  },
  {
    q: ["tomato", "price", "kalimati"],
    a: "Check Kalimati ticker in the sidebar for live vegetable prices 🍅"
  },
  {
    q: ["weather", "rain"],
    a: "Weather forecast for Kathmandu is shown in the sidebar 🌦️"
  },
  {
    q: ["sell", "buy"],
    a: "You can buy/sell products directly from the marketplace section."
  }
];



const getBotReply = (input) => {
  const lower = input.toLowerCase();
  for (const entry of BOT_KB) {
    if (entry.q.some(k => lower.includes(k))) return entry.a;
  }
  return "I'm not sure about that yet 🤔. Try asking about **prices**, **weather**, **buying**, **selling**, **crops**, or **payments**. Or post in the community — our farmers and admins will help!";
};

// ─── WEATHER WIDGET ──────────────────────────────────────────────────────────
const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Open-Meteo free API for Kathmandu
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKathmandu&forecast_days=5'
        );
        const data = await res.json();
        setWeather(data);
      } catch {
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  };
  const getWeatherLabel = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Showers';
    return 'Thunderstorm';
  };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-white/20 rounded w-1/2 mb-3" />
      <div className="h-10 bg-white/20 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/20 rounded w-2/3" />
    </div>
  );

  if (!weather) return (
    <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-4 text-white text-xs font-semibold text-center">
      <CloudSun className="w-8 h-8 mx-auto mb-2 opacity-70" />
      Weather unavailable. Check again later.
    </div>
  );

  const c = weather.current;
  const daily = weather.daily;

  return (
    <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 rounded-2xl p-4 text-white shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/80">
            <MapPin className="w-3 h-3" /> Kathmandu, Nepal
          </div>
          <span className="text-[10px] text-white/60">{new Date().toLocaleDateString('en-NP', { weekday:'short', day:'numeric', month:'short' })}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-4xl font-black tracking-tight">{Math.round(c.temperature_2m)}°C</div>
            <div className="text-xs text-white/80 font-semibold mt-0.5">
              {getWeatherLabel(c.weather_code)} {getWeatherIcon(c.weather_code)}
            </div>
            <div className="text-[11px] text-white/60">Feels like {Math.round(c.apparent_temperature)}°C</div>
          </div>
          <div className="text-5xl">{getWeatherIcon(c.weather_code)}</div>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-3">
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <Droplets className="w-3 h-3 mx-auto mb-0.5 text-sky-200" />
            <div className="text-xs font-bold">{c.relative_humidity_2m}%</div>
            <div className="text-[9px] text-white/60">Humidity</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <Wind className="w-3 h-3 mx-auto mb-0.5 text-sky-200" />
            <div className="text-xs font-bold">{Math.round(c.wind_speed_10m)}</div>
            <div className="text-[9px] text-white/60">km/h</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <Eye className="w-3 h-3 mx-auto mb-0.5 text-sky-200" />
            <div className="text-xs font-bold">{daily.precipitation_sum?.[0]?.toFixed(1) || '0'}mm</div>
            <div className="text-[9px] text-white/60">Rain</div>
          </div>
        </div>
        {/* 5-day forecast */}
        <div className="flex gap-1">
          {daily.time?.slice(0, 5).map((date, i) => (
            <div key={date} className="flex-1 bg-white/10 rounded-xl p-1.5 text-center">
              <div className="text-[9px] text-white/60 font-semibold">{DAYS[new Date(date).getDay()]}</div>
              <div className="text-sm my-0.5">{getWeatherIcon(daily.weather_code[i])}</div>
              <div className="text-[9px] font-bold text-white">{Math.round(daily.temperature_2m_max[i])}°</div>
              <div className="text-[9px] text-white/50">{Math.round(daily.temperature_2m_min[i])}°</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── KALIMATI PRICE TICKER ───────────────────────────────────────────────────
const KalimatiTicker = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await api.get('/kalimati');
        setPrices(res.data.items || []);
      } catch {
        // Fallback hardcoded data
        setPrices([
          { name: 'Tomato Big (Nepali)', unit:'KG', avg:65, change:2.5, trend:'up', emoji:'🍅', category:'vegetables' },
          { name: 'Potato Red (Long)', unit:'KG', avg:29, change:-1.0, trend:'down', emoji:'🥔', category:'vegetables' },
          { name: 'Onion Dry (Indian)', unit:'KG', avg:37, change:0, trend:'stable', emoji:'🧅', category:'vegetables' },
          { name: 'Carrot (Local)', unit:'KG', avg:57.5, change:4.5, trend:'up', emoji:'🥕', category:'vegetables' },
          { name: 'Cabbage (Local)', unit:'KG', avg:33.75, change:-2.0, trend:'down', emoji:'🥬', category:'vegetables' },
          { name: 'Cauliflower Local', unit:'KG', avg:43.75, change:3, trend:'up', emoji:'🥦', category:'vegetables' },
          { name: 'Brinjal Long', unit:'KG', avg:43, change:1, trend:'up', emoji:'🍆', category:'vegetables' },
          { name: 'Green Peas', unit:'KG', avg:58, change:-5, trend:'down', emoji:'🫛', category:'vegetables' },
          { name: 'Ginger', unit:'KG', avg:145, change:15, trend:'up', emoji:'🫚', category:'spices' },
          { name: 'Garlic (Local)', unit:'KG', avg:287.5, change:-12.5, trend:'down', emoji:'🧄', category:'spices' },
          { name: 'Mango (Local)', unit:'KG', avg:95, change:5, trend:'up', emoji:'🥭', category:'fruits' },
          { name: 'Watermelon', unit:'KG', avg:25, change:2, trend:'up', emoji:'🍉', category:'fruits' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const categories = ['all', ...new Set(prices.map(p => p.category))];
  const filtered = prices.filter(p => {
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const displayPrices = expanded ? filtered : filtered.slice(0, 8);
  const trending = prices.filter(p => p.trend === 'up').slice(0, 3);
  const falling = prices.filter(p => p.trend === 'down').slice(0, 3);

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="w-4 h-4" />
            <span className="font-extrabold text-sm tracking-tight">Kalimati Market</span>
          </div>
          <span className="text-[10px] text-white/60 font-semibold">{new Date().toLocaleDateString('en-NP', { day:'numeric', month:'short' })}</span>
        </div>
        <p className="text-[10px] text-white/60">Live wholesale prices • Kathmandu</p>

        {/* Quick highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-xl p-2">
            <div className="flex items-center gap-1 text-[9px] text-emerald-300 font-bold mb-1"><TrendingUp className="w-3 h-3" /> Rising</div>
            {trending.map((p,i) => (
              <div key={i} className="flex justify-between text-[10px]">
                <span className="text-white/80 truncate max-w-[90px]">{p.emoji} {p.name.split(' ')[0]}</span>
                <span className="text-emerald-300 font-bold">+{p.change}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <div className="flex items-center gap-1 text-[9px] text-red-300 font-bold mb-1"><TrendingDown className="w-3 h-3" /> Falling</div>
            {falling.map((p,i) => (
              <div key={i} className="flex justify-between text-[10px]">
                <span className="text-white/80 truncate max-w-[90px]">{p.emoji} {p.name.split(' ')[0]}</span>
                <span className="text-red-300 font-bold">{p.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-3 border-b border-stone-100 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-sage-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vegetable..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-stone-200 rounded-xl outline-none focus:border-primary-400" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize transition-all ${catFilter===cat ? 'bg-primary-900 text-white' : 'bg-stone-100 text-sage-600 hover:bg-stone-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price table */}
      <div className="divide-y divide-stone-50">
        {loading ? Array.from({length:6}).map((_,i) => (
          <div key={i} className="p-3 flex justify-between animate-pulse">
            <div className="bg-stone-200 h-3 rounded w-1/2" />
            <div className="bg-stone-200 h-3 rounded w-12" />
          </div>
        )) : displayPrices.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50/50 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">{item.emoji}</span>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-primary-950 truncate">{item.name}</div>
                <div className="text-[9px] text-sage-400">per {item.unit}</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs font-extrabold text-primary-950">Rs.{item.avg}</div>
              <div className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${item.trend==='up' ? 'text-emerald-600' : item.trend==='down' ? 'text-red-500' : 'text-sage-400'}`}>
                {item.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : item.trend === 'down' ? <ArrowDownRight className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                {item.change > 0 ? '+' : ''}{item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length > 8 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 text-[11px] font-bold text-primary-700 hover:bg-stone-50 border-t border-stone-100 transition-colors flex items-center justify-center gap-1">
          {expanded ? 'Show Less' : `Show ${filtered.length - 8} More`}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
const Chatbot = ({ onClose }) => {
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: "Namaste! 🙏 I'm INARI Assistant. Ask me about market prices, farming tips, weather, payments, or how to buy/sell on INARI." }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text }]);
    setThinking(true);
    try {
      // Call Gemini backend — always returns 200 with a reply field
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: msgs })
      });
      if (res.ok) {
        const data = await res.json();
        setMsgs(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        // Non-200: still try to read body, else use keyword fallback
        let reply;
        try {
          const errData = await res.json();
          reply = errData.reply || getBotReply(text);
        } catch {
          reply = getBotReply(text);
        }
        setMsgs(prev => [...prev, { role: 'bot', text: reply }]);
      }
    } catch {
      // Network error — use local keyword bot
      await new Promise(r => setTimeout(r, 300));
      setMsgs(prev => [...prev, { role: 'bot', text: getBotReply(text) }]);
    } finally {
      setThinking(false);
    }
  };

  const QUICK = ['Tomato price today', 'How to sell on INARI?', 'Farming tips', 'Khalti payment'];

  const renderText = (text) => {
    // Bold markdown-style **text**
    return text.split('\n').map((line, i) => (
      <span key={i} className="block">
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '78vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/uploads/logo2.png" alt="INARI" className="w-9 h-9 object-contain" />
          </div>
          
          <div>
            <div className="font-extrabold text-sm text-white leading-none">INARI Assistant</div>
            <div className="text-[10px] text-white/60 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />Online</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/30">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && (
              <div className="w-6 h-6 bg-primary-100 border border-primary-200 rounded-lg flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <img src="/uploads/logo2.png" alt="bot" className="w-8 h-8 object-contain" />
              </div>
            )}
            <div className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'bg-primary-900 text-white rounded-tr-sm'
                : 'bg-white border border-stone-200 text-primary-950 rounded-tl-sm'
            }`}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 border border-primary-200 rounded-lg flex items-center justify-center shrink-0">
              <Sprout className="w-3 h-3 text-primary-700" />
            </div>
            <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
              <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
              <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-3 py-2 border-t border-stone-100 flex gap-1.5 flex-wrap bg-white">
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => { setInput(q); }}
            className="text-[10px] px-2.5 py-1 bg-stone-100 hover:bg-primary-50 hover:text-primary-800 text-sage-600 font-semibold rounded-full border border-stone-200 hover:border-primary-200 transition-all">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-stone-100 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask anything about INARI..."
          className="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-primary-400" />
        <button onClick={send} disabled={!input.trim() || thinking}
          className="bg-primary-900 hover:bg-primary-950 text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMMUNITY PAGE ─────────────────────────────────────────────────────
const Community = () => {
  const { user } = useAuth();
  const showToast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('all');
  const [newMsg, setNewMsg] = useState('');
  const [newTopic, setNewTopic] = useState('general');
  const [posting, setPosting] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const textareaRef = useRef(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/community', { params: { topic: activeTopic } });
      setPosts(res.data);
    } catch {
      // Use sample posts if backend not ready
      setPosts([
        { _id:'1', userName:'Hari Prasad', userRole:'farmer', topic:'farming', message:'Tomato prices are rising this week in Bhaktapur! Good time to sell 🍅 Getting Rs.70/kg at Kalimati wholesale today.', likes:['u2','u3'], createdAt: new Date(Date.now()-3600000).toISOString() },
        { _id:'2', userName:'Sita Devi', userRole:'customer', topic:'market', message:'Anyone knows where to get fresh organic spinach near Kathmandu? Looking for bulk quantity for restaurant.', likes:['u1'], createdAt: new Date(Date.now()-7200000).toISOString() },
        { _id:'3', userName:'Admin Inari', userRole:'admin', topic:'general', message:'🎉 Welcome to INARI Community! Share your farming updates, market tips, and connect with buyers & sellers across Nepal. नमस्ते!', likes:['u1','u2','u3','u4'], createdAt: new Date(Date.now()-86400000).toISOString() },
        { _id:'4', userName:'Ram Bahadur', userRole:'farmer', topic:'weather', message:'Heavy rain forecast for Chitwan this week. Holding off on potato harvest until Thursday. Anyone else adjusting plans?', likes:['u2'], createdAt: new Date(Date.now()-10800000).toISOString() },
        { _id:'5', userName:'Priya Sharma', userRole:'customer', topic:'help', message:'How do I pay with Khalti on INARI? First time using online payment. Any tips?', likes:[], createdAt: new Date(Date.now()-14400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeTopic]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handlePost = async () => {
    if (!user) { showToast('Please log in to post.', 'warning'); return; }
    if (!newMsg.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/community', { message: newMsg, topic: newTopic });
      setPosts(prev => [res.data, ...prev]);
      setNewMsg('');
      showToast('Posted to community!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to post.', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) { showToast('Log in to like posts.', 'warning'); return; }
    try {
      const res = await api.put(`/community/${postId}/like`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch {
      // Optimistic toggle locally
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const uid = user._id || user.id;
        const liked = p.likes?.includes(uid);
        return { ...p, likes: liked ? p.likes.filter(id => id !== uid) : [...(p.likes||[]), uid] };
      }));
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      showToast('Post deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete.', 'error');
    }
  };

  const formatTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000);
    const h = Math.floor(m/60);
    const d = Math.floor(h/24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const totalActive = 12 + Math.floor(Math.random() * 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold text-primary-950 tracking-tight">INARI Community</h1>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {totalActive} online
          </div>
        </div>
        <p className="text-xs text-sage-500">Farmers, buyers & admins discussing crops, prices, and farming life across Nepal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: FEED ─────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Topic filter pills */}
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map(t => (
              <button key={t.id} onClick={() => setActiveTopic(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeTopic === t.id
                    ? 'bg-primary-900 text-white border-primary-950'
                    : 'bg-white text-sage-600 border-stone-200 hover:border-primary-300 hover:text-primary-900'
                }`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Post composer */}
          {user ? (
            <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold text-sm shrink-0 ${ROLE_COLORS[user.role]?.bg || 'bg-stone-100'} ${ROLE_COLORS[user.role]?.text || 'text-stone-800'} ${ROLE_COLORS[user.role]?.border || 'border-stone-200'}`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handlePost(); }}
                    placeholder="Share a farming tip, market update, or question with the community..."
                    rows={3}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-primary-400 resize-none placeholder:text-sage-400 leading-relaxed"
                  />
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-sage-500 font-semibold">Topic:</span>
                      <select value={newTopic} onChange={e => setNewTopic(e.target.value)}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none text-primary-950 font-semibold bg-white">
                        {TOPICS.filter(t => t.id !== 'all').map(t => (
                          <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-sage-400">Ctrl+Enter to post</span>
                      <button onClick={handlePost} disabled={!newMsg.trim() || posting}
                        className="bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm">
                        <Send className="w-3.5 h-3.5" />
                        {posting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-soft text-center">
              <p className="text-sm text-sage-500 font-semibold">
                <span className="text-primary-900 font-extrabold">Log in</span> to post in the community and connect with farmers & buyers.
              </p>
            </div>
          )}

          {/* Posts feed */}
          <div className="space-y-4">
            {loading ? (
              Array.from({length:3}).map((_,i) => (
                <div key={i} className="bg-white border border-stone-200/60 rounded-2xl p-5 animate-pulse space-y-3">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-stone-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-stone-200 rounded w-1/3" />
                      <div className="h-3 bg-stone-200 rounded w-2/3" />
                      <div className="h-12 bg-stone-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="bg-white border border-stone-200/60 rounded-2xl p-12 text-center">
                <MessageCircle className="w-10 h-10 text-sage-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-sage-400">No posts in this topic yet. Be the first!</p>
              </div>
            ) : posts.map(post => {
              const rc = ROLE_COLORS[post.userRole] || ROLE_COLORS.customer;
              const topicInfo = TOPICS.find(t => t.id === post.topic);
              const liked = user && post.likes?.includes(user._id || user.id);
              const canDelete = user && (post.user?.toString() === (user._id || user.id)?.toString() || user.role === 'admin');

              return (
                <div key={post._id} className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-soft hover:border-stone-300 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-extrabold text-sm shrink-0 ${rc.bg} ${rc.text} ${rc.border}`}>
                      {post.userName?.charAt(0).toUpperCase()}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-extrabold text-sm text-primary-950">{post.userName}</span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${rc.bg} ${rc.text} ${rc.border}`}>
                          {rc.label}
                        </span>
                        {topicInfo && (
                          <span className="text-[10px] text-sage-400 font-semibold">{topicInfo.icon} {topicInfo.label}</span>
                        )}
                        <span className="text-[10px] text-sage-400 ml-auto">{formatTime(post.createdAt)}</span>
                      </div>
                      <p className="text-sm text-primary-900 leading-relaxed whitespace-pre-line">{post.message}</p>
                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-50">
                        <button onClick={() => handleLike(post._id)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${liked ? 'text-red-500' : 'text-sage-400 hover:text-red-500'}`}>
                          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                          {post.likes?.length || 0}
                        </button>
                        {canDelete && (
                          <button onClick={() => handleDelete(post._id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-sage-300 hover:text-red-500 transition-colors ml-auto">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refresh */}
          <div className="text-center">
            <button onClick={loadPosts} disabled={loading}
              className="flex items-center gap-2 mx-auto text-xs font-bold text-sage-500 hover:text-primary-900 py-2 px-4 rounded-xl hover:bg-stone-100 transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ─────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Community stats */}
          <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-soft">
            <h3 className="font-extrabold text-xs text-sage-400 uppercase tracking-wider mb-3">Community</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-extrabold text-primary-950">{posts.length || 0}</div>
                <div className="text-[10px] text-sage-400 font-semibold">Posts</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-700">{totalActive}</div>
                <div className="text-[10px] text-sage-400 font-semibold">Online</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-primary-950">{TOPICS.length - 1}</div>
                <div className="text-[10px] text-sage-400 font-semibold">Topics</div>
              </div>
            </div>
          </div>

          {/* Weather */}
          <div>
            <h3 className="font-extrabold text-xs text-sage-400 uppercase tracking-wider mb-2 px-1">Weather Forecast</h3>
            <WeatherWidget />
          </div>

          {/* Kalimati Prices */}
          <div>
            <h3 className="font-extrabold text-xs text-sage-400 uppercase tracking-wider mb-2 px-1">Market Prices</h3>
            <KalimatiTicker />
          </div>

        </div>
      </div>

      {/* ── CHATBOT FAB ──────────────────────────────────────────── */}
      <button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className={`fixed bottom-5 right-5 z-40 w-14 h-14 rounded-2xl bg-transparent shadow-2xl flex items-center justify-center transition-all duration-300 animate-shake hover:animate-none`}
      >
        {chatbotOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <img
            src="/uploads/logo2.png"
            alt="INARI"
            className="w-14 h-14 object-contain"
          />
        )}
      </button>

      {chatbotOpen && <Chatbot onClose={() => setChatbotOpen(false)} />}
    </div>
  );
};

export default Community;