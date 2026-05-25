import { Card, Descriptions, Rate, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const statusMap = {
  available: { color: "green", text: "可交易" },
  trading: { color: "gold", text: "交易中" },
  sold: { color: "red", text: "已售出" },
  off_shelf: { color: "default", text: "已下架" },
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const status = statusMap[product.status] || statusMap.available;

  return (
    <Card
      hoverable
      className="content-card"
      onClick={() => navigate(`/products/${product.id}`)}
      styles={{ body: { cursor: "pointer" } }}
      cover={
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"}
          alt={product.title}
          style={{ height: 220, width: "100%", objectFit: "cover" }}
        />
      }
    >
      <Typography.Title level={4}>{product.title}</Typography.Title>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="价格">¥ {product.price}</Descriptions.Item>
        <Descriptions.Item label="分类">{product.category || "未分类"}</Descriptions.Item>
        <Descriptions.Item label="卖家">{product.user?.nickname || product.user?.username}</Descriptions.Item>
        <Descriptions.Item label="卖家信誉">
          {product.user?.ratingCount ? (
            <>
              <Rate disabled allowHalf value={product.user.ratingAvg} style={{ fontSize: 14 }} />
              <Typography.Text style={{ marginLeft: 8 }}>
                {product.user.ratingAvg.toFixed(1)} / {product.user.ratingCount} 条
              </Typography.Text>
            </>
          ) : (
            <Typography.Text type="secondary">暂无评分</Typography.Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={status.color}>{status.text}</Tag>
        </Descriptions.Item>
      </Descriptions>
      <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 12 }}>
        {product.description || "暂无描述"}
      </Typography.Paragraph>
    </Card>
  );
}
