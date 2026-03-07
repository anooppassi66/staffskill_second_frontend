"use client"
// components/CourseCard.tsx
import React from 'react';
import { Course } from '../types/course'; // Adjust path as needed
import { Star } from 'lucide-react'; // Lucide Icons
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ENDPOINTS } from '@/Api';
import { toast } from 'react-toastify';

interface CourseCardProps {
  course: Course;
}

const EnrolledCourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();
  const user = useSelector((s: RootState) => s.user);
  return (
    <div className="card info-card shadow-sm border-0 h-100">
      <Image src={course.image} alt={course.title} width={96} height={96} className="info-card-logo" unoptimized />
      <div>
        <div className="info-card-org d-flex justify-content-end">{course.category}</div>
        <h6 className="info-card-title mb-1">
          <Link href={`/enrolled-courses/${course.id}`} className="text-decoration-none text-dark">
            {course.title}
          </Link>
        </h6>
        {/* <div className="d-flex align-items-center mb-3">
          <Star size={14} fill="#ffc107" stroke="#ffc107" className="me-1" />
          <span className="rating-text me-1">{course.rating}</span>
          <span className="rating-text">({course.reviews} Reviews)</span>
        </div> */}
        <div className="mt-4 mb-3 d-flex justify-content-end">
          {course.status === 'Completed' ? (
            <button
              className="custom-btn"
              onClick={async () => {
                try {
                  const qs = new URLSearchParams();
                  qs.set('limit', '1');
                  qs.set('course', course.id || '');
                  const res = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
                    headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) }
                  });
                  const d = await res.json().catch(() => ({}));
                  const list = Array.isArray(d.quizzes) ? d.quizzes : Array.isArray(d.items) ? d.items : [];
                  const target = list[0];
                  const quizId = target?._id || target?.id;
                  if (quizId) {
                    router.push(`/quiz/${quizId}`);
                  } else {
                    toast.error('Quiz not available for this course');
                  }
                } catch {
                  toast.error('Failed to load quiz');
                }
              }}
            >
              Take Quiz
            </button>
          ) : (
            <button className="custom-btn" onClick={() => router.push(`/enrolled-courses/${course.id}`)}>
              View Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
