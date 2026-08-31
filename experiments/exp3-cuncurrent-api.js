const TOTAL_REQUESTS = 10000;

const API_URL = "http://localhost:5000/register";

async function registerUser(i) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: `Experiment3 User ${i}`,
        email: `exp3_user_${i}@test.com`,
        password: "password123",
        role: "user"
      })
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}


async function experiment3() {

  console.log(`Starting ${TOTAL_REQUESTS} API requests...`);

  console.time("Total API time");

  const requests = [];

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    requests.push(registerUser(i));
  }

  const results = await Promise.all(requests);

  console.timeEnd("Total API time");

  const successful = results.filter(
    result => result.success
  ).length;

  const failed = results.length - successful;

  console.log("Total requests:", results.length);
  console.log("Successful:", successful);
  console.log("Failed:", failed);
}


experiment3();