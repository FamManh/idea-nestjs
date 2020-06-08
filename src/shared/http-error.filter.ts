import { Catch, ExceptionFilter, HttpException, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter{
    catch(exeption: HttpException, host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status = exeption.getStatus? exeption.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
            code: status,
            timestamp: new Date().toLocaleDateString(),
            path: request.url,
            method: request.method,
            message:
                status !== HttpStatus.INTERNAL_SERVER_ERROR
                    ? exeption.message || null
                    : 'Internal Server Error',
        };

        if(status === HttpStatus.INTERNAL_SERVER_ERROR){
            console.log(exeption);
        }

        Logger.error(
            `${request.method} ${request.url}`,
            JSON.stringify(exeption.getResponse()),
            'ExeptionFilter',
        );

        response.status(status).json(errorResponse);
    }
}
