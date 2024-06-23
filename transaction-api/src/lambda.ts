
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { example } from "./index.ts";
import { StatusCodes } from "http-status-codes"
import Log4js from 'log4js';

const logger = Log4js.getLogger();
logger.level = "debug";


// https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html
// const secretsExtensionHttpPort = 2773
// const awsSessionToken = mandatoryEnvVariable("AWS_SESSION_TOKEN");
// const secretName = mandatoryEnvVariable("SECRET_NAME")
// const secretsEndpoint =  `http://localhost:${secretsExtensionHttpPort}/secretsmanager/get?secretId=${secretName}`
const FIELD_USERNAME = "KAFKA_USERNAME"
const FIELD_PASSWORD = "KAFKA_PASSWORD"

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const setupEnvironment = async () => {
  const client = new SecretsManagerClient({ region: "ap-southeast-2" });
  // GetSecretValueRequest
  const input = {
    SecretId: process.env.SECRET_NAME,
    VersionStage: "AWSCURRENT",
  };
  const command = new GetSecretValueCommand(input);
  const response = await client.send(command);
  // { // GetSecretValueResponse
  //   ARN: "STRING_VALUE",
  //   Name: "STRING_VALUE",
  //   VersionId: "STRING_VALUE",
  //   SecretBinary: new Uint8Array(),
  //   SecretString: "STRING_VALUE",
  //   VersionStages: [ // SecretVersionStagesType
  //     "STRING_VALUE",
  //   ],
  //   CreatedDate: new Date("TIMESTAMP"),
  // };
  if (response === undefined || ! response.SecretString) {
    throw new Error(`Fatal: bad response from SecretsManager (response=${!!response}, response.secretString=${!!response.SecretString||false})`);
  }
  const secret = JSON.parse(response.SecretString);

  if (! secret[FIELD_USERNAME] || ! secret[FIELD_PASSWORD]) {
    throw new Error(`Secret exists but JSON is missing ${FIELD_USERNAME} and/or ${FIELD_PASSWORD}. Available: ${JSON.stringify(Object.keys(secret))}`)
  }

  process.env.KAFKA_USERNAME = secret[FIELD_USERNAME];
  process.env.KAFKA_PASSWORD = secret[FIELD_PASSWORD];
  logger.info("setup environment OK!")

}


export default {
  async fetch(request: Request): Promise<Response> {
    logger.info(`lambda: ${request.headers.get("x-amzn-function-arn")}`);
    await setupEnvironment()
    const exampleId = request.url.split('/').pop();
    if (! exampleId) {
      throw new Error("exampleId is empty - did we parse a bad URL from request?");
    }
    logger.info(`extracted exampleId=${exampleId} from URL: ${request.url}`);
    const result = await example(exampleId)

    return new Response(JSON.stringify(result), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
