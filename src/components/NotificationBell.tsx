"use client";

import { Bell, Check, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  role?: "employer" | "candidate";
}

export function NotificationBell({ role = "candidate" }: NotificationBellProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data;
    if (!data) return;

    const goToInvitation = (id: string) => {
      if (role === "employer") {
        router.push(`/employer/invitations?id=${id}`);
      } else {
        router.push(`/candidate/invitations/${id}`);
      }
    };

    try {
      switch (notification.type) {
        case "invitation_received":
        case "invitation_cancelled":
        case "invitation_accepted":
        case "invitation_declined":
        case "invitation_sent":
        case "interview_scheduled":
        case "interview_confirmed":
        case "interview_cancelled":
        case "interview_rescheduled":
        case "interview_completed":
        case "offer_received":
        case "offer_withdrawn":
        case "offer_accepted":
        case "offer_declined":
          if (data.invitation_id) {
            goToInvitation(data.invitation_id);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    // Return appropriate icon or styling based on notification type
    const baseClasses = "w-2 h-2 rounded-full";
    
    if (
      type.includes("accepted") ||
      type.includes("confirmed") ||
      type.includes("offer_received")
    ) {
      return <span className={cn(baseClasses, "bg-green-500")} />;
    }
    
    if (
      type.includes("declined") ||
      type.includes("cancelled") ||
      type.includes("withdrawn")
    ) {
      return <span className={cn(baseClasses, "bg-red-500")} />;
    }
    
    if (
      type.includes("scheduled") ||
      type.includes("sent") ||
      type.includes("received")
    ) {
      return <span className={cn(baseClasses, "bg-blue-500")} />;
    }
    
    return <span className={cn(baseClasses, "bg-gray-500")} />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative",
                  !notification.is_read && "bg-accent/50"
                )}
              >
                <DropdownMenuItem
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              </div>
            ))}
          </ScrollArea>
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
