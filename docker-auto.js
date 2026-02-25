const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoUrl = "https://github.com/jamieliu325/hello-world-app.git";
const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");

// Function to run commands safely
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(`Command "${command} ${args.join(" ")}" exited with code ${code}`);
      } else {
        resolve();
      }
    });
  });
}

// Clone repo if backend/frontend don't exist
async function cloneRepo() {
  if (!fs.existsSync(backendDir) || !fs.existsSync(frontendDir)) {
    console.log("Cloning repo...");
    await runCommand("git", ["clone", repoUrl, "temp_repo"]);

    if (!fs.existsSync(backendDir)) fs.renameSync("temp_repo/backend", backendDir);
    if (!fs.existsSync(frontendDir)) fs.renameSync("temp_repo/frontend", frontendDir);

    // Remove temp_repo folder
    if (fs.existsSync("temp_repo")) fs.rmSync("temp_repo", { recursive: true, force: true });

    console.log("Repo cloned.");
  } else {
    console.log("Backend and frontend folders already exist. Skipping clone.");
  }
}

// Stop old containers
async function stopContainers() {
  console.log("Stopping old containers if any...");
  await runCommand("docker", ["rm", "-f", "backend-container"]).catch(() => {});
  await runCommand("docker", ["rm", "-f", "frontend-container"]).catch(() => {});
}

// Build Docker images
async function buildImages() {
  console.log("Building backend image...");
  await runCommand("docker", ["build", "-t", "backend-auto", "./backend"]);
  console.log("Building frontend image...");
  await runCommand("docker", ["build", "-t", "frontend-auto", "./frontend"]);
  console.log("Docker images built.");
}

// Run containers
async function runContainers() {
  console.log("Running backend container...");
  await runCommand("docker", ["run", "-d", "-p", "8000:8000", "--name", "backend-container", "backend-auto"]);
  console.log("Running frontend container...");
  await runCommand("docker", ["run", "-d", "-p", "3001:3000", "--name", "frontend-container", "frontend-auto"]);
  console.log("Backend: http://localhost:8000");
  console.log("Frontend: http://localhost:3001");
}

// Cleanup old images if needed
async function cleanup() {
  console.log("Cleaning up...");

  // Stop and remove containers
  await runCommand("docker", ["rm", "-f", "backend-container"]).catch(() => {});
  await runCommand("docker", ["rm", "-f", "frontend-container"]).catch(() => {});

  // Remove Docker images
  await runCommand("docker", ["rmi", "-f", "backend-auto"]).catch(() => {});
  await runCommand("docker", ["rmi", "-f", "frontend-auto"]).catch(() => {});

  // Remove temp_repo folder if it exists
  if (fs.existsSync("temp_repo")) {
    fs.rmSync("temp_repo", { recursive: true, force: true });
    console.log("Deleted temp_repo folder.");
  }

  // Remove backend folder if it exists
  if (fs.existsSync("backend")) {
    fs.rmSync("backend", { recursive: true, force: true });
    console.log("Deleted backend folder.");
  }

  // Remove frontend folder if it exists
  if (fs.existsSync("frontend")) {
    fs.rmSync("frontend", { recursive: true, force: true });
    console.log("Deleted frontend folder.");
  }

  console.log("Cleanup complete.");
}

// Main
async function main() {
  try {
    await cloneRepo();
    await stopContainers();
    await buildImages();
    await runContainers();
  } catch (err) {
    console.error(err);
  } finally {
    await cleanup();
  }
}

main();