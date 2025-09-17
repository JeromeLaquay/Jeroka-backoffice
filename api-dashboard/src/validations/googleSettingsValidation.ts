import Joi from 'joi';

export const saveGoogleSettingsSchema = Joi.object({
  serviceAccountJson: Joi.string().allow('', null),
  oauthClientId: Joi.string().allow('', null),
  oauthClientSecret: Joi.string().allow('', null),
  refreshToken: Joi.string().allow('', null),
  calendarId: Joi.string().allow('', null)
}).or('serviceAccountJson', 'oauthClientId');

// Validation pour les paramètres OAuth requis
export const oauthConnectSchema = Joi.object({
  oauthClientId: Joi.string().required().messages({
    'string.empty': 'OAuth Client ID est requis pour la connexion',
    'any.required': 'OAuth Client ID est requis pour la connexion'
  }),
  oauthClientSecret: Joi.string().required().messages({
    'string.empty': 'OAuth Client Secret est requis pour la connexion',
    'any.required': 'OAuth Client Secret est requis pour la connexion'
  })
});

export type SaveGoogleSettingsPayload = {
  serviceAccountJson?: string | null;
  oauthClientId?: string | null;
  oauthClientSecret?: string | null;
  refreshToken?: string | null;
  calendarId?: string | null;
};


