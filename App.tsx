import React, { useState, useEffect, useRef } from 'react';
import { generateFix } from './services/gemini';
import { FixResult, SavedFix, Theme } from './types';
import AdviceCard from './components/AdviceCard';
import { 
  SparklesIcon, 
  ZapIcon, 
  ListIcon, 
  MoonIcon, 
  SunIcon, 
  BookmarkIcon, 
  RefreshCwIcon,
  XIcon,
  PlusIcon
} from './components/Icons';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [savedFixes, setSavedFixes] = useState<SavedFix[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Ref to handle text area auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize theme and saved data
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Saved Fixes
    const storedHistory = localStorage.getItem('instantFixSaved');
    if (storedHistory) {
      try {
        setSavedFixes(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse saved fixes', e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('instantFixSaved', JSON.stringify(savedFixes));
  }, [savedFixes]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResponse = await generateFix(query);
      const newFix: FixResult = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        ...apiResponse
      };

      setResult(newFix);
      // NOTE: Auto-save removed. User must manually save.
      
    } catch (err) {
      setError("Something went wrong. Please check your connection or try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    
    // Check if already saved
    if (savedFixes.some(fix => fix.id === result.id)) {
      // Could allow unsaving, but for now let's just return or maybe remove?
      // Let's implement toggle behavior (Save/Unsave)
      setSavedFixes(prev => prev.filter(fix => fix.id !== result.id));
    } else {
      setSavedFixes(prev => [result, ...prev]);
    }
  };

  const handleNewFix = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setLoading(false);
    // Reset textarea height after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }, 10);
  };

  const loadSavedItem = (item: SavedFix) => {
    setQuery(item.query);
    setResult(item);
    setShowSaved(false);
    // Reset textarea height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 10);
  };

  const deleteSavedItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedFixes(prev => prev.filter(item => item.id !== id));
  };

  const isCurrentSaved = result && savedFixes.some(fix => fix.id === result.id);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-100 dark:selection:bg-primary-900">
      
      {/* Header */}
      <header className="w-full max-w-3xl px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleNewFix}>
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <ZapIcon className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Instant Fix</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSaved(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
            title="Saved Fixes"
          >
            <BookmarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {savedFixes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            )}
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <SunIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl px-6 pb-20 flex-grow flex flex-col">
        
        {/* Input Section */}
        <div className={`transition-all duration-500 ease-in-out flex flex-col items-center ${result ? 'mt-4 mb-8' : 'mt-[20vh] mb-12'}`}>
          {!result && !loading && (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800 dark:text-white leading-tight animate-fade-in-up">
              What's on your mind?
            </h2>
          )}
          
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl opacity-20 group-focus-within:opacity-40 blur transition duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col md:flex-row items-end md:items-center gap-2">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={handleInput}
                placeholder="I'm feeling overwhelmed by..."
                className="w-full bg-transparent border-none focus:ring-0 text-lg p-3 min-h-[50px] max-h-[200px] resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                rows={1}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || loading}
                className={`
                  flex-shrink-0 mb-1 mr-1 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200
                  ${!query.trim() || loading 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 active:scale-95 shadow-md shadow-primary-500/20'
                  }
                `}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Fix It'
                )}
              </button>
            </div>
          </div>
          
          {!result && !loading && (
            <div className="mt-8 flex gap-4 text-sm text-gray-400 dark:text-gray-500 overflow-x-auto max-w-full pb-2">
              <span className="whitespace-nowrap">Try: "Procrastinating on a big project"</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">"Argument with partner"</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">"Need to wake up earlier"</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {result && (
          <div className="space-y-6 animate-fade-in pb-12">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Your Plan</h3>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={handleSave} 
                  className={`text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isCurrentSaved 
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4" filled={isCurrentSaved} />
                  {isCurrentSaved ? 'Saved' : 'Save'}
                </button>

                <button 
                  onClick={handleNewFix} 
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Fix
                </button>
              </div>
            </div>
            
            {/* Quick Actions (Regenerate separate from logic controls) */}
             <div className="flex justify-end -mt-4 px-1">
               <button 
                onClick={handleSubmit} 
                className="text-xs flex items-center gap-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <RefreshCwIcon className="w-3 h-3" />
                Regenerate response
              </button>
             </div>

            <AdviceCard 
              title="3-Line Advice" 
              content={result.insight} 
              icon={<SparklesIcon />} 
              colorClass="bg-purple-500" 
              delay={0}
            />

            <AdviceCard 
              title="30-Second Plan" 
              content={result.plan} 
              icon={<ZapIcon />} 
              colorClass="bg-amber-500" 
              delay={150}
            />

            <AdviceCard 
              title="3-Step Action" 
              content={result.actions} 
              icon={<ListIcon />} 
              colorClass="bg-blue-500" 
              delay={300}
            />
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-gray-400 text-xs border-t border-gray-200 dark:border-gray-800">
        <p>Instant Fix • Powered by Gemini 2.5 Flash</p>
      </footer>

      {/* Saved Drawer/Modal */}
      {showSaved && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setShowSaved(false)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5 text-primary-600" filled />
                <h2 className="text-lg font-bold">Saved Fixes</h2>
              </div>
              <button onClick={() => setShowSaved(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedFixes.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <BookmarkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No saved fixes yet.</p>
                  <p className="text-xs mt-2">Tap the save icon on any result to keep it here.</p>
                </div>
              ) : (
                savedFixes.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => loadSavedItem(item)}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-gray-200">{item.query}</p>
                      <button 
                        onClick={(e) => deleteSavedItem(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        title="Remove"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.insight}</p>
                    <div className="mt-2 text-[10px] text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;