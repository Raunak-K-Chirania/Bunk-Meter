import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../common/Modal';

const defaultForm = { subjectName: '', totalClasses: 0, attendedClasses: 0 };

const SubjectFormModal = ({ isOpen, onClose, onSubmit, editSubject, isLoading }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editSubject) {
      setForm({
        subjectName: editSubject.subjectName || '',
        totalClasses: editSubject.totalClasses || 0,
        attendedClasses: editSubject.attendedClasses || 0,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editSubject, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSubject ? 'Edit Subject' : 'Add New Subject'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Subject Name *</label>
          <input
            type="text"
            required
            value={form.subjectName}
            onChange={(e) => handleChange('subjectName', e.target.value)}
            className="input-field"
            placeholder="e.g. Data Structures & Algorithms"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Total Classes</label>
            <input
              type="number"
              min="0"
              value={form.totalClasses}
              onChange={(e) => handleChange('totalClasses', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Attended Classes</label>
            <input
              type="number"
              min="0"
              max={form.totalClasses}
              value={form.attendedClasses}
              onChange={(e) => handleChange('attendedClasses', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        {/* Preview */}
        {form.totalClasses > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
          >
            <p className="text-sm text-slate-300">
              Current attendance:{' '}
              <span className="font-bold text-indigo-400">
                {((form.attendedClasses / form.totalClasses) * 100).toFixed(1)}%
              </span>
            </p>
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl glass hover:bg-white/10 text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {editSubject ? 'Update Subject' : 'Add Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubjectFormModal;
