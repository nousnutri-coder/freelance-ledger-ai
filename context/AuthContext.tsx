import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false); // Start as false for instant load

    const fetchProfile = async (userId: string) => {
        try {
            console.log('[AuthContext] Fetching profile for user:', userId);
            const { fetchCompleteUserProfile } = await import('../services/dbService');
            const { checkExpiredTrial } = await import('../services/subscriptionService');

            const profile = await fetchCompleteUserProfile(userId);
            if (profile) {
                console.log('[AuthContext] ✅ Profile fetched successfully. currentPlan:', profile.currentPlan);

                // Check if trial expired (auto-downgrade if necessary)
                if (profile.currentPlan && profile.subscriptionStatus && profile.renewalDate) {
                    const didDowngrade = await checkExpiredTrial(
                        userId,
                        profile.currentPlan,
                        profile.subscriptionStatus,
                        profile.renewalDate
                    );

                    if (didDowngrade) {
                        // Refetch profile to get updated plan
                        console.log('[AuthContext] Trial expired, refetching profile...');
                        const updatedProfile = await fetchCompleteUserProfile(userId);
                        if (updatedProfile) {
                            setUserProfile(updatedProfile);
                        }
                        return;
                    }
                }

                setUserProfile(profile);
            } else {
                console.warn('[AuthContext] ⚠️ No profile data returned');
            }
        } catch (error) {
            console.error('[AuthContext] Error in fetchProfile:', error);
        }
    };

    useEffect(() => {
        // Non-blocking session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        }).catch(err => {
            console.error("Error getting session:", err);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            alert("Error iniciando sesión con Google");
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const refreshProfile = async () => {
        console.log('[AuthContext] refreshProfile called for user:', user?.id);
        if (user) {
            await fetchProfile(user.id);
            console.log('[AuthContext] refreshProfile completed');
        } else {
            console.warn('[AuthContext] Cannot refresh profile - no user logged in');
        }
    };

    // Always render children immediately - no blocking loading screen
    return (
        <AuthContext.Provider value={{ user, userProfile, session, loading, signInWithGoogle, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
