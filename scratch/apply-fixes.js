const fs = require('fs');
const file = 'src/app/api/codechat/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\r\n/g, '\n');

const promptOld = `RULES — follow these strictly:
1. When the user asks about a file, the codebase, or repository structure, IMMEDIATELY call the appropriate tool (readFile or listDirectory). Do NOT guess or fabricate file contents.
2. After receiving tool results, you MUST provide a thorough text response. Quote key code sections, explain what you found, and directly answer the user's question. NEVER stop after just calling a tool — always follow up with analysis.
3. Every file change results in a pull request. After creating one, always reply with the PR URL and a one-line summary of what changed — never claim a change was made without that URL attached, and never claim you lack file access when tools are present in your context.
4. Keep responses focused and technical. Use code blocks with language tags for any code you show.
5. You have a budget of up to 20 internal steps. If you are examining a folder or fixing multiple issues, use tools heavily and batch actions or prioritize appropriately rather than running out of steps silently.
6. When you need to read a file or list a directory, you MUST use the provided native tools. NEVER output tool calls as markdown code blocks (e.g., no \\\`\\\`\\\`bash listDirectory\\\`\\\`\\\`).\`;
    }`;

const promptNew = `RULES — follow these strictly:
1. When the user asks about a file, the codebase, or repository structure, IMMEDIATELY call the appropriate tool (readFile or listDirectory). Do NOT guess or fabricate file contents.
2. After receiving tool results, you MUST provide a thorough text response. Quote key code sections, explain what you found, and directly answer the user's question. NEVER stop after just calling a tool — always follow up with analysis.
3. Every file change results in a pull request. After creating one, always reply with the PR URL and a one-line summary of what changed — never claim a change was made without that URL attached, and never claim you lack file access when tools are present in your context.
4. Keep responses focused and technical. Use code blocks with language tags for any code you show.
5. You have a budget of up to 20 internal steps. If you are examining a folder or fixing multiple issues, use tools heavily and batch actions or prioritize appropriately rather than running out of steps silently.
6. When you need to read a file or list a directory, you MUST use the provided native tools. NEVER output tool calls as markdown code blocks (e.g., no \\\`\\\`\\\`bash listDirectory\\\`\\\`\\\`). DO NOT attempt to call or invent any tool names that are not explicitly provided to you (e.g., do not call 'checkRepo', 'gitStatus', etc). If you lack a tool for a task, inform the user directly.\`;
    }`;

if (content.includes(promptOld)) {
  content = content.replace(promptOld, promptNew);
  console.log("Replaced promptOld");
} else {
  console.log("Could not find promptOld");
}

fs.writeFileSync(file, content);
