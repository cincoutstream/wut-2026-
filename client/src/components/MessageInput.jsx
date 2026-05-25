import { Button, Form, Input, Space } from "antd";
import { useState } from "react";
import MessageImageField from "./MessageImageField";

export default function MessageInput({
  onSubmit,
  placeholder = "请输入留言内容",
  submitText = "提交",
  compact = false,
  autoFocus = false,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        name="content"
        style={{ marginBottom: compact ? 10 : 14 }}
        rules={[{ required: true, message: "请输入内容" }]}
      >
        <Input.TextArea
          autoFocus={autoFocus}
          rows={compact ? 2 : 4}
          maxLength={500}
          placeholder={placeholder}
          showCount
        />
      </Form.Item>
      <Form.Item name="imageUrl" style={{ marginBottom: compact ? 10 : 14 }}>
        <MessageImageField />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {submitText}
        </Button>
      </Space>
    </Form>
  );
}
