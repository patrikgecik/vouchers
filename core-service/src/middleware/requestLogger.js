export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  console.log(`📥 ${req.method} ${req.path} - ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(this, args);
  };

  next();
};