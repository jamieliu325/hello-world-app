const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoUrl = "https://github.com/jamieliu325/Chat_App.git";
const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");

// Function to execute shell commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error}\n${stderr}`);
      } else {
        resolve(stdout);
      }
    });
    process.stdout.pipe(process.stdout);
    process.stderr.pipe(process.stderr);
  });
}

// Clone repo if directories don't exist
async function cloneRepo() {
  if (!fs.existsSync(backendDir) || !fs.existsSync(frontendDir)) {
    console.log("Cloning repo...");
    await runCommand(`git clone ${repoUrl} temp_repo`);
    // Move folders to backend/frontend if needed
    if (!fs.existsSync(backendDir)) fs.renameSync("temp_repo/backend", backendDir);
    if (!fs.existsSync(frontendDir)) fs.renameSync("temp_repo/frontend", frontendDir);
    // Remove temp folder
    fs.rmdirSync("temp_repo", { recursive: true });
    console.log("Repo cloned.");
  } else {
    console.log("Backend and frontend folders already exist. Skipping clone.");
  }
}

// Stop old containers
async function stopContainers() {
  console.log("Stopping old containers if any...");
  await runCommand("docker rm -f backend-container || true");
  await runCommand("docker rm -f frontend-container || true");
}

// Build Docker images
async function buildImages() {
  console.log("Building backend image...");
  await runCommand(`docker build -t backend-auto ./backend`);
  console.log("Building frontend image...");
  await runCommand(`docker build -t frontend-auto ./frontend`);
  console.log("Docker images built.");
}

// Run containers
async function runContainers() {
  console.log("Running backend container...");
  await runCommand("docker run -d -p 8000:8000 --name backend-container backend-auto");
  console.log("Running frontend container...");
  await runCommand("docker run -d -p 3000:3000 --name frontend-container frontend-auto");
  console.log("Backend: http://localhost:8000");
  console.log("Frontend: http://localhost:3000");
}

// Main function
async function main() {
  try {
    await cloneRepo();
    await stopContainers();
    await buildImages();
    await runContainers();
  } catch (err) {
    console.error(err);
  }
}

main();