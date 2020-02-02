const NodeGeocoder = require('node-geocoder');
//https://www.npmjs.com/package/node-geocoder
// geocoder คือรับเอา result จาก mapquest (provider) มาเป็น output ให้ใช้งานได้ง่ายๆ

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
