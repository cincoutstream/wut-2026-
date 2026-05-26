import { PictureOutlined } from "@ant-design/icons";
import { Button, Image, Upload, message } from "antd";
import { useState } from "react";
import { compressImage } from "../utils/image";

export default function MessageImageField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

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
      const dataUrl = await compressImage(file, 900, 0.78);
      onChange?.(dataUrl);
      message.success("图片已添加到留言");
    } catch (error) {
      message.error("图片读取失败，请更换图片后重试");
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <div className="message-image-field">
      <Upload
        accept="image/*"
        multiple={false}
        showUploadList={false}
        beforeUpload={handleFile}
        disabled={uploading}
      >
        <Button icon={<PictureOutlined />} loading={uploading} className="image-upload-button">
          添加图片
        </Button>
      </Upload>
      {value ? (
        <div className="message-image-preview">
          <Image
            src={value}
            alt="留言图片预览"
            className="message-image-preview-img"
          />
          <Button size="small" type="text" onClick={() => onChange?.("")}>
            移除图片
          </Button>
        </div>
      ) : null}
    </div>
  );
}
