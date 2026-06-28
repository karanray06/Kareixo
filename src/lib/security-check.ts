export interface SecurityIssue {
  id: string;
  category: "secret" | "injection" | "validation" | "eval";
  message: string;
  line?: number;
}

export interface SecurityResult {
  passed: boolean;
  issues: SecurityIssue[];
}

export async function checkSecurity(diffOrCode: string): Promise<SecurityResult> {
  // In a real implementation, this would call a secondary LLM (e.g. Llama 3 8B)
  // specifically prompted to act as a security scanner, or use a static analysis tool.
  // For the V1 demo, we simulate the check with simple regex heuristics.

  const issues: SecurityIssue[] = [];
  const lines = diffOrCode.split('\n');

  lines.forEach((line, i) => {
    // Only check added lines if it's a diff
    if (diffOrCode.includes('\n+') && !line.startsWith('+')) return;
    
    const text = line.replace(/^\+/, '');

    // 1. Hardcoded Secrets
    if (/(api_?key|secret|token|password)\s*[:=]\s*["'][a-zA-Z0-9_-]{10,}["']/i.test(text)) {
      issues.push({
        id: `sec-${Date.now()}-1`,
        category: "secret",
        message: "Potential hardcoded secret or API key detected.",
        line: i + 1,
      });
    }

    // 2. Unsafe eval/exec
    if (/(eval\(|new Function\(|child_process\.exec\()/.test(text)) {
      issues.push({
        id: `sec-${Date.now()}-2`,
        category: "eval",
        message: "Unsafe dynamic code execution detected (eval/exec).",
        line: i + 1,
      });
    }

    // 3. XSS / Injection patterns
    if (/\.innerHTML\s*=|dangerouslySetInnerHTML/.test(text)) {
      issues.push({
        id: `sec-${Date.now()}-3`,
        category: "injection",
        message: "Direct DOM HTML injection detected, potential XSS vector.",
        line: i + 1,
      });
    }
  });

  // Simulate network delay for the LLM call
  await new Promise(r => setTimeout(r, 1200));

  return {
    passed: issues.length === 0,
    issues,
  };
}
