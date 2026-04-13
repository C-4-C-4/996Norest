import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-card border border-dark-border w-full max-w-md rounded-xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-danger">
                    <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                  </div>
                  <button 
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="pl-13 text-gray-300 text-sm mb-8 leading-relaxed">
                  {message}
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
                  <button 
                    onClick={onCancel}
                    className="btn-outline py-2 px-5 text-sm"
                  >
                    取消
                  </button>
                  <button 
                    onClick={onConfirm}
                    className="btn-danger py-2 px-5 text-sm"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;