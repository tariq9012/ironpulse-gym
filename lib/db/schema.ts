import { pgTable, text, integer, timestamp, boolean, uuid, numeric } from 'drizzle-orm/pg-core'

export const members = pgTable('members', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  membershipPlan: text('membership_plan').notNull().default('Performance'),
  membershipStatus: text('membership_status').notNull().default('active'),
  membershipStart: timestamp('membership_start', { withTimezone: true }).notNull().defaultNow(),
  membershipEnd: timestamp('membership_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  coach: text('coach').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  capacity: integer('capacity').notNull().default(12),
  room: text('room').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  classId: uuid('class_id').notNull(),
  status: text('status').notNull().default('booked'),
  bookedAt: timestamp('booked_at', { withTimezone: true }).notNull().defaultNow(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
})

export const progressEntries = pgTable('progress_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  weightKg: numeric('weight_kg', { precision: 5, scale: 1 }).notNull(),
  bodyFat: numeric('body_fat', { precision: 4, scale: 1 }),
  notes: text('notes'),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id').notNull(),
  title: text('title').notNull(),
  muscleGroup: text('muscle_group').notNull(),
  sets: integer('sets').notNull().default(3),
  reps: text('reps').notNull().default('8-12'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workoutSets = pgTable('workout_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id').notNull(),
  exerciseId: uuid('exercise_id').notNull(),
  userId: text('user_id').notNull(),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weightKg: numeric('weight_kg', { precision: 6, scale: 2 }),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('assigned'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').notNull().default('paid'),
  paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
})

export const mealLogs = pgTable('meal_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  mealDate: timestamp('meal_date', { withTimezone: true }).notNull(),
  mealType: text('meal_type').notNull(),
  mealName: text('meal_name').notNull().default('Meal'),
  calories: integer('calories').notNull().default(0),
  proteinG: numeric('protein_g', { precision: 6, scale: 1 }).notNull().default('0'),
  carbsG: numeric('carbs_g', { precision: 6, scale: 1 }).notNull().default('0'),
  fatG: numeric('fat_g', { precision: 6, scale: 1 }).notNull().default('0'),
  notes: text('notes'),
  completed: boolean('completed').notNull().default(false),
})

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const trainers = pgTable('trainers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  specialty: text('specialty'),
  bio: text('bio'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const classTrainers = pgTable('class_trainers', {
  classId: uuid('class_id').notNull(),
  trainerId: uuid('trainer_id').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
})

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').notNull().unique(),
  classId: uuid('class_id').notNull(),
  memberId: text('member_id').notNull(),
  markedBy: text('marked_by').notNull(),
  status: text('status').notNull().default('present'),
  note: text('note'),
  markedAt: timestamp('marked_at', { withTimezone: true }).notNull().defaultNow(),
})

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: text('member_id').notNull(),
  trainerId: uuid('trainer_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
})

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull(),
  senderUserId: text('sender_user_id').notNull(),
  body: text('body').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const goals = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  target: integer('target').notNull(),
  current: integer('current').notNull().default(0),
  unit: text('unit').notNull(),
})
