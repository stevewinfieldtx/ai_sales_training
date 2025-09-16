import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Company {
  id: string
  name: string
  domain: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_id: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
  companies?: Company
}

export interface Product {
  id: string
  company_id: string
  name: string
  description?: string
  value_proposition?: string
  product_type?: string
  category?: string
  configuration: any
  raw_content?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  user_profiles?: { full_name: string }
  product_documents?: ProductDocument[]
  product_urls?: ProductUrl[]
}

export interface ProductDocument {
  id: string
  product_id: string
  filename: string
  file_type: string
  file_size: number
  storage_path: string
  extracted_content?: string
  uploaded_by: string
  created_at: string
}

export interface ProductUrl {
  id: string
  product_id: string
  url: string
  title?: string
  extracted_content?: string
  status: 'pending' | 'processed' | 'failed'
  added_by: string
  created_at: string
}

export interface TrainingSession {
  id: string
  company_id: string
  product_id: string
  user_id: string
  session_type: 'human_practice' | 'ai_simulation'
  persona_id: string
  pitch_type: string
  llm_model: string
  conversation_data: any
  results: any
  duration_minutes?: number
  success_rate?: number
  created_at: string
}