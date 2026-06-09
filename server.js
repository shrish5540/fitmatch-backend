const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const swipeRoutes = require('./routes/swipeRoutes')
const chatRoutes = require('./routes/chatRoutes')
const Message = require('./models/Message')
const aiRoutes = require('./routes/aiRoutes')
const streakRoutes = require('./routes/streakRoutes')
const uploadRoutes = require("./routes/uploadRoutes");
connectDB()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://fitmatch.vercel.app'
]

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/api/users', userRoutes)
app.use('/api/swipe', swipeRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api', streakRoutes)
app.use("/api/upload", uploadRoutes);

app.get('/', (req, res) => {
  res.send('Gym Tinder API is running')
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('joinRoom', (matchId) => {
    socket.join(matchId)
    console.log(`User joined room: ${matchId}`)
  })

  socket.on('sendMessage', async ({ matchId, senderId, text }) => {
    try {
      if (!matchId || !senderId || !text?.trim()) return

      const message = await Message.create({
        matchId,
        senderId,
        text: text.trim()
      })
      io.to(matchId).emit('receiveMessage', message)
    } catch (error) {
      console.error('sendMessage error:', error.message)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})