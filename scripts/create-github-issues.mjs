import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import yaml from "js-yaml";

dotenv.config();

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
};

const backlog = yaml.load(fs.readFileSync("docs/backlog.yaml", "utf8"));

async function getExistingIssues() {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`;

  const res = await axios.get(url, { headers });

  return res.data.map((issue) => issue.title);
}

async function getOrCreateMilestone(name) {
  const url = `https://api.github.com/repos/${owner}/${repo}/milestones`;

  const res = await axios.get(url, { headers });

  const existing = res.data.find((m) => m.title === name);

  if (existing) return existing.number;

  const created = await axios.post(
    url,
    { title: name },
    { headers }
  );

  console.log(`Milestone creado: ${name}`);

  return created.data.number;
}

function buildBody(epic, issue) {
  const implementation = (issue.implementation || [])
    .map((i) => `- ${i}`)
    .join("\n");

  const acceptance = (issue.acceptance || [])
    .map((i) => `- [ ] ${i}`)
    .join("\n");

  return `## Contexto
Epic: **${epic.key} - ${epic.title}**

## Objetivo
${issue.objective}

## Cómo hacerlo
${implementation}

## Criterios de aceptación
${acceptance}
`;
}

async function createIssue(title, body, labels, milestone) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

  await axios.post(
    url,
    {
      title,
      body,
      labels,
      milestone,
    },
    { headers }
  );

  console.log(`Issue creada: ${title}`);
}

async function run() {
  const existingIssues = await getExistingIssues();

  for (const epic of backlog.epics) {
    const milestoneNumber = await getOrCreateMilestone(epic.milestone);

    for (const issue of epic.issues) {
      if (existingIssues.includes(issue.title)) {
        console.log(`Issue ya existe: ${issue.title}`);
        continue;
      }

      const body = buildBody(epic, issue);

      const labels = [...(epic.labels || [])];

      await createIssue(issue.title, body, labels, milestoneNumber);
    }
  }
}

run();