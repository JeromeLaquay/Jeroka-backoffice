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
    
    return res.json({
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
    return res.status(500).json({
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
    return res.json({
      success: true,
      data: mockCategories
    });
  } catch (error) {
    return res.status(500).json({
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
    
    return res.json({
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
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/products/:id
 * @desc Get product by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === parseInt(id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du produit',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/products
 * @desc Create new product
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, category, featured } = req.body;
    
    // TODO: Implement product creation with database
    const newProduct = {
      id: mockProducts.length + 1,
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      featured: featured || false,
      createdAt: new Date()
    };
    
    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: newProduct
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création du produit',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/products/:id
 * @desc Update product
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement product update with database
    const updatedProduct = {
      ...mockProducts[productIndex],
      ...req.body,
      id: parseInt(id)
    };
    
    return res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du produit',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/products/:id
 * @desc Delete product
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement product deletion with database
    return res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du produit',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/products/:id/stock
 * @desc Update product stock
 * @access Private
 */
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation } = req.body; // operation: 'add', 'subtract', 'set'
    
    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Produit non trouvé',
          code: 'PRODUCT_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement stock update with database
    let newStock = mockProducts[productIndex].stock;
    
    switch (operation) {
      case 'add':
        newStock += parseInt(stock);
        break;
      case 'subtract':
        newStock -= parseInt(stock);
        break;
      case 'set':
        newStock = parseInt(stock);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            message: 'Opération invalide',
            code: 'INVALID_OPERATION',
            statusCode: 400
          }
        });
    }
    
    return res.json({
      success: true,
      message: 'Stock mis à jour avec succès',
      data: { id: parseInt(id), stock: newStock }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du stock',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;


