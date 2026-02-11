require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Product = require('./models/Product');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const sampleProjects = [
    {
        title: 'Modern Plywood Interior',
        description: 'Custom plywood furniture and shelving for a contemporary living space',
        imageUrl: '/images/plywood_project_1.png',
        category: 'plywood'
    },
    {
        title: 'Glass Office Partition',
        description: 'Elegant glass partition with wooden frames for a modern office',
        imageUrl: '/images/glass_project_2.png',
        category: 'glass'
    },
    {
        title: 'Custom Wardrobe Design',
        description: 'Premium wooden wardrobe with glass doors and interior lighting',
        imageUrl: '/images/custom_project_3.png',
        category: 'custom'
    }
];

const sampleProducts = [
    {
        name: 'Premium Plywood Sheets',
        description: 'High-quality plywood in various finishes including teak, oak, and walnut. Available in multiple thicknesses.',
        category: 'plywood',
        price: 'Starting from ₹80/sq.ft',
        imageUrl: '/images/plywood_product.png',
        featured: true
    },
    {
        name: 'Designer Glass Panels',
        description: 'Decorative glass panels and mirrors with custom wooden frames. Perfect for partitions and interiors.',
        category: 'glass',
        price: 'Contact for pricing',
        imageUrl: '/images/glass_product.png',
        featured: true
    },
    {
        name: 'Waterproof Plywood',
        description: 'Marine-grade waterproof plywood ideal for kitchens and bathrooms. BWP and BWR grades available.',
        category: 'plywood',
        price: 'Starting from ₹95/sq.ft',
        imageUrl: '/images/plywood_product.png',
        featured: false
    },
    {
        name: 'Toughened Glass',
        description: 'Safety glass for shower enclosures, partitions, and doors. Available in various thicknesses.',
        category: 'glass',
        price: 'Starting from ₹120/sq.ft',
        imageUrl: '/images/glass_product.png',
        featured: false
    },
    {
        name: 'Laminated Plywood',
        description: 'Pre-laminated plywood in multiple colors and textures. Ready to use for furniture.',
        category: 'plywood',
        price: 'Starting from ₹100/sq.ft',
        imageUrl: '/images/plywood_product.png',
        featured: true
    },
    {
        name: 'Custom Furniture Hardware',
        description: 'Premium hinges, handles, and sliding systems for custom furniture projects.',
        category: 'hardware',
        price: 'Contact for pricing',
        imageUrl: '/images/plywood_product.png',
        featured: false
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Project.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data');

        // Insert sample projects
        await Project.insertMany(sampleProjects);
        console.log('Sample projects added');

        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log('Sample products added');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
