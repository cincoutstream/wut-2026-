import { Button, Form, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
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
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      className={`message-input${compact ? " message-input-compact" : ""}`}
    >
      <Form.Item
        name="content"
        className="message-content-field"
        rules={[{ required: true, message: "请输入内容" }]}
      >
        <Input.TextArea
          className="message-textarea"
          autoFocus={autoFocus}
          rows={compact ? 2 : 4}
          maxLength={500}
          placeholder={placeholder}
          showCount
        />
      </Form.Item>
      <div className="message-input-footer">
        <Form.Item name="imageUrl" className="message-image-form-item">
          <MessageImageField />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          icon={<SendOutlined />}
          className="message-submit"
        >
          {submitText}
        </Button>
      </div>
    </Form>
  );
}
