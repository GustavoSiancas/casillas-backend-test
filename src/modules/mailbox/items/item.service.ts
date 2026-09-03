import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    MailboxItem,
    MailboxItemAccessStatus,
    MailboxItemStatus,
    MailboxItemType,
} from './entites/mailbox-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mailbox } from 'src/modules/mailbox/mailboxes/mailbox.entity';
import { MailboxSite } from 'src/modules/mailbox/mailboxes/enum/mailbox.enum';
import { CreateMailboxItemDto } from './dto/create-mailbox-item.dto';
import { MailboxConsumer } from 'src/modules/mailbox/assignments/entities/mailbox-consumer.entity';
import { MailboxConsumerStatus } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status.enum';
import { MailboxConsumerStatusReason } from 'src/modules/mailbox/assignments/enum/mailbox-consumer-status-reason.enum';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { PaginationMetaResponse } from 'src/common/dtos/pages/pagination.meta.response';
import * as XLSX from 'xlsx';
import { ImportJudicialMailboxItemsDto } from './dto/import-judicial-mailbox-items.dto';
import { JudicialMailboxItemData } from './entites/judicial-mailbox-item-data.entity';
import { AdministrativeMailboxItemData } from './entites/administrative-mailbox-item-data.entity';
import { CreateAdministrativeMailboxItemDto } from './dto/create-administrative-mailbox-item.dto';

const JUDICIAL_DATA_FIELDS = [
    'direccion', 'x_desc_ubigeo', 'observa', 'orden', 'codcli', 'u_nomb_abo',
    'u_nro_cole', 'u_nomb_lit', 'u_le_litg', 'u_nro_expe', 'u_fecha',
    's_nro_expe', 's_dependen', 's_sede', 's_demandan', 's_demandad',
    's_materia', 's_cuaderno', 's_resoluci', 's_notifica', 'fecha', 'hora',
    'nro_cuenta', 'descar', 'ingreso', 'nuevo', 'cod_mensa', 'fecha_sal',
    'f_descargo', 'nueva_dir', 'telefono', 'fecha_des', 'hora_des', 'hora_entre',
    'fecha_entr', 'clasifica', 'fecha_cla', 'hora_cla', 'chequeo', 'ind_estado',
    'cod_emp_descargo',
] as const;

type JudicialSpreadsheetRow = Record<string, unknown>;

export interface JudicialImportResult {
    imported: number;
    mailboxItemIds: number[];
    skipped: Array<{
        row: number;
        mailboxNumber: number;
        reason: string;
    }>;
}

@Injectable()
export class MailboxItemService {
    constructor(
        @InjectRepository(MailboxItem)
        private readonly mailboxItemRepository: Repository<MailboxItem>,

        private readonly dataSource: DataSource,
    ) {}

    async getAllMailboxItems(
        page: number,
        limit: number,
        mailboxNumber?: number,
        caseNumber?: string,
        mailboxSite?: MailboxSite,
    ): Promise<PaginatedResponse<MailboxItem>> {
        const query = this.mailboxItemRepository
            .createQueryBuilder('item')
            .innerJoinAndSelect('item.mailbox', 'mailbox')
            .leftJoinAndSelect('item.mailboxConsumer', 'mailboxConsumer')
            .leftJoinAndSelect('mailboxConsumer.consumer', 'consumer');

        if (mailboxNumber !== undefined) {
            query.andWhere('mailbox.mail_number = :mailboxNumber', {
                mailboxNumber,
            });
        }
        if (caseNumber?.trim()) {
            query.andWhere('item.caseNumber LIKE :caseNumber', {
                caseNumber: `%${caseNumber.trim()}%`,
            });
        }
        if (mailboxSite !== undefined) {
            query.andWhere('mailbox.mailboxSite = :mailboxSite', {
                mailboxSite,
            });
        }

        const [data, total] = await query
            .orderBy('item.documentDate', 'DESC')
            .addOrderBy('item.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return new PaginatedResponse(
            data,
            new PaginationMetaResponse(page, limit, total),
        );
    }

    async importJudicialMailboxItems(
        file: { originalname: string; buffer: Buffer } | undefined,
        dto: ImportJudicialMailboxItemsDto,
    ): Promise<JudicialImportResult> {
        if (!file) {
            throw new BadRequestException('El archivo .xls es obligatorio');
        }
        if (!file.originalname.toLowerCase().endsWith('.xls')) {
            throw new BadRequestException('Solo se permiten archivos .xls');
        }

        let rows: JudicialSpreadsheetRow[];
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const firstSheet = workbook.SheetNames[0];
            if (!firstSheet) throw new Error('Workbook without sheets');
            rows = XLSX.utils.sheet_to_json<JudicialSpreadsheetRow>(
                workbook.Sheets[firstSheet],
                { defval: '', raw: false },
            );
        } catch {
            throw new BadRequestException('No se pudo leer el archivo .xls');
        }
        if (rows.length === 0) {
            throw new BadRequestException('El archivo .xls no contiene registros');
        }

        return this.dataSource.transaction(async (manager) => {
            const mailboxItemIds: number[] = [];
            const skipped: JudicialImportResult['skipped'] = [];

            for (const [index, rawRow] of rows.entries()) {
                const row = this.normalizeSpreadsheetRow(rawRow);
                const rowNumber = index + 2;
                const mailboxNumber = Number(row.s_casilla);
                const name = row.nombre;
                const caseNumber = row.s_nro_expe;

                if (!Number.isInteger(mailboxNumber) || mailboxNumber <= 0) {
                    throw new BadRequestException(`Fila ${rowNumber}: s_casilla no es válida`);
                }
                if (!name) {
                    throw new BadRequestException(`Fila ${rowNumber}: nombre es obligatorio`);
                }
                if (!caseNumber) {
                    throw new BadRequestException(`Fila ${rowNumber}: s_nro_expe es obligatorio`);
                }

                const mailbox = await manager.findOne(Mailbox, {
                    where: { mail_number: mailboxNumber, mailboxSite: dto.sede },
                });
                if (!mailbox) {
                    skipped.push({
                        row: rowNumber,
                        mailboxNumber,
                        reason: `No existe la casilla ${mailboxNumber} en ${dto.sede}`,
                    });
                    continue;
                }

                const assignment = await manager.findOne(MailboxConsumer, {
                    where: {
                        mailbox: { id: mailbox.id },
                        status: MailboxConsumerStatus.ACTIVE,
                    },
                    relations: { consumer: true },
                });
                const accessStatus = !assignment
                    ? MailboxItemAccessStatus.UNASSIGNED
                    : assignment.statusReason === MailboxConsumerStatusReason.PAID
                      ? MailboxItemAccessStatus.VISIBLE
                      : MailboxItemAccessStatus.BLOCKED_UNPAID;

                const mailboxItem = await manager.save(
                    manager.create(MailboxItem, {
                        name,
                        caseNumber,
                        documentDate: this.parseSpreadsheetDate(row.fecha, rowNumber),
                        type: MailboxItemType.JUDICIAL,
                        description: '',
                        mailbox,
                        mailboxConsumer: assignment ?? null,
                        status: MailboxItemStatus.DRAFT,
                        accessStatus,
                        receivedAt: new Date(),
                    }),
                );

                const judicialData = Object.fromEntries(
                    JUDICIAL_DATA_FIELDS.map((field) => [field, row[field] || null]),
                );
                await manager.save(
                    manager.create(JudicialMailboxItemData, {
                        ...judicialData,
                        institution: dto.tipo,
                        mailboxItem,
                    }),
                );
                mailboxItemIds.push(mailboxItem.id);
            }

            return {
                imported: mailboxItemIds.length,
                mailboxItemIds,
                skipped,
            };
        });
    }

    async createAdministrativeMailboxItem(
        dto: CreateAdministrativeMailboxItemDto,
    ): Promise<{
        mailboxItem: MailboxItem;
        administrativeData: AdministrativeMailboxItemData;
    }> {
        return this.dataSource.transaction(async (manager) => {
            const assignment = await manager.findOne(MailboxConsumer, {
                where: { id: dto.mailboxConsumerId },
                relations: { mailbox: true, consumer: true },
            });
            if (!assignment) {
                throw new NotFoundException(
                    `Mailbox consumer with ID ${dto.mailboxConsumerId} not found`,
                );
            }
            if (assignment.status !== MailboxConsumerStatus.ACTIVE) {
                throw new ConflictException(
                    'La relación mailbox-consumer no está activa',
                );
            }

            const accessStatus =
                assignment.statusReason === MailboxConsumerStatusReason.PAID
                    ? MailboxItemAccessStatus.VISIBLE
                    : MailboxItemAccessStatus.BLOCKED_UNPAID;

            const mailboxItem = await manager.save(
                manager.create(MailboxItem, {
                    name: dto.name,
                    caseNumber: dto.caseNumber,
                    documentDate: new Date(dto.documentDate),
                    type: MailboxItemType.ADMINISTRATIVE,
                    description: dto.descripcion ?? '',
                    mailbox: assignment.mailbox,
                    mailboxConsumer: assignment,
                    status: MailboxItemStatus.PENDING,
                    accessStatus,
                    receivedAt: new Date(),
                }),
            );

            const administrativeData = await manager.save(
                manager.create(AdministrativeMailboxItemData, {
                    mailboxItem,
                    juzgado: dto.juzgado ?? null,
                    materia: dto.materia ?? null,
                    resolucion: dto.resolucion ?? null,
                    demandante: dto.demandante ?? null,
                    descripcion: dto.descripcion ?? null,
                    tipo: dto.tipo ?? null,
                }),
            );

            return { mailboxItem, administrativeData };
        });
    }

    async getActiveMailboxItemsForConsumer(
        consumerId: number,
        page: number,
        limit: number,
        accessStatuses: MailboxItemAccessStatus[],
        mailboxConsumerId?: number,
        status?: MailboxItemStatus,
        fromDate?: string,
        toDate?: string,
    ): Promise<PaginatedResponse<MailboxItem>> {
        const from = this.parseFilterDate(fromDate, 'fromDate', false);
        const to = this.parseFilterDate(toDate, 'toDate', true);
        if (from && to && from > to) {
            throw new BadRequestException(
                'fromDate no puede ser posterior a toDate',
            );
        }

        const query = this.mailboxItemRepository
            .createQueryBuilder('item')
            .innerJoinAndSelect('item.mailbox', 'mailbox')
            .innerJoin(
                'mailbox.mailboxConsumers',
                'activeMailboxConsumer',
                'activeMailboxConsumer.status = :assignmentStatus',
                { assignmentStatus: MailboxConsumerStatus.ACTIVE },
            )
            .innerJoin('activeMailboxConsumer.consumer', 'consumer')
            .leftJoinAndSelect('item.mailboxConsumer', 'itemMailboxConsumer')
            .leftJoinAndSelect('itemMailboxConsumer.consumer', 'itemConsumer')
            .where('consumer.id = :consumerId', { consumerId })
            .andWhere('activeMailboxConsumer.status = :assignmentStatus', {
                assignmentStatus: MailboxConsumerStatus.ACTIVE,
            })
            .andWhere('item.accessStatus IN (:...accessStatuses)', {
                accessStatuses,
            });

        if (mailboxConsumerId !== undefined) {
            query.andWhere('activeMailboxConsumer.id = :mailboxConsumerId', {
                mailboxConsumerId,
            });
        }
        if (status !== undefined) {
            query.andWhere('item.status = :status', { status });
        }
        if (from) {
            query.andWhere('item.receivedAt >= :fromDate', { fromDate: from });
        }
        if (to) {
            query.andWhere('item.receivedAt <= :toDate', { toDate: to });
        }

        const [data, total] = await query
            .orderBy('item.receivedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return new PaginatedResponse(
            data,
            new PaginationMetaResponse(page, limit, total),
        );
    }

    async createMailboxItem(
        mailboxId: number,
        dto: CreateMailboxItemDto,
    ): Promise<MailboxItem> {
        return this.dataSource.transaction(async (manager) => {
            const mailbox = await manager.findOne(Mailbox, {
                where: { id: mailboxId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!mailbox) {
                throw new NotFoundException(`Mailbox with ID ${mailboxId} not found`);
            }

            const assignment = await manager.findOne(MailboxConsumer, {
                where: {
                    mailbox: { id: mailboxId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
                relations: { consumer: true },
            });

            const accessStatus = !assignment
                ? MailboxItemAccessStatus.UNASSIGNED
                : assignment.statusReason === MailboxConsumerStatusReason.PAID
                  ? MailboxItemAccessStatus.VISIBLE
                  : MailboxItemAccessStatus.BLOCKED_UNPAID;

            return manager.save(
                manager.create(MailboxItem, {
                    name: dto.name,
                    caseNumber: dto.caseNumber,
                    documentDate: new Date(dto.documentDate),
                    type: dto.type,
                    description: dto.description,
                    mailbox,
                    mailboxConsumer: assignment ?? null,
                    status: MailboxItemStatus.DRAFT,
                    accessStatus,
                    receivedAt: new Date(),
                }),
            );
        });
    }

    async getMailboxItemById(id: number): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        return mailboxItem;
    }

    async getItemsByMailboxConsumer(
        mailboxConsumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository.find({
            where: { mailboxConsumer: { id: mailboxConsumerId } },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
            order: { receivedAt: 'DESC' },
        });
    }

    async getVisibleItemsByConsumer(
        consumerId: number,
    ): Promise<MailboxItem[]> {
        return this.mailboxItemRepository.find({
            where: {
                accessStatus: MailboxItemAccessStatus.VISIBLE,
                mailboxConsumer: {
                    consumer: { id: consumerId },
                    status: MailboxConsumerStatus.ACTIVE,
                },
            },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
            order: { receivedAt: 'DESC' },
        });
    }

    async updateMailboxItemStatusAsCollaborator(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (mailboxItem.status === MailboxItemStatus.DRAFT && nextStatus === MailboxItemStatus.PENDING) {
            if (mailboxItem.accessStatus !== MailboxItemAccessStatus.VISIBLE) {
                throw new ConflictException(
                    'El item no está habilitado para mostrarse al consumidor',
                );
            }
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.PENDING && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else if (mailboxItem.status === MailboxItemStatus.REQUESTED && nextStatus === MailboxItemStatus.DELIVERED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new ConflictException(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async updateMailboxItemStatusAsConsumer(id: number, nextStatus: MailboxItemStatus): Promise<MailboxItem> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id },
            relations: {
                mailbox: true,
                mailboxConsumer: { consumer: true },
            },
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        const previousStatus = mailboxItem.status;

        if (
            mailboxItem.accessStatus !== MailboxItemAccessStatus.VISIBLE ||
            mailboxItem.mailboxConsumer?.status !==
                MailboxConsumerStatus.ACTIVE
        ) {
            throw new ConflictException(
                'El item no está disponible para el consumidor',
            );
        }

        if (mailboxItem.status === MailboxItemStatus.PENDING && nextStatus === MailboxItemStatus.REQUESTED) {
            mailboxItem.status = nextStatus;
        } else {
            throw new ConflictException(`Invalid status transition from ${previousStatus} to ${nextStatus}`);
        }

        return await this.mailboxItemRepository.save(mailboxItem);
    }

    async deleteMailboxItem(id: number): Promise<void> {
        const mailboxItem = await this.mailboxItemRepository.findOne({
            where: { id }
        });

        if (!mailboxItem) {
            throw new NotFoundException(`Mailbox item with ID ${id} not found`);
        }

        await this.mailboxItemRepository.softRemove(mailboxItem);
    }

    private normalizeSpreadsheetRow(
        rawRow: JudicialSpreadsheetRow,
    ): Record<string, string> {
        return Object.fromEntries(
            Object.entries(rawRow).map(([key, value]) => [
                key.trim().toLowerCase(),
                value === null || value === undefined ? '' : String(value).trim(),
            ]),
        );
    }

    private parseSpreadsheetDate(value: string, rowNumber: number): Date {
        const match = value.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
        );
        if (match) {
            const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
            const date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute),
                Number(second),
            );
            if (
                date.getFullYear() === Number(year) &&
                date.getMonth() === Number(month) - 1 &&
                date.getDate() === Number(day)
            ) {
                return date;
            }
        }

        const date = new Date(value);
        if (value && !Number.isNaN(date.getTime())) return date;
        throw new BadRequestException(`Fila ${rowNumber}: fecha no es válida`);
    }

    private parseFilterDate(
        value: string | undefined,
        field: string,
        endOfDay: boolean,
    ): Date | undefined {
        if (!value) return undefined;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${field} debe ser una fecha válida`);
        }
        if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            date.setUTCHours(23, 59, 59, 999);
        }
        return date;
    }
}
