import { IsString } from 'class-validator';
import { UserEntity } from 'src/user/user.entity';
import { UserRO } from 'src/user/user.dto';

export class CommentDTO {
    @IsString()
    comment: string;
}

export class CommentRO {
    id: string;
    created: Date;
    comment: string;
    author: UserRO;
}
