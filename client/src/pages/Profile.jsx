import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useEffect } from "react";
import { getProfile, updateProfile } from "../api/user";
import AvatarField from "../components/AvatarField";
import { setAuth, getToken } from "../utils/auth";

export default function Profile() {
  const [form] = Form.useForm();
  const nickname = Form.useWatch("nickname", form);
  const username = Form.useWatch("username", form);

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
          <Form.Item label="QQ" name="qq" rules={[{ max: 30, message: "QQ 号不能超过 30 个字符" }]}>
            <Input placeholder="可选，方便交易双方联系" />
          </Form.Item>
          <Form.Item label="微信" name="wechat" rules={[{ max: 80, message: "微信号不能超过 80 个字符" }]}>
            <Input placeholder="可选，填写后会展示给交易对方" />
          </Form.Item>
          <Form.Item label="头像" name="avatar">
            <AvatarField fallbackText={nickname?.[0] || username?.[0]} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存信息
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
