import { messageAvro, messageJson, transactionsTopic } from "shared/src/constants";
import { transactionChallengeAvroSchema, transactionForbidAvroSchema, type TransactionReceived } from "shared/src/schemas";
import { consume } from "shared/src/kafka";
import { ServerWebSocket } from "bun"
import { ElysiaWS } from "elysia/dist/ws";
import Log4js from 'log4js';
import { MultiFormatMessageCallback, TransactionChallenge, TransactionForbid, TransactionMessage, TransactionMessageType } from "shared/src/interfaces";

const logger = Log4js.getLogger();
logger.level = "debug";

const transactionMessages: Array<TransactionMessage> = [];
const transactionWebSockets: Array<ElysiaWS<ServerWebSocket<any>>> = [];

export const openTransactionWs = async (ws: ElysiaWS<ServerWebSocket<any>>) => {
    transactionWebSockets.push(ws);
    logger.info(`sending ${transactionMessages.length} known TransactionMessage instances to client`);
    for (const transactionMessage of transactionMessages) {
        await ws.send(JSON.stringify(transactionMessage));
    }
};

export const closeTransactionWs = (ws: ElysiaWS<ServerWebSocket<any>>) => {
    const i = transactionWebSockets.indexOf(ws);
    logger.debug(`remove registered websocket at index: ${i}`);
    transactionWebSockets.splice(i, 1);
}

const sendTransactionMessageToConnectedWebSockets = async (transactionMessage: TransactionMessage) => {
    const jsonString = JSON.stringify(transactionMessage);
    let sent = 0;
    for (const ws of transactionWebSockets) {
        if (ws.raw.readyState === WebSocket.OPEN) {
            logger.info(`sendto ${typeof (ws)}`);
            await ws.send(jsonString);
            sent += 1;
        } else {
            logger.warn("skip websocket not in OPEN state");
        }
    }

    if (sent > 0) {
        logger.log(`send to ${sent} clients: ${jsonString}`);
    }
}

// type TransactionMessage because I decided thats what I want to receive - really its just a JSON object...
const transactionReceived = async (transactionReceived: TransactionReceived): Promise<undefined> => {
    const transactionMessage = {
        transactionMessageType: TransactionMessageType.TransactionReceived,
        [TransactionMessageType.TransactionReceived]: transactionReceived
    };
    await sendTransactionMessageToConnectedWebSockets(transactionMessage);
    transactionMessages.push(transactionMessage);
    logger.info(
        `TransactionMessage for ${TransactionMessageType.TransactionReceived} fully sent: ${transactionReceived.idempotency_key}`
    );
}

// TransactionChallenge was written by hand as an interface and has the fields that should be
// in the parsed AVRO... we would automate this step in a real system
const transactionChallenge = async (transactionChallenge: TransactionChallenge): Promise<undefined> => {
    logger.info("transaction challenge received");

    // fixme - there is some AVRO validation function in the library somewhere
    if (transactionChallenge.idempotency_key) {
        logger.error("Skipping malformed AVRO message for transaction challenge");
        return
    }
    const transactionMessage = {
        transactionMessageType: TransactionMessageType.TransactionChallenge,
        [TransactionMessageType.TransactionChallenge]: transactionChallenge
    };
    await sendTransactionMessageToConnectedWebSockets(transactionMessage);
    transactionMessages.push(transactionMessage);
    logger.info(
        `TransactionMessage for ${TransactionMessageType.TransactionChallenge} fully sent: ${transactionChallenge.idempotency_key}`
    );
}

const transactionForbid = async (transactionForbid: TransactionForbid): Promise<undefined> => {
    logger.info("transaction forbid received");

    // fixme - there is some AVRO validation function in the library somewhere
    if (transactionForbid.idempotency_key) {
        logger.error("Skipping malformed AVRO message for transaction challenge");
        return
    }

    const transactionMessage = {
        transactionMessageType: TransactionMessageType.TransactionForbid,
        [TransactionMessageType.TransactionForbid]: transactionForbid
    };
    await sendTransactionMessageToConnectedWebSockets(transactionMessage);
    transactionMessages.push(transactionMessage);
    logger.info(
        `TransactionMessage for ${TransactionMessageType.TransactionForbid} fully sent: ${transactionForbid.idempotency_key}`
    );

}


export const watchTransactions = async () => {
    // consume("account-api", "account-api-transaction", transactionsTopic, transactionReceived);
    const cbTransactionReceived: MultiFormatMessageCallback = {
        [messageJson]: {callback: transactionReceived}
    }

    const cbTransactionChallenge: MultiFormatMessageCallback = {
        [messageAvro]: {bufferConverter: transactionChallengeAvroSchema, callback: transactionChallenge}
    }
    const cbTransactionForbid: MultiFormatMessageCallback = {
        [messageAvro]: {bufferConverter: transactionForbidAvroSchema, callback: transactionForbid}
    }

    consume("account-api", "account-api-transaction-received", transactionsTopic, cbTransactionReceived);
    consume("account-api", "account-api-transaction-challenge", "transactions_challenge", cbTransactionChallenge);
    consume("account-api", "account-api-transaction-forbidden", "transactions_forbid", cbTransactionForbid);
}
