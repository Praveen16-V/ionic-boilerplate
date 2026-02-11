# Terraform Infrastructure for Ionic Boilerplate

This directory contains Terraform configuration for deploying the Ionic Boilerplate application to AWS with production-ready infrastructure.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [Node.js](https://nodejs.org/) for building the application

## Quick Start

1. **Clone and navigate to the terraform directory:**
   ```bash
   cd terraform
   ```

2. **Copy the example terraform.tfvars:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. **Edit terraform.tfvars with your configuration:**
   ```bash
   # Required variables
   project_name = "ionic-boilerplate"
   environment = "dev"
   domain_name = "yourapp.com"
   
   # Database configuration
   db_password = "your-secure-password"
   
   # Email for alerts
   alert_email = "alerts@yourapp.com"
   ```

4. **Initialize Terraform:**
   ```bash
   terraform init
   ```

5. **Plan the deployment:**
   ```bash
   terraform plan -var-file=terraform.tfvars
   ```

6. **Apply the configuration:**
   ```bash
   terraform apply -var-file=terraform.tfvars
   ```

## Architecture Overview

The infrastructure includes:

### Core Components
- **VPC**: Isolated network with public and private subnets
- **Application Load Balancer**: Load balancing for the application
- **ECS Cluster**: Container orchestration for the application
- **RDS Database**: PostgreSQL database for data persistence
- **ElastiCache Redis**: Caching layer
- **S3**: Static asset storage
- **CloudFront**: CDN for static assets

### Security & Monitoring
- **Security Groups**: Network access control
- **IAM Roles**: Least-privilege access
- **CloudWatch**: Logging and monitoring
- **SNS**: Alert notifications
- **VPC Flow Logs**: Network traffic logging

### DNS & CDN
- **Route 53**: DNS management (optional)
- **Cloudflare**: DNS and CDN (optional)
- **SSL/TLS**: HTTPS encryption

## Directory Structure

```
terraform/
├── main.tf                 # Main infrastructure configuration
├── variables.tf            # Variable definitions
├── outputs.tf              # Output definitions
├── terraform.tfvars.example # Example variables file
├── README.md               # This file
└── modules/               # Reusable modules
    ├── vpc/              # VPC and networking
    ├── api/              # API Gateway and Lambda
    ├── database/         # RDS database
    ├── redis/            # ElastiCache Redis
    └── ecs/             # ECS cluster and services
```

## Environment Configuration

### Development
```bash
terraform apply \
  -var-file=terraform.tfvars \
  -var="environment=dev" \
  -var="db_instance_class=db.t3.micro" \
  -var="ecs_desired_count=1"
```

### Staging
```bash
terraform apply \
  -var-file=terraform.tfvars \
  -var="environment=staging" \
  -var="db_instance_class=db.t3.small" \
  -var="ecs_desired_count=2"
```

### Production
```bash
terraform apply \
  -var-file=terraform.tfvars \
  -var="environment=prod" \
  -var="db_instance_class=db.t3.medium" \
  -var="ecs_desired_count=3"
```

## Key Variables

### Required
- `project_name`: Name of your project
- `environment`: Environment (dev/staging/prod)
- `domain_name`: Your domain name
- `db_password`: Database password
- `alert_email`: Email for alerts

### Optional
- `aws_region`: AWS region (default: us-east-1)
- `enable_ssl`: Enable HTTPS (default: true)
- `enable_database`: Enable RDS (default: true)
- `enable_redis`: Enable Redis (default: true)
- `monthly_budget_amount`: Budget monitoring (default: $100)

## Deployment Workflow

### 1. Infrastructure Setup
```bash
# Initialize and apply infrastructure
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### 2. Application Deployment
```bash
# Build the application
npm run build

# Deploy to S3 (static assets)
aws s3 sync dist/ s3://$(terraform output -raw s3_bucket_name)

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### 3. Container Deployment (if using ECS)
```bash
# Build Docker image
docker build -t ionic-boilerplate:latest .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(terraform output -raw ecr_repository_url)
docker tag ionic-boilerplate:latest $(terraform output -raw ecr_repository_url):latest
docker push $(terraform output -raw ecr_repository_url):latest

# Update ECS service
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_id) --service $(terraform output -raw ecs_service_name)
```

## Monitoring and Maintenance

### View Logs
```bash
# Application logs
aws logs tail /ecs/ionic-boilerplate-dev --follow

# VPC flow logs
aws logs tail /aws/vpc/flow-logs/ionic-boilerplate-dev --follow
```

### Health Checks
```bash
# Application health
curl http://$(terraform output -raw alb_dns_name)/health

# API health
curl $(terraform output -raw api_gateway_url)/health
```

### Scaling
```bash
# Update ECS service count
aws ecs update-service \
  --cluster $(terraform output -raw ecs_cluster_id) \
  --service $(terraform output -raw ecs_service_name) \
  --desired-count 5
```

## Cost Management

### Budget Monitoring
- CloudWatch budgets are automatically created
- Alert emails sent when thresholds exceeded
- Use AWS Cost Explorer for detailed analysis

### Cost Optimization Tips
1. Use appropriate instance sizes
2. Enable auto-scaling
3. Use Spot Instances for non-critical workloads
4. Regularly review unused resources
5. Enable S3 lifecycle policies

## Security Best Practices

1. **Network Security**
   - Use private subnets for databases
   - Implement security groups
   - Enable VPC Flow Logs

2. **Access Control**
   - Use IAM roles with least privilege
   - Rotate credentials regularly
   - Enable MFA for all users

3. **Data Protection**
   - Enable encryption at rest and in transit
   - Use SSL/TLS certificates
   - Regular backups

4. **Monitoring**
   - Enable CloudTrail logging
   - Set up security alerts
   - Regular security audits

## Troubleshooting

### Common Issues

1. **Terraform State Lock**
   ```bash
   terraform force-unlock LOCK_ID
   ```

2. **Resource Creation Failures**
   ```bash
   terraform plan -detailed-exitcode
   terraform apply -target=resource_type.resource_name
   ```

3. **Network Connectivity**
   - Check security group rules
   - Verify route tables
   - Check NACLs

### Getting Help

1. Check Terraform logs: `terraform show`
2. Check AWS CloudWatch logs
3. Review security group configurations
4. Verify IAM permissions

## Backup and Disaster Recovery

### Automated Backups
- RDS automated backups (7 days retention)
- S3 versioning enabled
- EBS snapshots (daily)

### Manual Backup
```bash
# Create RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier $(terraform output -raw database_instance_id) \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)

# Create AMI
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "backup-$(date +%Y%m%d)"
```

### Recovery
```bash
# Restore RDS from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier restored-instance \
  --db-snapshot-identifier manual-backup-20231201
```

## Cleanup

To destroy all resources:
```bash
terraform destroy -var-file=terraform.tfvars
```

⚠️ **Warning**: This will delete all infrastructure including databases and their data.

## Contributing

1. Make changes to Terraform files
2. Run `terraform fmt` to format code
3. Run `terraform validate` to validate syntax
4. Test in development environment first
5. Update documentation

## License

This infrastructure code is licensed under the same ISC license as the main project.
