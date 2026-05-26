import { BellOutlined, CheckOutlined, SwapOutlined } from "@ant-design/icons";
import { Badge, Button, Empty, Popover, Tag, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notification";

const typeColorMap = {
  transaction_created: "blue",
  transaction_accepted: "green",
  transaction_rejected: "red",
  transaction_completed: "purple",
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data?.list || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const timer = window.setInterval(refreshUnreadCount, 30000);
    return () => window.clearInterval(timer);
  }, [refreshUnreadCount]);

  const handleOpenChange = async (nextOpen) => {
      setOpen(nextOpen);
    if (!nextOpen) {
      return;
    }
    try {
      await refreshNotifications();
    } catch {
      message.warning("暂时无法获取消息提醒");
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationRead(item.id);
      }
    } catch {
      message.warning("消息已打开，但标记已读失败");
    }
    setOpen(false);
    setUnreadCount((count) => Math.max(0, count - (item.isRead ? 0 : 1)));
    setNotifications((list) =>
      list.map((notification) =>
        notification.id === item.id ? { ...notification, isRead: true } : notification
      )
    );
    if (item.targetPath) {
      navigate(item.targetPath);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((list) => list.map((item) => ({ ...item, isRead: true })));
      message.success("已全部标记为已读");
    } catch {
      message.error("标记失败，请稍后重试");
    }
  };

  const content = (
    <div className="notification-panel">
      <div className="notification-panel-head">
        <div>
          <Typography.Text strong>消息提醒</Typography.Text>
          <Typography.Text type="secondary">交易申请和状态变化会出现在这里</Typography.Text>
        </div>
        <Button size="small" icon={<CheckOutlined />} onClick={handleReadAll} disabled={!unreadCount}>
          全部已读
        </Button>
      </div>

      {!notifications.length ? (
        <div className="notification-empty">
          <Empty description={loading ? "正在加载提醒" : "暂无消息提醒"} />
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notification-item${item.isRead ? "" : " is-unread"}`}
              onClick={() => handleNotificationClick(item)}
            >
              <span className="notification-icon">
                <SwapOutlined />
              </span>
              <span className="notification-body">
                <span className="notification-title-line">
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Tag color={typeColorMap[item.type] || "default"}>
                    {item.isRead ? "已读" : "未读"}
                  </Tag>
                </span>
                <Typography.Text type="secondary">{item.content}</Typography.Text>
                <Typography.Text type="secondary" className="notification-time">
                  {new Date(item.createdAt).toLocaleString()}
                </Typography.Text>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      placement="bottomRight"
      overlayClassName="notification-popover"
    >
      <Button
        className="notification-trigger"
        icon={
          <Badge count={unreadCount} size="small" overflowCount={99}>
            <BellOutlined />
          </Badge>
        }
      >
        提醒
      </Button>
    </Popover>
  );
}
