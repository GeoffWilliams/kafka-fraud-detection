import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import { LocationMessage } from '../shared/interfaces.ts';
import { produce } from '../shared/kafka.ts';
import { locationTopic } from '../shared/constants.ts';

const clientId = "location-api";

const router = new Router();

router.get('/api/location', async (context) => {
  const location = context.request.url.searchParams.get('location');
  const userid = context.request.url.searchParams.get('userid');

  if (!location || !userid) {
    context.response.status = 400;
    context.response.body = { error: 'Missing location or userid' };
    return;
  }

  const locationMessage: LocationMessage = {userid, location};
  try {
    const kafkaMessage = {
        key: userid,
        value: JSON.stringify(locationMessage),
        headers: {'app-id': "location-api v1"}
    }

    await produce(clientId, locationTopic, kafkaMessage);
    context.response.body = { message: `${userid} ---> ${location}` };
  } catch (e) {
    context.response.status = 500
    context.response.body = { error: `${e.message}` };
  }

});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });