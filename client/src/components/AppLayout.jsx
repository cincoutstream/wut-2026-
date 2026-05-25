import {
  AppstoreOutlined,
  FormOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser, isLoggedIn } from "../utils/auth";

const { Header, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const loggedIn = isLoggedIn();

  const items = [
    { key: "/products", icon: <AppstoreOutlined />, label: "商品广场" },
    ...(loggedIn
      ? [
          { key: "/products/create", icon: <FormOutlined />, label: "发布商品" },
          { key: "/my/products", icon: <ShoppingCartOutlined />, label: "我的商品" },
          { key: "/my/buy-transactions", icon: <ShoppingCartOutlined />, label: "我发起的交易" },
          { key: "/my/sell-transactions", icon: <ShoppingCartOutlined />, label: "我收到的交易" },
          { key: "/profile", icon: <UserOutlined />, label: "个人信息" },
        ]
      : []),
  ];

  return (
    <Layout className="page-shell">
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(12px)",
          paddingInline: 24,
        }}
      >
        <Space size={18}>
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            校园二手交易系统
          </Typography.Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[items.find((item) => location.pathname.startsWith(item.key))?.key || "/products"]}
            items={items}
            onClick={({ key }) => navigate(key)}
            style={{ minWidth: 720, background: "transparent" }}
          />
        </Space>

        <Space>
          {loggedIn ? (
            <>
              <Typography.Text style={{ color: "#d1fae5" }}>
                {user?.nickname || user?.username}
              </Typography.Text>
              <Button
                icon={<LogoutOutlined />}
                onClick={() => {
                  clearAuth();
                  navigate("/login");
                }}
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Button icon={<LoginOutlined />} onClick={() => navigate("/login")}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                注册
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
