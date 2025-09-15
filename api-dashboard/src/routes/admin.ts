import { Router } from 'express';
import { requireAdmin, verifyToken, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import AdminService from '../services/adminService';
import { AdminFilters } from '../types/admin';

const router = Router();

// Statistiques
router.get('/admin/stats', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        
        const stats = await AdminService.getStats(req.user!.id);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Gestion des entreprises
router.get('/admin/companies', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const filters = req.query as AdminFilters;
        const result = await AdminService.getCompanies(req.user!.id, filters);
        return res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.get('/admin/companies/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const company = await AdminService.getCompany(req.user!.id, req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Entreprise non trouvée' });
        }
        return res.json({ success: true, data: company });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'entreprise:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.post('/admin/companies', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const company = await AdminService.createCompany(req.user!.id, req.body);
        return res.status(201).json({ success: true, data: company });
    } catch (error) {
        console.error('Erreur lors de la création de l\'entreprise:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.put('/admin/companies/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const company = await AdminService.updateCompany(req.user!.id, req.params.id, req.body);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Entreprise non trouvée' });
        }
        return res.json({ success: true, data: company });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.patch('/admin/companies/:id/toggle-status', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const company = await AdminService.toggleCompanyStatus(req.user!.id, req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Entreprise non trouvée' });
        }
        return res.json({ success: true, data: company });
    } catch (error) {
        console.error('Erreur lors du changement de statut de l\'entreprise:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Gestion des utilisateurs
router.get('/admin/users', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const filters = req.query as AdminFilters;
        const result = await AdminService.getUsers(req.user!.id, filters);
        return res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.get('/admin/users/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AdminService.getUser(req.user!.id, req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        return res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.post('/admin/users', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AdminService.createUser(req.user!.id, req.body);
        return res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.put('/admin/users/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AdminService.updateUser(req.user!.id, req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        return res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.patch('/admin/users/:id/toggle-status', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AdminService.toggleUserStatus(req.user!.id, req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        return res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erreur lors du changement de statut de l\'utilisateur:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router;