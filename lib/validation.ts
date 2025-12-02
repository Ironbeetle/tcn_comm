import { z } from 'zod'

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  department: z.enum(['UTILITIES', 'FINANCE', 'HOUSING'], {
    message: 'Please select a valid department'
  }),
  role: z.enum(['STAFF', 'STAFF_ADMIN', 'ADMIN', 'CHIEF_COUNCIL']).default('STAFF'),
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().cuid(),
})

export const userIdSchema = z.object({
  id: z.string().cuid(),
})

// SMS Log schemas
export const createSmsLogSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  status: z.string(),
  messageIds: z.array(z.string()),
  error: z.string().optional(),
  userId: z.string().cuid(),
})

export const updateSmsLogSchema = createSmsLogSchema.partial().extend({
  id: z.string().cuid(),
})

// Email Log schemas
export const createEmailLogSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  status: z.string(),
  messageId: z.string().optional(),
  error: z.string().optional(),
  attachments: z.any().optional(),
  userId: z.string().cuid(),
})

export const updateEmailLogSchema = createEmailLogSchema.partial().extend({
  id: z.string().cuid(),
})

// Staff Email Log schemas
export const createStaffEmailLogSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  status: z.string(),
  messageId: z.string().optional(),
  error: z.string().optional(),
  attachments: z.any().optional(),
  userId: z.string().cuid(),
})

export const updateStaffEmailLogSchema = createStaffEmailLogSchema.partial().extend({
  id: z.string().cuid(),
})

// Message API Log schemas
export const createMsgApiLogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.string(),
  type: z.string().default('notice'),
  expiryDate: z.date().optional(),
  isPublished: z.boolean().default(false),
  userId: z.string().cuid(),
  date: z.date(),
  time: z.date(),
  location: z.string().min(1, 'Location is required'),
})

export const updateMsgApiLogSchema = createMsgApiLogSchema.partial().extend({
  id: z.string().cuid(),
})

// Message CnC schemas
export const createMsgCnCSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.string(),
  type: z.string().default('notice'),
  expiryDate: z.date().optional(),
  isPublished: z.boolean().default(false),
  userId: z.string().cuid(),
  date: z.date(),
  time: z.date(),
  location: z.string().min(1, 'Location is required'),
})

export const updateMsgCnCSchema = createMsgCnCSchema.partial().extend({
  id: z.string().cuid(),
})

// Time Sheets schemas
export const createTimeSheetSchema = z.object({
  userId: z.string().cuid(),
  submitted: z.boolean().default(false),
  date: z.date(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakDuration: z.number().min(0, 'Break duration must be 0 or greater').default(0),
  totalHours: z.number().min(0, 'Total hours must be 0 or greater'),
  project: z.string().min(1, 'Project is required'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).default('DRAFT'),
})

export const updateTimeSheetSchema = createTimeSheetSchema.partial().extend({
  id: z.string().cuid(),
})

// Travel Forms schemas
export const createTravelFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Name is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureDate: z.date(),
  returnDate: z.date(),
  reasonsForTravel: z.string().min(1, 'Reasons for travel is required'),
  
  // Accommodation
  hotelRate: z.number().min(0).default(0),
  hotelNights: z.number().min(0).default(0),
  hotelTotal: z.number().min(0).default(0),
  privateRate: z.number().min(0).default(50.00),
  privateNights: z.number().min(0).default(0),
  privateTotal: z.number().min(0).default(0),
  
  // Meals
  breakfastRate: z.number().min(0).default(20.50),
  breakfastDays: z.number().min(0).default(0),
  breakfastTotal: z.number().min(0).default(0),
  lunchRate: z.number().min(0).default(20.10),
  lunchDays: z.number().min(0).default(0),
  lunchTotal: z.number().min(0).default(0),
  dinnerRate: z.number().min(0).default(50.65),
  dinnerDays: z.number().min(0).default(0),
  dinnerTotal: z.number().min(0).default(0),
  
  // Incidentals
  incidentalRate: z.number().min(0).default(10.00),
  incidentalDays: z.number().min(0).default(0),
  incidentalTotal: z.number().min(0).default(0),
  
  // Transportation
  transportationType: z.enum(['PERSONAL_VEHICLE', 'PUBLIC_TRANSPORT_WINNIPEG', 'PUBLIC_TRANSPORT_THOMPSON', 'COMBINATION', 'OTHER']).default('PERSONAL_VEHICLE'),
  
  // Personal Vehicle
  personalVehicleRate: z.number().min(0).default(0.50).optional(),
  licensePlateNumber: z.string().optional(),
  oneWayWinnipegKm: z.number().min(0).default(904).optional(),
  oneWayWinnipegTrips: z.number().min(0).default(0).optional(),
  oneWayWinnipegTotal: z.number().min(0).default(0).optional(),
  oneWayThompsonKm: z.number().min(0).default(150).optional(),
  oneWayThompsonTrips: z.number().min(0).default(0).optional(),
  oneWayThompsonTotal: z.number().min(0).default(0).optional(),
  
  // Public Transportation
  winnipegFlatRate: z.number().min(0).default(450.00).optional(),
  thompsonFlatRate: z.number().min(0).default(100.00).optional(),
  publicTransportTotal: z.number().min(0).default(0).optional(),
  
  // Taxi
  taxiFareRate: z.number().min(0).default(17.30).optional(),
  taxiFareDays: z.number().min(0).default(0).optional(),
  taxiFareTotal: z.number().min(0).default(0).optional(),
  
  // Parking
  parkingTotal: z.number().min(0).default(0).optional(),
  parkingReceipts: z.boolean().default(false),
  
  // Totals
  grandTotal: z.number().min(0).default(0),
  
  // Form Status
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ISSUED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  
  // Submission and Authorization
  submittedBy: z.string().min(1, 'Submitted by is required'),
  submittedDate: z.date().optional(),
  authorizedBy: z.string().optional(),
  authorizedDate: z.date().optional(),
  createdBy: z.string().min(1, 'Created by is required'),
  updatedBy: z.string().optional(),
  userId: z.string().cuid(),
}).refine((data) => data.returnDate >= data.departureDate, {
  message: "Return date must be after departure date",
  path: ["returnDate"],
})

export const updateTravelFormSchema = createTravelFormSchema.partial().extend({
  id: z.string().cuid(),
})

// Common schemas
export const idSchema = z.object({
  id: z.string().cuid(),
})

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).merge(paginationSchema)

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateSmsLogInput = z.infer<typeof createSmsLogSchema>
export type UpdateSmsLogInput = z.infer<typeof updateSmsLogSchema>
export type CreateEmailLogInput = z.infer<typeof createEmailLogSchema>
export type UpdateEmailLogInput = z.infer<typeof updateEmailLogSchema>
export type CreateStaffEmailLogInput = z.infer<typeof createStaffEmailLogSchema>
export type UpdateStaffEmailLogInput = z.infer<typeof updateStaffEmailLogSchema>
export type CreateMsgApiLogInput = z.infer<typeof createMsgApiLogSchema>
export type UpdateMsgApiLogInput = z.infer<typeof updateMsgApiLogSchema>
export type CreateMsgCnCInput = z.infer<typeof createMsgCnCSchema>
export type UpdateMsgCnCInput = z.infer<typeof updateMsgCnCSchema>
export type CreateTimeSheetInput = z.infer<typeof createTimeSheetSchema>
export type UpdateTimeSheetInput = z.infer<typeof updateTimeSheetSchema>
export type CreateTravelFormInput = z.infer<typeof createTravelFormSchema>
export type UpdateTravelFormInput = z.infer<typeof updateTravelFormSchema>
export type SearchInput = z.infer<typeof searchSchema>