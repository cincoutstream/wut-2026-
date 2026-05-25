import { Avatar, Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useEffect } from "react";
import { getProfile, updateProfile } from "../api/user";
import { setAuth, getToken } from "../utils/auth";

export default function Profile() {
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      const res = await getProfile();
      form.setFieldsValue(res.data);
    })();
  }, [form]);

  const onFinish = async (values) => {
    const res = await updateProfile(values);
    setAuth(getToken(), res.data);
    message.success("个人信息已更新");
  };

  return (
    <Card className="content-card" styles={{ body: { padding: 28 } }}>
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          个人信息
        </Typography.Title>
        <Avatar size={72} src={form.getFieldValue("avatar")}>
          {form.getFieldValue("nickname")?.[0] || form.getFieldValue("username")?.[0]}
        </Avatar>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item label="用户名" name="username">
            <Input disabled />
          </Form.Item>
          <Form.Item label="昵称" name="nickname">
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1\d{10}$/, message: "请输入 11 位手机号" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="头像地址" name="avatar">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存信息
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
