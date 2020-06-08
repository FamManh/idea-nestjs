import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRO } from "./user.dto";
import { IdeaEntity } from "src/idea/idea.entity";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created: Date;

    @Column({
        type: 'text',
        unique: true,
    })
    username: string;

    @Column('text')
    password: string;

    @OneToMany(type=> IdeaEntity, idea=>idea.author)
    ideas: IdeaEntity[];

    @ManyToMany(type=> IdeaEntity, {cascade: true})
    @JoinTable()
    bookmarks: IdeaEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    toResponseObject(showToken: boolean = false): UserRO {
        const { id, created, username, token, ideas, bookmarks } = this;
        const reponseObject: UserRO = { id, created, username };
        
        if(showToken){
            reponseObject.token = token;
        }

        if(ideas){
            reponseObject.ideas = ideas
        }

        if(bookmarks){
            reponseObject.bookmarks = bookmarks
        }
        reponseObject.ideas = ideas;
        return reponseObject;
    }

    async comparePassword(attempt: string) {
        return await bcrypt.compare(attempt, this.password);
    }

    private get token(){
        const {id, username} = this;
        return jwt.sign({id, username}, process.env.SECRET, {expiresIn: '7d'})
    }
}