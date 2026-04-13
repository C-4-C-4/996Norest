import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';

const CompanyList = () => {
  const allCompanies = useStore(state => state.companies);
  const companies = useMemo(() => {
    return allCompanies.filter(c => c.status === 'published').sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [allCompanies]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const cities = useMemo(() => Array.from(new Set(companies.map(c => c.city))), [companies]);
  const industries = useMemo(() => Array.from(new Set(companies.map(c => c.industry))), [companies]);
  const allTags = useMemo(() => Array.from(new Set(companies.flatMap(c => c.tags))), [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          company.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCity = cityFilter ? company.city === cityFilter : true;
      const matchIndustry = industryFilter ? company.industry === industryFilter : true;
      const matchTag = tagFilter ? company.tags.includes(tagFilter) : true;
      
      return matchSearch && matchCity && matchIndustry && matchTag;
    });
  }, [companies, searchTerm, cityFilter, industryFilter, tagFilter]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
          <div className="w-2 h-10 bg-danger rounded-full" />
          避雷名单
        </h1>
        <p className="text-gray-400 max-w-3xl">
          收录了存在欠发工资、强制超时加班、设立霸王条款等问题的公司。
          点击卡片可查看详细时间线证据与条款拆解。
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl mb-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="搜索公司名称或关键词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-dark-border rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-danger transition-colors"
          />
        </div>
        
        <div className="flex gap-4 flex-wrap md:flex-nowrap">
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-black/40 border border-dark-border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-danger"
          >
            <option value="">所有城市</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          
          <select 
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-black/40 border border-dark-border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-danger"
          >
            <option value="">所有行业</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>

          <select 
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-black/40 border border-dark-border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-danger"
          >
            <option value="">所有标签</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-400 font-medium">未找到符合条件的公司</h3>
          <button 
            onClick={() => {
              setSearchTerm(''); setCityFilter(''); setIndustryFilter(''); setTagFilter('');
            }}
            className="mt-4 text-danger hover:text-white transition-colors"
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={company.id}
            >
              <Link to={`/companies/${company.id}`} className="block h-full">
                <div className="glass-card glass-card-hover rounded-xl p-6 h-full flex flex-col relative overflow-hidden group">
                  {/* Decorative corner accent */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-danger/20 rounded-full blur-xl group-hover:bg-danger/40 transition-colors" />
                  
                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className="w-16 h-16 rounded-lg bg-black/50 border border-dark-border overflow-hidden shrink-0 flex items-center justify-center">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight mb-1">{company.name}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.city}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {company.industry}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium px-2 py-1 bg-danger/10 border border-danger/20 text-danger rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6 flex-grow line-clamp-3">
                    {company.summary}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-dark-border flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      更新于 {format(new Date(company.updatedAt), 'yyyy-MM-dd')}
                    </span>
                    <span className="text-danger group-hover:text-white transition-colors">查看详情 →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyList;