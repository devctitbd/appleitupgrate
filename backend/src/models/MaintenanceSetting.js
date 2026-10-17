import mongoose from 'mongoose';

const maintenanceSettingSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '' },
    endAt: { type: Date, default: null },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    // Browse-only mode: when false, customers can view products but cannot
    // add to cart, place orders, or start a payment.
    sellingEnabled: { type: Boolean, default: true },
    sellingMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

const MaintenanceSetting = mongoose.model(
  'MaintenanceSetting',
  maintenanceSettingSchema
);

export async function getMaintenanceSetting() {
  let setting = await MaintenanceSetting.findOne();
  if (!setting) {
    setting = await MaintenanceSetting.create({});
  }
  return setting;
}

export default MaintenanceSetting;
