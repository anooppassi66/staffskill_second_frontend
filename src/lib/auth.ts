"use client"

import { ENDPOINTS, apiFetch } from "@/lib/api"

export type UserRole = "admin" | "employee"

export interface User {
  _id?: string
  id?: string
  first_name: string
  last_name: string
  user_name?: string
  email: string
  phone_number?: string
  gender?: string
  dob?: string
  bio?: string
  role: UserRole
  isActive?: boolean
  createdAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    const data = await apiFetch(ENDPOINTS.AUTH.LOGIN, { method: "POST", body: { email, password }, suppressSuccessAlert: true }).catch(() => null)
    if (!data) return null
    const token = data.token || data.accessToken || ""
    const user: User = data.user || data
    if (token && user) {
      localStorage.setItem("lms_user", JSON.stringify(user))
      localStorage.setItem("lms_token", token)
      return { user, token }
    }
    return null
  },

  logout: () => {
    localStorage.removeItem("lms_user")
    localStorage.removeItem("lms_token")
  },

  getCurrentUser: (): { user: User | null; token: string | null } => {
    if (typeof window === "undefined") return { user: null, token: null }
    const userStr = localStorage.getItem("lms_user")
    const token = localStorage.getItem("lms_token")
    const user = userStr ? (JSON.parse(userStr) as User) : null
    return { user, token }
  },

  updateUser: (user: User) => {
    localStorage.setItem("lms_user", JSON.stringify(user))
  },
}
