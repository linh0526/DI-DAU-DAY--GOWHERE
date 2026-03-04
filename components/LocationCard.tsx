'use client';

import { Bookmark, Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location } from '@/types';

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  onLike: (e: React.MouseEvent, id: string) => void;
}

export default function LocationCard({ location, onClick, onLike }: LocationCardProps) {
  return (
    <div 
      className="group cursor-pointer bg-white rounded-[3rem] p-3 border-4 border-slate-50 shadow-sm hover:shadow-2xl hover:border-amber-100 transition-all duration-500 flex flex-col" 
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden rounded-[2.5rem] bg-slate-100 relative shadow-inner">
         <img 
           src={location.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop`} 
           className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
           alt={location.name} 
         />
         
         {/* Top overlays */}
         <div className="absolute top-5 left-5 right-5 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
               <div className="px-4 py-2 bg-amber-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-widest rounded-xl uppercase shadow-lg shadow-amber-900/20">
                 {location.tags[0] || 'Ẩm thực'}
               </div>
               {location.status === 'maintenance' && (
                 <div className="px-4 py-1.5 bg-orange-500/90 backdrop-blur-md text-white text-[8px] font-black tracking-widest rounded-lg uppercase shadow-lg">
                   Đang bảo trì
                 </div>
               )}
            </div>

             <button 
               onClick={(e) => onLike(e, location._id)}
               className={cn(
                 "p-3.5 rounded-2xl backdrop-blur-md transition-all pointer-events-auto shadow-xl",
                 location.isLiked 
                   ? "bg-amber-600 text-white shadow-amber-900/20" 
                   : "bg-white/80 text-slate-400 hover:bg-white hover:text-amber-600"
               )}
             >
               <Bookmark className={cn("w-5 h-5", location.isLiked ? "fill-white" : "fill-none")} />
             </button>
         </div>

         {/* Bottom overlay: Price */}
         {location.priceSegment && (
           <div className="absolute bottom-5 left-5 pointer-events-none">
              <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-black tracking-[0.2em] rounded-lg border border-white/10">
                {location.priceSegment}
              </div>
           </div>
         )}
      </div>

      <div className="px-4 py-4">
         <h3 className="font-black text-lg leading-tight uppercase tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-2">
           {location.name}
         </h3>
         <div className="flex items-start gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold uppercase tracking-tight line-clamp-2 leading-relaxed">
              {location.address}
            </p>
         </div>
      </div>
    </div>
  );
}
