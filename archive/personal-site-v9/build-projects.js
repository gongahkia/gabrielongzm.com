import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_DIR = './public/data';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'projects.json');

async function fetchGitHubProjects() {
    if (!GITHUB_TOKEN) {
        throw new Error('GITHUB_TOKEN environment variable is required');
    }

    const username = 'frostplexx';

    const query = `
        query {
            user(login: "${username}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            url
                            updatedAt
                            createdAt
                            primaryLanguage {
                                name
                                color
                            }
                            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                                nodes {
                                    name
                                    color
                                }
                            }
                            repositoryTopics(first: 10) {
                                nodes {
                                    topic {
                                        name
                                    }
                                }
                            }
                            isArchived
                            stargazerCount
                            forkCount
                        }
                    }
                }
            }
        }
    `;

    console.log('Fetching GitHub projects...');
    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'dinama-web-portfolio'
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const repos = data.data.user.pinnedItems.nodes;

    // Transform the data
    const projects = repos.map(repo => {
        let status = 'ACTIVE';
        if (repo.isArchived) {
            status = 'ARCHIVED';
        } else {
            const lastUpdate = new Date(repo.updatedAt);
            const now = new Date();
            const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

            if (daysSinceUpdate > 90) {
                status = 'MAINTENANCE';
            }
        }

        const languages = repo.languages.nodes.map(lang => lang.name);
        const topics = repo.repositoryTopics.nodes.map(topic => topic.topic.name);
        const techStack = [...languages, ...topics].slice(0, 4);

        return {
            name: repo.name,
            url: repo.url,
            description: repo.description || 'No description available',
            updatedAt: repo.updatedAt,
            createdAt: repo.createdAt,
            status: status,
            techStack: techStack,
            primaryLanguage: repo.primaryLanguage,
            stars: repo.stargazerCount,
            forks: repo.forkCount
        };
    });

    // Sort by update date (most recent first)
    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return {
        success: true,
        projects: projects,
        lastFetched: new Date().toISOString(),
        buildTime: true
    };
}

async function main() {
    try {
        // Ensure output directory exists
        if (!existsSync(OUTPUT_DIR)) {
            await mkdir(OUTPUT_DIR, { recursive: true });
        }

        // Fetch projects data
        const projectsData = await fetchGitHubProjects();

        // Write to file
        await writeFile(OUTPUT_FILE, JSON.stringify(projectsData, null, 2));

        console.log(`✅ Projects data written to ${OUTPUT_FILE}`);
        console.log(`📊 Found ${projectsData.projects.length} projects`);
        
        // Log project names for verification
        console.log('Projects:', projectsData.projects.map(p => p.name).join(', '));

    } catch (error) {
        console.error('❌ Failed to fetch GitHub projects:', error.message);
        
        // Create a fallback file with error info
        const fallbackData = {
            success: false,
            error: error.message,
            projects: [],
            lastFetched: new Date().toISOString(),
            buildTime: true
        };

        await writeFile(OUTPUT_FILE, JSON.stringify(fallbackData, null, 2));
        
        // Don't exit with error code to prevent build failure
        // Let the frontend handle the error gracefully
        console.log('📝 Created fallback projects file');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
