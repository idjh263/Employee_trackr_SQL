// const express = require('express');
// const router = express.Router();
// const db = require('../../db/connection');

// router.get('/employee', (req, res) => {
//     const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name," ",manager.last_name) AS "Manager"
//     FROM employee 
//     LEFT JOIN role ON role.id = employee.role_id 
//     LEFT JOIN department ON department.id = role.department_id
//     LEFT JOIN employee manager ON manager.id = employee.manager_id
//     ORDER BY employee.id;`;
//   db.query(query, (err, rows) => {
//       if (err) throw err;
//       console.log('VIEW ALL EMPLOYEES');
//       console.table(res);
//       startPrompt();
//   });

  
//   // Get single employee
//   router.get('/employee/:id', (req, res) => {
//     const sql = `SELECT * FROM employee WHERE id = ?`;
//     const params = [req.params.id];
  
//     db.query(sql, params, (err, row) => {
//       if (err) {
//         res.status(400).json({ error: err.message });
//         return;
//       }
//       res.json({
//         message: 'success',
//         data: row
//       });
//     });
//   });
  
//   // Create a employee
//   router.post('/employee', ({ body }, res) => {
//     const errors = inputCheck(body, 'first_name', 'last_name', 'email');
//     if (errors) {
//       res.status(400).json({ error: errors });
//       return;
//     }
  
//     const sql = `INSERT INTO employee (first_name, last_name, email) VALUES (?,?,?)`;
//     const params = [body.first_name, body.last_name, body.email];
  
//     db.query(sql, params, (err, result) => {
//       if (err) {
//         res.status(400).json({ error: err.message });
//         return;
//       }
//       res.json({
//         message: 'success',
//         data: body
//       });
//     });
//   });
  
//   // Update a employee's email
//   router.put('/employee/:id', (req, res) => {
//     const errors = inputCheck(req.body, 'email');
//     if (errors) {
//       res.status(400).json({ error: errors });
//       return;
//     }
  
//     const sql = `UPDATE employee SET email = ? WHERE id = ?`;
//     const params = [req.body.email, req.params.id];
  
//     db.query(sql, params, (err, result) => {
//       if (err) {
//         res.status(400).json({ error: err.message });
//       } else if (!result.affectedRows) {
//         res.json({
//           message: 'employee not found'
//         });
//       } else {
//         res.json({
//           message: 'success',
//           data: req.body,
//           changes: result.affectedRows
//         });
//       }
//     });
//   });
  
//   // Delete a employee
//   router.delete('/employee/:id', (req, res) => {
//     const sql = `DELETE FROM employee WHERE id = ?`;
  
//     db.query(sql, req.params.id, (err, result) => {
//       if (err) {
//         res.status(400).json({ error: res.message });
//       } else if (!result.affectedRows) {
//         res.json({
//           message: 'employee not found'
//         });
//       } else {
//         res.json({
//           message: 'deleted',
//           changes: result.affectedRows,
//           id: req.params.id
//         });
//       }
//     });
//   });
  
//   module.exports = router;
  