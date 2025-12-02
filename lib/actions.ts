'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/auth/auth-utils'
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  createSmsLogSchema,
  updateSmsLogSchema,
  createEmailLogSchema,
  updateEmailLogSchema,
  createStaffEmailLogSchema,
  updateStaffEmailLogSchema,
  createMsgApiLogSchema,
  updateMsgApiLogSchema,
  createMsgCnCSchema,
  updateMsgCnCSchema,
  createTimeSheetSchema,
  updateTimeSheetSchema,
  createTravelFormSchema,
  updateTravelFormSchema,
  searchSchema,
  idSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type CreateSmsLogInput,
  type UpdateSmsLogInput,
  type CreateEmailLogInput,
  type UpdateEmailLogInput,
  type CreateStaffEmailLogInput,
  type UpdateStaffEmailLogInput,
  type CreateMsgApiLogInput,
  type UpdateMsgApiLogInput,
  type CreateMsgCnCInput,
  type UpdateMsgCnCInput,
  type CreateTimeSheetInput,
  type UpdateTimeSheetInput,
  type CreateTravelFormInput,
  type UpdateTravelFormInput,
  type SearchInput,
} from '@/lib/validation'

// Utility function for error handling
function handleError(error: unknown, action: string) {
  console.error(`Error in ${action}:`, error)
  throw new Error(`Failed to ${action}`)
}

// USER ACTIONS
export async function createUser(data: CreateUserInput) {
  try {
    const validatedData = createUserSchema.parse(data)
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(validatedData.password)
    
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      } as any,
    })
    revalidatePath('/users')
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: handleError(error, 'create user') }
  }
}

export async function updateUser(data: UpdateUserInput) {
  try {
    const validatedData = updateUserSchema.parse(data)
    const { id, ...updateData } = validatedData
    const user = await prisma.user.update({
      where: { id },
      data: updateData as any,
    })
    revalidatePath('/users')
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: handleError(error, 'update user') }
  }
}

export async function deleteUser(id: string) {
  try {
    const validatedId = userIdSchema.parse({ id })
    await prisma.user.delete({
      where: { id: validatedId.id },
    })
    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleError(error, 'delete user') }
  }
}

export async function getUser(id: string) {
  try {
    const validatedId = userIdSchema.parse({ id })
    const user = await prisma.user.findUnique({
      where: { id: validatedId.id },
      include: {
        emails: true,
        staffemail: true,
        MsgApiLog: true,
        sessions: true,
        smslog: true,
        msgcnc: true,
        travel_form: true,
        time_sheet: true,
      },
    })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: handleError(error, 'get user') }
  }
}

export async function getUsers(params?: SearchInput) {
  try {
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, query, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const where = query
      ? {
          OR: [
            { first_name: { contains: query, mode: 'insensitive' as const } },
            { last_name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { department: { equals: query as any } },
          ],
        }
      : {}

    const orderBy = sortBy ? { [sortBy]: sortOrder } : { created: sortOrder }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get users') }
  }
}

// SMS LOG ACTIONS
export async function createSmsLog(data: CreateSmsLogInput) {
  try {
    const validatedData = createSmsLogSchema.parse(data)
    const smsLog = await prisma.smsLog.create({
      data: validatedData,
    })
    revalidatePath('/sms-logs')
    return { success: true, data: smsLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'create SMS log') }
  }
}

export async function updateSmsLog(data: UpdateSmsLogInput) {
  try {
    const validatedData = updateSmsLogSchema.parse(data)
    const { id, ...updateData } = validatedData
    const smsLog = await prisma.smsLog.update({
      where: { id },
      data: updateData,
    })
    revalidatePath('/sms-logs')
    return { success: true, data: smsLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'update SMS log') }
  }
}

export async function deleteSmsLog(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    await prisma.smsLog.delete({
      where: { id: validatedId.id },
    })
    revalidatePath('/sms-logs')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleError(error, 'delete SMS log') }
  }
}

export async function getSmsLog(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    const smsLog = await prisma.smsLog.findUnique({
      where: { id: validatedId.id },
      include: { user: true },
    })
    return { success: true, data: smsLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'get SMS log') }
  }
}

export async function getSmsLogs(params?: SearchInput) {
  try {
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, query, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const where = query
      ? {
          OR: [
            { message: { contains: query, mode: 'insensitive' as const } },
            { status: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const orderBy = sortBy ? { [sortBy]: sortOrder } : { created: sortOrder }

    const [smsLogs, total] = await Promise.all([
      prisma.smsLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { first_name: true, last_name: true } } },
      }),
      prisma.smsLog.count({ where }),
    ])

    return {
      success: true,
      data: {
        smsLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get SMS logs') }
  }
}

// EMAIL LOG ACTIONS
export async function createEmailLog(data: CreateEmailLogInput) {
  try {
    const validatedData = createEmailLogSchema.parse(data)
    const emailLog = await prisma.emailLog.create({
      data: validatedData,
    })
    revalidatePath('/email-logs')
    return { success: true, data: emailLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'create email log') }
  }
}

export async function updateEmailLog(data: UpdateEmailLogInput) {
  try {
    const validatedData = updateEmailLogSchema.parse(data)
    const { id, ...updateData } = validatedData
    const emailLog = await prisma.emailLog.update({
      where: { id },
      data: updateData,
    })
    revalidatePath('/email-logs')
    return { success: true, data: emailLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'update email log') }
  }
}

export async function deleteEmailLog(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    await prisma.emailLog.delete({
      where: { id: validatedId.id },
    })
    revalidatePath('/email-logs')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleError(error, 'delete email log') }
  }
}

export async function getEmailLog(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: validatedId.id },
      include: { user: true },
    })
    return { success: true, data: emailLog }
  } catch (error) {
    return { success: false, error: handleError(error, 'get email log') }
  }
}

export async function getEmailLogs(params?: SearchInput) {
  try {
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, query, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const where = query
      ? {
          OR: [
            { subject: { contains: query, mode: 'insensitive' as const } },
            { message: { contains: query, mode: 'insensitive' as const } },
            { status: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const orderBy = sortBy ? { [sortBy]: sortOrder } : { created: sortOrder }

    const [emailLogs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { first_name: true, last_name: true } } },
      }),
      prisma.emailLog.count({ where }),
    ])

    return {
      success: true,
      data: {
        emailLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get email logs') }
  }
}

// TRAVEL FORM ACTIONS
export async function createTravelForm(data: CreateTravelFormInput) {
  try {
    const validatedData = createTravelFormSchema.parse(data)
    const travelForm = await prisma.travel_Forms.create({
      data: validatedData,
    })
    revalidatePath('/travel-forms')
    return { success: true, data: travelForm }
  } catch (error) {
    return { success: false, error: handleError(error, 'create travel form') }
  }
}

export async function updateTravelForm(data: UpdateTravelFormInput) {
  try {
    const validatedData = updateTravelFormSchema.parse(data)
    const { id, ...updateData } = validatedData
    const travelForm = await prisma.travel_Forms.update({
      where: { id },
      data: updateData,
    })
    revalidatePath('/travel-forms')
    return { success: true, data: travelForm }
  } catch (error) {
    return { success: false, error: handleError(error, 'update travel form') }
  }
}

export async function deleteTravelForm(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    await prisma.travel_Forms.delete({
      where: { id: validatedId.id },
    })
    revalidatePath('/travel-forms')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleError(error, 'delete travel form') }
  }
}

export async function getTravelForm(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    const travelForm = await prisma.travel_Forms.findUnique({
      where: { id: validatedId.id },
      include: { submitter: true },
    })
    return { success: true, data: travelForm }
  } catch (error) {
    return { success: false, error: handleError(error, 'get travel form') }
  }
}

export async function getTravelForms(params?: SearchInput) {
  try {
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, query, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { destination: { contains: query, mode: 'insensitive' as const } },
            { reasonsForTravel: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const orderBy = sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder }

    const [travelForms, total] = await Promise.all([
      prisma.travel_Forms.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { submitter: { select: { first_name: true, last_name: true } } },
      }),
      prisma.travel_Forms.count({ where }),
    ])

    return {
      success: true,
      data: {
        travelForms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get travel forms') }
  }
}

// TIME SHEET ACTIONS
export async function createTimeSheet(data: CreateTimeSheetInput) {
  try {
    const validatedData = createTimeSheetSchema.parse(data)
    const timeSheet = await prisma.time_Sheets.create({
      data: validatedData,
    })
    revalidatePath('/time-sheets')
    return { success: true, data: timeSheet }
  } catch (error) {
    return { success: false, error: handleError(error, 'create time sheet') }
  }
}

export async function updateTimeSheet(data: UpdateTimeSheetInput) {
  try {
    const validatedData = updateTimeSheetSchema.parse(data)
    const { id, ...updateData } = validatedData
    const timeSheet = await prisma.time_Sheets.update({
      where: { id },
      data: updateData,
    })
    revalidatePath('/time-sheets')
    return { success: true, data: timeSheet }
  } catch (error) {
    return { success: false, error: handleError(error, 'update time sheet') }
  }
}

export async function deleteTimeSheet(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    await prisma.time_Sheets.delete({
      where: { id: validatedId.id },
    })
    revalidatePath('/time-sheets')
    return { success: true }
  } catch (error) {
    return { success: false, error: handleError(error, 'delete time sheet') }
  }
}

export async function getTimeSheet(id: string) {
  try {
    const validatedId = idSchema.parse({ id })
    const timeSheet = await prisma.time_Sheets.findUnique({
      where: { id: validatedId.id },
      include: { User: true },
    })
    return { success: true, data: timeSheet }
  } catch (error) {
    return { success: false, error: handleError(error, 'get time sheet') }
  }
}

export async function getUserTimeSheets(userId: string, params?: Omit<SearchInput, 'query'>) {
  try {
    const validatedId = userIdSchema.parse({ id: userId })
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { created: sortOrder }

    const [timeSheets, total] = await Promise.all([
      prisma.time_Sheets.findMany({
        where: { userId: validatedId.id },
        orderBy,
        skip,
        take: limit,
        include: { User: { select: { first_name: true, last_name: true } } },
      }),
      prisma.time_Sheets.count({
        where: { userId: validatedId.id },
      }),
    ])

    return {
      success: true,
      data: {
        timeSheets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get user time sheets') }
  }
}

export async function getTimeSheets(params?: SearchInput) {
  try {
    const validatedParams = searchSchema.parse(params || {})
    const { page, limit, sortBy, sortOrder } = validatedParams
    
    const skip = (page - 1) * limit
    const orderBy = sortBy ? { [sortBy]: sortOrder } : { created: sortOrder }

    const [timeSheets, total] = await Promise.all([
      prisma.time_Sheets.findMany({
        orderBy,
        skip,
        take: limit,
        include: { User: { select: { first_name: true, last_name: true } } },
      }),
      prisma.time_Sheets.count(),
    ])

    return {
      success: true,
      data: {
        timeSheets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    return { success: false, error: handleError(error, 'get time sheets') }
  }
}

// Cleanup function to disconnect Prisma
export async function disconnect() {
  await prisma.$disconnect()
}