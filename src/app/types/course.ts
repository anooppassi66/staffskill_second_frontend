export interface Course {
  id: string;
  image: string;
  badgeText?: string;
  category: string;
  author: string;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  status: 'Enrolled' | 'Active' | 'Completed';
}

export interface Certificate {
  id: string;
  name: string;
  date: string;
  marks: number;
  outOf: number;
}
