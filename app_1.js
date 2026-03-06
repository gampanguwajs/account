// Bad - creates array on each iteration
for (let i = 0; i < users.length; i++) {
  await processUser(users[i]); // Sequential, slow
}

// Good - parallel processing with concurrency limit
async function processBatch(users, batchSize = 100) {
  const results = [];
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(user => processUser(user))
    );
    results.push(...batchResults);
  }
  
  return results;
}