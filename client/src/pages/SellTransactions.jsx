import { Button, Descriptions, Empty, Image, Segmented, Space, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import {
  acceptTransaction,
  completeTransaction,
  getSellTransactions,
  rejectTransaction,
} from "../api/transaction";

const fallbackImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f";

const statusMap = {
  pending: { color: "gold", text: "待处理" },
  accepted: { color: "blue", text: "已接受" },
  rejected: { color: "red", text: "已拒绝" },
  completed: { color: "green", text: "已完成" },
  cancelled: { color: "default", text: "已取消" },
};

const statusOptions = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "pending" },
  { label: "已接受", value: "accepted" },
  { label: "已完成", value: "completed" },
  { label: "已拒绝", value: "rejected" },
];

export default function SellTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    const res = await getSellTransactions();
    setTransactions(res.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions =
    statusFilter === "all" ? transactions : transactions.filter((item) => item.status === statusFilter);
  const pendingCount = transactions.filter((item) => item.status === "pending").length;
  const acceptedCount = transactions.filter((item) => item.status === "accepted").length;

  return (
    <div className="transaction-page">
      <div className="transaction-hero">
        <div>
          <Typography.Title level={2}>我收到的交易</Typography.Title>
          <Typography.Text>查看买家联系方式与交易说明，及时处理接受、拒绝或完成。</Typography.Text>
        </div>
        <div className="transaction-summary">
          <div>
            <span>全部</span>
            <strong>{transactions.length}</strong>
          </div>
          <div>
            <span>待处理</span>
            <strong>{pendingCount}</strong>
          </div>
          <div>
            <span>已接受</span>
            <strong>{acceptedCount}</strong>
          </div>
        </div>
      </div>

      <section className="content-card transaction-card">
        <div className="transaction-toolbar">
          <Segmented value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          <Typography.Text type="secondary">共 {filteredTransactions.length} 条记录</Typography.Text>
        </div>
      {!filteredTransactions.length ? (
        <Empty description="暂时没有收到交易申请" />
      ) : (
        <div className="transaction-list">
          {filteredTransactions.map((item) => {
            const status = statusMap[item.status] || statusMap.pending;

            return (
              <article
                key={item.id}
                className="transaction-item"
              >
                <Space align="start" size={16} className="transaction-row">
                  <Image
                    src={item.product?.imageUrl || fallbackImage}
                    alt={item.product?.title}
                    width={96}
                    height={96}
                    className="transaction-thumb"
                  />
                  <Space direction="vertical" size={10} className="transaction-main">
                    <div className="transaction-title-line">
                      <Typography.Text strong>{item.product?.title}</Typography.Text>
                      <Tag color={status.color}>{status.text}</Tag>
                    </div>
                    <Space wrap>
                      <Tag>{item.product?.category || "未分类"}</Tag>
                      {item.product?.price ? <Typography.Text>¥ {item.product.price}</Typography.Text> : null}
                    </Space>
                    <Descriptions column={1} size="small" className="transaction-descriptions">
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
                    <Space wrap className="transaction-actions">
                      {item.status === "pending" ? (
                        <Button
                          type="primary"
                          onClick={async () => {
                            await acceptTransaction(item.id);
                            message.success("已接受交易");
                            loadData();
                          }}
                        >
                          接受
                        </Button>
                      ) : null}
                      {item.status === "pending" ? (
                        <Button
                          danger
                          onClick={async () => {
                            await rejectTransaction(item.id);
                            message.success("已拒绝交易");
                            loadData();
                          }}
                        >
                          拒绝
                        </Button>
                      ) : null}
                      {item.status === "accepted" ? (
                        <Button
                          type="primary"
                          onClick={async () => {
                            await completeTransaction(item.id);
                            message.success("交易已完成");
                            loadData();
                          }}
                        >
                          完成交易
                        </Button>
                      ) : null}
                    </Space>
                  </Space>
                </Space>
              </article>
            );
          })}
        </div>
      )}
      </section>
    </div>
  );
}
