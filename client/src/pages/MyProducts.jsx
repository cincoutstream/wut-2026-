import { Button, Card, Empty, Image, List, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProducts, offShelfProduct } from "../api/product";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const fallbackImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f";

  const loadData = async () => {
    const res = await getMyProducts();
    setProducts(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card className="content-card" title="我的商品">
      {!products.length ? (
        <Empty description="你还没有发布商品" />
      ) : (
        <List
          dataSource={products}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link key="detail" to={`/products/${item.id}`}>
                  查看详情
                </Link>,
                <Link key="edit" to={`/products/${item.id}/edit`}>
                  编辑
                </Link>,
                item.status !== "off_shelf" ? (
                  <Button
                    key="offShelf"
                    type="link"
                    danger
                    onClick={async () => {
                      await offShelfProduct(item.id);
                      message.success("商品已下架");
                      loadData();
                    }}
                  >
                    下架
                  </Button>
                ) : null,
              ]}
            >
              <Space align="start" size={14}>
                <Image
                  src={item.imageUrl || fallbackImage}
                  alt={item.title}
                  width={84}
                  height={84}
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />
                <Space direction="vertical">
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Space wrap>
                    <Typography.Text>¥ {item.price}</Typography.Text>
                    <Tag>{item.category}</Tag>
                    <Tag color={item.status === "available" ? "green" : "default"}>{item.status}</Tag>
                  </Space>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
