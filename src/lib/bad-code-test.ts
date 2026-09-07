// This is a test file intentionally containing a SQL injection vulnerability
// It is used to verify that Kareixo Code Review successfully detects and comments on it.

export function authenticateUser(username: string, pass: string, db: any) {
  // Intentional SQL Injection flaw
  const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + pass + "'";
  
  const result = db.execute(sql);
  
  if (result.length > 0) {
      console.log("User logged in successfully: " + username);
      return true;
  }
  
  return false;
}
