import { k } from '../k';

console.log('=== Basic date validation ===');
const validDate = k.date().safeParse('2024-01-15');
console.log('Valid date:', validDate);

const validDateTime = k.date().safeParse('2024-01-15T10:30:00Z');
console.log('Valid datetime:', validDateTime);

const invalidDate = k.date().safeParse('not-a-date');
console.log('Invalid date string:', invalidDate);

const invalidType = k.date().safeParse(123);
console.log('Invalid type (number):', invalidType);

const invalidTypeDate = k.date().safeParse(new Date());
console.log('Invalid type (Date object):', invalidTypeDate);

console.log('\n=== Min date validation ===');
const minDateSchema = k.date().min('2024-01-01');
const validMin = minDateSchema.safeParse('2024-06-15');
console.log('Valid min date:', validMin);

const invalidMin = minDateSchema.safeParse('2023-12-31');
console.log('Invalid min date:', invalidMin);

const equalMin = minDateSchema.safeParse('2024-01-01');
console.log('Equal to min date:', equalMin);

console.log('\n=== Max date validation ===');
const maxDateSchema = k.date().max('2024-12-31');
const validMax = maxDateSchema.safeParse('2024-06-15');
console.log('Valid max date:', validMax);

const invalidMax = maxDateSchema.safeParse('2025-01-01');
console.log('Invalid max date:', invalidMax);

const equalMax = maxDateSchema.safeParse('2024-12-31');
console.log('Equal to max date:', equalMax);

console.log('\n=== Between date validation ===');
const betweenSchema = k.date().between('2024-01-01', '2024-12-31');
const validBetween = betweenSchema.safeParse('2024-06-15');
console.log('Valid between:', validBetween);

const invalidBetweenBefore = betweenSchema.safeParse('2023-12-31');
console.log('Before range:', invalidBetweenBefore);

const invalidBetweenAfter = betweenSchema.safeParse('2025-01-01');
console.log('After range:', invalidBetweenAfter);

const equalStart = betweenSchema.safeParse('2024-01-01');
console.log('Equal to start:', equalStart);

const equalEnd = betweenSchema.safeParse('2024-12-31');
console.log('Equal to end:', equalEnd);

console.log('\n=== Future date validation ===');
const futureSchema = k.date().isFuture();
const futureDate = futureSchema.safeParse('2030-01-01');
console.log('Future date:', futureDate);

const pastDate = futureSchema.safeParse('2020-01-01');
console.log('Past date (should fail):', pastDate);

console.log('\n=== Past date validation ===');
const pastSchema = k.date().isPast();
const validPast = pastSchema.safeParse('2020-01-01');
console.log('Past date:', validPast);

const invalidPast = pastSchema.safeParse('2030-01-01');
console.log('Future date (should fail):', invalidPast);

console.log('\n=== Chaining validations ===');
const chainedSchema = k.date()
  .min('2024-01-01')
  .max('2024-12-31')
  .isPast();

const validChained = chainedSchema.safeParse('2024-06-15');
console.log('Valid chained (if before today):', validChained);

const invalidChainedMin = chainedSchema.safeParse('2023-12-31');
console.log('Invalid chained (before min):', invalidChainedMin);

const invalidChainedMax = chainedSchema.safeParse('2025-01-01');
console.log('Invalid chained (after max):', invalidChainedMax);

console.log('\n=== Custom error messages ===');
const customErrorSchema = k.date()
  .min('2024-01-01', 'La fecha debe ser posterior al 1 de enero de 2024')
  .max('2024-12-31', 'La fecha debe ser anterior al 31 de diciembre de 2024');

const invalidCustom = customErrorSchema.safeParse('2023-06-15');
console.log('Custom error message:', invalidCustom);

console.log('\n=== Optional validation ===');
const optionalDate = k.date().min('2024-01-01').optional();

const validOptionalValue = optionalDate.safeParse('2024-06-15');
console.log('Optional with value:', validOptionalValue);

const validOptionalUndefined = optionalDate.safeParse(undefined);
console.log('Optional with undefined:', validOptionalUndefined);

const invalidOptional = optionalDate.safeParse('2023-12-31');
console.log('Optional with invalid value:', invalidOptional);

console.log('\n=== Nullable validation ===');
const nullableDate = k.date().isPast().nullable();

const validNullableValue = nullableDate.safeParse('2020-01-01');
console.log('Nullable with value:', validNullableValue);

const validNullableNull = nullableDate.safeParse(null);
console.log('Nullable with null:', validNullableNull);

const invalidNullable = nullableDate.safeParse('2030-01-01');
console.log('Nullable with invalid value:', invalidNullable);

console.log('\n=== Real world examples ===');

// Birth date validation
const birthDate = k.date()
  .max('2024-12-31', 'Fecha de nacimiento no puede ser en el futuro')
  .min('1900-01-01', 'Fecha de nacimiento inválida')
  .isPast();

console.log('Birth date (1990-05-15):', birthDate.safeParse('1990-05-15'));
console.log('Birth date (2030-01-01):', birthDate.safeParse('2030-01-01'));

// Event date validation
const eventDate = k.date()
  .min('2024-01-01')
  .isFuture('El evento debe ser en el futuro');

const futureEvent = new Date();
futureEvent.setDate(futureEvent.getDate() + 30);
console.log('Event date (30 days from now):', eventDate.safeParse(futureEvent.toISOString().split('T')[0]));

// Appointment booking (between specific dates)
const appointmentDate = k.date()
  .between('2024-01-01', '2024-12-31', 'Las citas solo están disponibles en 2024')
  .isFuture('Solo se pueden reservar citas futuras');

console.log('Appointment (2024-06-15):', appointmentDate.safeParse('2024-06-15'));
console.log('Appointment (2025-01-01):', appointmentDate.safeParse('2025-01-01'));

// Contract expiry date
const expiryDate = k.date()
  .isFuture('La fecha de expiración debe ser futura')
  .optional();

console.log('Expiry date (2025-12-31):', expiryDate.safeParse('2025-12-31'));
console.log('Expiry date (undefined):', expiryDate.safeParse(undefined));

console.log('\n=== ISO 8601 format tests ===');
const isoSchema = k.date();

console.log('Date only (2024-01-15):', isoSchema.safeParse('2024-01-15'));
console.log('DateTime with Z (2024-01-15T10:30:00Z):', isoSchema.safeParse('2024-01-15T10:30:00Z'));
console.log('DateTime with offset (2024-01-15T10:30:00+05:00):', isoSchema.safeParse('2024-01-15T10:30:00+05:00'));
console.log('DateTime without Z (2024-01-15T10:30:00):', isoSchema.safeParse('2024-01-15T10:30:00'));
console.log('Invalid format (15/01/2024):', isoSchema.safeParse('15/01/2024'));
console.log('Invalid format (01-15-2024):', isoSchema.safeParse('01-15-2024'));

console.log('\n=== Date only validation ===');
const onlyDateSchema = k.date().isDateOnly();
console.log('Valid date only (2024-01-15):', onlyDateSchema.safeParse('2024-01-15'));
console.log('Invalid with time (2024-01-15T10:30:00Z):', onlyDateSchema.safeParse('2024-01-15T10:30:00Z'));
console.log('Invalid with space time (2024-01-15 10:30:00):', onlyDateSchema.safeParse('2024-01-15 10:30:00'));

console.log('\n=== Has time validation ===');
const hasTimeSchema = k.date().hasTime();
console.log('Valid with T (2024-01-15T10:30:00Z):', hasTimeSchema.safeParse('2024-01-15T10:30:00Z'));
console.log('Valid with space (2024-01-15 10:30:00):', hasTimeSchema.safeParse('2024-01-15 10:30:00'));
console.log('Invalid date only (2024-01-15):', hasTimeSchema.safeParse('2024-01-15'));

console.log('\n=== Format validation (ISO formats only) ===');
const dateOnlyFormat = k.date().format('yyyy-MM-dd');
console.log('Valid format (2024-01-15):', dateOnlyFormat.safeParse('2024-01-15'));
console.log('Invalid format with time (2024-01-15T10:30:00Z):', dateOnlyFormat.safeParse('2024-01-15T10:30:00Z'));

const dateTimeFormat = k.date().format('yyyy-MM-dd HH:mm:ss');
console.log('Valid datetime format (2024-01-15 10:30:00):', dateTimeFormat.safeParse('2024-01-15 10:30:00'));
console.log('Invalid datetime missing seconds (2024-01-15 10:30):', dateTimeFormat.safeParse('2024-01-15 10:30'));

const monthYearFormat = k.date().format('yyyy-MM');
console.log('Valid month/year (2024-01):', monthYearFormat.safeParse('2024-01'));
console.log('Invalid with day (2024-01-15):', monthYearFormat.safeParse('2024-01-15'));

console.log('\n=== Chaining with format ===');
const strictDateSchema = k.date()
  .format('yyyy-MM-dd')
  .min('2024-01-01')
  .max('2024-12-31');

console.log('Valid strict date (2024-06-15):', strictDateSchema.safeParse('2024-06-15'));
console.log('Invalid with time (2024-06-15T10:00:00Z):', strictDateSchema.safeParse('2024-06-15T10:00:00Z'));
console.log('Invalid out of range (2025-01-01):', strictDateSchema.safeParse('2025-01-01'));

console.log('\n=== Practical use cases with format ===');
// API that only accepts date without time
const apiDateOnly = k.date()
  .isDateOnly('La fecha no debe incluir hora')
  .between('2024-01-01', '2024-12-31');

console.log('API date only (2024-06-15):', apiDateOnly.safeParse('2024-06-15'));
console.log('API date with time (2024-06-15T10:00:00Z):', apiDateOnly.safeParse('2024-06-15T10:00:00Z'));

// API that requires datetime
const apiDateTime = k.date()
  .hasTime('La fecha debe incluir hora')
  .isFuture();

console.log('API datetime (future):', apiDateTime.safeParse('2030-01-15T10:00:00Z'));
console.log('API date only (should fail):', apiDateTime.safeParse('2030-01-15'));

console.log('\n=== Format Output (transformación de salida) ===');
const dateToString = k.date().formatOutput('yyyy-MM-dd');
console.log('Date to string (2024-01-15):', dateToString.safeParse('2024-01-15'));
console.log('Date to string (2024-01-15T10:30:00Z):', dateToString.safeParse('2024-01-15T10:30:00Z'));

const dateToUSFormat = k.date().formatOutput('MM/dd/yyyy');
console.log('Date to US format (2024-01-15):', dateToUSFormat.safeParse('2024-01-15'));

const dateToLongFormat = k.date().formatOutput('MMMM dd, yyyy');
console.log('Date to long format (2024-01-15):', dateToLongFormat.safeParse('2024-01-15'));

const dateTimeToCustom = k.date().formatOutput('yyyy-MM-dd HH:mm:ss');
console.log('DateTime to custom (2024-01-15T10:30:45Z):', dateTimeToCustom.safeParse('2024-01-15T10:30:45Z'));

console.log('\n=== Format Output con validaciones ===');
const validatedDateOutput = k.date()
  .min('2024-01-01')
  .max('2024-12-31')
  .formatOutput('dd/MM/yyyy');

console.log('Valid date formatted (2024-06-15):', validatedDateOutput.safeParse('2024-06-15'));
console.log('Invalid date out of range (2025-01-01):', validatedDateOutput.safeParse('2025-01-01'));

const strictDateOutput = k.date()
  .isDateOnly('Solo fechas sin hora')
  .formatOutput('yyyy-MM-dd');

console.log('Date only formatted (2024-06-15):', strictDateOutput.safeParse('2024-06-15'));
console.log('Date with time (should fail validation):', strictDateOutput.safeParse('2024-06-15T10:00:00Z'));

console.log('\n=== Casos de uso reales con formatOutput ===');
// API que recibe ISO pero devuelve formato local
const apiLocalDate = k.date()
  .between('2024-01-01', '2024-12-31')
  .formatOutput('dd/MM/yyyy');

console.log('API local format (2024-06-15):', apiLocalDate.safeParse('2024-06-15'));

// Timestamp legible
const readableTimestamp = k.date()
  .hasTime()
  .formatOutput('yyyy-MM-dd HH:mm:ss');

console.log('Readable timestamp (2024-06-15T14:30:00Z):', readableTimestamp.safeParse('2024-06-15T14:30:00Z'));

// Month and year only
const monthYear = k.date().formatOutput('MMMM yyyy');
console.log('Month and year (2024-06-15):', monthYear.safeParse('2024-06-15'));

// Relative format (day of week)
const withDayOfWeek = k.date().formatOutput('EEEE, MMMM dd, yyyy');
console.log('With day of week (2024-01-15):', withDayOfWeek.safeParse('2024-01-15'));
