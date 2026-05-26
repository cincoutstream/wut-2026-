import { Button, Card, Form, Input, Rate, Skeleton, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createReview, updateReview } from "../api/review";
import { getBuyTransactions, getSellTransactions } from "../api/transaction";
import MessageImageField from "../components/MessageImageField";

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [transaction, setTransaction] = useState(null);
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [buyRes, sellRes] = await Promise.all([getBuyTransactions(), getSellTransactions()]);
        const buyTransaction = (buyRes.data || []).find((item) => String(item.id) === String(id));
        const sellTransaction = (sellRes.data || []).find((item) => String(item.id) === String(id));
        const currentTransaction = buyTransaction || sellTransaction || null;
        const currentRole = buyTransaction ? "buyer" : "seller";

        setTransaction(currentTransaction);
        setRole(currentRole);
        if (currentTransaction?.myReview) {
          form.setFieldsValue({
            rating: currentTransaction.myReview.rating,
            content: currentTransaction.myReview.content,
            imageUrl: currentTransaction.myReview.imageUrl || "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [form, id]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (transaction?.myReview?.id) {
        await updateReview(transaction.myReview.id, values);
        message.success("评价已更新");
      } else {
        await createReview(id, values);
        message.success("评价提交成功");
      }
      navigate(role === "seller" ? "/my/sell-transactions" : "/my/buy-transactions");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (!transaction) {
    return (
      <Card className="content-card" styles={{ body: { padding: 28 } }}>
        <Space direction="vertical" size={12}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            未找到交易记录
          </Typography.Title>
          <Typography.Text type="secondary">只有交易相关用户可以评价这笔交易。</Typography.Text>
          <Button>
            <Link to="/my/buy-transactions">返回交易记录</Link>
          </Button>
        </Space>
      </Card>
    );
  }

  const hasReviewed = Boolean(transaction.myReview);
  const targetUser = role === "seller" ? transaction.buyer : transaction.seller;
  const targetLabel = role === "seller" ? "买家" : "卖家";
  const backPath = role === "seller" ? "/my/sell-transactions" : "/my/buy-transactions";

  return (
    <Card className="content-card" styles={{ body: { padding: 28 } }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Space align="center" wrap>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {hasReviewed ? "修改交易评价" : "发布交易评价"}
          </Typography.Title>
          {hasReviewed ? <Tag color="green">已评价</Tag> : <Tag color="blue">待评价</Tag>}
        </Space>
        <Typography.Text type="secondary">
          你正在评价{targetLabel}：{targetUser?.nickname || targetUser?.username || "对方用户"}。
          双方评价会进入信誉记录，帮助后续交易判断。
        </Typography.Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="评分" name="rating" rules={[{ required: true, message: "请选择评分" }]}>
            <Rate />
          </Form.Item>
          <Form.Item label="评价内容" name="content" rules={[{ required: true, message: "请输入评价内容" }]}>
            <Input.TextArea rows={5} maxLength={500} />
          </Form.Item>
          <Form.Item label="评价图片" name="imageUrl">
            <MessageImageField />
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {hasReviewed ? "保存修改" : "提交评价"}
            </Button>
            <Button>
              <Link to={backPath}>返回交易记录</Link>
            </Button>
          </Space>
        </Form>
      </Space>
    </Card>
  );
}
