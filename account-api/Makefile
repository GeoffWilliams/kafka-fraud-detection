include ~/.kafka-fraud-detection.env

run:
	echo $(KAFKA_BOOTSTRAP)
	@KAFKA_BOOTSTRAP=$(KAFKA_BOOTSTRAP) KAFKA_USERNAME=$(KAFKA_USERNAME) KAFKA_PASSWORD=$(KAFKA_PASSWORD)\
		deno run --allow-net --allow-env app.ts

test:
	wscat -c ws://localhost:9000/wss/location