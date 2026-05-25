import { Button, Card, Form, Input, InputNumber, Select, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetail, updateProduct } from "../api/product";
import ImageField from "../components/ImageField";

const statusOptions = [
  { label: "可交易", value: "available" },
  { label: "交易中", value: "trading" },
  { label: "已售出", value: "sold" },
  { label: "已下架", value: "off_shelf" },
];

const categoryOptions = ["教材", "电子产品", "生活用品", "数码配件", "其他"].map((item) => ({
  label: item,
  value: item,
}));

export default function ProductEdit() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getProductDetail(id);
      form.setFieldsValue({ ...res.data, imageUrl: res.data.imageUrl || "" });
    })();
  }, [form, id]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await updateProduct(id, values);
      message.success("商品更新成功");
      navigate(`/products/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="content-card" styles={{ body: { padding: 28 } }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          编辑商品
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存修改
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
