// backend/src/controllers/sliderController.js

import Slider from '../models/Slider.js';
import { getSliderSetting } from '../models/SliderSetting.js';
import { cloudinary } from '../middleware/upload.js';

const asBoolean = (value) => value === true || value === 'true';

const deleteCloudinaryImage = async (image) => {
  if (!image?.includes('cloudinary')) return;
  const publicId = image.split('/').pop()?.split('.')[0];
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(`apple-it-zone/sliders/${publicId}`);
  } catch (error) {
    console.warn(
      'Could not delete slider image from Cloudinary:',
      error.message,
    );
  }
};

// @desc    Get all slides (active first for storefront, admin sees all)
// @route   GET /api/sliders
// @access  Public
export const getAllSliders = async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.active = true;

    const [sliders, setting] = await Promise.all([
      Slider.find(query).sort({ type: 1, sortOrder: 1 }),
      getSliderSetting(),
    ]);
    res.json({
      success: true,
      sliders,
      setting: {
        enabled: setting.enabled,
        autoSlide: setting.autoSlide,
        interval: setting.interval,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single slide
// @route   GET /api/sliders/:id
// @access  Public
export const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: 'Slide not found' });
    }
    res.json({ success: true, slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new slide
// @route   POST /api/sliders
// @access  Private/Admin
export const createSlider = async (req, res) => {
  try {
    const { title, description, link, type, active, sortOrder, image } =
      req.body;
    const uploadedImage = req.file?.path || image || '';

    const slider = new Slider({
      title: title || '',
      description: description || '',
      link: link || '',
      image: uploadedImage,
      type: type || 'hero',
      active: active !== undefined ? asBoolean(active) : true,
      sortOrder: sortOrder || 0,
      createdBy: req.user?._id,
    });

    await slider.save();
    res.status(201).json({ success: true, slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a slide
// @route   PUT /api/sliders/:id
// @access  Private/Admin
export const updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: 'Slide not found' });
    }

    const { title, description, link, type, active, sortOrder, image } =
      req.body;

    if (title !== undefined) slider.title = title;
    if (description !== undefined) slider.description = description;
    if (link !== undefined) slider.link = link;
    if (type !== undefined) slider.type = type;
    if (active !== undefined) slider.active = asBoolean(active);
    if (sortOrder !== undefined) slider.sortOrder = sortOrder;

    if (req.file?.path || image !== undefined) {
      if (slider.image !== (req.file?.path || image)) {
        await deleteCloudinaryImage(slider.image);
      }
    }
    if (req.file?.path) {
      slider.image = req.file.path;
    } else if (image !== undefined) {
      slider.image = image;
    }

    await slider.save();
    res.json({ success: true, slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a slide
// @route   DELETE /api/sliders/:id
// @access  Private/Admin
export const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: 'Slide not found' });
    }

    await deleteCloudinaryImage(slider.image);

    await slider.deleteOne();
    res.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder slides
// @route   PUT /api/sliders/reorder
// @access  Private/Admin
export const reorderSliders = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res
        .status(400)
        .json({ success: false, message: 'Orders must be an array' });
    }

    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        Slider.findByIdAndUpdate(id, { sortOrder }),
      ),
    );

    res.json({ success: true, message: 'Slides reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSliderSetting = async (req, res) => {
  try {
    const setting = await getSliderSetting();
    const { enabled, autoSlide, interval } = req.body;

    if (enabled !== undefined) {
      if (typeof enabled !== 'boolean') {
        return res
          .status(400)
          .json({ success: false, message: 'Enabled must be a boolean' });
      }
      setting.enabled = enabled;
    }
    if (autoSlide !== undefined) {
      if (typeof autoSlide !== 'boolean') {
        return res
          .status(400)
          .json({ success: false, message: 'Auto-slide must be a boolean' });
      }
      setting.autoSlide = autoSlide;
    }
    if (interval !== undefined) {
      const value = Number(interval);
      if (!Number.isInteger(value) || value < 3 || value > 10) {
        return res.status(400).json({
          success: false,
          message: 'Auto-slide interval must be between 3 and 10 seconds',
        });
      }
      setting.interval = value;
    }

    await setting.save();
    res.json({
      success: true,
      setting: {
        enabled: setting.enabled,
        autoSlide: setting.autoSlide,
        interval: setting.interval,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
