const Subject = require('../models/Subject');

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubject = async (req, res) => {
  const { subjectName, totalClasses, attendedClasses } = req.body;

  try {
    const subject = new Subject({
      subjectName,
      totalClasses: totalClasses || 0,
      attendedClasses: attendedClasses || 0,
      userId: req.user._id,
    });

    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSubject = async (req, res) => {
  const { subjectName, totalClasses, attendedClasses } = req.body;

  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      if (subject.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      // Check if classes were incremented to log history
      if ((totalClasses !== undefined && totalClasses > subject.totalClasses) || 
          (attendedClasses !== undefined && attendedClasses > subject.attendedClasses)) {
        
        const action = (attendedClasses !== undefined && attendedClasses > subject.attendedClasses) ? 'attended' : 'missed';
        
        subject.attendanceHistory.push({
          action,
          date: new Date(),
          totalAfter: totalClasses !== undefined ? totalClasses : subject.totalClasses,
          attendedAfter: attendedClasses !== undefined ? attendedClasses : subject.attendedClasses,
          percentageAfter: parseFloat((((attendedClasses !== undefined ? attendedClasses : subject.attendedClasses) / (totalClasses !== undefined ? totalClasses : subject.totalClasses)) * 100).toFixed(2))
        });
      }

      subject.subjectName = subjectName || subject.subjectName;
      if (totalClasses !== undefined) subject.totalClasses = totalClasses;
      if (attendedClasses !== undefined) subject.attendedClasses = attendedClasses;

      // AI Recalculation
      const { predictSubject } = require('../utils/aiEngine');
      const pred = predictSubject(subject.toObject());
      subject.riskScore = pred.riskScore;
      subject.riskLevel = pred.riskLevel;
      subject.aiPredictedPercentage = pred.predictions.next10;
      subject.lastAiUpdate = new Date();

      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      if (subject.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
      }

      await subject.deleteOne();
      res.json({ message: 'Subject removed' });
    } else {
      res.status(404).json({ message: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
