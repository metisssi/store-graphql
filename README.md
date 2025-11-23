# 🛒 E-Commerce Store

https://store-graphql-2.onrender.com/

> Full-stack GraphQL e-commerce application with React, Node.js, MongoDB, and Stripe payments

## 📸 Screenshots & Features

---

### 🔐 Authentication System

#### Registration Page
<img width="1916" height="988" alt="image" src="https://github.com/user-attachments/assets/a84a1b72-5464-4e76-a40e-24cbe27c89d0" />


**Features:**
- Create new user account with email validation
- Password strength requirements (min 6 characters)
- Password confirmation matching
- Show/hide password toggle
- Automatic login after registration
- Form validation with error messages
- Terms of service agreement checkbox

---

#### Login Page
<img width="1910" height="998" alt="image" src="https://github.com/user-attachments/assets/c1ad18dc-969e-4731-a3af-7f6a3f3157dd" />


**Features:**
- Secure JWT authentication
- Remember me functionality
- Show/hide password toggle
- Form validation
- Error handling for invalid credentials
- Automatic redirect based on user role (Admin → Dashboard, User → Home)
- Session persistence with localStorage

---

### 👥 Customer Features

#### Home Page - Product Catalog
<img width="1913" height="937" alt="image" src="https://github.com/user-attachments/assets/457d35da-43d5-4398-a5e2-5226e64dd98e" />
<img width="1524" height="857" alt="image" src="https://github.com/user-attachments/assets/50a1a8cd-33e0-426e-99eb-e1e4e28d4e2f" />



**Features:**
- **Product Grid Display** - Responsive grid layout (1-4 columns based on screen size)
- **Search Functionality** - Real-time search by product name and description
- **Category Filter** - Filter products by categories
- **Price Range Filter** - Set minimum and maximum price
- **Sort Options:**
  - Newest first
  - Price: Low to High
  - Price: High to Low
  - Name: A-Z / Z-A
- **Product Cards showing:**
  - Product image with hover zoom effect
  - Product name and description (truncated)
  - Price display
  - Stock availability with color indicators
  - Category badge
  - Star ratings and review count
  - "View Details" button
- **Stock Status Indicators:**
  - "Low Stock" warning badge (< 5 items)
  - "Out of Stock" error badge
  - Available quantity display
- **Clear Filters** button to reset all filters
- **Results Counter** showing filtered products count

---

#### Product Detail Page
<img width="1904" height="934" alt="image" src="https://github.com/user-attachments/assets/5822b1ab-d7c4-421c-a6ae-67ca645584da" />


**Features:**
- **Large Product Image** - High-quality image display with error handling
- **Product Information:**
  - Category badge
  - Product name and full description
  - Current price in USD
  - Stock availability status
  - Average rating with star display
  - Total review count
  - Product ID and creation date
- **Quantity Selector** - Increment/decrement buttons with stock limit
- **Add to Cart Button** - Add selected quantity to cart
- **Breadcrumb Navigation** - Easy navigation back to categories
- **Image Placeholder** - Automatic fallback for missing images
- **Stock Warnings** - Visual indicators for low/out of stock
- **Back to Products** button

---

#### Product Reviews & Ratings
<img width="1897" height="953" alt="image" src="https://github.com/user-attachments/assets/5f11362e-bac8-4fc3-b372-25c3f3b0ce89" />
<img width="1901" height="942" alt="image" src="https://github.com/user-attachments/assets/acea3706-9500-4b89-b1a3-b92bea50d9db" />


**Features:**
- **Star Rating System** - 1-5 star ratings with visual display
- **Write Review Form:**
  - Interactive star rating selector
  - Review title (max 100 characters)
  - Review comment (max 1000 characters)
  - Submit/Cancel buttons
- **Reviews Display:**
  - Reviewer username and date
  - Star rating visualization
  - Review title and full comment
  - Delete button (for review owner or admin)
  - Pagination with "Load More" button
- **Review Restrictions:**
  - One review per product per user
  - Must be logged in to review
  - Cannot review if already reviewed
  - Displays reason if cannot review
- **Review Statistics:**
  - Total review count
  - Average rating (auto-calculated)
  - Rating updates product average in real-time
- **Empty State** - Encourages first review when none exist

---

#### Shopping Cart
<img width="1919" height="938" alt="image" src="https://github.com/user-attachments/assets/ab3edeed-1824-4a06-b360-cc4aa4d038e6" />


**Features:**
- **Cart Items Display:**
  - Product image (clickable to view details)
  - Product name and description
  - Category badge
  - Price per item
  - Quantity controls (+/- buttons)
  - Subtotal calculation per item
  - Remove item button (❌)
- **Quantity Management:**
  - Increment/decrement quantity
  - Stock limit enforcement
  - Real-time subtotal updates
  - Maximum stock warning message
- **Order Summary Card:**
  - Items subtotal
  - Shipping cost (Free)
  - Tax calculation (10%)
  - **Grand Total** display
  - Secure checkout badge (🔒)
- **Action Buttons:**
  - "Proceed to Checkout" button
  - "Continue Shopping" button
  - "Clear Cart" button (with confirmation)
- **Empty Cart State:**
  - Visual empty cart icon
  - "Your cart is empty" message
  - "Browse Products" call-to-action
- **Real-time Updates** - Cart updates instantly across all pages
- **Stock Validation** - Prevents adding more than available stock

---

#### Checkout & Payment
<img width="1909" height="953" alt="image" src="https://github.com/user-attachments/assets/5c9732e7-7ff1-4308-82f7-3394fb418a75" />


**Features:**
- **Two-Column Layout:**
  - Left: Payment & Shipping Form
  - Right: Order Summary (sticky)
- **Shipping Address Form:**
  - Full Name (required)
  - Street Address (required)
  - City (required)
  - Postal Code (required)
  - Country (required)
  - Phone Number (required)
  - Form validation on all fields
- **Stripe Card Payment:**
  - Secure Stripe Elements integration
  - Card number input
  - Expiration date
  - CVC/CVV code
  - Test card information provided
  - Real-time card validation
- **Order Summary Display:**
  - List of all cart items with images
  - Item name, price, quantity
  - Scrollable item list
  - Subtotal, shipping, tax breakdown
  - **Total amount display**
  - Secure payment badge (🔒)
- **Payment Processing:**
  - Loading state during payment
  - Success/error notifications
  - Automatic order creation after successful payment
  - Cart cleared after order completion
  - Redirect to order history
- **Back to Cart** button to modify order
- **Test Mode** - Test card: 4242 4242 4242 4242

---

#### My Orders Page
<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/dcd9f72b-621f-4c57-8d42-fe171f3ed276" />


**Features:**
- **Order List Display:**
  - Order ID (last 8 characters)
  - Order date and time
  - Status badge with color coding
  - Payment status indicator
- **Order Details Card:**
  - **Items Section:**
    - Product images
    - Product names
    - Price and quantity
    - Item subtotals
  - **Shipping Address:**
    - Full recipient details
    - Complete address
    - Phone number
  - **Order Total:**
    - Total amount paid
    - Payment date
    - Payment status confirmation
- **Order Status Types:**
  - ⏳ Pending (yellow badge)
  - 🔄 Processing (blue badge)
  - 🚚 Shipped (purple badge)
  - ✅ Delivered (green badge)
  - ❌ Cancelled (red badge)
- **Empty State:**
  - "No orders yet" message
  - "Go Shopping" call-to-action button
- **Order History** - Sorted by most recent first
- **Responsive Design** - Mobile-friendly layout

---

### 👨‍💼 Admin Features

#### Admin Dashboard - Products Management
<img width="1914" height="937" alt="image" src="https://github.com/user-attachments/assets/6e6959f6-d601-4b02-a0ca-5dd723b8edf4" />


**Features:**
- **Create Product Form:**
  - Product name (required)
  - Description (required, textarea)
  - Price input (USD, required)
  - Stock quantity (required)
  - Category dropdown (required)
  - Image URL input (optional)
  - Image preview on URL entry
  - ImgBB upload link provided
  - Placeholder fallback for invalid images
  - "Create Product" button with loading state
- **Products List Display:**
  - Product thumbnail image
  - Product name and description (truncated)
  - Price display
  - Category badge
  - Current stock quantity
  - Delete button (🗑️) with confirmation
- **Product Cards:**
  - Hover effects for better UX
  - Scrollable list (max 600px height)
  - Total product count display
  - Auto-refresh after create/delete
- **Form Validation:**
  - All required fields enforced
  - Price must be > 0
  - Stock cannot be negative
  - Category must exist
  - URL validation for images

---

#### Admin Dashboard - Categories Management
<img width="1917" height="939" alt="image" src="https://github.com/user-attachments/assets/2baab105-2240-493b-a294-5dfb9ac35a08" />

**Features:**
- **Create Category Form:**
  - Category name input (required, unique)
  - Quick select from example categories:
    - Electronics
    - Clothing
    - Books
    - Sports
    - Home
  - "Create Category" button
  - Loading state during creation
- **Categories List Display:**
  - Category name with icon (🏷️)
  - Creation date
  - Delete button (🗑️)
  - Total categories count
- **Category Protection:**
  - Cannot delete category with existing products
  - Error message shows product count
  - "Delete products first" warning
- **Auto-refresh** after create/delete operations
- **Empty State** handling

---

#### Admin Orders Management
<img width="1919" height="953" alt="image" src="https://github.com/user-attachments/assets/0b952a87-7695-4d1b-a8a7-8401c84cb3f5" />
<img width="1707" height="609" alt="image" src="https://github.com/user-attachments/assets/7bf3d380-467a-4ea1-b6aa-98c9ae765699" /> -> change status 

<img width="1916" height="609" alt="image" src="https://github.com/user-attachments/assets/b21a75b0-6e6b-4af9-8dbd-ff34d5981ca9" /> -> what client see 




**Features:**
- **Order Filtering System:**
  - **Tabs (Desktop):**
    - All Orders
    - Pending
    - Processing
    - Shipped
    - Delivered
    - Cancelled
  - **Dropdown (Mobile)** - Same filters in dropdown
  - Each tab shows order count
- **Order Cards Display:**
  - Order ID (last 8 characters)
  - Order date and time
  - Status badge (color-coded)
  - Payment status badge
- **Three-Column Layout per Order:**
  - **Column 1 - Customer Info:**
    - Username (👤)
    - Email address
    - Full shipping address
    - Phone number
  - **Column 2 - Order Items:**
    - Product images (thumbnail)
    - Product names
    - Price × quantity
    - Scrollable list for many items
  - **Column 3 - Order Management:**
    - **Status Change Buttons (Desktop):**
      - Mark as Processing
      - Mark as Shipped
      - Mark as Delivered
      - Cancel Order
    - **Status Dropdown (Mobile):**
      - All status options in select
    - Button states (disabled when appropriate)
    - Cannot change delivered orders
    - Total amount display
    - Payment confirmation
- **Status Flow Management:**
  - Logical status progression
  - Disable inappropriate transitions
  - Auto-update after status change
  - Confirmation on status updates
- **Empty States:**
  - "No orders found" message
  - Varies by filter selection
- **Real-time Updates** - Refetch after changes
- **Responsive Design:**
  - Desktop: Grid layout with tabs
  - Mobile: Single column with dropdowns

---

### 📱 Mobile-Responsive Design

#### Mobile Navigation
<img width="492" height="930" alt="image" src="https://github.com/user-attachments/assets/4356a1d4-436a-48cc-96e9-24098524c13c" />


**Features:**
- **Hamburger Menu:**
  - Animated menu icon (☰ → ✕)
  - Slide-in menu from top
  - Full-screen overlay
- **Quick Cart Access:**
  - Cart icon with badge count
  - Accessible without opening menu
- **Mobile Menu Items:**
  - User greeting and role badge
  - Cart with item count
  - My Orders link
  - Admin links (if admin)
  - Logout button
- **Touch-Friendly:**
  - Large tap targets
  - Swipe gestures
  - Easy close functionality

---

## ✨ Core Features Summary

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt
- Session persistence
- Protected routes
- Auto-redirect based on role

### 🛍️ Shopping Experience
- Product browsing with advanced filters
- Real-time search
- Product details with reviews
- Shopping cart management
- Secure Stripe checkout
- Order tracking
- Review and rating system

### 👨‍💼 Admin Panel
- Product CRUD operations
- Category management
- Order status management
- User management (Admin/User roles)
- Image upload support
- Stock management

### 🎨 UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Dark/Light theme support (DaisyUI)
- Loading states and spinners
- Error handling with user-friendly messages
- Toast notifications
- Empty state illustrations
- Form validation
- Confirmation dialogs
- Real-time updates

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Hooks
- React Router v6 for navigation
- Apollo Client for GraphQL
- TailwindCSS for styling
- DaisyUI component library
- Stripe React SDK for payments
- JWT Decode for authentication

**Backend:**
- Node.js + Express
- Apollo Server (GraphQL API)
- MongoDB + Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Stripe API for payment processing
- GraphQL Subscriptions (for real-time updates)

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account
- Git

### 1. Clone the repository
```bash
