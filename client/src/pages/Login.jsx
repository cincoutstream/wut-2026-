import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setAuth } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const res = await login(values);
    setAuth(res.data.token, res.data.user);
    message.success("登录成功");
    navigate("/products");
  };

  return (
    <div className="auth-wrap">
      <Card className="auth-card" styles={{ body: { padding: 36 } }}>
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <Typography.Title level={2} style={{ marginBottom: 0 }}>
            欢迎回来
          </Typography.Title>
          <Typography.Text type="secondary">
            使用账号登录校园二手交易系统，体验完整的商品发布与交易流程。
          </Typography.Text>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input placeholder="例如 seller01" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form>
          <Typography.Text>
            还没有账号？<Link to="/register">立即注册</Link>
          </Typography.Text>
          <Typography.Text type="secondary">
            演示账号：`seller01 / 123456`，`buyer01 / 123456`
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
