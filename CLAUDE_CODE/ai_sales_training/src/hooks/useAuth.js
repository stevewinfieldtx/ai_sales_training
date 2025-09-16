import { useState, useEffect } from 'react'
import { AuthService } from '../utils/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user } = await AuthService.getCurrentUser()
      setUser(user)
      
      if (user) {
        const { profile } = await AuthService.getCurrentUserProfile()
        setProfile(profile)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          const { profile } = await AuthService.getCurrentUserProfile()
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const { user, error } = await AuthService.signIn(email, password)
    if (user) {
      const { profile } = await AuthService.getCurrentUserProfile()
      setProfile(profile)
    }
    return { user, error }
  }

  const signUp = async (email, password, fullName) => {
    const { user, error } = await AuthService.signUp(email, password, fullName)
    if (user) {
      const { profile } = await AuthService.getCurrentUserProfile()
      setProfile(profile)
    }
    return { user, error }
  }

  const signOut = async () => {
    const { error } = await AuthService.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut
  }
}