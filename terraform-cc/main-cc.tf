variable "cc_environment_id" {
  description = "ID of confluent cloud environment to use"
}
variable "basename" {
  description = "basename for resources"
}
variable "topics" {
  description = "topics to create"
  type = set(string)
}

terraform {
  required_providers {
    confluent = {
      source  = "confluentinc/confluent"
      version = "1.67.0"
    }
  }
}

# read from environment variables
provider "confluent" {}

resource "confluent_kafka_cluster" "cluster" {
  display_name = var.basename
  availability = "SINGLE_ZONE"
  cloud        = "AWS"
  region       = "ap-southeast-2"
  basic {}

  environment {
    id = var.cc_environment_id
  }

}

resource "confluent_service_account" "sa" {
  display_name = "sa-${var.basename}"
}


resource "confluent_role_binding" "sa-0" {
  principal   = "User:${confluent_service_account.sa.id}"
  role_name   = "CloudClusterAdmin"
  crn_pattern = confluent_kafka_cluster.cluster.rbac_crn
}

resource "confluent_api_key" "api_key" {
  display_name = "sa api key"
  description  = "Kafka API Key that is owned by service account"
  owner {
    id          = confluent_service_account.sa.id
    api_version = confluent_service_account.sa.api_version
    kind        = confluent_service_account.sa.kind
  }

  managed_resource {
    id          = confluent_kafka_cluster.cluster.id
    api_version = confluent_kafka_cluster.cluster.api_version
    kind        = confluent_kafka_cluster.cluster.kind

    environment {
      id = var.cc_environment_id
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}


resource "confluent_kafka_topic" "topics" {
  for_each = var.topics
  topic_name = each.key
  partitions_count   = 1

  rest_endpoint      = confluent_kafka_cluster.cluster.rest_endpoint

  kafka_cluster {
    id = confluent_kafka_cluster.cluster.id
  }

  credentials {
    key    = confluent_api_key.api_key.id
    secret = confluent_api_key.api_key.secret
  }

  lifecycle {
    prevent_destroy = false
  }
}



output "connection_info" {
  sensitive = true
  value = <<EOF

Add to ansible inventory
------------------------

kafka_connect:
  vars:
    kafka_connect_custom_properties:
    - ssl.client.auth: 'required'
    - listeners: 'https://0.0.0.0:8083'
    - rest.advertised.listener: 'https'
    - rest.advertised.host.name: 'connect-worker-0.connect.test.local'
    - rest.advertised.host.port: '8083'
    - group.id: 'connect'
    - config.storage.topic: 'x_connect_config'
    - offset.storage.topic: 'x_connect_offset'
    - status.storage.topic: 'x_connect_status'
    - key.converter: 'org.apache.kafka.connect.storage.StringConverter'
    - value.converter: 'org.apache.kafka.connect.json.JsonConverter'
    - bootstrap.servers: '${confluent_kafka_cluster.cluster.bootstrap_endpoint}'
    - consumer.bootstrap.servers: '${confluent_kafka_cluster.cluster.bootstrap_endpoint}'
    - producer.bootstrap.servers: '${confluent_kafka_cluster.cluster.bootstrap_endpoint}'
    - ssl.endpoint.identification.algorithm: ''
    - sasl.mechanism: 'PLAIN'
    - security.protocol: 'SASL_SSL'
    - consumer.ssl.endpoint.identification.algorithm: 'https'
    - consumer.sasl.mechanism: 'PLAIN'
    - consumer.security.protocol: 'SASL_SSL'
    - producer.ssl.endpoint.identification.algorithm: 'https'
    - producer.sasl.mechanism: 'PLAIN'
    - producer.security.protocol: 'SASL_SSL'
    - topic.creation.enable: true
    - sasl.jaas.config: 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${confluent_api_key.api_key.id}" password="${confluent_api_key.api_key.secret}";'
    - producer.sasl.jaas.config: 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${confluent_api_key.api_key.id}" password="${confluent_api_key.api_key.secret}";'
    - consumer.sasl.jaas.config: 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${confluent_api_key.api_key.id}" password="${confluent_api_key.api_key.secret}";'
EOF
}