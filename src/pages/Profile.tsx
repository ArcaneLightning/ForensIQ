import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  Clock,
  Settings,
  Bell,
  Shield,
  Palette,
  Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePracticeSessions } from '../hooks/usePracticeSessions';
import { useDebateSessions } from '../hooks/useDebateSessions';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { sessions: practiceSessions } = usePracticeSessions();
  const { sessions: debateSessions } = useDebateSessions();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'settings'>('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Passionate about public speaking and debate. Currently working on improving my argumentation skills and vocal delivery.',
    goals: 'Compete in national debate tournaments',
    preferences: {
      notifications: true,
      emailUpdates: false,
      theme: 'light',
      voiceAnalysis: true
    }
  });

  // Calculate real stats from user data
  const totalSessions = practiceSessions.length + debateSessions.length;
  const averageScore = practiceSessions.length > 0 
    ? Math.round(practiceSessions.reduce((sum, session) => sum + session.analysis.overall_score, 0) / practiceSessions.length)
    : 0;
  const practiceHours = practiceSessions.reduce((sum, session) => sum + (session.duration / 3600), 0);
  
  // Calculate improvement rate
  const recentSessions = practiceSessions.slice(0, 5);
  const olderSessions = practiceSessions.slice(5, 10);
  const recentAvg = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + s.analysis.overall_score, 0) / recentSessions.length 
    : 0;
  const olderAvg = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + s.analysis.overall_score, 0) / olderSessions.length 
    : recentAvg;
  const improvementRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Completed your first practice session',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100',
      earned: totalSessions > 0,
      date: totalSessions > 0 ? new Date(practiceSessions[practiceSessions.length - 1]?.created_at || Date.now()).toLocaleDateString() : null
    },
    {
      id: 2,
      title: 'Consistent Performer',
      description: 'Practiced for 7 consecutive days',
      icon: Target,
      color: 'text-blue-600 bg-blue-100',
      earned: totalSessions >= 7,
      date: totalSessions >= 7 ? new Date().toLocaleDateString() : null
    },
    {
      id: 3,
      title: 'Debate Master',
      description: 'Won 10 debates against AI opponents',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-100',
      earned: debateSessions.filter(s => s.user_score > s.ai_score).length >= 10,
      progress: debateSessions.filter(s => s.user_score > s.ai_score).length
    },
    {
      id: 4,
      title: 'Team Player',
      description: 'Joined your first debate team',
      icon: User,
      color: 'text-purple-600 bg-purple-100',
      earned: false, // Would need team data
      date: null
    },
    {
      id: 5,
      title: 'Rising Star',
      description: 'Achieved average score above 85',
      icon: Star,
      color: 'text-orange-600 bg-orange-100',
      earned: averageScore >= 85,
      date: averageScore >= 85 ? new Date().toLocaleDateString() : null
    },
    {
      id: 6,
      title: 'Marathon Speaker',
      description: 'Complete 50 practice sessions',
      icon: Clock,
      color: 'text-red-600 bg-red-100',
      earned: totalSessions >= 50,
      progress: totalSessions
    }
  ];

  const stats = [
    { label: 'Total Sessions', value: totalSessions, icon: Clock },
    { label: 'Average Score', value: averageScore, icon: Target },
    { label: 'Improvement Rate', value: `${improvementRate >= 0 ? '+' : ''}${improvementRate}%`, icon: TrendingUp },
    { label: 'Practice Hours', value: practiceHours.toFixed(1), icon: Calendar }
  ];

  const handleSave = () => {
    // Save profile data logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      bio: 'Passionate about public speaking and debate. Currently working on improving my argumentation skills and vocal delivery.',
      goals: 'Compete in national debate tournaments',
      preferences: {
        notifications: true,
        emailUpdates: false,
        theme: 'light',
        voiceAnalysis: true
      }
    });
    setIsEditing(false);
  };

  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings, track achievements, and customize your experience.
        </p>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
              <p className="text-blue-100 mb-2">{user?.email}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex border-b border-gray-200">
          {[
            { key: 'profile', label: 'Profile Information', icon: User },
            { key: 'achievements', label: 'Achievements', icon: Trophy },
            { key: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Profile Form */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.goals}
                        onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{profileData.goals}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Achievements</h2>
                <p className="text-gray-600">Track your progress and celebrate your milestones</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                      achievement.earned
                        ? 'border-emerald-200 bg-emerald-50 hover:shadow-lg'
                        : 'border-gray-200 bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        achievement.earned ? achievement.color : 'bg-gray-200 text-gray-400'
                      }`}>
                        <achievement.icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                      
                      {achievement.earned ? (
                        <div className="text-emerald-600 font-medium text-sm">
                          ✓ Earned {achievement.date && `on ${achievement.date}`}
                        </div>
                      ) : achievement.progress !== undefined ? (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((achievement.progress / 50) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.id === 3 ? 10 : 50} progress
                          </p>
                        </div>
                      ) : (
                        <div className="text-gray-500 font-medium text-sm">
                          Not earned yet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Push Notifications</h3>
                        <p className="text-sm text-gray-600">Receive notifications about your progress</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.notifications}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, notifications: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Email Updates</h3>
                        <p className="text-sm text-gray-600">Receive weekly progress emails</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.emailUpdates}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, emailUpdates: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Advanced Voice Analysis</h3>
                        <p className="text-sm text-gray-600">Enable detailed tone and emotion analysis</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.preferences.voiceAnalysis}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, voiceAnalysis: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <Palette className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Theme</h3>
                        <p className="text-sm text-gray-600">Choose your preferred theme</p>
                      </div>
                    </div>
                    <select
                      value={profileData.preferences.theme}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, theme: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h2>
                <div className="space-y-4">
                  <button className="flex items-center space-x-3 w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;