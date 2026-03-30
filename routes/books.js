const express = require('express');
const { body, param } = require('express-validator');
const Book = require('../models/Book');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     description: Retrieve a list of all books in the database.
 *     responses:
 *       200:
 *         description: A list of books.
 */
router.get('/', async (req, res, next) => {
    try {
        const books = await Book.find();
        res.json(books);
    }   catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a single book
 *     description: Retrieve a book by its MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID.
 *     responses:
 *       200:
 *         description: Book found.
 *       404:
 *         description: Book not found.
 */
router.get(
    '/:id',
    param('id').isMongoId().withMessage('Invalid book ID'),
    validate,
    async (req, res, next) => {
        try {
            const book = await Book.findById(req.params.id);
            if (!book) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.json(book);
        }   catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     description: Add a new book to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               pages:
 *                 type: number
 *               isbn:
 *                 type: string
 *               publishedYear:
 *                 type: number
 *               coverImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully.
 */
router.post(
    '/',
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('author').notEmpty().withMessage('Author is required'),
        body('pages')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Pages must be a positive integer'),
        body('publishedYear')
            .optional()
            .isInt({ min: 1500, max: new Date().getFullYear() })
            .withMessage('Published year is invalid'),
        body('isbn').optional().isString(),
        body('genre').optional().isString(),
        body('coverImage').optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const book = new Book(req.body);
            const saved = await book.save();
            res.status(201).json(saved);
        }   catch (err) {
        next(err);
        }
    }
);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     description: Update an existing book by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Book updated successfully.
 *       404:
 *         description: Book not found.
 */
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid book ID'),
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('author').optional().notEmpty().withMessage('Author cannot be empty'),
        body('pages')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Pages must be a positive integer'),
        body('publishedYear')
            .optional()
            .isInt({ min: 1500, max: new Date().getFullYear() })
            .withMessage('Published year is invalid'),
        body('isbn').optional().isString(),
        body('genre').optional().isString(),
        body('coverImage').optional().isString(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            if (!updated) {
                return res.status(404).json({ error: 'Book not found' });
            }

            res.json(updated);
        }   catch (err) {
            next(err);
        }
    }
);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Remove a book from the database by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID.
 *     responses:
 *       200:
 *         description: Book deleted successfully.
 *       404:
 *         description: Book not found.
 */
router.delete(
    '/:id',
    param('id').isMongoId().withMessage('Invalid book ID'),
    validate,
    async (req, res, next) => {
        try {
            const deleted = await Book.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        }   catch (err) {
            next(err);
        }
    }
);

module.exports = router;
