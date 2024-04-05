
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Context,
} from "https://deno.land/x/lambda/mod.ts";
import { lambdaEntryPoint, mandatoryEnvVariable, mandatoryHeader } from "https://raw.githubusercontent.com/GeoffWilliams/deno-lambda-terraform/master/lambda.ts"
import { example } from "./app.ts";

// https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
const secretsExtensionHttpPort = 2773
const awsSessionToken = mandatoryEnvVariable("AWS_SESSION_TOKEN");
const secretName = mandatoryEnvVariable("SECRET_NAME")
const secretsEndpoint =  `http://localhost:${secretsExtensionHttpPort}/secretsmanager/get?secretId=${secretName}`
const FIELD_USERNAME = "KAFKA_USERNAME"
const FIELD_PASSWORD = "KAFKA_PASSWORD"

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const setupEnvironment = async () => {
  let resp;
  let first = true;
  let json;
  do {
    resp = await fetch(
      secretsEndpoint, {
        headers: {
          "X-Aws-Parameters-Secrets-Token": awsSessionToken,
          "Content-Type": "application/json"
        }
      }
    );
    json = await resp.json()
    if (! first) {
      console.log(`bad parameter store status: ${resp.status} - sleep`)
      await sleep(1000);
    }
    first = false;
  } while (resp.status !== 200)

  const secret = JSON.parse(json["SecretString"]);

  if (! secret[FIELD_USERNAME] || ! secret[FIELD_PASSWORD]) {
    throw new Error(`Secret is missing ${FIELD_USERNAME} and/or ${FIELD_PASSWORD}. Available: ${JSON.stringify(Object.keys(secret))}`)
  }

  Deno.env.set("KAFKA_USERNAME", secret[FIELD_USERNAME])
  Deno.env.set("KAFKA_PASSWORD", secret[FIELD_PASSWORD])
  console.info("setup environment OK!")

}

const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> =>  {
  console.log("lambda handler")
  await setupEnvironment()

  // extract exampleId from the GET path. its the last element
  // const queryString = event.rawQueryString
  // const exampleId = queryString.split("/").at(-1)
  let exampleId;
  if (event.pathParameters) {
    exampleId = event.pathParameters["exampleId"]
  }

  if (! exampleId) {
    throw new Error("Missing exampleId!")
  }
  console.log(`parsed example: ${exampleId}`)


  const result = await example(exampleId)


  return {
    body: JSON.stringify(result),
    headers: { "content-type": "application/json" },
    statusCode: 200,
  };
}


const main = async () => {
  await lambdaEntryPoint(handler)
}

await main();