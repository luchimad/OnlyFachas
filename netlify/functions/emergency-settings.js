exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Leer variables de entorno de Netlify
    const settings = {
      maintenanceMode: process.env.VITE_MAINTENANCE_MODE === 'true',
      maxRequestsPerHour: parseInt(process.env.VITE_MAX_REQUESTS_PER_HOUR || '10', 10),
      requestDelay: parseInt(process.env.VITE_REQUEST_DELAY || '3', 10),
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(settings)
    };
  } catch (error) {
    console.error('Error getting emergency settings:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        maintenanceMode: false,
        maxRequestsPerHour: 10,
        requestDelay: 3
      })
    };
  }
};
