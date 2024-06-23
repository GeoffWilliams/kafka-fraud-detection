resource "confluent_flink_compute_pool" "main" {
  display_name     = "${var.basename}-flink"
  cloud            = "AWS"
  region           = "ap-southeast-2"
  max_cfu          = 5
  environment {
    id = var.cc_environment_id
  }
}