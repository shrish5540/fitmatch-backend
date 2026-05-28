const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, location, gymType, goal, fitnessLevel, availableTime, height, weight } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      location,
      gymType,
      goal,
      fitnessLevel,
      availableTime,
      height,
      weight
    })

    res.status(201).json({
      message: 'User created successfully',
      user
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userData = user.toObject()
    delete userData.password

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateMe = async (req, res) => {
  try {
    const updates = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password')

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { signup, login, getMe, updateMe }

