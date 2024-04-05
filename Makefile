REPO_NAME := kfd-transaction

IMAGE_VERSION := $(shell cat transaction-api/VERSION)

.EXPORT_ALL_VARIABLES:

docker_image:
	docker build -t $(REPO_NAME):$(IMAGE_VERSION) .

docker_run:
	docker run -p 9000:8080 $(REPO_NAME):$(IMAGE_VERSION)


zipfile:
	rm -rf build
	mkdir build
	cd build \
	&& deno compile -o bootstrap --allow-net --allow-env --allow-read ../transaction-api/lambda.ts \
	&& zip -r app-$(IMAGE_VERSION).zip . \
	&& cd ../transaction-api \
	&& zip -u -r ../build/app-$(IMAGE_VERSION).zip examples

# ecr_repo:
# 	aws ecr describe-repositories --repository-names $(REPO_NAME) || aws ecr create-repository --repository-name $(REPO_NAME)

# ecr_push:
# 	aws ecr get-login-password | docker login --username AWS --password-stdin 492737776546.dkr.ecr.ap-southeast-2.amazonaws.com
# 	docker tag $(REPO_NAME):$(IMAGE_VERSION) 492737776546.dkr.ecr.ap-southeast-2.amazonaws.com/kfd-transaction:$(IMAGE_VERSION)
# 	docker push 492737776546.dkr.ecr.ap-southeast-2.amazonaws.com/kfd-transaction:$(IMAGE_VERSION)