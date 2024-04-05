import { locationTopic, transactionsTopic } from "../shared/constants.ts";
import { LocationMessage, TransactionMessage } from "../shared/interfaces.ts";
import { consume } from "../shared/kafka.ts";

const transactionMessages: Array<TransactionMessage> = [];
const transactionWebSockets: Array<WebSocket> = [];


const sendAllKnownTransactions = async (webSocket: WebSocket) => {
    console.info("sending all known transactions to client")
    for (const transactionMessage of transactionMessages) {
        await webSocket.send(JSON.stringify(transactionMessage))
    }
}

export const handleTransaction = async (context) => {
    const webSocket = await context.upgrade()
    transactionWebSockets.push(webSocket);
    webSocket.onopen = () => sendAllKnownTransactions(webSocket)
    webSocket.onclose = () => {
      const i = transactionWebSockets.indexOf(webSocket)
      console.debug(`remove registered websocket at index: ${i}`)
      transactionWebSockets.splice(i, 1)
    }

};


const transactionReceived = async (transactionMessage: TransactionMessage) => {
    const jsonString = JSON.stringify(transactionMessage)
    console.log(`send to clients: ${jsonString}`)
    for (const webSocket of transactionWebSockets) {
      if (webSocket.readyState === WebSocket.OPEN) {
        console.info(`sendto ${typeof(webSocket)}`);
        await webSocket.send(jsonString);
      } else {
        console.warn("skip websocket not in OPEN state")
      }
    }
    transactionMessages.push(transactionMessage)
    console.info("last location updated")
}

export const watchTransactions = async () => {
    await consume("account-api", "account-api-transaction", transactionsTopic, transactionReceived);
}
