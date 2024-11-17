import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Query:', JSON.stringify(req.query));
    console.log('Body:', JSON.stringify(req.body));

    // Capture response using response.on('finish')
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });

    next();
};

export const notFoundHandler = (req: Request, res: Response) => {
    console.log(`[${new Date().toISOString()}] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Not Found',
        path: req.url,
        method: req.method
    });
};
