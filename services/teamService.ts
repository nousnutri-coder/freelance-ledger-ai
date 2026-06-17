import { supabase } from './supabaseClient';

export interface TeamPermissions {
    dashboard: { view: boolean; edit: boolean };
    clients: { view: boolean; edit: boolean; delete: boolean };
    quotations: { view: boolean; edit: boolean; delete: boolean };
    calendar: { view: boolean; edit: boolean };
    finances: { view: boolean; edit: boolean };
    settings: { view: boolean; edit: boolean };
}

export interface TeamMember {
    id: string;
    teamOwnerId: string;
    memberEmail: string;
    memberId?: string;
    memberName?: string;
    role: 'admin' | 'member' | 'viewer';
    permissions: TeamPermissions;
    status: 'pending' | 'active' | 'revoked';
    invitedAt: Date;
    acceptedAt?: Date;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<string, TeamPermissions> = {
    admin: {
        dashboard: { view: true, edit: true },
        clients: { view: true, edit: true, delete: true },
        quotations: { view: true, edit: true, delete: true },
        calendar: { view: true, edit: true },
        finances: { view: true, edit: true },
        settings: { view: true, edit: false }
    },
    member: {
        dashboard: { view: true, edit: false },
        clients: { view: true, edit: true, delete: false },
        quotations: { view: true, edit: true, delete: false },
        calendar: { view: true, edit: true },
        finances: { view: false, edit: false },
        settings: { view: false, edit: false }
    },
    viewer: {
        dashboard: { view: true, edit: false },
        clients: { view: true, edit: false, delete: false },
        quotations: { view: true, edit: false, delete: false },
        calendar: { view: true, edit: false },
        finances: { view: false, edit: false },
        settings: { view: false, edit: false }
    }
};

/**
 * Get all team members for a team owner
 */
export async function getTeamMembers(ownerId: string): Promise<TeamMember[]> {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_owner_id', ownerId)
            .neq('status', 'revoked')
            .order('invited_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            teamOwnerId: row.team_owner_id,
            memberEmail: row.member_email,
            memberId: row.member_id,
            role: row.role,
            permissions: row.permissions,
            status: row.status,
            invitedAt: new Date(row.invited_at),
            acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined
        }));
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
}

/**
 * Invite a new team member
 */
export async function inviteTeamMember(
    ownerId: string,
    email: string,
    role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<{ success: boolean; error?: string; member?: TeamMember }> {
    try {
        // Check if already at max members (2)
        const existingMembers = await getTeamMembers(ownerId);
        const activeMembers = existingMembers.filter(m => m.status !== 'revoked');

        if (activeMembers.length >= 2) {
            return { success: false, error: 'Ya tienes el máximo de 2 miembros en tu equipo' };
        }

        // Check if email already invited
        const alreadyInvited = existingMembers.find(m => m.memberEmail.toLowerCase() === email.toLowerCase());
        if (alreadyInvited) {
            return { success: false, error: 'Este correo ya ha sido invitado' };
        }

        // Check if user exists in the system
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        const { data, error } = await supabase
            .from('team_members')
            .insert({
                team_owner_id: ownerId,
                member_email: email.toLowerCase(),
                member_id: existingUser?.id || null,
                role: role,
                permissions: DEFAULT_PERMISSIONS[role],
                status: existingUser ? 'active' : 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            member: {
                id: data.id,
                teamOwnerId: data.team_owner_id,
                memberEmail: data.member_email,
                memberId: data.member_id,
                memberName: existingUser?.name,
                role: data.role,
                permissions: data.permissions,
                status: data.status,
                invitedAt: new Date(data.invited_at),
                acceptedAt: data.accepted_at ? new Date(data.accepted_at) : undefined
            }
        };
    } catch (error: any) {
        console.error('Error inviting team member:', error);
        return { success: false, error: error.message || 'Error al invitar miembro' };
    }
}

/**
 * Update member permissions
 */
export async function updateMemberPermissions(
    memberId: string,
    permissions: TeamPermissions
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('team_members')
            .update({ permissions })
            .eq('id', memberId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating permissions:', error);
        return false;
    }
}

/**
 * Update member role (and apply default permissions for that role)
 */
export async function updateMemberRole(
    memberId: string,
    role: 'admin' | 'member' | 'viewer'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('team_members')
            .update({
                role,
                permissions: DEFAULT_PERMISSIONS[role]
            })
            .eq('id', memberId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating role:', error);
        return false;
    }
}

/**
 * Remove a member from the team
 */
export async function removeMemberFromTeam(memberId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('team_members')
            .update({ status: 'revoked' })
            .eq('id', memberId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing team member:', error);
        return false;
    }
}

/**
 * Check if current user has permission for a specific action
 */
export async function checkUserPermission(
    userId: string,
    section: keyof TeamPermissions,
    action: 'view' | 'edit' | 'delete'
): Promise<boolean> {
    try {
        // Check if user is a team member
        const { data, error } = await supabase
            .from('team_members')
            .select('permissions, status')
            .eq('member_id', userId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;

        // If not a team member, they're the owner - full access
        if (!data) return true;

        const permissions = data.permissions as TeamPermissions;
        const sectionPerms = permissions[section];

        if (!sectionPerms) return false;

        if (action === 'delete') {
            return 'delete' in sectionPerms ? sectionPerms.delete : false;
        }

        return sectionPerms[action] || false;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * Get the team that the current user belongs to (as a member)
 */
export async function getMyTeamMembership(userId: string): Promise<TeamMember | null> {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('member_id', userId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return {
            id: data.id,
            teamOwnerId: data.team_owner_id,
            memberEmail: data.member_email,
            memberId: data.member_id,
            role: data.role,
            permissions: data.permissions,
            status: data.status,
            invitedAt: new Date(data.invited_at),
            acceptedAt: data.accepted_at ? new Date(data.accepted_at) : undefined
        };
    } catch (error) {
        console.error('Error getting team membership:', error);
        return null;
    }
}
