import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles, Upload, Download } from 'lucide-react';

const MusicVideoGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [musicOption, setMusicOption] = useState('basic');
  const [videoOption, setVideoOption] = useState('random');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEnhancements, setShowEnhancements] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  
  const [formData, setFormData] = useState({
    // Customer Information
    name: '',
    age: '',
    email: '',
    
    // Basic Music Options
    songArtist: '',
    tone: '',
    lyricsIdea: '',
    vocalGender: '',
    targetAudience: '',
    additionalRequests: '',
    
    // Advanced Music Options
    genre: '',
    vocalStyle: '',
    moodEnergy: '',
    instruments: [],
    musicTone: '',
    productionEffects: [],
    advancedNotes: '',
    
    // Video Information
    customVideoPrompt: '',
    screenTime: 2,
    uploadedImages: []
  });

  const [suggestions] = useState([
    "A dreamy landscape with floating musical notes and vibrant colors that pulse with the beat",
    "Abstract geometric shapes morphing and dancing in sync with the rhythm",
    "A journey through different seasons with nature scenes that match the song's mood",
    "Urban cityscape at night with neon lights that respond to the music's energy",
    "Underwater world with sea creatures moving gracefully to the melody"
  ]);

  const [enhancements] = useState([
    "Add cinematic lighting effects and dramatic camera angles",
    "Include particle effects and magical sparkles throughout the scenes",
    "Incorporate vintage film grain and retro color grading",
    "Add dynamic motion blur and speed ramping effects",
    "Include ethereal glow effects and soft focus transitions"
  ]);

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Reggae', 'Blues', 'Metal', 'Folk', 'Disco', 'Funk', 'Soul', 'Punk', 'Ambient', 'World', 'Latin', 'EDM'];
  
  const vocalStyles = ['Belting', 'Falsetto', 'Whispered', 'Spoken-Word', 'Rap', 'Harmonized', 'Melismatic', 'Staccato', 'Legato', 'Gritty'];
  
  const moods = ['Uplifting', 'Melancholic', 'Energetic', 'Chill', 'Dark', 'Bright', 'Tense', 'Relaxed', 'Euphoric', 'Introspective'];
  
  const instruments = ['Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Piano', 'Synthesizer', 'Drums', 'Percussion', 'Violin', 'Cello', 'Cow Bell', 'Double Bass', 'Saxophone', 'Trumpet', 'Trombone', 'Ukulele', 'Bagpipes', 'Steel Drums', 'Harp', 'Banjo', 'Theremin'];
  
  const tones = ['Warm', 'Bright', 'Dark', 'Airy', 'Gritty', 'Raw', 'Polished', 'Ethereal', 'Vintage', 'Modern', 'Minimalistic', 'Cinematic', 'Organic', 'Synthetic', 'Dreamy'];
  
  const effects = ['Reverb', 'Echo', 'Delay', 'Chorus', 'Distortion', 'Overdrive', 'EQ (Equalization)', 'Compression', 'Auto-Tune', 'Wah-Wah', 'Tremolo', 'Pitch Shift', 'Vocoder', 'Sidechain', 'Filter Sweep', 'Fade In', 'Fade Out', 'Reverse', 'Build-Up', 'Drop'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...files]
    }));
  };

  const generateJSON = () => {
    const output = {
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.name,
        age: formData.age,
        email: formData.email
      },
      music: musicOption === 'basic' ? {
        type: 'basic',
        songArtist: formData.songArtist,
        tone: formData.tone,
        lyricsIdea: formData.lyricsIdea,
        vocalGender: formData.vocalGender,
        targetAudience: formData.targetAudience,
        additionalRequests: formData.additionalRequests
      } : {
        type: 'advanced',
        genre: formData.genre,
        vocalStyle: formData.vocalStyle,
        moodEnergy: formData.moodEnergy,
        instruments: formData.instruments,
        tone: formData.musicTone,
        productionEffects: formData.productionEffects,
        notes: formData.advancedNotes
      },
      video: {
        type: videoOption,
        prompt: videoOption === 'custom' ? formData.customVideoPrompt : null,
        screenTime: formData.screenTime,
        uploadedImages: videoOption === 'personal' ? formData.uploadedImages.length : null
      }
    };
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `music_video_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFormValid = () => {
    return formData.name && formData.age && formData.email && 
           (musicOption === 'basic' ? formData.tone : formData.genre) &&
           (videoOption !== 'custom' || formData.customVideoPrompt) &&
           (videoOption !== 'personal' || uploadedImages.length >= 24);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Music Video Generator</h1>
          <p className="text-purple-200">Create amazing music videos with AI</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className={`flex items-center ${step <= currentStep ? 'text-purple-300' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-purple-600' : 'bg-gray-600'
                }`}>
                  {step}
                </div>
                <span className="ml-2 hidden sm:inline">
                  {step === 1 ? 'Customer Info' : step === 2 ? 'Music Options' : 'Video Options'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          {/* Step 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your age"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.name || !formData.age || !formData.email}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Next: Music Options
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Music Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Music Information</h2>
              
              {/* Music Option Toggle */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setMusicOption('basic')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    musicOption === 'basic' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Basic Option
                </button>
                <button
                  onClick={() => setMusicOption('advanced')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    musicOption === 'advanced' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Advanced Option
                </button>
              </div>

              {/* Basic Music Options */}
              {musicOption === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Song/Artist to Mimic</label>
                    <input
                      type="text"
                      value={formData.songArtist}
                      onChange={(e) => handleInputChange('songArtist', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Taylor Swift, The Beatles, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Overall Tone *</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => handleInputChange('tone', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select tone</option>
                      <option value="happy">Happy</option>
                      <option value="sad">Sad</option>
                      <option value="excited">Excited</option>
                      <option value="morose">Morose</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Idea for Lyrics</label>
                    <textarea
                      value={formData.lyricsIdea}
                      onChange={(e) => handleInputChange('lyricsIdea', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                      placeholder="Leave blank for instrumental"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Vocal Gender</label>
                    <select
                      value={formData.vocalGender}
                      onChange={(e) => handleInputChange('vocalGender', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Target Audience Age</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select age group</option>
                      <option value="under-6">Under 6</option>
                      <option value="6-12">6-12</option>
                      <option value="13-18">13-18</option>
                      <option value="18+">18+</option>
                      <option value="all-ages">All Ages</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Additional Requests</label>
                    <textarea
                      value={formData.additionalRequests}
                      onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                      placeholder="Any specific requests for your music"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Music Options */}
              {musicOption === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Genre *</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Vocal Style</label>
                    <select
                      value={formData.vocalStyle}
                      onChange={(e) => handleInputChange('vocalStyle', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select vocal style</option>
                      {vocalStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Mood & Energy</label>
                    <select
                      value={formData.moodEnergy}
                      onChange={(e) => handleInputChange('moodEnergy', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select mood</option>
                      {moods.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Highlighted Instruments</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-white/10 p-4 rounded-lg">
                      {instruments.map(instrument => (
                        <label key={instrument} className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={formData.instruments.includes(instrument)}
                            onChange={() => handleArrayChange('instruments', instrument)}
                            className="rounded"
                          />
                          <span className="text-sm">{instrument}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Tone</label>
                    <select
                      value={formData.musicTone}
                      onChange={(e) => handleInputChange('musicTone', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select tone</option>
                      {tones.map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Production & Effects</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-white/10 p-4 rounded-lg">
                      {effects.map(effect => (
                        <label key={effect} className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={formData.productionEffects.includes(effect)}
                            onChange={() => handleArrayChange('productionEffects', effect)}
                            className="rounded"
                          />
                          <span className="text-sm">{effect}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Additional Notes</label>
                    <textarea
                      value={formData.advancedNotes}
                      onChange={(e) => handleInputChange('advancedNotes', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                      placeholder="Any additional notes about your music"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={musicOption === 'basic' ? !formData.tone : !formData.genre}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Next: Video Options
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Video Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Video Information</h2>
              
              {/* Video Option Toggle */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setVideoOption('random')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    videoOption === 'random' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Random
                </button>
                <button
                  onClick={() => setVideoOption('custom')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    videoOption === 'custom' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Custom
                </button>
                <button
                  onClick={() => setVideoOption('personal')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    videoOption === 'personal' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Personal
                </button>
              </div>

              {/* Video Options Content */}
              {videoOption === 'random' && (
                <div className="bg-white/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Random Video Generation</h3>
                  <p className="text-purple-200">Let the AI have some fun and create random (and interesting) images to match your song!</p>
                </div>
              )}

              {videoOption === 'custom' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Describe your video vision *</label>
                    <textarea
                      value={formData.customVideoPrompt}
                      onChange={(e) => handleInputChange('customVideoPrompt', e.target.value)}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                      placeholder="Describe the kind of images you'd like to see in your music video..."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Suggestions</span>
                      {showSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => setShowEnhancements(!showEnhancements)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Enhance</span>
                      {showEnhancements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {showSuggestions && (
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">AI Suggestions</h4>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleInputChange('customVideoPrompt', suggestion)}
                            className="w-full text-left p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {showEnhancements && (
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Enhancement Options</h4>
                      <div className="space-y-2">
                        {enhancements.map((enhancement, index) => (
                          <button
                            key={index}
                            onClick={() => handleInputChange('customVideoPrompt', formData.customVideoPrompt + ' ' + enhancement)}
                            className="w-full text-left p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          >
                            {enhancement}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {videoOption === 'personal' && (
                <div className="space-y-6">
                  <div className="bg-yellow-100/20 p-4 rounded-lg border border-yellow-500/50">
                    <p className="text-yellow-200">
                      <strong>Note:</strong> With an average song length of 180 seconds, please be prepared to provide 24 pictures with the same orientation.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Upload Your Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    />
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 p-4 bg-white/10 rounded-lg">
                        <p className="text-white">
                          Uploaded: {uploadedImages.length} images
                          {uploadedImages.length < 24 && (
                            <span className="text-yellow-300 ml-2">
                              (Need {24 - uploadedImages.length} more)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-white mb-2">Screen Time (seconds per image)</label>
                <select
                  value={formData.screenTime}
                  onChange={(e) => handleInputChange('screenTime', parseInt(e.target.value))}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 second</option>
                  <option value={2}>2 seconds</option>
                  <option value={4}>4 seconds</option>
                  <option value={8}>8 seconds</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={generateJSON}
                  disabled={!isFormValid()}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicVideoGenerator;
                