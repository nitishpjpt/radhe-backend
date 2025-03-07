import { Custumer } from '../../models/custumer/custumer.model.js';
import { AsyncHandler } from '../../utils/AyncHandler.js';
import { AlreadyExist, NotFoundError } from '../../utils/custumError.js';

const custumerRegister = AsyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;

  // Check if admin already exists
  const existingCustumer = await Custumer.findOne({ email });
  if (existingCustumer) {
    throw new AlreadyExist('Custumer already exist', 'custumer method');
  }

  // Create new custumer (Password will be hashed automatically)
  const newCustumer = await Custumer.create({ name, email, password, address });

  res.status(201).json({
    message: 'Custumer created successfully',
    newCustumer,
  });
});

const custumerLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const custumer = await Custumer.findOne({ email });

  if (!custumer) {
    throw new NotFoundError(
      'custumer with this email not found',
      'custumer method',
    );
  }

  // Check if the password matches
  const isPasswordValid = await custumer.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Password is wrong' });
  }

  // Generate JWT Token
  const token = custumer.generateToken();

  // Store token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({
    message: 'Custumer login successful',
    custumer,
    token,
  });
});

// Controller for adding product to cart
const addToCart = AsyncHandler(async (req, res) => {
  const { customerId, productId, quantity } = req.body;
  console.log('Request Body:', req.body);

  if (!customerId || !productId || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Find the customer by ID
  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Check if the product already exists in the cart
  const existingCartItem = customer.cart.find(
    (item) => item.product.toString() === productId,
  );

  if (existingCartItem) {
    // Update quantity if the product already exists
    existingCartItem.quantity += quantity;
  } else {
    // Add new product to the cart
    customer.cart.push({ product: productId, quantity });
  }

  console.log('Updated Customer Cart:', customer.cart);

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    message: 'Product added to cart successfully',
    cart: customer.cart,
  });
});
const mergeGuestCart = AsyncHandler(async (req, res) => {
  const { customerId, guestCart } = req.body;

  if (!customerId || !guestCart) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const customer = await Custumer.findById(customerId);
  console.log(customer);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Merge guest cart with the customer's cart
  guestCart.forEach((guestItem) => {
    const existingCartItem = customer.cart.find(
      (item) => item.product.toString() === guestItem.productId,
    );

    if (existingCartItem) {
      // Update quantity if the product already exists
      existingCartItem.quantity += guestItem.quantity;
    } else {
      // Add new product to the cart
      customer.cart.push({ product: guestItem.productId, quantity: guestItem.quantity });
    }
  });

  await customer.save();

  res.status(200).json({
    message: 'Guest cart merged successfully',
    cart: customer.cart,
  });
});
const removeFromCart = AsyncHandler(async (req, res) => {
  const { productId } = req.params; // Access productId from URL parameters
  const { customerId } = req.body; // Access customerId from the request body

  console.log("Product ID to remove:", productId);
  console.log("Customer ID:", customerId);

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  if (!customerId) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  // Find the customer by customerId
  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Filter out the product from the cart
  customer.cart = customer.cart.filter(
    (item) => item.product.toString() !== productId,
  );

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    message: 'Product removed from cart successfully',
    cart: customer.cart,
  });
});
// PUT /custumer/cart/update - Update the quantity of a product in the cart
const updateCartItemQuantity = AsyncHandler(async (req, res) => {
  const { customerId, productId, quantity } = req.body;
  console.log( customerId, productId, quantity )

  if (!customerId || !productId || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find the customer by ID
  const customer = await Custumer.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  // Find the cart item
  const cartItem = customer.cart.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  // Update the quantity
  cartItem.quantity = quantity;

  // Save the updated customer document
  await customer.save();

  res.status(200).json({
    message: "Cart item quantity updated successfully",
    cart: customer.cart,
  });
});
const getCartItems = AsyncHandler(async (req, res) => {
  const { customerId } = req.body;
  console.log(customerId);

  if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
  }

  // Find the customer by ID and populate the product details in the cart
  const customer = await Custumer.findById(customerId).populate({
      path: "cart.product",
      select: "_id productName price image", // Include _id in the selected fields
  });

  console.log(customer);
  if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
  }

  // Validate the cart array
  if (!customer.cart || !Array.isArray(customer.cart)) {
      return res.status(400).json({ message: "Invalid cart data" });
  }

  // Filter out invalid cart items and map through the valid ones
  const validCartItems = customer.cart.filter((item) => item.product);
  const cartItems = validCartItems.map((item) => ({
      product: {
          _id: item.product._id,
          productName: item.product.productName,
          price: item.product.price,
          image: item.product.image,
      },
      quantity: item.quantity,
  }));

  res.status(200).json({
      message: "Cart items fetched successfully",
      cart: cartItems,
  });
});
const updateCustomerProfile = AsyncHandler(async (req, res) => {
  const { name, email, address } = req.body;

  const customer = req.customer;

  customer.name = name || customer.name;
  customer.email = email || customer.email;
  customer.address = address || customer.address;

  await customer.save();

  res.status(200).json({ message: 'Profile updated successfully', customer });
});

export {
  custumerRegister,
  custumerLogin,
  addToCart,
  mergeGuestCart,
  removeFromCart,
  getCartItems,
  updateCustomerProfile,
  updateCartItemQuantity
};
