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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-black tracking-tight">
            {isRtl ? 'התראות' : 'Notifications'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRtl ? 'הישאר מעודכן בפעילות ברשת ה-SkillLink שלך.' : 'Stay updated with your SkillLink network activities.'}
          </p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'הכל' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'unread' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            {isRtl ? 'לא נקראו' : 'Unread'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden min-h-[400px]">
        {loading && notifications.length === 0 ? (
          <div className="p-24 flex justify-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-6 flex items-start gap-6 transition-all hover:bg-gray-50 group ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${!notification.is_read ? 'bg-white' : 'bg-gray-50'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-gray-900 ${!notification.is_read ? 'text-black' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {notification.content}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {isRtl ? 'צפה בפרטים' : 'View Details'}
                        <ChevronRight size={12} className="rtl:rotate-180" />
                      </Link>
                    )}
                    {notification.sender_id && (
                      <Link 
                        to="/app/messages"
                        state={{ recipientId: notification.sender_id, recipientName: notification.sender?.full_name }}
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <MessageSquare size={12} />
                        {isRtl ? 'שלח הודעה בחזרה' : 'Message Back'}
                      </Link>
                    )}
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black"
                      >
                        {isRtl ? 'סמן כנקרא' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Bell className="text-gray-200" size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-black tracking-tight">
                {isRtl ? 'הכל מעודכן!' : 'All caught up!'}
              </h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                {isRtl ? 'אין התראות חדשות כרגע. אנחנו נעדכן אותך כשמשהו חשוב יקרה ברשת שלך.' : 'No new notifications at the moment. We\'ll alert you when something important happens in your network.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Settings Link */}
      <div className="text-center">
        <button className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-2 mx-auto group">
          <Info size={16} className="group-hover:text-blue-500 transition-colors" />
          {isRtl ? 'נהל הגדרות התראות' : 'Manage notification settings'}
        </button>
      </div>
    </div>
  );
}
