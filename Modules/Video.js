const mongoose = require("mongoose");
const videoSchema = mongoose.Schema({
  filePath: String,
},
{
  timestamp:true,
})

const Video = new mongoose.model("Video", videoSchema);

module.exports = Video;
