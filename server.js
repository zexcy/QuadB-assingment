const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://Aayush:V75E8tPtz22j1Kkh@cluster0.vyud6gh.mongodb.net/assingment?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Create schema for ticker data
const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

// Create ticker model
const Ticker = mongoose.model("Ticker", tickerSchema);

// Fetch top 10 tickers from API and store in database
axios
  .get("https://api.wazirx.com/api/v2/tickers")
  .then((response) => {
    const tickers = response.data;
    const top10Tickers = Object.values(tickers)
      .sort((a, b) => b.quote_unit_volume - a.quote_unit_volume)
      .slice(0, 10);
    top10Tickers.forEach((ticker) => {
      const { name, last, buy, sell, volume, base_unit } = ticker;
      const newTicker = new Ticker({
        name,
        last,
        buy,
        sell,
        volume,
        base_unit,
      });
      newTicker.save();
    });
    console.log("Top 10 tickers saved to database");
  })
  .catch((err) => console.log(err));

// Create route to get tickers from database

app.get("/tickers", (req, res) => {
  Ticker.find({})
    .sort({ volume: "desc" })
    .limit(10)
    .then((tickers) => res.json(tickers))
    .catch((err) => console.log(err));
});

const path = require("path");

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
