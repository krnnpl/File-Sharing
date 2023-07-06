const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    receivers: [
      {
        type: String, // Changed from ObjectId to String
        required: true
      }
    ],
    sender: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true
        },
        path: {
          type: String,
          required: true
        },
        downloadLink: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
