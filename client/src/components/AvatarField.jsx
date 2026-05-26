import { InboxOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Segmented, Space, Typography, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { compressImage } from "../utils/image";

export default function AvatarField({ value, onChange, fallbackText }) {
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
      const dataUrl = await compressImage(file, 360, 0.78);
      onChange?.(dataUrl);
      setMode("upload");
      message.success("头像已完成压缩并载入预览");
    } catch (error) {
      message.error("头像读取失败，请更换图片后重试");
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <Space direction="vertical" size={12} className="avatar-field">
      <div className="avatar-preview-row">
        <Avatar
          size={82}
          src={currentValue || undefined}
          icon={!currentValue && !fallbackText ? <UserOutlined /> : undefined}
        >
          {fallbackText}
        </Avatar>
        <div>
          <Typography.Text strong>头像预览</Typography.Text>
          <Typography.Text type="secondary">
            支持图片链接，也支持本地图片压缩后保存，适合较长的 data URL。
          </Typography.Text>
        </div>
      </div>

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
          className="avatar-uploader"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽头像图片到这里</p>
          <p className="ant-upload-hint">系统会压缩为适合头像展示的尺寸，再保存到个人信息</p>
        </Upload.Dragger>
      ) : (
        <Input.TextArea
          value={currentValue}
          onChange={(event) => onChange?.(event.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          placeholder="请输入图片 URL 或 data:image 开头的头像地址"
        />
      )}

      {currentValue ? (
        <Button onClick={() => onChange?.("")}>清空头像</Button>
      ) : null}
    </Space>
  );
}
