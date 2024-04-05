import { locationTopic } from "../shared/constants.ts";
import { LocationMessage } from "../shared/interfaces.ts";
import { consume } from "../shared/kafka.ts";

let lastLocationMessage: LocationMessage|false = false
const locationWebSockets: Array<WebSocket> = [];

export const handleLocation = async (context) => {
    const webSocket = await context.upgrade()
    locationWebSockets.push(webSocket);
    webSocket.onopen = () => {
      if (lastLocationMessage) {
        console.debug("send initial state to websocket")
        webSocket.send(JSON.stringify(lastLocationMessage))
      }
    }
    webSocket.onclose = () => {
      const i = locationWebSockets.indexOf(webSocket)
      console.debug(`remove registered websocket at index: ${i}`)
      locationWebSockets.splice(i, 1)
    }

};


const locationUpdated = async (locationMessage: LocationMessage) => {
    const jsonString = JSON.stringify(locationMessage)
    console.log(`send to clients: ${jsonString}`)
    for (const webSocket of locationWebSockets) {
      if (webSocket.readyState === WebSocket.OPEN) {
        console.info(`sendto ${typeof(webSocket)}`);
        await webSocket.send(jsonString);
      } else {
        console.warn("skip websocket not in OPEN state")
      }
    }
    lastLocationMessage = locationMessage;
    console.info("last location updated")
}

export const watchLocation = async () => {
    await consume("account-api", "account-api-location", locationTopic, locationUpdated);
}
