-- Datos de prueba para entidades consumidoras.
-- Genera 100 empresas, 100 personas individuales y 100 estudios juridicos.
-- Requiere que el esquema TypeORM ya haya creado las tablas.
-- Es seguro ejecutarlo mas de una vez: number_id evita duplicar consumidores.

START TRANSACTION;

CREATE TEMPORARY TABLE seed_sequence (
    n INT NOT NULL PRIMARY KEY
);

INSERT INTO seed_sequence (n)
WITH RECURSIVE sequence AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1
    FROM sequence
    WHERE n < 100
)
SELECT n FROM sequence;

-- Empresas
INSERT INTO consumer (
    consumerType, number_id, name, legal_representative,
    legal_adress, email, phone, principal_phone
)
SELECT
    'BUSINESS',
    CONCAT('201', LPAD(n, 8, '0')),
    CONCAT('Empresa Demo ', n, ' S.A.C.'),
    CONCAT('Representante Empresa ', n),
    CONCAT('Av. Empresarial ', n, ', Lima'),
    CONCAT('empresa.', n, '@seed.casillas.test'),
    CONCAT('01-5', LPAD(n, 6, '0')),
    CONCAT('9', LPAD(n, 8, '0'))
FROM seed_sequence
ON DUPLICATE KEY UPDATE number_id = VALUES(number_id);

INSERT INTO business (consumer_id, ruc, social_reason)
SELECT
    c.id,
    c.number_id,
    c.name
FROM consumer c
WHERE c.consumerType = 'BUSINESS'
  AND c.number_id BETWEEN '20100000001' AND '20100000100'
ON DUPLICATE KEY UPDATE consumer_id = VALUES(consumer_id);

-- Personas individuales
INSERT INTO consumer (
    consumerType, number_id, name, legal_representative,
    legal_adress, email, phone, principal_phone
)
SELECT
    'INDIVIDUAL',
    CONCAT('40', LPAD(n, 6, '0')),
    CONCAT('Persona Demo ', n),
    NULL,
    CONCAT('Jr. Individual ', n, ', Lima'),
    CONCAT('individual.', n, '@seed.casillas.test'),
    CONCAT('01-6', LPAD(n, 6, '0')),
    CONCAT('8', LPAD(n, 8, '0'))
FROM seed_sequence
ON DUPLICATE KEY UPDATE number_id = VALUES(number_id);

INSERT INTO individual (consumer_id, full_name, dni, cal_number)
SELECT
    c.id,
    c.name,
    c.number_id,
    CONCAT('CAL-', LPAD(RIGHT(c.number_id, 6), 6, '0'))
FROM consumer c
WHERE c.consumerType = 'INDIVIDUAL'
  AND c.number_id BETWEEN '40000001' AND '40000100'
ON DUPLICATE KEY UPDATE consumer_id = VALUES(consumer_id);

-- Estudios juridicos (juridical_st)
INSERT INTO consumer (
    consumerType, number_id, name, legal_representative,
    legal_adress, email, phone, principal_phone
)
SELECT
    'LAW_FIRM',
    CONCAT('206', LPAD(n, 8, '0')),
    CONCAT('Estudio Juridico Demo ', n),
    CONCAT('Socio Director ', n),
    CONCAT('Calle Legal ', n, ', Lima'),
    CONCAT('juridical.', n, '@seed.casillas.test'),
    CONCAT('01-7', LPAD(n, 6, '0')),
    CONCAT('7', LPAD(n, 8, '0'))
FROM seed_sequence
ON DUPLICATE KEY UPDATE number_id = VALUES(number_id);

INSERT INTO law_firm (consumer_id, ruc, firm_name)
SELECT
    c.id,
    c.number_id,
    c.name
FROM consumer c
WHERE c.consumerType = 'LAW_FIRM'
  AND c.number_id BETWEEN '20600000001' AND '20600000100'
ON DUPLICATE KEY UPDATE consumer_id = VALUES(consumer_id);

DROP TEMPORARY TABLE seed_sequence;

COMMIT;
