import { useState, useEffect } from 'react';
import { supabase, PracticeSession } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const usePracticeSessions = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (sessionData: Omit<PracticeSession, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert([{ ...sessionData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  };

  const updateSession = async (id: string, updates: Partial<PracticeSession>) => {
    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSessions(prev => prev.map(session => 
        session.id === id ? data : session
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      return null;
    }
  };

  return {
    sessions,
    isLoading,
    error,
    createSession,
    updateSession,
    refetch: fetchSessions
  };
};