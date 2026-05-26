import {
  DeleteOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Empty,
  Image,
  Popconfirm,
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
    <div className={`message-item${level > 0 ? " is-reply" : ""}`}>
      <article className="message-bubble">
        <div className="message-head">
          <div className="message-author">
            <Avatar
              size={level > 0 ? 34 : 40}
              src={item.user?.avatar || undefined}
              icon={<UserOutlined />}
            />
            <div>
              <div className="message-author-name">
                <Typography.Text strong>
                  {item.user?.nickname || item.user?.username}
                </Typography.Text>
                {mine ? <Tag color="blue">我的留言</Tag> : null}
                {level > 0 ? <Tag>回复</Tag> : null}
              </div>
              <span className="message-time">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="message-actions">
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
          </div>
        </div>

        <Typography.Paragraph className="message-text">{item.content}</Typography.Paragraph>
        {item.imageUrl ? (
          <div className="message-image">
            <Image src={item.imageUrl} alt="留言图片" className="message-image-img" />
          </div>
        ) : null}

        {replying ? (
          <div className="message-reply-panel">
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
      </article>

      {item.replies?.length ? (
        <div className="message-replies">
          {item.replies.map((reply) => (
            <MessageItem
              key={reply.id}
              item={reply}
              level={level + 1}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MessageList({ messages, onReply, onDelete }) {
  if (!messages.length) {
    return (
      <div className="message-empty">
        <Empty description="还没有留言，快来发第一条吧" />
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="message-thread-head">
        <span className="message-thread-head-main">
          <MessageOutlined />
          留言讨论
        </span>
        <span>共 {messages.length} 条主留言</span>
      </div>
      <div className="message-thread-list">
        {messages.map((item) => (
          <MessageItem key={item.id} item={item} onReply={onReply} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
