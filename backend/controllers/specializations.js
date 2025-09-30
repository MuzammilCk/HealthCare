const Specialization = require('../models/Specialization');

exports.getSpecializations = async (req, res) => {
  try {
    const list = await Specialization.find().sort('name');
    res.json({ success: true, count: list.length, data: list });
  } catch (e) {
    console.error('getSpecializations error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const spec = await Specialization.create(req.body);
    res.status(201).json({ success: true, data: spec });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Specialization already exists' });
    console.error('createSpecialization error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const spec = await Specialization.findById(id);
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Specialization not found' });
    }

    if (name) spec.name = name;
    if (description !== undefined) spec.description = description;
    
    await spec.save();
    res.json({ success: true, data: spec });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Specialization name already exists' });
    console.error('updateSpecialization error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;

    const spec = await Specialization.findById(id);
    if (!spec) {
      return res.status(404).json({ success: false, message: 'Specialization not found' });
    }

    // Check if any doctors are using this specialization
    const Doctor = require('../models/Doctor');
    const doctorCount = await Doctor.countDocuments({ specializationId: id });
    
    if (doctorCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete specialization. ${doctorCount} doctor(s) are currently using it.` 
      });
    }

    await spec.deleteOne();
    res.json({ success: true, message: 'Specialization deleted successfully' });
  } catch (e) {
    console.error('deleteSpecialization error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
