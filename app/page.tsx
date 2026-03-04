'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, ExternalLink, MessageSquare, Quote, Clock, ArrowUpDown, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { Location, User } from '@/types';

// Components
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import LocationCard from '@/components/LocationCard';
import LocationDetailModal from '@/components/LocationDetailModal';
import AddLocationModal from '@/components/AddLocationModal';
import LoginModal from '@/components/LoginModal';
import ReportModal from '@/components/ReportModal';
import FeedbackModal from '@/components/FeedbackModal';
import ShuffleButton from '@/components/ShuffleButton';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState<User | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const [userLocation, setUserLocation] = useState('hanoi');
  const [userDistrict, setUserDistrict] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLocations = async (cityId?: string, districtId?: string) => {
    setLoading(true);
    const city = cityId || userLocation;
    const district = districtId || userDistrict;
    
    let url = `/api/locations?city=${city}`;
    if (district && district !== 'all') {
      url += `&district=${district}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLocations(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      toast.error('Không thể kết nối với máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { localStorage.removeItem('user'); }
    }

    const storedLoc = localStorage.getItem('userLocation') || 'hanoi';
    const storedDist = localStorage.getItem('userDistrict') || 'all';
    setUserLocation(storedLoc);
    setUserDistrict(storedDist);

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.handleGoogleCallback = async (response: any) => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          setIsLoginModalOpen(false);
          window.location.reload();
        }
      } catch (err) {}
    };

    fetchLocations(storedLoc, storedDist);

    fetch('/api/tags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDynamicCategories(data);
        }
      });

    return () => {
      const gScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (gScript) document.body.removeChild(gScript);
    };
  }, []);

  useEffect(() => {
    if (isLoginModalOpen && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: window.handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-button'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'pill' }
      );
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    let result = [...locations];
    
    if (userLocation && userLocation !== 'all') {
      result = result.filter(loc => loc.city === userLocation);
    }
    if (userDistrict && userDistrict !== 'all') {
      result = result.filter(loc => loc.district === userDistrict);
    }

    if (showSavedOnly) result = result.filter(loc => loc.isLiked);
    if (activeTag !== 'all') result = result.filter(loc => loc.tags.includes(activeTag));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        loc.address.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      result.sort((a, b) => b._id.localeCompare(a._id));
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, activeTag, locations, userLocation, userDistrict, showSavedOnly, sortBy]);

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const allRecentFeedback = useMemo(() => {
    const list: any[] = [];
    locations.forEach(loc => {
      loc.feedback?.forEach(f => {
        if (!f.isHidden) {
          list.push({ ...f, locationName: loc.name, locationId: loc._id, locationImage: loc.image });
        }
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [locations]);

  useEffect(() => {
    if (search && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [search]);

  const topSaved = useMemo(() => {
    return [...locations].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  }, [locations]);

  const handleCityChange = (cityId: string) => {
    setUserLocation(cityId);
    setUserDistrict('all');
    localStorage.setItem('userLocation', cityId);
    localStorage.setItem('userDistrict', 'all');
    fetchLocations(cityId, 'all');
  };

  const handleDistrictChange = (dist: string) => {
    setUserDistrict(dist);
    localStorage.setItem('userDistrict', dist);
    fetchLocations(userLocation, dist);
  };

  const handleShuffle = () => {
    if (filtered.length > 0) {
      const random = filtered[Math.floor(Math.random() * filtered.length)];
      setSelectedLocation(random);
    }
  };

  const handleSelectLocation = async (loc: Location) => {
    setSelectedLocation(loc);
    await fetch(`/api/locations/${loc._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ views: (loc.views || 0) + 1 })
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleLike = async (id: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu địa điểm!');
      return setIsLoginModalOpen(true);
    }
    
    const res = await fetch(`/api/locations/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      setSelectedLocation(updated);
      setLocations(prev => prev.map(l => l._id === id ? updated : l));
      toast.success(updated.isLiked ? '📍 Đã lưu vào danh sách của bạn!' : '📍 Đã gỡ khỏi danh sách lưu');
    } else {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  const handleAddFeedback = async (id: string, text: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi nhận xét!');
      return setIsLoginModalOpen(true);
    }
    if (!text.trim()) return;

    const res = await fetch(`/api/locations/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: text, rating: 5 })
    });
    if (res.ok) {
      const updated = await res.json();
      toast.success('💬 Cảm ơn bạn đã chia sẻ trải nghiệm!');
      setSelectedLocation(updated);
      setLocations(prev => prev.map(l => l._id === id ? updated : l));
      setFeedbackText('');
    } else {
      toast.error('Gửi nhận xét thất bại.');
    }
  };

  const handleReport = async (id: string, reason: string) => {
    const res = await fetch(`/api/locations/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      toast.success('📢 Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xử lý sớm!');
      setIsReportModalOpen(false);
      setReportText('');
    } else {
      toast.error('Gửi báo cáo thất bại.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTag('all');
    setShowSavedOnly(false);
    setSortBy('newest');
  };

  const SkeletonCard = () => (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-200 border-4 border-white shadow-sm"></div>
      <div className="px-2 space-y-3">
        <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
        <div className="h-3 w-1/2 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  );

  if (!mounted) return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white">
      <div className="w-20 h-20 border-4 border-slate-100 border-t-amber-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-vietnam">
      <Header 
        user={user}
        userLocation={userLocation}
        userDistrict={userDistrict}
        onCityChange={handleCityChange}
        onDistrictChange={handleDistrictChange}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdd={() => setIsAddModalOpen(true)}
        onToggleSaved={() => setShowSavedOnly(!showSavedOnly)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      <HeroSection 
        search={search}
        onSearchChange={setSearch}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly(!showSavedOnly)}
        onClearFilters={clearFilters}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        userDistrict={userDistrict}
        categories={dynamicCategories}
      />

      <main ref={resultsRef} className="max-w-7xl mx-auto px-6 py-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-12">
              {paginatedLocations.map(loc => (
                <LocationCard 
                  key={loc._id} 
                  location={loc} 
                  onClick={() => handleSelectLocation(loc)} 
                  onLike={(e, id) => {
                    e.stopPropagation();
                    handleLike(id);
                  }}
                />
              ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-slate-100 max-w-4xl mx-auto">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border-2 border-slate-100">
                <MapPin className="w-12 h-12" />
             </div>
             <h3 className="text-3xl font-black mb-4 text-slate-900 uppercase tracking-tight">Khu vực này hiện đang trống!</h3>
             <p className="text-slate-400 text-sm font-bold mb-12 max-w-md mx-auto leading-relaxed uppercase tracking-widest">Bạn chia sẻ quán ngon tại khu vực này hoặc để chúng mình gửi list gợi ý sịn sò cho bạn nhé 🥂</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button onClick={() => user ? setIsAddModalOpen(true) : setIsLoginModalOpen(true)} className="w-full sm:w-auto px-12 py-5 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">Góp quán sịn ngay</button>
             </div>
          </div>
        )}
      </main>

      {/* TOP SAVED RANKING SECTION */}
      {topSaved.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="bg-white rounded-[4rem] border-4 border-slate-100 p-12 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
                <Bookmark className="w-6 h-6 fill-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Bảng xếp hạng Top Đỉnh</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Những quán được lưu nhiều nhất từ cộng đồng</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {topSaved.map((loc, idx) => (
                <div 
                  key={loc._id} 
                  className="group cursor-pointer relative"
                  onClick={() => handleSelectLocation(loc)}
                >
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-4 border-2 border-slate-50 shadow-inner group-hover:border-amber-600 transition-all">
                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xl border border-white/20">
                      {idx + 1}
                    </div>
                  </div>
                  <h4 className="font-black text-[11px] uppercase tracking-tight text-slate-900 group-hover:text-amber-600 truncate">{loc.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Bookmark className="w-3 h-3 text-amber-600 fill-amber-600" />
                    <span className="text-[10px] font-black text-slate-400">{loc.likes || 0} lượt lưu</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECENT FEEDBACK SECTION */}
      {allRecentFeedback.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="border-t-2 border-slate-100 pt-24">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-amber-100">
                <MessageSquare className="w-3.5 h-3.5" />
                Cộng đồng đang nói gì?
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">Cảm nhận từ cộng đồng</h2>
              <div className="w-20 h-1.5 bg-amber-600 mt-8 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allRecentFeedback.map((f, i) => (
                <div 
                  key={i} 
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    const loc = locations.find(l => l._id === f.locationId);
                    if (loc) handleSelectLocation(loc);
                  }}
                >
                  <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-amber-50 transition-colors">
                    <Quote className="w-16 h-16 rotate-12" />
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg overflow-hidden border-2 border-slate-100">
                          {f.locationImage ? (
                            <img src={f.locationImage} className="w-full h-full object-cover opacity-80" alt="" />
                          ) : (
                            <span className="uppercase">{f.user.charAt(0)}</span>
                          )}
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-900">{f.user}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(f.date).toLocaleDateString('vi-VN')}
                          </p>
                       </div>
                    </div>

                    <p className="text-slate-600 font-medium leading-relaxed italic mb-8 relative z-10">"{f.comment}"</p>

                    <button className="flex items-center gap-2 group/btn">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 group-hover/btn:mr-2 transition-all">Tại {f.locationName}</span>
                      <ArrowUpDown className="w-3 h-3 text-amber-600 -rotate-90" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ShuffleButton onClick={handleShuffle} />

      {selectedLocation && (
        <LocationDetailModal 
          location={selectedLocation} 
          onClose={() => setSelectedLocation(null)}
          user={user}
          onLike={handleLike}
          onReport={() => setIsReportModalOpen(true)}
          onAddFeedback={handleAddFeedback}
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
        />
      )}

      {isAddModalOpen && (
        <AddLocationModal 
          onClose={() => setIsAddModalOpen(false)}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} userEmail={user?.username} />
      )}

      {isReportModalOpen && selectedLocation && (
        <ReportModal 
          location={selectedLocation}
          onClose={() => setIsReportModalOpen(false)}
          reportText={reportText}
          setReportText={setReportText}
          onSubmit={handleReport}
          user={user}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}
    </div>
  );
}
