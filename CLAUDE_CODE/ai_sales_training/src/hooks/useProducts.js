import { useState, useEffect } from 'react'
import { ProductService } from '../utils/productService'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { products: data, error: err } = await ProductService.getCompanyProducts()
    
    if (err) {
      setError(err)
    } else {
      setProducts(data)
      setError(null)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const createProduct = async (productData) => {
    const { product, error } = await ProductService.createProduct(productData)
    
    if (error) {
      return { success: false, error }
    }
    
    // Refresh products list
    await fetchProducts()
    return { success: true, product }
  }

  const updateProduct = async (productId, productData) => {
    const { product, error } = await ProductService.updateProduct(productId, productData)
    
    if (error) {
      return { success: false, error }
    }
    
    // Update local state
    setProducts(prev => prev.map(p => p.id === productId ? product : p))
    return { success: true, product }
  }

  const deleteProduct = async (productId) => {
    const { error } = await ProductService.deleteProduct(productId)
    
    if (error) {
      return { success: false, error }
    }
    
    // Remove from local state
    setProducts(prev => prev.filter(p => p.id !== productId))
    return { success: true }
  }

  const generateConfiguration = async (productId) => {
    const { configuration, error } = await ProductService.generateProductConfiguration(productId)
    
    if (error) {
      return { success: false, error }
    }
    
    // Update local state
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, configuration, updated_at: new Date().toISOString() }
        : p
    ))
    
    return { success: true, configuration }
  }

  const uploadDocument = async (productId, file) => {
    const { document, error } = await ProductService.uploadDocument(productId, file)
    
    if (error) {
      return { success: false, error }
    }
    
    // Refresh products to show new document
    await fetchProducts()
    return { success: true, document }
  }

  const addUrl = async (productId, url, title) => {
    const { urlData, error } = await ProductService.addUrl(productId, url, title)
    
    if (error) {
      return { success: false, error }
    }
    
    // Refresh products to show new URL
    await fetchProducts()
    return { success: true, urlData }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    generateConfiguration,
    uploadDocument,
    addUrl,
    refetch: fetchProducts
  }
}