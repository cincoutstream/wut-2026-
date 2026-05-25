import {
  DeleteOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { getUser, isLoggedIn } from "../utils/auth";
import MessageInput from "./MessageInput";

function MessageItem({ item, level = 0, onReply, onDelete }) {
  const currentUser = getUser();
  const [replying, setReplying] = useState(false);
  const mine = currentUser?.id === item.userId;

  return (
    <div
      style={{
        marginLeft: level > 0 ? 24 : 0,
        paddingLeft: level > 0 ? 18 : 0,
        borderLeft: level > 0 ? "2px solid rgba(15, 118, 110, 0.14)" : "none",
      }}
    >
      <Card
        size="small"
        style={{
          borderRadius: 18,
          background: level > 0 ? "rgba(248, 250, 252, 0.95)" : "#fff",
          borderColor: "rgba(15, 118, 110, 0.12)",
          boxShadow: level > 0 ? "none" : "0 12px 28px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
            <Space align="start">
              <Avatar
                size={level > 0 ? 34 : 42}
                src={item.user?.avatar || undefined}
                icon={<UserOutlined />}
              />
              <Space direction="vertical" size={2}>
                <Space wrap>
                  <Typography.Text strong>
                    {item.user?.nickname || item.user?.username}
                  </Typography.Text>
                  {mine ? <Tag color="green">我的留言</Tag> : null}
                  {level > 0 ? <Tag>回复</Tag> : null}
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Typography.Text>
              </Space>
            </Space>

            <Space size={8}>
              {isLoggedIn() ? (
                <Button
                  type={replying ? "default" : "text"}
                  icon={<SendOutlined />}
                  onClick={() => setReplying((prev) => !prev)}
                >
                  {replying ? "收起" : "回复"}
                </Button>
              ) : null}
              {mine ? (
                <Popconfirm
                  title="确认删除这条留言吗？"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={() => onDelete(item.id)}
                >
                  <Button danger type="text" icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              ) : null}
            </Space>
          </Space>

          <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
            {item.content}
          </Typography.Paragraph>

          {replying ? (
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(15, 118, 110, 0.04)",
              }}
            >
              <MessageInput
                compact
                autoFocus
                submitText="发送回复"
                placeholder="输入你的回复内容"
                onSubmit={async (values) => {
                  await onReply(item.id, values);
                  setReplying(false);
                }}
              />
            </div>
          ) : null}
        </Space>
      </Card>

      {item.replies?.length ? (
        <Space direction="vertical" size={12} style={{ width: "100%", marginTop: 12 }}>
          {item.replies.map((reply) => (
            <MessageItem
              key={reply.id}
              item={reply}
              level={level + 1}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </Space>
      ) : null}
    </div>
  );
}

export default function MessageList({ messages, onReply, onDelete }) {
  if (!messages.length) {
    return <Empty description="还没有留言，快来发第一条吧" />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space align="center">
        <MessageOutlined style={{ color: "#0f766e" }} />
        <Typography.Text type="secondary">
          共 {messages.length} 条主留言，支持楼中楼回复
        </Typography.Text>
      </Space>
      <Divider style={{ margin: 0 }} />
      {messages.map((item) => (
        <MessageItem key={item.id} item={item} onReply={onReply} onDelete={onDelete} />
      ))}
    </Space>
  );
}
