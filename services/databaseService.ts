/**
 * Database Service Layer
 * Handles all CRUD operations for reports, notifications, lab history, and bookings
 */

import supabase, { Database } from './supabaseClient';
import { Report, Notification, AnalysisResult, LabData } from '../types';

/**
 * REPORTS SERVICE
 */
export const createReport = async (
  patientEmail: string,
  patientName: string,
  patientId: string,
  type: 'Microscopy' | 'Lab Risk',
  result: AnalysisResult | any,
  imageUrl?: string
): Promise<Report> => {
  const now = new Date().toISOString();
  const reportData: any = {
    id: crypto.randomUUID(), // Explicitly generate UUID
    patient_email: patientEmail,
    patient_name: patientName,
    patient_id: patientId,
    type: type,
    status: 'Completed',
    result: result,
    created_at: now, // Explicitly set timestamp
    updated_at: now, // Explicitly set timestamp
    ...(imageUrl && { image_url: imageUrl }) // Only include if provided
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    date: data.created_at,
    type: data.type,
    status: data.status,
    result: data.result,
    imageUrl: data.image_url
  };
};

export const getReportsByEmail = async (email: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('patient_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(report => ({
    id: report.id,
    patientId: report.patient_id,
    patientName: report.patient_name,
    date: report.created_at,
    type: report.type,
    status: report.status,
    result: report.result,
    imageUrl: report.image_url
  }));
};

export const getAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(report => ({
    id: report.id,
    patientId: report.patient_id,
    patientName: report.patient_name,
    date: report.created_at,
    type: report.type,
    status: report.status,
    result: report.result,
    imageUrl: report.image_url
  }));
};

export const getReportById = async (id: string): Promise<Report> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    date: data.created_at,
    type: data.type,
    status: data.status,
    result: data.result,
    imageUrl: data.image_url
  };
};

export const deleteReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * NOTIFICATIONS SERVICE
 */
export const createNotification = async (
  userEmail: string,
  title: string,
  message: string,
  type: 'alert' | 'info' | 'success'
): Promise<Notification> => {
  const notificationData: any = {
    id: crypto.randomUUID(),
    user_email: userEmail,
    title,
    message,
    type,
    read: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    message: data.message,
    type: data.type,
    date: data.created_at || new Date().toISOString(),
    read: data.read
  };
};

export const getNotificationsByEmail = async (email: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    date: notif.created_at || new Date().toISOString(),
    read: notif.read
  }));
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (email: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_email', email);

  if (error) throw error;
};

export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * LAB HISTORY SERVICE
 */
export const createLabHistory = async (
  userEmail: string,
  inputData: LabData,
  result: any
): Promise<any> => {
  const labData: any = {
    id: crypto.randomUUID(),
    user_email: userEmail,
    lab_data: inputData,      // Match actual column name
    prediction: result,        // Match actual column name
    created_at: new Date().toISOString()
  };

  console.log('🔍 Attempting to save lab history:', {
    userEmail,
    dataStructure: Object.keys(labData)
  });

  const { data, error } = await supabase
    .from('lab_history')
    .insert(labData)
    .select()
    .single();

  if (error) {
    console.error('🚨 Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log('✅ Lab history saved successfully:', data?.id);

  return {
    id: data.id,
    date: data.created_at,
    input: data.lab_data,
    result: data.prediction
  };
};

export const getLabHistoryByEmail = async (email: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('lab_history')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(item => ({
    id: item.id,
    date: item.created_at,
    input: item.lab_data || {},      // Match actual column name
    result: item.prediction || {}     // Match actual column name
  }));
};

/**
 * BOOKINGS SERVICE
 */
export const createBooking = async (
  userEmail: string,
  testType: string,
  locationType: string,
  date: string,
  time: string,
  address?: string,
  contact?: string
): Promise<any> => {
  const bookingData: any = {
    id: crypto.randomUUID(),
    user_email: userEmail,
    test_type: testType,
    location_type: locationType,
    date: date,
    time: time,
    address: address,
    contact: contact,
    status: 'Confirmed'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    testType: data.test_type,
    locationType: data.location_type,
    date: data.date,
    time: data.time,
    address: data.address,
    contact: data.contact,
    status: data.status,
    createdAt: data.created_at
  };
};

export const getBookingsByEmail = async (email: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(booking => ({
    id: booking.id,
    testType: booking.test_type,
    locationType: booking.location_type,
    date: booking.date,
    time: booking.time,
    address: booking.address,
    contact: booking.contact,
    status: booking.status,
    createdAt: booking.created_at
  }));
};

/**
 * REAL-TIME SUBSCRIPTIONS
 */
export const subscribeToNotifications = (email: string, callback: (notification: Notification) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_email=eq.${email}`
      },
      (payload) => {
        const notif = payload.new as Database['public']['Tables']['notifications']['Row'];
        callback({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          date: notif.created_at,
          read: notif.read
        });
      }
    )
    .subscribe();
};
