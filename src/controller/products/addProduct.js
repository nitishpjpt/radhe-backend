import { Product } from "../../models/product/product.js";

// Controller for adding a product
const addProduct = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required!" });
    }
    console.log(req.file);

    // Validate request body fields
    const { productName, price, description, brandName, category } = req.body;
    console.log(req.body);
    if (!productName || !price || !description || !brandName || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Construct image URL
    const imageUrl = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`;

    // Create and save product
    const newProduct = new Product({
      productName,
      price,
      description,
      brandName,
      productName,
      category,
      image: imageUrl,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a product by ID
const editProduct = async (req, res) => {
  try {
    const { brandName, productName, price , description } = req.body;
    console.log(req.body)
    const updateData = { brandName, productName, price , description};

    // If a file was uploaded, update the image path
    if (req.file) {
      updateData.image = `${process.env.IMG_BASE_URL}/images/${req.file.filename}`; // Save the file path
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export { addProduct, editProduct, deleteProduct, getProducts, getProductById };
