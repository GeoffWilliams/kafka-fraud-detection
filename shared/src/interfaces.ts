import type { AvroTypescriptBufferConverter } from "avro-js";
import type { messageAvro, messageJson } from "./constants";
import type { TransactionReceived } from "./schemas";

export interface LocationMessage {
    userid: string;
    location: string;
}

export interface TransactionChallenge {
    idempotency_key: string;
    ts: string;
    note: string;
    source_id: string;
    reason: string;
}

export interface TransactionForbid {
    idempotency_key: string;
    ts: string;
    note: string;
    source_id: string;
    reason: string;
    country_code: string;
}

export interface MultiFormatMessageCallback {
    [messageJson]?: {
        callback: (json: any) => Promise<undefined>;
    },
    [messageAvro]?: {
        bufferConverter: AvroTypescriptBufferConverter;
        callback: (avro: any) => Promise<undefined>;
    }
}


export enum TransactionMessageType {
    TransactionReceived = "TransactionReceived",
    TransactionChallenge = "TransactionChallenge",
    TransactionForbid = "TransactionForbid",
}

export interface TransactionMessage {
    transactionMessageType: TransactionMessageType
    [TransactionMessageType.TransactionChallenge]?: TransactionChallenge
    [TransactionMessageType.TransactionForbid]?: TransactionForbid
    [TransactionMessageType.TransactionReceived]?: TransactionReceived
}