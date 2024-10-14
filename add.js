const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// การตั้งค่าเชื่อมต่อฐานข้อมูล
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Student',
    password: 'abc25965',
    port: 5432,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ฟังก์ชันเพื่อดึงข้อมูลนักศึกษาทั้งหมด
app.get('/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public."Student"');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// ฟังก์ชันสำหรับเช็คชื่อ (เพิ่มข้อมูลเช็คชื่อในตาราง Student_list)
app.post('/attendance', async (req, res) => {
    const { Std_id, SEC_ID, Status } = req.body;
    const Active_date = new Date().toISOString().split('T')[0]; // วันที่เช็คชื่อ

    try {
        const insertQuery = `
            INSERT INTO public."Student_list" ("SEC_ID", "Active_date", "Status", "Std_id")
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(insertQuery, [SEC_ID, Active_date, Status, Std_id]);
        res.status(201).json({ message: 'Attendance recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// ฟังก์ชันเพื่อดึงข้อมูลการเช็คชื่อของนักศึกษาทั้งหมด
app.get('/attendance', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.first_name, s.last_name, sl."Status", sl."Active_date"
            FROM public."Student_list" sl
            JOIN public."Student" s ON s."Std_id" = sl."Std_id"
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// ฟังก์ชันสำหรับบันทึกข้อมูลส่วนตัวของนักเรียน
app.post('/profile', async (req, res) => {
    const { Std_id, first_name, last_name, date_of_birth, address, telephone, email } = req.body;

    try {
        const insertQuery = `
            INSERT INTO public."Student" ("Std_id", "first_name", "last_name", "date_of_birth", "address", "telephone", "e-mail")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await pool.query(insertQuery, [Std_id, first_name, last_name, date_of_birth, address, telephone, email]);
        res.status(201).json({ message: 'Profile saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

// กำหนดให้ Express ใช้โฟลเดอร์ static
app.use(express.static(path.join(__dirname, 'Wed_Student')));

// เส้นทางสำหรับหน้า index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// เพิ่มเส้นทางสำหรับไฟล์ profile.html
app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname,  'profile.html'));
});



// ตั้งค่าให้เซิร์ฟเวอร์ทำงานบน port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
