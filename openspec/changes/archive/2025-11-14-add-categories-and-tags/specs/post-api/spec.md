# post-api Specification Delta

## MODIFIED Requirements

### Requirement: List Posts Endpoint

The API MUST support filtering posts by category and tag slugs.

#### Scenario: Filter posts by category slug

**Given** posts are associated with various categories  
**When** a GET request is made to `/posts?category=news`  
**Then** the response must have status 200  
**And** the response must contain only posts that have the category with slug "news"  
**And** each post must include its categories and tags arrays

#### Scenario: Filter posts by tag slug

**Given** posts are associated with various tags  
**When** a GET request is made to `/posts?tag=handball`  
**Then** the response must have status 200  
**And** the response must contain only posts that have the tag with slug "handball"  
**And** each post must include its categories and tags arrays

#### Scenario: Combine published and category filters

**Given** posts with various published states and categories  
**When** a GET request is made to `/posts?published=true&category=news`  
**Then** the response must have status 200  
**And** the response must contain only published posts in category "news"

#### Scenario: Handle non-existent category slug

**Given** no category with slug "nonexistent" exists  
**When** a GET request is made to `/posts?category=nonexistent`  
**Then** the response must have status 200  
**And** the response must contain an empty array

#### Scenario: Handle non-existent tag slug

**Given** no tag with slug "nonexistent" exists  
**When** a GET request is made to `/posts?tag=nonexistent`  
**Then** the response must have status 200  
**And** the response must contain an empty array

---

### Requirement: Get Single Post by Slug Endpoint

The API MUST include category and tag data when retrieving individual posts.

#### Scenario: Get post with categories and tags

**Given** a post with slug "my-post" has 2 categories and 3 tags  
**When** a GET request is made to `/posts/my-post`  
**Then** the response must have status 200  
**And** the response must include a `categories` array with full category objects  
**And** the response must include a `tags` array with full tag objects  
**And** each category must include: id, name, slug, description, createdAt, updatedAt  
**And** each tag must include: id, name, slug, createdAt, updatedAt

---

### Requirement: Create Post Endpoint

The API MUST allow associating categories and tags when creating posts.

#### Scenario: Create post with categories and tags

**Given** valid post data with title, content, categoryIds [1, 2], and tagIds [1, 2, 3]  
**When** a POST request is made to `/posts` with this data  
**Then** the response must have status 201  
**And** the created post must be linked to categories 1 and 2  
**And** the created post must be linked to tags 1, 2, and 3  
**And** the response must include full category and tag objects

#### Scenario: Create post without categories or tags

**Given** valid post data with title and content but no categoryIds or tagIds  
**When** a POST request is made to `/posts`  
**Then** the response must have status 201  
**And** the response categories array must be empty  
**And** the response tags array must be empty

#### Scenario: Create post with non-existent category ID

**Given** post data with categoryIds [999] where category 999 does not exist  
**When** a POST request is made to `/posts`  
**Then** the response must have status 404  
**And** the error message must indicate category 999 not found

#### Scenario: Create post with non-existent tag ID

**Given** post data with tagIds [888] where tag 888 does not exist  
**When** a POST request is made to `/posts`  
**Then** the response must have status 404  
**And** the error message must indicate tag 888 not found

---

### Requirement: Update Post Endpoint

The API MUST allow updating category and tag associations for existing posts.

#### Scenario: Update post to add categories and tags

**Given** an existing post without categories or tags  
**When** a PATCH request is made to `/posts/:slug` with categoryIds [1] and tagIds [2]  
**Then** the response must have status 200  
**And** the post must now be linked to category 1 and tag 2  
**And** the response must include the updated category and tag arrays

#### Scenario: Update post to replace categories and tags

**Given** an existing post with categoryIds [1, 2] and tagIds [3, 4]  
**When** a PATCH request is made with categoryIds [2, 3] and tagIds [5]  
**Then** the response must have status 200  
**And** the post must be linked only to categories 2 and 3 (replacing 1, 2)  
**And** the post must be linked only to tag 5 (replacing 3, 4)

#### Scenario: Update post to remove all categories and tags

**Given** an existing post with categories and tags  
**When** a PATCH request is made with empty categoryIds [] and tagIds []  
**Then** the response must have status 200  
**And** the post must have no category associations  
**And** the post must have no tag associations

---

### Requirement: Data Transfer Objects

The API MUST extend post DTOs to support taxonomy associations.

#### Scenario: CreatePostDto with taxonomy fields

**Given** the CreatePostDto definition  
**When** creating a post  
**Then** the DTO must accept an optional `categoryIds` field of type number[]  
**And** must accept an optional `tagIds` field of type number[]  
**And** must validate categoryIds elements are positive integers  
**And** must validate tagIds elements are positive integers

#### Scenario: UpdatePostDto with taxonomy fields

**Given** the UpdatePostDto definition  
**When** updating a post  
**Then** the DTO must accept an optional `categoryIds` field of type number[]  
**And** must accept an optional `tagIds` field of type number[]  
**And** must validate categoryIds elements are positive integers  
**And** must validate tagIds elements are positive integers
