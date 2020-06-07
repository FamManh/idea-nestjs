import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if(!request.headers.authorization){
            return false;
        }
        try{
            const user = await this.validateToken(request.headers.authorization);
            request.user = user;
            return true
        }catch(error){
            throw error;
        }
    }

    async validateToken(auth: string){
        if(auth.split(' ')[0] !== 'Bearer'){ // bearer token
            throw new HttpException('Invalid token', HttpStatus.FORBIDDEN)
        }
        const token = auth.split(' ')[1];
        return jwt.verify(token, process.env.SECRET, (error, decoded)=>{
            if(error){
                const message = 'Token error: ' + (error.message || error.name);
                throw new HttpException(message, HttpStatus.FORBIDDEN);
            }
            return decoded;
        });
    

    }
}
