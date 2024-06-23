
## Sub-projects

* `account-api` - REST api to read account info
* `account-app` - Svelte static webapp to visualize account info
* `location-api` - REST api to set location
* `terraform-aws` - Terraform scripts for AWS (API gateway, Lambda, S3, CloudFront)
* `terraform-cc` - Terraform scripts for Confluent Cloud (Cluster, Topics, Flink)
* `transaction-api` - REST api to make transactions
    * `qr-generator` - QR code generator (for transaction API)

Transaction

## Confluent Cloud setup

```shell
cd terraform-cc
terraform apply
```

# How to AWS Lambada...

## Bun Lambda Layer
Get bun lambda layer builder, publish to your AWS account:

[Instructions](https://github.com/oven-sh/bun/tree/main/packages/bun-lambda)

Tweak: `bun scripts/publish-layer.ts --arch x64 --region=ap-southeast-2`

Update `terraform-aws/terraform-aws.tf` resource `aws_lambda_function.function` Layer IDs to include the bun layer ARN

## Zipfile

We need a zip file of all the bun sources and the JSON files our app expects to find:

```shell
# increment transaction-api/VERSION to create a zipfile with updated version number each time you upload...
make zipfile
```

## Upload to AWS, Create lambda and all required settings

Do after each zipfile release - this includes the upload to S3:

```shell
cd terraform-aws
terraform apply
```

If no errors, test out the lambda and see if it worked...



