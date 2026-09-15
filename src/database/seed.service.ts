import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

const SEED_FILES = [
    'generate_entidades.sql',
    'generate_mailboxes.sql',
    'generate_mailbox_consumers_lima_centro.sql',
] as const;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(private readonly dataSource: DataSource) {}

    async onApplicationBootstrap(): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            for (const fileName of SEED_FILES) {
                await this.executeSeed(queryRunner, fileName);
            }
        } finally {
            await queryRunner.release();
        }
    }

    private async executeSeed(
        queryRunner: ReturnType<DataSource['createQueryRunner']>,
        fileName: (typeof SEED_FILES)[number],
    ): Promise<void> {
        const filePath = join(process.cwd(), 'database', 'seeds', fileName);
        const statements = readFileSync(filePath, 'utf8')
            .replace(/^\s*--.*$/gm, '')
            .split(';')
            .map((statement) => statement.trim())
            .filter(Boolean);

        for (const statement of statements) {
            await queryRunner.query(statement);
        }

        this.logger.log(`Seed ejecutado: ${fileName}`);
    }
}
