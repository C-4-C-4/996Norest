import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store';

const AdminSettings = () => {
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  
  const [disclaimer, setDisclaimer] = useState('');
  const [homeTitle, setHomeTitle] = useState('');
  const [homeDescription, setHomeDescription] = useState('');
  const [footerDescription, setFooterDescription] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings.disclaimer) {
      setDisclaimer(settings.disclaimer);
    }
    if (settings.homeTitle) {
      setHomeTitle(settings.homeTitle);
    }
    if (settings.homeDescription) {
      setHomeDescription(settings.homeDescription);
    }
    if (settings.footerDescription) {
      setFooterDescription(settings.footerDescription);
    }
    if (settings.footerCopyright) {
      setFooterCopyright(settings.footerCopyright);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ disclaimer, homeTitle, homeDescription, footerDescription, footerCopyright });
      toast.success('设置已保存');
    } catch (error) {
      console.error(error);
      toast.error('保存失败，请检查网络');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">全局设置</h1>
        <p className="text-gray-400 mt-2">在这里可以修改网站的全局文案与配置</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-lg mb-8 flex gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-500" />
        <p><strong>注意：</strong> 修改后的内容将直接显示在所有访客的首页上，请确保文案准确无误且符合法律合规要求。</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-xl space-y-6">
        <div>
          <label className="block text-base font-medium text-white mb-2">
            首页大标题
          </label>
          <p className="text-sm text-gray-400 mb-3">
            网站的标语，支持使用方括号 <code className="bg-black/50 px-1 py-0.5 rounded text-danger">[文字]</code> 来将特定文字标记为红色醒目字体。例如：<code className="bg-black/50 px-1 py-0.5 rounded">公开的[秘密]，不再被掩盖</code>。
          </p>
          <input
            required
            type="text"
            value={homeTitle}
            onChange={(e) => setHomeTitle(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-danger transition-colors"
            placeholder="请输入首页大标题..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            首页副标题 / 描述
          </label>
          <p className="text-sm text-gray-400 mb-3">
            这段文字将显示在首页大标题的下方，作为整个网站的一句话简介。
          </p>
          <input
            required
            type="text"
            value={homeDescription}
            onChange={(e) => setHomeDescription(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-danger transition-colors"
            placeholder="请输入首页描述..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            首页免责声明
          </label>
          <p className="text-sm text-gray-400 mb-3">
            这段文字将显示在首页的顶部红色警告框中。
          </p>
          <textarea
            required
            value={disclaimer}
            onChange={(e) => setDisclaimer(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-danger min-h-[120px] transition-colors"
            placeholder="请输入免责声明..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            底部说明文案
          </label>
          <p className="text-sm text-gray-400 mb-3">
            显示在全站最底部的说明文字（支持多行）。第一行会默认带上一个警示小图标。
          </p>
          <textarea
            required
            value={footerDescription}
            onChange={(e) => setFooterDescription(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-danger min-h-[80px] transition-colors"
            placeholder="请输入底部说明文案..."
          />
        </div>

        <div>
          <label className="block text-base font-medium text-white mb-2">
            底部版权信息
          </label>
          <p className="text-sm text-gray-400 mb-3">
            显示在全站最底部的 Copyright 版权声明文字。
          </p>
          <input
            required
            type="text"
            value={footerCopyright}
            onChange={(e) => setFooterCopyright(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-danger transition-colors"
            placeholder="请输入版权信息..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-dark-border">
          <button
            type="submit"
            disabled={isSaving}
            className={`btn-danger flex items-center gap-2 px-8 py-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save className="w-5 h-5" />
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;