import { k } from '../k';

console.log('=== Basic two dates validation ===');
const validTwoDates = k.twoDates().safeParse('2024-01-15|2024-01-20');
console.log('Valid two dates:', validTwoDates);

const validTwoDatesCustomSeparator = k.twoDates(',').safeParse('2024-01-15,2024-01-20');
console.log('Valid with custom separator:', validTwoDatesCustomSeparator);

const invalidFormat = k.twoDates().safeParse('not-a-date-string');
console.log('Invalid format:', invalidFormat);

const invalidType = k.twoDates().safeParse(123);
console.log('Invalid type (number):', invalidType);

const missingSecondDate = k.twoDates().safeParse('2024-01-15');
console.log('Missing second date:', missingSecondDate);

const tooManyDates = k.twoDates().safeParse('2024-01-15|2024-01-20|2024-01-25');
console.log('Too many dates:', tooManyDates);

console.log('\n=== Invalid individual dates ===');
const invalidFirstDate = k.twoDates().safeParse('not-a-date|2024-01-20');
console.log('Invalid first date:', invalidFirstDate);

const invalidSecondDate = k.twoDates().safeParse('2024-01-15|not-a-date');
console.log('Invalid second date:', invalidSecondDate);

const bothInvalid = k.twoDates().safeParse('invalid1|invalid2');
console.log('Both dates invalid:', bothInvalid);

console.log('\n=== Max difference validation (days) ===');
const maxDiffSchema = k.twoDates().maxDifference(7);

const validMaxDiff = maxDiffSchema.safeParse('2024-01-15|2024-01-20');
console.log('Valid max diff (5 days):', validMaxDiff);

const validMaxDiffExact = maxDiffSchema.safeParse('2024-01-15|2024-01-22');
console.log('Valid max diff (7 days exact):', validMaxDiffExact);

const invalidMaxDiff = maxDiffSchema.safeParse('2024-01-15|2024-01-30');
console.log('Invalid max diff (15 days):', invalidMaxDiff);

const validMaxDiffReverse = maxDiffSchema.safeParse('2024-01-30|2024-01-25');
console.log('Valid max diff reverse order (5 days):', validMaxDiffReverse);

console.log('\n=== Min difference validation (days) ===');
const minDiffSchema = k.twoDates().minDifference(7);

const validMinDiff = minDiffSchema.safeParse('2024-01-15|2024-01-30');
console.log('Valid min diff (15 days):', validMinDiff);

const validMinDiffExact = minDiffSchema.safeParse('2024-01-15|2024-01-22');
console.log('Valid min diff (7 days exact):', validMinDiffExact);

const invalidMinDiff = minDiffSchema.safeParse('2024-01-15|2024-01-18');
console.log('Invalid min diff (3 days):', invalidMinDiff);

console.log('\n=== Max difference validation (hours) ===');
const maxDiffHoursSchema = k.twoDates().maxDifferenceHours(24);

const validMaxDiffHours = maxDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-15T20:00:00Z');
console.log('Valid max diff hours (10 hours):', validMaxDiffHours);

const validMaxDiffHoursExact = maxDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-16T10:00:00Z');
console.log('Valid max diff hours (24 hours exact):', validMaxDiffHoursExact);

const invalidMaxDiffHours = maxDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-17T10:00:00Z');
console.log('Invalid max diff hours (48 hours):', invalidMaxDiffHours);

console.log('\n=== Min difference validation (hours) ===');
const minDiffHoursSchema = k.twoDates().minDifferenceHours(12);

const validMinDiffHours = minDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-16T10:00:00Z');
console.log('Valid min diff hours (24 hours):', validMinDiffHours);

const validMinDiffHoursExact = minDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-15T22:00:00Z');
console.log('Valid min diff hours (12 hours exact):', validMinDiffHoursExact);

const invalidMinDiffHours = minDiffHoursSchema.safeParse('2024-01-15T10:00:00Z|2024-01-15T15:00:00Z');
console.log('Invalid min diff hours (5 hours):', invalidMinDiffHours);

console.log('\n=== Order validation (ascending) ===');
const ascendingSchema = k.twoDates().order(true);

const validAscending = ascendingSchema.safeParse('2024-01-15|2024-01-20');
console.log('Valid ascending order:', validAscending);

const validAscendingEqual = ascendingSchema.safeParse('2024-01-15|2024-01-15');
console.log('Valid ascending order (equal):', validAscendingEqual);

const invalidAscending = ascendingSchema.safeParse('2024-01-20|2024-01-15');
console.log('Invalid ascending order:', invalidAscending);

console.log('\n=== Order validation (descending) ===');
const descendingSchema = k.twoDates().order(false);

const validDescending = descendingSchema.safeParse('2024-01-20|2024-01-15');
console.log('Valid descending order:', validDescending);

const validDescendingEqual = descendingSchema.safeParse('2024-01-15|2024-01-15');
console.log('Valid descending order (equal):', validDescendingEqual);

const invalidDescending = descendingSchema.safeParse('2024-01-15|2024-01-20');
console.log('Invalid descending order:', invalidDescending);

console.log('\n=== Chaining validations ===');
const chainedSchema = k.twoDates()
  .order(true)
  .maxDifference(30)
  .minDifference(1);

const validChained = chainedSchema.safeParse('2024-01-15|2024-01-30');
console.log('Valid chained (15 days, ascending):', validChained);

const invalidChainedOrder = chainedSchema.safeParse('2024-01-30|2024-01-15');
console.log('Invalid chained (wrong order):', invalidChainedOrder);

const invalidChainedMaxDiff = chainedSchema.safeParse('2024-01-15|2024-03-15');
console.log('Invalid chained (too far apart):', invalidChainedMaxDiff);

const invalidChainedMinDiff = chainedSchema.safeParse('2024-01-15|2024-01-15');
console.log('Invalid chained (same date, needs at least 1 day):', invalidChainedMinDiff);

console.log('\n=== Custom separators ===');
const commaSeparator = k.twoDates(',').safeParse('2024-01-15,2024-01-20');
console.log('Comma separator:', commaSeparator);

const slashSeparator = k.twoDates('/').safeParse('2024-01-15/2024-01-20');
console.log('Slash separator:', slashSeparator);

const dashSeparator = k.twoDates(' - ').safeParse('2024-01-15 - 2024-01-20');
console.log('Dash separator with spaces:', dashSeparator);

console.log('\n=== Custom error messages ===');
const customErrorSchema = k.twoDates()
  .order(true, 'La fecha de inicio debe ser anterior a la fecha de fin')
  .maxDifference(90, 'El rango de fechas no puede exceder 90 días');

const invalidCustom = customErrorSchema.safeParse('2024-01-15|2024-06-15');
console.log('Custom error (too many days):', invalidCustom);

const invalidCustomOrder = customErrorSchema.safeParse('2024-06-15|2024-01-15');
console.log('Custom error (wrong order):', invalidCustomOrder);

console.log('\n=== Real world examples ===');

// Date range picker (hotel booking)
const hotelBooking = k.twoDates()
  .order(true, 'La fecha de salida debe ser posterior a la fecha de entrada')
  .minDifference(1, 'La reserva debe ser de al menos 1 noche')
  .maxDifference(30, 'La reserva no puede exceder 30 noches');

console.log('Hotel booking (valid 7 nights):', hotelBooking.safeParse('2024-06-15|2024-06-22'));
console.log('Hotel booking (invalid same day):', hotelBooking.safeParse('2024-06-15|2024-06-15'));
console.log('Hotel booking (invalid too long):', hotelBooking.safeParse('2024-06-15|2024-08-15'));

// Meeting time range
const meetingTime = k.twoDates(',')
  .order(true)
  .maxDifferenceHours(4, 'Las reuniones no pueden durar más de 4 horas')
  .minDifferenceHours(1, 'Las reuniones deben durar al menos 1 hora');

console.log('Meeting (2 hours):', meetingTime.safeParse('2024-06-15T10:00:00Z,2024-06-15T12:00:00Z'));
console.log('Meeting (30 minutes):', meetingTime.safeParse('2024-06-15T10:00:00Z,2024-06-15T10:30:00Z'));
console.log('Meeting (5 hours):', meetingTime.safeParse('2024-06-15T10:00:00Z,2024-06-15T15:00:00Z'));

// Contract period
const contractPeriod = k.twoDates(' to ')
  .order(true)
  .minDifference(365, 'El contrato debe ser de al menos 1 año');

console.log('Contract (1 year):', contractPeriod.safeParse('2024-01-01 to 2025-01-01'));
console.log('Contract (6 months):', contractPeriod.safeParse('2024-01-01 to 2024-07-01'));

// Event duration with exact hours
const eventDuration = k.twoDates()
  .order(true)
  .maxDifferenceHours(48)
  .minDifferenceHours(2);

console.log('Event (24 hours):', eventDuration.safeParse('2024-06-15T10:00:00Z|2024-06-16T10:00:00Z'));
console.log('Event (1 hour):', eventDuration.safeParse('2024-06-15T10:00:00Z|2024-06-15T11:00:00Z'));

console.log('\n=== Edge cases ===');

// Trimming spaces
const withSpaces = k.twoDates().safeParse('  2024-01-15  |  2024-01-20  ');
console.log('With spaces (should be trimmed):', withSpaces);

// Different time zones
const diffTimezones = k.twoDates().safeParse('2024-01-15T10:00:00+00:00|2024-01-15T10:00:00+05:00');
console.log('Different timezones:', diffTimezones);

// Leap year
const leapYear = k.twoDates().safeParse('2024-02-28|2024-02-29');
console.log('Leap year date:', leapYear);

// Same date and time
const sameDateTime = k.twoDates().safeParse('2024-06-15T10:00:00Z|2024-06-15T10:00:00Z');
console.log('Same date and time:', sameDateTime);
