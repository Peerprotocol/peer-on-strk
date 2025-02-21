"use client";
import { ChevronDown, MoveDown, X } from "lucide-react";
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
        setShowScrollHint(scrollTop + clientHeight < scrollHeight);
      }
    };

    if (scrollRef.current) {
      checkScroll(); // Initial check
      scrollRef.current.addEventListener("scroll", checkScroll);
    }

    return () => {
      scrollRef.current?.removeEventListener("scroll", checkScroll);
    };
  }, [groupedNotifications]);

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

        <div
          ref={scrollRef}
          className="space-y-4 w-full  max-h-[350px] overflow-y-auto scrollbar-hide"
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

        {showScrollHint && (
          <div>
            <MoveDown className="h-6 w-6 text-gray-400 animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
