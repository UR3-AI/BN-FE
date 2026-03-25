import { useEffect, useRef, useState } from "react";

import {
  AccountIcon,
  BellIcon,
  ChevronRightIcon,
  CloudDoneIcon,
  FolderIcon,
  SearchIcon,
} from "@/mock/app/components/Icons";
import useLogoutMutation from "@/mock/lib/apis/mutations/auth/useLogoutMutation/useLogoutMutation";
import useReadAllNotificationsMutation from "@/mock/lib/apis/mutations/notifications/useReadAllNotificationsMutation/useReadAllNotificationsMutation";
import useReadNotificationMutation from "@/mock/lib/apis/mutations/notifications/useReadNotificationMutation/useReadNotificationMutation";
import useNotificationsQuery from "@/mock/lib/apis/queries/notifications/useNotificationsQuery/useNotificationsQuery";
import useUnreadCountQuery from "@/mock/lib/apis/queries/notifications/useUnreadCountQuery/useUnreadCountQuery";
import useAuthStore from "@lib/stores/useAuthStore/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

interface TopbarProps {
  title?: string;
  breadcrumb?: { label: string; active?: boolean }[];
  showSearch?: boolean;
}

const formatTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
};

const Topbar = ({
  title = "Cognitive Canvas",
  breadcrumb,
  showSearch = true,
}: TopbarProps) => {
  const queryClient = useQueryClient();
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notificationsData } = useNotificationsQuery({ limit: 10 });
  const readMutation = useReadNotificationMutation();
  const readAllMutation = useReadAllNotificationsMutation();
  const logoutMutation = useLogoutMutation();
  const { refreshToken, clearTokens } = useAuthStore();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setShowAccountMenu(false);
      }
    };
    if (isOpen || showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, showAccountMenu]);

  const handleReadNotification = (notificationId: string, isRead: boolean) => {
    if (isRead) return;
    readMutation.mutate(notificationId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });
  };

  const handleReadAll = () => {
    readAllMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });
  };

  const handleLogout = () => {
    if (refreshToken) {
      logoutMutation.mutate(
        { refresh_token: refreshToken },
        { onSettled: () => clearTokens() },
      );
    } else {
      clearTokens();
    }
  };

  const notifications = notificationsData?.items ?? [];
  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <header className="sticky top-0 z-20 flex h-[6.4rem] w-full items-center justify-between bg-surface px-[2.4rem] shadow-[0px_0px_32px_0px_rgba(229,226,225,0.06)]">
      <div className="flex items-center gap-[1.6rem]">
        <span className="font-headline text-[2rem] font-bold tracking-tighter text-primary">
          {title}
        </span>

        {breadcrumb && (
          <>
            <div className="hidden h-[1.6rem] w-px bg-outline-variant/30 sm:block" />
            <div className="hidden items-center gap-[0.8rem] text-[1.4rem] font-medium text-on-surface-variant sm:flex">
              <FolderIcon size="1.6rem" />
              {breadcrumb.map((item, i) => (
                <span
                  key={item.label}
                  className="flex items-center gap-[0.8rem]">
                  {i > 0 && <ChevronRightIcon size="1.2rem" />}
                  <span className={item.active ? "text-on-surface" : ""}>
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {showSearch && (
        <div className="mx-[3.2rem] hidden max-w-[40rem] flex-1 md:flex">
          <div className="group relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[1.2rem]">
              <SearchIcon
                size="2rem"
                className="text-on-surface-variant/50 transition-colors group-focus-within:text-primary"
              />
            </div>
            <input
              type="text"
              aria-label="Search notes, entities, or tasks"
              placeholder="Search notes, entities, or tasks..."
              className="block w-full rounded-[0.25rem] border border-outline-variant/20 bg-surface-container-low py-[0.6rem] pl-[4rem] pr-[4.8rem] text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-[1.2rem]">
              <kbd className="hidden items-center rounded-[0.25rem] border border-outline-variant/30 bg-surface-container px-[0.6rem] py-[0.2rem] text-[1rem] font-medium text-on-surface-variant/60 sm:inline-flex">
                <span className="mr-[0.2rem] text-[1.2rem]">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-[1.2rem]">
        <div className="hidden items-center gap-[0.8rem] rounded-[0.25rem] border-b border-outline-variant/20 bg-surface-container px-[1.2rem] py-[0.6rem] lg:flex">
          <CloudDoneIcon
            size="1.6rem"
            fill="#ffe2ab"
          />
          <span className="text-[1.1rem] font-medium tracking-wide text-on-surface-variant">
            SYNCED
          </span>
        </div>

        {/* Notification Bell + Dropdown */}
        <div
          ref={dropdownRef}
          className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="relative rounded-[0.375rem] p-[0.8rem] text-secondary opacity-80 transition-colors hover:bg-surface-container active:scale-95"
            aria-label="Notifications">
            <BellIcon size="2.4rem" />
            {unreadCount > 0 && (
              <span className="absolute -top-[0.2rem] -right-[0.2rem] flex h-[1.8rem] min-w-[1.8rem] items-center justify-center rounded-full bg-primary px-[0.4rem] text-[1rem] font-bold text-on-primary">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-[0.4rem] w-[36rem] rounded-[0.5rem] border border-outline-variant/20 bg-surface-container shadow-lg">
              <div className="flex items-center justify-between border-b border-outline-variant/10 px-[1.6rem] py-[1.2rem]">
                <h3 className="text-[1.3rem] font-bold text-on-surface">
                  Notifications
                </h3>
                {hasUnread && (
                  <button
                    type="button"
                    onClick={handleReadAll}
                    disabled={readAllMutation.isPending}
                    className="text-[1.1rem] font-medium text-primary hover:underline disabled:opacity-50">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[40rem] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-[1.6rem] py-[3.2rem] text-center text-[1.2rem] text-on-surface-variant">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleReadNotification(
                          notification.id,
                          notification.is_read,
                        )
                      }
                      className={`w-full px-[1.6rem] py-[1.2rem] text-left transition-colors hover:bg-surface-container-high ${
                        !notification.is_read ? "bg-primary/5" : ""
                      }`}>
                      <div className="flex items-start gap-[1.2rem]">
                        {!notification.is_read && (
                          <span className="mt-[0.6rem] h-[0.6rem] w-[0.6rem] shrink-0 rounded-full bg-primary" />
                        )}
                        <div
                          className={notification.is_read ? "pl-[1.8rem]" : ""}>
                          <p className="text-[1.2rem] font-semibold text-on-surface">
                            {notification.title}
                          </p>
                          <p className="mt-[0.2rem] text-[1.1rem] text-on-surface-variant line-clamp-2">
                            {notification.body}
                          </p>
                          <span className="mt-[0.4rem] block text-[1rem] text-outline">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account + Logout */}
        <div
          ref={accountRef}
          className="relative">
          <button
            type="button"
            onClick={() => setShowAccountMenu(prev => !prev)}
            className="rounded-[0.375rem] p-[0.8rem] text-secondary opacity-80 transition-colors hover:bg-surface-container active:scale-95"
            aria-label="Account">
            <AccountIcon size="2.4rem" />
          </button>
          {showAccountMenu && (
            <div className="absolute right-0 mt-[0.4rem] w-[18rem] rounded-[0.5rem] border border-outline-variant/20 bg-surface-container shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full px-[1.6rem] py-[1.2rem] text-left text-[1.3rem] font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
