import { execSync } from "child_process";

// Get the list of staged files
const stagedFiles = execSync("git diff --cached --name-only", {
  encoding: "utf-8",
});

if (!stagedFiles) {
  console.log("No files staged for commit.");
  process.exit(0);
}

// Determine what to test
const runFrontendTests = stagedFiles.includes("frontend/");

// Run tests based on changes
try {
  if (runFrontendTests) {
    console.log("Running frontend tests...");
    execSync("npm run test:unit:frontend", { stdio: "inherit" });
  } else {
    console.log("No relevant changes for tests. Skipping...");
  }
} catch (error) {
  console.error("Tests failed:", error.message);
  process.exit(1);
}
