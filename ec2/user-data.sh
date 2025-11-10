#!/bin/bash
# EC2 user-data script for VisionPulse backend
# Launch: aws ec2 run-instances --image-id ami-xxxxx --instance-type t3.micro --user-data file://user-data.sh

set -e

# update system
apt-get update
apt-get upgrade -y

# install docker
apt-get install -y docker.io docker-compose git

# start docker
systemctl start docker
systemctl enable docker

# add ubuntu user to docker group
usermod -aG docker ubuntu

# clone repo (replace with your repo)
cd /home/ubuntu
git clone https://github.com/yourname/visionpulse.git
cd visionpulse

# pull & run backend only
cd backend
docker build -t visionpulse-backend .
docker run -d \
  -p 8000:8000 \
  -v /tmp/uploads:/tmp/uploads \
  --name visionpulse \
  --restart unless-stopped \
  visionpulse-backend

# setup firewall
ufw allow 22/tcp  # ssh
ufw allow 8000/tcp  # backend
ufw --force enable

# setup auto-updates (security patches)
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "VisionPulse backend deployed on port 8000"
