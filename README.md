# LEISA (Livestock Event Information Sharing Architecture)

![image](https://github.com/mahirgamal/LEISA/assets/86919381/026666f4-d3c0-4b21-a823-ee2c0e6461bd)


## Overview

The `LEISA` project (Livestock Event Information Sharing Architecture) is an architecture framework designed to standardize and facilitate the exchange of livestock event information among various stakeholders in the livestock industry. LEISA provides a structured approach to data sharing, ensuring interoperability, data integrity, and secure communication across different systems and platforms. This architecture is crucial for enabling efficient and effective data-driven decision-making in the livestock industry.

## Key Features

- **Data Interoperability**: Facilitates seamless data exchange among various stakeholders, including farmers, veterinarians, researchers, and regulatory bodies.
- **Scalability**: Designed to handle large volumes of data and support the growing needs of the livestock industry.
- **Integration Support**: Easily integrates with existing systems, tools, and platforms, providing flexibility and adaptability.
-  **Real-Time Data Sharing**: Facilitates immediate sharing and dissemination of livestock event information, enabling stakeholders to make timely decisions.
- **Data Standardisation and Validation**: Implements robust mechanisms to ensure data consistency and integrity, enhancing interoperability across different systems.
- **Producer Control**: Allows data producers to manage how their data is shared, ensuring ownership and privacy.
- **Decoupling Producers and Consumers**: Supports independent operation and evolution of data producers and consumers, promoting scalability and flexibility.
- **Secure Communication**: Utilizes advanced security protocols to ensure that data sharing is authorized and protected.

  
![data sharing architecture](https://github.com/user-attachments/assets/5caa46ac-8428-4577-a0be-49f01ac12520)

## Architecture
LEISA is structured around a cloud-based microservice architecture, leveraging RESTful APIs and message brokers to enable scalable and efficient data exchange. The architecture is divided into several key layers:

![LEISA layers (1)](https://github.com/user-attachments/assets/27c800c0-03e2-4bf4-aa2a-935471b0f7bf)


### 1. Registration Layer

- **Function**: Handles the onboarding and registration of external services (producers and consumers), managing credentials and ensuring secure communication.

### 2. Mapping Layer

- **Function**: Maps specific livestock events to consumer queues, ensuring that messages are directed to the appropriate stakeholders based on predefined criteria.

### 3. Operations Layer

- **Function**: Executes core functionalities such as message publishing, consumption, and validation, ensuring accurate data processing and flow.

### 4. Service Repository Layer

- **Function**: Manages the storage of service-related information and queue mappings, supporting efficient data access and retrieval.

### 5. Middleware Layer

- **Function**: Acts as the communication backbone, handling asynchronous message routing between producers and consumers using message brokers.

## Microservices Overview

The LEISA architecture is implemented using a set of microservices, each designed to handle specific functionalities related to livestock event information sharing. Below is an overview of the current microservices deployed as part of the LEISA architecture:

| No. | Microservice Name            |  GitHub Link                                                                               |
|-----|------------------------------|--------------------------------------------------------------------------------------------|
| 1   | ServiceRegistrationMicroservice  | [GitHub](https://github.com/mahirgamal/ServiceRegistrationMicroservice)                |
| 2   | DeleteServiceMicroservice        |  [GitHub](https://github.com/mahirgamal/ServiceDeleteMicroservice)                     |
| 3   | FindServiceMicroservice          |  [GitHub](https://github.com/mahirgamal/ServiceSearchMicroservice)                     |
| 4   | ListAllServicesMicroservice      |  [GitHub](https://github.com/mahirgamal/ServiceListAllMicroservice)                    |
| 5   | ListServiceMicroservice          |  [GitHub](https://github.com/mahirgamal/ServiceListMicroservice)                       |
| 6   | MessageValidatorMicroservice     |  [GitHub](https://github.com/mahirgamal/MessageValidatorMicroservice)                  |
| 7   | PublishMessageMicroservice       |  [GitHub](https://github.com/mahirgamal/PublishMessageMicroservice)                    |
| 8   | ServiceLoginMicroservice         |  [GitHub](https://github.com/mahirgamal/ServiceLoginMicroservice)                      |
| 9   | UpdateServiceMicroservice        |  [GitHub](https://github.com/mahirgamal/ServiceUpdateMicroservice)                     |
| 10  | SetQueueMappingMicroservice      |  [GitHub](https://github.com/mahirgamal/SetQueneMappingMicroservice)                   |
| 11  | GetQueueMappingMicroservice      |  [GitHub](https://github.com/mahirgamal/GetQueneMappingMicroservice)                   |
| 12  | UpdateQueueMappingMicroservice   | [GitHub](https://github.com/mahirgamal/UpdateQueneMappingMicroservice)                 |
| 13  | DeleteQueueMappingMicroservice   | [GitHub](https://github.com/mahirgamal/DeleteQueneMappingMicroservice)                 |
| 14  | ConsumeMessageAPI                |  [GitHub](https://github.com/mahirgamal/consume_message_API)                           |

Each microservice is designed to perform specific tasks within the LEISA ecosystem, ensuring modularity and scalability. They are all deployed in the Australia East region using Azure Function Apps with a dynamic pricing tier, except for the `ConsumeMessageAPI` which uses a free tier.



  ## Requirements

- **Java 8** or higher
- **Maven** for building Java components
- **MySQL** for data storage and management
- **RabbitMQ** for message brokering
- **Azure Functions** for serverless deployments

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Acknowledgments

This work originates from the Trakka project and builds on the existing TerraCipher Trakka implementation. We appreciate the support and resources provided by the Trakka project team. Special thanks to Dave Swain and Will Swain from TerraCipher for their guidance and assistance throughout this project.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/mahirgamal/LEISA/blob/main/LICENSE) file for details.

## Contact

If you have any questions, suggestions, or need assistance, please don't hesitate to contact us at [mhabib@csu.edu.au](mailto:mhabib@csu.edu.au) or [akabir@csu.edu.au](mailto:akabir@csu.edu.au).
