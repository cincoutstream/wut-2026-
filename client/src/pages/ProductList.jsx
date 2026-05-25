import { Button, Col, Input, Row, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { getProducts } from "../api/product";
import ProductCard from "../components/ProductCard";

const categoryOptions = ["教材", "电子产品", "生活用品", "数码配件", "其他"].map((item) => ({
  label: item,
  value: item,
}));

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", category: "", status: "available" });

  const fetchProducts = async () => {
    const res = await getProducts({ ...filters, page: 1, pageSize: 20 });
    setProducts(res.data.list || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div className="hero-panel">
        <Typography.Title level={2} style={{ color: "#fff", marginTop: 0 }}>
          校园闲置，在这里重新流转
        </Typography.Title>
        <Typography.Paragraph style={{ color: "rgba(255,255,255,0.86)", maxWidth: 720 }}>
          支持商品发布、留言沟通、交易申请和评价闭环，适合课程作业展示与系统演示。
        </Typography.Paragraph>
      </div>

      <Space wrap>
        <Input
          placeholder="搜索商品关键词"
          style={{ width: 220 }}
          value={filters.keyword}
          onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
        />
        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 180 }}
          options={categoryOptions}
          value={filters.category || undefined}
          onChange={(value) => setFilters((prev) => ({ ...prev, category: value || "" }))}
        />
        <Select
          style={{ width: 160 }}
          value={filters.status}
          options={[
            { label: "可交易", value: "available" },
            { label: "交易中", value: "trading" },
            { label: "已售出", value: "sold" },
            { label: "已下架", value: "off_shelf" },
          ]}
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
        />
        <Button type="primary" onClick={fetchProducts}>
          搜索
        </Button>
      </Space>

      <Row gutter={[18, 18]}>
        {products.map((product) => (
          <Col key={product.id} xs={24} sm={12} lg={8}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Space>
  );
}
