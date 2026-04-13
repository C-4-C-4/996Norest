import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, Archive, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { CompanyStatus } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const companies = useStore(state => state.companies);
  const deleteCompany = useStore(state => state.deleteCompany);
  const updateCompany = useStore(state => state.updateCompany);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'offline' : 'published';
    try {
      await updateCompany(id, { status: newStatus as CompanyStatus });
      toast.success(`状态已更新为: ${newStatus === 'published' ? '已发布' : '已下线'}`);
    } catch (e) {
      console.error(e);
      toast.error('状态更新失败');
    }
  };

  const confirmDelete = (id: string) => {
    setCompanyToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (companyToDelete) {
      try {
        await deleteCompany(companyToDelete);
        toast.success('记录已成功删除');
      } catch (e) {
        console.error(e);
        toast.error('删除失败，请重试');
      }
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">后台管理系统</h1>
        <div className="flex items-center gap-4">
          <Link to="/admin/settings" className="btn-outline flex items-center gap-2 border-gray-600 text-gray-300">
            <Settings className="w-4 h-4" /> 网站设置
          </Link>
          <Link to="/admin/company/new" className="btn-danger flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新增记录
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/50 text-gray-400 border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">公司名称</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium">更新时间</th>
                <th className="px-6 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {companies.map(company => (
                <tr key={company.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{company.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{company.city} | {company.industry}</div>
                  </td>
                  <td className="px-6 py-4">
                    {company.status === 'published' && (
                      <span className="inline-flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-medium">
                        <Eye className="w-3 h-3" /> 已发布
                      </span>
                    )}
                    {company.status === 'draft' && (
                      <span className="inline-flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium">
                        <Archive className="w-3 h-3" /> 草稿
                      </span>
                    )}
                    {company.status === 'offline' && (
                      <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-500/10 px-2 py-1 rounded text-xs font-medium">
                        <EyeOff className="w-3 h-3" /> 已下线
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {format(new Date(company.updatedAt), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/company/${company.id}/edit`} className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => toggleStatus(company.id, company.status)}
                        className={`${company.status === 'published' ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'} transition-colors`}
                        title={company.status === 'published' ? '下线' : '发布'}
                      >
                        {company.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => confirmDelete(company.id)}
                        className="text-danger hover:text-danger-hover transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {companies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    暂无记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="确认删除记录"
        message="您确定要删除这家公司的所有记录吗？此操作不可逆，相关的事件时间线与条款拆解都将被永久移除。"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCompanyToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminDashboard;