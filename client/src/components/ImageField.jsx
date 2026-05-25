import { InboxOutlined, LinkOutlined } from "@ant-design/icons";
import { Button, Image as AntImage, Input, Segmented, Space, Typography, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { compressImage } from "../utils/image";

export default function ImageField({ value, onChange }) {
  const [mode, setMode] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const currentValue = value || "";

  useEffect(() => {
    if (currentValue.startsWith("http")) {
      setMode("url");
    }
  }, [currentValue]);

  const handleFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("请选择图片文件");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("原图请控制在 5MB 以内");
      return Upload.LIST_IGNORE;
    }

    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setMode("upload");
      onChange?.(dataUrl);
      message.success("图片已完成压缩并载入预览");
    } catch (error) {
      message.error("图片读取失败，请更换图片后重试");
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { label: "本地上传", value: "upload" },
          { label: "图片链接", value: "url" },
        ]}
      />

      {mode === "upload" ? (
        <Upload.Dragger
          accept="image/*"
          multiple={false}
          showUploadList={false}
          beforeUpload={handleFile}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到这里上传</p>
          <p className="ant-upload-hint">
            前端会自动压缩图片，再以可预览的数据形式提交，体验更适合作业演示
          </p>
        </Upload.Dragger>
      ) : (
          <Input
          value={currentValue}
          onChange={(event) => onChange?.(event.target.value)}
          prefix={<LinkOutlined />}
          placeholder="请输入图片 URL"
        />
      )}

      {currentValue ? (
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text type="secondary">图片预览</Typography.Text>
          <AntImage
            src={currentValue}
            alt="商品预览"
            width={240}
            style={{ borderRadius: 16, objectFit: "cover" }}
          />
          <Button onClick={() => onChange?.("")}>清空图片</Button>
        </Space>
      ) : null}
    </Space>
  );
}
