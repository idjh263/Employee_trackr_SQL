const express = require("express");
const inquirer = require("inquirer");
const db = require("./db/connection");
const cTable = require("console.table");
var term = require( 'terminal-kit' ).terminal ;
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
db.connect((err) => {
  if (err) throw err;
  console.log("Database connected.");
  startPrompt();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const promptMessages = {
  viewAllEmployees: "View All Employees",
  viewByDepartment: "View All Employees By Department",
  viewByManager: "View All Employees By Manager",
  viewAllRoles: "View All Roles",
  addEmployee: "Add An Employee",
  removeEmployee: "Remove An Employee",
  updateRole: "Update Employee Role",
  viewBudget: "View Company Budget",
  exit: "Exit",
};

const startPrompt = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        promptMessages.viewAllEmployees,
        promptMessages.viewByDepartment,
        promptMessages.viewByManager,
        promptMessages.viewAllRoles,
        promptMessages.addEmployee,
        promptMessages.removeEmployee,
        promptMessages.updateRole,
        promptMessages.viewBudget,
        promptMessages.exit,
      ],
    })
    .then((answer) => {
      console.log("answer", answer);
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

        case promptMessages.viewAllRoles:
          viewAllRoles();
          break;

        case promptMessages.addEmployee:
          addEmployee();
          break;

        case promptMessages.removeEmployee:
          removeEmployee("delete");
          break;

        case promptMessages.updateRole:
          updateRole("role");
          break;

        case promptMessages.viewBudget:
          viewBudget();
          break;

        case promptMessages.exit:
          exit();
          break;
      }
    });
};
const viewAllEmployees = () => {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name," ",manager.last_name) AS "Manager"
  FROM employee 
  LEFT JOIN role ON role.id = employee.role_id 
  LEFT JOIN department ON department.id = role.department_id
  LEFT JOIN employee manager ON manager.id = employee.manager_id
  ORDER BY employee.id;`;
  db.query(query, (err, res) => {
    if (err) throw err;
    term.cyan(console.log("VIEW ALL EMPLOYEES"));
    console.table(res);
    startPrompt();
  });
};
const viewByDepartment = () => {
  const query = `SELECT department.department_name AS department, role.title, employee.id, employee.first_name, employee.last_name
  FROM employee
  LEFT JOIN role ON (role.id = employee.role_id)
  LEFT JOIN department ON (department.id = role.department_id)
  ORDER BY department_name;`;
  db.query(query, (err, res) => {
    if (err) throw err;
    term.yellow(console.log("VIEW EMPLOYEE BY DEPARTMENT"));
    console.table(res);
    startPrompt();
  });
};
const viewByManager = () => {
  const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department_name, employee.id, employee.first_name, employee.last_name, role.title
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id && employee.manager_id != 'NULL')
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY manager;`;
  db.query(query, (err, res) => {
    if (err) throw err;
    term.green(console.log("VIEW EMPLOYEE BY MANAGER"));
    console.table(res);
    startPrompt();
  });
};
const viewAllRoles = () => {
  const query = `SELECT role.title, employee.id, employee.first_name, employee.last_name, department_name
  FROM employee
      LEFT JOIN role ON (role.id = employee.role_id)
      LEFT JOIN department ON (department.id = role.department_id)
      ORDER BY role.title;`;

  db.query(query, (err, res) => {
    if (err) throw err;
    term.blue(console.log("VIEW EMPLOYEE BY ROLES"));
    console.table(res);
    startPrompt();
  });
};

const viewBudget = () => {
    const query = `SELECT SUM(salary) AS Budget 
    FROM
    EMPLOYEE LEFT JOIN ROLE
    ON Employee.role_id = role.id
    LEFT JOIN DEPARTMENT
    ON department_id = department.id;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        term.red(console.log("VIEW COMPANY BUDGET"));
        console.table(res);
        startPrompt();
      });
    };


async function addEmployee() {
  const addname = await inquirer.prompt(askName());
  db.query(
    "SELECT role.id, role.title FROM role ORDER BY role.id;",
    async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: "role",
          type: "list",
          choices: () => res.map((res) => res.title),
          message: "What is the employee role?: ",
        },
      ]);
      let roleId;
    
      for (const pos of res) {
        if (pos.title === role) {
          roleId = pos.id;
          term.red(console.log(roleId));
          continue;
        }
      }
      db.query("SELECT * FROM employee", async (err, res) => {
        if (err) throw err;
        let choices = res.map((res) => `${res.first_name} ${res.last_name}`);
        choices.push("none");
        let { manager } = await inquirer.prompt([
          {
            name: "manager",
            type: "list",
            choices: choices,
            message: "Choose the employee Manager: ",
          },
        ]);
        let managerId;
        let managerName;
        if (manager === "none") {
          managerId = null;
        } else {
          for (const data of res) {
            data.fullName = `${data.first_name} ${data.last_name}`;
            if (data.fullName === manager) {
              managerId = data.id;
              managerName = data.fullName;
              term.red(console.log(managerName));
              continue;
            }
          }
        }
        console.log(
          "Employee has been added. Please view all employee to check data."
        );
        db.query(
          "INSERT INTO employee SET ?",
          {
            first_name: addname.first,
            last_name: addname.last,
            role_id: roleId,
            manager_id: parseInt(managerId),
          },
          (err, res) => {
            if (err) throw err;
            startPrompt();
          }
        );
      });
    }
  );
}
function remove(input) {
  const promptQ = {
    yes: "YES",
    no: "no, Cancel Remove",
  };
  inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message:
          "Need employee id to delete employee details, View all employees to get" + " the employee ID. Do you know the employee ID?",
        choices: [promptQ.yes, promptQ.no],
      },
    ])
    .then((answer) => {
      if (input === "delete" && answer.action === "yes") removeEmployee();
      else if (input === "role" && answer.action === "yes") updateRole();
      else viewAllEmployees();
    });
};

async function removeEmployee() {
  const answer = await inquirer.prompt([
    {
      name: "first",
      type: "input",
      message: "Enter the employee ID you want to remove:  ",
    },
  ]);

  db.query(
    "DELETE FROM employee WHERE ?",
    {
      id: answer.first,
    },
    function (err) {
      if (err) throw err;
    }
  );
  console.log("Employee has been removed on the system!");
  startPrompt();
}

const askId = () => {
  return [
    {
      name: "name",
      type: "input",
      message: "What is the employee ID?:  ",
    },
  ];
};

async function updateRole() {
  const employeeId = await inquirer.prompt(askId());

  db.query(
    "SELECT role.id, role.title FROM role ORDER BY role.id;",
    async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: "role",
          type: "list",
          choices: () => res.map((res) => res.title),
          message: "What is the new employee role?: ",
        },
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      db.query(
        `UPDATE employee 
      SET role_id = ${roleId}
      WHERE employee.id = ${employeeId.name}`,
        async (err, res) => {
          if (err) throw err;
          console.log("Role has been updated.");
          startPrompt();
        }
      );
    }
  );
}

const askName = () => {
  return [
    {
      name: "first",
      type: "input",
      message: "Enter the first name: ",
    },
    {
      name: "last",
      type: "input",
      message: "Enter the last name: ",
    },
  ];
};
const exit = () => {
  process.exit();
};

