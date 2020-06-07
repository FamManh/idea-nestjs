import { Catch, ExceptionFilter, HttpException, ArgumentsHost, Logger } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter{
    catch(exeption: HttpException, host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const status = exeption.getStatus();
        const errorResponse = {
            code: status,
            timestamp: new Date().toLocaleDateString(),
            path: request.url,
            method: request.method,
            message: exeption.message || null
        }

        Logger.error(
            `${request.method} ${request.url}`,
            JSON.stringify(exeption.getResponse()),
            'ExeptionFilter',
        );

        response.status(404).json(errorResponse);
    }
}
