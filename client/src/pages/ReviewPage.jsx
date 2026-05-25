import { Button, Card, Form, Input, Rate, Space, Typography, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { createReview } from "../api/review";

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    await createReview(id, values);
    message.success("评价提交成功");
    navigate("/my/buy-transactions");
  };

  return (
    <Card className="content-card" styles={{ body: { padding: 28 } }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          发布交易评价
        </Typography.Title>
        <Typography.Text type="secondary">
          仅已完成交易的相关用户可以进行评价。
        </Typography.Text>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="评分" name="rating" rules={[{ required: true, message: "请选择评分" }]}>
            <Rate />
          </Form.Item>
          <Form.Item label="评价内容" name="content" rules={[{ required: true, message: "请输入评价内容" }]}>
            <Input.TextArea rows={5} maxLength={500} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            提交评价
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
