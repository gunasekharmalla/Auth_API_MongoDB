async function seed(worker) {

  const requests = [];

  for (let i = 1; i <= 10000; i++) {

    requests.push(
      registerUser(i, worker)
    );

  }

  return Promise.all(requests);
}


async function testing() {

  console.time("20K concurrent");

  const results = await Promise.all([
    seed(1),
    seed(2)
  ]);

  console.timeEnd("20K concurrent");
}

testing();