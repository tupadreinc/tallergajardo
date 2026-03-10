import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendStatusEmail(email: string, status: string, date: string, clientName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurado, omitiendo email.')
    return { success: false, error: 'API key no configurada' }
  }

  const subject = `Estado actualizado: Mantención del ${date}`

  let statusText = status
  let message = ''

  if (status === 'confirmed') {
    statusText = 'Confirmada'
    message = 'Tu reserva ha sido confirmada y tu vehículo está en nuestro taller siendo evaluado/reparado.'
  } else if (status === 'completed') {
    statusText = 'Completada'
    message = '¡Buenas noticias! Tu mantención ha finalizado. Puedes revisar el detalle y venir a retirar tu vehículo.'
  } else if (status === 'cancelled') {
    statusText = 'Cancelada'
    message = 'Tu reserva ha sido cancelada.'
  } else if (status === 'pending') {
    statusText = 'Pendiente'
    message = 'Tu reserva está actualmente en estado Pendiente. Te notificaremos cualquier cambio.'
  }

  try {
    if (!resend) throw new Error('Resend is not initialized')
    const { data, error } = await resend.emails.send({
      from: 'Taller Mecánico Gajardo <notificaciones@resend.dev>',
      to: [email],
      subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Hola ${clientName},</h2>
          <p>El estado de tu mantención agendada para el <strong>${date}</strong> ha sido actualizado.</p>
          <div style="padding: 15px; border-left: 4px solid #10b981; background: #f8fafc; margin: 20px 0;">
            <strong>Nuevo estado:</strong> ${statusText}
          </div>
          <p>${message}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Puedes ver más detalles ingresando al panel de cliente en nuestra plataforma.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #94a3b8;">Gracias por confiar en Taller Mecánico Gajardo.</p>
        </div>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Error al enviar email.' }
  }
}

export async function sendPartRequestEmail(email: string, partName: string, date: string, clientName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurado, omitiendo email de repuesto.')
    return { success: false, error: 'API key no configurada' }
  }

  try {
    if (!resend) throw new Error('Resend is not initialized')
    const { data, error } = await resend.emails.send({
      from: 'Taller Mecánico Gajardo <notificaciones@resend.dev>',
      to: [email],
      subject: `Repuesto Requerido para tu mantención del ${date}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">Hola ${clientName},</h2>
          <p>Durante la revisión de tu vehículo para la mantención del <strong>${date}</strong>, hemos detectado que necesitas proveer el siguiente repuesto:</p>
          <div style="padding: 15px; border: 1px dashed #f59e0b; border-radius: 8px; background: #fffbeb; margin: 20px 0;">
            <strong style="color: #d97706; font-size: 18px;">${partName}</strong>
          </div>
          <p>Te pedimos por favor gestionarlo a la brevedad para poder avanzar con tu reparación.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Puedes revisar las instrucciones completas en tu panel de cliente.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #94a3b8;">Atte. Equipo del Taller.</p>
        </div>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Error al enviar email.' }
  }
}

export async function sendNewAppointmentToAdmin(adminEmail: string, clientName: string, date: string, time: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurado, omitiendo email de nueva cita al admin.')
    return { success: false, error: 'API key no configurada' }
  }

  try {
    if (!resend) throw new Error('Resend is not initialized')
    const { data, error } = await resend.emails.send({
      from: 'Taller Mecánico Gajardo <notificaciones@resend.dev>',
      to: [adminEmail],
      subject: `Nueva mantención agendada - ${clientName} (${date})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">📅 Nueva Mantención Agendada</h2>
          <p>El cliente <strong>${clientName}</strong> ha agendado una mantención a través de la plataforma.</p>
          <div style="padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc; margin: 20px 0;">
            <strong>Fecha:</strong> ${date}<br/>
            <strong>Hora:</strong> ${time}
          </div>
          <p>Ingresa al panel de administración para revisar los detalles y confirmar la cita.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #94a3b8;">Notificación automática del sistema - Taller Mecánico Gajardo.</p>
        </div>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Error al enviar email de notificación al admin.' }
  }
}

export async function sendWelcomeEmail(clientEmail: string, clientName: string, password: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY no configurado, omitiendo email de bienvenida.')
    return { success: false, error: 'API key no configurada' }
  }

  try {
    if (!resend) throw new Error('Resend is not initialized')
    const { data, error } = await resend.emails.send({
      from: 'Taller Mecánico Gajardo <notificaciones@resend.dev>',
      to: [clientEmail],
      subject: '¡Bienvenido a Taller Mecánico Gajardo!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">¡Hola ${clientName}! 👋</h2>
          <p>Se ha creado una cuenta para ti en el sistema de <strong>Taller Mecánico Gajardo</strong>.</p>
          <p>Ya puedes ingresar a la plataforma para agendar mantenciones y revisar el estado de tus vehículos.</p>
          <div style="padding: 20px; border-left: 4px solid #10b981; background: #f8fafc; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0;"><strong>📧 Tu correo:</strong> ${clientEmail}</p>
            <p style="margin: 0;"><strong>🔑 Tu contraseña temporal:</strong> ${password}</p>
          </div>
          <p style="color: #dc2626; font-size: 14px;">⚠️ Te recomendamos cambiar tu contraseña después de tu primer ingreso.</p>
          <p style="margin-top: 20px;">
            Ingresa aquí: <a href="https://tallergajardo.vercel.app/login" style="color: #10b981; font-weight: bold;">tallergajardo.vercel.app/login</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #94a3b8;">Gracias por confiar en Taller Mecánico Gajardo.</p>
        </div>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Error al enviar email de bienvenida.' }
  }
}
