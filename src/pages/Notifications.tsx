import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageSquare, Briefcase, ChevronRight, UserPlus, Trash2 } from 'lucide-react';
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
  sender?: { full_name: string; avatar_url?: string; username?: string };
}

interface NotificationsProps {
  isRtl: boolean;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  interest: <Heart size={16} className="text-red-500" />,
  message: <MessageSquare size={16} className="text-blue-500" />,
  opportunity: <Briefcase size={16} className="text-emerald-500" />,
};

function timeAgo(dateStr: string, isRtl: boolean) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return isRtl ? 'עכשיו' : 'now';
  if (diff < 60) return isRtl ? `לפני ${diff} דק'` : `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return isRtl ? `לפני ${h} שע'` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return isRtl ? `לפני ${d} ימים` : `${d}d ago`;
}

export default function Notifications({ isRtl }: NotificationsProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*, sender:profiles!sender_id(full_name, avatar_url, username)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = tab === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isRtl ? 'התראות' : 'Notifications'}</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 mt-0.5">{unreadCount} {isRtl ? 'לא נקראו' : 'unread'}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {isRtl ? 'סמן הכל כנקרא' : 'Mark all read'}
            </button>
          )}
          <div className="flex p-1 bg-slate-100 rounded-lg gap-0.5">
            {(['all', 'unread'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {t === 'all' ? (isRtl ? 'הכל' : 'All') : (isRtl ? 'לא נקראו' : 'Unread')}
                {t === 'unread' && unreadCount > 0 && (
                  <span className="ms-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-1">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start gap-4 p-4 rounded-xl transition-all relative ${
                !n.is_read ? 'bg-blue-50/60 hover:bg-blue-50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              {!n.is_read && (
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-blue-500 rounded-full rtl:left-auto rtl:right-0" />
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                !n.is_read ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'
              }`}>
                {TYPE_ICON[n.type] || <Bell size={16} className="text-slate-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-snug ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {n.title}
                  </p>
                  <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{timeAgo(n.created_at, isRtl)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.content}</p>

                <div className="flex items-center gap-4 mt-2">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => markAsRead(n.id)}
                      className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                      {isRtl ? 'צפה בפרטים' : 'View details'}
                      <ChevronRight size={12} className="rtl:rotate-180" />
                    </Link>
                  )}
                  {n.sender_id && (
                    <>
                      <Link
                        to={`/app/u/${n.sender?.username || n.sender_id}`}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                      >
                        <UserPlus size={11} />
                        {isRtl ? 'פרופיל' : 'Profile'}
                      </Link>
                      <Link
                        to="/app/messages"
                        state={{ recipientId: n.sender_id, recipientName: n.sender?.full_name }}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare size={11} />
                        {isRtl ? 'הודעה' : 'Message'}
                      </Link>
                    </>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {isRtl ? 'סמן כנקרא' : 'Mark read'}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteNotification(n.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Bell className="text-slate-200" size={24} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-slate-900">{isRtl ? 'הכל מעודכן!' : 'All caught up!'}</p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            {isRtl ? 'אין התראות חדשות. נעדכן אותך כשמשהו חשוב יקרה.' : "No new notifications. We'll alert you when something happens."}
          </p>
        </div>
      )}
    </div>
  );
}
