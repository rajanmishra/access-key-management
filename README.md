# Access Key Management and Token Information Retrieval System

This guide provides steps to deploy and run the access-key-management and web3-token-information

Demo - https://www.loom.com/share/82fbe08b4fd64e519ead03a8cd47934f?sid=de26ffef-f5e7-42b7-84b1-2ed186e5a1ee

## Prerequisites
 -- Node.js installed (version 18.x or higher)

 -- Docker



Getting Started


1. Clone the repository:

    ```
    git clone https://github.com/rajanmishra/access-key-management.git
    cd access-key-management
    ```


2. You will find the following folders and file:

    ```
    access-key-management
    web3-token-information
    docker-compose.yml
    README.md
    ```


3. Check dependencies:

    ```
    docker --version
    ```


4. Deploy the services:

   ```
   docker-compose build
   docker-compose up
   ```


5. You will see the logs of mongoDB, redis, access-key-management and web3-token-information services

6. http://localhost:3100/documentation#/  - Admin Access Key Management Service
   http://localhost:3200/documentation#/  - Web3 Token Service

## Folder Structure
`src/:` Contains the Module, Services, Controller, Middleware, DTOs etc.



## Usage
After successful deployment, you can use the Admin service and Web3 Token service swagger to play around.



## Cleanup
To remove the deployed service and associated resources:

```docker-compose down --rmi all```



## Additional Notes
To run test cases - go to access-key-management or web3-token-information folder and run:

```
npm run test
```
