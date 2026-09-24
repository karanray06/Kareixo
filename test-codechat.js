async function test() {
  const res = await fetch("http://localhost:3000/api/codechat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "hoo" }],
      provider: "nvidia-kimi",
      branch: "main",
      repoFullName: "karanray06/GDG_JISU"
    })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}
test();
