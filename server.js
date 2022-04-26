require('dotenv').config()
const stripe = require('stripe')(process.env.REACT_APP_TEST_KEY);
const express = require('express')
const app = express()


const path = require("path")
if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"))
  app.get("*", (req, res) => {
    req.sendFile(path.resolve(__dirname, "build", "index.html"))
  })
}
app.post('/create-checkout-session', async (req, res) => {

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1KsOTNCPEspXM0sLtOYAeHUR',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.REACT_APP_CLIENT_PORT}?success=true`,
    cancel_url: `${process.env.REACT_APP_CLIENT_PORT}?canceled=true`,
  });
  res.redirect(303, session.url);
});

app.listen(process.env.PORT || 5000, () => console.log('Running on port 5000'))