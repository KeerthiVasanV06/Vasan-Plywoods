const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Product = require('../models/Product');
const SliderImage = require('../models/SliderImage');
const Message = require('../models/Message');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Admin Credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'vasan_plywoods_secret_key';

// Middleware to verify Token
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, JWT_SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

// Admin Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            res.json({ token });
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Get all projects for carousel
router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get featured products
router.get('/products/featured', async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new project (for testing)
// Create a new project (Protected & with Image Upload)
router.post('/projects', verifyToken, upload.single('image'), async (req, res) => {
    let imageUrl = req.body.imageUrl;

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        imageUrl: imageUrl,
        category: req.body.category
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a new product (for testing)
// Create a new product (Protected & with Image Upload)
router.post('/products', verifyToken, upload.single('image'), async (req, res) => {
    let imageUrl = req.body.imageUrl;

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        imageUrl: imageUrl,
        featured: req.body.featured === 'true' // Handle multipart/form-data boolean
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product (Protected)
router.delete('/products/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Try to delete the image file if it exists and is local
        if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', product.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a project (Protected)
router.delete('/projects/:id', verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Try to delete the image file if it exists and is local
        if (project.imageUrl && project.imageUrl.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', project.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Slider Image Routes ---

// Get all slider images
router.get('/slider-images', async (req, res) => {
    try {
        const images = await SliderImage.find({ active: true }).sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a slider image (Protected)
router.post('/slider-images', verifyToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const sliderImage = new SliderImage({
        image: imageUrl,
        altText: req.body.altText || 'Slider Image'
    });

    try {
        const newImage = await sliderImage.save();
        res.status(201).json(newImage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a slider image (Protected)
router.delete('/slider-images/:id', verifyToken, async (req, res) => {
    try {
        const image = await SliderImage.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });

        // Try to delete the image file if it exists and is local
        if (image.image && image.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', image.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await SliderImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Message Routes ---

// Submit a contact message (Public)
router.post('/messages', async (req, res) => {
    const message = new Message({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message
    });

    try {
        const newMessage = await message.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all messages (Protected)
router.get('/messages', verifyToken, async (req, res) => {
    try {
        const messages = await Message.find().sort({ date: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a message (Protected)
router.delete('/messages/:id', verifyToken, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
