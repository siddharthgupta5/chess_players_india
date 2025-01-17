
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for your React frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Chess Player Schema
const chessPlayerSchema = new mongoose.Schema({
    indianRank: { type: Number, required: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    federation: { type: String, required: true },
    rating: { type: Number, required: true },
    birthYear: { type: Number, required: true },
    scrapedAt: { type: Date, default: Date.now }
});

const ChessPlayer = mongoose.model('chess_players', chessPlayerSchema);

// Get all players or search by name
app.get('/api/players', async (req, res) => {
    try {
        const { query } = req.query;
        const filter = query ? { name: new RegExp(query, 'i') } : {};
        const players = await ChessPlayer.find(filter).sort({ indianRank: 1 });
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Error fetching chess players' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});