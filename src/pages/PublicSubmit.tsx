import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, Send, Plus, Trash2, Info, Edit3 } from 'lucide-react';
import { useStore } from '../store';
import toast from 'react-hot-toast';

const PublicSubmit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const getCompanyById = useStore(state => state.getCompanyById);

  const submitCompany = useStore(state => state.submitCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    city: '',
    industry: '',
    tags: '',
    summary: '',
    facts: [{ content: '', evidenceUrl: '', remark: '' }] as Array<{ content: string; evidenceUrl: string; remark: string }>,
    timeline: [] as Array<{ date: string; description: string; evidenceUrl: string; impact: string }>,
    contractTerms: [] as Array<{ originalText: string; problem: string; risk: string; suggestion: string; evidenceUrl: string }>
  });

  useEffect(() => {
    if (editId) {
      const company = getCompanyById(editId);
      if (company) {
        const initialData = {
          name: company.name,
          logoUrl: company.logoUrl || '',
          city: company.city,
          industry: company.industry,
          tags: company.tags.join(', '),
          summary: company.summary,
          facts: company.facts?.length ? company.facts.map(f => ({
            content: f.content,
            evidenceUrl: f.evidenceUrl || '',
            remark: f.remark || ''
          })) : [{ content: '', evidenceUrl: '', remark: '' }],
          timeline: company.timeline?.length ? company.timeline.map(t => ({
            date: t.date,
            description: t.description,
            evidenceUrl: t.evidenceUrl || '',
            impact: t.impact || ''
          })) : [],
          contractTerms: company.contractTerms?.length ? company.contractTerms.map(c => ({
            originalText: c.originalText,
            problem: c.problem,
            risk: c.risk,
            suggestion: c.suggestion,
            evidenceUrl: c.evidenceUrl || ''
          })) : []
        };
        setFormData(initialData);
        setOriginalData(initialData);
      }
    }
  }, [editId, getCompanyById]);

  const handleAddFact = () => {
    setFormData({
      ...formData,
      facts: [...formData.facts, { content: '', evidenceUrl: '', remark: '' }]
    });
  };

  const handleRemoveFact = (index: number) => {
    const newFacts = formData.facts.filter((_, i) => i !== index);
    setFormData({ ...formData, facts: newFacts });
  };

  const handleAddEvent = () => {
    setFormData({
      ...formData,
      timeline: [...formData.timeline, { date: '', description: '', evidenceUrl: '', impact: '' }]
    });
  };

  const handleRemoveEvent = (index: number) => {
    const newTimeline = formData.timeline.filter((_, i) => i !== index);
    setFormData({ ...formData, timeline: newTimeline });
  };

  const handleAddTerm = () => {
    setFormData({
      ...formData,
      contractTerms: [...formData.contractTerms, { originalText: '', problem: '', risk: '', suggestion: '', evidenceUrl: '' }]
    });
  };

  const handleRemoveTerm = (index: number) => {
    const newTerms = formData.contractTerms.filter((_, i) => i !== index);
    setFormData({ ...formData, contractTerms: newTerms });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editId && originalData) {
      // Create a function to clean up array items before comparing (remove empty strings)
      const cleanFacts = formData.facts.filter(f => f.content.trim() !== '');
      const originalFacts = originalData.facts.filter((f: any) => f.content.trim() !== '');
      
      const cleanTimeline = formData.timeline.filter(t => t.description.trim() !== '');
      const originalTimeline = originalData.timeline.filter((t: any) => t.description.trim() !== '');
      
      const cleanTerms = formData.contractTerms.filter(t => t.originalText.trim() !== '');
      const originalTerms = originalData.contractTerms.filter((t: any) => t.originalText.trim() !== '');

      const isIdentical = 
        originalData.name === formData.name &&
        originalData.logoUrl === formData.logoUrl &&
        originalData.city === formData.city &&
        originalData.industry === formData.industry &&
        originalData.tags === formData.tags &&
        originalData.summary === formData.summary &&
        JSON.stringify(originalFacts) === JSON.stringify(cleanFacts) &&
        JSON.stringify(originalTimeline) === JSON.stringify(cleanTimeline) &&
        JSON.stringify(originalTerms) === JSON.stringify(cleanTerms);

      if (isIdentical) {
        toast('您并未修改任何内容。', { icon: 'ℹ️' });
        navigate(`/companies/${editId}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const payload: any = {
        name: formData.name,
        logoUrl: formData.logoUrl,
        city: formData.city,
        industry: formData.industry,
        summary: formData.summary,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        facts: formData.facts.filter(f => f.content.trim() !== ''),
        timeline: formData.timeline.filter(e => e.description.trim() !== ''),
        contractTerms: formData.contractTerms.filter(t => t.originalText.trim() !== '')
      };

      if (editId) {
        payload.id = editId;
      }

      await submitCompany(payload);
      toast.success('提交成功！我们将尽快审核您提交的内容。');
      navigate('/');
    } catch (error) {
      toast.error('提交失败，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/20">
          {editId ? <Edit3 className="w-8 h-8 text-danger" /> : <ShieldAlert className="w-8 h-8 text-danger" />}
        </div>
        <h1 className="text-3xl font-bold mb-4">{editId ? '提交更正与反馈' : '提交劣质公司信息'}</h1>
        <p className="text-gray-400">
          {editId 
            ? '请在下方修改不符合事实的信息。提交后将作为草稿进入后台，由管理员审核通过后更新展示。'
            : '您的曝光可以帮助更多人避坑。提交的信息在审核通过后，将向所有人公开。'}
        </p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-lg mb-8 flex gap-3 text-sm">
        <Info className="w-5 h-5 shrink-0 text-yellow-500" />
        <p><strong>发布须知：</strong> 请确保您提供的内容基于客观事实，并尽可能附带证据链接。恶意造谣或发布虚假信息可能会承担相应的法律责任。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-bold border-b border-dark-border pb-4 mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">公司全称 *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger"
                placeholder="例如：北京XX网络科技有限公司"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">公司 Logo 链接 (选填)</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">所在城市 *</label>
              <input
                required
                type="text"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger"
                placeholder="例如：北京"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">所属行业 *</label>
              <input
                required
                type="text"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger"
                placeholder="例如：互联网/电商"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">问题标签 *</label>
              <input
                required
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger"
                placeholder="用逗号分隔，如：欠薪, 强制996"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">一句话简述 *</label>
            <textarea
              required
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              className="w-full bg-black/40 border border-dark-border rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-danger h-24"
              placeholder="简要描述该公司存在的主要问题..."
            />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
            <h2 className="text-xl font-bold">核心事实 (选填)</h2>
            <button
              type="button"
              onClick={handleAddFact}
              className="btn-outline flex items-center gap-1 text-xs py-1.5 px-3"
            >
              <Plus className="w-3 h-3" /> 新增事实
            </button>
          </div>

          {formData.facts.map((fact, index) => (
            <div key={index} className="p-4 bg-black/30 border border-dark-border rounded-lg space-y-4 relative group">
              {formData.facts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFact(index)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">事实描述</label>
                <textarea
                  value={fact.content}
                  onChange={e => {
                    const newFacts = [...formData.facts];
                    newFacts[index].content = e.target.value;
                    setFormData({...formData, facts: newFacts});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="具体发生了什么事情？"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">证据链接</label>
                <input
                  type="url"
                  value={fact.evidenceUrl}
                  onChange={e => {
                    const newFacts = [...formData.facts];
                    newFacts[index].evidenceUrl = e.target.value;
                    setFormData({...formData, facts: newFacts});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
            <h2 className="text-xl font-bold">事件时间线 (选填)</h2>
            <button
              type="button"
              onClick={handleAddEvent}
              className="btn-outline flex items-center gap-1 text-xs py-1.5 px-3"
            >
              <Plus className="w-3 h-3" /> 新增事件
            </button>
          </div>

          {formData.timeline.length === 0 && (
            <div className="text-center text-gray-500 py-4">暂无时间线记录</div>
          )}

          {formData.timeline.map((event, index) => (
            <div key={index} className="p-4 bg-black/30 border border-dark-border rounded-lg space-y-4 relative group">
              <button
                type="button"
                onClick={() => handleRemoveEvent(index)}
                className="absolute top-4 right-4 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">发生日期</label>
                  <input
                    type="date"
                    value={event.date}
                    onChange={e => {
                      const newTimeline = [...formData.timeline];
                      newTimeline[index].date = e.target.value;
                      setFormData({...formData, timeline: newTimeline});
                    }}
                    className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">造成影响</label>
                  <input
                    type="text"
                    value={event.impact}
                    onChange={e => {
                      const newTimeline = [...formData.timeline];
                      newTimeline[index].impact = e.target.value;
                      setFormData({...formData, timeline: newTimeline});
                    }}
                    className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                    placeholder="如：10人被裁"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">事件描述</label>
                <textarea
                  value={event.description}
                  onChange={e => {
                    const newTimeline = [...formData.timeline];
                    newTimeline[index].description = e.target.value;
                    setFormData({...formData, timeline: newTimeline});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="当天发生了什么..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">证据链接</label>
                <input
                  type="url"
                  value={event.evidenceUrl}
                  onChange={e => {
                    const newTimeline = [...formData.timeline];
                    newTimeline[index].evidenceUrl = e.target.value;
                    setFormData({...formData, timeline: newTimeline});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
            <h2 className="text-xl font-bold">霸王条款 (选填)</h2>
            <button
              type="button"
              onClick={handleAddTerm}
              className="btn-outline flex items-center gap-1 text-xs py-1.5 px-3"
            >
              <Plus className="w-3 h-3" /> 新增条款
            </button>
          </div>

          {formData.contractTerms.length === 0 && (
            <div className="text-center text-gray-500 py-4">暂无条款记录</div>
          )}

          {formData.contractTerms.map((term, index) => (
            <div key={index} className="p-4 bg-black/30 border border-dark-border rounded-lg space-y-4 relative group">
              <button
                type="button"
                onClick={() => handleRemoveTerm(index)}
                className="absolute top-4 right-4 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">条款原文</label>
                <textarea
                  value={term.originalText}
                  onChange={e => {
                    const newTerms = [...formData.contractTerms];
                    newTerms[index].originalText = e.target.value;
                    setFormData({...formData, contractTerms: newTerms});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="摘录合同或规章中的原文..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">存在问题</label>
                  <input
                    type="text"
                    value={term.problem}
                    onChange={e => {
                      const newTerms = [...formData.contractTerms];
                      newTerms[index].problem = e.target.value;
                      setFormData({...formData, contractTerms: newTerms});
                    }}
                    className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">员工风险</label>
                  <input
                    type="text"
                    value={term.risk}
                    onChange={e => {
                      const newTerms = [...formData.contractTerms];
                      newTerms[index].risk = e.target.value;
                      setFormData({...formData, contractTerms: newTerms});
                    }}
                    className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">应对建议</label>
                <textarea
                  value={term.suggestion}
                  onChange={e => {
                    const newTerms = [...formData.contractTerms];
                    newTerms[index].suggestion = e.target.value;
                    setFormData({...formData, contractTerms: newTerms});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">证据链接</label>
                <input
                  type="url"
                  value={term.evidenceUrl}
                  onChange={e => {
                    const newTerms = [...formData.contractTerms];
                    newTerms[index].evidenceUrl = e.target.value;
                    setFormData({...formData, contractTerms: newTerms});
                  }}
                  className="w-full bg-black/60 border border-dark-border rounded-lg py-2 px-3 text-white focus:outline-none focus:border-danger text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full btn-danger py-4 text-lg font-bold flex items-center justify-center gap-2 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
          }`}
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? '提交中...' : '匿名提交曝光'}
        </button>
      </form>
    </div>
  );
};

export default PublicSubmit;