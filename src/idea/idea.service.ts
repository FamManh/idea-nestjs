import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from 'src/user/user.entity';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    private toResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any = { ...idea };
        if (idea.author) {
            responseObject.author = idea.author.toResponseObject();
        }
        if (responseObject.upvotes) {
            responseObject.upvotes = idea.upvotes.length;
        }
        if (responseObject.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
        }
        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string) {
        if (idea.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.BAD_GATEWAY);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = Votes.UP ? Votes.DOWN : Votes.DOWN;
        if (
            idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
            idea[vote].filter(voter => voter.id === user.id).length > 0
        ) {
            idea[opposite] = idea[opposite].filter(
                voter => voter.id !== user.id,
            );
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if (
            idea[vote].filter(voter => voter.id === user.id).length < 1
        ) {
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new HttpException(
                'Unable to cast vote',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.toResponseObject(idea);
    }

    async showAll(): Promise<IdeaRO[]> {
        const ideas = await this.ideaRepository.find({
            relations: ['author', 'upvotes', 'downvotes'],
        });
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            const idea = await this.ideaRepository.create({
                ...data,
                author: user,
            });
            await this.ideaRepository.save(idea);
            return this.toResponseObject(idea);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async read(id: string): Promise<IdeaRO> {
        try {
            const idea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['author', 'upvotes', 'downvotes'],
            });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            return this.toResponseObject(idea);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async update(
        id: string,
        userId: string,
        data: Partial<IdeaDTO>,
    ): Promise<IdeaRO> {
        try {
            const idea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['author'],
            });

            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            // check ownership
            this.ensureOwnership(idea, userId);
            await this.ideaRepository.update({ id }, data);
            const newIdea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['author'],
            });
            return this.toResponseObject(newIdea);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async destroy(id: string, userId: string) {
        try {
            const idea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['author'],
            });

            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            // check ownership
            this.ensureOwnership(idea, userId);
            await this.ideaRepository.delete({ id });
            return this.toResponseObject(idea);
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async upvote(id: string, userId: string) {
        try {
            const idea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['upvotes', 'downvotes'],
            });
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            return this.vote(idea, user, Votes.UP);
        } catch (error) {
            throw error;
        }
    }

    async downvote(id: string, userId: string) {
        try {
            const idea = await this.ideaRepository.findOne({
                where: { id },
                relations: ['upvotes', 'downvotes'],
            });
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }

            return this.vote(idea, user, Votes.DOWN);
        } catch (error) {
            throw error;
        }
    }

    async bookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['bookmarks'],
        });
        if (!idea || !user) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        if (
            user.bookmarks.filter(bookmark => bookmark.id === idea.id).length <
            1
        ) {
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException(
                'Idea already bookmarked',
                HttpStatus.BAD_REQUEST,
            );
        }
        return user.toResponseObject();
    }

    async unbookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['bookmarks'],
        });
        if (!idea || !user) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        console.log(user);
        if (
            user.bookmarks.filter(bookmark => bookmark.id === idea.id).length >
            0
        ) {
            user.bookmarks = user.bookmarks.filter(
                bookmark => bookmark.id !== idea.id,
            );
            await this.userRepository.save(user);
        } else {
            throw new HttpException(
                'Idea is not bookmarked',
                HttpStatus.BAD_REQUEST,
            );
        }
        return user.toResponseObject();
    }
}
