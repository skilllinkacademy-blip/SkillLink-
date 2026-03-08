import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, MessageSquare, Briefcase, Star, Heart, ChevronRight, Info, ShieldCheck, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  user_id: string;
  sender_id?: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  link?: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface NotificationsProps {
  isRtl: boolean;
}

export default function Notifications({ isRtl }: NotificationsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'interest': return <Heart className="text-red-500" size={20} />;
      case 'message': return <MessageSquare className="text-blue-500" size={20} />;
      case 'opportunity': return <Briefcase className="text-emerald-500" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'התראות' : 'Notifications'}
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {isRtl ? 'הישאר מעודכן בפעילות ברשת ה-SkillLink שלך.' : 'Stay updated with your SkillLink network activities.'}
          </p>
        </div>
        <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'הכל' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === 'unread' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'לא נקראו' : 'Unread'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px]">
        {loading && notifications.length === 0 ? (
          <div className="p-32 flex justify-center">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent animate-spin rounded-full" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-10 flex items-start gap-8 transition-all hover:bg-slate-50 group relative ${!notification.is_read ? 'bg-slate-50/50' : ''}`}
              >
                {!notification.is_read && (
                  <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} bottom-0 w-1.5 bg-slate-900`} />
                )}
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg border border-slate-100 ${!notification.is_read ? 'bg-white' : 'bg-slate-100'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-black text-slate-900 ${!notification.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      {new Date(notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                    {notification.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 pt-4">
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-600 flex items-center gap-2 group/link"
                      >
                        {isRtl ? 'צפה בפרטים' : 'View Details'}
                        <ChevronRight size={14} className={`rtl:rotate-180 transition-transform group-hover/link:translate-x-1`} />
                      </Link>
                    )}
                    {notification.sender_id && (
                      <Link 
                        to="/app/messages"
                        state={{ recipientId: notification.sender_id, recipientName: notification.sender?.full_name }}
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
                      >
                        <MessageSquare size={14} />
                        {isRtl ? 'שלח הודעה בחזרה' : 'Message Back'}
                      </Link>
                    )}
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        {isRtl ? 'סמן כנקרא' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-32 text-center space-y-10">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100 animate-in zoom-in duration-700">
              <Bell className="text-slate-100" size={64} strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                {isRtl ? 'הכל מעודכן!' : 'All caught up!'}
              </h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed text-lg">
                {isRtl ? 'אין התראות חדשות כרגע. אנחנו נעדכן אותך כשמשהו חשוב יקרה ברשת שלך.' : 'No new notifications at the moment. We\'ll alert you when something important happens in your network.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Settings Link */}
      <div className="text-center">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3 mx-auto group">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <Info size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          {isRtl ? 'נהל הגדרות התראות' : 'Manage notification settings'}
        </button>
      </div>
    </div>
  );
}
