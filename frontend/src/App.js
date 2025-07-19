import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import AdComponents from './components/AdComponents';
import UpgradePrompt from './components/UpgradePrompt';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Auth Context
const AuthContext = React.createContext();

function App() {
  // State management
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('chapters');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReciter, setCurrentReciter] = useState('7'); // Mishary Alafasy
  const [reciters, setReciters] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', username: '', password: '' });
  
  // Audio ref
  const audioRef = useRef(null);

  // Check for saved token on component mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    }
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginForm);
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerForm);
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setRegisterForm({ email: '', username: '', password: '' });
      setIsRegistering(false);
    } catch (error) {
      setError(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentView('chapters');
  };

  // Data fetching functions
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/quran/chapters`);
      setChapters(response.data);
    } catch (error) {
      setError('Failed to fetch chapters');
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerses = async (chapterId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/quran/chapter/${chapterId}/verses`);
      setVerses(response.data);
      setCurrentVerse(0);
    } catch (error) {
      setError('Failed to fetch verses');
      console.error('Error fetching verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReciters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quran/reciters`);
      setReciters(response.data);
    } catch (error) {
      console.error('Error fetching reciters:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/learning/progress`);
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Audio functions
  const playAudio = async (chapterId, verseNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/quran/verse/${chapterId}/${verseNumber}/audio?reciter=${currentReciter}`
      );
      
      if (response.data.audio_url) {
        if (audioRef.current) {
          audioRef.current.src = response.data.audio_url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Learning session tracking
  const createLearningSession = async (chapterId, verseNumber, sessionType = 'reading', duration = 15) => {
    if (!user) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/learning/session`, {
        surah_number: chapterId,
        ayah_number: verseNumber,
        session_type: sessionType,
        duration_minutes: duration
      });
      
      // Refresh user data to show updated XP
      fetchUserProfile();
    } catch (error) {
      console.error('Error creating learning session:', error);
    }
  };

  // Premium access check
  const hasChapterAccess = (chapter) => {
    if (!user) return false;
    if (user.is_premium) return true;
    
    // Free users can access first 3 beginner chapters
    const beginnerChapters = chapters.filter(ch => ch.difficulty_level === 'beginner').slice(0, 3);
    return beginnerChapters.some(ch => ch.id === chapter.id);
  };

  const hasReciterAccess = (reciterId) => {
    if (!user) return false;
    if (user.is_premium) return true;
    
    // Free users can only use Mishary Alafasy (reciter 7)
    return reciterId === '7';
  };

  // Load initial data
  useEffect(() => {
    fetchChapters();
    fetchReciters();
  }, []);

  useEffect(() => {
    if (currentView === 'leaderboard') {
      fetchLeaderboard();
    } else if (currentView === 'progress') {
      fetchUserProgress();
    }
  }, [currentView, user]);

  // Show upgrade prompt for free users occasionally
  useEffect(() => {
    if (user && !user.is_premium) {
      const shouldShow = Math.random() < 0.3; // 30% chance
      if (shouldShow) {
        setTimeout(() => setShowUpgradePrompt(true), 5000); // Show after 5 seconds
      }
    }
  }, [user, currentView]);

  // Handle chapter selection
  const handleChapterSelect = (chapter) => {
    if (!hasChapterAccess(chapter)) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setSelectedChapter(chapter);
    setCurrentView('verses');
    fetchVerses(chapter.id);
    
    // Track learning session
    if (user) {
      createLearningSession(chapter.id, 1);
    }
  };

  // Navigation handlers
  const goToNextVerse = () => {
    if (currentVerse < verses.length - 1) {
      setCurrentVerse(currentVerse + 1);
    }
  };

  const goToPrevVerse = () => {
    if (currentVerse > 0) {
      setCurrentVerse(currentVerse - 1);
    }
  };

  // Check if user is premium
  const isPremium = user?.is_premium || false;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Quran Journey</h1>
            <p className="text-gray-600">Learn the Quran with audio recitation and gamification</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Welcome Back</h2>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Create Account</h2>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={3}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with letters and numbers</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isPremium }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">My Quran Journey</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* User info */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.username}</span>
                  <span className="ml-2">Level {user.level}</span>
                  <span className="ml-2">{user.experience_points} XP</span>
                  {isPremium && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      Premium
                    </span>
                  )}
                </div>
                
                {/* Premium upgrade button for free users */}
                {!isPremium && (
                  <button
                    onClick={() => setShowUpgradePrompt(true)}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-yellow-500 hover:to-yellow-700 transition duration-300"
                  >
                    Upgrade to Premium
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView('chapters')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'chapters'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Chapters
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'leaderboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setCurrentView('progress')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Progress
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {currentView === 'chapters' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quran Chapters</h2>
              
              {/* Ad banner for free users */}
              {!isPremium && (
                <div className="mb-6">
                  <AdComponents adType="banner" />
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading chapters...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chapters.map((chapter) => {
                    const hasAccess = hasChapterAccess(chapter);
                    return (
                      <div
                        key={chapter.id}
                        className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition duration-300 ${
                          hasAccess
                            ? 'hover:shadow-lg hover:scale-105'
                            : 'opacity-60 bg-gray-100'
                        }`}
                        onClick={() => handleChapterSelect(chapter)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {chapter.id}. {chapter.name_simple}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 arabic-text">
                              {chapter.name_arabic}
                            </p>
                          </div>
                          {!hasAccess && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{chapter.verses_count} verses</span>
                          <span className={`px-2 py-1 rounded ${
                            chapter.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                            chapter.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {chapter.difficulty_level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentView === 'verses' && selectedChapter && (
            <div className="px-4 py-6 sm:px-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <button
                    onClick={() => setCurrentView('chapters')}
                    className="text-blue-600 hover:text-blue-800 mb-2"
                  >
                    ← Back to Chapters
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedChapter.name_simple}
                  </h2>
                  <p className="text-gray-600 arabic-text text-lg">
                    {selectedChapter.name_arabic}
                  </p>
                </div>
                
                {/* Reciter Selection */}
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Reciter
                  </label>
                  <select
                    value={currentReciter}
                    onChange={(e) => setCurrentReciter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {reciters.map((reciter) => (
                      <option
                        key={reciter.id}
                        value={reciter.id}
                        disabled={!hasReciterAccess(reciter.id)}
                      >
                        {reciter.name} {!hasReciterAccess(reciter.id) ? '(Premium)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ad banner between verses for free users */}
              {!isPremium && currentVerse > 0 && currentVerse % 5 === 0 && (
                <div className="mb-6">
                  <AdComponents adType="banner" />
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading verses...</p>
                </div>
              ) : verses.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8">
                  <div className="text-center mb-8">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      Verse {currentVerse + 1} of {verses.length}
                    </span>
                  </div>

                  <div className="space-y-8">
                    {/* Arabic Text */}
                    <div className="text-center">
                      <p className="arabic-text text-3xl leading-relaxed text-gray-800 mb-4">
                        {verses[currentVerse]?.text_uthmani}
                      </p>
                    </div>

                    {/* Transliteration */}
                    <div className="text-center border-t pt-6">
                      <h4 className="font-medium text-gray-700 mb-2">Transliteration:</h4>
                      <p className="text-lg text-gray-600 italic">
                        {verses[currentVerse]?.transliteration}
                      </p>
                    </div>

                    {/* Translation */}
                    <div className="text-center border-t pt-6">
                      <h4 className="font-medium text-gray-700 mb-2">Translation:</h4>
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {verses[currentVerse]?.translation}
                      </p>
                    </div>

                    {/* Audio Controls */}
                    <div className="text-center border-t pt-6">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => playAudio(selectedChapter.id, verses[currentVerse]?.verse_number)}
                          disabled={!hasReciterAccess(currentReciter)}
                          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlaying ? 'Playing...' : 'Play Audio'}
                        </button>
                        <button
                          onClick={pauseAudio}
                          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300"
                        >
                          Pause
                        </button>
                      </div>
                      {!hasReciterAccess(currentReciter) && (
                        <p className="text-sm text-gray-500 mt-2">
                          Premium required for this reciter
                        </p>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center border-t pt-6">
                      <button
                        onClick={goToPrevVerse}
                        disabled={currentVerse === 0}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <span className="text-gray-600">
                        {currentVerse + 1} / {verses.length}
                      </span>
                      
                      <button
                        onClick={goToNextVerse}
                        disabled={currentVerse === verses.length - 1}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No verses found for this chapter.</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'leaderboard' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>
              
              {/* Ad banner for free users */}
              {!isPremium && (
                <div className="mb-6">
                  <AdComponents adType="banner" />
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-md">
                {leaderboard.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                            entry.rank === 1 ? 'bg-yellow-500' :
                            entry.rank === 2 ? 'bg-gray-400' :
                            entry.rank === 3 ? 'bg-orange-600' :
                            'bg-blue-500'
                          }`}>
                            {entry.rank}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{entry.username}</p>
                            <p className="text-sm text-gray-500">Level {entry.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{entry.experience_points} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No leaderboard data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'progress' && (
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Progress</h2>
              
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Current Level</h3>
                  <p className="text-3xl font-bold text-blue-600">{user.level}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Experience Points</h3>
                  <p className="text-3xl font-bold text-green-600">{user.experience_points}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Streak Days</h3>
                  <p className="text-3xl font-bold text-orange-600">{user.streak_days}</p>
                </div>
              </div>

              {/* Ad banner for free users */}
              {!isPremium && (
                <div className="mb-6">
                  <AdComponents adType="banner" />
                </div>
              )}

              {/* Progress Details */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Progress</h3>
                  {userProgress.length > 0 ? (
                    <div className="space-y-4">
                      {userProgress.slice(0, 10).map((progress, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">Chapter {progress.surah_number}, Verse {progress.ayah_number}</p>
                            <p className="text-sm text-gray-500">
                              {progress.completed ? 'Completed' : 'In Progress'} • 
                              {progress.experience_gained} XP gained
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            progress.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {progress.difficulty_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No learning progress recorded yet. Start reading to track your progress!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onError={() => setIsPlaying(false)}
        />

        {/* Upgrade Prompt Modal */}
        <UpgradePrompt
          isVisible={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          user={user}
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
