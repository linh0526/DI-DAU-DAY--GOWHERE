'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Tag as TagIcon,
  LayoutDashboard,
  ShieldAlert,
  Eye,
  Save,
  AlertCircle,
  Mail,
  Image as ImageIcon,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminLocationsTab from '@/components/admin/AdminLocationsTab';
import AdminTagsTab from '@/components/admin/AdminTagsTab';
import AdminFeedbackTab from '@/components/admin/AdminFeedbackTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';
import AdminLocationFormModal from '@/components/admin/AdminLocationFormModal';
import { useRef } from 'react';

interface Location {
  _id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  coordinates?: { lat: number, lng: number };
  googleMapsUrl?: string;
  googleRating?: number;
  googleReviewCount?: number;
  phoneNumber?: string;
  openingHours?: { open: string, close: string };
  priceSegment: string;
  tags: string[];
  note?: string;
  image?: string;
  facebookUrl?: string;
  website?: string;
  status: 'active' | 'inactive' | 'closed' | 'maintenance';
  likes: number;
  upvotes: number;
  views: number;
  saves: number;
  feedback: {
    _id: string;
    user: string;
    comment: string;
    isHidden: boolean;
    date: string;
  }[];
  reports: {
    _id: string;
    user: string;
    reason: string;
    status: string;
    date: string;
  }[];
  createdAt?: string;
}



const TAG_STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  rejected: "bg-red-50 text-red-600 border-red-100"
};

export default function AdminDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'content' | 'categories' | 'tags' | 'feedback'>('overview');
  const [allTags, setAllTags] = useState<any[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const fetchCities = async () => {
    try {
      const res = await fetch('/api/admin/cities');
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error(err);
    }
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtering state
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCity, setAdminCity] = useState('all');
  const [adminDistrict, setAdminDistrict] = useState('all');
  const [adminStatus, setAdminStatus] = useState('all');
  const [adminTag, setAdminTag] = useState('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      setAllTags(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTagStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        toast.success(`Đã cập nhật: ${status}`);
        fetchTags();
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật tag');
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Xóa vĩnh viễn tag này?')) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xóa');
        fetchTags();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa tag');
    }
  };

  const handleAddAdminTag = async () => {
    if (!newAdminTag.trim()) return;
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAdminTag.trim(), status: 'approved' })
      });
      if (res.ok) {
        toast.success('Đã thêm tag');
        setNewAdminTag('');
        fetchTags();
      } else {
        const err = await res.json();
        toast.error(`Lỗi: ${err.msg || 'Không thể thêm tag'}`);
      }
    } catch (err) {
      toast.error('Lỗi khi thêm tag');
    }
  };

  const bulkDeleteTags = async () => {
    if (!selectedTags.length) return;
    if (!confirm(`Xóa vĩnh viễn ${selectedTags.length} thẻ đã chọn?`)) return;
    try {
      const res = await fetch(`/api/admin/tags?ids=${selectedTags.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xóa các thẻ đã chọn');
        setSelectedTags([]);
        fetchTags();
      } else {
        toast.error('Có lỗi xảy ra khi xóa');
      }
    } catch (err) {
      toast.error('Lỗi khi xóa thẻ');
    }
  };

  const saveEditTag = async (id: string) => {
    if (!editingTagName.trim()) {
      setEditingTagId(null);
      return;
    }
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, name: editingTagName.trim() })
      });
      if (res.ok) {
        toast.success('Đã cập nhật tên thẻ');
        setEditingTagId(null);
        fetchTags();
      } else {
        const err = await res.json();
        toast.error(`Lỗi: ${err.msg}`);
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật thẻ');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setAllFeedbacks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Luôn lấy danh sách tag và tỉnh thành ngay khi vào trang admin
    fetchTags();
    fetchCities();
  }, []);

  useEffect(() => {
    if (activeTab === 'tags') fetchTags();
    if (activeTab === 'feedback') fetchFeedbacks();
  }, [activeTab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    city: 'hanoi',
    district: '',
    address: '',
    lat: 0,
    lng: 0,
    priceSegment: '',
    tags: [] as string[],
    note: '',
    phone: '',
    open: '08:00',
    close: '22:00',
    menu: '',
    image: '',
    facebookUrl: '',
    website: '',
    googleMapsUrl: '',
    googleRating: 0,
    googleReviewCount: 0,
    status: 'active' as string
  });
  const [customTag, setCustomTag] = useState('');
  const [newAdminTag, setNewAdminTag] = useState('');
  
  // Tag Filter & Edit states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tagStatusFilter, setTagStatusFilter] = useState('all');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const parseGoogleMapsUrl = (url: string) => {
    setFormData(prev => ({ ...prev, googleMapsUrl: url }));
    
    // Regex to match @lat,lng in Google Maps URLs
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      setFormData(prev => ({
        ...prev,
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      }));
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingId(loc._id);
    setFormData({
      name: loc.name,
      city: loc.city,
      district: loc.district,
      address: loc.address,
      lat: loc.coordinates?.lat || 0,
      lng: loc.coordinates?.lng || 0,
      priceSegment: loc.priceSegment,
      tags: loc.tags,
      note: loc.note || '',
      phone: loc.phoneNumber || '',
      open: loc.openingHours?.open || '08:00',
      close: loc.openingHours?.close || '22:00',
      menu: loc.facebookUrl || '',
      image: loc.image || '',
      facebookUrl: loc.facebookUrl || '',
      website: loc.website || '',
      googleMapsUrl: loc.googleMapsUrl || '',
      googleRating: loc.googleRating || 0,
      googleReviewCount: loc.googleReviewCount || 0,
      status: loc.status || 'active'
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/locations/${editingId}` : '/api/locations';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          phoneNumber: formData.phone,
          openingHours: { open: formData.open, close: formData.close },
          coordinates: { lat: formData.lat, lng: formData.lng },
          googleMapsUrl: formData.googleMapsUrl,
          facebookUrl: formData.facebookUrl,
          website: formData.website,
          priceSegment: formData.priceSegment,
          tags: formData.tags,
          note: formData.note,
          image: formData.image || undefined,
          googleRating: formData.googleRating,
          googleReviewCount: formData.googleReviewCount,
          status: formData.status
        }),
      });

      if (res.ok) {
        toast.success(editingId ? '✅ Cập nhật thành công!' : '✨ Thêm mới thành công!');
        setIsAdding(false);
        setEditingId(null);
        setFormData({
          name: '', city: 'hanoi', district: '', address: '', lat: 0, lng: 0,
          priceSegment: '', tags: [], note: '', phone: '',
          open: '08:00', close: '22:00', menu: '', image: '', 
          facebookUrl: '', website: '', googleMapsUrl: '', 
          googleRating: 0, googleReviewCount: 0, status: 'active'
        });
        fetchLocations();
      } else {
        const errData = await res.json();
        toast.error(`❌ Lỗi: ${errData.msg || 'Không thể lưu địa điểm'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Lỗi kết nối máy chủ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa địa điểm này?')) return;
    try {
      const res = await fetch(`/api/locations?ids=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Đã xóa địa điểm');
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDeleteLocations = async () => {
    if (selectedLocations.length === 0) return;
    if (!confirm(`Xác nhận xóa ${selectedLocations.length} địa điểm đã chọn?`)) return;
    
    const toastId = toast.loading(`Đang xóa ${selectedLocations.length} địa điểm...`);
    try {
      const res = await fetch(`/api/locations?ids=${selectedLocations.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Đã xóa ${selectedLocations.length} địa điểm`, { id: toastId });
        setSelectedLocations([]);
        fetchLocations();
      } else {
        toast.error('Có lỗi xảy ra khi xóa', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối', { id: toastId });
    }
  };

  const toggleFeedbackModeration = async (locId: string, feedbackId: string, isHidden: boolean) => {
    try {
      const loc = locations.find(l => l._id === locId);
      if (!loc) return;
      
      const updatedFeedback = loc.feedback.map(f => 
        f._id === feedbackId ? { ...f, isHidden } : f
      );

      const res = await fetch(`/api/locations/${locId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: updatedFeedback })
      });
      if (res.ok) fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  const resolveReport = async (locId: string, reportId: string) => {
    try {
      const loc = locations.find(l => l._id === locId);
      if (!loc) return;
      
      const updatedReports = loc.reports.map(r => 
        r._id === reportId ? { ...r, status: 'resolved' } : r
      );

      const res = await fetch(`/api/locations/${locId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: updatedReports })
      });
      if (res.ok) fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    return {
      total: locations.length,
      views: locations.reduce((acc, curr) => acc + (curr.views || 0), 0),
      saves: locations.reduce((acc, curr) => acc + (curr.saves || 0), 0),
      reports: locations.reduce((acc, curr) => acc + (curr.reports?.filter(r => r.status === 'pending').length || 0), 0)
    };
  }, [locations]);

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading('Đang chuẩn bị dữ liệu...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        let data: any[] = [];
        if (file.name.endsWith('.csv')) {
           // Handle CSV if needed, but the requirement specifically mentioned Excel
           toast.error('Vui lòng sử dụng file Excel (.xlsx hoặc .xls)');
           setImporting(false);
           return;
        } else {
          const XLSX = await import('xlsx');
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          data = XLSX.utils.sheet_to_json(ws);
        }

        if (data.length === 0) {
          toast.error('File Excel không có dữ liệu', { id: toastId });
          setImporting(false);
          return;
        }

        toast.loading(`Đang nhập ${data.length} địa điểm...`, { id: toastId });

        let successCount = 0;
        let errorCount = 0;

        // Process in chunks or one by one
        for (const row of data) {
          try {
            // Flexible column mapping
            const name = row['Tên'] || row['Name'] || row['ten'];
            const address = row['Địa chỉ'] || row['Address'] || row['dia_chi'];
            
            if (!name || !address) {
              console.warn('Skipping row due to missing name or address:', row);
              continue;
            }

            const category = row['Phân loại'] || row['Category'] || '';
            const mapsCategory = row['Phân loại Maps'] || row['Maps Category'] || '';
            const openingHoursRaw = String(row['Giờ mở cửa'] || row['Opening Hours'] || '');
            const facebookUrl = row['Facebook'] || '';
            const imageUrl = row['Ảnh quán'] || row['Image'] || '';
            const note = row['Ghi chú'] || row['Notes'] || '';
            const phone = String(row['SĐT'] || row['Phone'] || '');
            const googleMapsUrl = row['Link Maps'] || row['Google Maps URL'] || '';
            const extraTags = row['Tag'] || row['Tags'] || '';
            const website = row['Website'] || '';
            const parseExcelNum = (val: any) => {
              if (val === undefined || val === null) return 0;
              if (typeof val === 'number') return val;
              return parseFloat(String(val).replace(',', '.')) || 0;
            };
            const googleRating = parseExcelNum(row['Đánh giá'] || row['Rating'] || row['Sao'] || row['googleRating']);
            const googleReviewCount = Math.floor(parseExcelNum(row['Số bài đánh giá']));

            // 1. Parse District and City from mapsCategory (format: "District - Province/City")
            let city = 'tiengiang';
            let district = '';
            
            if (mapsCategory && mapsCategory.includes('-')) {
              const parts = mapsCategory.split('-').map((p: string) => p.trim());
              district = parts[0];
              const provinceSearch = parts[parts.length - 1].toLowerCase();
              
              // Find matching city in cities state
              const foundCity = cities.find(c => {
                const cityName = c.name.toLowerCase();
                return cityName.includes(provinceSearch) || provinceSearch.includes(cityName);
              });
              
              if (foundCity) city = foundCity.slug;
            } else if (address) {
              // Try to guess city from address if mapsCategory is missing
              const addrLower = address.toLowerCase();
              const foundCity = cities.find(c => 
                addrLower.includes(c.name.toLowerCase())
              );
              if (foundCity) city = foundCity.slug;
            }

            // 2. Parse Opening Hours (supporting both HH:mm - HH:mm and H-H formats)
            let open = '08:00';
            let close = '22:00';
            
            // Try matching full format first: HH:mm - HH:mm
            const fullTimeMatch = openingHoursRaw.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
            if (fullTimeMatch) {
              open = fullTimeMatch[1].padStart(5, '0');
              close = fullTimeMatch[2].padStart(5, '0');
            } else {
              // Try matching short format: H-H (e.g., 4-0, 6-23)
              const shortTimeMatch = openingHoursRaw.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
              if (shortTimeMatch) {
                open = `${shortTimeMatch[1].padStart(2, '0')}:00`;
                close = `${shortTimeMatch[2].padStart(2, '0')}:00`;
              }
            }

            // 3. Construct Tags list
            const tagsSet = new Set<string>();
            if (category) category.split(/[;,]/).forEach((cat: string) => tagsSet.add(cat.trim()));
            if (extraTags) extraTags.split(/[;,]/).forEach((tag: string) => tagsSet.add(tag.trim()));
            const finalTags = Array.from(tagsSet).filter(Boolean);

            // 4. Coordinates from Google Maps URL
            let lat = 0;
            let lng = 0;
            if (googleMapsUrl) {
              const coordMatch = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
              if (coordMatch) {
                lat = parseFloat(coordMatch[1]);
                lng = parseFloat(coordMatch[2]);
              }
            }

            // Duplication check (Address and Google Maps URL)
            const isDuplicate = locations.some(loc => {
              const matchAddress = loc.address.toLowerCase().trim() === address.toLowerCase().trim();
              const matchMapsUrl = googleMapsUrl && loc.googleMapsUrl && 
                loc.googleMapsUrl.toLowerCase().trim() === googleMapsUrl.toLowerCase().trim();
              return matchAddress || matchMapsUrl;
            });

            if (isDuplicate) {
              console.warn(`Skipping duplicate location: ${name} (${address})`);
              continue;
            }

            // 5. Send API Request
            const payload = {
              name,
              city,
              district,
              address,
              phoneNumber: phone,
              openingHours: { open, close },
              coordinates: { lat, lng },
              googleMapsUrl,
              facebookUrl: facebookUrl || '',
              website: website || '',
              priceSegment: '',
              tags: finalTags,
              note: note || mapsCategory, // Use mapsCategory as secondary note if available
              image: imageUrl || undefined,
              googleRating,
              googleReviewCount,
              status: 'active'
            };

            const res = await fetch('/api/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              successCount++;
            } else {
              console.error(`Failed to import ${name}:`, await res.text());
              errorCount++;
            }
          } catch (err) {
            console.error('Row extraction error:', err);
            errorCount++;
          }
        }

        const skipCount = data.length - successCount - errorCount;
        let finalMessage = `Đã hoàn tất! Thành công: ${successCount}`;
        if (errorCount > 0) finalMessage += `, Thất bại: ${errorCount}`;
        if (skipCount > 0) finalMessage += `, Trùng lặp (đã bỏ qua): ${skipCount}`;

        toast.success(finalMessage, { id: toastId, duration: 5000 });
        fetchLocations();
      } catch (err) {
        console.error('Import process failed:', err);
        toast.error('Có lỗi xảy ra trong quá trình nhập dữ liệu', { id: toastId });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      toast.error('Không thể đọc file');
      setImporting(false);
    };
    reader.readAsBinaryString(file);
  };

  const pendingReports = useMemo(() => {
    const list: any[] = [];
    locations.forEach(loc => {
      loc.reports?.forEach(rep => {
        if (rep.status === 'pending') {
          list.push({ ...rep, locationName: loc.name, locationId: loc._id });
        }
      });
    });
    return list;
  }, [locations]);

  const filteredTags = useMemo(() => {
    return allTags.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(tagSearch.toLowerCase());
      const matchStatus = tagStatusFilter === 'all' || t.status === tagStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [allTags, tagSearch, tagStatusFilter]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchSearch = loc.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          loc.address.toLowerCase().includes(adminSearch.toLowerCase());
      const matchCity = adminCity === 'all' || loc.city === adminCity;
      const matchDistrict = adminDistrict === 'all' || loc.district === adminDistrict;
      const matchStatus = adminStatus === 'all' || loc.status === adminStatus;
      const matchTag = adminTag === 'all' || loc.tags.includes(adminTag);
      return matchSearch && matchCity && matchDistrict && matchStatus && matchTag;
    });
  }, [locations, adminSearch, adminCity, adminDistrict, adminStatus, adminTag]);

  if (!mounted) return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-amber-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-slate-900 font-black text-2xl">A</div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 animate-pulse tracking-[0.3em]">Admin Loading</h2>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-slate-900 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#F8FAFC] flex text-slate-900 font-vietnam overflow-hidden">
      {/* SIDEBAR */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        locationsCount={locations.length}
        pendingTagsCount={allTags.filter(t => t.status === 'pending').length}
        feedbackCount={allFeedbacks.length}
      />

      {/* Main Content Area */}
      <main className="flex-grow p-10 max-w-7xl mx-auto overflow-y-auto">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-14">
              <h1 className="text-5xl font-black tracking-tighter uppercase text-slate-900">Báo cáo hệ thống</h1>
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">Tình hình hoạt động thời gian thực</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
                 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><LayoutDashboard className="w-6 h-6" /></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng địa điểm</p>
                 <h2 className="text-4xl font-black text-slate-900">{stats.total}</h2>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><Eye className="w-6 h-6" /></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lượt truy cập</p>
                 <h2 className="text-4xl font-black text-slate-900">{stats.views.toLocaleString()}</h2>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100">
                 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6"><Save className="w-6 h-6" /></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lượt lưu quán</p>
                 <h2 className="text-4xl font-black text-slate-900">{stats.saves.toLocaleString()}</h2>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 border-red-100 bg-red-50/20">
                 <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6"><ShieldAlert className="w-6 h-6" /></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Báo lỗi chưa xử lý</p>
                 <h2 className="text-4xl font-black text-red-600">{stats.reports}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8">Báo lỗi từ người dùng</h3>
                  <div className="space-y-4">
                    {pendingReports.length === 0 ? (
                      <div className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Không có lỗi báo cáo nào</div>
                    ) : (
                      pendingReports.map((rep, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <div className="flex items-center gap-4">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <div>
                                 <p className="text-xs font-black uppercase text-slate-900">{rep.locationName}</p>
                                 <p className="text-xs text-slate-500 mt-1">{rep.reason}</p>
                              </div>
                           </div>
                           <button onClick={() => resolveReport(rep.locationId, rep._id)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">Đã sửa</button>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8">Hoạt động gần đây</h3>
                  <div className="space-y-6">
                     {locations.slice(0, 5).map(loc => (
                       <div key={loc._id} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                          <p className="text-xs font-bold text-slate-700">Địa điểm mới <span className="text-slate-900 font-black">"{loc.name}"</span> vừa được cập nhật tại {loc.district}.</p>
                          <span className="text-[9px] font-black text-slate-300 ml-auto uppercase">{new Date(loc.createdAt as any).toLocaleDateString('vi-VN')}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <AdminLocationsTab 
            locations={locations}
            filteredLocations={filteredLocations}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            adminSearch={adminSearch}
            adminCity={adminCity}
            adminDistrict={adminDistrict}
            adminStatus={adminStatus}
            adminTag={adminTag}
            allTags={allTags}
            cities={cities}
            setAdminSearch={setAdminSearch}
            setAdminCity={setAdminCity}
            setAdminDistrict={setAdminDistrict}
            setAdminStatus={setAdminStatus}
            setAdminTag={setAdminTag}
            onOpenCreate={() => { setEditingId(null); setFormData({ name: '', city: 'hanoi', district: '', address: '', lat: 0, lng: 0, priceSegment: '', tags: [], note: '', phone: '', open: '08:00', close: '22:00', menu: '', image: '', facebookUrl: '', website: '', googleMapsUrl: '', googleRating: 0, googleReviewCount: 0, status: 'active' }); setIsAdding(true); }}
            onOpenEdit={handleOpenEdit as any}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDeleteLocations}
            onExcelImport={handleExcelImport}
            importing={importing}
            fileInputRef={fileInputRef}
          />
        )}

        {/* TAB 3: CONTENT */}
        {activeTab === 'content' && (
          <AdminContentTab 
            locations={locations} 
            onToggleFeedbackModeration={toggleFeedbackModeration} 
          />
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <AdminCategoriesTab 
            cities={cities} 
            onRefresh={fetchCities}
            onNavigateToLocations={(citySlug, districtName) => {
              if (citySlug) setAdminCity(citySlug);
              setAdminDistrict(districtName || 'all');
              setActiveTab('locations');
            }}
          />
        )}

        {activeTab === 'tags' && (
          <AdminTagsTab 
            allTags={allTags}
            filteredTags={filteredTags}
            selectedTags={selectedTags}
            tagSearch={tagSearch}
            tagStatusFilter={tagStatusFilter}
            newAdminTag={newAdminTag}
            editingTagId={editingTagId}
            editingTagName={editingTagName}
            setSelectedTags={setSelectedTags}
            setTagSearch={setTagSearch}
            setTagStatusFilter={setTagStatusFilter}
            setNewAdminTag={setNewAdminTag}
            setEditingTagId={setEditingTagId}
            setEditingTagName={setEditingTagName}
            onAddAdminTag={handleAddAdminTag}
            onBulkDeleteTags={bulkDeleteTags}
            onSaveEditTag={saveEditTag}
            onUpdateTagStatus={updateTagStatus}
            onDeleteTag={deleteTag}
          />
        )}

        {activeTab === 'feedback' && (
          <AdminFeedbackTab allFeedbacks={allFeedbacks} />
        )}
      </main>

      <AdminLocationFormModal 
        isOpen={isAdding || !!editingId}
        isEditing={!!editingId}
        formData={formData}
        allTags={allTags}
        customTag={customTag}
        cities={cities}
        onClose={() => {
          setIsAdding(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        setFormData={setFormData as any}
        setCustomTag={setCustomTag}
        onToggleTag={toggleTag}
        onAddCustomTag={addCustomTag}
        onParseGoogleMapsUrl={parseGoogleMapsUrl}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@100;200;300;400;500;600;700;800;900&display=swap');
        .font-vietnam { font-family: 'Be Vietnam Pro', sans-serif; }
        body { font-family: 'Be Vietnam Pro', sans-serif; -webkit-font-smoothing: antialiased; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; border: 1px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}
