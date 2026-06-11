import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiBook } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import SubjectCard from '../components/dashboard/SubjectCard';
import SubjectFormModal from '../components/dashboard/SubjectFormModal';
import { ConfirmModal } from '../components/common/Modal';
import { SkeletonList } from '../components/common/LoadingSkeletons';
import { toast } from '../components/common/Toast';
import { subjectsAPI } from '../utils/api';
import { calcPercentage } from '../utils/helpers';

const FILTERS = ['All', 'Safe (≥75%)', 'At Risk (<75%)', 'Critical (<60%)'];

const Subjects = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await subjectsAPI.getAll();
      setSubjects(data);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAddOrEdit = async (form) => {
    setModalLoading(true);
    try {
      if (editSubject) {
        await subjectsAPI.update(editSubject._id, form);
        toast.success('Subject updated ✏️');
      } else {
        await subjectsAPI.create(form);
        toast.success('Subject added 📚');
      }
      setShowModal(false);
      setEditSubject(null);
      fetchSubjects();
    } catch {
      toast.error('Failed to save subject');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAttend = async (id) => {
    const s = subjects.find(s => s._id === id);
    try {
      await subjectsAPI.update(id, { totalClasses: s.totalClasses + 1, attendedClasses: s.attendedClasses + 1 });
      toast.success('Marked as attended ✅');
      fetchSubjects();
    } catch { toast.error('Failed'); }
  };

  const handleMiss = async (id) => {
    const s = subjects.find(s => s._id === id);
    try {
      await subjectsAPI.update(id, { totalClasses: s.totalClasses + 1, attendedClasses: s.attendedClasses });
      toast.warning('Marked as missed 😔');
      fetchSubjects();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await subjectsAPI.delete(deleteId);
      toast.success('Subject deleted');
      setDeleteId(null);
      fetchSubjects();
    } catch { toast.error('Failed to delete'); }
    finally { setModalLoading(false); }
  };

  // Filter + search
  const filtered = subjects.filter(s => {
    const matchesSearch = s.subjectName.toLowerCase().includes(search.toLowerCase());
    const pct = calcPercentage(s.attendedClasses, s.totalClasses);
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Safe (≥75%)' && pct >= 75) ||
      (filter === 'At Risk (<75%)' && pct < 75 && pct >= 60) ||
      (filter === 'Critical (<60%)' && pct < 60);
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Subject Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all your subjects</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditSubject(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={18} />
          Add Subject
        </motion.button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'glass text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: subjects.length, color: '#6366f1' },
            { label: 'Safe', value: subjects.filter(s => calcPercentage(s.attendedClasses, s.totalClasses) >= 75).length, color: '#10b981' },
            { label: 'At Risk', value: subjects.filter(s => { const p = calcPercentage(s.attendedClasses, s.totalClasses); return p < 75 && p >= 60; }).length, color: '#f59e0b' },
            { label: 'Critical', value: subjects.filter(s => calcPercentage(s.attendedClasses, s.totalClasses) < 60 && s.totalClasses > 0).length, color: '#ef4444' },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-slate-400 text-xs mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Subjects Grid */}
      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FiBook size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-semibold text-lg mb-2">
            {subjects.length === 0 ? 'No subjects yet' : 'No results found'}
          </h3>
          <p className="text-slate-500 text-sm">
            {subjects.length === 0 ? 'Add your first subject to get started.' : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((subject, i) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              index={i}
              onAttend={handleAttend}
              onMiss={handleMiss}
              onEdit={(s) => { setEditSubject(s); setShowModal(true); }}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <SubjectFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditSubject(null); }}
        onSubmit={handleAddOrEdit}
        editSubject={editSubject}
        isLoading={modalLoading}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure? All attendance data for this subject will be permanently deleted."
        isLoading={modalLoading}
      />
    </DashboardLayout>
  );
};

export default Subjects;
