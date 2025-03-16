import { Custumer } from './models/custumer/custumer.model.js';
import nodemailer from 'nodemailer';

// Save Customer Information
export const saveCustomerInfo = async (req, res) => {
  const { customerId, email, firstName, lastName, address, city, state, pinCode, country, cart } = req.body;
  
  try {
    const customer = await Custumer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Update customer information
    customer.email = email;
    customer.firstName = firstName;
    customer.lastName = lastName;
    customer.address = address;
    customer.city = city;
    customer.state = state;
    customer.pinCode = pinCode;
    customer.country = country;
    customer.cart = cart;

    await customer.save();

    res.status(200).json({ message: 'Customer information saved successfully.', customer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save customer information.', error: err.message });
  }
};

// Send Order Summary Email
export const sendOrderSummary = async (req, res) => {
    const { customerId, orderSummary } = req.body;
    
  
    try {
      const customer = await Custumer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
      }
  
      // Create email content
      const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #2c3e50; text-align: center; font-size: 24px; margin-bottom: 20px;">Order Summary</h1>
        <p style="font-size: 16px; text-align: center; margin-bottom: 20px;">Thank you for your purchase! Below are the details of your order.</p>
    
        <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 10px;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Quantity</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderSummary.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.productName}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Rs. ${item.price}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
    
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 16px;"><strong>Total Price:</strong> Rs. ${orderSummary.totalPrice}</p>
          <p style="margin: 0; font-size: 16px;"><strong>Shipping Country:</strong> ${orderSummary.country}</p>
        </div>
    
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
          If you have any questions, please contact our support team at <a href="mailto:support@mobilex.com" style="color: #3498db; text-decoration: none;">support@mobilex.com</a>.
        </p>
      </div>
    `;
  
      // Send email using Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Use environment variables
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: 'Order Summary',
        html: emailContent,
      };
  
      // Debugging: Log mailOptions
      // console.log('Mail Options:', mailOptions);
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
  
      res.status(200).json({ message: 'Order summary email sent successfully.' });
    } catch (err) {
      console.error('Error sending email:', err); // Log the full error
      res.status(500).json({ message: 'Failed to send order summary email.', error: err.message });
    }
  };

// Clear Customer Cart
export const clearCart = async (req, res) => {
    const { customerId, orderSummary } = req.body; // Include orderSummary in the request
  
    try {
      const customer = await Custumer.findById(customerId);
  
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
      }
  
      // Add the current cart to orderHistory
      customer.orderHistory.push({
        items: customer.cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price, // Store the price at the time of purchase
        })),
        totalPrice: orderSummary.totalPrice,
        shippingCost: orderSummary.shippingCost,
        country: orderSummary.country,
      });
  
      // Clear the cart
      customer.cart = [];
  
      // Save the updated customer document
      await customer.save();
  
      res.status(200).json({ message: 'Cart cleared and order history updated successfully.', customer });
    } catch (err) {
      res.status(500).json({ message: 'Failed to clear cart and update order history.', error: err.message });
    }
  };

  // Get Customer Order History
  export const getCustomerOrderHistory = async (req, res) => {
    const { customerId } = req.params; // Extract customerId from request parameters
  
    try {
      // Find the customer by ID and populate the product details in orderHistory
      const customer = await Custumer.findById(customerId).populate({
        path: 'orderHistory.items.product',
        select: 'name brandName price image productName', // Select only the required fields
      });
  
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
      }
  
      // Extract the order history
      const orderHistory = customer.orderHistory;
  
      // If no order history exists
      if (!orderHistory || orderHistory.length === 0) {
        return res.status(200).json({ message: 'No order history found.', orderHistory: [] });
      }
  
      // Return the order history
      res.status(200).json({ message: 'Order history retrieved successfully.', orderHistory });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve order history.', error: err.message });
    }
  };