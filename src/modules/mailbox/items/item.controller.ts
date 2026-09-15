import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';

import { MailboxItemService } from "./item.service";
import { CreateMailboxItemDto } from "./dto/create-mailbox-item.dto";
import {
    MailboxItemAccessStatus,
    MailboxItemStatus,
    MailboxItemType,
} from "./entites/mailbox-item.entity";
import { MailboxItemResponseDto } from './dto/mailbox-item.response.dto';
import { PaginatedResponse } from 'src/common/dtos/pages/pagination.response';
import { ApiBody, ApiConsumes, ApiProduces, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as XLSX from 'xlsx-js-style';
import { ImportJudicialMailboxItemsDto } from './dto/import-judicial-mailbox-items.dto';
import { CreateAdministrativeMailboxItemDto } from './dto/create-administrative-mailbox-item.dto';
import { AdministrativeMailboxItemData } from './entites/administrative-mailbox-item-data.entity';
import { MailboxSite } from '../mailboxes/enum/mailbox.enum';
import { JudicialMailboxItemInstitution } from './entites/judicial-mailbox-item-data.entity';
import { DeliverMailboxItemsDto } from './dto/deliver-mailbox-items.dto';
import { MailboxItemDeliveryService } from './mailbox-item-delivery.service';

const JUDICIAL_REPORT_ASSIGNMENT = {
    [MailboxItemAccessStatus.VISIBLE]: {
        status: 'ASIGNADA',
        detail: 'Se asignó a la casilla.',
    },
    [MailboxItemAccessStatus.UNASSIGNED]: {
        status: 'SIN ASIGNAR',
        detail: 'No se asignó porque esta casilla no tiene usuario asignado.',
    },
    [MailboxItemAccessStatus.BLOCKED_UNPAID]: {
        status: 'ASIGNADA PERO NO VISIBLE',
        detail:
            'Se asignó a la casilla, pero no estará visible porque no está al día en los pagos.',
    },
} as const;

const REPORT_STYLES = {
    title: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 },
        fill: { fgColor: { rgb: '1F4E78' } },
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    subtitle: {
        font: { italic: true, color: { rgb: '44546A' } },
        alignment: { horizontal: 'left' },
    },
    header: {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    },
    assigned: {
        font: { bold: true, color: { rgb: '006100' } },
        fill: { fgColor: { rgb: 'C6EFCE' } },
    },
    unassigned: {
        font: { bold: true, color: { rgb: '9C0006' } },
        fill: { fgColor: { rgb: 'FFC7CE' } },
    },
    blocked: {
        font: { bold: true, color: { rgb: '9C6500' } },
        fill: { fgColor: { rgb: 'FFEB9C' } },
    },
} as const;

@Controller("mailbox-items")
export class MailboxItemController {
    constructor(
        private readonly mailboxItemService: MailboxItemService,
        private readonly mailboxItemDeliveryService: MailboxItemDeliveryService,
    ) {}

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxNumber', required: false, type: Number })
    @ApiQuery({ name: 'caseNumber', required: false, type: String })
    @ApiQuery({ name: 'sede', required: false, enum: MailboxSite })
    async getAllMailboxItems(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxNumber', new ParseIntPipe({ optional: true }))
        mailboxNumber?: number,
        @Query('caseNumber') caseNumber?: string,
        @Query('sede', new ParseEnumPipe(MailboxSite, { optional: true }))
        sede?: MailboxSite,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result = await this.mailboxItemService.getAllMailboxItems(
            Math.max(page, 1),
            Math.min(Math.max(limit, 1), 100),
            mailboxNumber,
            caseNumber,
            sede,
        );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Post('judicial/import-xls')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
    @ApiConsumes('multipart/form-data')
    @ApiQuery({ name: 'sede', enum: MailboxSite, required: true })
    @ApiQuery({
        name: 'tipo',
        enum: JudicialMailboxItemInstitution,
        required: true,
    })
    @ApiQuery({ name: 'fecha', type: String, required: true })
    @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async importJudicialMailboxItems(
        @UploadedFile() file: { originalname: string; buffer: Buffer } | undefined,
        @Query('sede', new ParseEnumPipe(MailboxSite)) sede: MailboxSite,
        @Query('tipo', new ParseEnumPipe(JudicialMailboxItemInstitution))
        tipo: JudicialMailboxItemInstitution,
        @Query('fecha') fecha: string,
        @Res() response: Response,
    ): Promise<void> {
        const dto: ImportJudicialMailboxItemsDto = { sede, tipo, fecha };
        const result = await this.mailboxItemService.importJudicialMailboxItems(
            file,
            dto,
        );
        const reportDate = this.formatUploadDate(new Date());
                const worksheet = XLSX.utils.aoa_to_sheet([
                    ['REPORTE DE CARGA DE NOTIFICACIONES JUDICIALES'],
                    [`Fecha de carga: ${reportDate}`],
                    [],
                ]);
                XLSX.utils.sheet_add_json(worksheet,
                    result.report.map((row) => ({
                        Fila: row.row,
                        Casilla: row.mailboxNumber,
                        'Nro. expediente': row.caseNumber ?? '',
                        'Subida correctamente': row.uploaded ? 'Sí' : 'No',
                        'Usuario asignado': row.consumerName ?? 'Sin usuario asignado',
                        Estado: this.getJudicialAssignmentStatus(row.accessStatus),
                        Detalle: this.getJudicialAssignmentDetail(
                            row.accessStatus,
                            row.detail,
                        ),
                    })), { origin: 'A4' },
                );
                worksheet['!cols'] = [
                    { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 24 },
                    { wch: 22 }, { wch: 22 }, { wch: 65 },
                ];
                worksheet['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
                ];
                worksheet['!autofilter'] = {
                    ref: `A4:G${Math.max(result.report.length + 4, 4)}`,
                };
                worksheet['!freeze'] = { xSplit: 0, ySplit: 4 };
                this.styleReportWorksheet(
                    worksheet,
                    7,
                    'F',
                    result.report.length,
                );
                const summary = new Map<
                    string,
                    {
                        Casilla: number;
                        Estado: string;
                        'Usuario asignado': string;
                        'Cantidad de registros subidos': number;
                    }
                >();
                for (const row of result.report.filter((report) => report.uploaded)) {
                    const estado = this.getJudicialAssignmentStatus(row.accessStatus);
                    const usuario = row.consumerName ?? 'Sin usuario asignado';
                    const key = `${row.mailboxNumber}:${estado}:${usuario}`;
                    const existing = summary.get(key);

                    if (existing) {
                        existing['Cantidad de registros subidos']++;
                    } else {
                        summary.set(key, {
                            Casilla: row.mailboxNumber,
                            Estado: estado,
                            'Usuario asignado': usuario,
                            'Cantidad de registros subidos': 1,
                        });
                    }
                }
                const summaryWorksheet = XLSX.utils.aoa_to_sheet([
                    ['RESUMEN DE CASILLAS'],
                    [`Fecha de carga: ${reportDate}`],
                    [],
                ]);
                XLSX.utils.sheet_add_json(summaryWorksheet, [...summary.values()], {
                    origin: 'A4',
                    header: [
                        'Casilla',
                        'Estado',
                        'Usuario asignado',
                        'Cantidad de registros subidos',
                    ],
                });
                summaryWorksheet['!cols'] = [
                    { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 32 },
                ];
                summaryWorksheet['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
                ];
                summaryWorksheet['!autofilter'] = {
                    ref: `A4:D${Math.max(summary.size + 4, 4)}`,
                };
                summaryWorksheet['!freeze'] = { xSplit: 0, ySplit: 4 };
                this.styleReportWorksheet(summaryWorksheet, 4, 'B', summary.size);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultado importación');
                XLSX.utils.book_append_sheet(
                    workbook,
                    summaryWorksheet,
                    'Resumen por casilla',
                );
                const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                response.status(HttpStatus.CREATED).set({
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="RCN_${reportDate}.xlsx"`,
                    'Content-Length': output.length.toString(),
                });
                response.send(output);
    }

    private styleReportWorksheet(
        worksheet: XLSX.WorkSheet,
        columnCount: number,
        statusColumn: string,
        recordCount: number,
    ): void {
        worksheet.A1.s = REPORT_STYLES.title;
        worksheet.A2.s = REPORT_STYLES.subtitle;

        for (let index = 0; index < columnCount; index++) {
            const column = String.fromCharCode(65 + index);
            worksheet[`${column}4`].s = REPORT_STYLES.header;
        }

        for (let row = 5; row < recordCount + 5; row++) {
            const statusCell = worksheet[`${statusColumn}${row}`];
            if (!statusCell) continue;

            switch (statusCell.v) {
                case 'ASIGNADA':
                    statusCell.s = REPORT_STYLES.assigned;
                    break;
                case 'ASIGNADA PERO NO VISIBLE':
                    statusCell.s = REPORT_STYLES.blocked;
                    break;
                case 'SIN ASIGNAR':
                    statusCell.s = REPORT_STYLES.unassigned;
                    break;
            }
        }
    }

    private getJudicialAssignmentStatus(
        accessStatus: MailboxItemAccessStatus | null,
    ): string {
        return accessStatus
            ? JUDICIAL_REPORT_ASSIGNMENT[accessStatus].status
            : 'SIN ASIGNAR';
    }

    private formatUploadDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    private getJudicialAssignmentDetail(
        accessStatus: MailboxItemAccessStatus | null,
        fallbackDetail: string,
    ): string {
        return accessStatus
            ? JUDICIAL_REPORT_ASSIGNMENT[accessStatus].detail
            : fallbackDetail;
    }

    @Post('administrative')
    @HttpCode(HttpStatus.CREATED)
    async createAdministrativeMailboxItem(
        @Body() dto: CreateAdministrativeMailboxItemDto,
    ): Promise<{
        mailboxItem: MailboxItemResponseDto;
        administrativeData: AdministrativeMailboxItemData;
    }> {
        const result =
            await this.mailboxItemService.createAdministrativeMailboxItem(dto);
        return {
            mailboxItem: MailboxItemResponseDto.fromEntity(result.mailboxItem),
            administrativeData: result.administrativeData,
        };
    }

    @Post('deliver')
    @HttpCode(HttpStatus.CREATED)
    async deliverMailboxItems(@Body() dto: DeliverMailboxItemsDto) {
        return this.mailboxItemDeliveryService.deliverMailboxItems(dto);
    }

    @Get('collaborator/consumer/:consumerId/active-mailbox-items')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxConsumerId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: MailboxItemStatus })
    @ApiQuery({ name: 'fromDate', required: false, type: String })
    @ApiQuery({ name: 'toDate', required: false, type: String })
    async getActiveMailboxItemsForCollaborator(
        @Param('consumerId', ParseIntPipe) consumerId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxConsumerId', new ParseIntPipe({ optional: true }))
        mailboxConsumerId?: number,
        @Query('status', new ParseEnumPipe(MailboxItemStatus, { optional: true }))
        status?: MailboxItemStatus,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result =
            await this.mailboxItemService.getActiveMailboxItemsForConsumer(
                consumerId,
                Math.max(page, 1),
                Math.min(Math.max(limit, 1), 100),
                [
                    MailboxItemAccessStatus.VISIBLE,
                    MailboxItemAccessStatus.BLOCKED_UNPAID,
                ],
                mailboxConsumerId,
                status,
                fromDate,
                toDate,
            );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Get('consumer/:consumerId/active-mailbox-items')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'mailboxConsumerId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: MailboxItemStatus })
    @ApiQuery({ name: 'fromDate', required: false, type: String })
    @ApiQuery({ name: 'toDate', required: false, type: String })
    async getActiveMailboxItemsForUser(
        @Param('consumerId', ParseIntPipe) consumerId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('mailboxConsumerId', new ParseIntPipe({ optional: true }))
        mailboxConsumerId?: number,
        @Query('status', new ParseEnumPipe(MailboxItemStatus, { optional: true }))
        status?: MailboxItemStatus,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result =
            await this.mailboxItemService.getActiveMailboxItemsForConsumer(
                consumerId,
                Math.max(page, 1),
                Math.min(Math.max(limit, 1), 100),
                [MailboxItemAccessStatus.VISIBLE],
                mailboxConsumerId,
                status,
                fromDate,
                toDate,
            );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Post("mailbox/:mailboxId")
    @HttpCode(HttpStatus.CREATED)
    async createMailboxItem(
        @Param("mailboxId", ParseIntPipe) mailboxId: number,
        @Body() dto: CreateMailboxItemDto,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.createMailboxItem(
            mailboxId,
            dto,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Get("assignment/:mailboxConsumerId")
    async getItemsByMailboxConsumer(
        @Param("mailboxConsumerId", ParseIntPipe) mailboxConsumerId: number,
    ): Promise<MailboxItemResponseDto[]> {
        const items = await this.mailboxItemService.getItemsByMailboxConsumer(
            mailboxConsumerId,
        );
        return items.map(MailboxItemResponseDto.fromEntity);
    }

    @Get('consumer/:consumerId/visible')
    async getVisibleItemsByConsumer(
        @Param('consumerId', ParseIntPipe) consumerId: number,
    ): Promise<MailboxItemResponseDto[]> {
        const items = await this.mailboxItemService.getVisibleItemsByConsumer(
            consumerId,
        );
        return items.map(MailboxItemResponseDto.fromEntity);
    }

    @Get('mailbox/:mailboxId')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'accessStatus', required: false, enum: MailboxItemAccessStatus })
    @ApiQuery({ name: 'status', required: false, enum: MailboxItemStatus })
    @ApiQuery({ name: 'type', required: false, enum: MailboxItemType })
    @ApiQuery({ name: 'fromDate', required: false, type: String })
    @ApiQuery({ name: 'toDate', required: false, type: String })
    async getMailboxItemsByMailboxId(
        @Param('mailboxId', ParseIntPipe) mailboxId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query(
            'accessStatus',
            new ParseEnumPipe(MailboxItemAccessStatus, { optional: true }),
        )
        accessStatus?: MailboxItemAccessStatus,
        @Query('status', new ParseEnumPipe(MailboxItemStatus, { optional: true }))
        status?: MailboxItemStatus,
        @Query('type', new ParseEnumPipe(MailboxItemType, { optional: true }))
        type?: MailboxItemType,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ): Promise<PaginatedResponse<MailboxItemResponseDto>> {
        const result = await this.mailboxItemService.getMailboxItemsByMailboxId(
            mailboxId,
            Math.max(page, 1),
            Math.min(Math.max(limit, 1), 100),
            accessStatus,
            status,
            type,
            fromDate,
            toDate,
        );

        return new PaginatedResponse(
            result.data.map(MailboxItemResponseDto.fromEntity),
            result.pagination,
        );
    }

    @Get(":id")
    async getMailboxItemById(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.getMailboxItemById(id);
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Patch(":id/collaborator/status/:status")
    async updateMailboxItemStatusAsCollaborator(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.updateMailboxItemStatusAsCollaborator(
            id,
            status,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Patch(":id/consumer/status/:status")
    async updateMailboxItemStatusAsConsumer(
        @Param("id", ParseIntPipe) id: number,
        @Param("status", new ParseEnumPipe(MailboxItemStatus))
        status: MailboxItemStatus,
    ): Promise<MailboxItemResponseDto> {
        const item = await this.mailboxItemService.updateMailboxItemStatusAsConsumer(
            id,
            status,
        );
        return MailboxItemResponseDto.fromEntity(item);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMailboxItem(
        @Param("id", ParseIntPipe) id: number,
    ): Promise<void> {
        await this.mailboxItemService.deleteMailboxItem(id);
    }
}
