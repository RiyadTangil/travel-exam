import nodemailer from "nodemailer"

// Create a transporter with more detailed configuration
const smtpPort = Number(process.env.SMTP_PORT)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (Implicit SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
  debug: true, // Show debug output
  logger: true, // Log information
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  const mailOptions = {
    from: `"TravelHisab" <${process.env?.SMTP_FROM || process.env?.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email - TravelHisab",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">TravelHisab</h1>
          <p style="color: #666; margin: 5px 0;">Travel Agency Management Application</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up with TravelHisab! To complete your registration and access your account, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #0066cc;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Verification email sent:", info.response)
    return info
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  const mailOptions = {
    from: `"TravelHisab" <${process.env?.SMTP_FROM || process.env?.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - TravelHisab",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0066cc; margin: 0;">TravelHisab</h1>
          <p style="color: #666; margin: 5px 0;">Travel Agency Management Application</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #dc3545;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Password reset email sent:", info.response)
    return info
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

export async function sendCampaignEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content: string; encoding?: string; contentType?: string }>
) {
  const logoUrl = `${process.env.NEXTAUTH_URL || "https://travelhisab.com"}/main_log_bgremoved.png`;
  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const styledHtml = `
    <style>
      @media only screen and (max-width: 480px) {
        .outer-container {
          padding: 20px 12px !important;
        }
        .header-cell {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        .card-cell {
          padding: 20px !important;
        }
      }
    </style>
    <div class="outer-container" style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #334155; min-height: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-collapse: collapse; margin: 0 auto;">
        <!-- Top Header Row -->
        <tr>
          <td class="header-cell" style="padding-bottom: 20px;">
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <img src="${logoUrl}" alt="TravelHisab Logo" style="height: 36px; max-height: 36px; display: block;" />
                </td>
                <td align="right" style="vertical-align: middle; color: #64748b; font-size: 13px; font-weight: 500;">
                  ${formattedDate}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Message Card Container -->
        <tr>
          <td>
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f5fc; border: 1px solid #e2eaf4; border-radius: 16px; border-collapse: separate; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <tr>
                <td class="card-cell" style="padding: 32px; color: #1e293b; font-size: 15px; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  ${html}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bottom Footer Row -->
        <tr>
          <td align="center" style="padding-top: 30px;">
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td align="center" style="color: #005CC1; font-size: 16px; font-weight: 700; margin: 0;">
                  Team TravelHisab
                </td>
              </tr>
              <tr>
                <td align="center" style="color: #64748b; font-size: 12px; font-style: italic; padding-top: 4px; padding-bottom: 20px;">
                  Your smart way to manage travel agencies
                </td>
              </tr>
              <!-- Social Icons -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="https://www.facebook.com/TravelHisabOfficial/" target="_blank" style="text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; display: block; opacity: 0.8;" />
                        </a>
                      </td>
      
                      <td style="padding: 0 8px;">
                        <a href="https://www.youtube.com/watch?v=bxl2q6BGQPw" target="_blank" style="text-decoration: none;">
                          <img src="https://cdn-icons-png.flaticon.com/32/1384/1384060.png" alt="YouTube" style="width: 20px; height: 20px; display: block; opacity: 0.8;" />
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Divider Line -->
              <tr>
                <td style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                      <td align="center" style="color: #94a3b8; font-size: 11px; line-height: 1.5;">
                        Website: <a href="https://travelhisab.com" style="color: #005CC1; text-decoration: none; font-weight: 500;">travelhisab.com</a> | Phone: 01830799683
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="color: #94a3b8; font-size: 11px; line-height: 1.5; padding-top: 2px;">
                        Address: Cumilla, Bangladesh
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions: any = {
    from: `"TravelHisab" <${process.env?.SMTP_FROM || process.env?.SMTP_USER}>`,
    to,
    subject,
    html: styledHtml,
  }

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Campaign email sent:", info.response)
    return info
  } catch (error) {
    console.error("Error sending campaign email:", error)
    throw error
  }
}
