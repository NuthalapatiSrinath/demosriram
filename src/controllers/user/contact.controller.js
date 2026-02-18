// src/controllers/user/contact.controller.js
import Contact from "../../database/models/contact.model.js";
import User from "../../database/models/user/user.model.js";
import sendEmail from "../../utils/email.js";
import { config } from "../../config/index.js";

/**
 * @route   POST /api/user/contact
 * @desc    Submit contact form
 * @access  Public
 */
export const submitContactController = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, selectedCenter, message } = req.body;

    // Validation
    if (!fullName || !email || !phoneNumber || !selectedCenter) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Phone validation (basic)
    if (phoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Create contact entry
    const contact = await Contact.create({
      fullName,
      email,
      phoneNumber,
      selectedCenter,
      message: message || "",
      status: "pending",
    });

    // Get admin emails based on selected center
    const adminEmails = [];

    // Always include the main admin email
    adminEmails.push("devakarthik8899@gmail.com");

    // Always include super admin
    const superAdmin = await User.findOne({ role: "superadmin" });
    if (superAdmin) {
      adminEmails.push(superAdmin.email);
    }

    // Get center admin for the selected center
    if (selectedCenter !== "All Centers") {
      const centerAdmin = await User.findOne({
        role: "centeradmin",
        centerName: selectedCenter,
      });
      if (centerAdmin) {
        adminEmails.push(centerAdmin.email);
      }
    } else {
      // If "All Centers" selected, notify all center admins
      const allCenterAdmins = await User.find({ role: "centeradmin" });
      allCenterAdmins.forEach((admin) => {
        adminEmails.push(admin.email);
      });
    }

    // Send email notifications in background (non-blocking)
    setImmediate(async () => {
      try {
        // Send confirmation email to user
        await sendEmail({
          to: email,
          subject: "Thank you for contacting Sriram IAS",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Thank you for reaching out!</h2>
              <p>Dear ${fullName},</p>
              <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
              <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
                <h3 style="margin-top: 0;">Your Details:</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phoneNumber}</p>
                <p><strong>Center:</strong> ${selectedCenter}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
              </div>
              <p>Best regards,<br>Sriram IAS Team</p>
              <hr style="margin: 30px 0;">
              <p style="font-size: 12px; color: #6c757d;">
                Contact us: enquiry@sriramsias.com | 8686818384 / 9963917712<br>
                Mon - Sat: 9:00 AM - 7:00 PM | Sunday: 10:00 AM - 4:00 PM
              </p>
            </div>
          `,
        });

        // Send notification to admins
        if (adminEmails.length > 0) {
          await sendEmail({
            to: adminEmails.join(","),
            subject: `New Contact Form Submission - ${selectedCenter}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">New Contact Form Submission</h2>
                <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="margin-top: 0;">Contact Details:</h3>
                  <p><strong>Name:</strong> ${fullName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phoneNumber}</p>
                  <p><strong>Selected Center:</strong> ${selectedCenter}</p>
                  ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
                  <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>Please follow up with this inquiry at your earliest convenience.</p>
                <p><a href="${config.app.frontendUrl}/admin/contacts" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a></p>
              </div>
            `,
          });
        }

        console.log(
          `Contact form notification sent to: ${adminEmails.join(", ")}`,
        );
      } catch (emailErr) {
        console.error("Failed to send contact form emails:", emailErr);
      }
    });

    return res.status(201).json({
      success: true,
      message:
        "Thank you for contacting us! We'll get back to you within 24 hours.",
      data: {
        id: contact._id,
        fullName: contact.fullName,
        email: contact.email,
        selectedCenter: contact.selectedCenter,
      },
    });
  } catch (err) {
    console.error("submitContactController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting contact form",
    });
  }
};
