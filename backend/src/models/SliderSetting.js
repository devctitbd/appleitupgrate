import mongoose from 'mongoose';

const sliderSettingSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    autoSlide: { type: Boolean, default: true },
    interval: { type: Number, default: 5, min: 3, max: 10 },
  },
  { timestamps: true },
);

const SliderSetting = mongoose.model('SliderSetting', sliderSettingSchema);

export async function getSliderSetting() {
  let setting = await SliderSetting.findOne();
  if (!setting) setting = await SliderSetting.create({});
  return setting;
}

export default SliderSetting;
