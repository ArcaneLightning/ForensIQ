import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  PlayCircle, 
  StopCircle, 
  Clock,
  Activity,
  Volume2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { analyzeSpeech, transcribeAudio } from '../services/speechAnalysis';

const Practice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { createSession, isLoading } = usePracticeSessions();

  const practiceTopics = [
    'The Impact of Artificial Intelligence on Society',
    'Climate Change and Environmental Policy',
    'The Future of Remote Work',
    'Digital Privacy in the Modern Age',
    'The Role of Social Media in Democracy',
    'Healthcare Reform and Universal Access',
    'Education Technology and Learning',
    'Economic Inequality and Solutions'
  ];

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleAnalyzeSpeech = async () => {
    if (!audioBlob || !selectedTopic) {
      alert('Please select a topic and record your speech first.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Transcribe audio (mock service)
      const transcript = await transcribeAudio(audioBlob);
      
      // Analyze speech
      const analysis = await analyzeSpeech(audioBlob, transcript);
      
      // Save session to database
      const session = await createSession({
        topic: selectedTopic,
        duration: recordingTime,
        transcript,
        analysis
      });

      if (session) {
        setAnalysisResult(analysis);
      }
    } catch (error) {
      console.error('Error analyzing speech:', error);
      alert('Failed to analyze speech. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    setHasRecording(false);
    setAudioBlob(null);
    setAnalysisResult(null);
    setRecordingTime(0);
    setSelectedTopic('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Speech Practice</h1>
        <p className="text-gray-600">
          Practice your speeches and get AI-powered feedback on your delivery, tone, and technique.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recording Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-gray-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Practice Session</h2>
            
            {/* Topic Selection */}
            {!analysisResult && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose a topic or enter your own:
                </label>
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  disabled={isRecording}
                >
                  <option value="">Select a topic...</option>
                  {practiceTopics.map((topic, index) => (
                    <option key={index} value={topic}>{topic}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter your own topic..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={isRecording}
                />
              </div>
            )}

            {/* Recording Controls */}
            {!analysisResult && (
              <div className="relative">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-100 animate-pulse' 
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}>
                  {isRecording ? (
                    <MicOff 
                      className="w-16 h-16 text-red-600 cursor-pointer" 
                      onClick={handleStopRecording}
                    />
                  ) : (
                    <Mic 
                      className="w-16 h-16 text-blue-600 cursor-pointer" 
                      onClick={handleStartRecording}
                      style={{ opacity: selectedTopic ? 1 : 0.5 }}
                    />
                  )}
                </div>

                {/* Recording Timer */}
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-mono text-gray-900">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}

                {/* Waveform Visualization */}
                {isRecording && (
                  <div className="flex items-center justify-center space-x-1 mb-6">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-500 rounded animate-pulse"
                        style={{
                          height: `${Math.random() * 40 + 10}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                <p className="text-gray-600 mb-6">
                  {isRecording 
                    ? 'Recording... Click the microphone to stop' 
                    : selectedTopic
                    ? 'Click the microphone to start recording your speech'
                    : 'Please select a topic first'
                  }
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  {!isRecording && hasRecording && (
                    <>
                      <button 
                        onClick={handleAnalyzeSpeech}
                        disabled={isAnalyzing || isLoading}
                        className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-5 h-5" />
                            <span>Analyze Speech</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleNewSession}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span>New Session</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="text-left">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                  <button 
                    onClick={handleNewSession}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Session
                  </button>
                </div>
                
                {/* Overall Score */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysisResult.overall_score / 100)}`}
                        className="text-emerald-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{analysisResult.overall_score}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                  <p className="text-gray-600">Great performance! Keep practicing to improve.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {Object.entries(analysisResult).filter(([key]) => 
                    ['clarity', 'pace', 'volume', 'tone_variety', 'filler_words', 'engagement'].includes(key)
                  ).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-lg font-bold text-gray-900">{value as number}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${value as number}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    <div className="space-y-3">
                      {analysisResult.insights.map((insight: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          {insight.type === 'positive' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Practice Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Tips</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Volume2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Vocal Variety</h4>
                <p className="text-sm text-gray-600">Vary your pitch, pace, and volume to keep your audience engaged.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Pacing</h4>
                <p className="text-sm text-gray-600">Speak at a moderate pace and use pauses for emphasis.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Clarity</h4>
                <p className="text-sm text-gray-600">Articulate clearly and avoid mumbling or speaking too quickly.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Practice;