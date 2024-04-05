FROM denoland/deno-lambda:1.42.1


ENV DENO_PERMISSIONS="--allow-net --allow-env --allow-read"
ENV DENO_DIR="/tmp/.deno_dir"
ENV LAMBDA_TASK_ROOT=/app/transaction-api
RUN mkdir -p /app
COPY transaction-api /app/transaction-api/
COPY shared /app/shared/
COPY KafkaSaur /app/KafkaSaur

RUN deno cache /app/transaction-api/lambda.ts


CMD ["lambda.handler"]