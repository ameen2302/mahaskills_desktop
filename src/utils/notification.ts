import { message, notification } from "antd";
import { NotificationPlacement } from "antd/lib/notification";
import React from "react";
type NotificationType = "success" | "error" | "warning" | "info";
export const handleNotification = (
  type: NotificationType,
  message: string,
  placement?: NotificationPlacement,
  duration?: number,
  key?: string,
  closeIcon?: React.ReactNode | null
) => {
  notification[type]({
    message: message,
    placement,
    duration,
    key,
    closeIcon,
  });
};

notification.config({ maxCount: 3 });
message.config({ maxCount: 1 });
