import { defineConfig } from 'vite'
import { resolve } from 'path'
import { globSync } from 'glob'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'

/**
 * Auto-discover projects by scanning for project.json files
 * Returns an object mapping project slugs to their index.html paths
 */
function discoverProjects(): Record<string, string> {
  const projectConfigs = globSync('projects/*/project.json', {
    ignore: ['projects/_templates/**'],
  })

  return projectConfigs.reduce(
    (acc, configPath) => {
      const dir = configPath.replace('/project.json', '')
      const indexPath = resolve(__dirname, dir, 'index.html')

      // Only include if index.html exists
      if (fs.existsSync(indexPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        acc[`project-${config.slug}`] = indexPath
      }

      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * Auto-discover public static files
 */
function discoverPublicFiles(): Record<string, string> {
  const publicFiles = globSync('public/*.html')

  return publicFiles.reduce(
    (acc, filePath) => {
      const name = filePath.replace('public/', '').replace('.html', '')
      acc[`public-${name}`] = resolve(__dirname, filePath)
      return acc
    },
    {} as Record<string, string>
  )
}

// Vite configuration for multi-page static site
export default defineConfig({
  plugins: [tailwindcss()],

  resolve: {
    alias: {
      // Resolve frappe-gantt CSS since package exports don't include the path
      'frappe-gantt/dist/frappe-gantt.css': resolve(
        __dirname,
        'node_modules/frappe-gantt/dist/frappe-gantt.css'
      ),
    },
  },

  build: {
    rollupOptions: {
      input: {
        // Main entry point
        main: resolve(__dirname, 'index.html'),

        // Projects listing page
        projectsIndex: resolve(__dirname, 'projects/index.html'),

        // Auto-discovered public files
        ...discoverPublicFiles(),

        // Auto-discovered projects
        ...discoverProjects(),
      },
    },
  },
})
