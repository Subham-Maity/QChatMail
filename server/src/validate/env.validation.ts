import * as Joi from 'joi';

export const validateConfig = Joi.object({
  // SQL Database Configuration
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .error(new Error('DATABASE_URL is missing or invalid')),

  // Firebase Configuration
  FIREBASE_TYPE: Joi.string()
    .valid('service_account') // Restrict to valid value
    .required()
    .error(new Error('FIREBASE_TYPE is missing or invalid')),

  FIREBASE_PROJECT_ID: Joi.string()
    .required()
    .error(new Error('FIREBASE_PROJECT_ID is missing')),

  FIREBASE_PRIVATE_KEY_ID: Joi.string()
    .required()
    .error(new Error('FIREBASE_PRIVATE_KEY_ID is missing')),

  FIREBASE_PRIVATE_KEY: Joi.string()
    .required()
    .error(new Error('FIREBASE_PRIVATE_KEY is missing')),

  FIREBASE_CLIENT_EMAIL: Joi.string()
    .email()
    .required()
    .error(new Error('FIREBASE_CLIENT_EMAIL is missing or invalid')),

  FIREBASE_CLIENT_ID: Joi.string()
    .required()
    .error(new Error('FIREBASE_CLIENT_ID is missing')),

  FIREBASE_AUTH_URI: Joi.string()
    .uri()
    .required()
    .error(new Error('FIREBASE_AUTH_URI is missing or invalid')),

  FIREBASE_TOKEN_URI: Joi.string()
    .uri()
    .required()
    .error(new Error('FIREBASE_TOKEN_URI is missing or invalid')),

  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: Joi.string()
    .uri()
    .required()
    .error(
      new Error('FIREBASE_AUTH_PROVIDER_X509_CERT_URL is missing or invalid'),
    ),

  FIREBASE_CLIENT_X509_CERT_URL: Joi.string()
    .uri()
    .required()
    .error(new Error('FIREBASE_CLIENT_X509_CERT_URL is missing or invalid')),

  FIREBASE_UNIVERSE_DOMAIN: Joi.string()
    .required()
    .error(new Error('FIREBASE_UNIVERSE_DOMAIN is missing')),

  FIREBASE_SUPER_ADMIN_EMAILS: Joi.string()
    .email()
    .required()
    .error(new Error('FIREBASE_SUPER_ADMIN_EMAILS is missing or invalid')),
});
