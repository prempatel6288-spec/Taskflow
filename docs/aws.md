# Optional AWS deployment path

This repository does **not** include a deployed AWS environment. The local version runs without credentials and uses SQLite for simple reproducibility.

For a production-minded deployment, a typical architecture is:

1. Build the Angular client and host its static files with an S3 bucket behind CloudFront.
2. Package the Express API for AWS App Runner, ECS Fargate, or Lambda/API Gateway.
3. Replace SQLite with an appropriately secured managed relational database such as Amazon RDS PostgreSQL.
4. Store configuration and secrets in an AWS-managed secure store; never commit them to the repository.
5. Add authentication, authorization, encrypted connections, backups, monitoring, least-privilege IAM, and cost controls before using real data.

These are architecture options, not claims that this demo has been deployed to AWS.

