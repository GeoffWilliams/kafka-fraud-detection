
## Sub-projects

* `account-api` - REST api to read account info
* `account-app` - Svelte static webapp to visualize account info
* `location-api` - REST api to set location
* `qr-generator` - QR code generator (for transaction API)
* `terraform-aws` - Terraform scripts for AWS (API gateway, Lambda, S3, CloudFront)
* `terraform-cc` - Terraform scripts for Confluent Cloud (Cluster, Topics, Flink)
* `transaction-api` - REST api to make transactions

## Confluent Cloud setup

```shell
cd terraform-cc
terraform apply
```



