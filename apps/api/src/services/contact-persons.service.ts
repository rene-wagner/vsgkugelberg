import { NotFoundException } from '@/errors/http-errors';
import {
  CreateContactPersonDto,
  UpdateContactPersonDto,
  ContactPerson,
} from '@/types/contact-person.types';
import { Prisma, prisma } from '@/lib/prisma.lib';

export class ContactPersonsService {
  async findAll(): Promise<ContactPerson[]> {
    return prisma.contactPerson.findMany({
      orderBy: { lastName: 'asc' },
    });
  }

  async findById(id: number): Promise<ContactPerson> {
    const contactPerson = await prisma.contactPerson.findUnique({
      where: { id },
    });

    if (!contactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    return contactPerson;
  }

  async create(
    createContactPersonDto: CreateContactPersonDto,
  ): Promise<ContactPerson> {
    return prisma.contactPerson.create({
      data: {
        firstName: createContactPersonDto.firstName,
        lastName: createContactPersonDto.lastName,
        type: createContactPersonDto.type,
        email: createContactPersonDto.email,
        address: createContactPersonDto.address,
        phone: createContactPersonDto.phone,
      },
    });
  }

  async update(
    id: number,
    updateContactPersonDto: UpdateContactPersonDto,
  ): Promise<ContactPerson> {
    // First check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id },
    });

    if (!existingContactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    const updateData: Prisma.ContactPersonUpdateInput = {};

    if (updateContactPersonDto.firstName !== undefined) {
      updateData.firstName = updateContactPersonDto.firstName;
    }

    if (updateContactPersonDto.lastName !== undefined) {
      updateData.lastName = updateContactPersonDto.lastName;
    }

    if (updateContactPersonDto.type !== undefined) {
      updateData.type = updateContactPersonDto.type;
    }

    if (updateContactPersonDto.email !== undefined) {
      updateData.email = updateContactPersonDto.email;
    }

    if (updateContactPersonDto.address !== undefined) {
      updateData.address = updateContactPersonDto.address;
    }

    if (updateContactPersonDto.phone !== undefined) {
      updateData.phone = updateContactPersonDto.phone;
    }

    return prisma.contactPerson.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number): Promise<ContactPerson> {
    // First check if contact person exists
    const existingContactPerson = await prisma.contactPerson.findUnique({
      where: { id },
    });

    if (!existingContactPerson) {
      throw new NotFoundException(`Contact person with ID ${id} not found`);
    }

    return prisma.contactPerson.delete({
      where: { id },
    });
  }
}
