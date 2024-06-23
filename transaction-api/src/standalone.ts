import { TransactionMessage } from 'shared/src/schemas.ts';
import { APIError} from "shared/src/APIError.ts";
import { Elysia, t } from 'elysia';
import { Logestic } from 'logestic';
import { StatusCodes } from 'http-status-codes';
import { example, produceTransactionMessage } from "./index.ts";
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
  // put posted JSON in kafka if it has required fields
  .post('/api/transaction', async ({body}) => {
    logger.info(JSON.stringify(body))
    const transactionMessage: TransactionMessage = body

    try {
      await produceTransactionMessage(transactionMessage)
      return {
        status: "submitted",
        id: transactionMessage.idempotency_key
      }
    } catch (e) {
      throw new APIError(StatusCodes.INTERNAL_SERVER_ERROR, `${e instanceof Error ? e.message: e}`);
    }
  },  {body: TransactionMessage})
  // publish a named example
  .get("/examples/:exampleId", async (context) => {
    return await example(context.params.exampleId)
  })
  .listen(8001);