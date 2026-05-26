import {
  AppstoreOutlined,
  FormOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser, isLoggedIn } from "../utils/auth";
import NotificationBell from "./NotificationBell";

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
          { key: "/my/buy-transactions", icon: <SwapOutlined />, label: "我发起的交易" },
          { key: "/my/sell-transactions", icon: <SwapOutlined />, label: "我收到的交易" },
          { key: "/profile", icon: <UserOutlined />, label: "个人信息" },
        ]
      : []),
  ];
  const selectedKey =
    items
      .filter((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))
      .sort((a, b) => b.key.length - a.key.length)[0]?.key || "/products";

  return (
    <Layout className="page-shell">
      <Header className="app-header">
        <div className="app-header-inner">
          <Space size={14} className="brand" onClick={() => navigate("/products")}>
            <span className="brand-mark">
              <ShopOutlined />
            </span>
            <span>
              <Typography.Title level={4} className="brand-title">
                校园二手交易
              </Typography.Title>
              <Typography.Text className="brand-subtitle">Campus Market</Typography.Text>
            </span>
          </Space>
          <Menu
            className="app-nav"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={({ key }) => navigate(key)}
          />

          <Space className="header-actions">
            {loggedIn ? (
              <>
                <NotificationBell />
                <span className="user-pill">
                  <UserOutlined />
                  <span>{user?.nickname || user?.username}</span>
                </span>
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
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
}
