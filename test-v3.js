

async function testFull() {
  const url = 'https://firstroom.in/wp-json/wc/store/v1/products?slug=tiger-gate';
  const res = await fetch(url);
  const data = await res.json();
  
  if (data && data.length > 0) {
    console.log("Full Product:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("Not found");
  }
}

testFull();
