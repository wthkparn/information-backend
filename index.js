require('dotenv').config();
const exprss = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");
const port = 8000;
const app = exprss();
app.use(cors());
app.use(bodyParser.json());

let db = null;
const initmysql = async () => {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });


};

// การใช้งาน Rest API
/*
1. GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
2. POST /users สำหรับการสร้าง users ใหม่บันทึกเข้าไป
3. GET /users/:id สำหรับการดึง users รายคนออกมา
4. PUT /users/:id สำหรับการแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
5. DELETE /users/:id สำหรับการลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
*/

// path = /
app.get("/test", (req, res) => {
  // ส่งป็นไฟล์ text
  // res.send("Hello World");

  const user = {
    firstname: "John",
    lastname: "Doe",
    age: 25,
  };
  res.json(user);
});

// 1. GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
// path = GET /users ดูทั้งหมด
app.get("/users", async (req, res) => {
  const results = await db.query("SELECT * FROM USER");
  res.json(results[0]);
});

// path = GET /users ดูบางข้อมูล
app.get("/usertest", (req, res) => {
  const filterUser = users.map((user) => {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.firstname + " " + user.lastname,
    };
  });
  res.json(filterUser);
});

//3. GET /users/:id สำหรับการดึง users รายคนออกมา
// path = GET /users/:id
app.get("/users/:id", async (req, res) => {
  try {
    let id = req.params.id;
    // หา user จาก id ที่ส่งมา index
    const q = await db.query("SELECT * FROM USER WHERE id = ?", id);
    if (q[0].length > 0) {
      res.json(q[0][0]);
    } else {
      res.status(404).json({
        message: "user not found",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "someting wrong",
    });
  }
});

// 2. POST /users สำหรับการสร้าง users ใหม่บันทึกเข้าไป
// path = POST /user
app.post("/user", async (req, res) => {
  try {
    let user = req.body;
    // นำข้อมูลใน user เข้ามา
    const q = await db.query("INSERT INTO USER SET ?", user);
    res.json({
      message: "user save ok",
      data: {
        user: user,
        id: q[0].insertId,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "someting wrong",
    });
  }
});

// 4. PUT /users/:id สำหรับการแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
// path = PUT /user/:id
app.put("/user/:id", async (req, res) => {
  // หา user จาก id ที่ส่งมา
  try {
    const id = req.params.id;
    const updateuser = req.body;
    // นำข้อมูลใน user เข้ามา
    const q = await db.query("UPDATE  USER SET ? WHERE id = ?", [
      updateuser,
      id,
    ]);
    res.json({
      message: "user update ok",
      data: {
        id: q[0],
      },
    });
  } catch (error) {
    console.error("error message", error.message);
    res.status(500).json({
      message: "someting wrong",
    });
  }
});

app.patch("/user/:id", (req, res) => {
  const id = req.params.id;
  const updateuser = req.body;

  // หา user จาก id ที่ส่งมา
  let selectedIndex = users.findIndex((user) => user.id == id);

  // update ข้อมูลใน user
  if (updateuser.firstname) {
    users[selectedIndex].firstname = updateuser.firstname;
  }
  if (updateuser.lastname) {
    users[selectedIndex].lastname = updateuser.lastname;
  }

  res.send({
    message: "user update ok",
    data: {
      user: updateuser,
      indexUpdate: selectedIndex,
    },
  });
});

// 5. DELETE /users/:id สำหรับการลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
// path = DELETE /user/:id
app.delete("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // นำข้อมูลใน user เข้ามา
    const q = await db.query("DELETE from USER WHERE id = ?", id);
    res.json({
      message: "user delete ok",
      data: {
        id: id,
        indexDelete: req.body,
      },
    });
  } catch (error) {
    console.error("error message", error.message);
    res.status(500).json({
      message: "someting wrong",
    });
  }
});




app.listen(port, async (req, res) => {
  await initmysql();
  console.log(`server is running on port ${port}`);
});
