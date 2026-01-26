import ora from 'ora';
import type { Client } from 'pg';
import { loadHistorySeedData } from '../utils';

export async function seedHistory(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding history content...').start();

  try {
    // Check if history already exists
    const checkResult = await pgClient.query('SELECT id FROM "HistoryContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('History content already exists, skipping');
      return;
    }

    const history = await loadHistorySeedData();

    // 1. Create HistoryContent
    await pgClient.query(
      `INSERT INTO "HistoryContent" (
        "id", "heroHeadline", "heroSubHeadline", "foundingHeadline", "foundingDescription",
        "foundingFactCardHeadline", "foundingDate", "foundingMilestonesHeadline", "developmentHeadline",
        "developmentDescription", "festivalsHeadline", "festivalsDescription",
        "achievementsHeadline", "ctaHeadline", "ctaDescription", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()
      )`,
      [
        1,
        history.heroHeadline,
        history.heroSubHeadline,
        history.foundingHeadline,
        history.foundingDescription,
        history.foundingFactCardHeadline,
        history.foundingDate ? new Date(history.foundingDate) : null,
        history.foundingMilestonesHeadline,
        history.developmentHeadline,
        history.developmentDescription,
        history.festivalsHeadline,
        history.festivalsDescription,
        history.achievementsHeadline,
        history.ctaHeadline,
        history.ctaDescription,
      ],
    );

    // 2. Seed Founding Facts
    for (let i = 0; i < history.foundingFacts.length; i++) {
      const f = history.foundingFacts[i];
      await pgClient.query(
        `INSERT INTO "HistoryFact" ("historyContentId", "year", "headline", "description", "sort")
         VALUES ($1, $2, $3, $4, $5)`,
        [1, f.year, f.headline, f.description, i],
      );
    }

    // 3. Seed Founding Milestones
    for (let i = 0; i < history.foundingMilestones.length; i++) {
      const m = history.foundingMilestones[i];
      await pgClient.query(
        `INSERT INTO "HistoryMilestone" ("historyContentId", "year", "headline", "description", "sort")
         VALUES ($1, $2, $3, $4, $5)`,
        [1, m.year, m.headline, m.description, i],
      );
    }

    // 4. Seed Chart Labels
    for (let i = 0; i < history.developmentChartData.labels.length; i++) {
      await pgClient.query(
        `INSERT INTO "HistoryChartLabel" ("historyContentId", "label", "sort")
         VALUES ($1, $2, $3)`,
        [1, history.developmentChartData.labels[i], i],
      );
    }

    // 5. Seed Datasets and Values
    for (let i = 0; i < history.developmentChartData.datasets.length; i++) {
      const ds = history.developmentChartData.datasets[i];
      const dsResult = await pgClient.query(
        `INSERT INTO "HistoryChartDataset" ("historyContentId", "label", "sort")
         VALUES ($1, $2, $3) RETURNING id`,
        [1, ds.label, i],
      );
      const dsId = dsResult.rows[0].id;

      for (let j = 0; j < ds.data.length; j++) {
        await pgClient.query(
          `INSERT INTO "HistoryChartValue" ("datasetId", "value", "sort")
           VALUES ($1, $2, $3)`,
          [dsId, ds.data[j], j],
        );
      }
    }

    // 6. Seed Chronicle Groups
    for (let i = 0; i < history.developmentChronicleGroups.length; i++) {
      const g = history.developmentChronicleGroups[i];
      const gResult = await pgClient.query(
        `INSERT INTO "HistoryChronicleGroup" ("historyContentId", "headline", "sort")
         VALUES ($1, $2, $3) RETURNING id`,
        [1, g.headline, i],
      );
      const gId = gResult.rows[0].id;

      for (let j = 0; j < g.content.length; j++) {
        const e = g.content[j];
        await pgClient.query(
          `INSERT INTO "HistoryChronicleEntry" ("groupId", "year", "description", "sort")
           VALUES ($1, $2, $3, $4)`,
          [gId, e.year, e.description, j],
        );
      }
    }

    // 7. Seed Festival Items
    for (let i = 0; i < history.festivalsItems.length; i++) {
      const f = history.festivalsItems[i];
      await pgClient.query(
        `INSERT INTO "HistoryFestivalItem" ("historyContentId", "headline", "text", "sort")
         VALUES ($1, $2, $3, $4)`,
        [1, f.headline, f.text, i],
      );
    }

    // 8. Seed Achievements
    for (let i = 0; i < history.achievementsItems.length; i++) {
      const a = history.achievementsItems[i];
      await pgClient.query(
        `INSERT INTO "HistoryAchievement" ("historyContentId", "year", "headline", "description", "category", "sort")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [1, a.year, a.headline, a.description, a.category, i],
      );
    }

    spinner.succeed('Seeded history content');
  } catch (error) {
    spinner.fail('Failed to seed history content');
    throw error;
  }
}
