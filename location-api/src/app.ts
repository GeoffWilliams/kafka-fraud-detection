import type { LocationMessage } from 'shared/src/interfaces.ts';
import { produce } from 'shared/src/kafka.ts';
import { locationTopic } from 'shared/src/constants';
import { APIError} from "shared/src/APIError.ts";
import { Elysia } from 'elysia';
import Log4js from 'log4js';
import { Logestic } from 'logestic';
import { StatusCodes } from 'http-status-codes';


const logger = Log4js.getLogger();
const clientId = "location-api";

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
  .get('/api/location', async ({query, set}) => {
    const location =  query.location;
    const userid = query.userid;

    if (!location || !userid) {
      throw new APIError(StatusCodes.BAD_REQUEST, 'Missing location or userid');
    }

    const locationMessage: LocationMessage = {userid, location};
    try {
      const kafkaMessage = {
          key: userid,
          value: JSON.stringify(locationMessage),
          headers: {'app-id': "location-api v1"}
      }

      await produce(clientId, locationTopic, kafkaMessage);
      return { message: `${userid} ---> ${location}` };
    } catch (e) {
      throw new APIError(StatusCodes.INTERNAL_SERVER_ERROR, `${e instanceof Error ? e.message : e}` );
    }
  })
  .listen(8000);