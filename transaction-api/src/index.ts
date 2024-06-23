import type { TransactionMessage } from 'shared/src/schemas';
import { produce } from "shared/src/kafka.ts";
import { transactionsTopic } from "shared/src/constants";
import fs from "node:fs";
import Log4js from 'log4js';

import { $ } from "bun";

const logger = Log4js.getLogger();
logger.level = "debug";

export const clientId = "transaction-api";
const examplesDir = "examples"


export const produceTransactionMessage = async (transactionMessage: TransactionMessage) => {
  logger.debug("producing transaction to kafka...");
  const kafkaMessage = {
    key: transactionMessage.idempotency_key,
    value: JSON.stringify(transactionMessage),
    headers: {'app-id': "location-api v1"}
  }

  return await produce(clientId, transactionsTopic, kafkaMessage);
}

export const example = async (exampleId: string) => {
  logger.debug(`example selected: ${exampleId}`);
  const examples = await getExamplesAsStrings();
  if (! (exampleId in examples)) {
    throw new Error(`no such example: ${exampleId} (available: ${JSON.stringify(Object.keys(examples))})`)
  }

  const example = examples[exampleId]
  const transactionMessage: TransactionMessage = JSON.parse(example)

  transactionMessage["ts"] = new Date().toISOString()
  transactionMessage["idempotency_key"] = crypto.randomUUID();

  logger.info(`loaded example: ${exampleId}`)
  await produceTransactionMessage(transactionMessage);

  return {
      status: "submitted",
      id: transactionMessage.idempotency_key
  }
}

export const getExamplesAsStrings = async (): Promise<Record<string, string>> => {
  const examples: Record<string, string> = {}

  // if running on AWS lambda we will be in a funny directory. See:
  // https://stackoverflow.com/a/39550486
  const examplesPath = process.env.LAMBDA_TASK_ROOT ? `${process.env.LAMBDA_TASK_ROOT}/${examplesDir}` : examplesDir;

  logger.debug(`Resolved examples directory: ${examplesPath}`);

  // ever wanted to run shell commands on lambda for debugging?
  // https://bun.sh/guides/runtime/shell
  // const output = await $`ls -lR ${process.env.LAMBDA_TASK_ROOT}`.text();
  // logger.info(output);

  for await (const filename of await fs.promises.readdir(examplesPath)) {
    const filePath = `${examplesPath}/${filename}`
    logger.debug(`stat: ${filePath}`);
    const fileStat = await fs.promises.stat(filePath);
    if (fileStat.isFile() && filename.endsWith(".json")) {
      logger.debug(`loading ${filename}...`);
      const example = await Bun.file(filePath).text();
      examples[filename] = example;
      logger.debug('...OK');
    }
  }
  return examples;
}
