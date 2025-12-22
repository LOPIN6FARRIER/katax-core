// Ejemplo de validación de email y password con validadores asíncronos

import { k } from "../k"
import type { AsyncValidator } from "../core/AsyncResult"

// Simulamos una base de datos de emails existentes
const existingEmails = [
  'admin@example.com',
  'user@example.com',
  'test@example.com'
]

// Validador asíncrono para verificar si el email ya existe
const emailUniqueValidator: AsyncValidator<string> = async (email, path) => {
  console.log(`  🔍 Verificando disponibilidad del email: ${email}`)

  // Simulamos una consulta a la base de datos (delay de 100ms)
  await new Promise(resolve => setTimeout(resolve, 100))

  if (existingEmails.includes(email.toLowerCase())) {
    console.log(`  ❌ Email ${email} ya está registrado`)
    return [{
      path,
      message: `El email ${email} ya está en uso`
    }]
  }

  console.log(`  ✅ Email ${email} disponible`)
  return []
}

// Validador asíncrono para verificar contraseñas comprometidas
const passwordNotCompromisedValidator: AsyncValidator<string> = async (password, path) => {
  console.log(`  🔍 Verificando si la contraseña está comprometida...`)

  // Simulamos consulta a una API como "Have I Been Pwned"
  await new Promise(resolve => setTimeout(resolve, 150))

  // Lista de contraseñas comunes/comprometidas
  const compromisedPasswords = ['password123', '123456', 'qwerty', 'admin123']

  if (compromisedPasswords.includes(password.toLowerCase())) {
    console.log(`  ❌ Contraseña comprometida detectada`)
    return [{
      path,
      message: 'Esta contraseña ha sido comprometida en filtraciones de datos. Por favor elige otra.'
    }]
  }

  console.log(`  ✅ Contraseña segura`)
  return []
}

// Schema para el email con validaciones síncronas y asíncronas
const emailSchema = k.email()
  .asyncRefine(emailUniqueValidator)

// Schema para el password con validaciones síncronas y asíncronas
const passwordSchema = k.string()
  .minLength(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (@, #, $, etc.)")
  .asyncRefine(passwordNotCompromisedValidator)

// Schema completo de registro
const registrationSchema = k.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: k.string()
})

async function testEmailPasswordValidation() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║     VALIDACIÓN DE EMAIL Y PASSWORD - EJEMPLOS             ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // EJEMPLO 1: Email y password válidos
  console.log('📝 EJEMPLO 1: Email y password válidos')
  console.log('─────────────────────────────────────────────────')

  const validData = {
    email: 'nuevousuario@example.com',
    password: 'MiP@ssw0rd!Segura',
    confirmPassword: 'MiP@ssw0rd!Segura'
  }

  const result1 = await registrationSchema.safeParseAsync(validData)
  console.log('Resultado:', result1.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (result1.success) {
    console.log('Datos:', result1.data)
  } else {
    console.log('Errores:', result1.issues)
  }

  // EJEMPLO 2: Email ya existe
  console.log('\n📝 EJEMPLO 2: Email ya registrado')
  console.log('─────────────────────────────────────────────────')

  const existingEmailData = {
    email: 'admin@example.com',
    password: 'Segur@123!',
    confirmPassword: 'Segur@123!'
  }

  const result2 = await registrationSchema.safeParseAsync(existingEmailData)
  console.log('Resultado:', result2.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (!result2.success) {
    console.log('Errores:')
    result2.issues?.forEach((issue) => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // EJEMPLO 3: Password comprometida
  console.log('\n📝 EJEMPLO 3: Password comprometida')
  console.log('─────────────────────────────────────────────────')

  const compromisedPasswordData = {
    email: 'nuevo@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
  }

  const result3 = await registrationSchema.safeParseAsync(compromisedPasswordData)
  console.log('Resultado:', result3.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (!result3.success) {
    console.log('Errores:')
    result3.issues?.forEach((issue) => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // EJEMPLO 4: Password no cumple requisitos síncronos
  console.log('\n📝 EJEMPLO 4: Password no cumple requisitos (validación síncrona)')
  console.log('─────────────────────────────────────────────────')
  console.log('Nota: No llega a la validación asíncrona porque falla la síncrona primero\n')

  const weakPasswordData = {
    email: 'nuevo2@example.com',
    password: 'corta',
    confirmPassword: 'corta'
  }

  const result4 = await registrationSchema.safeParseAsync(weakPasswordData)
  console.log('Resultado:', result4.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (!result4.success) {
    console.log('Errores:')
    result4.issues?.forEach((issue) => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // EJEMPLO 5: Email inválido (formato incorrecto)
  console.log('\n📝 EJEMPLO 5: Email con formato inválido')
  console.log('─────────────────────────────────────────────────')
  console.log('Nota: No llega a verificar si existe porque el formato es inválido\n')

  const invalidEmailData = {
    email: 'esto-no-es-un-email',
    password: 'V@lid0Pass!',
    confirmPassword: 'V@lid0Pass!'
  }

  const result5 = await registrationSchema.safeParseAsync(invalidEmailData)
  console.log('Resultado:', result5.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (!result5.success) {
    console.log('Errores:')
    result5.issues?.forEach((issue) => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // EJEMPLO 6: Múltiples errores (email existente + password comprometida)
  console.log('\n📝 EJEMPLO 6: Múltiples errores asíncronos')
  console.log('─────────────────────────────────────────────────')

  const multipleErrorsData = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  }

  const result6 = await registrationSchema.safeParseAsync(multipleErrorsData)
  console.log('Resultado:', result6.success ? '✅ VÁLIDO' : '❌ INVÁLIDO')
  if (!result6.success) {
    console.log('Errores:')
    result6.issues?.forEach((issue) => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
  }

  // EJEMPLO 7: Usando parseAsync con try/catch
  console.log('\n📝 EJEMPLO 7: Usando parseAsync (lanza excepción)')
  console.log('─────────────────────────────────────────────────')

  try {
    const result7 = await registrationSchema.parseAsync({
      email: 'user@example.com',
      password: 'ValidP@ss123!',
      confirmPassword: 'ValidP@ss123!'
    })
    console.log('✅ Validación exitosa:', result7)
  } catch (error) {
    console.log('❌ Error capturado:', (error as Error).message)
    if (error && typeof error === 'object' && 'issues' in error) {
      console.log('Issues:')
      ;(error as any).issues.forEach((issue: any) => {
        console.log(`  - ${issue.path.join('.')}: ${issue.message}`)
      })
    }
  }

  // EJEMPLO 8: Solo validar email
  console.log('\n📝 EJEMPLO 8: Validación individual de email')
  console.log('─────────────────────────────────────────────────')

  const emailResult = await emailSchema.safeParseAsync('available@example.com')
  console.log('Email disponible:', emailResult.success ? '✅ SÍ' : '❌ NO')

  const emailResult2 = await emailSchema.safeParseAsync('admin@example.com')
  console.log('Email admin@example.com:', emailResult2.success ? '✅ DISPONIBLE' : '❌ YA EXISTE')
  if (!emailResult2.success) {
    console.log('Error:', emailResult2.issues?.[0].message)
  }

  // EJEMPLO 9: Solo validar password
  console.log('\n📝 EJEMPLO 9: Validación individual de password')
  console.log('─────────────────────────────────────────────────')

  const passResult = await passwordSchema.safeParseAsync('SuperSecur3!Password')
  console.log('Password segura:', passResult.success ? '✅ SÍ' : '❌ NO')

  const passResult2 = await passwordSchema.safeParseAsync('password123')
  console.log('Password "password123":', passResult2.success ? '✅ SEGURA' : '❌ COMPROMETIDA')
  if (!passResult2.success) {
    console.log('Error:', passResult2.issues?.[0].message)
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║                   EJEMPLOS COMPLETADOS                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
}

// Ejecutar los ejemplos
testEmailPasswordValidation().catch(console.error)
