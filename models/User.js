const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  location: {
    type: String
  },
  gymType: {
    type: String
  },
  goal: {
    type: String
  },
  fitnessLevel: {
    type: String
  },
  availableTime: {
    type: String
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  profileImage: {
    type: String
  },
  streak: {
  type: Number,
  default: 0
},
lastCheckIn: {
  type: Date
},
totalCheckIns: {
  type: Number,
  default: 0
},
checkIns: [{
  type: Date
}],
workoutPlan: mongoose.Schema.Types.Mixed,
dietPlan: mongoose.Schema.Types.Mixed
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User