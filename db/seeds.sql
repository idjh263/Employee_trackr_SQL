INSERT INTO department (department_name)
VALUES 
  ("Finance"),
  ("Sales and Marketing"),
  ("Regulatory"),
  ("Research and Development"),
  ("Executive"),
  ("Human Resource");

  INSERT INTO role (title, salary, department_id) 
  VALUES 

  ("General Manager", 150000, 5),
  ("Sales and Marketing Manager", 150000, 2),
  ("Finance Manager", 150000, 1),
  ("Regulatory Manager", 150000, 3),
  ("RnD Manager", 200000, 4),
  ("HR Manager", 150000, 6),  
  ("Accountant", 700000, 1),
  ("Finance Staff", 500000, 1),
  ("Sales Representative", 700000, 2),
  ("Marketing Staff", 500000, 2),
  ("Sales Staff", 500000, 2),
  ("Regulatory Staff", 500000, 3),
  ("RnD Researcher", 1500000, 4),
  ("RnD Staff", 500000, 4),
  ("Executive Staff", 500000, 5),
  ("HR Staff", 500000, 6);

  INSERT INTO employee (first_name, last_name, role_id, manager_id) 
  VALUES 
  ('James', 'Fraser', 1, null),
  ('Jack', 'London', 2, 1),
  ('Robert', 'Bruce', 3, 1),
  ('Peter', 'Greenaway', 4, 1),
  ('Derek', 'Jarman', 5, 1),
  ('Paolo', 'Pasolini', 6, 3),
  ('Heathcote', 'Williams', 7, 3),
  ('Sandy', 'Powell', 8, 2),
  ('Emil', 'Zola', 8, 2),
  ('Sissy', 'Coalpits', 9, 2),
  ('Antoinette', 'Capet', 9, 2),
  ('Samuel', 'Delany',10, 2),
  ('Tony', 'Duvert', 10, 2),
  ('Dennis', 'Cooper', 11, 4),
  ('Monica', 'Bellucci', 11, 4),
  ('Samuel', 'Johnson',12, 5),
  ('John', 'Dryden', 12, 5),
  ('Alexander', 'Pope', 13, 5),
  ('Lionel', 'Johnson', 13, 5),
  ('Aubrey', 'Beardsley', 14, 5),
  ('Tulse', 'Luper', 15, 1),
  ('William', 'Morris', 15, 1),
  ('George', 'Shaw', 16, 6),
  ('Arnold', 'Bennett', 9, 2),
  ('Algernon', 'Blackwood', 9, 2);
  


