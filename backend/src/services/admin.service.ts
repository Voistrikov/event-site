import { prisma } from '../config/prisma.js';
import type { Role, UserStatus, UserResponseDto } from '../types/auth.types.js';

export interface ListUsersQuery {
  role?: Role | undefined;
  status?: UserStatus | undefined;
  page: number;
  limit: number;
}

export interface ListUsersResult {
  users: UserResponseDto[];
  total: number;
}

export async function listUsers(query: ListUsersQuery): Promise<ListUsersResult> {
  const where = {
    ...(query.role   !== undefined && { role:   query.role }),
    ...(query.status !== undefined && { status: query.status }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        taxId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users: users as UserResponseDto[], total };
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<UserResponseDto> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      taxId: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user as UserResponseDto;
}

export async function getAllEventsForExport() {
  return prisma.event.findMany({
    include: {
      ticketTypes: true,
      bookings: {
        include: {
          user: true
        }
      },
      organizer: true,
      photos: true,
      categories: {
        include: {
          category: true
        }
      }
    }
  });
}
