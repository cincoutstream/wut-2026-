import { Button, Card, Empty, List, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import {
  acceptTransaction,
  completeTransaction,
  getSellTransactions,
  rejectTransaction,
} from "../api/transaction";

export default function SellTransactions() {
  const [transactions, setTransactions] = useState([]);

  const loadData = async () => {
    const res = await getSellTransactions();
    setTransactions(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card className="content-card" title="我收到的交易申请">
      {!transactions.length ? (
        <Empty description="暂时没有收到交易申请" />
      ) : (
        <List
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item
              actions={[
                item.status === "pending" ? (
                  <Button
                    key="accept"
                    type="link"
                    onClick={async () => {
                      await acceptTransaction(item.id);
                      message.success("已接受交易");
                      loadData();
                    }}
                  >
                    接受
                  </Button>
                ) : null,
                item.status === "pending" ? (
                  <Button
                    key="reject"
                    type="link"
                    danger
                    onClick={async () => {
                      await rejectTransaction(item.id);
                      message.success("已拒绝交易");
                      loadData();
                    }}
                  >
                    拒绝
                  </Button>
                ) : null,
                item.status === "accepted" ? (
                  <Button
                    key="complete"
                    type="link"
                    onClick={async () => {
                      await completeTransaction(item.id);
                      message.success("交易已完成");
                      loadData();
                    }}
                  >
                    完成交易
                  </Button>
                ) : null,
              ]}
            >
              <Space direction="vertical">
                <Typography.Text strong>{item.product?.title}</Typography.Text>
                <Space>
                  <Typography.Text>买家：{item.buyer?.nickname || item.buyer?.username}</Typography.Text>
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
