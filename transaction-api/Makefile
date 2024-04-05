include ~/.kafka-fraud-detection.env

run:
	echo $(KAFKA_BOOTSTRAP)
	KAFKA_BOOTSTRAP=$(KAFKA_BOOTSTRAP) KAFKA_USERNAME=$(KAFKA_USERNAME) KAFKA_PASSWORD=$(KAFKA_PASSWORD) \
		deno run --allow-net --allow-env --allow-read app.ts



qr:
	deno run --allow-run --allow-net --allow-read --allow-write --allow-env qr-generator.ts


bad:
	curl -v -H "Content-Type: application/json" -X POST --data "@../docs/transaction_example_bad.json" http://localhost:8001/api/transaction

fraud:
	curl -v -H "Content-Type: application/json" -X POST --data "@../docs/transaction_example_fraud.json" http://localhost:8001/api/transaction

good:
	curl -v -H 'content-type: application/json' -X POST --data "@../docs/transaction_example_good.json"  http://localhost:8001/api/transaction