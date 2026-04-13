import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Menu, X, TerminalSquare, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = useStore(state => state.token);
  const logout = useStore(state => state.logout);

  const links = [
    { name: '首页', path: '/' },
    { name: '避雷名单', path: '/companies' },
    { name: '提交曝光', path: '/submit' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-card/80 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <ShieldAlert className="w-6 h-6 text-danger group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-wider">No<span className="text-danger">rest</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-danger' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {token && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-danger' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                管理后台
              </Link>
            )}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <TerminalSquare className="w-4 h-4" />
              <span>开源代码</span>
            </a>
            {token && (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center space-x-1 text-sm font-medium text-danger hover:text-danger-hover transition-colors ml-4"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-card border-b border-dark-border overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path 
                      ? 'text-danger bg-danger/10' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const footerCopyright = useStore(state => state.settings?.footerCopyright || 'Norest. All Rights Reserved.');
  const footerDescription = useStore(state => state.settings?.footerDescription || '本站内容性质：信息整理 / 个人经历陈述 / 材料索引\n所有内容仅陈述可核验事实，并附有相应证据。请明确观点与事实的边界。');

  const lines = footerDescription.split('\n');

  return (
    <footer className="bg-dark-card border-t border-dark-border mt-auto py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
        {lines.map((line, index) => (
          index === 0 ? (
            <p key={index} className="mb-2 text-gray-300 font-medium flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" />
              {line}
            </p>
          ) : (
            <p key={index} className={index < lines.length - 1 ? "mb-2" : ""}>{line}</p>
          )
        ))}
        <p className="mt-4">{footerCopyright}</p>
      </div>
    </footer>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Aurora Background Elements */}
      <div className="aurora-bg" />
      <div className="aurora-accent" />
      <div className="aurora-accent-2" />
      
      <Navbar />
      
      <main className="flex-grow pt-16 relative z-10">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};
