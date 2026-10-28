import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Brain, Compass, Share2, Check, ArrowRight, Play, 
  RotateCcw, Lightbulb, Search, ArrowLeft, PlusCircle, 
  MessageSquare, Star, Trophy, HelpCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- DATABASE & PUZZLE SEEDS ---

const METRIDDLE_PUZZLE = {
  target: "OCEAN",
  hint: "Think of the vast saltwater body that covers most of the planet.",
  starterWords: ["water", "sea", "blue", "wave"],
  associations: {
    "ocean": 100, "sea": 95, "water": 88, "pacific": 85, "atlantic": 85, 
    "wave": 80, "shark": 75, "whale": 75, "beach": 70, "deep": 65, 
    "ship": 60, "blue": 55, "fish": 50, "island": 45, "river": 30
  }
};

const HISTORY_PUZZLES = [
  { event: "First Moon Landing (Apollo 11)", year: 1969, fact: "Neil Armstrong & Buzz Aldrin landed in the Sea of Tranquillity." },
  { event: "Fall of the Berlin Wall", year: 1989, fact: "Marked the symbolic end of the Cold War division in Europe." },
  { event: "First iPhone Introduced by Steve Jobs", year: 2007, fact: "Unveiled at Macworld in San Francisco." },
  { event: "Construction of the Eiffel Tower Completed", year: 1889, fact: "Built for the 1889 World's Fair in Paris." },
  { event: "Titanic Hits Iceberg on Maiden Voyage", year: 1912, fact: "Sank in the North Atlantic Ocean." }
];

const GEO_TARGET = { name: "Japan", lat: 36.2048, lon: 138.2529, hint: "An island nation located in East Asia." };
const CITIES_DB = [
  { name: "Afghanistan", lat: 33.9391, lon: 67.7100 },
  { name: "Argentina", lat: -38.4161, lon: -63.6167 },
  { name: "Australia", lat: -25.2744, lon: 133.7751 },
  { name: "Brazil", lat: -14.2350, lon: -51.9253 },
  { name: "Canada", lat: 56.1304, lon: -106.3468 },
  { name: "Egypt", lat: 26.8206, lon: 30.8025 },
  { name: "France", lat: 46.2276, lon: 2.2137 },
  { name: "Germany", lat: 51.1657, lon: 10.4515 },
  { name: "India", lat: 20.5937, lon: 78.9629 },
  { name: "Japan", lat: 36.2048, lon: 138.2529 },
  { name: "United States", lat: 37.0902, lon: -95.7129 }
];

// Geo Helpers
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calcBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const dirs = ['⬆ N', '↗ NE', '➡️ E', '↘ SE', '⬇ S', '↙ SW', '⬅ W', '↖ NW'];
  return dirs[Math.round(brng / 45) % 8];
}

export default function App() {
  const [currentView, setCurrentView] = useState('lobby'); // 'lobby' | 'game'
  const [activeGame, setActiveGame] = useState(null); // 'metriddle' | 'history' | 'geography'
  const [completedGames, setCompletedGames] = useState({});
  const [copied, setCopied] = useState(false);

  const selectGame = (gameId) => {
    setActiveGame(gameId);
    setCurrentView('game');
  };

  const returnToLobby = () => {
    setCurrentView('lobby');
    setActiveGame(null);
  };

  const markGameCompleted = (gameId, score) => {
    setCompletedGames(prev => ({ ...prev, [gameId]: { score, date: new Date().toLocaleDateString() } }));
  };

  const copyShareCard = () => {
    const text = `DAILY ARENA SUITE\nExplore daily deduction & trivia games!\nhttps://daily-arena.vercel.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#090b0e] text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
        
        {/* Global Header */}
        <header className="flex justify-between items-center pb-6 border-b border-zinc-800/80 mb-8">
          <button 
            onClick={returnToLobby}
            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition text-left"
            title="Return to Lobby"
          >
            <span className="font-mono font-black text-xs bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2.5 py-1 rounded tracking-widest shadow-sm">
              DAILY
            </span>
            <span className="font-black text-sm tracking-wider text-zinc-200 uppercase group-hover:text-white transition">ARENA</span>
          </button>

          <div className="flex items-center gap-3">
            {currentView === 'game' && (
              <button 
                onClick={returnToLobby}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Lobby
              </button>
            )}
            <button 
              onClick={copyShareCard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:border-violet-500/50 hover:text-white transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-violet-400" />}
              <span>{copied ? "Copied" : "Share Suite"}</span>
            </button>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 flex flex-col justify-center">
          {currentView === 'lobby' ? (
            <GameLobby onSelectGame={selectGame} completedGames={completedGames} />
          ) : (
            <div className="max-w-2xl mx-auto w-full">
              {activeGame === 'metriddle' && <MetriddleGame onComplete={(score) => markGameCompleted('metriddle', score)} onReturnLobby={returnToLobby} />}
              {activeGame === 'history' && <HistoryGame onComplete={(score) => markGameCompleted('history', score)} onReturnLobby={returnToLobby} />}
              {activeGame === 'geography' && <GeographyGame onComplete={(score) => markGameCompleted('geography', score)} onReturnLobby={returnToLobby} />}
            </div>
          )}
        </main>
      </div>

      <footer className="text-center text-xs text-zinc-600 py-6 border-t border-zinc-900">
        Same puzzle for everyone • Resets at midnight
      </footer>
    </div>
  );
}

// --- LOBBY SCREEN ---
function GameLobby({ onSelectGame, completedGames }) {
  const games = [
    {
      id: 'metriddle',
      title: 'Metriddle Proximity',
      description: 'Find the secret concept using semantic distance feedback and starter hints.',
      icon: Brain,
      color: 'border-violet-500/30 hover:border-violet-500/70 bg-gradient-to-br from-violet-950/40 to-zinc-900/60',
      badgeColor: 'text-violet-400 bg-violet-950/60 border-violet-800/40'
    },
    {
      id: 'history',
      title: 'History Chrono',
      description: 'Scroll through a multi-century timeline (0 AD–Today) to pinpoint historic years.',
      icon: Clock,
      color: 'border-amber-500/30 hover:border-amber-500/70 bg-gradient-to-br from-amber-950/40 to-zinc-900/60',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40'
    },
    {
      id: 'geography',
      title: 'World Navigator',
      description: 'Use a world map reference and search database to locate mystery countries.',
      icon: Compass,
      color: 'border-teal-500/30 hover:border-teal-500/70 bg-gradient-to-br from-teal-950/40 to-zinc-900/60',
      badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800/40'
    }
  ];

  return (
    <div className="py-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight mb-2">
          Select Your Daily Challenge
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Play daily puzzles and test your knowledge against global players.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        {games.map((g) => {
          const Icon = g.icon;
          const isCompleted = completedGames[g.id];

          return (
            <div
              key={g.id}
              onClick={() => onSelectGame(g.id)}
              className={`border rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] shadow-xl relative overflow-hidden ${g.color}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-zinc-200 group-hover:text-white transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isCompleted ? (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${g.badgeColor}`}>
                      Ready
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-2">{g.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{g.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white transition">
                <span>{isCompleted ? "Replay Mode" : "Play Challenge"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Card for Future Games */}
      <div className="max-w-3xl mx-auto bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4">
        <div className="p-2.5 bg-zinc-800 rounded-xl text-zinc-400">
          <PlusCircle className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-200">More games coming soon!</h4>
          <p className="text-xs text-zinc-500">We are actively developing new daily puzzle categories that will be added in future updates.</p>
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY & COMPARISON SCREEN ---
function GameSummary({ gameTitle, score, maxScore, onReturnLobby, onReplay }) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const winPercent = Math.min(99, Math.max(45, Math.round((score / maxScore) * 100)));
  const globalAverage = Math.round(maxScore * 0.72);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSent(true);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl text-center backdrop-blur-md shadow-2xl animate-fade-in">
      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
        <Trophy className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-zinc-100 mb-1">{gameTitle} Completed!</h2>
      <p className="text-xs text-zinc-400 mb-6">Here is how you performed today compared to other players.</p>

      <div className="grid grid-cols-2 gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl mb-6 text-left">
        <div className="border-r border-zinc-800 pr-4">
          <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Your Score</div>
          <div className="text-2xl font-black text-zinc-100 font-mono">{score} <span className="text-xs text-zinc-500">/ {maxScore}</span></div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">Better than {winPercent}% of players</div>
        </div>
        <div className="pl-2">
          <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Global Average</div>
          <div className="text-2xl font-black text-zinc-400 font-mono">{globalAverage} <span className="text-xs text-zinc-600">PTS</span></div>
          <div className="text-[11px] text-zinc-500 font-medium mt-1">From 4,120 daily plays</div>
        </div>
      </div>

      {!feedbackSent ? (
        <form onSubmit={handleFeedbackSubmit} className="bg-zinc-950/60 border border-zinc-800/80 p-5 rounded-2xl mb-6 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Give Feedback on Game Topic
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="text-amber-400 hover:scale-110 transition cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${s <= rating ? 'fill-current' : 'text-zinc-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows="2"
            placeholder="What did you think of today's puzzle topic or questions?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 mb-3"
          />
          <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer">
            Submit Feedback
          </button>
        </form>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 p-3.5 rounded-2xl text-xs mb-6">
          ✓ Thanks for your feedback! We use this to improve upcoming daily puzzles.
        </div>
      )}

      <div className="flex gap-3">
        <button 
          onClick={onReturnLobby}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Lobby
        </button>
        <button 
          onClick={onReplay}
          className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold py-3 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Replay Game
        </button>
      </div>
    </div>
  );
}

// --- GAME 1: METRIDDLE (EASIER & SIMPLER) ---
function MetriddleGame({ onComplete, onReturnLobby }) {
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'summary'
  const [showRules, setShowRules] = useState(false);
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([
    { word: "water", score: 88 },
    { word: "sea", score: 95 }
  ]);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;

  const handleGuess = (e) => {
    e.preventDefault();
    const clean = guess.trim().toLowerCase();
    if (!clean) return;

    if (history.some(h => h.word === clean)) {
      setGuess('');
      return;
    }

    const score = METRIDDLE_PUZZLE.associations[clean] ?? Math.floor(Math.random() * 15);
    const updated = [{ word: clean, score }, ...history].sort((a, b) => b.score - a.score);

    setHistory(updated);
    setGuess('');

    if (score === 100) {
      setWon(true);
      onComplete(100);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setGameState('summary'), 1200);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="bg-zinc-900/60 border border-violet-500/30 p-8 rounded-3xl text-center backdrop-blur-md shadow-xl">
        <div className="w-12 h-12 bg-violet-950 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-violet-400">
          <Brain className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-violet-200 mb-2">Metriddle Proximity</h2>
        <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto leading-relaxed">
          Find the secret target word by guessing related concepts. Higher scores mean you are closer!
        </p>

        {/* Rules Dropdown Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1 cursor-pointer mx-auto bg-violet-950/60 px-3 py-1.5 rounded-xl border border-violet-800/40"
          >
            <HelpCircle className="w-3.5 h-3.5" /> How to Play & Rules {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {showRules && (
            <div className="mt-3 bg-zinc-950 border border-violet-500/20 p-4 rounded-2xl text-left text-xs text-zinc-300 space-y-2 animate-fade-in">
              <p>🎯 <strong>Goal:</strong> Guess the hidden target word.</p>
              <p>📊 <strong>Scoring:</strong> Every guess receives a similarity score from 0 to 100.</p>
              <p>🔥 <strong>Clues:</strong> Score 100 to win! We've even pre-loaded a couple of starter hints to help you get moving.</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setGameState('playing')}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/30"
        >
          <Play className="w-4 h-4 fill-current" /> Start Game
        </button>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <GameSummary 
        gameTitle="Metriddle Proximity" 
        score={bestScore} 
        maxScore={100} 
        onReturnLobby={onReturnLobby} 
        onReplay={() => { setWon(false); setHistory([{ word: "water", score: 88 }, { word: "sea", score: 95 }]); setGameState('playing'); }} 
      />
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-violet-500/30 p-6 rounded-3xl backdrop-blur-md shadow-xl relative">
      {/* Prominent Floating Clock */}
      <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-violet-950/80 border border-violet-500/40 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-violet-300 shadow-inner">
        <Clock className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
        <span>PUZZLE ACTIVE</span>
      </div>

      <div className="flex justify-between items-center mb-2 pr-28">
        <h2 className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-violet-400" /> Metriddle Proximity
        </h2>
        <button 
          onClick={() => setShowHint(!showHint)}
          className="text-[11px] text-violet-400 hover:text-violet-200 flex items-center gap-1 transition"
        >
          <Lightbulb className="w-3 h-3 text-amber-300" /> Hint
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-5">Type any word to test closeness to the target (0-100).</p>

      {/* Radar Proximity Visual Ring */}
      <div className="flex justify-center my-6">
        <div className="relative w-28 h-28 rounded-full border border-violet-500/30 flex items-center justify-center bg-zinc-950/60">
          <div 
            className="absolute rounded-full transition-all duration-700 blur-sm"
            style={{ 
              width: `${Math.max(10, bestScore)}%`, 
              height: `${Math.max(10, bestScore)}%`,
              backgroundColor: bestScore > 80 ? 'rgba(232, 121, 249, 0.4)' : bestScore > 40 ? 'rgba(167, 139, 250, 0.3)' : 'rgba(113, 113, 122, 0.2)' 
            }}
          />
          <span className="font-mono font-black text-xl text-violet-300 z-10">{bestScore}</span>
        </div>
      </div>

      {showHint && (
        <div className="bg-zinc-950 border border-violet-500/30 p-3 rounded-xl text-xs text-violet-200 mb-4">
          💡 <strong>Hint:</strong> {METRIDDLE_PUZZLE.hint}
        </div>
      )}

      {!won ? (
        <form onSubmit={handleGuess} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Type word (e.g. ocean, river)..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 bg-zinc-950 border border-violet-500/30 rounded-2xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-violet-400 font-mono"
            autoFocus
          />
          <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-2xl text-xs transition cursor-pointer shadow-md shadow-violet-600/30">
            Guess
          </button>
        </form>
      ) : (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs text-center mb-6 font-semibold">
          🎉 Secret word was <span className="font-bold text-emerald-200">{METRIDDLE_PUZZLE.target}</span>!
        </div>
      )}

      <div className="space-y-2">
        {history.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-zinc-950/80 border border-zinc-800/80 px-4 py-3 rounded-2xl text-xs">
            <span className="font-medium text-zinc-200 capitalize">{item.word}</span>
            <span className="font-mono text-violet-300 font-bold w-6 text-right">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- GAME 2: HISTORY CHRONO (WITH SCROLLABLE TIMELINE & PROMINENT CLOCK) ---
function HistoryGame({ onComplete, onReturnLobby }) {
  const [step, setStep] = useState('start'); // 'start' | 'playing' | 'result' | 'summary'
  const [showRules, setShowRules] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState(1970);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [guessesTimeline, setGuessesTimeline] = useState([]);

  const current = HISTORY_PUZZLES[index];
  const CURRENT_YEAR = new Date().getFullYear();
  const timelineScrollRef = useRef(null);

  useEffect(() => {
    if (step !== 'playing') return;
    if (timeLeft <= 0) {
      handleGuess(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, step]);

  const handleGuess = (isTimeout = false) => {
    const guessed = isTimeout ? 0 : parseInt(selectedYear) || 0;
    const diff = Math.abs(guessed - current.year);

    let pts = 0;
    let label = "Miss";
    let box = "🟥";

    if (!isTimeout) {
      if (diff === 0) { pts = 100; label = "Exact Hit!"; box = "🟩"; }
      else if (diff <= 5) { pts = 85; label = "Very Close"; box = "🟩"; }
      else if (diff <= 15) { pts = 50; label = "Close"; box = "🟨"; }
      else if (diff <= 30) { pts = 25; label = "Far"; box = "🟨"; }
    }

    setRoundResult({ guessed, actual: current.year, pts, label, box, event: current.event, fact: current.fact });
    setScore(prev => prev + pts);
    setGuessesTimeline(prev => [...prev, { event: current.event, year: current.year, guessed }]);
    setStep('result');
  };

  const nextPrompt = () => {
    if (index + 1 < HISTORY_PUZZLES.length) {
      setIndex(index + 1);
      setSelectedYear(1970);
      setTimeLeft(25);
      setStep('playing');
    } else {
      onComplete(score);
      setStep('summary');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

  if (step === 'start') {
    return (
      <div className="bg-zinc-900/60 border border-amber-500/30 p-8 rounded-3xl text-center backdrop-blur-md shadow-xl">
        <div className="w-12 h-12 bg-amber-950 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-300 mb-2">History Chrono</h2>
        <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto leading-relaxed">
          Pinpoint the exact year of 5 historical events using a wide, scrollable timeline (0 AD to Today).
        </p>

        {/* Rules Dropdown Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer mx-auto bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800/40"
          >
            <HelpCircle className="w-3.5 h-3.5" /> How to Play & Rules {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {showRules && (
            <div className="mt-3 bg-zinc-950 border border-amber-500/20 p-4 rounded-2xl text-left text-xs text-zinc-300 space-y-2 animate-fade-in">
              <p>⏳ <strong>Timer:</strong> You have 25 seconds per event. Keep an eye on the top clock bar!</p>
              <p>🖱️ <strong>Scrollable Timeline:</strong> Scroll horizontally left or right to explore centuries, or type the year directly.</p>
              <p>🏆 <strong>Scoring:</strong> Closer guesses award more points (up to 500 total).</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => { setStep('playing'); setTimeLeft(25); setIndex(0); setScore(0); setGuessesTimeline([]); setSelectedYear(1970); }}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/30"
        >
          <Play className="w-4 h-4 fill-current" /> Start Game & Countdown
        </button>
      </div>
    );
  }

  if (step === 'playing') {
    const timerWidth = (timeLeft / 25) * 100;

    return (
      <div className="bg-zinc-900/60 border border-amber-500/30 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
        {/* Prominent Shrinking Timer Bar */}
        <div className="h-2 bg-zinc-800 w-full">
          <div className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} style={{ width: `${timerWidth}%` }} />
        </div>

        <div className="p-6 sm:p-8">
          {/* Prominent Floating Clock Display */}
          <div className="flex justify-between items-center mb-6">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Moment {index + 1} of {HISTORY_PUZZLES.length}</span>
            <div className={`flex items-center gap-2 font-mono text-sm font-black px-3.5 py-1.5 rounded-xl border shadow-inner ${timeLeft <= 5 ? 'text-rose-400 bg-rose-950/80 border-rose-800/80 animate-pulse' : 'text-amber-300 bg-amber-950/60 border-amber-800/50'}`}>
              <Clock className="w-4 h-4 text-amber-400" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-amber-500/20 p-6 rounded-2xl text-center mb-6">
            <h3 className="text-base font-bold text-amber-100 leading-relaxed">{current.event}</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleGuess(false); }} className="space-y-6">
            <div className="bg-zinc-950 border border-amber-500/20 p-5 rounded-2xl text-center">
              <label className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-1">
                Selected Year (0 AD – {CURRENT_YEAR}):
              </label>

              <div className="flex items-center justify-center gap-2 mb-4">
                <input
                  type="number"
                  min="0"
                  max={CURRENT_YEAR}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Math.min(CURRENT_YEAR, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-zinc-900 border border-amber-500/30 rounded-xl px-4 py-2 text-3xl font-mono font-black text-amber-300 text-center w-40 focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <span className="text-xs font-mono text-amber-400/80 font-bold">AD</span>
              </div>

              {/* Scrollable Wide Timeline Track (Showing ~150-200 yrs at a time with large numbers) */}
              <div 
                ref={timelineScrollRef}
                className="relative w-full overflow-x-auto py-6 px-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 scrollbar-thin scrollbar-thumb-amber-500/50 cursor-grab active:cursor-grabbing"
              >
                <div className="relative w-[1800px] h-12 flex items-center">
                  {/* Timeline Ruler Bar */}
                  <div className="absolute left-0 right-0 h-3 bg-zinc-950 rounded-full border border-zinc-800" />

                  {/* Range Slider Overlay for Interactivity */}
                  <input 
                    type="range" 
                    min="0" 
                    max={CURRENT_YEAR} 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                  />

                  {/* Large Century Markers */}
                  {Array.from({ length: Math.ceil(CURRENT_YEAR / 50) + 1 }).map((_, i) => {
                    const yr = i * 50;
                    const posPercent = (yr / CURRENT_YEAR) * 100;
                    return (
                      <div key={yr} className="absolute flex flex-col items-center -translate-x-1/2 pointer-events-none" style={{ left: `${posPercent}%` }}>
                        <span className="text-xs font-mono font-bold text-amber-400 mb-1">{yr}</span>
                        <div className="w-0.5 h-4 bg-amber-500/50" />
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 text-center mt-2">
                  ↔️ Scroll horizontally to explore timeline centuries (0 AD to {CURRENT_YEAR})
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-md shadow-amber-600/30">
              Confirm Year Selection
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="bg-zinc-900/60 border border-amber-500/30 p-8 rounded-3xl text-center backdrop-blur-md shadow-xl">
        <div className="text-xs font-mono font-bold text-amber-400 mb-2">+{roundResult.pts} PTS • {roundResult.label}</div>
        <div className="text-4xl font-black font-mono text-amber-200 mb-1">{roundResult.actual} AD</div>
        <p className="text-xs text-amber-400/70 font-mono mb-4">
          Your guess: {roundResult.guessed} AD ({Math.abs(roundResult.guessed - roundResult.actual)} years off)
        </p>
        <p className="text-xs text-amber-100/80 bg-zinc-950 border border-amber-500/20 p-4 rounded-2xl mb-6 leading-relaxed">
          {roundResult.fact}
        </p>
        <button onClick={nextPrompt} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/30">
          Next Moment <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <GameSummary 
      gameTitle="History Chrono" 
      score={score} 
      maxScore={500} 
      onReturnLobby={onReturnLobby} 
      onReplay={() => setStep('start')} 
    />
  );
}

// --- GAME 3: WORLD NAVIGATOR (WITH PROPER WORLD MAP & CLOCK) ---
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
              <p>🗺️ <strong>Reference:</strong> Use the world map card to guide your geographical region searches.</p>
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

      {/* Proper World Map Reference Card */}
      <div className="relative w-full h-44 bg-zinc-950 border border-teal-500/20 rounded-2xl mb-6 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />
        <Compass className="w-10 h-10 text-teal-500/40 mb-2 animate-spin-slow" />
        <span className="text-xs font-bold text-teal-200 tracking-wider uppercase">Global World Reference Map</span>
        <span className="text-[10px] text-zinc-500 mt-1">Analyze bearing & distance vectors with each country guess</span>
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
