const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, grade, schoolCode, nationalId } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'البيانات ناقصة' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'البريد مسجل مسبقاً' });

    const hash = await bcrypt.hash(password, 10);
    const userDoc = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      role,
      grade: grade || null,
      schoolCode: schoolCode || null,
      nationalId: nationalId || null,
    });

    const user = {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      grade: userDoc.grade,
      points: userDoc.points,
      badges: userDoc.badges,
    };

    res.status(201).json({ user, token: sign(userDoc) });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email: email.toLowerCase() });
    if (!userDoc) return res.status(401).json({ error: 'بيانات غير صحيحة' });
    
    const ok = await bcrypt.compare(password, userDoc.password);
    if (!ok) return res.status(401).json({ error: 'بيانات غير صحيحة' });

    const user = {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      grade: userDoc.grade,
      points: userDoc.points,
      badges: userDoc.badges,
      schoolCode: userDoc.schoolCode,
    };

    res.json({ user, token: sign(userDoc) });
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id).select('-password');
    if (!userDoc) return res.status(404).json({ error: 'المستخدم غير موجود' });
    
    const user = {
      id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      grade: userDoc.grade,
      points: userDoc.points,
      badges: userDoc.badges,
      schoolCode: userDoc.schoolCode,
    };

    res.json({ user });
  } catch (e) { next(e); }
};
