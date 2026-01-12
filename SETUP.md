# Quick Setup Guide for M&A SHOP

## Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd ma-shop
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to `http://localhost:5173`

## Default Login Credentials

### User Account:
- **Username**: emilys
- **Password**: emilyspass

### Admin Access:
The admin dashboard is accessible only to users with email `munezeromas@gmail.com`. Since DummyJSON is a mock API, you can log in with any account, but admin features require this specific email.

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Features Checklist

✅ Product Display (100+ products)
✅ Shopping Cart with LocalStorage
✅ Wishlist with LocalStorage
✅ Sorting (Price, Name, Rating)
✅ Category Browsing
✅ Search Functionality
✅ User Authentication
✅ Protected Routes
✅ Admin Dashboard
✅ Product Management (Create/Edit/Delete)
✅ User Management
✅ Activity Tracking
✅ Responsive Design
✅ Modern UI with Tailwind CSS

## Tech Stack

- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔄 React Router DOM
- 📡 Axios
- 🗂️ Context API

## File Structure

```
ma-shop/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # Context API providers
│   ├── pages/          # Page components
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Need Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for deployment instructions
- Review the code comments for implementation details

## What's Next?

1. Customize the color scheme in `tailwind.config.js`
2. Add more features based on your requirements
3. Deploy to Vercel or Netlify (see DEPLOYMENT.md)
4. Share your deployment link!

---

Happy Coding! 🎉
