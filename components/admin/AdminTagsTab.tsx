'use client';

import { Tag as TagIcon, Trash2, Edit3, CheckCircle2, XCircle, Clock, ChevronLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 15;
import { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagItem {
  _id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  count: number;
}

interface AdminTagsTabProps {
  allTags: TagItem[];
  filteredTags: TagItem[];
  selectedTags: string[];
  tagSearch: string;
  tagStatusFilter: string;
  newAdminTag: string;
  editingTagId: string | null;
  editingTagName: string;
  setSelectedTags: (ids: string[]) => void;
  setTagSearch: (v: string) => void;
  setTagStatusFilter: (v: string) => void;
  setNewAdminTag: (v: string) => void;
  setEditingTagId: (v: string | null) => void;
  setEditingTagName: (v: string) => void;
  onAddAdminTag: () => void;
  onBulkDeleteTags: () => void;
  onSaveEditTag: (id: string) => void;
  onUpdateTagStatus: (id: string, status: string) => void;
  onDeleteTag: (id: string) => void;
}

export default function AdminTagsTab({
  allTags,
  filteredTags,
  selectedTags,
  tagSearch,
  tagStatusFilter,
  newAdminTag,
  editingTagId,
  editingTagName,
  setSelectedTags,
  setTagSearch,
  setTagStatusFilter,
  setNewAdminTag,
  setEditingTagId,
  setEditingTagName,
  onAddAdminTag,
  onBulkDeleteTags,
  onSaveEditTag,
  onUpdateTagStatus,
  onDeleteTag,
}: AdminTagsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTags.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTags, currentPage]);

  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);

  // Reset page relative to search/filter
  useMemo(() => {
    setCurrentPage(1);
  }, [tagSearch, tagStatusFilter]);

  const pendingCount = allTags.filter((t) => t.status === 'pending').length;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Quản lý nhãn (Tags)</h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">
            Duyệt và thêm tag mới cho hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tên tag mới..."
            value={newAdminTag}
            onChange={(e) => setNewAdminTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddAdminTag()}
            className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-amber-600 transition-all w-64 shadow-sm"
          />
          <button
            onClick={onAddAdminTag}
            disabled={!newAdminTag.trim()}
            className="bg-amber-600 text-white px-6 py-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
          >
            <TagIcon className="w-5 h-5" />
            Thêm
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        {/* TAG FILTERS */}
        <div className="p-10 border-b border-slate-50 flex flex-wrap items-center gap-6 bg-slate-50/50">
          <div className="flex-1 min-w-[300px] relative group">
            <input
              type="text"
              placeholder="Tìm kiếm thẻ..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors">
              <TagIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={tagStatusFilter}
                onChange={(e) => setTagStatusFilter(e.target.value)}
                className="pl-6 pr-12 py-4.5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-600 transition-all shadow-sm appearance-none min-w-[160px] cursor-pointer"
              >
                <option value="all">🚦 Tất cả trạng thái</option>
                <option value="approved">✅ Đã duyệt</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="rejected">❌ Từ chối</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronLeft className="w-4 h-4 -rotate-90" />
              </div>
            </div>

            {selectedTags.length > 0 && (
              <button
                onClick={onBulkDeleteTags}
                className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
                Xóa ({selectedTags.length})
              </button>
            )}

            {pendingCount > 0 && (
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                {pendingCount} tag đang chờ duyệt
              </span>
            )}
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 w-16">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                  checked={selectedTags.length > 0 && selectedTags.length === filteredTags.length}
                  onChange={(e) => setSelectedTags(e.target.checked ? filteredTags.map((t) => t._id) : [])}
                />
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tên thẻ</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lượt dùng</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedTags.map((tag) => (
              <tr
                key={tag._id}
                className={cn(
                  'hover:bg-slate-50 transition-colors group',
                  selectedTags.includes(tag._id) ? 'bg-amber-50/50' : '',
                )}
              >
                <td className="px-8 py-8 w-16">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                    checked={selectedTags.includes(tag._id)}
                    onChange={(e) =>
                      setSelectedTags(
                        e.target.checked
                          ? [...selectedTags, tag._id]
                          : selectedTags.filter((id) => id !== tag._id),
                      )
                    }
                  />
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <TagIcon className="w-5 h-5" />
                    </div>
                    {editingTagId === tag._id ? (
                      <input
                        type="text"
                        autoFocus
                        className="px-4 py-2 bg-white border-2 border-amber-600 rounded-xl text-sm font-bold w-full outline-none"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveEditTag(tag._id);
                          if (e.key === 'Escape') setEditingTagId(null);
                        }}
                        onBlur={() => setEditingTagId(null)}
                      />
                    ) : (
                      <p
                        className="font-black text-sm uppercase tracking-wider text-slate-900 group-hover:text-amber-600 transition-colors cursor-text"
                        onDoubleClick={() => {
                          setEditingTagId(tag._id);
                          setEditingTagName(tag.name);
                        }}
                      >
                        {tag.name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-8 py-8">
                  <span className="text-xs font-black text-slate-500">{tag.count} lượt</span>
                </td>
                <td className="px-8 py-8">
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                      tag.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : tag.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-red-50 text-red-600 border border-red-100',
                    )}
                  >
                    {tag.status === 'approved' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : tag.status === 'pending' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {tag.status === 'approved'
                      ? 'Đã duyệt'
                      : tag.status === 'pending'
                      ? 'Chờ duyệt'
                      : 'Từ chối'}
                  </div>
                </td>
                <td className="px-8 py-8 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingTagId(tag._id);
                        setEditingTagName(tag.name);
                      }}
                      className="p-3 bg-slate-100 text-slate-400 hover:bg-amber-500 hover:text-white rounded-xl hover:scale-110 transition-all"
                      title="Sửa tên thẻ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {tag.status !== 'approved' && (
                      <button
                        onClick={() => onUpdateTagStatus(tag._id, 'approved')}
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-emerald-900/10"
                        title="Phê duyệt"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {tag.status !== 'rejected' && (
                      <button
                        onClick={() => onUpdateTagStatus(tag._id, 'rejected')}
                        className="p-3 bg-amber-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-amber-900/10"
                        title="Từ chối"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteTag(tag._id)}
                      className="p-3 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl hover:scale-110 transition-all"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTags.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-32 text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]"
                >
                  Không tìm thấy thẻ nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="my-8"
        />
      </div>
    </div>
  );
}

