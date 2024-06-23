import { Elysia } from 'elysia'
// https://github.com/tristanisham/logysia/issues/17
import { Logestic } from 'logestic';
import { APIError} from "shared/src/APIError";
import { openTransactionWs, closeTransactionWs, watchTransactions } from './transactionService';
import { openLocationWs, closeLocationWs, watchLocation } from './locationService';
import { ServerWebSocket } from "bun"
import { ElysiaWS } from 'elysia/dist/ws';
import Log4js from 'log4js';

const logger = Log4js.getLogger();

new Elysia()
  .use(Logestic.preset('common'))
  .error({APIError})
  .onError(({ error, request, set, code }) => {
    const apiError = error as APIError;
    return Response.json(
      { error: error.message},
      { status: apiError.httpCode},
    );
  })
  .ws('/echo', {
    open(ws: ElysiaWS<ServerWebSocket<any>>) {
      ws.send("websocket was opened")
    },
    message(ws: ElysiaWS<ServerWebSocket<any>>, message: string) {
      ws.send(`received: ${message}`)
    },
    close(ws: ElysiaWS<ServerWebSocket<any>>) {
      logger.info("ws closed");
      // cant send anything because the socket is closed :)
      // ws.send("websocket was closed")
    },
  })
  .ws('/ws/location', {
    open(ws: ElysiaWS<ServerWebSocket<any>>) {
      openLocationWs(ws);
    },
    close(ws: ElysiaWS<ServerWebSocket<any>>) {
      closeLocationWs(ws);
    },
  })
  .ws('/ws/transactionMessage', {
    open(ws: ElysiaWS<ServerWebSocket<any>>) {
      openTransactionWs(ws);
    },
    close(ws: ElysiaWS<ServerWebSocket<any>>) {
      closeTransactionWs(ws);
    },
  })
  .listen(9000)

watchLocation();
watchTransactions();


