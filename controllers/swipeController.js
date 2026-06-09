const User = require('../models/User')
const Swipe = require('../models/Swipe')
const Match = require('../models/Match')

const swipeUser = async (req, res) => {
  try {
    const userId = req.user._id
    const targetUserId = req.params.id
    const { action } = req.body

    if (!action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ message: 'Action must be like or dislike' })
    }

    const existingSwipe = await Swipe.findOne({ userId, targetUserId })
    if (existingSwipe) {
      return res.status(400).json({ message: 'Already swiped on this user' })
    }

    const swipe = await Swipe.create({ userId, targetUserId, action })
      // Check if target also liked you back
    if (action === 'like') {
  console.log('Looking for:', { userId: targetUserId, targetUserId: userId })
  const reverseSwipe = await Swipe.findOne({
    userId: targetUserId,
    targetUserId: userId,
    action: 'like'
  })
  console.log('Found:', reverseSwipe)

      if (reverseSwipe) {
        await Match.create({ users: [userId, targetUserId] })
        return res.status(201).json({ message: "It's a match!", swipe })
      }
    }
    res.status(201).json({ message: 'Swipe saved', swipe })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


const getMatches = async (req, res) => {
  try {
    const userId = req.user._id

    const matches = await Match.find({ users: userId })
      .populate('users', 'name email age gender location gymType goal fitnessLevel profileImage')

    res.status(200).json({ matches })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id
    const { location, gymType, fitnessLevel, availableTime } = req.query

    const swipedUsers = await Swipe.find({ userId })
    const swipedIds = swipedUsers.map(swipe => swipe.targetUserId)

    const filter = {
      _id: { $nin: [...swipedIds, userId] }
    }

    if (location) filter.location = location
    if (gymType) filter.gymType = gymType
    if (fitnessLevel) filter.fitnessLevel = fitnessLevel
    if (availableTime) filter.availableTime = availableTime

    const users = await User.find(filter).select('-password')

    // Calculate compatibility score for each user
    const loggedInUser = req.user

    const usersWithScore = users.map(user => {
      let score = 0
      if (user.goal === loggedInUser.goal) score += 30
      if (user.gymType === loggedInUser.gymType) score += 25
      if (user.location === loggedInUser.location) score += 25
      if (user.fitnessLevel === loggedInUser.fitnessLevel) score += 20

      return {
          ...user.toObject(),
           compatibilityScore: score
      }
    })

    // Sort by highest score first
    usersWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    res.status(200).json({ users: usersWithScore })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = { swipeUser, getMatches, getSuggestedUsers}