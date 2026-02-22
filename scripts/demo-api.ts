async function runDemo() {
    console.log("==========================================");
    console.log("🚀 LogicSnap API Integration Demo 🚀");
    console.log("==========================================");

    // 1. GENERATE RULE API
    const prompt = "Apply a weekend discount of 30% off upto 120, and flag any anomalous transaction surges.";
    console.log(`\n[Input 1] Marketing Team Prompt: "${prompt}"`);
    console.log("[Process] Calling POST /api/generate (LLM + Zod Validation)...");

    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log("\n✅ [Output 1] Zod-Validated JSON Schema Result:");
        console.log(JSON.stringify(data.schema, null, 2));

        console.log("\n==========================================");

    } catch (e: any) {
        console.error("Failed to call API:", e.message);
    }
}

runDemo();
