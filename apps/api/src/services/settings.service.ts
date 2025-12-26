import { prisma } from '@/lib/prisma.lib';
import { UpdateSettingsDto, ClubSettings } from '@/types/settings.types';

const SETTINGS_ID = 1;

export class SettingsService {
  /**
   * Get or create the singleton settings record.
   * If no record exists, creates one with default null values.
   */
  async get(): Promise<ClubSettings> {
    let settings = await prisma.clubSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (!settings) {
      settings = await prisma.clubSettings.create({
        data: { id: SETTINGS_ID },
      });
    }

    return settings;
  }

  /**
   * Update the singleton settings record.
   * Creates the record if it doesn't exist, then updates it.
   */
  async update(updateSettingsDto: UpdateSettingsDto): Promise<ClubSettings> {
    // Ensure record exists
    await this.get();

    const settings = await prisma.clubSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        foundingYear: updateSettingsDto.foundingYear,
        address: updateSettingsDto.address,
        memberCount: updateSettingsDto.memberCount,
        contactEmail: updateSettingsDto.contactEmail,
        contactPhone: updateSettingsDto.contactPhone,
      },
    });

    return settings;
  }
}
