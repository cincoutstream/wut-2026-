import { Avatar, Card, Empty, Rate, Space, Tag, Typography } from "antd";
import { StarFilled, UserOutlined } from "@ant-design/icons";

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return <Empty description="暂无评价" />;
  }

  return (
    <Space direction="vertical" size={14} style={{ width: "100%" }}>
      {reviews.map((item) => (
        <Card
          key={item.id}
          style={{
            borderRadius: 18,
            borderColor: "rgba(245, 158, 11, 0.16)",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
              <Space align="start">
                <Avatar src={item.reviewer?.avatar || undefined} icon={<UserOutlined />} />
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>
                    {item.reviewer?.nickname || item.reviewer?.username}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    评价对象：{item.targetUser?.nickname || item.targetUser?.username}
                  </Typography.Text>
                </Space>
              </Space>
              <Space direction="vertical" size={2} align="end">
                <Rate disabled value={item.rating} />
                <Tag color="gold" icon={<StarFilled />}>
                  {item.rating} 分
                </Tag>
              </Space>
            </Space>

            <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
              {item.content}
            </Typography.Paragraph>
          </Space>
        </Card>
      ))}
    </Space>
  );
}
