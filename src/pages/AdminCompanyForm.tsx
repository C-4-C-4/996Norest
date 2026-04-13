import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { Company, CompanyStatus, Fact, TimelineEvent, ContractTerm } from '../types';

const AdminCompanyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  // We don't need to subscribe to all companies changes, just get it once for edit initialization
  const addCompany = useStore(state => state.addCompany);
  const updateCompany = useStore(state => state.updateCompany);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const [formData, setFormData] = useState<Omit<Company, 'id' | 'updatedAt'>>({
    name: '',
    city: '',
    industry: '',
    summary: '',
    logoUrl: '',
    tags: [],
    status: 'draft',
    facts: [],
    timeline: [],
    contractTerms: []
  });

  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const company = useStore.getState().companies.find(c => c.id === id);
      if (company) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, updatedAt: _updatedAt, ...rest } = company;
        setFormData(rest);
        setTagsInput(rest.tags.join(', '));
      } else {
        navigate('/admin');
      }
    }
  }, [id, isEdit, navigate]);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateCompany(id, formData);
    } else {
      addCompany({
        ...formData,
        id: generateId(),
        updatedAt: new Date().toISOString()
      });
    }
    navigate('/admin');
  };

  const addFact = () => {
    setFormData(prev => ({
      ...prev,
      facts: [...prev.facts, { id: generateId(), companyId: id || '', content: '' }]
    }));
  };

  const removeFact = (factId: string) => {
    setFormData(prev => ({
      ...prev,
      facts: prev.facts.filter(f => f.id !== factId)
    }));
  };

  const updateFact = (factId: string, updates: Partial<Fact>) => {
    setFormData(prev => ({
      ...prev,
      facts: prev.facts.map(f => f.id === factId ? { ...f, ...updates } : f)
    }));
  };

  // Add similar functions for timeline and contract terms
  const addTimelineEvent = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { id: generateId(), companyId: id || '', date: '', description: '' }]
    }));
  };

  const removeTimelineEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter(e => e.id !== eventId)
    }));
  };

  const updateTimelineEvent = (eventId: string, updates: Partial<TimelineEvent>) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.map(e => e.id === eventId ? { ...e, ...updates } : e)
    }));
  };

  const addContractTerm = () => {
    setFormData(prev => ({
      ...prev,
      contractTerms: [...prev.contractTerms, { id: generateId(), companyId: id || '', originalText: '', problem: '', risk: '', suggestion: '' }]
    }));
  };

  const removeContractTerm = (termId: string) => {
    setFormData(prev => ({
      ...prev,
      contractTerms: prev.contractTerms.filter(t => t.id !== termId)
    }));
  };

  const updateContractTerm = (termId: string, updates: Partial<ContractTerm>) => {
    setFormData(prev => ({
      ...prev,
      contractTerms: prev.contractTerms.map(t => t.id === termId ? { ...t, ...updates } : t)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mb-6">
        <Link to="/admin" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回管理后台
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? '编辑公司信息' : '录入新公司'}</h1>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-lg mb-8 flex gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-500" />
        <p><strong>合规与脱敏提示：</strong> 上传任何证据链接前，请务必对图片/文件中的个人姓名、身份证号、联系方式等隐私信息进行打码脱敏处理。所有陈述应客观中立，避免侮辱性词汇。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Basic Info */}
        <section className="glass-card p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-bold border-b border-dark-border pb-3 mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">公司名称 <span className="text-danger">*</span></label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Logo 外链</label>
              <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">城市 <span className="text-danger">*</span></label>
              <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">行业 <span className="text-danger">*</span></label>
              <input required type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">违规标签 (逗号分隔) <span className="text-danger">*</span></label>
            <input required type="text" value={tagsInput} onChange={handleTagsChange} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none" placeholder="欠薪, 强制996, 霸王条款" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">一句话简述 <span className="text-danger">*</span></label>
            <textarea required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full bg-black/40 border border-dark-border rounded-lg py-2 px-3 text-white focus:border-danger outline-none min-h-[80px]" />
          </div>
        </section>

        {/* Facts */}
        <section className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center border-b border-dark-border pb-3 mb-4">
            <h2 className="text-xl font-bold">核心事实摘要</h2>
            <button type="button" onClick={addFact} className="text-xs btn-outline py-1 px-3 flex items-center gap-1"><Plus className="w-3 h-3" /> 新增事实</button>
          </div>
          
          <div className="space-y-4">
            {formData.facts.map((fact) => (
              <div key={fact.id} className="bg-black/30 p-4 rounded-lg border border-dark-border relative group">
                <button type="button" onClick={() => removeFact(fact.id)} className="absolute top-2 right-2 text-gray-500 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                <div className="space-y-3 pr-8">
                  <textarea placeholder="事实内容" required value={fact.content} onChange={e => updateFact(fact.id, { content: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="证据外链 URL" value={fact.evidenceUrl || ''} onChange={e => updateFact(fact.id, { evidenceUrl: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-1 px-3 text-white text-sm outline-none focus:border-danger" />
                    <input type="text" placeholder="备注 (可选)" value={fact.remark || ''} onChange={e => updateFact(fact.id, { remark: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-1 px-3 text-white text-sm outline-none focus:border-danger" />
                  </div>
                </div>
              </div>
            ))}
            {formData.facts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">暂无事实记录，点击右上角新增</p>}
          </div>
        </section>

        {/* Timeline */}
        <section className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center border-b border-dark-border pb-3 mb-4">
            <h2 className="text-xl font-bold">事件时间线</h2>
            <button type="button" onClick={addTimelineEvent} className="text-xs btn-outline py-1 px-3 flex items-center gap-1"><Plus className="w-3 h-3" /> 新增事件</button>
          </div>
          
          <div className="space-y-4">
            {formData.timeline.map((event) => (
              <div key={event.id} className="bg-black/30 p-4 rounded-lg border border-dark-border relative group">
                <button type="button" onClick={() => removeTimelineEvent(event.id)} className="absolute top-2 right-2 text-gray-500 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                <div className="space-y-3 pr-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="date" required value={event.date} onChange={e => updateTimelineEvent(event.id, { date: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger md:col-span-1" />
                    <input type="text" placeholder="影响范围 (可选)" value={event.impact || ''} onChange={e => updateTimelineEvent(event.id, { impact: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger md:col-span-2" />
                  </div>
                  <textarea placeholder="事件描述" required value={event.description} onChange={e => updateTimelineEvent(event.id, { description: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                  <input type="text" placeholder="证据外链 URL" value={event.evidenceUrl || ''} onChange={e => updateTimelineEvent(event.id, { evidenceUrl: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-1 px-3 text-white text-sm outline-none focus:border-danger" />
                </div>
              </div>
            ))}
            {formData.timeline.length === 0 && <p className="text-sm text-gray-500 text-center py-4">暂无时间线记录</p>}
          </div>
        </section>

        {/* Contract Terms */}
        <section className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center border-b border-dark-border pb-3 mb-4">
            <h2 className="text-xl font-bold">霸王条款</h2>
            <button type="button" onClick={addContractTerm} className="text-xs btn-outline py-1 px-3 flex items-center gap-1"><Plus className="w-3 h-3" /> 新增条款</button>
          </div>
          
          <div className="space-y-4">
            {formData.contractTerms.map((term) => (
              <div key={term.id} className="bg-black/30 p-4 rounded-lg border border-dark-border relative group space-y-3">
                <button type="button" onClick={() => removeContractTerm(term.id)} className="absolute top-2 right-2 text-gray-500 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                <div className="pr-8 space-y-3">
                  <textarea placeholder="条款原文" required value={term.originalText} onChange={e => updateContractTerm(term.id, { originalText: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                  <input type="text" placeholder="证据外链 URL" value={term.evidenceUrl || ''} onChange={e => updateContractTerm(term.id, { evidenceUrl: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger" />
                  <textarea placeholder="问题点" required value={term.problem} onChange={e => updateContractTerm(term.id, { problem: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                  <textarea placeholder="潜在风险" required value={term.risk} onChange={e => updateContractTerm(term.id, { risk: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                  <textarea placeholder="应对建议" required value={term.suggestion} onChange={e => updateContractTerm(term.id, { suggestion: e.target.value })} className="w-full bg-black/40 border border-dark-border rounded py-2 px-3 text-white text-sm outline-none focus:border-danger min-h-[60px]" />
                </div>
              </div>
            ))}
            {formData.contractTerms.length === 0 && <p className="text-sm text-gray-500 text-center py-4">暂无条款记录</p>}
          </div>
        </section>

        {/* Publish Status */}
        <section className="glass-card p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">发布状态:</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as CompanyStatus})} className="bg-black/40 border border-dark-border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-danger">
              <option value="draft">草稿</option>
              <option value="published">发布</option>
              <option value="offline">下线</option>
            </select>
          </div>
          <button type="submit" className="btn-danger flex items-center gap-2 px-8 py-3">
            <Save className="w-5 h-5" /> 保存记录
          </button>
        </section>
      </form>
    </div>
  );
};

export default AdminCompanyForm;