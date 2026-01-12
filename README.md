# M&A SHOP - E-Commerce Platform

A modern e-commerce application built with React and DummyJSON API.

## Features

- Product browsing and search
- Product sorting (price, name, rating)
- Category filtering
- Shopping cart
- Wishlist
- User authentication
- Product management dashboard

## Tech Stack

- React 18 with Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Context API
- LocalStorage

## Installation

```bash
npm install
npm run dev
```

## Login Credentials

**User Accounts:**
- Username: `emilys` / Password: `emilyspass`
- Username: `michaelw` / Password: `michaelwpass`

## Features

### Public Access
- Browse all products
- Search products
- Sort products
- View categories

### Requires Login
- Add to cart
- Add to wishlist
- View cart
- View wishlist
- Access dashboard

### Dashboard (Authenticated Users)
- Create products
- Update products
- Delete products

## Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── WishlistContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── Categories.jsx
│   ├── Cart.jsx
│   ├── Wishlist.jsx
│   ├── Login.jsx
│   └── Dashboard.jsx
├── App.jsx
└── main.jsx
```

## API Endpoints

- Products: `https://dummyjson.com/products`
- Categories: `https://dummyjson.com/products/categories`
- Auth: `https://dummyjson.com/auth/login`

## Build

```bash
npm run build
```

## License

Educational project.
