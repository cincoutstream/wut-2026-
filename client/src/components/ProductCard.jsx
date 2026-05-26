import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Rate, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const fallbackImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f";

const statusMap = {
  available: { color: "green", text: "可交易" },
  trading: { color: "gold", text: "交易中" },
  sold: { color: "red", text: "已售出" },
  off_shelf: { color: "default", text: "已下架" },
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const status = statusMap[product.status] || statusMap.available;
  const sellerName = product.user?.nickname || product.user?.username || "匿名同学";
  const price = Number(product.price || 0).toFixed(Number(product.price || 0) % 1 ? 1 : 0);
  const openDetail = () => navigate(`/products/${product.id}`);

  return (
    <article
      className="product-card"
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          openDetail();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="product-card-media">
        <img src={product.imageUrl || fallbackImage} alt={product.title} />
        <Tag className="product-status-tag" color={status.color}>
          {status.text}
        </Tag>
        <div className="product-price-ribbon">¥ {price}</div>
      </div>

      <div className="product-card-body">
        <div className="product-card-topline">
          <Tag className="category-tag">{product.category || "未分类"}</Tag>
          <span className="detail-link">
            查看 <ArrowRightOutlined />
          </span>
        </div>

        <Typography.Title level={4} className="product-card-title">
          {product.title}
        </Typography.Title>
        <Typography.Paragraph className="product-card-desc" ellipsis={{ rows: 2 }}>
          {product.description || "暂无描述"}
        </Typography.Paragraph>

        <div className="product-card-meta">
          <div className="seller-mini">
            <Avatar size={28} src={product.user?.avatar || undefined} icon={<UserOutlined />} />
            <span>{sellerName}</span>
          </div>
          <Typography.Text className="product-location">校内面交</Typography.Text>
        </div>

        <div className="seller-rating">
          {product.user?.ratingCount ? (
            <>
              <Rate disabled allowHalf value={product.user.ratingAvg} style={{ fontSize: 14 }} />
              <Typography.Text type="secondary">
                {product.user.ratingAvg.toFixed(1)} / {product.user.ratingCount} 条评价
              </Typography.Text>
            </>
          ) : (
            <Typography.Text type="secondary">暂无评分</Typography.Text>
          )}
        </div>
      </div>
    </article>
  );
}
