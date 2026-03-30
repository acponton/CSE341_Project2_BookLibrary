const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        genre: { type: String, trim: true },
        pages: { type: Number, min: 1 },
        isbn: { type: String, trim: true },
        publishedYear: { type: Number, min: 1500, max: new Date().getFullYear() },
        coverImage: { type: String, trim: true },
        // createdBy will be added when OAuth is in place
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
