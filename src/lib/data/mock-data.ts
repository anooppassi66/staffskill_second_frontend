import type { User } from "@/lib/auth"

export interface Category {
  id: string
  category_name: string
  createdAt: string
}

export interface Lesson {
  id: string
  title: string
  videoUrl: string
  thumbnail: string
  duration: number
  isCompleted?: boolean
}

export interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  language: string
  image: string
  status: "draft" | "published"
  isActive: boolean
  chapters: Chapter[]
  instructor: string
  duration: number
  enrolledCount: number
  completionRate: number
  createdAt: string
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  marks: number
}

export interface Quiz {
  id: string
  courseId?: string
  title: string
  questions: Question[]
  totalMarks: number
  passMarks: number
  durationMinutes: number
  isPublic: boolean
  isActive: boolean
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  completedLessons: { chapterId: string; lessonId: string }[]
  readyForQuiz: boolean
  isCompleted: boolean
  enrolledAt: string
  completedAt?: string
  progress: number
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  quizId: string
  filePath: string
  marks: number
  outOf: number
  awardedAt: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  courseId: string
  score: number
  totalMarks: number
  passed: boolean
  attemptedAt: string
}

// Mock data
export const mockCategories: Category[] = [
  { id: "1", category_name: "Web Development", createdAt: "2024-01-01" },
  { id: "2", category_name: "Mobile Development", createdAt: "2024-01-02" },
  { id: "3", category_name: "Data Science", createdAt: "2024-01-03" },
  { id: "4", category_name: "Design", createdAt: "2024-01-04" },
  { id: "5", category_name: "DevOps", createdAt: "2024-01-05" },
]

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to TypeScript",
    description: "Learn the fundamentals of working with TypeScript and how to create basic applications.",
    category: "Web Development",
    level: "Beginner",
    language: "English",
    image: "/typescript-programming-blue-background.jpg",
    status: "published",
    isActive: true,
    instructor: "Elijah Murray",
    duration: 50,
    enrolledCount: 156,
    completionRate: 78,
    chapters: [
      {
        id: "c1",
        title: "Getting Started",
        lessons: [
          {
            id: "l1",
            title: "Introduction",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnail: "/typescript-introduction.jpg",
            duration: 10,
          },
          {
            id: "l2",
            title: "Setup Environment",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbnail: "/development-environment-setup.png",
            duration: 15,
          },
        ],
      },
      {
        id: "c2",
        title: "TypeScript Basics",
        lessons: [
          {
            id: "l3",
            title: "Types and Interfaces",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumbnail: "/typescript-types-interfaces.jpg",
            duration: 25,
          },
        ],
      },
    ],
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    title: "Angular Fundamentals",
    description: "Master Angular framework and build modern web applications.",
    category: "Web Development",
    level: "Intermediate",
    language: "English",
    image: "/angular-logo-red-background.jpg",
    status: "published",
    isActive: true,
    instructor: "Elijah Murray",
    duration: 72,
    enrolledCount: 98,
    completionRate: 65,
    chapters: [
      {
        id: "c1",
        title: "Angular Introduction",
        lessons: [
          {
            id: "l1",
            title: "What is Angular",
            videoUrl: "https://example.com/video1",
            thumbnail: "/angular-intro.jpg",
            duration: 20,
          },
        ],
      },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    title: "React Native Development",
    description: "Build cross-platform mobile apps with React Native.",
    category: "Mobile Development",
    level: "Intermediate",
    language: "English",
    image: "/react-native-mobile-app-blue.jpg",
    status: "published",
    isActive: true,
    instructor: "Elijah Murray",
    duration: 90,
    enrolledCount: 134,
    completionRate: 72,
    chapters: [],
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    title: "WordPress Development",
    description: "Learn to build and customize WordPress websites.",
    category: "Web Development",
    level: "Beginner",
    language: "English",
    image: "/wordpress-logo-blue.png",
    status: "published",
    isActive: true,
    instructor: "Elijah Murray",
    duration: 48,
    enrolledCount: 203,
    completionRate: 85,
    chapters: [],
    createdAt: "2024-01-25",
  },
]

export const mockEmployees: User[] = [
  {
    id: "2",
    first_name: "John",
    last_name: "Doe",
    user_name: "johndoe",
    email: "john@lms.com",
    phone_number: "+1234567891",
    gender: "male",
    dob: "1995-05-15",
    bio: "Software Engineer",
    role: "employee",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    first_name: "Jane",
    last_name: "Smith",
    user_name: "janesmith",
    email: "jane@lms.com",
    phone_number: "+1234567892",
    gender: "female",
    dob: "1993-08-22",
    bio: "UX Designer",
    role: "employee",
    isActive: true,
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    first_name: "Mike",
    last_name: "Johnson",
    user_name: "mikej",
    email: "mike@lms.com",
    phone_number: "+1234567893",
    gender: "male",
    dob: "1997-03-10",
    bio: "Data Analyst",
    role: "employee",
    isActive: true,
    createdAt: "2024-01-10",
  },
]

export const mockEnrollments: Enrollment[] = [
  {
    id: "1",
    userId: "2",
    courseId: "1",
    completedLessons: [
      { chapterId: "c1", lessonId: "l1" },
      { chapterId: "c1", lessonId: "l2" },
    ],
    readyForQuiz: true,
    isCompleted: false,
    enrolledAt: "2024-02-01",
    progress: 67,
  },
  {
    id: "2",
    userId: "2",
    courseId: "2",
    completedLessons: [],
    readyForQuiz: false,
    isCompleted: false,
    enrolledAt: "2024-02-05",
    progress: 0,
  },
  {
    id: "3",
    userId: "3",
    courseId: "1",
    completedLessons: [
      { chapterId: "c1", lessonId: "l1" },
      { chapterId: "c1", lessonId: "l2" },
      { chapterId: "c2", lessonId: "l3" },
    ],
    readyForQuiz: true,
    isCompleted: true,
    enrolledAt: "2024-01-20",
    completedAt: "2024-02-15",
    progress: 100,
  },
]

export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    courseId: "1",
    title: "TypeScript Fundamentals Quiz",
    questions: [
      {
        id: "q1",
        question: "What is TypeScript?",
        options: ["A JavaScript library", "A superset of JavaScript", "A database", "A framework"],
        correctAnswer: 1,
        marks: 2,
      },
      {
        id: "q2",
        question: "Which keyword is used to define a type in TypeScript?",
        options: ["type", "interface", "class", "Both A and B"],
        correctAnswer: 3,
        marks: 2,
      },
    ],
    totalMarks: 10,
    passMarks: 6,
    durationMinutes: 30,
    isPublic: true,
    isActive: true,
    createdAt: "2024-01-12",
  },
  {
    id: "2",
    courseId: "2",
    title: "Angular Routing Quiz",
    questions: [
      {
        id: "q1",
        question: "What module is required for routing in Angular?",
        options: ["HttpModule", "RouterModule", "FormsModule", "CommonModule"],
        correctAnswer: 1,
        marks: 2,
      },
    ],
    totalMarks: 10,
    passMarks: 6,
    durationMinutes: 20,
    isPublic: true,
    isActive: true,
    createdAt: "2024-01-16",
  },
]

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: "1",
    userId: "3",
    quizId: "1",
    courseId: "1",
    score: 8,
    totalMarks: 10,
    passed: true,
    attemptedAt: "2024-02-15",
  },
  {
    id: "2",
    userId: "2",
    quizId: "1",
    courseId: "1",
    score: 5.8,
    totalMarks: 10,
    passed: false,
    attemptedAt: "2024-02-10",
  },
]

export const mockCertificates: Certificate[] = [
  {
    id: "1",
    userId: "3",
    courseId: "1",
    quizId: "1",
    filePath: "/certificates/cert-1.pdf",
    marks: 8,
    outOf: 10,
    awardedAt: "2024-02-15",
  },
]
