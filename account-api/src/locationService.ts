import { locationTopic, messageJson } from "shared/src/constants";
import type { LocationMessage, MultiFormatMessageCallback } from "shared/src/interfaces";
import { consume } from "shared/src/kafka";
import { ServerWebSocket } from "bun"
import { ElysiaWS } from "elysia/dist/ws";
import Log4js from 'log4js';

const logger = Log4js.getLogger();

let lastLocationMessage: LocationMessage|false = false
const locationWebSockets: Array<ElysiaWS<ServerWebSocket<any>>> = [];

export const openLocationWs = async (ws: ElysiaWS<ServerWebSocket<any>>) => {
    locationWebSockets.push(ws);
    if (lastLocationMessage) {
      logger.debug("send initial state to websocket")
      ws.send(JSON.stringify(lastLocationMessage))
    }
};

export const closeLocationWs = (ws: ElysiaWS<ServerWebSocket<any>>) => {
      const i = locationWebSockets.indexOf(ws);
      logger.debug(`remove registered websocket at index: ${i}`)
      locationWebSockets.splice(i, 1);
}


const locationUpdated = async (locationMessage: LocationMessage): Promise<undefined> => {
    const jsonString = JSON.stringify(locationMessage)
    logger.info(`send to clients: ${jsonString}`)
    for (const webSocket of locationWebSockets) {
     if (webSocket.raw.readyState === WebSocket.OPEN) {
        logger.info(`sendto ${typeof(webSocket)}`);
        await webSocket.send(jsonString);
      } else {
        logger.warn(`skip websocket not in OPEN state`);
      }
    }
    lastLocationMessage = locationMessage;
    logger.info("last location updated")
}

export const watchLocation = async () => {
    const cb: MultiFormatMessageCallback = {
      [messageJson]: {callback: locationUpdated},
    }
    consume("account-api", "account-api-location", locationTopic, cb);
}
