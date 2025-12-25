/**
 * Data Migration Script
 *
 * This script reads the old Joomla 3.x export files and creates new JSON files
 * with remapped IDs starting from 1.
 *
 * Input:
 * - data/vsgkugelberg_j3x_categories.json
 * - data/vsgkugelberg_j3x_content.json
 *
 * Output:
 * - categories.json (in project root)
 * - posts.json (in project root)
 */

import * as fs from 'fs'
import * as path from 'path'

// Types for the old Joomla data
interface OldCategory {
  id: number
  parent_id: number
  title: string
  alias: string
  description: string
}

interface OldContent {
  id: number
  asset_id: number
  title: string
  alias: string
  introtext: string
  fulltext: string
  state: number
  catid: number
  created: string
  created_by: number
  created_by_alias: string
  modified: string
  modified_by: number
  checked_out: number
  checked_out_time: string
  publish_up: string
  publish_down: string
  images: string
  urls: string
  attribs: string
  version: number
  ordering: number
  metakey: string
  metadesc: string
  access: number
  hits: number
  metadata: string
  featured: number
  language: string
  xreference: string
  note: string
}

// Types for the new migrated data
interface NewCategory {
  id: number
  parentId: number | null
  title: string
  slug: string
  description: string
  oldId: number // Keep reference to original ID for debugging
}

interface NewPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  categoryId: number | null
  state: 'draft' | 'published' | 'archived'
  featured: boolean
  hits: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  oldId: number // Keep reference to original ID for debugging
  oldCategoryId: number // Keep reference to original category ID for debugging
}

// Read JSON file
function readJsonFile<T>(filePath: string): T {
  const absolutePath = path.resolve(filePath)
  const content = fs.readFileSync(absolutePath, 'utf-8')
  return JSON.parse(content) as T
}

// Write JSON file
function writeJsonFile(filePath: string, data: unknown): void {
  const absolutePath = path.resolve(filePath)
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Written: ${absolutePath}`)
}

// Convert Joomla date to ISO string
function convertDate(dateStr: string): string | null {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') {
    return null
  }
  // Joomla dates are in format "YYYY-MM-DD HH:mm:ss"
  const date = new Date(dateStr.replace(' ', 'T') + 'Z')
  return date.toISOString()
}

// Map Joomla state to our state
function mapState(state: number): 'draft' | 'published' | 'archived' {
  switch (state) {
    case 1:
      return 'published'
    case 0:
      return 'draft'
    case 2:
      return 'archived'
    default:
      return 'draft'
  }
}

// Strip HTML tags for excerpt (basic implementation)
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&auml;/g, 'ä')
    .replace(/&szlig;/g, 'ß')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Auml;/g, 'Ä')
    .replace(/\s+/g, ' ')
    .trim()
}

// Create excerpt from content
function createExcerpt(content: string, maxLength: number = 200): string {
  const stripped = stripHtml(content)
  if (stripped.length <= maxLength) {
    return stripped
  }
  return stripped.substring(0, maxLength).trim() + '...'
}

function main(): void {
  console.log('Starting data migration...\n')

  // Define paths
  const dataDir = path.resolve(__dirname, '..', 'data')
  const outputDir = path.resolve(__dirname, '..')

  const categoriesInputPath = path.join(
    dataDir,
    'vsgkugelberg_j3x_categories.json'
  )
  const contentInputPath = path.join(dataDir, 'vsgkugelberg_j3x_content.json')
  const categoriesOutputPath = path.join(outputDir, 'categories.json')
  const postsOutputPath = path.join(outputDir, 'posts.json')

  // Read input files
  console.log('Reading input files...')
  const oldCategories = readJsonFile<OldCategory[]>(categoriesInputPath)
  const oldContent = readJsonFile<OldContent[]>(contentInputPath)

  console.log(`Found ${oldCategories.length} categories`)
  console.log(`Found ${oldContent.length} posts`)

  // Filter out ROOT category and categories with title "Uncategorised"
  const filteredCategories = oldCategories.filter(
    (cat) => cat.title !== 'ROOT' && cat.title !== 'Uncategorised'
  )

  console.log(
    `After filtering ROOT and Uncategorised: ${filteredCategories.length} categories`
  )

  // Create ID mapping: old ID -> new ID
  const categoryIdMap = new Map<number, number>()

  // Sort categories by ID to maintain some order, then assign new IDs starting from 1
  const sortedCategories = [...filteredCategories].sort((a, b) => a.id - b.id)

  sortedCategories.forEach((cat, index) => {
    categoryIdMap.set(cat.id, index + 1)
  })

  // Also map the ROOT (id=1) and Uncategorised IDs to null (they become orphan categories)
  const uncategorisedIds = oldCategories
    .filter((cat) => cat.title === 'Uncategorised' || cat.title === 'ROOT')
    .map((cat) => cat.id)

  // Create new categories with remapped IDs
  const newCategories: NewCategory[] = sortedCategories.map((cat, index) => {
    let newParentId: number | null = null

    // Map parent_id to new ID, or null if it's ROOT/Uncategorised
    if (
      cat.parent_id !== 0 &&
      cat.parent_id !== 1 &&
      !uncategorisedIds.includes(cat.parent_id)
    ) {
      newParentId = categoryIdMap.get(cat.parent_id) ?? null
    }

    return {
      id: index + 1,
      parentId: newParentId,
      title: cat.title,
      slug: cat.alias,
      description: cat.description,
      oldId: cat.id,
    }
  })

  // Create new posts with remapped category IDs
  // Sort by ID to maintain order
  const sortedContent = [...oldContent].sort((a, b) => a.id - b.id)

  const newPosts: NewPost[] = sortedContent.map((post, index) => {
    // Map category ID, or null if not found/uncategorised
    let newCategoryId: number | null = null
    if (!uncategorisedIds.includes(post.catid)) {
      newCategoryId = categoryIdMap.get(post.catid) ?? null
    }

    // Combine introtext and fulltext for full content
    const fullContent = post.fulltext
      ? `${post.introtext}\n\n${post.fulltext}`
      : post.introtext

    return {
      id: index + 1,
      title: post.title.trim(),
      slug: post.alias,
      content: fullContent,
      excerpt: createExcerpt(post.introtext),
      categoryId: newCategoryId,
      state: mapState(post.state),
      featured: post.featured === 1,
      hits: post.hits,
      createdAt: convertDate(post.created) ?? new Date().toISOString(),
      updatedAt: convertDate(post.modified) ?? new Date().toISOString(),
      publishedAt: convertDate(post.publish_up),
      oldId: post.id,
      oldCategoryId: post.catid,
    }
  })

  // Write output files
  console.log('\nWriting output files...')
  writeJsonFile(categoriesOutputPath, newCategories)
  writeJsonFile(postsOutputPath, newPosts)

  // Print summary
  console.log('\n=== Migration Summary ===')
  console.log(`Categories: ${newCategories.length}`)
  console.log(`Posts: ${newPosts.length}`)

  // Count posts by state
  const publishedPosts = newPosts.filter((p) => p.state === 'published').length
  const draftPosts = newPosts.filter((p) => p.state === 'draft').length
  const archivedPosts = newPosts.filter((p) => p.state === 'archived').length
  console.log(
    `  - Published: ${publishedPosts}, Draft: ${draftPosts}, Archived: ${archivedPosts}`
  )

  // Count featured posts
  const featuredPosts = newPosts.filter((p) => p.featured).length
  console.log(`  - Featured posts: ${featuredPosts}`)

  // Count posts without category
  const orphanPosts = newPosts.filter((p) => p.categoryId === null).length
  console.log(`  - Posts without category: ${orphanPosts}`)

  // Count root categories (no parent)
  const rootCategories = newCategories.filter((c) => c.parentId === null).length
  console.log(`  - Root categories: ${rootCategories}`)

  console.log('\nMigration completed successfully!')
}

main()
