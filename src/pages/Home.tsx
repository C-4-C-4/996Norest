import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Clock, FileText, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

const Home = () => {
  const allCompanies = useStore(state => state.companies);
  const disclaimer = useStore(state => state.settings.disclaimer);
  const homeTitle = useStore(state => state.settings.homeTitle);
  const homeDescription = useStore(state => state.settings.homeDescription);

  const renderHighlightedTitle = (title: string) => {
    if (!title) return null;
    const parts = title.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={index} className="text-danger">{part.slice(1, -1)}</span>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const companies = useMemo(() => {
    return allCompanies.filter(c => c.status === 'published').sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [allCompanies]);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "曝光查询",
      desc: "浏览已知存在违规行为的公司列表",
      path: "/companies"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "时间线追踪",
      desc: "按时间顺序还原维权或侵权事件全过程",
      path: "/companies" // Will link to specific company timelines later
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "条款拆解",
      desc: "揭露霸王条款，提供应对建议",
      path: "/companies"
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      {/* Disclaimer Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full mb-12 bg-danger/10 border border-danger/30 rounded-lg p-5 flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
      >
        <AlertTriangle className="w-7 h-7 text-danger shrink-0" />
        <div className="text-lg text-gray-200 font-medium leading-normal tracking-wide">
          <strong className="text-danger font-bold text-xl mr-1 align-baseline">免责声明：</strong>
          <span className="align-baseline">{disclaimer}</span>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center mb-20 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-danger blur-[100px] opacity-30 pointer-events-none"
        />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          {renderHighlightedTitle(homeTitle)}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {homeDescription}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/companies" className="btn-danger flex items-center justify-center gap-2 group text-lg px-8 py-4">
            查看避雷名单
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/submit" className="btn-outline flex items-center justify-center gap-2 text-lg px-8 py-4">
            提交最新曝光
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
      >
        {features.map((feature, idx) => (
          <Link key={idx} to={feature.path}>
            <div className="glass-card glass-card-hover p-6 rounded-xl flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Summaries Section */}
      <div id="recent" className="max-w-4xl w-full scroll-mt-24">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-danger rounded-full" />
          最新关键事实摘要
        </h2>
        
        <div className="space-y-4">
          {companies.slice(0, 3).map((company, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              key={company.id} 
              className="glass-card p-5 rounded-lg border-l-4 border-l-danger hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                <h3 className="text-lg font-bold text-white">
                  {company.name} <span className="text-xs font-normal text-gray-400 ml-2">{company.city}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-danger/20 text-danger-hover rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 text-sm">{company.summary}</p>
              </div>
              
              {company.facts.length > 0 && (
                <div className="bg-black/30 p-3 rounded text-sm text-gray-400 border border-white/5 mb-4">
                  <span className="font-semibold text-gray-300">事实一：</span> {company.facts[0].content}
                </div>
              )}
              
              <div className="flex justify-end">
                <Link to={`/companies/${company.id}`} className="text-danger hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                  查看完整证据链 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;