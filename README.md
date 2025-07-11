# JavaScript Email Service Project

A resilient and fault-tolerant **Email Sending Service** built using **JavaScript**, integrating **Mailgun API** and **AWS SES SMTP**, with fallback, retry, and rate-limiting features.

---

##  Features

- **Primary Provider**: Mailgun API (`axios`)
- **Secondary Provider**: AWS SMTP using `nodemailer`
- Retry logic with exponential backoff
- Fallback to secondary provider if the first fails
- Circuit Breaker pattern to prevent repeated failures
- Idempotency to prevent duplicate email sends
- Basic rate limiting (e.g., 5 emails per minute)
- Status tracking for each email attempt
- Unit tests using Jest
- Simple console logging

---

## Tech Stack

| Feature            | Tool / Library       |
|--------------------|----------------------|
| Language           | JavaScript (Node.js) |
| HTTP Requests      | Axios (for Mailgun)  |
| SMTP Email Sending | Nodemailer (AWS SES) |
| Testing            | Jest                 |
| Logging            | Console              |
| Rate Limiting      | Custom utility       |
| Circuit Breaker    | Custom implementation|

---

## Folder Structure
email-service-js1/
├── src/

│   ├── index.js 

│   ├── services/

│   │   └── EmailService.js  

│   ├── providers/

│   │   ├── mailgunProvider.js  

│   │   └── awsProvider.js  

│   └── utils/

│       ├── RateLimiter.js     

│       ├── CircuitBreaker.js

│       └── Logger.js
├── tests/

│   └── EmailService.test.js       

├── .env     

├── .gitignore     

├── package.json

├── README.md




### Install Dependencies

npm install

### Start the Service

npm start

### Run Tests

npm test

### Assumptions
Mailgun and AWS SMTP credentials must be set via environment variables or config file.

This app uses mock logic unless connected to real providers.

No database is used; idempotency and tracking handled in memory.


