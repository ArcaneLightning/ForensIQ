import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  PlayCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { useDebateSessions } from '../hooks/useDebateSessions';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { sessions: practiceSessions, isLoading: practiceLoading } = usePracticeSessions();
  const { sessions: debateSessions, isLoading: debateLoading } = useDebateSessions();

  // Calculate real stats
  const totalSessions = practiceSessions.length + debateSessions.length;
  const averageScore = practiceSessions.length > 0 
    ? Math.round(practiceSessions.reduce((sum, session) => sum + session.analysis.overall_score, 0) / practiceSessions.length)
    : 0;
  
  const practiceHours = practiceSessions.reduce((sum, session) => sum + (session.duration / 3600), 0);
  
  // Calculate improvement rate (comparing last 5 sessions to previous 5)
  const recentSessions = practiceSessions.slice(0, 5);
  const olderSessions = practiceSessions.slice(5, 10);
  const recentAvg = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + s.analysis.overall_score, 0) / recentSessions.length 
    : 0;
  const olderAvg = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + s.analysis.overall_score, 0) / olderSessions.length 
    : recentAvg;
  const improvementRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  const quickStats = [
    {
      icon: Clock,
      label: 'Practice Hours',
      value: practiceHours > 0 ? practiceHours.toFixed(1) : '0',
      change: totalSessions > 0 ? 'Start practicing!' : 'No sessions yet',
      changeType: 'neutral' as const
    },
    {
      icon: Target,
      label: 'Average Score',
      value: averageScore > 0 ? averageScore.toString() : '0',
      change: improvementRate !== 0 ? `${improvementRate >= 0 ? '+' : ''}${improvementRate}%` : 'No data yet',
      changeType: improvementRate >= 0 ? 'positive' as const : 'negative' as const
    },
    {
      icon: TrendingUp,
      label: 'Total Sessions',
      value: totalSessions.toString(),
      change: totalSessions > 0 ? 'Keep it up!' : 'Start your first session',
      changeType: 'neutral' as const
    },
    {
      icon: Award,
      label: 'This Week',
      value: '0', // Would need to calculate based on created_at dates
      change: 'No sessions this week',
      changeType: 'neutral' as const
    }
  ];

  // Get recent sessions (mix of practice and debate)
  const allSessions = [
    ...practiceSessions.map(s => ({
      id: s.id,
      type: 'Speech Practice',
      topic: s.topic,
      score: s.analysis.overall_score,
      date: new Date(s.created_at).toLocaleDateString(),
      duration: `${Math.round(s.duration / 60)} min`,
      feedback: s.analysis.insights[0]?.description || 'Session completed'
    })),
    ...debateSessions.map(s => ({
      id: s.id,
      type: 'Debate Training',
      topic: s.topic,
      score: s.user_score,
      date: new Date(s.created_at).toLocaleDateString(),
      duration: `${Math.round(s.duration / 60)} min`,
      feedback: s.user_score > s.ai_score ? 'You won this debate!' : 'Good effort, keep practicing!'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  if (practiceLoading || debateLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to ForensIQ, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          {totalSessions === 0 
            ? "Ready to start your speaking journey? Begin with your first practice session below."
            : "Ready to continue improving your speaking skills? Let's review your progress."
          }
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.changeType === 'positive' ? 'bg-emerald-100' : 'bg-blue-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.changeType === 'positive' ? 'text-emerald-600' : 'text-blue-600'
                }`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-sm ${
                stat.changeType === 'positive' ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
            {allSessions.length > 0 && (
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            )}
          </div>
          <div className="space-y-4">
            {allSessions.length > 0 ? (
              allSessions.map((session) => (
                <div key={session.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{session.type}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Score: {session.score}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{session.topic}</h3>
                      <p className="text-sm text-gray-600 mb-2">{session.feedback}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No sessions yet. Start practicing to see your progress!</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Your First Session
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Getting Started / Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {totalSessions === 0 ? 'Getting Started' : 'Practice Tips'}
            </h2>
          </div>
          <div className="space-y-4">
            {totalSessions === 0 ? (
              <>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">1. Choose a Topic</h3>
                  <p className="text-sm text-gray-600">Select from our curated topics or create your own</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">2. Record Your Speech</h3>
                  <p className="text-sm text-gray-600">Practice speaking for 2-5 minutes on your chosen topic</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">3. Get AI Feedback</h3>
                  <p className="text-sm text-gray-600">Receive detailed analysis on clarity, pace, and delivery</p>
                </div>
              </>
            ) : (
              <>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">Practice Regularly</h3>
                  <p className="text-sm text-gray-600">Aim for 3-4 sessions per week for best results</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">Try Different Topics</h3>
                  <p className="text-sm text-gray-600">Challenge yourself with various subjects</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">Review Your Progress</h3>
                  <p className="text-sm text-gray-600">Check analytics to track improvement</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-6 text-white"
      >
        <h2 className="text-xl font-semibold mb-4">
          {totalSessions === 0 ? 'Start Your Journey' : 'Continue Your Practice'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/30 transition-colors">
            <PlayCircle className="w-8 h-8 mb-2" />
            <h3 className="font-medium mb-1">Start Practice</h3>
            <p className="text-sm opacity-90">Begin a new speech session</p>
          </button>
          <button className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/30 transition-colors">
            <Users className="w-8 h-8 mb-2" />
            <h3 className="font-medium mb-1">Debate AI</h3>
            <p className="text-sm opacity-90">Challenge our AI opponent</p>
          </button>
          <button className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/30 transition-colors">
            <BarChart3 className="w-8 h-8 mb-2" />
            <h3 className="font-medium mb-1">View Analytics</h3>
            <p className="text-sm opacity-90">Track your progress</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;