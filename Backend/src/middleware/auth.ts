import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

interface JwtPayload {
  id: string;
  role: string;
}

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(403).json({ error: 'Token no proporcionado' });
      return;
    }

    // ✅ CAMBIADO: Ahora usa el mismo secreto que authController
    const secret = process.env.JWT_SECRET || 'tu_secreto_de_respaldo_para_desarrollo';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado' });
      return;
    }
    res.status(500).json({ error: 'Error al verificar token' });
  }
};

export const soloAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden realizar esta acción.' });
    return;
  }
  next();
};

export const soloUsuarioOAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.params.id;
  
  if (req.userId !== userId && req.userRole !== 'admin') {
    res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    return;
  }
  next();
};