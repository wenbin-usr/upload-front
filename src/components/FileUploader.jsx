import { useState } from 'react';
import { Upload, Progress, message, Tag } from 'antd';
import { InboxOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const statusMap = {
  uploading: { color: 'processing', label: '上传中' },
  done: { color: 'success', label: '成功' },
  error: { color: 'error', label: '失败' },
};

function FileList({ fileList }) {
  if (fileList.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {fileList.map((file) => (
        <div
          key={file.uid}
          style={{
            padding: '8px 12px',
            border: '1px solid #f0f0f0',
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }} title={file.name}>
              {file.name.length > 30 ? file.name.slice(0, 27) + '...' : file.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#999', fontSize: 12 }}>{formatSize(file.size)}</span>
              <Tag
                color={statusMap[file.status]?.color}
                icon={
                  file.status === 'done' ? (
                    <CheckCircleOutlined />
                  ) : file.status === 'error' ? (
                    <CloseCircleOutlined />
                  ) : null
                }
              >
                {statusMap[file.status]?.label || file.status}
              </Tag>
            </div>
          </div>
          {file.status === 'uploading' && (
            <Progress percent={file.percent} size="small" style={{ marginTop: 4 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function FileUploader() {
  const [fileList, setFileList] = useState([]);

  const customRequest = async (options) => {
    const { file, onProgress, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress({ percent });
          }
        },
      });
      onSuccess({}, file);
      message.success(`${file.name} 上传成功`);
    } catch (err) {
      onError(err);
      message.error(`${file.name} 上传失败`);
    }
  };

  const handleChange = ({ fileList: newList }) => {
    setFileList(newList);
  };

  return (
    <div>
      <Dragger
        multiple
        customRequest={customRequest}
        fileList={fileList}
        onChange={handleChange}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持单个或批量上传</p>
      </Dragger>
      <FileList fileList={fileList} />
    </div>
  );
}

export default FileUploader;
