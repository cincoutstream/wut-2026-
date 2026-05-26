import { ArrowRightOutlined, FireOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Select, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/product";
import ProductCard from "../components/ProductCard";
import { isLoggedIn } from "../utils/auth";

const categoryOptions = ["教材", "电子产品", "生活用品", "数码配件", "其他"].map((item) => ({
  label: item,
  value: item,
}));

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", category: "", status: "available" });

  const fetchProducts = async (nextFilters = filters) => {
    const res = await getProducts({ ...nextFilters, page: 1, pageSize: 20 });
    setProducts(res.data.list || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    fetchProducts(nextFilters);
  };

  const stats = useMemo(() => {
    const categories = new Set(products.map((item) => item.category).filter(Boolean));
    const avgPrice = products.length
      ? products.reduce((sum, item) => sum + Number(item.price || 0), 0) / products.length
      : 0;

    return [
      { label: "当前展示", value: `${products.length}`, suffix: "件" },
      { label: "覆盖分类", value: `${categories.size || 0}`, suffix: "类" },
      { label: "平均价格", value: `¥${avgPrice ? avgPrice.toFixed(0) : "0"}`, suffix: "" },
    ];
  }, [products]);
  const featuredProduct = products[0];

  return (
    <div className="market-page">
      <section className="market-spotlight">
        <div className="spotlight-copy">
          <Typography.Title level={1}>校园二手交易广场</Typography.Title>
          <Typography.Paragraph>
            发现同学发布的教材、数码和宿舍好物，按分类、状态和关键词快速找到合适的闲置。
          </Typography.Paragraph>
          <Space wrap>
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => fetchProducts()}>
              搜索商品
            </Button>
            {isLoggedIn() ? (
              <Button size="large" icon={<PlusOutlined />} onClick={() => navigate("/products/create")}>
                发布商品
              </Button>
            ) : null}
          </Space>
        </div>
        {featuredProduct ? (
          <article className="spotlight-card" onClick={() => navigate(`/products/${featuredProduct.id}`)}>
            <img src={featuredProduct.imageUrl} alt={featuredProduct.title} />
            <div className="spotlight-card-content">
              <Tag color="green">{featuredProduct.category || "未分类"}</Tag>
              <Typography.Title level={3}>{featuredProduct.title}</Typography.Title>
              <div>
                <strong>¥ {featuredProduct.price}</strong>
                <span>
                  查看详情 <ArrowRightOutlined />
                </span>
              </div>
            </div>
          </article>
        ) : null}
      </section>

      <section className="market-body">
        <aside className="market-sidebar">
          <div className="sidebar-block">
            <Typography.Title level={5}>筛选商品</Typography.Title>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Input
                placeholder="搜索商品关键词"
                prefix={<SearchOutlined />}
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                onPressEnter={() => fetchProducts()}
              />
              <Select
                placeholder="选择分类"
                allowClear
                options={categoryOptions}
                value={filters.category || undefined}
                onChange={(value) => setFilters((prev) => ({ ...prev, category: value || "" }))}
              />
              <Select
                value={filters.status}
                options={[
                  { label: "可交易", value: "available" },
                  { label: "交易中", value: "trading" },
                  { label: "已售出", value: "sold" },
                  { label: "已下架", value: "off_shelf" },
                ]}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              />
              <Button type="primary" block icon={<SearchOutlined />} onClick={() => fetchProducts()}>
                搜索
              </Button>
            </Space>
          </div>

          <div className="sidebar-block">
            <Typography.Title level={5}>快速分类</Typography.Title>
            <div className="category-filter-list">
              {categoryOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filters.category === item.value ? "is-active" : ""}
                  onClick={() => applyFilters({ ...filters, category: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-stats">
            {stats.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>
                  {item.value}
                  <small>{item.suffix}</small>
                </strong>
              </div>
            ))}
          </div>
        </aside>

        <div className="market-main">
          <div className="market-main-head">
            <div>
              <Typography.Title level={2}>最新商品</Typography.Title>
              <Typography.Text type="secondary">共 {products.length} 件商品</Typography.Text>
            </div>
            <Tag icon={<FireOutlined />} color="blue">
              校内面交
            </Tag>
          </div>

          {products.length ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <Empty description="没有找到符合条件的商品" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
