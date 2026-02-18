// src/controllers/admin/contact.controller.js
import Contact from "../../database/models/contact.model.js";

/**
 * @route   GET /api/admin/contacts
 * @desc    Get all contacts (filtered by center for center admins)
 * @access  Protected (Admin)
 */
export const getAllContactsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const userRole = req.user.role;
    const userCenter = req.user.centerName;

    const query = {};

    // Filter by center for center admins
    if (userRole === "centeradmin" && userCenter) {
      query.selectedCenter = userCenter;
    }

    // Filter by status
    if (status && ["pending", "contacted", "resolved"].includes(status)) {
      query.status = status;
    }

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error("getAllContactsController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};

/**
 * @route   GET /api/admin/contacts/:id
 * @desc    Get contact by ID
 * @access  Protected (Admin)
 */
export const getContactByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Check if center admin can access this contact
    if (req.user.role === "centeradmin") {
      if (contact.selectedCenter !== req.user.centerName) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this contact",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (err) {
    console.error("getContactByIdController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contact",
    });
  }
};

/**
 * @route   PUT /api/admin/contacts/:id
 * @desc    Update contact status
 * @access  Protected (Admin)
 */
export const updateContactController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Check if center admin can access this contact
    if (req.user.role === "centeradmin") {
      if (contact.selectedCenter !== req.user.centerName) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this contact",
        });
      }
    }

    // Update fields
    if (status && ["pending", "contacted", "resolved"].includes(status)) {
      contact.status = status;
    }
    if (assignedTo) {
      contact.assignedTo = assignedTo;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (err) {
    console.error("updateContactController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating contact",
    });
  }
};

/**
 * @route   DELETE /api/admin/contacts/:id
 * @desc    Delete contact
 * @access  Protected (Super Admin)
 */
export const deleteContactController = async (req, res) => {
  try {
    const { id } = req.params;

    // Only super admin can delete
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can delete contacts",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (err) {
    console.error("deleteContactController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting contact",
    });
  }
};

/**
 * @route   GET /api/admin/contacts/stats
 * @desc    Get contact statistics
 * @access  Protected (Admin)
 */
export const getContactStatsController = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userCenter = req.user.centerName;

    const query = {};

    // Filter by center for center admins
    if (userRole === "centeradmin" && userCenter) {
      query.selectedCenter = userCenter;
    }

    const totalContacts = await Contact.countDocuments(query);
    const pendingContacts = await Contact.countDocuments({ ...query, status: "pending" });
    const contactedContacts = await Contact.countDocuments({ ...query, status: "contacted" });
    const resolvedContacts = await Contact.countDocuments({ ...query, status: "resolved" });

    // Contacts in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.countDocuments({
      ...query,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Contacts by center (only for super admin)
    let contactsByCenter = null;
    if (userRole === "superadmin") {
      contactsByCenter = await Contact.aggregate([
        { $group: { _id: "$selectedCenter", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalContacts,
        pendingContacts,
        contactedContacts,
        resolvedContacts,
        recentContacts,
        contactsByCenter,
      },
    });
  } catch (err) {
    console.error("getContactStatsController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contact statistics",
    });
  }
};
