import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Clock,
  Trophy,
  Target,
  Zap
} from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  points?: number;
}

const DebateSimulator: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [debateActive, setDebateActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const debateTopics = [
    'Artificial Intelligence should be regulated by government',
    'Social media has a net negative impact on society',
    'Universal Basic Income should be implemented globally',
    'Climate change action should prioritize economic growth',
    'Privacy is more important than security',
    'Remote work is better than office work',
    'Cryptocurrency should replace traditional currency',
    'Space exploration funding should be increased'
  ];

  const startDebate = () => {
    if (!selectedTopic) return;
    
    setDebateActive(true);
    setMessages([{
      id: 1,
      sender: 'ai',
      content: `I'll argue against "${selectedTopic}". You'll have the pro position. Let's begin with your opening statement. You have 2 minutes to make your case.`,
      timestamp: new Date()
    }]);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endDebate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endDebate = () => {
    setDebateActive(false);
    // Add final AI message
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'ai',
      content: "Time's up! Great debate. Let me analyze your performance and provide feedback.",
      timestamp: new Date()
    }]);
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || !debateActive) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: currentMessage,
      timestamp: new Date(),
      points: Math.floor(Math.random() * 20) + 70 // Random score 70-90
    };

    setMessages(prev => [...prev, userMessage]);
    setUserScore(prev => prev + (userMessage.points || 0));
    setCurrentMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's an interesting point, but consider this counterargument: The potential risks often outweigh the benefits in this scenario.",
        "I understand your perspective, however, the data suggests a different conclusion. Let me present evidence to the contrary.",
        "While your argument has merit, there are several flaws in that reasoning that I'd like to address.",
        "That's a compelling argument, but have you considered the long-term implications of that approach?",
        "I can see the logic in your statement, but let me challenge that assumption with real-world examples."
      ];

      const aiMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        points: Math.floor(Math.random() * 15) + 75 // Random score 75-90
      };

      setMessages(prev => [...prev, aiMessage]);
      setAiScore(prev => prev + (aiMessage.points || 0));
    }, 2000);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Debate Simulator</h1>
        <p className="text-gray-600">
          Challenge our AI in structured debates to sharpen your argumentation skills and quick thinking.
        </p>
      </motion.div>

      {!debateActive && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose Your Debate Topic</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a topic below to begin your debate with our AI opponent. You'll have 5 minutes to present your arguments and counter the AI's points.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid gap-3 mb-8">
              {debateTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedTopic === topic
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startDebate}
                disabled={!selectedTopic}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Debate
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {debateActive && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Debate Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"
            style={{ height: '600px' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Debate Topic</h2>
                  <p className="text-sm text-gray-600">{selectedTopic}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-lg font-semibold text-gray-900">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <button
                    onClick={endDebate}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    End Debate
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl flex items-start space-x-3 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg p-4 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p>{message.content}</p>
                        {message.points && (
                          <div className="mt-2 text-xs opacity-75">
                            Score: {message.points} points
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your argument..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Score Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Live Score</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">You</span>
                  <span className="text-xl font-bold text-blue-600">{userScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Opponent</span>
                  <span className="text-xl font-bold text-purple-600">{aiScore}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span>Tips</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Present clear, logical arguments</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Use evidence to support your points</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Address counterarguments</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Stay respectful and professional</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Results Panel */}
      {!debateActive && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Debate Complete!</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Score</h3>
              <p className="text-3xl font-bold text-blue-600">{userScore}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Score</h3>
              <p className="text-3xl font-bold text-purple-600">{aiScore}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600 mb-6">
              {userScore > aiScore 
                ? "Congratulations! You won this debate!" 
                : userScore === aiScore 
                ? "It's a tie! Great debate on both sides." 
                : "The AI won this round, but you put up a great fight!"
              }
            </p>
            <button
              onClick={() => {
                setMessages([]);
                setUserScore(0);
                setAiScore(0);
                setTimeLeft(300);
                setSelectedTopic('');
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start New Debate
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DebateSimulator;