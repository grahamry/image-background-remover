'use client';

import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, Download, UploadCloud, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

type RemoveBgResult = {
  before: string;
  after: string;
};

type RequestStatus = 'idle' | 'requesting' | 'success' | 'failed';

export function RemoveBgUploader() {
  const { getToken, isSignedIn } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<RemoveBgResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const pushDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const line = `[${timestamp}] ${message}`;

    setDebugLogs((prev) => {
      return [line, ...prev].slice(0, 20);
    });
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('文件过大。最大支持 4MB。');
      setStatus('failed');
      setSelectedFile(null);
      pushDebugLog(`文件校验失败：大小超限 ${file.size} bytes`);
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件格式。仅支持 PNG 和 JPEG。');
      setStatus('failed');
      setSelectedFile(null);
      pushDebugLog(`文件校验失败：不支持类型 ${file.type || 'unknown'}`);
      return;
    }

    setError(null);
    setStatus('idle');
    setSelectedFile(file);
    setResult(null);
    pushDebugLog(`文件已选择：${file.name} (${file.size} bytes)`);
  }, [pushDebugLog]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  const handleRemoveBg = async () => {
    if (!selectedFile) {
      setError('请先选择图片。');
      setStatus('failed');
      pushDebugLog('请求终止：未选择图片');
      return;
    }

    if (!isSignedIn) {
      setError('未登录，正在跳转到登录页...');
      setStatus('failed');
      pushDebugLog('请求终止：用户未登录，准备跳转登录页');

      const signInPath = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in';
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `${signInPath}?redirect_url=${redirectUrl}`;
      return;
    }

    setIsUploading(true);
    setError(null);
    setStatus('requesting');
    pushDebugLog('开始请求 /api/remove-bg');

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('登录状态失效，请重新登录。');
      }
      pushDebugLog('已获取鉴权 Token');

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      pushDebugLog(`接口响应状态：${response.status}`);

      if (!response.ok) {
        let errorMessage = 'Failed to remove background';
        const errorText = await response.text();

        if (errorText) {
          try {
            const errorData = JSON.parse(errorText) as { error?: string };
            errorMessage = errorData.error || errorText || errorMessage;
          } catch {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const beforeUrl = URL.createObjectURL(selectedFile);
      const afterUrl = URL.createObjectURL(blob);

      setResult({ before: beforeUrl, after: afterUrl });
      setStatus('success');
      pushDebugLog(`抠图成功：返回 ${blob.size} bytes`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setStatus('failed');
      pushDebugLog(`抠图失败：${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }

    const link = document.createElement('a');
    link.href = result.after;
    link.download = `removed-bg-${Date.now()}.png`;
    link.click();
    pushDebugLog('用户下载处理结果图片');
  };

  const statusTextMap: Record<RequestStatus, string> = {
    idle: '待处理',
    requesting: '请求中（AI 正在处理）',
    success: '成功',
    failed: '失败',
  };

  const statusClassMap: Record<RequestStatus, string> = {
    idle: 'bg-gray-100 text-gray-700 border-gray-200',
    requesting: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const fileInputId = 'remove-bg-file-input';

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
          Remove Backgrounds in 3 Seconds
        </h1>
        <p className="text-xl text-muted-foreground">
          Zero Data Stored. AI-Powered Magic.
        </p>
      </div>

      <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${statusClassMap[status]}`}>
        状态：
        {statusTextMap[status]}
      </div>

      {!result
        ? (
            <label
              htmlFor={fileInputId}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`
            cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200
            ${selectedFile
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
            >
              <input
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                }}
                className="hidden"
              />

              {selectedFile
                ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3 text-green-600">
                        <CheckCircle2 className="size-8" />
                        <span className="text-lg font-medium">{selectedFile.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.size > 1024 * 1024
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(selectedFile.size / 1024).toFixed(2)} KB`}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRemoveBg();
                          }}
                          disabled={isUploading}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isUploading ? '处理中...' : '开始抠图'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setStatus('idle');
                            setError(null);
                            pushDebugLog('用户移除已选图片');
                          }}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          移除文件
                        </button>
                      </div>
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      <UploadCloud className="mx-auto size-16 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">点击或拖拽上传图片</p>
                        <p className="mt-2 text-sm text-muted-foreground">支持 PNG、JPEG 格式，最大 4MB</p>
                      </div>
                    </div>
                  )}
            </label>
          )
        : (
            <div className="space-y-6">
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setSelectedFile(null);
                    setStatus('idle');
                    setError(null);
                    pushDebugLog('用户准备重新上传');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:opacity-90"
                >
                  <UploadCloud className="size-5" />
                  <span>重新上传</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800"
                >
                  <Download className="size-5" />
                  <span>Download HD</span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-center text-lg font-semibold">Before</h3>
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={result.before}
                      alt="Original"
                      className="size-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-center text-lg font-semibold">After</h3>
                  <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={result.after}
                      alt="Removed Background"
                      className="size-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="size-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-muted/30 p-4">
        <div className="mb-2 text-sm font-semibold">Debug 日志（最近 20 条）</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {debugLogs.length > 0
            ? debugLogs.map(log => <div key={log}>{log}</div>)
            : <div>暂无日志</div>}
        </div>
      </div>
    </div>
  );
}
