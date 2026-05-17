const baseUrl = process.env.API_URL || "http://localhost:5000";

const run = async () => {
  const health = await fetch(`${baseUrl}/health`);
  if (!health.ok) throw new Error("Backend health failed");

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@qotd.local", password: "Admin123!" })
  });
  if (!login.ok) throw new Error(`Login failed: ${login.status}`);
  const loginData = await login.json();

  const today = await fetch(`${baseUrl}/api/questions/today`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  if (!today.ok) throw new Error(`Today question failed: ${today.status}`);
  const todayData = await today.json();
  if (!("question" in todayData)) throw new Error("Today question response shape is invalid");

  const next = await fetch(`${baseUrl}/api/recommendations/next`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  if (!next.ok) throw new Error(`Recommendation failed: ${next.status}`);
  const nextData = await next.json();
  if (!("question" in nextData)) throw new Error("Recommendation response shape is invalid");

  console.log("Backend smoke test passed");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
