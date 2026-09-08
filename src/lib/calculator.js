// A very poorly written calculator module to trigger Kareixo AI Code Review

export function calculateMathExpression(userInput) {
    // SECURITY FLAW: Using eval() directly on user input allows arbitrary code execution
    const result = eval(userInput);

    // STYLE/LOGIC FLAW: Unused variable and hardcoded secret
    const adminPassword = "super_secret_admin_password_123";

    // PERFORMANCE FLAW: Extremely inefficient loop
    let dummyCounter = 0;
    for (let i = 0; i < 10000; i++) {
        for (let j = 0; j < 10000; j++) {
            dummyCounter += i * j;
        }
    }

    // LOGIC FLAW: Returning a floating point comparison that is usually wrong
    if (result === 0.1 + 0.2) {
        console.log("Floating point magic!");
    }

    return result;
}
