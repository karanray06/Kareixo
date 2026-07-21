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
  // Pattern Scanner: uses static regex heuristics to catch common vulnerabilities before committing.
  const issues: SecurityIssue[] = [];
  const lines = diffOrCode.split('\n');

  lines.forEach((line, i) => {
    // Only check added lines if it's a diff
    if (diffOrCode.includes('\n+') && !line.startsWith('+')) return;
    
    const text = line.replace(/^\+/, '');

    // 1. Hardcoded Secrets
    if (/(api_?key|secret|token|password)\s*[:=]\s*["'][a-zA-Z0-9_\-=+]{10,}["']/i.test(text)) {
      issues.push({
        id: crypto.randomUUID(),
        category: "secret",
        message: "Potential hardcoded secret or API key detected.",
        line: i + 1,
      });
    }

    // 2. Unsafe eval/exec
    if (/(eval\(|new Function\(|child_process\.exec\(|child_process\.spawn\()/.test(text)) {
      issues.push({
        id: crypto.randomUUID(),
        category: "eval",
        message: "Unsafe dynamic code execution detected (eval/exec).",
        line: i + 1,
      });
    }

    // 3. XSS / Injection patterns
    if (/\.innerHTML\s*=|dangerouslySetInnerHTML/.test(text)) {
      issues.push({
        id: crypto.randomUUID(),
        category: "injection",
        message: "Direct DOM HTML injection detected, potential XSS vector.",
        line: i + 1,
      });
    }

    // 4. SQL Injection Patterns
    if (/(SELECT|UPDATE|INSERT|DELETE)\s+.*?\s+FROM\s+.*?(?:\+|`.*?\$|' \+)/i.test(text)) {
      issues.push({
        id: crypto.randomUUID(),
        category: "injection",
        message: "Potential SQL injection vector (string concatenation in query).",
        line: i + 1,
      });
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
}
