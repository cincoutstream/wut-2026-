import { Button, Card, Empty, List, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBuyTransactions } from "../api/transaction";

export default function BuyTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getBuyTransactions();
      setTransactions(res.data || []);
    })();
  }, []);

  return (
    <Card className="content-card" title="我发起的交易">
      {!transactions.length ? (
        <Empty description="还没有交易记录" />
      ) : (
        <List
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Link key="detail" to={`/products/${item.product?.id}`}>
                  查看商品
                </Link>,
                item.status === "completed" ? (
                  <Button key="review" type="link">
                    <Link to={`/transactions/${item.id}/review`}>去评价</Link>
                  </Button>
                ) : null,
              ]}
            >
              <Space direction="vertical">
                <Typography.Text strong>{item.product?.title}</Typography.Text>
                <Space>
                  <Typography.Text>卖家：{item.seller?.nickname || item.seller?.username}</Typography.Text>
                  <Tag color={item.status === "pending" ? "gold" : item.status === "completed" ? "green" : "default"}>
                    {item.status}
                  </Tag>
                </Space>
                <Typography.Text type="secondary">{item.remark || "无备注"}</Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
