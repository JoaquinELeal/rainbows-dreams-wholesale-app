import type { RegistrationStatus } from "@prisma/client";
import prisma from '../db.server';

export interface CreateRegistrationData {
  shopifyCustomerId: string;
  name: string;
  email: string;
  businessDetails: string;
}

export interface UpdateRegistrationData {
  status: RegistrationStatus;
}

export async function createRegistration(data: CreateRegistrationData) {
  return await prisma.registration.create({
    data: {
      shopifyCustomerId: data.shopifyCustomerId,
      name: data.name,
      email: data.email,
      businessDetails: data.businessDetails,
      status: 'PENDING',
    },
  });
}

export async function getRegistrationById(id: number) {
  return await prisma.registration.findUnique({
    where: { id },
  });
}

export async function getRegistrationByShopifyCustomerId(shopifyCustomerId: string) {
  return await prisma.registration.findUnique({
    where: { shopifyCustomerId },
  });
}

export async function updateRegistration(id: number, data: UpdateRegistrationData) {
  return await prisma.registration.update({
    where: { id },
    data: {
      status: data.status,
      updatedAt: new Date(),
    },
  });
}

export async function getAllPendingRegistrations() {
  return await prisma.registration.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRegistrationStats() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'PENDING' } }),
    prisma.registration.count({ where: { status: 'APPROVED' } }),
    prisma.registration.count({ where: { status: 'REJECTED' } }),
  ]);

  return { total, pending, approved, rejected };
}
