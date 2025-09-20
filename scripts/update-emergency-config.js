#!/usr/bin/env node

/**
 * Script para actualizar la configuración de emergencia
 * Uso: node scripts/update-emergency-config.js --maintenance=true --delay=5 --max-requests=3
 */

const fs = require('fs');
const path = require('path');

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const config = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    config[key] = value;
  }
});

// Leer configuración actual
const configPath = path.join(__dirname, '..', 'public', 'emergency-config.json');
let currentConfig = {};

try {
  const configData = fs.readFileSync(configPath, 'utf8');
  currentConfig = JSON.parse(configData);
} catch (error) {
  console.log('Creando nueva configuración...');
  currentConfig = {
    maintenanceMode: false,
    maxRequestsPerHour: 10,
    requestDelay: 3,
    lastUpdated: new Date().toISOString()
  };
}

// Actualizar configuración
if (config.maintenance !== undefined) {
  currentConfig.maintenanceMode = config.maintenance === 'true';
}

if (config.delay !== undefined) {
  currentConfig.requestDelay = parseInt(config.delay, 10);
}

if (config['max-requests'] !== undefined) {
  currentConfig.maxRequestsPerHour = parseInt(config['max-requests'], 10);
}

currentConfig.lastUpdated = new Date().toISOString();

// Escribir configuración actualizada
try {
  fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
  console.log('✅ Configuración de emergencia actualizada:');
  console.log(JSON.stringify(currentConfig, null, 2));
} catch (error) {
  console.error('❌ Error al escribir configuración:', error);
  process.exit(1);
}
