import { Inject, Injectable } from '@nestjs/common';
import { MailboxItem } from './mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailbox } from 'src/mailbox/mailbox.entity';
import { CreateMailboxItemDto } from './dtos/create-mailbox-item.dto';

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

        @InjectRepository(Mailbox)
        private readonly mailboxRepository: Repository<Mailbox>
    ) {}

    async createMailboxItem(dto: CreateMailboxItemDto): Promise<MailboxItem> {
        const mailbox = await this.mailboxRepository.findOne({
            where: { id: dto.mailboxId },
        });
        
        if (!mailbox) {
            throw new Error(`Mailbox with ID ${dto.mailboxId} not found`);
        }

        const mailboxItem = this.mailboxItemRepository.create({
            title: dto.title,
            description: dto.description,
            mailbox: mailbox,
        });

        return await this.mailboxItemRepository.save(mailboxItem);
    }
}