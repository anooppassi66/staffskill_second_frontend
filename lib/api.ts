"use client"

import Swal from "sweetalert2"
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
const ROOT_URL = BASE_URL.replace(/\/api$/, "")

export const APIS = {
  AUTH: `${BASE_URL}/auth`,
  ADMIN: `${BASE_URL}/admin`,
  CATEGORIES: `${BASE_URL}/categories`,
  COURSES: `${BASE_URL}/courses`,
  ENROLLMENTS: `${BASE_URL}/enrollments`,
  QUIZZES: `${BASE_URL}/quizzes`,
  CERTIFICATES: `${BASE_URL}/certificates`,
  EMPLOYEE: `${BASE_URL}/employee`,
}

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${APIS.AUTH}/login`,
    REGISTER: `${APIS.AUTH}/register`,
    PROFILE: `${APIS.AUTH}/profile`,
    SEED_ADMIN: `${APIS.AUTH}/seed-admin`,
    CHANGE_PASSWORD: `${APIS.AUTH}/password`,
  },
  ADMIN: {
    LIST_EMPLOYEES: `${APIS.ADMIN}/employees`,
    DEACTIVATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}/deactivate`,
    ACTIVATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}/activate`,
    UPDATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}`,
    DEACTIVATE_QUIZ: (quizId: string) => `${APIS.ADMIN}/quizzes/${quizId}/deactivate`,
    DASHBOARD: `${APIS.ADMIN}/dashboard`,
  },
  CATEGORIES: {
    LIST: `${APIS.CATEGORIES}/`,
    GET: (id: string) => `${APIS.CATEGORIES}/${id}`,
    CREATE: `${APIS.CATEGORIES}/`,
    UPDATE: (id: string) => `${APIS.CATEGORIES}/${id}`,
    DELETE: (id: string) => `${APIS.CATEGORIES}/${id}`,
  },
  COURSES: {
    CREATE: `${APIS.COURSES}/`,
    UPDATE: (id: string) => `${APIS.COURSES}/${id}`,
    DEACTIVATE: (id: string) => `${APIS.COURSES}/${id}`,
    ADMIN_LIST: `${APIS.COURSES}/`,
    ADMIN_GET: (id: string) => `${APIS.COURSES}/${id}`,
    ADD_CHAPTER: (courseId: string) => `${APIS.COURSES}/${courseId}/chapters`,
    ADD_LESSON: (courseId: string, chapterId: string) => `${APIS.COURSES}/${courseId}/chapters/${chapterId}/lessons`,
    PUBLIC_LIST: `${APIS.COURSES}/public/list`,
    PUBLIC_GET: (id: string) => `${APIS.COURSES}/public/${id}`,
  },
  ENROLLMENTS: {
    ENROLL: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/enroll`,
    ME: `${APIS.ENROLLMENTS}/me`,
    COMPLETE_LESSON: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/complete-lesson`,
    PROGRESS: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/progress`,
    RESUME: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/resume`,
  },
  QUIZZES: {
    CREATE: `${APIS.QUIZZES}`,
    ATTEMPT: (quizId: string) => `${APIS.QUIZZES}/${quizId}/attempt`,
    UPDATE: (quizId: string) => `${APIS.QUIZZES}/${quizId}`,
    DELETE: (quizId: string) => `${APIS.QUIZZES}/${quizId}`,
    GET: (quizId: string) => `${APIS.QUIZZES}/${quizId}`,
    LIST: `${APIS.QUIZZES}`,
  },
  CERTIFICATES: {
    LIST: `${APIS.CERTIFICATES}`,
  },
  EMPLOYEE: {
    DASHBOARD: `${APIS.EMPLOYEE}/dashboard`,
  },
}

export const MEDIA = {
  ROOT: ROOT_URL,
  url: (p?: string) => {
    if (!p) return ""
    const path = p.startsWith("/") ? p : "/" + p
    return ROOT_URL + path
  },
}

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
  token?: string
  headers?: Record<string, string>
  suppressSuccessAlert?: boolean
}

export async function apiFetch(url: string, opts: ApiOptions = {}) {
  const { method = "GET", body, token, headers = {}, suppressSuccessAlert = false } = opts
  const init: RequestInit = {
    method,
    headers: {
      ...(body ? { "Content-Type": body instanceof FormData ? undefined as any : "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  }
  const res = await fetch(url, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`
    Swal.fire("Error", String(msg), "error")
    throw new Error(msg)
  }
  if (method !== "GET" && !suppressSuccessAlert) {
    const message = (data && (data.message || data.status || "Success")) as string
    Swal.fire("Success", String(message), "success")
  }
  return data
}
