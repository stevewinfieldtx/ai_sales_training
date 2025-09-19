import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// JSDoc typedefs are provided for editor IntelliSense without breaking the build pipeline
/**
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {string} domain
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {string=} full_name
 * @property {string} company_id
 * @property {'admin'|'user'} role
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Company=} companies
 */

/**
 * @typedef {Object} ProductDocument
 * @property {string} id
 * @property {string} product_id
 * @property {string} filename
 * @property {string} file_type
 * @property {number} file_size
 * @property {string} storage_path
 * @property {string=} extracted_content
 * @property {string} uploaded_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} ProductUrl
 * @property {string} id
 * @property {string} product_id
 * @property {string} url
 * @property {string=} title
 * @property {string=} extracted_content
 * @property {'pending'|'processed'|'failed'} status
 * @property {string} added_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} company_id
 * @property {string} name
 * @property {string=} description
 * @property {string=} value_proposition
 * @property {string=} product_type
 * @property {string=} category
 * @property {*} configuration
 * @property {string=} raw_content
 * @property {boolean} is_active
 * @property {string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 * @property {{ full_name: string }=} user_profiles
 * @property {ProductDocument[]=} product_documents
 * @property {ProductUrl[]=} product_urls
 */

/**
 * @typedef {Object} TrainingSession
 * @property {string} id
 * @property {string} company_id
 * @property {string} product_id
 * @property {string} user_id
 * @property {'human_practice'|'ai_simulation'} session_type
 * @property {string} persona_id
 * @property {string} pitch_type
 * @property {string} llm_model
 * @property {*} conversation_data
 * @property {*} results
 * @property {number=} duration_minutes
 * @property {number=} success_rate
 * @property {string} created_at
 */