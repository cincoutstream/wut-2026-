import {
  Avatar,
  Button,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
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

const fallbackImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f";
const tradeSteps = ["填写申请", "卖家确认", "线下面交", "完成评价"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [product, setProduct] = useState(null);
  const [messagesData, setMessagesData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sellerReviewSummary, setSellerReviewSummary] = useState(null);
  const [transactionForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [remarkOpen, setRemarkOpen] = useState(false);
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
    <div className="detail-page">
      <section className="detail-hero">
        <div className="detail-gallery">
          <div className="detail-image-frame">
            <img src={product.imageUrl || fallbackImage} alt={product.title} />
            <Tag className="detail-status" color={status.color}>
              {status.text}
            </Tag>
          </div>
          <div className="detail-mini-summary">
            <div>
              <span>分类</span>
              <strong>{product.category || "未分类"}</strong>
            </div>
            <div>
              <span>留言</span>
              <strong>{messagesData.length}</strong>
            </div>
            <div>
              <span>评价</span>
              <strong>{reviews.length}</strong>
            </div>
          </div>
        </div>

        <div className="detail-info-panel">
          <div className="detail-heading">
            <div>
              <Typography.Title level={1}>{product.title}</Typography.Title>
              <Typography.Text className="muted-text">{product.description || "暂无描述"}</Typography.Text>
            </div>
            <Typography.Text className="detail-price">¥ {product.price}</Typography.Text>
          </div>

          <div className="seller-panel">
            <Space align="center">
              <Avatar src={product.user?.avatar || undefined} size={52} icon={<UserOutlined />} />
              <Space direction="vertical" size={1}>
                <Typography.Text strong>
                  {product.user?.nickname || product.user?.username}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {product.user?.phone || "暂未填写联系方式"}
                </Typography.Text>
              </Space>
            </Space>
            <Space direction="vertical" align="end" size={2}>
              <Rate disabled allowHalf value={sellerAvg} />
              <Typography.Text>
                {sellerCount ? `${sellerAvg.toFixed(1)} 分 / ${sellerCount} 条评价` : "暂无评价"}
              </Typography.Text>
            </Space>
          </div>

          <div className="detail-stat-strip">
            <div>
              <MessageOutlined />
              <span>留言数</span>
              <strong>{messagesData.length}</strong>
            </div>
            <div>
              <StarOutlined />
              <span>商品评价</span>
              <strong>{reviews.length}</strong>
            </div>
            <div>
              <TrophyOutlined />
              <span>卖家口碑</span>
              <strong>{sellerCount ? sellerAvg.toFixed(1) : "暂无"}</strong>
            </div>
          </div>

          <div className="trade-flow">
            <div className="flow-title">
              <CheckCircleOutlined />
              <Typography.Text strong>交易流程</Typography.Text>
            </div>
            <div className="flow-steps">
              {tradeSteps.map((step, index) => (
                <span key={step} className="flow-step">
                  <span>{index + 1}</span>
                  {step}
                </span>
              ))}
            </div>
          </div>

          <Descriptions column={1} size="middle" className="detail-descriptions">
            <Descriptions.Item label="交易说明">
              {product.status === "available" ? "当前可申请交易，建议在申请中写清面交时间和地点。" : "当前商品不在可交易状态。"}
            </Descriptions.Item>
          </Descriptions>

          <Space wrap>
            {canBuy ? (
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  if (!currentUser?.phone?.trim()) {
                    message.warning("请先在个人信息中填写手机号，方便卖家联系你");
                    navigate("/profile");
                    return;
                  }
                  setRemarkOpen(true);
                }}
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
        </div>
      </section>

      <Row gutter={[24, 24]} className="detail-lower">
        <Col xs={24} xl={14}>
          <section className="content-card section-card detail-section">
            <div className="section-title-row">
              <Typography.Title level={3}>商品留言</Typography.Title>
              <Typography.Text type="secondary">共 {messagesData.length} 条</Typography.Text>
            </div>
            {isLoggedIn() ? (
              <div className="message-compose">
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
          </section>
        </Col>

        <Col xs={24} xl={10}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <section className="content-card section-card detail-section">
              <div className="section-title-row">
                <Typography.Title level={3}>商品成交评价</Typography.Title>
                {reviews.length ? (
                  <Space>
                    <Rate disabled allowHalf value={reviewAverage} />
                    <Typography.Text>{reviewAverage.toFixed(1)}</Typography.Text>
                  </Space>
                ) : null}
              </div>
              <ReviewList reviews={reviews} />
            </section>

            <section className="content-card section-card detail-section">
              <div className="section-title-row">
                <Typography.Title level={3}>卖家历史评价</Typography.Title>
                {sellerCount ? (
                  <Space>
                    <Rate disabled allowHalf value={sellerAvg} />
                    <Typography.Text>{sellerAvg.toFixed(1)}</Typography.Text>
                  </Space>
                ) : null}
              </div>
              <ReviewList reviews={sellerReviewSummary?.reviews || []} />
            </section>
          </Space>
        </Col>
      </Row>

      <Modal
        title="发起交易申请"
        open={remarkOpen}
        onCancel={() => {
          if (!transactionSubmitting) {
            setRemarkOpen(false);
            transactionForm.resetFields();
          }
        }}
        confirmLoading={transactionSubmitting}
        onOk={async () => {
          setTransactionSubmitting(true);
          try {
            const values = await transactionForm.validateFields();
            await createTransaction(id, { remark: values.remark.trim() });
            message.success("交易申请已发送");
            transactionForm.resetFields();
            setRemarkOpen(false);
          } finally {
            setTransactionSubmitting(false);
          }
        }}
      >
        <div className="modal-note">
          <EnvironmentOutlined />
          <Typography.Paragraph style={{ margin: 0 }}>
            请填写见面时间、交易地点和补充说明。你的手机号和交易说明会展示给卖家，方便卖家确认后联系你。
          </Typography.Paragraph>
        </div>
        <Form form={transactionForm} layout="vertical">
          <Form.Item
            label="交易说明"
            name="remark"
            rules={[
              { required: true, whitespace: true, message: "请填写交易时间、地点或联系方式说明" },
              { max: 500, message: "交易说明不能超过 500 字" },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder="例如：今晚 7 点教学楼门口可以面交，我的手机号可以直接联系"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
