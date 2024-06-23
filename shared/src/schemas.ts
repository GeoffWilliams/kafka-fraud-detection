// see https://github.com/sinclairzx81/typebox

import { Type, type Static } from '@sinclair/typebox'
import avro from "avro-js";

export const TransactionReceived = Type.Object({
    ts: Type.String(),
    idempotency_key: Type.String(),
    amount_money: Type.Object({
        amount: Type.Number(),
        currency: Type.String(),
    }),
    source_id: Type.String(),
    autocomplete: Type.Boolean(),
    customer_id: Type.String(),
    location_id: Type.String(),
    reference_id: Type.String(),
    note: Type.String(),
    app_fee_money: Type.Object({
        amount: Type.Number(),
        currency: Type.String(),
    })
});

export type TransactionReceived = Static<typeof TransactionReceived>


// Cheat: Create a message, go to confluent cloud schemas, view as text, copy paste :)
export const transactionChallengeAvroSchemaSource = {
    "fields": [
        {
            "default": null,
            "name": "transaction_id",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "ts",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "note",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "source_id",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "reason",
            "type": [
                "null",
                "string"
            ]
        }
    ],
    "name": "record",
    "namespace": "org.apache.flink.avro.generated",
    "type": "record"
}

export const transactionChallengeAvroSchema = avro.parse(transactionChallengeAvroSchemaSource);

// cheat
export const transactionForbidAvroSchemaSource = {
    "fields": [
        {
            "default": null,
            "name": "transaction_id",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "ts",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "note",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "source_id",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "reason",
            "type": [
                "null",
                "string"
            ]
        },
        {
            "default": null,
            "name": "country_code",
            "type": [
                "null",
                "string"
            ]
        }
    ],
    "name": "record",
    "namespace": "org.apache.flink.avro.generated",
    "type": "record"
}

export const transactionForbidAvroSchema = avro.parse(transactionForbidAvroSchemaSource);