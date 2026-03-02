import 'dotenv/config';
import { validarEnvVars } from '../../lib/config/envSchema.js';
process.env.NODE_ENV = 'production';
process.env.ALLOW_CONFIG_MUTATIONS = 'true';
// Validar variables de entorno críticas al iniciar — Fase 5.7.7
validarEnvVars();
