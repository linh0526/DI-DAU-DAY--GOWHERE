export interface Feedback {
  user: string;
  comment: string;
  date: string;
  rating?: number;
  isHidden?: boolean;
}

export interface Location {
  _id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phoneNumber?: string;
  openingHours?: { open: string; close: string };
  priceSegment: string;
  tags: string[];
  note?: string;
  image?: string;
  facebookUrl?: string;
  website?: string;
  likes: number;
  upvotes: number;
  status?: string;
  googleMapsUrl?: string;
  feedback: Feedback[];
  coordinates: { lat: number; lng: number };
  views: number;
  isLiked?: boolean;
}

export interface User {
  username: string;
  role: string;
}
