// SQL Queries
export const CATEGORY_QUERY = `
  SELECT
    id,
    title as name,
    path as slug,
    description,
    NULLIF(parent_id, 1) as parentId,
    NOW() as createdAt,
    NOW() as updatedAt
  FROM j3x_categories
  WHERE extension = 'com_content'
    AND published = 1
  ORDER BY lft ASC
  LIMIT 300
`;

export const POST_QUERY = `
  SELECT
    id,
    title,
    introtext AS content,
    catid,
    hits,
    created,
    modified,
    1 AS oldPost,
    2 AS authorId,
    1 AS published
  FROM j3x_content
  WHERE catid = ?
    AND state = 1
    AND id NOT IN (26, 42, 123, 860, 869, 902, 903, 940, 1014, 1086, 1095)
  LIMIT 10000
`;

// Email Configuration
export const PLACEHOLDER_EMAIL_DOMAIN = 'vsg-kugelberg.de';
