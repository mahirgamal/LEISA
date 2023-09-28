const axios = require('axios');

async function createUser() {
  const rabbitmqApiBaseUrl = 'http://127.0.0.1:15672/api'; // Update with your RabbitMQ server's URL
  const rabbitmqApiCredentials = {
    username: 'guest',
    password: 'guest',
  };

  const newUsername = 'my-user';
  const newPassword = 'my-password';

  try {
    // Create the user using PUT method
    const createUserResponse = await axios.put(
      `${rabbitmqApiBaseUrl}/users/${newUsername}`,
      {
        password: newPassword,
        tags: 'management',
      },
      {
        auth: rabbitmqApiCredentials,
      }
    );

    if (createUserResponse.status === 201) {
      console.log(`User ${newUsername} created successfully.`);
    } else {
      console.error(`Failed to create user ${newUsername}.`);
    }

    // Set permissions (replace with your desired permissions)
    const setPermissionsResponse = await axios.put(
      `${rabbitmqApiBaseUrl}/permissions/${encodeURIComponent('/')}/${newUsername}`,
      {
        configure: '.*',
        write: '.*',
        read: '.*',
      },
      {
        auth: rabbitmqApiCredentials,
      }
    );

    if (setPermissionsResponse.status === 201) {
      console.log(`Permissions set for user ${newUsername}.`);
    } else {
      console.error(`Failed to set permissions for user ${newUsername}`);
    }
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
  }
}

createUser();
