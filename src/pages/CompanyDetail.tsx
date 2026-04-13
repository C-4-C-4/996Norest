import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, MapPin, Briefcase, Calendar, Link as LinkIcon, 
  AlertTriangle, ShieldAlert, AlertCircle, MessageSquare
} from 'lucide-react';
import { useStore } from '../store';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const company = useStore(state => state.companies.find(c => c.id === id));

  // Sort timeline chronologically
  const sortedTimeline = useMemo(() => {
    if (!company?.timeline) return [];
    return [...company.timeline].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [company?.timeline]);

  if (!company) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">公司信息未找到</h2>
        <p className="text-gray-400 mb-6">您请求的公司记录不存在或已被下线。</p>
        <Link to="/companies" className="btn-outline">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <Link to="/companies" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" />
        返回名单
      </Link>

      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-2xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-danger/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-xl bg-black/50 border border-dark-border overflow-hidden shrink-0 flex items-center justify-center">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="w-10 h-10 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{company.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.city}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {company.industry}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 最后更新: {format(new Date(company.updatedAt), 'yyyy-MM-dd')}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {company.tags.map(tag => (
                <span key={tag} className="text-sm font-medium px-3 py-1 bg-danger text-white rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-gray-200 text-sm leading-relaxed">
              <strong className="text-danger">简述：</strong>{company.summary}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Facts Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-danger rounded-full" />
              核心事实摘要
            </h2>
            
            {company.facts.length === 0 ? (
              <p className="text-gray-500 italic">暂无事实记录</p>
            ) : (
              <div className="space-y-4">
                {company.facts.map((fact, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={fact.id} 
                    className="glass-card p-5 rounded-lg flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center text-white font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-200 mb-2 leading-relaxed">{fact.content}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {fact.evidenceUrl && (
                          <a 
                            href={fact.evidenceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-medium text-danger hover:text-white transition-colors bg-danger/10 px-2 py-1 rounded"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> 证据 [E{index+1}]
                          </a>
                        )}
                        {fact.remark && (
                          <span className="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded">
                            注: {fact.remark}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Timeline Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-danger rounded-full" />
              事件时间线
            </h2>
            
            {sortedTimeline.length === 0 ? (
              <p className="text-gray-500 italic">暂无时间线记录</p>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l border-dark-border ml-2 sm:ml-4 space-y-8">
                {sortedTimeline.map((event, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={event.id} 
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[33px] sm:-left-[41px] w-4 h-4 rounded-full bg-danger ring-4 ring-dark-card" />
                    
                    <div className="mb-1 text-danger font-mono font-bold tracking-wider">
                      {event.date}
                    </div>
                    <div className="glass-card p-5 rounded-lg">
                      <p className="text-gray-200 mb-3 leading-relaxed">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-dark-border">
                        {event.evidenceUrl && (
                          <a 
                            href={event.evidenceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-medium text-gray-300 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> 相关证据
                          </a>
                        )}
                        {event.impact && (
                          <span className="text-xs text-gray-400 bg-black/40 px-2 py-1 rounded flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                            影响: {event.impact}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Contract Terms Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-danger rounded-full" />
              霸王条款拆解
            </h2>
            
            {company.contractTerms.length === 0 ? (
              <p className="text-gray-500 italic">暂无条款拆解记录</p>
            ) : (
              <div className="space-y-6">
                {company.contractTerms.map((term, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={term.id} 
                    className="glass-card rounded-lg overflow-hidden border border-dark-border"
                  >
                    <div className="bg-black/60 p-4 border-b border-dark-border relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                      <h4 className="text-xs text-gray-500 font-mono mb-1 uppercase">条款原文</h4>
                      <p className="text-gray-300 italic font-serif">"{term.originalText}"</p>
                      {term.evidenceUrl && (
                        <a href={term.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 mt-2">
                          <LinkIcon className="w-3 h-3 mr-1" /> 查看合同截图
                        </a>
                      )}
                    </div>
                    <div className="p-4 bg-dark-card space-y-4">
                      <div>
                        <h4 className="text-xs text-danger font-bold mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> 问题点</h4>
                        <p className="text-sm text-gray-300">{term.problem}</p>
                      </div>
                      <div>
                        <h4 className="text-xs text-orange-500 font-bold mb-1">潜在风险</h4>
                        <p className="text-sm text-gray-300">{term.risk}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <h4 className="text-xs text-green-500 font-bold mb-1 flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> 应对建议</h4>
                        <p className="text-sm text-gray-300">{term.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border-t-4 border-t-danger">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <ShieldAlert className="w-5 h-5 text-danger mr-2" />
              防坑必读
            </h3>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="flex items-start">
                <span className="text-danger mr-2 mt-0.5">•</span>
                面试时注意录音，保存HR承诺的薪资结构与发放时间。
              </li>
              <li className="flex items-start">
                <span className="text-danger mr-2 mt-0.5">•</span>
                若遭遇欠薪，切勿主动提交“因个人原因离职”的辞职信，应以“未及时足额支付劳动报酬”为由解除劳动合同，以主张经济补偿。
              </li>
              <li className="flex items-start">
                <span className="text-danger mr-2 mt-0.5">•</span>
                加班注意保存打卡记录、工作邮件、聊天记录及加班审批单等实质证据。
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-xl sticky top-24">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              更正与反馈
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              如果您是该公司代表，认为上述信息与事实不符，或问题已解决，请提供相应的证明材料联系管理员进行更正或下线处理。
            </p>
            <Link to={`/submit?edit=${company.id}`} className="w-full btn-outline flex items-center justify-center py-2.5">
              提交反馈材料
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;