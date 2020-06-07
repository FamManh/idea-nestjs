import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO } from './idea.dto';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
    ) {}

    async showAll() {
        return await this.ideaRepository.find();
    }

    async create(data: IdeaDTO) {
        try {
            const idea = await this.ideaRepository.create(data);
            await this.ideaRepository.save(idea);
            return idea;
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async read(id: string) {
        try {
            const idea = await this.ideaRepository.findOne({ where: { id } });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            return idea;
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async update(id: string, data: Partial<IdeaDTO>) {
        try {
            const idea = await this.ideaRepository.findOne({ where: { id } });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            await this.ideaRepository.update({ id }, data);
            return await this.ideaRepository.findOne({ id });
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    async destroy(id: string) {
        try {
            const idea = await this.ideaRepository.findOne({ where: { id } });
            if (!idea) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }
            await this.ideaRepository.delete({ id });
            return { deleted: true };
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
}
