#!/usr/bin/env node

/**
 * Interactive CLI for creating new projects
 * Usage: npm run create-project
 */

import { input, select, checkbox, confirm } from '@inquirer/prompts';
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const TEMPLATES_DIR = path.join(PROJECTS_DIR, '_templates');

// ANSI colors for output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

/**
 * Convert project name to URL-safe slug
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Load available templates from _templates directory
 */
async function loadTemplates() {
  const templates = [];
  const templateDirs = await fs.readdir(TEMPLATES_DIR);

  for (const dir of templateDirs) {
    const templatePath = path.join(TEMPLATES_DIR, dir, 'template.json');
    if (await fs.pathExists(templatePath)) {
      const config = await fs.readJson(templatePath);
      templates.push({
        name: dir,
        ...config,
      });
    }
  }

  return templates;
}

/**
 * Render EJS template with project data
 */
async function renderTemplate(templatePath, outputPath, data) {
  const template = await fs.readFile(templatePath, 'utf-8');
  const rendered = ejs.render(template, data, {
    filename: templatePath, // Enables includes
  });
  await fs.writeFile(outputPath, rendered);
}

/**
 * Main CLI flow
 */
async function main() {
  console.log('\n' + yellow('Create New Project') + '\n');

  // Load templates
  const templates = await loadTemplates();
  if (templates.length === 0) {
    console.error(red('No templates found in projects/_templates/'));
    process.exit(1);
  }

  // 1. Project name
  const name = await input({
    message: 'Project name:',
    validate: (value) => value.trim().length > 0 || 'Name is required',
  });

  // 2. Slug (auto-generated, editable)
  const defaultSlug = slugify(name);
  const slug = await input({
    message: 'Project slug:',
    default: defaultSlug,
    validate: (value) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Slug must be lowercase letters, numbers, and hyphens only';
      }
      const projectPath = path.join(PROJECTS_DIR, value);
      if (fs.existsSync(projectPath)) {
        return `Project "${value}" already exists`;
      }
      return true;
    },
  });

  // 3. Description (optional)
  const description = await input({
    message: 'Description (optional):',
  });

  // 4. Template selection
  const templateChoices = templates.map((t) => ({
    name: `${t.name} - ${t.description}`,
    value: t.name,
  }));

  const templateName = await select({
    message: 'Template:',
    choices: templateChoices,
  });

  const template = templates.find((t) => t.name === templateName);

  // 5. Feature selection (based on template)
  const featureChoices = Object.entries(template.features || {}).map(
    ([key, config]) => ({
      name: `${key} - ${config.description}`,
      value: key,
      checked: config.default,
    })
  );

  let features = {};
  if (featureChoices.length > 0) {
    const selectedFeatures = await checkbox({
      message: 'Enable features:',
      choices: featureChoices,
    });
    for (const key of Object.keys(template.features)) {
      features[key] = selectedFeatures.includes(key);
    }
  }

  // Confirm
  console.log('\n' + dim('─'.repeat(40)));
  console.log(`  Name:        ${name}`);
  console.log(`  Slug:        ${slug}`);
  console.log(`  Template:    ${templateName}`);
  console.log(`  Description: ${description || dim('(none)')}`);
  console.log(`  Features:    ${Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ') || dim('(none)')}`);
  console.log(dim('─'.repeat(40)) + '\n');

  const confirmed = await confirm({
    message: 'Create this project?',
    default: true,
  });

  if (!confirmed) {
    console.log(yellow('Cancelled.'));
    process.exit(0);
  }

  // Create project
  console.log('\nCreating project...');

  const projectPath = path.join(PROJECTS_DIR, slug);
  const templateDir = path.join(TEMPLATES_DIR, templateName);

  // Create project directory
  await fs.ensureDir(projectPath);
  console.log(green('✓') + ` Created ${dim(`projects/${slug}/`)}`);

  // Create project.json
  const projectConfig = {
    name,
    slug,
    description: description || undefined,
    template: templateName,
    created: new Date().toISOString().split('T')[0],
    features,
    customPage: false,
  };
  await fs.writeJson(path.join(projectPath, 'project.json'), projectConfig, {
    spaces: 2,
  });
  console.log(green('✓') + ' Created project.json');

  // Render index.html from template
  const templateHtml = path.join(templateDir, 'index.html.ejs');
  if (await fs.pathExists(templateHtml)) {
    await renderTemplate(templateHtml, path.join(projectPath, 'index.html'), {
      project: projectConfig,
      content: '', // Empty content for now
    });
    console.log(green('✓') + ' Created index.html from template');
  }

  // Create reference directory
  await fs.ensureDir(path.join(projectPath, 'reference'));
  console.log(green('✓') + ' Created reference/ directory');

  // Create src directory if template has one
  const templateSrc = path.join(templateDir, 'src');
  if (await fs.pathExists(templateSrc)) {
    await fs.copy(templateSrc, path.join(projectPath, 'src'));
    console.log(green('✓') + ' Created src/ directory');
  }

  // Success message
  console.log('\n' + green('Project created!') + '\n');
  console.log('Run ' + yellow('npm run dev') + ' and visit:');
  console.log(dim(`http://localhost:5173/projects/${slug}/`) + '\n');
}

main().catch((err) => {
  console.error(red('Error:'), err.message);
  process.exit(1);
});
