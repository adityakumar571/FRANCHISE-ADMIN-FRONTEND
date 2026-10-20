console.log('🔍 Image URLs Check:');

// Test medicine with image
fetch('http://localhost:5179/api/franchise/medicines/6a9fd2c718a5595edd52f530')
  .then(r => r.json())
  .then(d => {
    console.log('Medicine:', d.data.name);
    console.log('imageUrl:', d.data.imageUrl);
    console.log('images:', d.data.images);
    
    // Test if image loads
    if (d.data.imageUrl) {
      const testUrl = 'http://localhost:5179' + d.data.imageUrl;
      console.log('Testing:', testUrl);
      fetch(testUrl, { method: 'HEAD' })
        .then(r => console.log('Image Status:', r.status, r.statusText))
        .catch(e => console.error('Image Failed:', e));
    }
  })
