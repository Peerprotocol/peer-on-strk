"use client";
import { CircleArrowDown, X } from "lucide-react";
import { Raleway } from "next/font/google";
import React, { useEffect, useRef, useState } from "react";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const NotificationModal = ({
  isOpen,
  onClose,
  walletAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}) => {
  const [notifications, setNotifications] = useState<
    { id: number; message: string; timestamp: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/database/notifications?user_address=${walletAddress}`
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        setError(data.message || "Failed to fetch notifications.");
      }
    } catch (err) {
      setError("Error fetching notifications.");
    } finally {
      setLoading(false);
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return formatDate(dateString); // If it's older than a week, show the full date
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Categorize notifications
  const groupedNotifications: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    Other: [],
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
        setShowScrollHint(!atBottom);
      }
    };

    if (scrollRef.current) {
      checkScroll(); // Initial check
      scrollRef.current.addEventListener("scroll", checkScroll);
    }

    return () => {
      scrollRef.current?.removeEventListener("scroll", checkScroll);
    };
  }, [notifications]);

  sortedNotifications.forEach((notif) => {
    const notifDate = new Date(notif.timestamp);
    if (notifDate.toDateString() === today.toDateString()) {
      groupedNotifications.Today.push(notif);
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      groupedNotifications.Yesterday.push(notif);
    } else {
      const formattedDate = formatDate(notif.timestamp);
      if (!groupedNotifications[formattedDate]) {
        groupedNotifications[formattedDate] = [];
      }
      groupedNotifications[formattedDate].push(notif);
    }
  });

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 rounded-[30px] flex items-center justify-center z-50 ${raleway.className}`}
    >
      <div className="bg-white rounded-[30px] w-[95vw] md:w-[700px] relative flex flex-col text-black items-center justify-center">
        <div className="size-[40px] rounded-full flex justify-center items-center border-[1px] border-black absolute top-4 right-4 cursor-pointer">
          {" "}
          <X className="text-black h-[19px] w-[19px] " onClick={onClose} />
        </div>

        <p className="font-medium text-2xl py-6 text-black">Notification</p>

        {loading ? (
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-10 h-10 text-gray-200 animate-spin mb-5 dark:text-gray-600 fill-gray-800"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 text-lg font-semibold text-center py-4">No notifications</p>
        ) : (
          <div
            ref={scrollRef}
            className="space-y-4 w-full  max-h-[700px] overflow-y-auto scrollbar-hide"
          >
            {Object.entries(groupedNotifications).map(([group, items]) =>
              items.length > 0 ? (
                <div key={group}>
                  <h3 className="text-[15px] font-semibold text-gray-400 mt-7 px-10">
                    {group}
                  </h3>
                  <ul className="mt-2 ">
                    {items.map((notif) => (
                      <li
                        key={notif.id}
                        className=" p-3 px-10  flex flex-col border-t-[1px] border-gray-200 text-[17px] "
                      >
                        <span>{notif.message}</span>
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(notif.timestamp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        )}

        {showScrollHint && !loading && (
          <div className="py-2">
            <CircleArrowDown className="h-6 w-6 text-gray-400 animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
