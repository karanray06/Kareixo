async function main() {
  try {
    const res = await fetch("http://localhost:3000/api/codechat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hello world" }],
        provider: "NVIDIA_NIM_KIMI"
      })
    });

    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));

    const reader = res.body?.getReader();
    if (!reader) {
      console.log("No response body.");
      return;
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value));
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

main();
