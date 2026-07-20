'use strict';

const { z } = require('zod');

const status = z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE');

const createSchema = z.object({
  emp_code: z.string().trim().min(1).max(20),
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  department_id: z.coerce.number().int().nonnegative().optional().default(0),
  job_title: z.string().trim().max(100).optional().or(z.literal('')),
  status: status.optional(),
  hire_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'hire_date must be YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
});

const updateSchema = createSchema.partial();

const listQuery = z.object({
  dept: z.coerce.number().int().nonnegative().optional(),
  q: z.string().trim().max(100).optional(),
});

module.exports = { createSchema, updateSchema, listQuery };
