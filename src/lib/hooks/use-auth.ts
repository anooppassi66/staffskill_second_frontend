"use client"

import { useState, useEffect } from "react"
import { type User, authService } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { user, token } = authService.getCurrentUser()
    setUser(user)
    setToken(token)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password)
    if (res) {
      setUser(res.user)
      setToken(res.token)
      return res.user
    }
    return null
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  const updateProfile = (updatedUser: User) => {
    authService.updateUser(updatedUser)
    setUser(updatedUser)
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateProfile,
  }
}
