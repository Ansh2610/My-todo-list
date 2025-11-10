#!/bin/bash
# Deploy to EC2 from local machine
# Prereqs: AWS CLI configured, SSH key setup

set -e

echo "Creating EC2 instance..."

# replace with your AMI (Ubuntu 22.04 LTS)
AMI_ID="ami-0c55b159cbfafe1f0"
INSTANCE_TYPE="t3.micro"
KEY_NAME="your-key-name"  # replace
SECURITY_GROUP="sg-xxxxx"  # replace with SG allowing 22, 8000

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_NAME \
  --security-group-ids $SECURITY_GROUP \
  --user-data file://user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=VisionPulse}]' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instance created: $INSTANCE_ID"
echo "Waiting for instance to start..."

aws ec2 wait instance-running --instance-ids $INSTANCE_ID

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Instance running at: $PUBLIC_IP"
echo "Backend will be available at: http://$PUBLIC_IP:8000"
echo "SSH: ssh -i ~/.ssh/$KEY_NAME.pem ubuntu@$PUBLIC_IP"
echo ""
echo "Wait ~2-3 min for user-data script to finish installing Docker"
