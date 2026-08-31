const TOTAL_REQUESTS = 10000;

const API_URL = "http://localhost:5000/register";


async function registerUser(i, worker) {

  try {

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: `Worker${worker} User ${i}`,
        email: `worker${worker}_user${i}@test.com`,
        password: "password123",
        role: "user"
      })
    });

    await response.text();

    return response.ok;

  } catch (error) {

    console.error(
      `Worker ${worker}, User ${i}:`,
      error.message
    );

    return false;
  }
}


async function seed(worker) {

  let successful = 0;
  let failed = 0;

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {

    const success = await registerUser(i, worker);

    if (success) {
      successful++;
    } else {
      failed++;
    }

  }

  return {
    worker,
    successful,
    failed
  };
}


async function testing() {

  console.log("Starting two workers...");

  console.time("Two worker total time");

  const results = await Promise.all([
    seed(1),
    seed(2)
  ]);

  console.timeEnd("Two worker total time");

  console.log(results);
}


testing();