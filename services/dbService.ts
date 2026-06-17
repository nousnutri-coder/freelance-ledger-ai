import { supabase } from './supabaseClient';
import { Transaction, Client, KanbanTask, Quotation, CalendarEvent, CompanyDNA, UserProfile } from '../types';

// --- Profiles ---
export const fetchCompleteUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        if (profileError.code !== 'PGRST116') console.error('Error fetching profile:', profileError);
        return null;
    }

    // Fetch subscription to get current plan
    const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('current_plan, status, renewal_date, billing_cycle')
        .eq('user_id', userId)
        .maybeSingle();

    if (subError) {
        console.warn('Error fetching subscription for user ', userId, ':', subError);
    }

    // Fetch active DNA
    const dna = await fetchCompanyDNA(userId);

    // Map snake_case to camelCase
    return {
        name: profileData.full_name || profileData.email?.split('@')[0] || 'Usuario',
        email: profileData.email || '',
        currency: profileData.currency || 'COP',
        profileImage: profileData.avatar_url || '/vite.svg',
        companyName: profileData.company_name,
        companyDescription: profileData.company_description,
        country: profileData.country,
        taxRate: profileData.tax_rate,
        address: profileData.address,
        phone: profileData.phone,
        website: profileData.website,
        businessEmail: profileData.business_email,
        watermarkLogo: profileData.watermark_logo,
        useWatermark: profileData.use_watermark,
        companyDNA: dna,
        // Subscription data
        currentPlan: subscriptionData?.current_plan || 'free',
        subscriptionStatus: subscriptionData?.status || 'active',
        renewalDate: subscriptionData?.renewal_date,
        billingCycle: subscriptionData?.billing_cycle,
        // Trial data
        hasUsedTrial: profileData.has_used_trial || false,
    } as UserProfile;
};

export const updateProfile = async (userId: string, profile: Partial<UserProfile>) => {
    const updates: any = {};
    if (profile.name) updates.full_name = profile.name;
    if (profile.companyName) updates.company_name = profile.companyName;
    if (profile.companyDescription) updates.company_description = profile.companyDescription;
    if (profile.currency) updates.currency = profile.currency;
    if (profile.profileImage) updates.avatar_url = profile.profileImage;

    // Update timestamp
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
};

// --- Transactions ---

export const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data as Transaction[];
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
};

export const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(updates).eq('id', id);
    if (error) throw error;
};

// --- Clients ---

export const fetchClients = async (userId: string): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    // No mapping needed if column names match types
    return data as Client[];
};

export const addClient = async (userId: string, client: Omit<Client, 'id'>) => {
    const { data, error } = await supabase
        .from('clients')
        .insert([{ ...client, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data as Client;
};

export const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
};

// --- Tasks (Kanban) ---

export const fetchTasks = async (userId: string): Promise<KanbanTask[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    // Map snake_case to camelCase if needed, but 'project_notes' matches DB 'project_notes' (if created as such)
    // Check migration: 'project_notes jsonb' -> matches keys in JSON? 
    // Types.ts: projectNotes: string[]. In DB it is jsonb.
    // We need to ensure mapping is correct.
    return data.map((t: any) => ({
        ...t,
        projectNotes: t.project_notes || []
    })) as KanbanTask[];
};

export const addTask = async (userId: string, task: Omit<KanbanTask, 'id'>) => {
    const { projectNotes, ...rest } = task;
    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            ...rest,
            user_id: userId,
            project_notes: projectNotes
        }])
        .select()
        .single();

    if (error) throw error;
    return {
        ...data,
        projectNotes: data.project_notes
    } as KanbanTask;
};

export const updateTask = async (id: string, updates: Partial<KanbanTask>) => {
    const { projectNotes, ...rest } = updates;
    const dbUpdates: any = { ...rest };
    if (projectNotes) dbUpdates.project_notes = projectNotes;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
};

// --- Quotations ---

export const fetchQuotations = async (userId: string): Promise<Quotation[]> => {
    const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching quotations:', error);
        return [];
    }

    // Map snake_case to camelCase
    return data.map((q: any) => ({
        id: q.id,
        date: q.date,
        validUntil: q.valid_until,
        clientId: q.client_id,
        items: q.items,
        notes: q.notes,
        total: q.total,
        status: q.status
    })) as Quotation[];
};

export const addQuotation = async (userId: string, quotation: Omit<Quotation, 'id'>) => {
    const { validUntil, clientId, ...rest } = quotation;
    const { data, error } = await supabase
        .from('quotations')
        .insert([{
            ...rest,
            user_id: userId,
            valid_until: validUntil,
            client_id: clientId
        }])
        .select()
        .single();

    if (error) throw error;
    return {
        id: data.id,
        date: data.date,
        validUntil: data.valid_until,
        clientId: data.client_id,
        items: data.items,
        notes: data.notes,
        total: data.total,
        status: data.status
    } as Quotation;
};

export const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    const { validUntil, clientId, ...rest } = updates;
    const dbUpdates: any = { ...rest };
    if (validUntil) dbUpdates.valid_until = validUntil;
    if (clientId) dbUpdates.client_id = clientId;

    const { error } = await supabase.from('quotations').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const deleteQuotation = async (id: string) => {
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) throw error;
};

// --- Events ---

export const fetchEvents = async (userId: string): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }

    return data.map((e: any) => ({
        ...e,
        start: e.start_time,
        end: e.end_time,
        meetingLink: e.meeting_link,
        reminderCategory: e.reminder_category,
        relatedAmount: e.related_amount,
        clientId: e.client_id
    })) as CalendarEvent[];
};

export const addEvent = async (userId: string, event: Omit<CalendarEvent, 'id'>) => {
    const { start, end, meetingLink, reminderCategory, relatedAmount, clientId, ...rest } = event;
    const { data, error } = await supabase
        .from('events')
        .insert([{
            ...rest,
            user_id: userId,
            start_time: start,
            end_time: end,
            meeting_link: meetingLink,
            reminder_category: reminderCategory,
            related_amount: relatedAmount,
            client_id: clientId
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        start: data.start_time,
        end: data.end_time,
        meetingLink: data.meeting_link,
        reminderCategory: data.reminder_category,
        relatedAmount: data.related_amount,
        clientId: data.client_id
    } as CalendarEvent;
};

export const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { start, end, meetingLink, reminderCategory, relatedAmount, clientId, ...rest } = updates;
    const dbUpdates: any = { ...rest };
    if (start) dbUpdates.start_time = start;
    if (end) dbUpdates.end_time = end;
    if (meetingLink) dbUpdates.meeting_link = meetingLink;
    if (reminderCategory) dbUpdates.reminder_category = reminderCategory;
    if (relatedAmount) dbUpdates.related_amount = relatedAmount;
    if (clientId) dbUpdates.client_id = clientId;

    const { error } = await supabase.from('events').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
};

// --- Company DNA ---
export const fetchCompanyDNA = async (userId: string): Promise<CompanyDNA | undefined> => {
    const { data, error } = await supabase
        .from('company_dna')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching DNA:", error);
    }

    if (!data) return undefined;

    return {
        id: data.id,
        uploadDate: data.created_at,
        fileName: data.file_name,
        extractedData: data.extracted_data,
        rawExtraction: data.raw_extraction,
        isActive: data.is_active
    };
};

export const saveCompanyDNA = async (userId: string, dna: Omit<CompanyDNA, 'id' | 'uploadDate'>) => {
    // First deactivate old DNA
    await supabase.from('company_dna').update({ is_active: false }).eq('user_id', userId);

    const { data, error } = await supabase
        .from('company_dna')
        .insert([{
            user_id: userId,
            file_name: dna.fileName,
            extracted_data: dna.extractedData,
            raw_extraction: dna.rawExtraction,
            is_active: true
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        uploadDate: data.created_at,
        fileName: data.file_name,
        extractedData: data.extracted_data,
        rawExtraction: data.raw_extraction,
        isActive: data.is_active
    } as CompanyDNA;
};

export const deactivateAllCompanyDNA = async (userId: string) => {
    const { error } = await supabase
        .from('company_dna')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (error) throw error;
};
