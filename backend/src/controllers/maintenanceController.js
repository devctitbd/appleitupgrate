import { getMaintenanceSetting } from '../models/MaintenanceSetting.js';

const toPublic = (setting) => ({
  enabled: !!setting.enabled,
  message: setting.message || '',
  endAt: setting.endAt ? setting.endAt.toISOString() : null,
  contactEmail: setting.contactEmail || '',
  contactPhone: setting.contactPhone || '',
  // False = browse-only: customers can see products but cannot buy.
  sellingEnabled: setting.sellingEnabled !== false,
  sellingMessage: setting.sellingMessage || '',
  // When these settings were last changed (shown in the admin header).
  updatedAt: setting.updatedAt ? setting.updatedAt.toISOString() : null,
});

// @desc    Get public maintenance status (no auth)
// @route   GET /api/maintenance/status
export const getStatus = async (req, res) => {
  try {
    const setting = await getMaintenanceSetting();
    res.json({ success: true, maintenance: toPublic(setting) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update maintenance mode (super admin only)
// @route   PUT /api/maintenance
export const updateMaintenance = async (req, res) => {
  try {
    const {
      enabled,
      message,
      endAt,
      contactEmail,
      contactPhone,
      sellingEnabled,
      sellingMessage,
    } = req.body;
    const setting = await getMaintenanceSetting();

    if (typeof enabled === 'boolean') setting.enabled = enabled;
    if (typeof message === 'string') setting.message = message.trim();
    if (typeof contactEmail === 'string') setting.contactEmail = contactEmail.trim();
    if (typeof contactPhone === 'string') setting.contactPhone = contactPhone.trim();
    if (typeof sellingEnabled === 'boolean') setting.sellingEnabled = sellingEnabled;
    if (typeof sellingMessage === 'string') setting.sellingMessage = sellingMessage.trim();
    if (typeof endAt === 'string' && endAt) {
      setting.endAt = new Date(endAt);
    } else if (endAt === null || endAt === '') {
      setting.endAt = null;
    }

    await setting.save();
    res.json({ success: true, maintenance: toPublic(setting) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
