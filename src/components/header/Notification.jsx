import { Bell, User, CheckCircle, Users } from "lucide-react";
import { useState, useEffect, useRef, useContext } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AppContext } from "../../Context/AppContext";
import { getRequest } from "../../Helpers";


dayjs.extend(relativeTime);

const getIconByRole = (role) => {
  switch (role) {
    case "Admin":
      return Bell;
    case "Teacher":
      return Bell;
    case "Student":
      return Bell;
    default:
      return Bell;
  }
};

const Notification = () => {
  const { user } = useContext(AppContext);
  const role = user?.user?.role;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  /* ================= FETCH NOTICES ================= */
  const fetchNotifications = async () => {
    try {
      const res = await getRequest("notices?page=1&limit=5");
      const notices = res?.data?.data?.notices || [];

      const formatted = notices.map((n) => ({
        id: n._id,
        title: n.title,
        description: n.description,
        sender: n.senderUser?.name,
        senderRole: n.sender?.role,
        time: dayjs(n.createdAt).fromNow(),
        unread: true, // backend se aaye to replace
        icon: getIconByRole(n.sender?.role),
      }));

      setNotifications(formatted);
    } catch (err) {
      console.error("Notification fetch failed", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HELPERS ================= */
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  /* ================= UI ================= */
  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-600 transition"
      >
        <Bell size={24} className="text-white" />

        {/* {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )} */}
      </button>

      {/* 📩 Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-3 w-[360px] bg-white shadow-2xl rounded-xl border z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-50">
            <h3 className="font-semibold text-gray-800 text-sm">
              Notifications
            </h3>
            {/* <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all as read
            </button> */}
          </div>

          {/* Content */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b last:border-none cursor-pointer transition ${
                      n.unread ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`h-9 w-9 flex items-center justify-center rounded-full ${
                        n.unread
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {n.description}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {n.sender} ({n.senderRole})
                        </span>
                        <span className="text-xs text-gray-400">
                          {n.time}
                        </span>
                      </div>
                    </div>

                    {/* Unread Dot */}
                    {/* {n.unread && (
                      <span className="h-2 w-2 mt-2 rounded-full bg-blue-500"></span>
                    )} */}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {/* <div className="px-4 py-2 text-center bg-gray-50">
            <a
              href="/communication"
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              View all notices
            </a>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Notification;
