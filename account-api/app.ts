import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { handleLocation, watchLocation } from "./locationService.ts";
import { handleTransaction, watchTransactions } from "./transactionService.ts";
const app = new Application({ logErrors: false });
const router = new Router();

router.get('/wss/location', handleLocation);
router.get('/wss/transaction', handleTransaction);
app.use(router.routes());
app.use(router.allowedMethods());


const main = async () => {
  app.listen({ port: 9000 });
  watchLocation();
  watchTransactions();
}

await main()

