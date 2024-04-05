import {
  Application,
  Context,
  isHttpError,
  Router,
  RouterContext,
  Status
} from "https://deno.land/x/oak/mod.ts";
import { basename } from "https://deno.land/std@0.221.0/path/mod.ts";
import { TransactionMessage } from '../shared/interfaces.ts';
import { produce } from "../shared/kafka.ts";
import { transactionsTopic } from "../shared/constants.ts";

export const clientId = "transaction-api";


export const produceTransactionMessage = async (transactionMessage: TransactionMessage) => {
  const kafkaMessage = {
    key: transactionMessage.idempotency_key,
    value: JSON.stringify(transactionMessage),
    headers: {'app-id': "location-api v1"}
  }

  return await produce(clientId, transactionsTopic, kafkaMessage);
}

export const example = async (exampleId: string) => {
  const examples = await getExamplesAsStrings();
  if (! (exampleId in examples)) {
    throw new Error(`no such example: ${exampleId} (available: ${JSON.stringify(Object.keys(examples))})`)
  }

  const example = examples[exampleId]
  const transactionMessage: TransactionMessage = JSON.parse(example)

  transactionMessage["ts"] = new Date().toISOString()
  transactionMessage["idempotency_key"] = crypto.randomUUID();

  console.info(`loaded example: ${exampleId}`)
  await produceTransactionMessage(transactionMessage);

  return {
      status: "submitted",
      id: transactionMessage.idempotency_key
  }
}

export const getExamplesAsStrings = async (): Promise<Record<string, string>> => {
  const examples: Record<string, string> = {}
  const ExamplesDir = "examples"
  for await (const dirEntry of Deno.readDir(ExamplesDir)) {

      if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
          const path = dirEntry.name
          console.log(path);
          const example = await Deno.readTextFile(`${ExamplesDir}/${path}`)
          const filename = basename(path);
          examples[filename] = example;
          console.info(`loaded: ${path}`)
      }
  }
  return examples
}
