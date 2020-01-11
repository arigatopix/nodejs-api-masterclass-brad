const http = require('http');

const todos = [
  { id: 1, text: 'Todo One' },
  { id: 2, text: 'Todo Two' },
  { id: 3, text: 'Todo Three' }
];

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.JS'
  });

  // console.log(req.headers.authorization);

  // Recieve data from client รับในรูป event (จะทำง่ายกว่าถ้าใช้ express)
  let body = [];

  req
    .on('data', chunk => {
      // รับข้อมูลแล้วใส่ใน array
      body.push(chunk);
    })
    .on('end', () => {
      // รวมข้อมูลใน array
      body = Buffer.concat(body).toString();

      // ถ้าไม่มี .toString จะได้ buffer
      console.log(body);
    });

  res.end(
    JSON.stringify({
      success: false,
      error: null,
      data: todos
    })
  );
});

const PORT = 5000;

server.listen(PORT, () => console.log(`Server run on PORT: ${PORT}`));
