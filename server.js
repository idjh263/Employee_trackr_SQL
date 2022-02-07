const express = require('express');
const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const logo = require('asciiart-logo');
const longText = "This app is a CMS that manage company's employee database";
console.log(
  logo({
  name: 'Employee Tracker',
  font: 'ANSI Shadow',
  lineChars: 10,
  padding: 2,
  margin: 3,
  borderColor: 'red',
  logoColor: 'bold-green',
  textColor: 'green',
  })
  .emptyLine()
  .right('version 1.0.0')
  .emptyLine()
  .center(longText)
  .render()
);



const PORT = process.env.PORT || 3002;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
// moved code to connection.js

// Not Found response for unmatched routes
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');
  startPrompt();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const promptMessages = {
  viewAllEmployees: "View All Employees",
  viewByDepartment: "View All Employees By Department",
  viewByManager: "View All Employees By Manager",
  addEmployee: "Add An Employee",
  removeEmployee: "Remove An Employee",
  updateRole: "Update Employee Role",
  updateEmployeeManager: "Update Employee Manager",
  viewAllRoles: "View All Roles",
  exit: "Exit"
};


startPrompt = () => {
  inquirer
      .prompt({
          name: 'action',
          type: 'list',
          message: 'What would you like to do?',
          choices: [
              promptMessages.viewAllEmployees,
              promptMessages.viewByDepartment,
              promptMessages.viewByManager,
              promptMessages.viewAllRoles,
              promptMessages.addEmployee,
              promptMessages.removeEmployee,
              promptMessages.updateRole,
              promptMessages.exit
          ]
      })
      .then(answer => {
        console.log('answer', answer);
        switch (answer.action) {
            case promptMessages.viewAllEmployees:
                viewAllEmployees();
                break;

            case promptMessages.viewByDepartment:
                viewByDepartment();
                break;

            case promptMessages.viewByManager:
                viewByManager();
                break;

            case promptMessages.addEmployee:
                addEmployee();
                break;

            case promptMessages.removeEmployee:
                remove('delete');
                break;

            case promptMessages.updateRole:
                remove('role');
                break;

            case promptMessages.viewAllRoles:
                viewAllRoles();
                break;

            case promptMessages.exit:
                exit();
                break;
        }
    });
}
viewAllEmployees = () => {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name," ",manager.last_name) AS "Manager"
  FROM employee 
  LEFT JOIN role ON role.id = employee.role_id 
  LEFT JOIN department ON department.id = role.department_id
  LEFT JOIN employee manager ON manager.id = employee.manager_id
  ORDER BY employee.id;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW ALL EMPLOYEES');
      console.log('\n');
      console.table(res);
      startPrompt();
  });
}
viewByDepartment = () => {
  const query = `SELECT department.department_name AS department, role.title, employee.id, employee.first_name, employee.last_name
  FROM employee
  LEFT JOIN role ON (role.id = employee.role_id)
  LEFT JOIN department ON (department.id = role.department_id)
  ORDER BY department_name;`;
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW EMPLOYEE BY DEPARTMENT');
      console.log('\n');
      console.table(res);
      startPrompt();
  });
}
viewByManager = () => {
  const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department_name, employee.id, employee.first_name, employee.last_name, role.title
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY manager;`;
 db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW EMPLOYEE BY MANAGER');
      console.log('\n');
      console.table(res);
      startPrompt();
  });
}

viewAllRoles = () => {
  const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department_name
  FROM employee
      LEFT JOIN role ON (role.id = employee.role_id)
      LEFT JOIN department ON (department.id = role.department_id)
      ORDER BY role.title;`;
    
  db.query(query, (err, res) => {
      if (err) throw err;
      console.log('\n');
      console.log('VIEW EMPLOYEE BY ROLE');
      console.log('\n');
      console.table(res);
      startPrompt();
  });

}

async function addEmployee() {
  const addname = await inquirer.prompt(askName());
 db.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: () => res.map(res => res.title),
              message: 'What is the employee role?: '
          }
      ]);
      let roleId;
      for (const row of res) {
          if (row.title === role) {
              roleId = row.id;
              continue;
          }
      }
      db.query('SELECT * FROM employee', async (err, res) => {
          if (err) throw err;
          let choices = res.map(res => `${res.first_name} ${res.last_name}`);
          choices.push('none');
          let { manager } = await inquirer.prompt([
              {
                  name: 'manager',
                  type: 'list',
                  choices: choices,
                  message: 'Choose the employee Manager: '
              }
          ]);
          let managerId;
          let managerName;
          if (manager === 'none') {
              managerId = null;
          } else {
              for (const data of res) {
                  data.fullName = `${data.first_name} ${data.last_name}`;
                  if (data.fullName === manager) {
                      managerId = data.id;
                      managerName = data.fullName;
                      console.log(managerId);
                      console.log(managerName);
                      continue;
                  }
              }
          }
          console.log('Employee has been added. Please view all employee to check data.');
          db.query(
              'INSERT INTO employee SET ?',
              {
                  first_name: addname.first,
                  last_name: addname.last,
                  role_id: roleId,
                  manager_id: parseInt(managerId)
              },
              (err, res) => {
                  if (err) throw err;
                  startPrompt();

              }
          );
      });
  });

}
remove = (input) => {
  const promptQ = {
      yes: "yes",
      no: "no I don't (view all employees on the main option)"
  };
  inquirer.prompt([
      {
          name: "action",
          type: "list",
          message: "In order to proceed an employee, an ID must be entered. View all employees to get" +
              " the employee ID. Do you know the employee ID?",
          choices: [promptQ.yes, promptQ.no]
      }
  ]).then(answer => {
      if (input === 'delete' && answer.action === "yes") removeEmployee();
      else if (input === 'role' && answer.action === "yes") updateRole();
      else viewAllEmployees();



  });
};

async function removeEmployee() {

  const answer = await inquirer.prompt([
      {
          name: "first",
          type: "input",
          message: "Enter the employee ID you want to remove:  "
      }
  ]);

db.query('DELETE FROM employee WHERE ?',
      {
          id: answer.first
      },
      function (err) {
          if (err) throw err;
      }
  )
  console.log('Employee has been removed on the system!');
  startPrompt();

};

askId = () => {
  return ([
      {
          name: "name",
          type: "input",
          message: "What is the employee ID?:  "
      }
  ]);
}


async function updateRole() {
  const employeeId = await inquirer.prompt(askId());

  db.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
          {
              name: 'role',
              type: 'list',
              choices: () => res.map(res => res.title),
              message: 'What is the new employee role?: '
          }
      ]);
      let roleId;
      for (const row of res) {
          if (row.title === role) {
              roleId = row.id;
              continue;
          }
      }
      db.query(`UPDATE employee 
      SET role_id = ${roleId}
      WHERE employee.id = ${employeeId.name}`, async (err, res) => {
          if (err) throw err;
          console.log('Role has been updated.')
          startPrompt();
      });
  });
}

askName = () => {
  return ([
      {
          name: "first",
          type: "input",
          message: "Enter the first name: "
      },
      {
          name: "last",
          type: "input",
          message: "Enter the last name: "
      }
  ]);
}
exit = () => {
    process.exit();
  }
