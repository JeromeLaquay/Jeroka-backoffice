import { Router } from 'express';
import { verifyToken } from '@/middleware/auth';

const router = Router();

// All product routes require authentication
router.use(verifyToken);

// Mock data for now - you can replace with real database queries
const mockProducts = [
  {
    id: 1,
    name: 'Produit 1',
    description: 'Description du produit 1',
    price: 29.99,
    stock: 10,
    category: 'Catégorie A',
    featured: true,
    createdAt: new Date()
  },
  // Add more mock products as needed
];

const mockCategories = [
  { id: 1, name: 'Catégorie A', productCount: 5 },
  { id: 2, name: 'Catégorie B', productCount: 3 },
  { id: 3, name: 'Catégorie C', productCount: 7 }
];

/**
 * @route GET /api/v1/products
 * @desc Get all products
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, type } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    // Apply filters
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes((search as string).toLowerCase()) ||
        p.description.toLowerCase().includes((search as string).toLowerCase())
      );
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (type === 'featured') {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }
    
    if (type === 'low-stock') {
      filteredProducts = filteredProducts.filter(p => p.stock < 5);
    }
    
    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredProducts.length / (limit as number))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des produits',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/products/categories
 * @desc Get all product categories
 * @access Private
 */
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des catégories',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/products/stats
 * @desc Get product statistics
 * @access Private
 */
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = mockProducts.length;
    const featuredProducts = mockProducts.filter(p => p.featured).length;
    const lowStockProducts = mockProducts.filter(p => p.stock < 5).length;
    const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    res.json({
      success: true,
      data: {
        total: totalProducts,
        featured: featuredProducts,
        lowStock: lowStockProducts,
        totalValue: totalValue,
        categories: mockCategories.length,
        averagePrice: totalProducts > 0 ? mockProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;


