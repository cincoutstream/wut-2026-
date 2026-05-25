import { Button, Card, Descriptions, Empty, List, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import {
  acceptTransaction,
  completeTransaction,
  getSellTransactions,
  rejectTransaction,
} from "../api/transaction";

const statusMap = {
  pending: { color: "gold", text: "待处理" },
  accepted: { color: "blue", text: "已接受" },
  rejected: { color: "red", text: "已拒绝" },
  completed: { color: "green", text: "已完成" },
  cancelled: { color: "default", text: "已取消" },
};

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
          renderItem={(item) => {
            const status = statusMap[item.status] || statusMap.pending;

            return (
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
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Typography.Text strong>{item.product?.title}</Typography.Text>
                  <Space wrap>
                    <Tag color={status.color}>{status.text}</Tag>
                  </Space>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="买家">
                      {item.buyer?.nickname || item.buyer?.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="买家手机号">
                      {item.buyer?.phone ? (
                        <Typography.Text copyable>{item.buyer.phone}</Typography.Text>
                      ) : (
                        <Typography.Text type="secondary">买家暂未填写</Typography.Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="交易说明">
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
