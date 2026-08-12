import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class MailboxAssignmentHistory1786500000000
    implements MigrationInterface
{
    name = 'MailboxAssignmentHistory1786500000000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE mailbox_consumer (
                id INT NOT NULL AUTO_INCREMENT,
                mailbox_id INT NOT NULL,
                consumer_id INT NOT NULL,
                assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                unassignedAt DATETIME NULL,
                status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX IDX_mailbox_consumer_mailbox_status (mailbox_id, status),
                INDEX IDX_mailbox_consumer_consumer (consumer_id),
                PRIMARY KEY (id),
                CONSTRAINT FK_mailbox_consumer_mailbox
                    FOREIGN KEY (mailbox_id) REFERENCES mailbox(id)
                    ON DELETE RESTRICT,
                CONSTRAINT FK_mailbox_consumer_consumer
                    FOREIGN KEY (consumer_id) REFERENCES consumer(id)
                    ON DELETE RESTRICT,
                CONSTRAINT CHK_mailbox_consumer_dates
                    CHECK (unassignedAt IS NULL OR unassignedAt >= assignedAt)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            INSERT INTO mailbox_consumer
                (mailbox_id, consumer_id, assignedAt, status, createdAt, updatedAt)
            SELECT id, consumer_id, createdAt, 'ACTIVE', createdAt, updatedAt
            FROM mailbox
            WHERE consumer_id IS NOT NULL
        `);

        await queryRunner.query(
            'ALTER TABLE mailbox_item ADD mailbox_consumer_id INT NULL',
        );
        await queryRunner.query(`
            UPDATE mailbox_item item
            INNER JOIN mailbox_consumer assignment
                ON assignment.mailbox_id = item.mailbox_id
               AND assignment.consumer_id = item.consumer_id
            SET item.mailbox_consumer_id = assignment.id
        `);
        await queryRunner.query(`
            UPDATE mailbox_item item
            INNER JOIN mailbox_consumer assignment
                ON assignment.mailbox_id = item.mailbox_id
               AND assignment.status = 'ACTIVE'
            SET item.mailbox_consumer_id = assignment.id
            WHERE item.mailbox_consumer_id IS NULL
        `);
        await queryRunner.query(
            'ALTER TABLE mailbox_item MODIFY mailbox_consumer_id INT NOT NULL',
        );
        await queryRunner.query(
            'CREATE INDEX IDX_mailbox_item_mailbox_consumer ON mailbox_item(mailbox_consumer_id)',
        );
        await queryRunner.query(`
            ALTER TABLE mailbox_item
            ADD CONSTRAINT FK_mailbox_item_mailbox_consumer
            FOREIGN KEY (mailbox_consumer_id) REFERENCES mailbox_consumer(id)
            ON DELETE RESTRICT
        `);

        await queryRunner.query(`
            CREATE TABLE mailbox_procurator (
                id INT NOT NULL AUTO_INCREMENT,
                mailbox_consumer_id INT NOT NULL,
                procurator_id INT NOT NULL,
                assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                unassignedAt DATETIME NULL,
                status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
                createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                    ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX IDX_mailbox_procurator_assignment_status
                    (mailbox_consumer_id, status),
                INDEX IDX_mailbox_procurator_procurator (procurator_id),
                PRIMARY KEY (id),
                CONSTRAINT FK_mailbox_procurator_assignment
                    FOREIGN KEY (mailbox_consumer_id) REFERENCES mailbox_consumer(id)
                    ON DELETE RESTRICT,
                CONSTRAINT FK_mailbox_procurator_procurator
                    FOREIGN KEY (procurator_id) REFERENCES procurators(id)
                    ON DELETE RESTRICT,
                CONSTRAINT CHK_mailbox_procurator_dates
                    CHECK (unassignedAt IS NULL OR unassignedAt >= assignedAt)
            ) ENGINE=InnoDB
        `);

        await this.dropColumnWithForeignKeys(queryRunner, 'mailbox_item', 'mailbox_id');
        await this.dropColumnWithForeignKeys(queryRunner, 'mailbox_item', 'consumer_id');
        await this.dropColumnWithForeignKeys(queryRunner, 'mailbox', 'consumer_id');
        await this.dropColumnWithForeignKeys(queryRunner, 'procurators', 'consumerId');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE mailbox ADD consumer_id INT NULL');
        await queryRunner.query(`
            UPDATE mailbox mailbox
            INNER JOIN mailbox_consumer assignment
                ON assignment.mailbox_id = mailbox.id
               AND assignment.status = 'ACTIVE'
            SET mailbox.consumer_id = assignment.consumer_id
        `);
        await queryRunner.query('ALTER TABLE mailbox_item ADD mailbox_id INT NULL');
        await queryRunner.query('ALTER TABLE mailbox_item ADD consumer_id INT NULL');
        await queryRunner.query(`
            UPDATE mailbox_item item
            INNER JOIN mailbox_consumer assignment
                ON assignment.id = item.mailbox_consumer_id
            SET item.mailbox_id = assignment.mailbox_id,
                item.consumer_id = assignment.consumer_id
        `);
        await this.dropColumnWithForeignKeys(
            queryRunner,
            'mailbox_item',
            'mailbox_consumer_id',
        );
        await queryRunner.query('DROP TABLE mailbox_procurator');
        await queryRunner.query('DROP TABLE mailbox_consumer');
    }

    private async dropColumnWithForeignKeys(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<void> {
        const table = await queryRunner.getTable(tableName);
        if (!table?.findColumnByName(columnName)) return;

        const foreignKeys = table.foreignKeys.filter((foreignKey) =>
            foreignKey.columnNames.includes(columnName),
        );
        for (const foreignKey of foreignKeys) {
            await queryRunner.dropForeignKey(
                table,
                foreignKey as TableForeignKey,
            );
        }
        await queryRunner.dropColumn(table, columnName);
    }
}
