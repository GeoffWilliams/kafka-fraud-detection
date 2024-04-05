import {
    Application,
    Context,
    isHttpError,
    Router,
    RouterContext,
    Status
  } from "https://deno.land/x/oak/mod.ts";
  import { TransactionMessage } from '../shared/interfaces.ts';

  import { getExamplesAsStrings, produceExample } from './examples.ts'
  import { produce } from "../shared/kafka.ts";
  import { transactionsTopic } from "../shared/constants.ts";
import { example, produceTransactionMessage } from "./app.ts";

  const port = 8001
  const router = new Router();

  // put posted JSON in kafka if it has required fields
  router.post('/api/transaction', async context => {
    console.log("post transaction");
    if (!context.request.hasBody) {
      context.throw(Status.BadRequest, "Bad Request");
    }
    const body = context.request.body;
    if (body.type() === "json") {

      const json = await body.json();
      console.log(JSON.stringify(json))
      context.assert(json.idempotency_key, 400, "idempotency_key is missing");
      context.assert(json.location_id, 400, "location_id is missing");
      context.assert(json.source_id, 400, "source_id is missing");
      context.assert(json.amount_money?.amount, 400, "amount_money.amount is missing");
      context.assert(json.amount_money?.currency, 400, "amount_money.currency is missing");
      context.assert(json.customer_id, 400, "customer_id is missing");

      const transactionMessage: TransactionMessage = json

      try {
        await produceTransactionMessage(transactionMessage)
        context.response.body = {
          status: "submitted",
          id: transactionMessage.idempotency_key
        }
      } catch (e) {
        context.response.status = 500
        context.response.body = { error: `${e.message}` };
      }

      return
    }
    context.throw(Status.BadRequest, "Bad Request");
  });


  // publish a named example
  router.get("/examples/:exampleId", async (context) => {
    return await example(context.params.exampleId)
  })

  // app startup
  const app = new Application();

  // error handler middleware for oak
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
        switch (err.status) {
          case Status.NotFound:
            // handle NotFound
            break;
          default:
            // handle other statuses
        }
      } else {
        // rethrow if you can't handle the error
        throw err;
      }
    }
    if (!ctx.response.body && ctx.response.status === 404) {
      ctx.response.body = { error: '404 Not Found' };
    }
  });


  // let rip!
  app.use(router.routes());
  app.use(router.allowedMethods());
  await app.listen({ port });