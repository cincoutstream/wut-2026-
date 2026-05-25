import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    await register(values);
    message.success("注册成功，请登录");
    navigate("/login");
  };

  return (
    <div className="auth-wrap">
      <Card className="auth-card" styles={{ body: { padding: 36 } }}>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <Typography.Title level={2} style={{ marginBottom: 0 }}>
            创建账号
          </Typography.Title>
          <Typography.Text type="secondary">
            注册后即可发布商品、发起交易、留言和评价。
          </Typography.Text>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password />
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
            <Button type="primary" htmlType="submit" block size="large">
              注册
            </Button>
          </Form>
          <Typography.Text>
            已有账号？<Link to="/login">返回登录</Link>
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
