const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/test';

const companies = ["AMZ", "ELP", "SNP", "MYN", "AZO"];
const categories = ["phone", "computer", "tv", "earphone", "tablet", "charger", "house", "keypad", "bluetooth", "pendrive", "remote", "speaker", "headset", "laptop", "pc"];

app.get('/categories/:categoryName/products', async (req, res) => {
    let { categoryName } = req.params;
    categoryName = categoryName.toLowerCase().replace(g, '-'); 
    const { n, minPrice, maxPrice, page, sort } = req.query;
    
    try {
        let allProducts = [];
        for (const company of companies) {
            const companyProducts = await fetchProductsFromCompany(company, categoryName, n, minPrice, maxPrice, page, sort);
            allProducts = allProducts.concat(companyProducts);
        }

        if (sort) {
            allProducts.sort((a, b) => {
                if (sort === 'price') {
                    return a.price - b.price;
                } else if (sort === 'rating') {
                    return b.rating - a.rating;
                } else if (sort === 'discount') {
                    return b.discount - a.discount;
                }
            });
        }

        const startIndex = (page - 1) * n;
        const paginatedProducts = allProducts.slice(startIndex, startIndex + parseInt(n));

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/categories/:categoryName/products/:productId', async (req, res) => {
    let { categoryName, productId } = req.params;
    categoryName = categoryName.toLowerCase().replace(/\s/g, '-'); 

    try {
        const response = await axios.get(`${TEST_SERVER_BASE_URL}/companies/${companies[0]}/categories/${categoryName}/products?${productId}`);
        const productDetails = response.data;

        res.json(productDetails);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function fetchProductsFromCompany(company, categoryName, n, minPrice, maxPrice, page, sort) {
    try {
        const url = `${TEST_SERVER_BASE_URL}/companies/${company}/categories/${categoryName}/products?top-${n}?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&sort=${sort}`;
        console.log('Fetching products from URL:', url);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching products from ${company}:`, error);
        return [];
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
