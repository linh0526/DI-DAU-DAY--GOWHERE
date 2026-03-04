'use client';

import { LayoutDashboard, Eye, Save, ShieldAlert, AlertCircle } from 'lucide-react';

interface OverviewStats {
  total: number;
  views: number;
  saves: number;
  reports: number;
}

interface PendingReport {
  _id: string;
  locationName: string;
  locationId: string;
  reason: string;
}

interface AdminOverviewTabProps {
  stats: OverviewStats;
  pendingReports: PendingReport[];
  recentLocations: { _id: string; name: string; district: string; createdAt?: string }[];
  onResolveReport: (locationId: string, reportId: string) => void;
}

export default function AdminOverviewTab({
  stats,
  pendingReports,
  recentLocations,
  onResolveReport,
}: AdminOverviewTabProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-14">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Báo cáo hệ thống</h1>
        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">
          Tình hình hoạt động thời gian thực
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng địa điểm</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.total}</h2>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Eye className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lượt truy cập</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.views.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Save className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lượt lưu quán</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.saves.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 border-red-100 bg-red-50/20">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Báo lỗi chưa xử lý</p>
          <h2 className="text-4xl font-black text-red-600">{stats.reports}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">Báo lỗi từ người dùng</h3>
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                Không có lỗi báo cáo nào
              </div>
            ) : (
              pendingReports.map((rep) => (
                <div
                  key={rep._id}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900">{rep.locationName}</p>
                      <p className="text-xs text-slate-500 mt-1">{rep.reason}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onResolveReport(rep.locationId, rep._id)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    Đã sửa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">Hoạt động gần đây</h3>
          <div className="space-y-6">
            {recentLocations.map((loc) => (
              <div key={loc._id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-600" />
                <p className="text-xs font-bold text-slate-700">
                  Địa điểm mới <span className="text-slate-900 font-black">"{loc.name}"</span> vừa được cập nhật tại{' '}
                  {loc.district}.
                </p>
                {loc.createdAt && (
                  <span className="text-[9px] font-black text-slate-300 ml-auto uppercase">
                    {new Date(loc.createdAt as any).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

