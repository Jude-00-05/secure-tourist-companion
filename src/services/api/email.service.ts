// Email Service - Real email implementation using EmailJS

import emailjs from '@emailjs/browser';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  incidentId: string;
  teamType: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// EmailJS Configuration - Update these with your EmailJS credentials
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key',
};

/**
 * Initialize EmailJS with public key
 */
export function initializeEmailJS() {
  if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }
}

/**
 * Send email notification for incident dispatch using EmailJS
 */
export async function sendDispatchEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_CONFIG.SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID === 'your_service_id') {
      console.warn('⚠️ EmailJS not configured. Please set VITE_EMAILJS_SERVICE_ID in your .env file');
      return {
        success: false,
        error: 'EmailJS service not configured. Please check environment variables.',
      };
    }

    console.log('📧 Sending dispatch email via EmailJS:', {
      to: emailData.to,
      subject: emailData.subject,
      incidentId: emailData.incidentId,
      teamType: emailData.teamType,
      priority: emailData.priority,
    });

    // Prepare template parameters for EmailJS
    // Note: EmailJS doesn't allow dynamic recipients for security reasons
    // The recipient email must be configured in the EmailJS template/dashboard
    const templateParams = {
      subject: emailData.subject,
      message: emailData.body,
      incident_id: emailData.incidentId,
      team_type: emailData.teamType,
      priority: emailData.priority,
      timestamp: new Date().toLocaleString(),
    };

    // Send email using EmailJS
    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Email sent successfully:', result);

    return {
      success: true,
      messageId: result.text,
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate email content for incident dispatch
 */
export function generateDispatchEmailContent(
  incident: {
    id: string;
    title: string;
    severity: string;
    location: { name: string; lat: number; lng: number };
    timestamp: string;
    description: string;
    affectedUser: string;
    geofenceId: string;
  },
  teamType: string,
  dispatchedBy: string = 'Admin'
): EmailData {
  const subject = `🚨 EMERGENCY DISPATCH: ${incident.title} - ${teamType.toUpperCase()}`;

  const body = `
EMERGENCY RESPONSE DISPATCH ALERT

Incident Details:
---------------
ID: ${incident.id}
Title: ${incident.title}
Severity: ${incident.severity.toUpperCase()}
Location: ${incident.location.name} (${incident.location.lat}, ${incident.location.lng})
Timestamp: ${new Date(incident.timestamp).toLocaleString()}

Description:
${incident.description}

Affected User ID: ${incident.affectedUser}
Geofence: ${incident.geofenceId}

Response Team: ${teamType}
Dispatched By: ${dispatchedBy}
Dispatch Time: ${new Date().toLocaleString()}

Action Required:
- Respond immediately to the location
- Coordinate with local authorities if needed
- Update incident status upon arrival
- Provide medical/security assistance as required

Location Coordinates:
Latitude: ${incident.location.lat}
Longitude: ${incident.location.lng}

Please acknowledge receipt of this alert and confirm ETA.

This is an automated emergency dispatch notification.
Do not reply to this email.
`;

  return {
    to: 'alwinsunnyjude@gmail.com', // As specified by user
    subject,
    body: body.trim(),
    incidentId: incident.id,
    teamType,
    priority: incident.severity as 'high' | 'medium' | 'low',
  };
}