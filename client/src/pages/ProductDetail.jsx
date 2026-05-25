import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  Modal,
  Rate,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  MessageOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createMessage, deleteMessage, getMessages, replyMessage } from "../api/message";
import { getProductDetail } from "../api/product";
import { getProductReviews, getUserReviews } from "../api/review";
import { createTransaction } from "../api/transaction";
import MessageInput from "../components/MessageInput";
import MessageList from "../components/MessageList";
import ReviewList from "../components/ReviewList";
import { getUser, isLoggedIn } from "../utils/auth";

const statusMap = {
  available: { color: "green", text: "可交易" },
  trading: { color: "gold", text: "交易中" },
  sold: { color: "red", text: "已售出" },
  off_shelf: { color: "default", text: "已下架" },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [product, setProduct] = useState(null);
  const [messagesData, setMessagesData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sellerReviewSummary, setSellerReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [remarkValue, setRemarkValue] = useState("");
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const detailRes = await getProductDetail(id);
      const sellerId = detailRes.data?.user?.id;
      const [messageRes, reviewRes, sellerReviewRes] = await Promise.all([
        getMessages(id),
        getProductReviews(id),
        sellerId ? getUserReviews(sellerId) : Promise.resolve({ data: null }),
      ]);

      setProduct(detailRes.data);
      setMessagesData(messageRes.data || []);
      setReviews(reviewRes.data || []);
      setSellerReviewSummary(sellerReviewRes.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!product) {
    return <Empty description="商品不存在或已被删除" />;
  }

  const canBuy = isLoggedIn() && currentUser?.id !== product.userId && product.status === "available";
  const status = statusMap[product.status] || statusMap.available;
  const reviewAverage = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
    : 0;
  const sellerAvg = sellerReviewSummary?.ratingAvg || product.user?.ratingAvg || 0;
  const sellerCount = sellerReviewSummary?.ratingCount || product.user?.ratingCount || 0;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <div
            className="content-card"
            style={{
              minHeight: 420,
              borderRadius: 24,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"}
              alt={product.title}
              style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
            />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="content-card" styles={{ body: { padding: 28 } }}>
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              <Space style={{ justifyContent: "space-between", width: "100%" }} align="start">
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {product.title}
                </Typography.Title>
                <Tag color={status.color}>{status.text}</Tag>
              </Space>

              <Typography.Title level={3} style={{ color: "#0f766e", margin: 0 }}>
                ¥ {product.price}
              </Typography.Title>

              <Descriptions column={1} size="middle">
                <Descriptions.Item label="分类">{product.category || "未分类"}</Descriptions.Item>
                <Descriptions.Item label="卖家">
                  {product.user?.nickname || product.user?.username}
                </Descriptions.Item>
                <Descriptions.Item label="联系方式">
                  {product.user?.phone || "暂未填写"}
                </Descriptions.Item>
                <Descriptions.Item label="商品描述">
                  {product.description || "暂无描述"}
                </Descriptions.Item>
              </Descriptions>

              <Card
                size="small"
                style={{
                  borderRadius: 18,
                  background: "linear-gradient(180deg, rgba(250,204,21,0.12), rgba(250,204,21,0.03))",
                }}
              >
                <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                  <Space align="start">
                    <Avatar src={product.user?.avatar || undefined} size={48} icon={<UserOutlined />} />
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>
                        {product.user?.nickname || product.user?.username}
                      </Typography.Text>
                      <Typography.Text type="secondary">卖家历史信誉</Typography.Text>
                    </Space>
                  </Space>
                  <Space direction="vertical" align="end" size={2}>
                    <Rate disabled allowHalf value={sellerAvg} />
                    <Typography.Text>
                      {sellerCount ? `${sellerAvg.toFixed(1)} 分 / ${sellerCount} 条评价` : "暂无评价"}
                    </Typography.Text>
                  </Space>
                </Space>
              </Card>

              <Row gutter={12}>
                <Col span={8}>
                  <Card size="small" style={{ borderRadius: 16 }}>
                    <Statistic title="留言数" value={messagesData.length} prefix={<MessageOutlined />} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ borderRadius: 16 }}>
                    <Statistic title="商品评价" value={reviews.length} prefix={<StarOutlined />} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ borderRadius: 16 }}>
                    <Statistic
                      title="卖家口碑"
                      value={sellerCount ? sellerAvg.toFixed(1) : "暂无"}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Space wrap>
                {canBuy ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => setRemarkOpen(true)}
                  >
                    发起交易申请
                  </Button>
                ) : null}
                {!isLoggedIn() ? (
                  <Button size="large" onClick={() => navigate("/login")}>
                    登录后参与交易和留言
                  </Button>
                ) : null}
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Card
            className="content-card"
            title="商品留言"
            extra={<Typography.Text type="secondary">提问、追问、补充都可以在这里完成</Typography.Text>}
          >
            {isLoggedIn() ? (
              <div
                style={{
                  marginBottom: 22,
                  padding: 18,
                  borderRadius: 18,
                  background: "linear-gradient(180deg, rgba(15,118,110,0.06), rgba(15,118,110,0.02))",
                }}
              >
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  发表评论或提问
                </Typography.Title>
                <MessageInput
                  onSubmit={async (values) => {
                    await createMessage(id, values);
                    message.success("留言成功");
                    loadProduct();
                  }}
                  placeholder="例如：这件商品现在还在吗？可以什么时候交易？"
                  submitText="发布留言"
                />
              </div>
            ) : (
              <Typography.Text type="secondary">登录后可参与留言和回复互动。</Typography.Text>
            )}

            <MessageList
              messages={messagesData}
              onReply={async (messageId, values) => {
                await replyMessage(id, messageId, values);
                message.success("回复成功");
                loadProduct();
              }}
              onDelete={async (messageId) => {
                await deleteMessage(messageId);
                message.success("留言已删除");
                loadProduct();
              }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Card
              className="content-card"
              title="商品成交评价"
              extra={
                reviews.length ? (
                  <Space>
                    <Rate disabled allowHalf value={reviewAverage} />
                    <Typography.Text>{reviewAverage.toFixed(1)}</Typography.Text>
                  </Space>
                ) : null
              }
            >
              <ReviewList reviews={reviews} />
            </Card>

            <Card
              className="content-card"
              title="卖家历史评价"
              extra={
                sellerCount ? (
                  <Space>
                    <Rate disabled allowHalf value={sellerAvg} />
                    <Typography.Text>{sellerAvg.toFixed(1)}</Typography.Text>
                  </Space>
                ) : null
              }
            >
              <ReviewList reviews={sellerReviewSummary?.reviews || []} />
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal
        title="发起交易申请"
        open={remarkOpen}
        onCancel={() => {
          if (!transactionSubmitting) {
            setRemarkOpen(false);
          }
        }}
        confirmLoading={transactionSubmitting}
        onOk={async () => {
          setTransactionSubmitting(true);
          try {
            await createTransaction(id, { remark: remarkValue });
            message.success("交易申请已发送");
            setRemarkValue("");
            setRemarkOpen(false);
          } finally {
            setTransactionSubmitting(false);
          }
        }}
      >
        <Typography.Paragraph>
          可以补充见面时间、交易地点或其他说明，方便卖家尽快确认。
        </Typography.Paragraph>
        <Input.TextArea
          value={remarkValue}
          onChange={(e) => setRemarkValue(e.target.value)}
          rows={4}
          maxLength={500}
          showCount
          placeholder="例如：今晚 7 点教学楼门口可以面交"
        />
      </Modal>
    </Space>
  );
}
