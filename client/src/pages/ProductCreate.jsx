import { Button, Card, Form, Input, InputNumber, Select, Space, Typography, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api/product";
import ImageField from "../components/ImageField";

const categoryOptions = ["教材", "电子产品", "生活用品", "数码配件", "其他"].map((item) => ({
  label: item,
  value: item,
}));

export default function ProductCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const res = await createProduct(values);
      message.success("商品发布成功");
      navigate(`/products/${res.data.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="content-card" styles={{ body: { padding: 28 } }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          发布商品
        </Typography.Title>
        <Typography.Text type="secondary">
          支持本地上传图片、即时预览和提交前压缩，更适合作业演示。
        </Typography.Text>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ category: "教材", imageUrl: "" }}
        >
          <Form.Item label="商品标题" name="title" rules={[{ required: true, message: "请输入商品标题" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="商品描述" name="description">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="价格" name="price" rules={[{ required: true, message: "请输入价格" }]}>
            <InputNumber min={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item label="商品图片" name="imageUrl" valuePropName="value" trigger="onChange">
            <ImageField />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交发布
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
