import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { prisma, createTestUserWithPassword } from '../helpers';

describe('Departments API Integration Tests', () => {
  const testPassword = 'Password123';
  const testUsername = 'testadmin';
  const testEmail = 'testadmin@example.com';

  // Helper to create authenticated request
  async function createAuthenticatedUser() {
    const user = await createTestUserWithPassword(
      testUsername,
      testEmail,
      testPassword,
    );

    // Login to get JWT token
    const loginResponse = await request(app).post('/api/auth/login').send({
      username: testUsername,
      password: testPassword,
    });

    const cookies = loginResponse.headers['set-cookie'];
    return { user, cookies };
  }

  describe('GET /api/departments', () => {
    it('should return all departments', async () => {
      await prisma.department.create({
        data: {
          name: 'Badminton',
          slug: 'badminton',
          shortDescription: 'Badminton department',
          longDescription: 'This is the badminton department',
        },
      });

      await prisma.department.create({
        data: {
          name: 'Table Tennis',
          slug: 'table-tennis',
          shortDescription: 'Table Tennis department',
          longDescription: 'This is the table tennis department',
        },
      });

      const response = await request(app).get('/api/departments');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
      expect(response.body[0]).toHaveProperty('shortDescription');
      expect(response.body[0]).toHaveProperty('longDescription');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });

    it('should return departments ordered by name alphabetically', async () => {
      await prisma.department.create({
        data: {
          name: 'Volleyball',
          slug: 'volleyball',
          shortDescription: 'Volleyball department',
          longDescription: 'This is the volleyball department',
        },
      });

      await prisma.department.create({
        data: {
          name: 'Badminton',
          slug: 'badminton',
          shortDescription: 'Badminton department',
          longDescription: 'This is the badminton department',
        },
      });

      const response = await request(app).get('/api/departments');

      expect(response.status).toBe(200);
      expect(response.body[0].name).toBe('Badminton');
      expect(response.body[1].name).toBe('Volleyball');
    });

    it('should return empty array when no departments exist', async () => {
      const response = await request(app).get('/api/departments');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/departments/:slug', () => {
    it('should return a single department by slug', async () => {
      await prisma.department.create({
        data: {
          name: 'Gymnastics',
          slug: 'gymnastics',
          shortDescription: 'Gymnastics department offering various programs',
          longDescription:
            'Our gymnastics department offers comprehensive programs for all ages and skill levels',
        },
      });

      const response = await request(app).get('/api/departments/gymnastics');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Gymnastics',
        slug: 'gymnastics',
        shortDescription: 'Gymnastics department offering various programs',
        longDescription:
          'Our gymnastics department offers comprehensive programs for all ages and skill levels',
      });
    });

    it('should return department with all extended relations', async () => {
      // Create department with all related data
      const department = await prisma.department.create({
        data: {
          name: 'Tischtennis',
          slug: 'tischtennis',
          shortDescription: 'Tischtennis department',
          longDescription: 'This is the table tennis department',
        },
      });

      // Create stats
      await prisma.departmentStat.create({
        data: {
          departmentId: department.id,
          label: 'Aktive Spieler',
          value: '45',
          sort: 0,
        },
      });

      // Create training group with session
      const group = await prisma.departmentTrainingGroup.create({
        data: {
          departmentId: department.id,
          name: 'Kinder & Jugend',
          ageRange: '6 - 17 Jahre',
          icon: 'youth',
          variant: 'primary',
          sort: 0,
        },
      });

      await prisma.departmentTrainingSession.create({
        data: {
          trainingGroupId: group.id,
          day: 'Montag',
          time: '16:00 - 17:30',
          sort: 0,
        },
      });

      // Create location
      await prisma.departmentLocation.create({
        data: {
          departmentId: department.id,
          name: 'Sporthalle',
          badge: 'HAUPTHALLE',
          badgeVariant: 'primary',
          street: 'Test Street 1',
          city: 'Test City',
          mapsUrl: 'https://maps.google.com/?q=test',
          amenities: [{ text: 'Parkplatz' }],
          sort: 0,
        },
      });

      // Create contact person and trainer
      const contactPerson = await prisma.contactPerson.create({
        data: {
          firstName: 'Michael',
          lastName: 'Weber',
          type: 'Trainer',
          email: 'michael@test.com',
          phone: '+49 123 456789',
        },
      });

      await prisma.departmentTrainer.create({
        data: {
          departmentId: department.id,
          contactPersonId: contactPerson.id,
          role: 'Cheftrainer',
          licenses: [{ name: 'DTTB C-Lizenz', variant: 'gold' }],
          experience: '25 Jahre',
          quote: 'Sport ist toll',
          sort: 0,
        },
      });

      const response = await request(app).get('/api/departments/tischtennis');

      expect(response.status).toBe(200);

      // Verify stats
      expect(response.body.stats).toHaveLength(1);
      expect(response.body.stats[0].label).toBe('Aktive Spieler');

      // Verify training groups with sessions
      expect(response.body.trainingGroups).toHaveLength(1);
      expect(response.body.trainingGroups[0].name).toBe('Kinder & Jugend');
      expect(response.body.trainingGroups[0].sessions).toHaveLength(1);
      expect(response.body.trainingGroups[0].sessions[0].day).toBe('Montag');

      // Verify locations
      expect(response.body.locations).toHaveLength(1);
      expect(response.body.locations[0].name).toBe('Sporthalle');
      expect(response.body.locations[0].amenities).toEqual([
        { text: 'Parkplatz' },
      ]);

      // Verify trainers with contact person
      expect(response.body.trainers).toHaveLength(1);
      expect(response.body.trainers[0].role).toBe('Cheftrainer');
      expect(response.body.trainers[0].contactPerson.firstName).toBe('Michael');
    });

    it('should return empty arrays when department has no related data', async () => {
      await prisma.department.create({
        data: {
          name: 'Empty Dept',
          slug: 'empty-dept',
          shortDescription: 'Empty department',
          longDescription: 'This department has no related data',
        },
      });

      const response = await request(app).get('/api/departments/empty-dept');

      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual([]);
      expect(response.body.trainingGroups).toEqual([]);
      expect(response.body.locations).toEqual([]);
      expect(response.body.trainers).toEqual([]);
    });

    it('should return 404 for non-existent department', async () => {
      const response = await request(app).get(
        '/api/departments/non-existent-slug',
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app).get('/api/departments/invalid slug!');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('POST /api/departments', () => {
    it('should create a department with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Badminton',
        shortDescription: 'Badminton department for all skill levels',
        longDescription:
          'Our badminton department offers training and competitions for players of all ages and abilities',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Badminton',
        slug: 'badminton',
        shortDescription: 'Badminton department for all skill levels',
        longDescription:
          'Our badminton department offers training and competitions for players of all ages and abilities',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      // Verify in database
      const department = await prisma.department.findUnique({
        where: { slug: 'badminton' },
      });
      expect(department).toBeTruthy();
    });

    it('should generate unique slug from name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department1 = {
        name: 'Table Tennis',
        shortDescription: 'Table Tennis department',
        longDescription: 'This is the table tennis department',
      };

      const response1 = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(department1);

      expect(response1.status).toBe(201);
      expect(response1.body.slug).toBe('table-tennis');

      // Try to create another department with a similar but different name
      const department2 = {
        name: 'Table Tennis Club',
        shortDescription: 'Another Table Tennis department',
        longDescription: 'This is another table tennis department',
      };

      const response2 = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(department2);

      expect(response2.status).toBe(201);
      expect(response2.body.slug).toMatch(/^table-tennis-club-?\d*$/);
      expect(response2.body.slug).not.toBe('table-tennis');
    });

    it('should return 401 without authentication', async () => {
      const newDepartment = {
        name: 'Volleyball',
        shortDescription: 'Volleyball department',
        longDescription: 'This is the volleyball department',
      };

      const response = await request(app)
        .post('/api/departments')
        .send(newDepartment);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        shortDescription: 'Some description',
        longDescription: 'Some long description text',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing shortDescription', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Badminton',
        longDescription: 'Some long description text',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing longDescription', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Badminton',
        shortDescription: 'Some short description',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should return 400 for name too short (less than 2 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'B',
        shortDescription: 'Badminton department',
        longDescription: 'This is the badminton department',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
    });

    it('should return 400 for name too long (more than 100 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const longName = 'a'.repeat(101);
      const newDepartment = {
        name: longName,
        shortDescription: 'Some description',
        longDescription: 'Some long description text',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
    });

    it('should return 400 for shortDescription too short (less than 10 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Badminton',
        shortDescription: 'Short',
        longDescription: 'This is a long description',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should return 400 for shortDescription too long (more than 200 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const longShortDesc = 'a'.repeat(201);
      const newDepartment = {
        name: 'Badminton',
        shortDescription: longShortDesc,
        longDescription: 'This is a long description',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should return 400 for longDescription too short (less than 20 chars)', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Badminton',
        shortDescription: 'Badminton department',
        longDescription: 'Too short',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(400);
    });

    it('should handle special characters in name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Table Tennis & Badminton',
        shortDescription: 'Combined department',
        longDescription: 'This is a combined department for both sports',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(201);
      expect(response.body.slug).toMatch(/^table-tennis-badminton/);
    });
  });

  describe('PATCH /api/departments/:slug', () => {
    it('should update department name with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const update = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.slug).toBe('updated-name');
    });

    it('should update department shortDescription', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Gymnastics',
          slug: 'gymnastics',
          shortDescription: 'Original short description',
          longDescription: 'Long description text',
        },
      });

      const update = {
        shortDescription: 'Updated short description',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.shortDescription).toBe('Updated short description');
      expect(response.body.slug).toBe('gymnastics');
    });

    it('should update department longDescription', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Volleyball',
          slug: 'volleyball',
          shortDescription: 'Short description',
          longDescription: 'Original long description',
        },
      });

      const update = {
        longDescription: 'Updated long description text',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.longDescription).toBe(
        'Updated long description text',
      );
    });

    it('should update multiple fields at once', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Original Department',
          slug: 'original-department',
          shortDescription: 'Original short',
          longDescription: 'Original long description',
        },
      });

      const update = {
        name: 'Updated Department',
        shortDescription: 'Updated short description',
        longDescription: 'Updated long description text',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: 'Updated Department',
        shortDescription: 'Updated short description',
        longDescription: 'Updated long description text',
      });
      expect(response.body.slug).toBe('updated-department');
    });

    it('should regenerate slug when name changes', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const update = {
        name: 'Completely New Name',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe('completely-new-name');

      // Verify old slug doesn't exist
      const oldDepartment = await prisma.department.findUnique({
        where: { slug: 'original-name' },
      });
      expect(oldDepartment).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const department = await prisma.department.create({
        data: {
          name: 'Test Department',
          slug: 'test-department',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const update = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .send(update);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent department', async () => {
      const { cookies } = await createAuthenticatedUser();

      const update = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch('/api/departments/non-existent-slug')
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should allow partial updates', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Original Name',
          slug: 'original-name',
          shortDescription: 'Original short',
          longDescription: 'Original long description',
        },
      });

      const update = {
        shortDescription: 'Updated short only',
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Original Name');
      expect(response.body.shortDescription).toBe('Updated short only');
      expect(response.body.longDescription).toBe('Original long description');
    });

    it('should return 400 for validation errors on update', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Test Department',
          slug: 'test-department',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const update = {
        name: 'A', // Too short
      };

      const response = await request(app)
        .patch(`/api/departments/${department.slug}`)
        .set('Cookie', cookies)
        .send(update);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/departments/:slug', () => {
    it('should delete a department with authentication', async () => {
      const { cookies } = await createAuthenticatedUser();

      const department = await prisma.department.create({
        data: {
          name: 'Department to Delete',
          slug: 'department-to-delete',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const response = await request(app)
        .delete(`/api/departments/${department.slug}`)
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: department.id,
        name: 'Department to Delete',
        slug: 'department-to-delete',
      });

      // Verify deletion in database
      const deletedDepartment = await prisma.department.findUnique({
        where: { slug: 'department-to-delete' },
      });
      expect(deletedDepartment).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const department = await prisma.department.create({
        data: {
          name: 'Protected Department',
          slug: 'protected-department',
          shortDescription: 'Short description',
          longDescription: 'Long description text',
        },
      });

      const response = await request(app).delete(
        `/api/departments/${department.slug}`,
      );

      expect(response.status).toBe(401);

      // Verify department still exists
      const existingDepartment = await prisma.department.findUnique({
        where: { slug: 'protected-department' },
      });
      expect(existingDepartment).toBeTruthy();
    });

    it('should return 404 for non-existent department', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/departments/non-existent-slug')
        .set('Cookie', cookies);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid slug format', async () => {
      const { cookies } = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/departments/invalid slug!')
        .set('Cookie', cookies);

      expect(response.status).toBe(400);
    });
  });

  describe('Icon Support', () => {
    // Helper to create an SVG media file for tests
    async function createTestMedia(
      mimetype: string = 'image/svg+xml',
      filename: string = 'test-icon.svg',
    ) {
      return prisma.media.create({
        data: {
          filename,
          originalName: filename,
          path: `/uploads/${filename}`,
          mimetype,
          size: 1024,
          type: 'IMAGE',
        },
      });
    }

    describe('Create department with icon', () => {
      it('should create department with valid SVG icon', async () => {
        const { cookies } = await createAuthenticatedUser();
        const svgMedia = await createTestMedia(
          'image/svg+xml',
          'badge-icon.svg',
        );

        const newDepartment = {
          name: 'Badminton',
          shortDescription: 'Badminton department for all skill levels',
          longDescription:
            'Our badminton department offers training and competitions for players of all ages and abilities',
          iconId: svgMedia.id,
        };

        const response = await request(app)
          .post('/api/departments')
          .set('Cookie', cookies)
          .send(newDepartment);

        expect(response.status).toBe(201);
        expect(response.body.iconId).toBe(svgMedia.id);
        expect(response.body.icon).toBeTruthy();
        expect(response.body.icon.mimetype).toBe('image/svg+xml');
      });

      it('should return 400 when creating department with non-SVG media', async () => {
        const { cookies } = await createAuthenticatedUser();
        const pngMedia = await createTestMedia('image/png', 'badge-icon.png');

        const newDepartment = {
          name: 'Table Tennis',
          shortDescription: 'Table Tennis department for all skill levels',
          longDescription:
            'Our table tennis department offers training for players of all ages',
          iconId: pngMedia.id,
        };

        const response = await request(app)
          .post('/api/departments')
          .set('Cookie', cookies)
          .send(newDepartment);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('SVG');
      });

      it('should return 404 when creating department with non-existent media', async () => {
        const { cookies } = await createAuthenticatedUser();

        const newDepartment = {
          name: 'Volleyball',
          shortDescription: 'Volleyball department for all skill levels',
          longDescription:
            'Our volleyball department offers training for players of all ages',
          iconId: 99999,
        };

        const response = await request(app)
          .post('/api/departments')
          .set('Cookie', cookies)
          .send(newDepartment);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('not found');
      });

      it('should create department without icon when iconId is not provided', async () => {
        const { cookies } = await createAuthenticatedUser();

        const newDepartment = {
          name: 'Swimming',
          shortDescription: 'Swimming department for all skill levels',
          longDescription:
            'Our swimming department offers training for swimmers of all ages',
        };

        const response = await request(app)
          .post('/api/departments')
          .set('Cookie', cookies)
          .send(newDepartment);

        expect(response.status).toBe(201);
        expect(response.body.iconId).toBeNull();
        expect(response.body.icon).toBeNull();
      });
    });

    describe('Update department icon', () => {
      it('should update department to add icon', async () => {
        const { cookies } = await createAuthenticatedUser();
        const svgMedia = await createTestMedia('image/svg+xml', 'new-icon.svg');

        const department = await prisma.department.create({
          data: {
            name: 'Gymnastics',
            slug: 'gymnastics',
            shortDescription: 'Gymnastics department',
            longDescription: 'This is the gymnastics department',
          },
        });

        const response = await request(app)
          .patch(`/api/departments/${department.slug}`)
          .set('Cookie', cookies)
          .send({ iconId: svgMedia.id });

        expect(response.status).toBe(200);
        expect(response.body.iconId).toBe(svgMedia.id);
        expect(response.body.icon).toBeTruthy();
        expect(response.body.icon.mimetype).toBe('image/svg+xml');
      });

      it('should update department to remove icon (set null)', async () => {
        const { cookies } = await createAuthenticatedUser();
        const svgMedia = await createTestMedia(
          'image/svg+xml',
          'remove-icon.svg',
        );

        const department = await prisma.department.create({
          data: {
            name: 'Football',
            slug: 'football',
            shortDescription: 'Football department',
            longDescription: 'This is the football department',
            iconId: svgMedia.id,
          },
        });

        const response = await request(app)
          .patch(`/api/departments/${department.slug}`)
          .set('Cookie', cookies)
          .send({ iconId: null });

        expect(response.status).toBe(200);
        expect(response.body.iconId).toBeNull();
        expect(response.body.icon).toBeNull();
      });

      it('should return 400 when updating department with non-SVG media', async () => {
        const { cookies } = await createAuthenticatedUser();
        const jpgMedia = await createTestMedia('image/jpeg', 'photo.jpg');

        const department = await prisma.department.create({
          data: {
            name: 'Basketball',
            slug: 'basketball',
            shortDescription: 'Basketball department',
            longDescription: 'This is the basketball department',
          },
        });

        const response = await request(app)
          .patch(`/api/departments/${department.slug}`)
          .set('Cookie', cookies)
          .send({ iconId: jpgMedia.id });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('SVG');
      });
    });

    describe('GET departments with icon data', () => {
      it('should include icon data in GET all departments', async () => {
        const svgMedia = await createTestMedia(
          'image/svg+xml',
          'list-icon.svg',
        );

        await prisma.department.create({
          data: {
            name: 'Tennis',
            slug: 'tennis',
            shortDescription: 'Tennis department',
            longDescription: 'This is the tennis department',
            iconId: svgMedia.id,
          },
        });

        await prisma.department.create({
          data: {
            name: 'Hockey',
            slug: 'hockey',
            shortDescription: 'Hockey department',
            longDescription: 'This is the hockey department',
          },
        });

        const response = await request(app).get('/api/departments');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);

        // Find the department with icon
        const tennisDepart = response.body.find(
          (d: { name: string }) => d.name === 'Tennis',
        );
        const hockeyDepart = response.body.find(
          (d: { name: string }) => d.name === 'Hockey',
        );

        expect(tennisDepart.icon).toBeTruthy();
        expect(tennisDepart.icon.id).toBe(svgMedia.id);
        expect(hockeyDepart.icon).toBeNull();
      });

      it('should include icon data in GET department by slug', async () => {
        const svgMedia = await createTestMedia(
          'image/svg+xml',
          'single-icon.svg',
        );

        await prisma.department.create({
          data: {
            name: 'Athletics',
            slug: 'athletics',
            shortDescription: 'Athletics department with running events',
            longDescription:
              'Our athletics department offers various running and field events',
            iconId: svgMedia.id,
          },
        });

        const response = await request(app).get('/api/departments/athletics');

        expect(response.status).toBe(200);
        expect(response.body.icon).toBeTruthy();
        expect(response.body.icon.id).toBe(svgMedia.id);
        expect(response.body.icon.mimetype).toBe('image/svg+xml');
      });
    });

    describe('Media deletion cascade', () => {
      it('should set department iconId to null when media is deleted', async () => {
        const svgMedia = await createTestMedia(
          'image/svg+xml',
          'cascade-icon.svg',
        );

        const department = await prisma.department.create({
          data: {
            name: 'Cycling',
            slug: 'cycling',
            shortDescription: 'Cycling department',
            longDescription: 'This is the cycling department',
            iconId: svgMedia.id,
          },
        });

        // Verify icon is set
        const departmentBefore = await prisma.department.findUnique({
          where: { id: department.id },
        });
        expect(departmentBefore?.iconId).toBe(svgMedia.id);

        // Delete the media
        await prisma.media.delete({
          where: { id: svgMedia.id },
        });

        // Verify iconId is now null (due to onDelete: SetNull)
        const departmentAfter = await prisma.department.findUnique({
          where: { id: department.id },
        });
        expect(departmentAfter?.iconId).toBeNull();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle departments with same name (unique constraint)', async () => {
      const { cookies } = await createAuthenticatedUser();

      await prisma.department.create({
        data: {
          name: 'Badminton',
          slug: 'badminton',
          shortDescription: 'First badminton department',
          longDescription: 'This is the first badminton department',
        },
      });

      const newDepartment = {
        name: 'Badminton',
        shortDescription: 'Second badminton department',
        longDescription: 'This is a duplicate badminton department',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      // Should fail due to unique constraint on name
      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should handle unicode characters in name', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: 'Fußball & Tischtennis',
        shortDescription: 'German sports department',
        longDescription: 'This department includes German sports',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Fußball & Tischtennis');
      expect(response.body.slug).toBeTruthy();
    });

    it('should trim whitespace from fields', async () => {
      const { cookies } = await createAuthenticatedUser();

      const newDepartment = {
        name: '  Badminton  ',
        shortDescription: '  Short description  ',
        longDescription: '  Long description text  ',
      };

      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', cookies)
        .send(newDepartment);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Badminton');
      expect(response.body.shortDescription).toBe('Short description');
      expect(response.body.longDescription).toBe('Long description text');
    });
  });
});
