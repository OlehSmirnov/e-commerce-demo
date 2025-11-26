const backend = process.env.REACT_APP_BACKEND_URL || "";

const handlePayment = async (provider, cartItems) => {
  const endpoint = `${backend}/pay/${provider}`;
  try {
    const res = await fetch(endpoint,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(cartItems)
    });

    if(provider==="stripe" || provider==="paypal"){
      const {url} = await res.json();
      window.location.href = url;
    } else {
      const html = await res.text();
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();
    }
  } catch(err){
    console.error(provider, err);
  }
};
