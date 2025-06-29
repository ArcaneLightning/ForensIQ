import { useState, useEffect } from 'react';
import { supabase, Team, TeamMember, User } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[];
  member_count: number;
}

export const useTeams = () => {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get teams where user is a member
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams!inner (
            id,
            name,
            description,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      // Get full team details with all members
      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];
      
      if (teamIds.length === 0) {
        setTeams([]);
        return;
      }

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (
            id,
            role,
            joined_at,
            user:users (
              id,
              name,
              email,
              avatar_url
            )
          )
        `)
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      // Transform data
      const transformedTeams: TeamWithMembers[] = teamsData?.map(team => ({
        ...team,
        members: team.team_members,
        member_count: team.team_members.length
      })) || [];

      setTeams(transformedTeams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: { name: string; description: string }) => {
    if (!user) return null;

    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{ ...teamData, created_by: user.id }])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as team leader
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: user.id,
          role: 'leader'
        }]);

      if (memberError) throw memberError;

      await fetchTeams(); // Refresh teams
      return team;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      return null;
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;

      await fetchTeams(); // Refresh teams
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
      return false;
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTeams(); // Refresh teams
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave team');
      return false;
    }
  };

  return {
    teams,
    isLoading,
    error,
    createTeam,
    joinTeam,
    leaveTeam,
    refetch: fetchTeams
  };
};