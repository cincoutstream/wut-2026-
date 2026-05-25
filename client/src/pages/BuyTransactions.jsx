import { Button, Card, Descriptions, Empty, List, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBuyTransactions } from "../api/transaction";

const statusMap = {
  pending: { color: "gold", text: "待处理" },
  accepted: { color: "blue", text: "卖家已接受" },
  rejected: { color: "red", text: "已拒绝" },
  completed: { color: "green", text: "已完成" },
  cancelled: { color: "default", text: "已取消" },
};

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
          renderItem={(item) => {
            const status = statusMap[item.status] || statusMap.pending;

            return (
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
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Typography.Text strong>{item.product?.title}</Typography.Text>
                  <Space wrap>
                    <Tag color={status.color}>{status.text}</Tag>
                  </Space>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="卖家">
                      {item.seller?.nickname || item.seller?.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="卖家手机号">
                      {item.seller?.phone ? (
                        <Typography.Text copyable>{item.seller.phone}</Typography.Text>
                      ) : (
                        <Typography.Text type="secondary">卖家暂未填写</Typography.Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="我的交易说明">
                      {item.remark || "无备注"}
                    </Descriptions.Item>
                  </Descriptions>
                </Space>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}
