# Terraform outputs for Ionic Boilerplate deployment

# General Outputs
output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_group" {
  description = "Database subnet group name"
  value       = module.vpc.database_subnet_group
}

# S3 Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.static_assets.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.static_assets.arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.static_assets.bucket_domain_name
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_status" {
  description = "CloudFront distribution status"
  value       = aws_cloudfront_distribution.main.status
}

# Application Load Balancer Outputs
output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

# API Gateway Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api.api_gateway_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.api.api_gateway_id
}

output "api_gateway_arn" {
  description = "API Gateway ARN"
  value       = module.api.api_gateway_arn
}

# Database Outputs
output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.database.database_endpoint
}

output "database_port" {
  description = "RDS database port"
  value       = module.database.database_port
}

output "database_arn" {
  description = "RDS database ARN"
  value       = module.database.database_arn
}

output "database_instance_id" {
  description = "RDS database instance ID"
  value       = module.database.database_instance_id
}

# Redis Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.redis.redis_endpoint
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = module.redis.redis_port
}

output "redis_cluster_id" {
  description = "ElastiCache Redis cluster ID"
  value       = module.redis.redis_cluster_id
}

# ECS Outputs
output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = module.ecs.ecs_cluster_id
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.ecs_cluster_arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.ecs_service_name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = module.ecs.ecs_task_definition_arn
}

# Security Outputs
output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_task_role_name" {
  description = "ECS task role name"
  value       = aws_iam_role.ecs_task_role.name
}

# DNS Outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = var.create_route53_zone ? aws_route53_zone.main[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route 53 name servers"
  value       = var.create_route53_zone ? aws_route53_zone.main[0].name_servers : null
}

# Monitoring Outputs
output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = module.ecs.cloudwatch_log_group_name
}

# Cost Outputs
output "estimated_monthly_cost" {
  description = "Estimated monthly cost in USD"
  value       = module.cost_estimation.monthly_cost
}

# Useful Commands Output
output "deployment_commands" {
  description = "Useful deployment commands"
  value = {
    build_and_deploy = "npm run build && aws s3 sync dist/ s3://${aws_s3_bucket.static_assets.bucket}"
    invalidate_cache = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.main.id} --paths '/*'"
    ssh_to_instance = "aws ssm start-session --target <instance-id>"
    view_logs = "aws logs tail /ecs/${var.project_name}-${var.environment} --follow"
  }
}

# URLs Output
output "application_urls" {
  description = "Application URLs"
  value = {
    cloudfront = "https://${aws_cloudfront_distribution.main.domain_name}"
    alb        = "http://${aws_lb.main.dns_name}"
    api        = module.api.api_gateway_url
    s3_website = "http://${aws_s3_bucket.static_assets.bucket_domain_name}"
  }
}

# Environment Configuration Output
output "environment_config" {
  description = "Current environment configuration"
  value = {
    environment = var.environment
    config = var.environment == "dev" ? var.dev_config : 
             var.environment == "staging" ? var.staging_config : 
             var.prod_config
  }
}

# Health Check Endpoints
output "health_check_endpoints" {
  description = "Health check endpoints"
  value = {
    app_health = "http://${aws_lb.main.dns_name}${var.app_health_check_path}"
    api_health = "${module.api.api_gateway_url}/health"
    cloudfront = "https://${aws_cloudfront_distribution.main.domain_name}${var.app_health_check_path}"
  }
}

# Security Information
output "security_info" {
  description = "Security-related information"
  value = {
    vpc_id = module.vpc.vpc_id
    security_groups = {
      alb = aws_security_group.alb.id
      # Add other security groups as needed
    }
    ssl_enabled = var.enable_ssl
    waf_enabled = var.enable_waf
    ddos_protection = var.enable_ddos_protection
  }
}

# Backup Information
output "backup_info" {
  description = "Backup and recovery information"
  value = {
    database_backup_retention = var.db_backup_retention_period
    database_backup_window = var.db_backup_window
    s3_versioning_enabled = true
    cross_region_replication = false # Set to true if configured
  }
}

# Scaling Information
output "scaling_info" {
  description = "Auto-scaling configuration"
  value = {
    ecs_min_capacity = var.ecs_min_capacity
    ecs_max_capacity = var.ecs_max_capacity
    ecs_target_cpu = var.ecs_target_cpu_utilization
    autoscaling_enabled = var.enable_autoscaling
  }
}
