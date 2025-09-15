import UserRepository, { User } from '../repositories/userRepository';

export class UserService {
  // Récupérer tous les utilisateurs d'une entreprise
  static async getUsers(): Promise<User[]> {
    return UserRepository.findAll();
  }

  static async getCompanyUsers(): Promise<User[]> {
    return UserRepository.findByCompany();
  }

  // Récupérer un utilisateur par ID
  static async getUser(userId: string): Promise<User | null> {
    return UserRepository.findById(userId);
  }

  // Récupérer l'utilisateur actuel (via token)
  static async getCurrentUser(userId: string): Promise<User | null> {
    return UserRepository.findById(userId);
  }

  // Créer un utilisateur
  static async createUser(userData: Partial<User>): Promise<User> {
    return UserRepository.create(userData);
  }

  // Mettre à jour un utilisateur
  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    return UserRepository.update(userId, userData);
  }

  // Désactiver un utilisateur
  static async deactivateUser(userId: string): Promise<boolean> {
    return UserRepository.deactivate(userId);
  }

  // Activer un utilisateur
  static async activateUser(userId: string): Promise<boolean> {
    return UserRepository.activate(userId);
  }

  // Basculer le statut d'un utilisateur
  static async toggleUserStatus(userId: string): Promise<User | null> {
    return UserRepository.toggleStatus(userId);
  }

  // Vérifier si un utilisateur est admin
  static async isAdmin(userId: string): Promise<boolean> {
    return UserRepository.isAdmin(userId);
  }

  // Mettre à jour le mot de passe
  static async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    return UserRepository.updatePassword(userId, passwordHash);
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(userId: string): Promise<boolean> {
    return UserRepository.updateLastLogin(userId);
  }

  // Supprimer un utilisateur
  static async deleteUser(userId: string): Promise<boolean> {
    return UserRepository.delete(userId);
  }

  // Compter les utilisateurs actifs
  static async countActiveUsers(): Promise<number> {
    return UserRepository.countActive();
  }

  // Compter les nouveaux utilisateurs du mois
  static async countNewUsersThisMonth(): Promise<number> {
    return UserRepository.countNewThisMonth();
  }
}

export default UserService;