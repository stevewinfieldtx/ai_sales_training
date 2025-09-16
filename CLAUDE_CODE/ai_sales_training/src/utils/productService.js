import { supabase } from './supabase'

export class ProductService {
  // Get all products for current user's company
  static async getCompanyProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_created_by_fkey (full_name),
          product_documents (id, filename, file_type, file_size),
          product_urls (id, url, title, status)
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return { products: data, error: null }
    } catch (error) {
      return { products: [], error: error.message }
    }
  }

  // Get single product by ID
  static async getProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          user_profiles!products_created_by_fkey (full_name),
          product_documents (*),
          product_urls (*)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error
      return { product: data, error: null }
    } catch (error) {
      return { product: null, error: error.message }
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.user.id)
        .single()

      if (!profile) throw new Error('User profile not found')

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          company_id: profile.company_id,
          created_by: user.user.id
        })
        .select()
        .single()

      if (error) throw error
      return { product: data, error: null }
    } catch (error) {
      return { product: null, error: error.message }
    }
  }

  // Update product
  static async updateProduct(productId, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error
      return { product: data, error: null }
    } catch (error) {
      return { product: null, error: error.message }
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error
      return { product: data, error: null }
    } catch (error) {
      return { product: null, error: error.message }
    }
  }

  // Generate comprehensive product configuration
  static async generateProductConfiguration(productId) {
    try {
      // Get product with all documents and URLs
      const { product, error: productError } = await this.getProduct(productId)
      if (productError) throw new Error(productError)

      // Combine all content
      const documentContent = product.product_documents
        ?.map(doc => doc.extracted_content || '')
        .join('\n\n') || ''

      const urlContent = product.product_urls
        ?.filter(url => url.status === 'processed')
        .map(url => url.extracted_content || '')
        .join('\n\n') || ''

      const combinedContent = documentContent + '\n\n' + urlContent

      // Create enhanced configuration (you can integrate AI analysis here)
      const enhancedConfig = {
        id: productId,
        productName: product.name,
        description: product.description,
        valueProposition: product.value_proposition,
        targetMarket: 'Mid-market B2B companies', // AI would determine this
        keyFeatures: [
          'AI-powered insights',
          'Easy integration', 
          'Mobile-first design'
        ], // AI extracted
        competitiveAdvantages: [
          '40% productivity increase',
          'Real-time analytics',
          'Seamless workflow'
        ], // AI determined
        lastUpdated: new Date(),
        sources: {
          files: product.product_documents?.map(d => ({ 
            name: d.filename, 
            type: d.file_type 
          })) || [],
          urls: product.product_urls?.map(u => u.url) || []
        },
        rawContent: combinedContent
      }

      // Update product with enhanced configuration
      await this.updateProduct(productId, {
        configuration: enhancedConfig
      })

      return { configuration: enhancedConfig, error: null }
    } catch (error) {
      return { configuration: null, error: error.message }
    }
  }

  // Upload document to product
  static async uploadDocument(productId, file) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.user.id)
        .single()

      if (!profile) throw new Error('User profile not found')

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.user.id}/${profile.company_id}/${productId}/${fileName}`

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save document metadata to database
      const { data: docData, error: docError } = await supabase
        .from('product_documents')
        .insert({
          product_id: productId,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          extracted_content: '', // You can add document processing here
          uploaded_by: user.user.id
        })
        .select()
        .single()

      if (docError) throw docError

      return { document: docData, error: null }
    } catch (error) {
      return { document: null, error: error.message }
    }
  }

  // Add URL to product
  static async addUrl(productId, url, title = '') {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('product_urls')
        .insert({
          product_id: productId,
          url,
          title,
          added_by: user.user.id
        })
        .select()
        .single()

      if (error) throw error

      return { urlData: data, error: null }
    } catch (error) {
      return { urlData: null, error: error.message }
    }
  }

  // Get document download URL
  static async getDocumentUrl(storagePath) {
    try {
      const { data, error } = await supabase.storage
        .from('product-documents')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry

      if (error) throw error
      return { url: data.signedUrl, error: null }
    } catch (error) {
      return { url: null, error: error.message }
    }
  }

  // Delete document
  static async deleteDocument(documentId, storagePath) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-documents')
        .remove([storagePath])

      if (storageError) console.warn('Storage deletion failed:', storageError)

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Delete URL
  static async deleteUrl(urlId) {
    try {
      const { error } = await supabase
        .from('product_urls')
        .delete()
        .eq('id', urlId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }
}