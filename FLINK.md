
First turn our binary plaintext into text (CAST), then parse a specific value from the JSON string to use as a field:
```sql
-- wishing you used a schema?
SELECT * FROM (
  SELECT
    JSON_VALUE(CAST(val AS VARCHAR), '$.idempotency_key') AS idempotency_key
    , JSON_VALUE(CAST(val AS VARCHAR), '$.ts') AS ts
    , JSON_VALUE(CAST(val AS VARCHAR), '$.note') AS note
    , JSON_VALUE(CAST(val AS VARCHAR), '$.source_id') AS source_id
    , 'scam' AS reason
  FROM transactions
)
WHERE note LIKE '%voucher%';
```

Create a table (topic) to contain any matching rows (messages):

```sql
CREATE TABLE transactions_challenge (
    idempotency_key STRING
    -- dont want to deal with key parsing in client so duplicate the key field here...
    , transaction_id STRING
    , ts STRING
    , note STRING
    , source_id STRING
    , reason STRING

    -- results in an AVRO structured key
    , PRIMARY KEY (idempotency_key) NOT ENFORCED
);
```


Put it all together, make a flink job to catch "scammy" transactions:

```sql
INSERT INTO transactions_challenge
    SELECT * FROM (
        SELECT
            JSON_VALUE(CAST(val AS VARCHAR), '$.idempotency_key') AS idempotency_key
            , JSON_VALUE(CAST(val AS VARCHAR), '$.idempotency_key') AS transaction_id
            , JSON_VALUE(CAST(val AS VARCHAR), '$.ts') AS ts
            , JSON_VALUE(CAST(val AS VARCHAR), '$.note') AS note
            , JSON_VALUE(CAST(val AS VARCHAR), '$.source_id') AS source_id
            , 'scam' AS reason
        FROM transactions
    )
    WHERE note LIKE '%voucher%';
```


Banks can and do block whole countries, so lets do that too with a lookup table + join. Click the `+` button on worksheet to add a new query - the queryies in each box are the ones that will be left running. If your statement is gone, its not running! (eg if you started it running then replaced the query and run again something different):

```sql
-- copy paste and run each statement one at a time

CREATE TABLE countries_forbid (
    country_code STRING
    , country STRING
    , PRIMARY KEY (country_code) NOT ENFORCED
);

INSERT INTO countries_forbid VALUES ('RU', 'Russian Federation');
INSERT INTO countries_forbid VALUES ('CZ', 'Czechia');

```

Lets do some debugging and join the forbidden countries to the query (enrichment):

```sql
SELECT * FROM (
    SELECT
        JSON_VALUE(CAST(val AS VARCHAR), '$.idempotency_key') AS idempotency_key
        , JSON_VALUE(CAST(val AS VARCHAR), '$.ts') AS ts
        , JSON_VALUE(CAST(val AS VARCHAR), '$.note') AS note
        , JSON_VALUE(CAST(val AS VARCHAR), '$.source_id') AS source_id
        , JSON_VALUE(CAST(val AS VARCHAR), '$.location_id') AS location_id
        , 'country' AS reason
    FROM transactions
) AS my_subquery
INNER JOIN countries_forbid
ON my_subquery.location_id = countries_forbid.country_code;
```

It should only match transactions from blocked countries, when working, make a table to store forbidden transactions:

```sql
CREATE TABLE transactions_forbid (
    idempotency_key STRING
    , transaction_id STRING
    , ts STRING
    , note STRING
    , source_id STRING
    , reason STRING
    , country_code STRING
    , PRIMARY KEY (idempotency_key) NOT ENFORCED
);
```

Then combine an `INSERT` and a `SELECT` to make a Flink job. To avoid returning unwanted data from the lookup table we have to specify each field in the `SELECT`:

```sql
INSERT INTO transactions_forbid
    SELECT
        my_subquery.idempotency_key AS idempotency_key
        , my_subquery.idempotency_key AS idempotency_key
        , my_subquery.ts AS ts
        , my_subquery.note AS note
        , my_subquery.source_id AS source_id
        , my_subquery.reason as reason
        , my_subquery.location_id as location_id
    FROM (
        SELECT
            JSON_VALUE(CAST(val AS VARCHAR), '$.idempotency_key') AS idempotency_key
            , JSON_VALUE(CAST(val AS VARCHAR), '$.ts') AS ts
            , JSON_VALUE(CAST(val AS VARCHAR), '$.note') AS note
            , JSON_VALUE(CAST(val AS VARCHAR), '$.source_id') AS source_id
            , JSON_VALUE(CAST(val AS VARCHAR), '$.location_id') AS location_id
            , 'country' AS reason
        FROM transactions
    ) AS my_subquery
    INNER JOIN countries_forbid
    ON my_subquery.location_id = countries_forbid.country_code;
```