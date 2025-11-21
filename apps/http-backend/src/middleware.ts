import { NextFunction,Request,Response } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import JWT_SECRET from "@repo/config/secrets";
export function middleware(req: Request & { userId?: string }, res:Response, next:NextFunction) {
    
    const token = req.headers['authorization'] ?? ""
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded=jwt.verify(token,JWT_SECRET) as JwtPayload;
    if(decoded){
        req.userId = decoded.userId;
        next();
    }else{
        return res.status(401).json({ message: 'Invalid token' });
    }
    
}