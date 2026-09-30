Event-Driven E-Commerce Microservices Platform



A scalable e-commerce backend built using TypeScript, NestJS, Apache Kafka, gRPC, GraphQL, PostgreSQL, Docker, and Turborepo.



The system follows a microservices architecture where services communicate through REST APIs, gRPC, and asynchronous Kafka events.



Overview



This project demonstrates an event-driven e-commerce architecture designed for scalability, reliability, and independent service deployment.



The platform includes separate services for users, products, orders, inventory, payments, notifications, search, and an API Gateway.



A transactional outbox pattern is implemented in the Order Service to reliably publish order events to Apache Kafka.



Technology Stack

Backend: TypeScript, NestJS

API: REST, GraphQL

Service Communication: gRPC

Event Streaming: Apache Kafka

Database: PostgreSQL

Caching / Messaging Support: Redis

Search: Elasticsearch

NoSQL: MongoDB

Containerization: Docker and Docker Compose

Build System: Turborepo

Package Manager: npm

Microservices

Service	Responsibility

API Gateway	Central entry point for client requests

User Service	User management and authentication

Product Service	Product management

Order Service	Order creation and event publishing

Inventory Service	Inventory operations

Payment Service	Payment processing

Notification Service	Event-based notifications

Search Service	Product search functionality

Key Features

Event-Driven Architecture



Apache Kafka is used for asynchronous communication between services.



Example event:



ORDER\_CREATED

&#x20;     ↓

Order Service

&#x20;     ↓

Transactional Outbox

&#x20;     ↓

Apache Kafka

&#x20;     ↓

Other Event Consumers

Transactional Outbox



The Order Service stores the order and its corresponding event in PostgreSQL within the same database transaction.



The outbox publisher periodically checks for unpublished events and publishes them to Kafka.



This helps prevent a situation where an order is successfully stored but its corresponding event is lost.



Outbox records contain:



Event ID

Topic

Event type

Payload

Published status

Retry count

Creation timestamp

Publication timestamp

Last error

gRPC Communication



gRPC is used for service-to-service communication where low-overhead internal APIs are required.



GraphQL API



The API Gateway exposes a GraphQL endpoint:



POST /graphql



Example query:



query {

&#x20; products(page: 1, limit: 10) {

&#x20;   route

&#x20;   message

&#x20;   page

&#x20;   limit

&#x20; }

}

PostgreSQL



PostgreSQL stores order and outbox data for the Order Service.



Docker Support



Docker Compose configuration is included for running the microservices infrastructure with PostgreSQL, Kafka, Redis, MongoDB, and Elasticsearch.



Project Structure

nestjs-ecommerce-microservices/

│

├── apps/

│   ├── api-gateway/

│   ├── user-service/

│   ├── product-service/

│   ├── order-service/

│   ├── inventory-service/

│   ├── payment-service/

│   ├── notification-service/

│   └── search-service/

│

├── libs/

│   └── events/

│

├── docker/

├── docker-compose.yml

├── docker-compose.prod.yml

├── package.json

├── turbo.json

└── tsconfig.base.json

Order Service Flow

Client

&#x20; |

&#x20; v

POST /orders

&#x20; |

&#x20; v

Order Service

&#x20; |

&#x20; +-------------------+

&#x20; | PostgreSQL        |

&#x20; |                   |

&#x20; |  orders           |

&#x20; |  outbox\_events    |

&#x20; +-------------------+

&#x20;          |

&#x20;          v

&#x20;  Outbox Publisher

&#x20;          |

&#x20;          v

&#x20;     Apache Kafka

&#x20;          |

&#x20;          v

&#x20;  Event Consumers

Local Development

Requirements

Node.js

npm

Java is not required for this project

PostgreSQL

Apache Kafka

Docker (for the containerized setup)

Install Dependencies

npm install

Build the Project

npm run build

Run the Order Service

npm run dev --workspace=@app/order-service



The Order Service runs on:



http://localhost:3003

Health Check

curl http://localhost:3003/health



Example response:



{

&#x20; "service": "order-service",

&#x20; "status": "ok",

&#x20; "timestamp": "2026-09-30T06:55:42.349Z"

}

Create an Order

curl -X POST "http://localhost:3003/orders" \\

\-H "Content-Type: application/json" \\

\-d "{\\"userId\\":\\"user-202\\",\\"productId\\":\\"product-202\\",\\"quantity\\":3}"



Example response:



{

&#x20; "orderId": "generated-uuid",

&#x20; "status": "CREATED",

&#x20; "message": "Order created and event stored in the transactional outbox"

}

Verification



The implemented Order Service was tested locally with:



PostgreSQL running on port 5432

Apache Kafka running on port 9092

order.created Kafka topic

Successful order creation

Successful order persistence in PostgreSQL

Successful outbox event creation

Successful Kafka event publication

Successful project build

Future Improvements

Add more GraphQL resolvers backed directly by service data

Add additional transactional business workflows

Add Kafka consumer observability

Add automated integration tests

Add CI/CD pipeline

Deploy services to a cloud environment

Author



Soujanya Tirki



B.E. Computer Science and Engineering

