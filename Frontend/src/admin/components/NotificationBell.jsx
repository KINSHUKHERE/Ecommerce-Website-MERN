import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ShoppingBag, UserPlus, Store, Package, Trash2, CheckCheck, Clock, RefreshCw, Info } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "../../api/NotificationApi";

// Helper to format relative time
const formatRelativeTime = (dateString) => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  } catch (e) {
    return "";
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);

    // Refresh when tab regains focus (e.g., user comes back from signup page)
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);

    // Event listener for outside click to close dropdown
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent triggering item click
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getIcon = (type) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "order":
        return <ShoppingBag className={`${iconClass} text-emerald-500`} />;
      case "user":
        return <UserPlus className={`${iconClass} text-blue-500`} />;
      case "vendor":
        return <Store className={`${iconClass} text-amber-500`} />;
      case "product":
        return <Package className={`${iconClass} text-indigo-500`} />;
      default:
        return <Info className={`${iconClass} text-slate-500`} />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case "order":
        return "bg-emerald-50 border-emerald-100";
      case "user":
        return "bg-blue-50 border-blue-100";
      case "vendor":
        return "bg-amber-50 border-amber-100";
      case "product":
        return "bg-indigo-50 border-indigo-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-gray hover:text-dark-navy hover:bg-slate-50 rounded-xl transition-all cursor-pointer outline-none focus:outline-none"
        aria-label="View notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-wiggle" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-light-border rounded-2xl shadow-xl z-50 overflow-hidden animate-slideDown">
          {/* Header */}
          <div className="px-4 py-3 border-b border-light-border/40 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">
                Notifications
              </h3>
              <p className="text-[10px] text-muted-gray font-bold mt-0.5">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                title="Refresh notifications"
                className="p-1 text-muted-gray hover:text-primary rounded-lg hover:bg-slate-100 cursor-pointer outline-none transition-colors"
              >
                <RefreshCw size={12} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-extrabold uppercase tracking-widest cursor-pointer outline-none"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-light-border/30 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50/80 relative group ${
                    !notif.isRead ? "bg-primary/5/10 font-medium" : ""
                  }`}
                >
                  {/* Icon Block */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center ${getBgClass(
                      notif.type
                    )}`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-6 text-left">
                    <p
                      className={`text-xs text-dark-navy leading-tight ${
                        !notif.isRead ? "font-extrabold" : "font-semibold"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-muted-gray mt-1 leading-normal break-words font-medium">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-gray/70 font-bold uppercase tracking-wider">
                      <Clock size={9} />
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions (Delete Icon) */}
                  <button
                    onClick={(e) => handleDelete(e, notif._id)}
                    className="absolute top-3.5 right-3.5 p-1 text-muted-gray/40 hover:text-red-500 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer outline-none"
                    title="Delete notification"
                  >
                    <Trash2 size={12} />
                  </button>

                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 right-3 w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-0 transition-transform" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 px-4 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-light-border/30 flex items-center justify-center mx-auto mb-3 text-muted-gray/60">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">
                  No Notifications
                </p>
                <p className="text-[10px] text-muted-gray/70 mt-1 font-semibold">
                  You are all caught up!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
