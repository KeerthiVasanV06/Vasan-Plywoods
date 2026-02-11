# VASAN PLYWOODS Website

A modern, clean website for a glass and plywood shop built with HTML, CSS, JavaScript, and Node.js with MongoDB.

## Features

- **Homepage** with hero section and company overview
- **Horizontal Image Carousel** showcasing completed projects
- **Services Section** highlighting what we do
- **Products Section** displaying what we sell
- **Contact Form** for customer inquiries
- **Responsive Design** optimized for all devices
- **Wood Theme** with professional, clean aesthetics

## Technology Stack

### Frontend
- HTML5
- CSS3 (Custom wood-themed design)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Project Structure

```
VASAN_PLYWOODS/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   └── index.html
└── backend/
    ├── config/
    │   └── database.js
    ├── models/
    │   ├── Project.js
    │   └── Product.js
    ├── routes/
    │   └── api.js
    ├── .env
    ├── .env.example
    ├── package.json
    ├── server.js
    └── seedDatabase.js
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running locally

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI if necessary (default: `mongodb://localhost:27017/vasan_plywoods`)

3. **Start MongoDB**
   Make sure MongoDB is running on your system

4. **Seed the Database** (Optional - adds sample data)
   ```bash
   node seedDatabase.js
   ```

5. **Start the Server**
   ```bash
   npm run dev
   ```

6. **Access the Website**
   Open your browser and navigate to: `http://localhost:3000`

## API Endpoints

- `GET /api/projects` - Fetch all showcase projects
- `GET /api/products` - Fetch all products
- `GET /api/products/featured` - Fetch featured products
- `POST /api/projects` - Create a new project
- `POST /api/products` - Create a new product

## Adding Images

Place your project and product images in the `frontend/images/` directory and reference them in the database.

## Customization

- **Colors**: Edit CSS variables in `frontend/css/style.css` (`:root` section)
- **Content**: Update text in `frontend/index.html`
- **Contact Info**: Update contact details in the contact section
- **Logo**: Add your logo to the navigation brand section

## Development

The backend uses `nodemon` for automatic server restarts during development. Any changes to JavaScript files will trigger a reload.

## License

All rights reserved - VASAN PLYWOODS 2026
# Vasan-Plywoods
