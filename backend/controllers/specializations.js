const Specialization = require('../models/Specialization');

exports.getSpecializations = async (req, res) => {
  try {
    const list = await Specialization.find().sort('name');
    res.json({ success: true, count: list.length, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const spec = await Specialization.create(req.body);
    res.status(201).json({ success: true, data: spec });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Specialization already exists' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
