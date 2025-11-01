import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

console.log("resend key: ", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPriceDropEmail = async ({
  to,
  productTitle,
  oldPrice,
  newPrice,
  productUrl,
  productImage,
}) => {
  try {
    const discount = oldPrice - newPrice;
    const discountPercent = ((discount / oldPrice) * 100).toFixed(1);

    const { data, error } = await resend.emails.send({
      from: "Pricewise <alerts@dotivia.com>",
      to: [to],
      subject: `Price Drop Alert: ${productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              a {
              color: white;
              }
              .container { 
                max-width: 600px; 
                margin: 20px auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                background-color:  #041d09;
                color: white; 
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 700;
              }
              .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.95;
              }
              .content { 
                padding: 40px 30px;
              }
              .product-image { 
                width: 100%; 
                max-width: 300px;
                height: auto; 
                border-radius: 12px;
                margin: 0 auto 30px;
                display: block;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .product-title {
                color: #1f2937;
                font-size: 22px;
                font-weight: 600;
                margin: 0 0 30px 0;
                text-align: center;
                line-height: 1.4;
              }
              .price-box { 
                background: #f9fafb;
                padding: 30px;
                border-radius: 12px;
                margin: 30px 0;
                border: 2px solid #e5e7eb;
              }
              .price-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              }
              .price-label {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .old-price { 
                text-decoration: line-through; 
                color: #9ca3af;
                font-size: 20px;
                font-weight: 600;
              }
              .new-price { 
                color: #16a34a;
                font-size: 36px;
                font-weight: 700;
                margin: 10px 0;
              }
              .discount-badge { 
                background-color: #041d09;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin: 15px 0;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);
              }
              .cta-button { 
                background-color: #041d09;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                margin: 30px 0;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
              }
              .cta-button:hover {
                box-shadow: 0 6px 12px rgba(22, 163, 74, 0.4);
              }
              .cta-wrapper {
                text-align: center;
              }
              .info-text {
                margin-top: 30px;
                padding: 20px;
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                border-radius: 4px;
                color: #1e40af;
                font-size: 14px;
                line-height: 1.6;
              }
              .footer { 
                text-align: center;
                padding: 30px;
                background: #f9fafb;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                margin: 5px 0;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 8px;
                }
                .header {
                  padding: 30px 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
                .new-price {
                  font-size: 28px;
                }
                .price-box {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Price Drop Alert!</h1>
                <p>The price of the product you're tracking has dropped </p>
              </div>
              
              <div class="content">
                <img src="${productImage}" alt="${productTitle}" class="product-image" onerror="this.style.display='none'" />
                
                <h2 class="product-title">${productTitle}</h2>
                
                <div class="price-box">
                  <div class="price-row">
                    <span class="price-label">Previous Price</span>
                    <span class="old-price">Rs. ${oldPrice.toLocaleString()}</span>
                  </div>
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <div class="price-label" style="margin-bottom: 10px;">New Price</div>
                    <div class="new-price">Rs. ${newPrice.toLocaleString()}</div>
                  </div>
                  
                  <div style="text-align: center;">
                    <span class="discount-badge">
                      Save Rs. ${discount.toLocaleString()} (${discountPercent}% OFF)
                    </span>
                  </div>
                </div>

                <div class="cta-wrapper">
                  <a href="${productUrl}" class="cta-button">
                    View Product Details
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Pricewise. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationCodeEmail = async ({ to, code, fullName }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Pricewise <register@dotivia.com>",
      to: [to],
      subject: "Verify Your Email - Pricewise",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container { 
                max-width: 600px; 
                margin: 20px auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                background-color: #041d09;
                color: white; 
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 700;
              }
              .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.95;
              }
              .content { 
                padding: 40px 30px;
              }
              .code-box {
                background: #f9fafb;
                border: 2px dashed #059669;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .verification-code {
                font-size: 36px;
                font-weight: 700;
                color: #041d09;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                margin: 20px 0;
              }
              .code-label {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
              }
              .info-text {
                margin-top: 30px;
                padding: 20px;
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                border-radius: 4px;
                color: #1e40af;
                font-size: 14px;
                line-height: 1.6;
              }
              .footer { 
                text-align: center;
                padding: 30px;
                background: #f9fafb;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                margin: 5px 0;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 8px;
                }
                .header {
                  padding: 30px 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
                .verification-code {
                  font-size: 28px;
                  letter-spacing: 6px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
                <p>Welcome to Pricewise!</p>
              </div>
              
              <div class="content">
                <p>Hello ${fullName},</p>
                <p>Thank you for signing up for Pricewise. Please use the verification code below to complete your registration:</p>
                
                <div class="code-box">
                  <div class="code-label">Verification Code</div>
                  <div class="verification-code">${code}</div>
                </div>

                <p>This code will expire in 15 minutes for security reasons.</p>
                
                <div class="info-text">
                  <strong>Didn't request this code?</strong><br>
                  If you didn't create an account with Pricewise, please ignore this email.
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} PriceWise. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    console.log("Verification email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async ({ to, resetUrl, fullName }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Pricewise <noreply@dotivia.com>",
      to: [to],
      subject: "Password Reset Request - Pricewise",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              a {
                color: white;
              }
              .container { 
                max-width: 600px; 
                margin: 20px auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                background-color: #041d09;
                color: white; 
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 700;
              }
              .header p {
                margin: 0;
                font-size: 16px;
                opacity: 0.95;
              }
              .content { 
                padding: 40px 30px;
              }
              .cta-button { 
                background-color: #041d09;
                color: white;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                margin: 30px 0;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
              }
              .cta-button:hover {
                box-shadow: 0 6px 12px rgba(4, 29, 9, 0.4);
              }
              .cta-wrapper {
                text-align: center;
                margin: 30px 0;
              }
              .info-text {
                margin-top: 30px;
                padding: 20px;
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                border-radius: 4px;
                color: #1e40af;
                font-size: 14px;
                line-height: 1.6;
              }
              .footer { 
                text-align: center;
                padding: 30px;
                background: #f9fafb;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                margin: 5px 0;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  margin: 10px;
                  border-radius: 8px;
                }
                .header {
                  padding: 30px 20px;
                }
                .header h1 {
                  font-size: 24px;
                }
                .content {
                  padding: 30px 20px;
                }
                .cta-button {
                  padding: 14px 32px;
                  font-size: 15px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
                <p>Reset your Pricewise account password</p>
              </div>
              
              <div class="content">
                <p>Hello ${fullName},</p>
                <p>You requested a password reset for your Pricewise account. Click the button below to reset your password:</p>
                
                <div class="cta-wrapper">
                  <a href="${resetUrl}" class="cta-button">
                    Reset Password
                  </a>
                </div>

                <p>This link will expire in 15 minutes for security reasons.</p>
                
                <div class="info-text">
                  <strong>Didn't request this?</strong><br>
                  If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} PriceWise. All rights reserved.</p>
                <p>This email was sent to ${to}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }

    console.log("Password reset email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};
