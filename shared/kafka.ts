//producer example
// import {Kafka as Kafkasaur} from "https://deno.land/x/kafkasaur/index.ts"
import {Kafka as Kafkasaur} from "../KafkaSaur/index.ts"

let kafka: any  = false;
let producer: any = false;



export const connectKafka = async (clientId: string) => {
  const username = Deno.env.get("KAFKA_USERNAME");
  const password = Deno.env.get("KAFKA_PASSWORD");
  const bootstrap = Deno.env.get("KAFKA_BOOTSTRAP");

  if (! bootstrap || ! username || ! password) {
    throw new Error(`missing environment variables: KAFKA_BOOTSTRAP: ${!!bootstrap} KAFKA_USERNAME: ${!!username} KAFKA_PASSWORD: ${!!password}`);
  }

  console.info("connecting kafka")
  return new Kafkasaur({
    clientId,
    ssl: true,
    sasl: {
      username,
      password,
      mechanism: "plain",
    },
    brokers: [bootstrap]
  })
}

export const produce = async (clientId: string, topic: string, message: any) => {
  message["headers"] = {'correlation-id': `${Date.now()}`}
  if (! kafka) {
    try {
    console.log("init kafka...")
    kafka = await connectKafka(clientId);
    console.info("kafka connected");
    } catch (err) {
      console.error("gotcha1 " + err.message)
    }
  }
  if (! producer) {
    console.log("init producer...")
    producer = kafka.producer();
    await producer.connect();

  }
  console.info("producing...")
  // try {
    await producer.send({
      topic,
      messages: [message]
    });
    console.info("produce finished")
  // } catch(err) {
  //   console.error("EXCEPTION CAUGHT in my codes!!!: " + err.message)
  //   producer = false;
  //   // if (err instanceof BadResource) {
  //   //   console.error("producer crash from closed socket??? - force restart")
  //   //   producer = false
  //   //   kafka = false
  //   //   await produce(clientId, topic, message)
  //   // }
  // }
}

export const consume = async (clientId: string, groupId: string, topic: string, cb: any) => {
  if (! kafka) {
    kafka = await connectKafka(clientId);
    console.log("init kafka...")
  }

  const admin = kafka.admin();

  try {
    await admin.deleteGroups([groupId])
    console.info(`deleted consumer group: ${groupId} to force rewind!`)
  } catch (err) {
    console.error(`could not delete consumer group '${groupId}': ${err.message}`)
  }
  // await admin.setOffsets({ groupId, topic, partitions: [{partition: 0, offset: "0"}] })
  // console.info(`consumer group: ${clientId} reset!`)


  console.log(`init consumer - ${clientId}: ${topic}`)
  const consumer = kafka.consumer({groupId});
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })



  // consumer.on(consumer.events.CONNECT, async () => {
  //   console.info(`consumer group: ${clientId} reset!`)
  //   consumer.seek({topic, partition: 0, offset: 0})
  // })

  const run = await consumer.run({
    eachMessage: async (message: any) => {
      console.info("process kafka message...")
      const payload = message.message.value.toString()
      try {
        const json = JSON.parse(payload)
        cb(json)
      } catch (err) {
        console.error(`Could not parse JSON, cause: ${err.message}\nraw message:\n${payload}`)
      }

    },
  })
}
