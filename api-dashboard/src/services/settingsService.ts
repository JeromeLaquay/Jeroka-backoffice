import userService from './userService';
import companyService from './companyService';
export class SettingsService {
  static async getSettings(userId: string) {
    const user = await userService.getUser(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    const companyId = user?.company_id;
    if (!companyId) {
      throw new Error('Company ID non trouvé');
    }
    const company = await companyService.getCompany(companyId);
    if (!company) {
      throw new Error('Company non trouvé');
    }

    return {
      companySettings: await this.setCompanySettings(company),
      userSettings: await this.setUserSettings(user),
      systemSettings: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
  }

  static async setUserSettings(user: any) {
    //préparer les données pour le front 
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      telephone: user.telephone,
      avatar_url: user.avatar_url,
      last_login: user.last_login,
    }
  }

  static async setCompanySettings(company: any) {
    //préparer les données pour le front 
    return {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address_line1: company.address_line1,
      address_line2: company.address_line2,
      city: company.city,
      postal_code: company.postal_code,
      country: company.country,
      vat_number: company.vat_number,
      siret: company.siret,
      tax_regime: company.tax_regime,
      banking_info: company.banking_info,
      invoice_settings: company.invoice_settings,
      quote_settings: company.quote_settings,
      email_settings: company.email_settings,
      theme: company.theme,
    }
  }

  // Google OAuth settings per company (AES encrypted at rest)
  static async saveGoogleSettings(userId: string, payload: any, repo: any) {
    const masked = {
      calendarId: payload.calendarId || null,
      hasOAuth: !!(payload.oauthClientId && payload.refreshToken),
      hasServiceAccount: !!payload.serviceAccountJson
    }
    await repo.upsert(  userId, 'google', payload);
    return masked;
  }

  static async getGoogleSettings(companyId: string, repo: any) {
    const cred = await repo.getByCompanyAndPlatform(companyId, 'google');
    if (!cred) return { hasOAuth: false, hasServiceAccount: false };
    const c = cred.credentials || {};
    return {
      calendarId: c.calendarId || null,
      hasOAuth: !!(c.oauthClientId && c.refreshToken),
      hasServiceAccount: !!c.serviceAccountJson
    };
  }
}
export default SettingsService;