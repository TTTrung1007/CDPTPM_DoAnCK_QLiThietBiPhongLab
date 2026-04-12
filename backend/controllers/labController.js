const Lab = require('../models/Lab');

exports.getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find();
    res.json(labs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createLab = async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteLab = async (req, res) => {
  try {
    await Lab.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
