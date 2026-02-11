# Terraform variables for Ionic Boilerplate deployment

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ionic-boilerplate"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "yourapp.com"
}

variable "create_route53_zone" {
  description = "Whether to create a Route 53 hosted zone"
  type        = bool
  default     = false
}

variable "use_cloudflare" {
  description = "Whether to use Cloudflare for DNS"
  type        = bool
  default     = false
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = "alerts@yourapp.com"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "ionicboilerplate"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Database maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

# ECS Configuration
variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "ionic-boilerplate-cluster"
}

variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 256
}

variable "ecs_task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "ECS desired count"
  type        = number
  default     = 2
}

variable "ecs_min_capacity" {
  description = "ECS minimum capacity"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "ECS maximum capacity"
  type        = number
  default     = 10
}

variable "ecs_target_cpu_utilization" {
  description = "ECS target CPU utilization for autoscaling"
  type        = number
  default     = 70
}

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 4200
}

variable "app_health_check_path" {
  description = "Application health check path"
  type        = string
  default     = "/health"
}

variable "app_health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "app_health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "app_health_check_healthy_threshold" {
  description = "Health check healthy threshold"
  type        = number
  default     = 2
}

variable "app_health_check_unhealthy_threshold" {
  description = "Health check unhealthy threshold"
  type        = number
  default     = 3
}

# SSL/TLS Configuration
variable "ssl_certificate_arn" {
  description = "SSL certificate ARN for ALB"
  type        = string
  default     = ""
}

variable "enable_ssl" {
  description = "Enable SSL/TLS"
  type        = bool
  default     = true
}

# Logging and Monitoring
variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch logs"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Log retention in days"
  type        = number
  default     = 14
}

variable "enable_xray_tracing" {
  description = "Enable AWS X-Ray tracing"
  type        = bool
  default     = false
}

# Security Configuration
variable "enable_ddos_protection" {
  description = "Enable AWS Shield Advanced"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "Allowed CIDR blocks for security groups"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# Cost and Resource Limits
variable "cost_allocation_tag" {
  description = "Cost allocation tag"
  type        = string
  default     = "ionic-boilerplate"
}

variable "enable_cost_monitoring" {
  description = "Enable cost monitoring"
  type        = bool
  default     = true
}

variable "monthly_budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 100
}

variable "budget_notification_emails" {
  description = "Budget notification emails"
  type        = list(string)
  default     = ["alerts@yourapp.com"]
}

# Feature Flags
variable "enable_api_gateway" {
  description = "Enable API Gateway"
  type        = bool
  default     = true
}

variable "enable_database" {
  description = "Enable RDS database"
  type        = bool
  default     = true
}

variable "enable_redis" {
  description = "Enable ElastiCache Redis"
  type        = bool
  default     = true
}

variable "enable_s3_static_hosting" {
  description = "Enable S3 static hosting"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "enable_autoscaling" {
  description = "Enable ECS autoscaling"
  type        = bool
  default     = true
}

# Environment-specific configurations
variable "dev_config" {
  description = "Development environment configuration"
  type = object({
    db_instance_class = string
    ecs_desired_count = number
    enable_ssl = bool
    monthly_budget_amount = number
  })
  default = {
    db_instance_class = "db.t3.micro"
    ecs_desired_count = 1
    enable_ssl = false
    monthly_budget_amount = 50
  }
}

variable "staging_config" {
  description = "Staging environment configuration"
  type = object({
    db_instance_class = string
    ecs_desired_count = number
    enable_ssl = bool
    monthly_budget_amount = number
  })
  default = {
    db_instance_class = "db.t3.small"
    ecs_desired_count = 2
    enable_ssl = true
    monthly_budget_amount = 200
  }
}

variable "prod_config" {
  description = "Production environment configuration"
  type = object({
    db_instance_class = string
    ecs_desired_count = number
    enable_ssl = bool
    monthly_budget_amount = number
  })
  default = {
    db_instance_class = "db.t3.medium"
    ecs_desired_count = 3
    enable_ssl = true
    monthly_budget_amount = 1000
  }
}
