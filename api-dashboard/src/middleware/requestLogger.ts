import { Request, Response, NextFunction } from 'express';
import { createHttpLogger } from '@/utils/logger';

const httpLogger = createHttpLogger();

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  // Skip logging for health checks and static files
  if (originalUrl === '/health' || originalUrl.startsWith('/uploads/')) {
    return next();
  }

  // Log request start
  httpLogger.info('Request started', {
    method,
    url: originalUrl,
    ip,
    userAgent: userAgent.slice(0, 200), // Truncate long user agents
    timestamp: new Date().toISOString()
  });

  // Capture response details
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Determine log level based on status code
    const logLevel = statusCode >= 500 ? 'error' : 
                    statusCode >= 400 ? 'warn' : 
                    statusCode >= 300 ? 'info' : 'info';

    // Log response
    httpLogger.log(logLevel, 'Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration,
      ip,
      contentLength: res.get('Content-Length') || body?.length || 0,
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, body);
  };

  next();
};

export default requestLogger;


