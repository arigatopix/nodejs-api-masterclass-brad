const http = require('http');

const todos = [
  { id: 1, text: 'Todo One' },
  { id: 2, text: 'Todo Two' },
  { id: 3, text: 'Todo Three' }
];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  let body = [];

  req
    .on('data', chunk => {
      // รับข้อมูลแล้วใส่ใน array
      body.push(chunk);
    })
    .on('end', () => {
      // รวมข้อมูลใน array
      body = Buffer.concat(body).toString();

      // ตั้งค่า GET, POST แบบ manaul กำหนด method และ route
      let status = 404;
      const response = {
        success: false,
        error: null,
        data: null
      };

      // GET และต้องเป็น route '/todos' เท่านั้น
      if (method === 'GET' && url === '/todos') {
        // === คือเช็ค text และ data type
        status = 200;
        response.success = true;
        response.data = todos;
      } else if (method === 'POST' && url === '/todos') {
        // รับ json เข้ามาต้องแปลงเป็น JS Object
        const { id, text } = JSON.parse(body);

        if (!id || !text) {
          // เช็คว่า json ที่ได้เป็นข้อมูลที่มูลที่มี id และ text
          status = 400;
          response.error = 'Plase add id and text';
        } else {
          // เพิ่ม data ใน array todos
          todos.push({ id, text });

          status = 201;

          response.success = true;
          response.data = todos;
        }
      }

      // sent to client
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'X-Powered-By': 'Node.JS'
      });

      // ส่งไปแสดงผลว่าสำเร็จ
      res.end(JSON.stringify(response));
    });
});

const PORT = 5000;

server.listen(PORT, () => console.log(`Server run on PORT: ${PORT}`));
