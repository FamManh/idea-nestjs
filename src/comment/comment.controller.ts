import { Controller, Get, Param, Post, UseGuards, UsePipes, ValidationPipe, Body, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';
import { CommentDTO } from './comment.dto';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService){}

    @Get('idea/:id')
    showCommentByIdea(@Param('id') idea: string, ){
        try {
            return this.commentService.showByIdea(idea);
        } catch (error) {
            throw error;
        }
    }

    @Get('user/:id')
    showCommentByUser(@Param('id') user: string){
        try {
            return this.commentService.showByUser(user);
        } catch (error) {
            throw error;
        }
    }

    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') idea: string, @User('id') user: string, @Body() data: CommentDTO){
        try {
            return this.commentService.create(idea, user, data)
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    showComment(@Param('id') id: string){
         try {
            return this.commentService.show(id);
         } catch (error) {
             throw error;
         }
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyComment(@Param('id') id: string, @User('id') user: string){
        try{
            return this.commentService.destroy(id, user)
        }catch(error){
            throw error
        }
    }
}
