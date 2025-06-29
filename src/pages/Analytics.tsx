import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  Mic,
  MessageSquare,
  Clock,
  Target,
  Award,
  Volume2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { useDebateSessions } from '../hooks/useDebateSessions';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  
  const { sessions: practiceSessions, isLoading: practiceLoading } = usePracticeSessions();
  const { sessions: debateSessions, isLoading: debateLoading } = useDebateSessions();

  // Calculate real performance data from sessions
  const performanceData = practiceSessions
    .slice(0, 7) // Last 7 sessions
    .reverse()
    .map((session, index) => ({
      date: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: session.analysis.overall_score,
      clarity: session.analysis.clarity,
      pace: session.analysis.pace,
      volume: session.analysis.volume,
      engagement: session.analysis.engagement
    }));

  // Calculate session type distribution
  const totalSessions = practiceSessions.length + debateSessions.length;
  const sessionTypeData = totalSessions > 0 ? [
    { 
      name: 'Speech Practice', 
      value: Math.round((practiceSessions.length / totalSessions) * 100), 
      color: '#3B82F6' 
    },
    { 
      name: 'Debate Training', 
      value: Math.round((debateSessions.length / totalSessions) * 100), 
      color: '#10B981' 
    }
  ] : [];

  // Calculate skills radar data from recent sessions
  const recentSessions = practiceSessions.slice(0, 5);
  const skillsRadarData = recentSessions.length > 0 ? [
    { 
      skill: 'Clarity', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.clarity, 0) / recentSessions.length),
      target: 95 
    },
    { 
      skill: 'Pace', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.pace, 0) / recentSessions.length),
      target: 90 
    },
    { 
      skill: 'Volume', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.volume, 0) / recentSessions.length),
      target: 92 
    },
    { 
      skill: 'Engagement', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.engagement, 0) / recentSessions.length),
      target: 90 
    },
    { 
      skill: 'Tone Variety', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.tone_variety, 0) / recentSessions.length),
      target: 93 
    },
    { 
      skill: 'Filler Words', 
      current: Math.round(recentSessions.reduce((sum, s) => sum + s.analysis.filler_words, 0) / recentSessions.length),
      target: 88 
    }
  ] : [];

  // Calculate weekly sessions data
  const weeklySessionsData = [];
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekSessions = practiceSessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });
    
    const avgScore = weekSessions.length > 0 
      ? Math.round(weekSessions.reduce((sum, s) => sum + s.analysis.overall_score, 0) / weekSessions.length)
      : 0;
    
    weeklySessionsData.push({
      week: `Week ${6 - i}`,
      sessions: weekSessions.length,
      avgScore
    });
  }

  // Calculate topics analysis from practice sessions
  const topicsMap = new Map();
  practiceSessions.forEach(session => {
    if (topicsMap.has(session.topic)) {
      const existing = topicsMap.get(session.topic);
      existing.sessions += 1;
      existing.totalScore += session.analysis.overall_score;
    } else {
      topicsMap.set(session.topic, {
        topic: session.topic,
        sessions: 1,
        totalScore: session.analysis.overall_score
      });
    }
  });

  const topicsAnalysis = Array.from(topicsMap.values())
    .map(topic => ({
      ...topic,
      avgScore: Math.round(topic.totalScore / topic.sessions),
      improvement: '+0%' // Would need historical data to calculate
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  // Get recent sessions for detailed analysis
  const recentSessionsDetail = practiceSessions.slice(0, 3).map(session => ({
    id: session.id,
    date: new Date(session.created_at).toLocaleDateString(),
    type: 'Speech Practice',
    topic: session.topic,
    duration: `${Math.round(session.duration / 60)} min`,
    score: session.analysis.overall_score,
    improvements: session.analysis.insights
      .filter(insight => insight.type === 'improvement')
      .map(insight => insight.title)
      .slice(0, 2),
    strengths: session.analysis.insights
      .filter(insight => insight.type === 'positive')
      .map(insight => insight.title)
      .slice(0, 2)
  }));

  // Calculate real stats
  const totalPracticeSessions = practiceSessions.length;
  const averageScore = practiceSessions.length > 0 
    ? Math.round(practiceSessions.reduce((sum, session) => sum + session.analysis.overall_score, 0) / practiceSessions.length)
    : 0;
  const practiceHours = practiceSessions.reduce((sum, session) => sum + (session.duration / 3600), 0);
  
  // Calculate improvement rate
  const recent5 = practiceSessions.slice(0, 5);
  const older5 = practiceSessions.slice(5, 10);
  const recentAvg = recent5.length > 0 ? recent5.reduce((sum, s) => sum + s.analysis.overall_score, 0) / recent5.length : 0;
  const olderAvg = older5.length > 0 ? older5.reduce((sum, s) => sum + s.analysis.overall_score, 0) / older5.length : recentAvg;
  const improvementRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  const statCards = [
    {
      title: 'Total Sessions',
      value: totalPracticeSessions.toString(),
      change: totalPracticeSessions > 0 ? 'Keep practicing!' : 'Start your first session',
      changeType: 'positive' as const,
      icon: Mic,
      color: 'blue'
    },
    {
      title: 'Average Score',
      value: averageScore.toString(),
      change: improvementRate !== 0 ? `${improvementRate >= 0 ? '+' : ''}${improvementRate}%` : 'No trend yet',
      changeType: improvementRate >= 0 ? 'positive' as const : 'negative' as const,
      icon: Target,
      color: 'emerald'
    },
    {
      title: 'Practice Hours',
      value: practiceHours.toFixed(1),
      change: practiceHours > 0 ? 'Great progress!' : 'Start practicing',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Improvement Rate',
      value: improvementRate !== 0 ? `${improvementRate >= 0 ? '+' : ''}${improvementRate}%` : '0%',
      change: improvementRate > 0 ? 'Improving!' : improvementRate < 0 ? 'Keep practicing' : 'Need more data',
      changeType: improvementRate >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  if (practiceLoading || debateLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your progress, analyze performance trends, and identify areas for improvement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center"
        >
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Data Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start practicing to see your analytics! Complete a few practice sessions to unlock detailed insights about your speaking performance.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Start Your First Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Track your progress, analyze performance trends, and identify areas for improvement.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'emerald' ? 'bg-emerald-100' :
                stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                }`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Performance Trend Chart */}
      {performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="overall">Overall Score</option>
                <option value="clarity">Clarity</option>
                <option value="pace">Pace</option>
                <option value="volume">Volume</option>
                <option value="engagement">Engagement</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1D4ED8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Session Distribution */}
        {sessionTypeData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {sessionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Skills Radar */}
        {skillsRadarData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills Assessment</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#10B981"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Weekly Sessions */}
      {weeklySessionsData.some(week => week.sessions > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySessionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="sessions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Topics Analysis */}
        {topicsAnalysis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Topic Performance</h2>
            <div className="space-y-4">
              {topicsAnalysis.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{topic.topic}</h3>
                    <p className="text-sm text-gray-600">{topic.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{topic.avgScore}</p>
                    <p className="text-sm text-gray-500">Average</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Sessions Detail */}
        {recentSessionsDetail.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Session Analysis</h2>
            <div className="space-y-4">
              {recentSessionsDetail.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{session.topic}</h3>
                      <p className="text-sm text-gray-600">{session.type} • {session.duration}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Score: {session.score}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-emerald-700 mb-1">Strengths</h4>
                      <ul className="space-y-1">
                        {session.strengths.length > 0 ? session.strengths.map((strength, i) => (
                          <li key={i} className="text-gray-600">• {strength}</li>
                        )) : (
                          <li className="text-gray-500">• Keep practicing to identify strengths</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 mb-1">Areas to Improve</h4>
                      <ul className="space-y-1">
                        {session.improvements.length > 0 ? session.improvements.map((improvement, i) => (
                          <li key={i} className="text-gray-600">• {improvement}</li>
                        )) : (
                          <li className="text-gray-500">• Great job! Keep up the good work</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;