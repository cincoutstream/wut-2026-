import { Button, Descriptions, Empty, Image, Segmented, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBuyTransactions } from "../api/transaction";

const fallbackImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f";

const statusMap = {
  pending: { color: "gold", text: "待处理" },
  accepted: { color: "blue", text: "卖家已接受" },
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

export default function BuyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const res = await getBuyTransactions();
      setTransactions(res.data || []);
    })();
  }, []);

  const filteredTransactions =
    statusFilter === "all" ? transactions : transactions.filter((item) => item.status === statusFilter);
  const pendingCount = transactions.filter((item) => item.status === "pending").length;
  const completedCount = transactions.filter((item) => item.status === "completed").length;

  return (
    <div className="transaction-page">
      <div className="transaction-hero">
        <div>
          <Typography.Title level={2}>我发起的交易</Typography.Title>
          <Typography.Text>查看申请进度、卖家联系方式和面交说明，完成后可以评价。</Typography.Text>
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
            <span>已完成</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </div>

      <section className="content-card transaction-card">
        <div className="transaction-toolbar">
          <Segmented value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          <Typography.Text type="secondary">共 {filteredTransactions.length} 条记录</Typography.Text>
        </div>
      {!filteredTransactions.length ? (
        <Empty description="还没有交易记录" />
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
                    <Space wrap className="transaction-actions">
                      <Button type="primary" ghost>
                        <Link to={`/products/${item.product?.id}`}>查看商品</Link>
                      </Button>
                      {item.status === "completed" ? (
                        <Button>
                          <Link to={`/transactions/${item.id}/review`}>去评价</Link>
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
