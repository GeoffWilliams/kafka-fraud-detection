//producer example
import log4js from "log4js";
import { Kafka } from 'kafkajs';
import { messageAvro, messageJson } from "./constants";
import type { MultiFormatMessageCallback } from "./interfaces";

const logger = log4js.getLogger();
logger.level = "debug";

// "{"
const magicByteJson = 0x7b;

let kafka: any  = false;
let producer: any = false;



export const configureKafka = (clientId: string) => {
  const username = process.env.KAFKA_USERNAME;
  const password = process.env.KAFKA_PASSWORD;
  const bootstrap = process.env.KAFKA_BOOTSTRAP;

  if (! bootstrap || ! username || ! password) {
    throw new Error(`missing environment variables: KAFKA_BOOTSTRAP: ${!!bootstrap} KAFKA_USERNAME: ${!!username} KAFKA_PASSWORD: ${!!password}`);
  }

  kafka = new Kafka({
    clientId,
    ssl: true,
    sasl: {
      username,
      password,
      mechanism: "plain",
    },
    brokers: [bootstrap]
  });
  logger.info("kafka configured");
}

export const produce = async (clientId: string, topic: string, message: any) => {
  message["headers"] = {'correlation-id': `${Date.now()}`};
  if (! kafka) {
    configureKafka(clientId);
  }
  if (! producer) {
    logger.info("connecting producer...");
    producer = kafka.producer();
    await producer.connect();
    logger.info("...producer connected");
  }
  logger.info("producing...");

  await producer.send({
    topic,
    messages: [message]
  });
  logger.info("...produce finished");
}

export const consume = async (clientId: string, groupId: string, topic: string, cb: MultiFormatMessageCallback) => {
  if (! kafka) {
    configureKafka(clientId);
  }

  logger.info(`connecting consumer - ${clientId}: ${topic}`);
  const consumer = kafka.consumer({groupId});
  logger.debug("...connect");
  await consumer.connect();
  logger.debug(`...subscribing to topic: ${topic}`);
  await consumer.subscribe({ topic, fromBeginning: true });
  logger.info(`...consumer connected to ${topic} OK`);

  await consumer.run({
    eachMessage: async (message: any) => {
      logger.debug(`process kafka message on topic: ${topic}...`);

      // there is actually a schema registry client from confluent that does all this magically but
      // lets do it all by hand because why not... test your programming ability as it were...
      // a bit like those stupid programming tests where someone says sort an array but your not
      // allowed to use .sort()
      const payload = message.message.value

      // JSON messages start with `{` - assume all other messages are AVRO
      const magicByte = payload[0];
      const magicByteAsHex = ('0x' + (magicByte & 0xFF).toString(16));

      const messageType = magicByte === magicByteJson ? messageJson : messageAvro

      logger.debug(`message detection: handler=${messageType} size=${payload.length}b magic=${magicByteAsHex}`);

      if ((messageType === messageJson && ! (messageJson in cb))
        || (messageType === messageAvro && ! (messageAvro in cb))
      ) {
        throw new Error(`json callback requested but supplied callback is missing ${messageType} handler`);
      }

      if (messageType === messageJson) {
        const jsonString = payload.toString();
        let json: any;
        try {
          logger.debug("parsing message as JSON");
          json = JSON.parse(jsonString);
        } catch (err) {
          logger.error(`Could not parse JSON from message, cause: ${err instanceof Error ? err.message: err}\nraw message:\n${jsonString}`);
        }
        if (json) cb[messageJson]?.callback(json);
      } else if (messageType === messageAvro) {
        logger.debug("parsing message as AVRO");
        // remove first 5 bytes from buffer - its a schema ID so would break schema parsing...
        let avro: any;
        try {
          avro = cb[messageAvro]?.bufferConverter.fromBuffer(payload.slice(5));
        } catch (err) {
          logger.error(`Could not parse AVRO from message, cause: ${err instanceof Error ? err.message: err}`);
        }
        if (avro) cb[messageAvro]?.callback(avro);
      } else {
        throw new Error(`Unsupported message type: ${messageType}`);
      }

    },
  });
}
