-- Asignaciones de prueba para las casillas de Lima Centro.
-- Conecta las 300 entidades de generate_entidades.sql a las casillas 1 al 300:
--   1-100: empresas, 101-200: personas individuales, 201-300: estudios juridicos.
-- Los cuatro escenarios se distribuyen segun el numero de casilla:
--   0: ACTIVE/PAID, 1: ACTIVE/UNPAID,
--   2: INACTIVE/PAID, 3: INACTIVE/UNPAID.
-- El script no duplica una asignacion existente para la misma casilla y consumidor.

START TRANSACTION;

INSERT INTO mailbox_consumer (
    mailbox_id,
    consumer_id,
    assignedAt,
    unassignedAt,
    statusReason,
    status
)
SELECT
    source.mailbox_id,
    source.consumer_id,
    DATE_SUB(NOW(), INTERVAL (source.mailbox_id + 30) DAY),
    CASE
        WHEN MOD(source.mailbox_id, 4) IN (2, 3)
            THEN DATE_SUB(NOW(), INTERVAL source.mailbox_id DAY)
        ELSE NULL
    END,
    CASE
        WHEN MOD(source.mailbox_id, 4) IN (0, 2) THEN 'PAID'
        ELSE 'UNPAID'
    END,
    CASE
        WHEN MOD(source.mailbox_id, 4) IN (0, 1) THEN 'ACTIVE'
        ELSE 'INACTIVE'
    END
FROM (
    SELECT m.id AS mailbox_id, c.id AS consumer_id
    FROM mailbox m
    INNER JOIN consumer c
        ON c.consumerType = 'BUSINESS'
       AND m.mail_number = CAST(RIGHT(c.number_id, 8) AS UNSIGNED)
       AND c.number_id BETWEEN '20100000001' AND '20100000100'
    WHERE m.mailboxSite = 'LIMACENTRO'
      AND m.mail_number BETWEEN 1 AND 100

    UNION ALL

    SELECT m.id AS mailbox_id, c.id AS consumer_id
    FROM mailbox m
    INNER JOIN consumer c
        ON c.consumerType = 'INDIVIDUAL'
       AND m.mail_number = CAST(RIGHT(c.number_id, 6) AS UNSIGNED) + 100
       AND c.number_id BETWEEN '40000001' AND '40000100'
    WHERE m.mailboxSite = 'LIMACENTRO'
      AND m.mail_number BETWEEN 101 AND 200

    UNION ALL

    SELECT m.id AS mailbox_id, c.id AS consumer_id
    FROM mailbox m
    INNER JOIN consumer c
        ON c.consumerType = 'LAW_FIRM'
       AND m.mail_number = CAST(RIGHT(c.number_id, 8) AS UNSIGNED) + 200
       AND c.number_id BETWEEN '20600000001' AND '20600000100'
    WHERE m.mailboxSite = 'LIMACENTRO'
      AND m.mail_number BETWEEN 201 AND 300
) source
WHERE NOT EXISTS (
    SELECT 1
    FROM mailbox_consumer existing
    WHERE existing.mailbox_id = source.mailbox_id
      AND existing.consumer_id = source.consumer_id
);

COMMIT;
