import { IsNotEmpty } from 'class-validator';
import { IdeaRO } from 'src/idea/idea.dto';
import { IdeaEntity } from 'src/idea/idea.entity';

export class UserDTO {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    password: string;
}

export class UserRO {
    id: string;
    username: string;
    token?: string;
    created: Date;
    ideas?: IdeaEntity[];
}
