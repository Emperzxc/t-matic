import "./load-env";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function splitSqlStatements(schema: string) {
  const statements: string[] = [];
  let current = "";
  let dollarQuote: string | null = null;

  for (let index = 0; index < schema.length; index += 1) {
    const char = schema[index];
    const rest = schema.slice(index);
    const dollarMatch = rest.match(/^\$[a-zA-Z0-9_]*\$/);

    if (dollarMatch) {
      const tag = dollarMatch[0];
      current += tag;
      index += tag.length - 1;
      dollarQuote = dollarQuote === tag ? null : dollarQuote ?? tag;
      continue;
    }

    if (char === ";" && !dollarQuote) {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  const sql = neon(process.env.DATABASE_URL);
  const schema = fs.readFileSync(path.join(process.cwd(), "db/schema.sql"), "utf8");
  const statements = splitSqlStatements(schema);

  for (const statement of statements) {
    await sql(statement, []);
  }

  console.log(`Database migration complete. Executed ${statements.length} statements.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
