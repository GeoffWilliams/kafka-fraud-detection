include ~/.kafka-fraud-detection.env
.EXPORT_ALL_VARIABLES:

run:
	echo $(KAFKA_BOOTSTRAP)
	@KAFKA_BOOTSTRAP=$(KAFKA_BOOTSTRAP) KAFKA_USERNAME=$(KAFKA_USERNAME) KAFKA_PASSWORD=$(KAFKA_PASSWORD) \
		deno run --allow-net --allow-env app.ts

gb:
	curl -v "http://localhost:8000/api/location?userid=geoff&location=gb"
au:
	curl -v "http://localhost:8000/api/location?userid=geoff&location=au"
us:
	curl -v "http://localhost:8000/api/location?userid=geoff&location=us"
