import React, { useState, useEffect, useCallback } from 'react';
import {
    getTeamMembers,
    inviteTeamMember,
    updateMemberPermissions,
    updateMemberRole,
    removeMemberFromTeam,
    TeamMember,
    TeamPermissions,
    DEFAULT_PERMISSIONS
} from '../services/teamService';

interface TeamManagerProps {
    ownerId: string;
}

const SECTIONS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'clients', label: 'Clientes', icon: 'people', hasDelete: true },
    { key: 'quotations', label: 'Cotizaciones', icon: 'description', hasDelete: true },
    { key: 'calendar', label: 'Calendario', icon: 'calendar_today' },
    { key: 'finances', label: 'Finanzas', icon: 'account_balance' },
    { key: 'settings', label: 'Configuración', icon: 'settings' }
];

const TeamManager: React.FC<TeamManagerProps> = ({ ownerId }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [expandedMember, setExpandedMember] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        const data = await getTeamMembers(ownerId);
        setMembers(data);
        setLoading(false);
    }, [ownerId]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;

        setIsInviting(true);
        setError(null);
        setSuccess(null);

        const result = await inviteTeamMember(ownerId, inviteEmail, inviteRole);

        if (result.success) {
            setSuccess(`Invitación enviada a ${inviteEmail}`);
            setInviteEmail('');
            loadMembers();
        } else {
            setError(result.error || 'Error al enviar invitación');
        }

        setIsInviting(false);
    };

    const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
        const success = await updateMemberRole(memberId, newRole);
        if (success) {
            loadMembers();
        }
    };

    const handlePermissionChange = async (
        member: TeamMember,
        section: string,
        permission: 'view' | 'edit' | 'delete',
        value: boolean
    ) => {
        const newPermissions = { ...member.permissions };
        const sectionPerms = { ...(newPermissions as any)[section] };
        sectionPerms[permission] = value;

        // If disabling view, disable edit and delete too
        if (permission === 'view' && !value) {
            sectionPerms.edit = false;
            if ('delete' in sectionPerms) sectionPerms.delete = false;
        }

        // If enabling edit or delete, enable view too
        if ((permission === 'edit' || permission === 'delete') && value) {
            sectionPerms.view = true;
        }

        (newPermissions as any)[section] = sectionPerms;

        const success = await updateMemberPermissions(member.id, newPermissions as TeamPermissions);
        if (success) {
            loadMembers();
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('¿Estás seguro de que deseas revocar el acceso de este miembro?')) return;

        const success = await removeMemberFromTeam(memberId);
        if (success) {
            loadMembers();
            setSuccess('Miembro eliminado del equipo');
        }
    };

    const activeMembers = members.filter(m => m.status !== 'revoked');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="material-icons-round text-lg">group</span>
                    Mi Equipo ({activeMembers.length}/2 miembros)
                </h4>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
                    {success}
                </div>
            )}

            {/* Members List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">
                    <span className="material-icons-round animate-spin">refresh</span>
                </div>
            ) : activeMembers.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center">
                    <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600 mb-2">group_add</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay miembros en tu equipo aún
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activeMembers.map(member => (
                        <div
                            key={member.id}
                            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Member Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                                            {member.memberEmail[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {member.memberEmail}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {member.status === 'pending' ? '⏳ Pendiente' : '✅ Activo'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-medium"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="member">Miembro</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <span className="material-icons-round text-gray-400">
                                        {expandedMember === member.id ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>
                            </div>

                            {/* Permissions Panel */}
                            {expandedMember === member.id && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        Permisos por Sección
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {SECTIONS.map(section => {
                                            const perms = (member.permissions as any)[section.key] || {};
                                            return (
                                                <div key={section.key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-icons-round text-sm text-gray-400">{section.icon}</span>
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{section.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handlePermissionChange(member, section.key, 'view', !perms.view)}
                                                            className={`px-2 py-1 text-[10px] font-bold rounded ${perms.view
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                                                                }`}
                                                            title="Ver"
                                                        >
                                                            👁
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermissionChange(member, section.key, 'edit', !perms.edit)}
                                                            className={`px-2 py-1 text-[10px] font-bold rounded ${perms.edit
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                                                                }`}
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        {section.hasDelete && (
                                                            <button
                                                                onClick={() => handlePermissionChange(member, section.key, 'delete', !perms.delete)}
                                                                className={`px-2 py-1 text-[10px] font-bold rounded ${perms.delete
                                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                                                                    }`}
                                                                title="Eliminar"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="mt-4 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons-round text-sm">person_remove</span>
                                        Revocar Acceso
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Invite Form */}
            {activeMembers.length < 2 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span className="material-icons-round text-sm">person_add</span>
                        Invitar Nuevo Miembro
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="flex-1 px-4 py-2.5 border border-blue-200 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as any)}
                            className="px-3 py-2.5 border border-blue-200 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Miembro</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <button
                            onClick={handleInvite}
                            disabled={isInviting || !inviteEmail.trim()}
                            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isInviting ? (
                                <span className="material-icons-round animate-spin text-lg">refresh</span>
                            ) : (
                                <>
                                    <span className="material-icons-round text-lg">send</span>
                                    Invitar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Info */}
            <p className="text-xs text-gray-400 text-center">
                Los miembros invitados recibirán acceso según los permisos que configures.
                Puedes ajustar los permisos en cualquier momento.
            </p>
        </div>
    );
};

export default TeamManager;
