terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = "us-east-1"
}

/*resource "aws_s3_bucket" "my_bucket" {
  bucket = "krithika-terraform-bucket" 
}
*/

/*
resource "aws_s3_object" "my_object" {
  bucket = aws_s3_bucket.my_bucket.bucket
  key    = "hello.txt"
  source = "hello.txt"
}
*/

resource "aws_key_pair" "terraform-key" {
  key_name   = "terraform-key"
  public_key = file("terraform-key.pub")
}


resource "aws_instance" "my_vm" {
  ami           = "ami-0c7217cdde317cfec" 
  instance_type = "t3.micro"

  key_name      = aws_key_pair.terraform-key.key_name

  tags = {
    Name = "Terraform-VM"
  }
}
