import { supabase } from './supabase'

export class AuthService {
  // Sign up with email and password
  static async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  // Get current user profile with company info
  static async getCurrentUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) return { profile: null, error: null }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      return { profile, error: null }
    } catch (error) {
      return { profile: null, error: error.message }
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export class CompanyService {
  // Get company users
  static async getCompanyUsers(companyId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { users: data, error: null }
    } catch (error) {
      return { users: [], error: error.message }
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId, role) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { user: data, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }
}