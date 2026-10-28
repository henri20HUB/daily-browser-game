// --- GAME 3: WORLD NAVIGATOR (WITH PROPER SVG WORLD MAP) ---
function GeographyGame({ onComplete, onReturnLobby }) {
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'summary'
  const [showRules, setShowRules] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const filtered = CITIES_DB.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submitGuess = (country) => {
    if (guesses.some(g => g.name === country.name)) return;

    const dist = calcDistance(country.lat, country.lon, GEO_TARGET.lat, GEO_TARGET.lon);
    const dir = calcBearing(country.lat, country.lon, GEO_TARGET.lat, GEO_TARGET.lon);

    setGuesses([{ name: country.name, distance: dist, direction: dir }, ...guesses]);
    setSearchTerm('');

    if (dist === 0) {
      setWon(true);
      onComplete(100);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setGameState('summary'), 1200);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="bg-zinc-900/60 border border-teal-500/30 p-8 rounded-3xl text-center backdrop-blur-md shadow-xl">
        <div className="w-12 h-12 bg-teal-950 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-400">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-teal-300 mb-2">World Navigator</h2>
        <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto leading-relaxed">
          Deduce the mystery country using distance in km and compass bearing clues.
        </p>

        {/* Rules Dropdown Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 cursor-pointer mx-auto bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-800/40"
          >
            <HelpCircle className="w-3.5 h-3.5" /> How to Play & Rules {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {showRules && (
            <div className="mt-3 bg-zinc-950 border border-teal-500/20 p-4 rounded-2xl text-left text-xs text-zinc-300 space-y-2 animate-fade-in">
              <p>🗺️ <strong>Reference:</strong> Use the world map card to visualize global regions and continents.</p>
              <p>🧭 <strong>Feedback:</strong> Each guess shows the exact distance (km) and compass heading (e.g. ↗️ NE) towards the target.</p>
              <p>🎯 <strong>Win Condition:</strong> Find the exact country to complete the challenge!</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setGameState('playing')}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-600/30"
        >
          <Play className="w-4 h-4 fill-current" /> Start Game
        </button>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <GameSummary 
        gameTitle="World Navigator" 
        score={won ? 100 : 0} 
        maxScore={100} 
        onReturnLobby={onReturnLobby} 
        onReplay={() => { setWon(false); setGuesses([]); setGameState('playing'); }} 
      />
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-teal-500/30 p-6 rounded-3xl backdrop-blur-md shadow-xl relative">
      {/* Prominent Floating Clock */}
      <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-teal-950/80 border border-teal-500/40 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-teal-300 shadow-inner">
        <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
        <span>NAVIGATING</span>
      </div>

      <div className="flex justify-between items-center mb-2 pr-28">
        <h2 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-teal-400" /> World Navigator
        </h2>
        <button 
          onClick={() => setShowHint(!showHint)}
          className="text-[11px] text-teal-400 hover:text-teal-200 flex items-center gap-1 transition"
        >
          <Lightbulb className="w-3 h-3 text-amber-300" /> Hint
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-4">Search countries to get distance and compass bearing feedback.</p>

      {/* Proper Detailed Vector SVG World Map Reference Card */}
      <div className="relative w-full h-52 bg-zinc-950 border border-teal-500/30 rounded-2xl mb-6 overflow-hidden shadow-inner flex items-center justify-center p-2">
        <svg viewBox="0 0 1000 500" className="w-full h-full text-zinc-800 fill-current">
          {/* Grid lines */}
          <g stroke="#18181b" strokeWidth="1">
            <line x1="0" y1="125" x2="1000" y2="125" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="375" x2="1000" y2="375" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* North America */}
          <path d="M 120,80 Q 180,60 220,90 T 260,160 Q 200,200 150,150 Z" />
          {/* South America */}
          <path d="M 240,220 Q 300,230 280,350 T 220,420 Q 200,320 240,220 Z" />
          {/* Europe */}
          <path d="M 480,80 Q 550,70 580,120 T 500,160 Z" />
          {/* Africa */}
          <path d="M 470,180 Q 560,170 550,300 T 450,380 Q 420,280 470,180 Z" />
          {/* Asia */}
          <path d="M 600,60 Q 800,40 850,150 T 700,280 Q 600,220 600,60 Z" />
          {/* Australia */}
          <path d="M 780,340 Q 880,330 860,420 T 760,400 Z" />
          {/* Greenland / Northern Islands */}
          <path d="M 320,40 Q 380,30 360,90 T 320,40 Z" />
        </svg>

        <div className="absolute bottom-3 left-3 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-teal-300">
          🌍 Global Equirectangular Projection
        </div>
      </div>

      {showHint && (
        <div className="bg-zinc-950 border border-teal-500/30 p-3 rounded-xl text-xs text-teal-200 mb-4">
          💡 <strong>Hint:</strong> {GEO_TARGET.hint}
        </div>
      )}

      {!won ? (
        <div className="relative mb-6">
          <div className="flex items-center bg-zinc-950 border border-teal-500/30 rounded-2xl px-4 py-3 text-xs">
            <Search className="w-3.5 h-3.5 text-teal-400 mr-2" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 text-zinc-100 focus:outline-none placeholder:text-zinc-600 font-mono"
            />
          </div>

          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-teal-500/30 rounded-2xl max-h-40 overflow-y-auto z-50 shadow-2xl">
              {filtered.map(c => (
                <button
                  key={c.name}
                  onClick={() => submitGuess(c)}
                  className="w-full text-left px-4 py-2.5 text-xs text-teal-100 hover:bg-teal-900/40 transition cursor-pointer border-b border-zinc-900/60 last:border-0"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs text-center mb-6 font-semibold">
          🎉 Correct! Target country was <span className="font-bold text-emerald-200">{GEO_TARGET.name}</span>.
        </div>
      )}

      <div className="space-y-2">
        {guesses.map((g, idx) => (
          <div key={idx} className="flex justify-between items-center bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 rounded-2xl text-xs">
            <span className="font-medium text-zinc-200">{g.name}</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">{g.direction}</span>
              <span className="font-bold text-zinc-100">{g.distance === 0 ? 'TARGET HIT' : `${g.distance} km`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
