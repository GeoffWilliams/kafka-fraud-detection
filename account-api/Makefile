include ~/.kafka-fraud-detection.env

run:
	echo $(KAFKA_BOOTSTRAP)
	@KAFKA_BOOTSTRAP=$(KAFKA_BOOTSTRAP) KAFKA_USERNAME=$(KAFKA_USERNAME) KAFKA_PASSWORD=$(KAFKA_PASSWORD)\
		bun run src/app.ts

test:
	wscat -c ws://localhost:9000/wss/location