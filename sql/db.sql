CREATE TABLE equipe (
   id_equipe SERIAL PRIMARY KEY,
   nom_equipe VARCHAR(50),
   jour_astreinte VARCHAR(50),
   heure_astreinte VARCHAR(50),
   statut BOOLEAN
);

CREATE TABLE agent (
   id_agent SERIAL PRIMARY KEY,
   nom VARCHAR(50),
   prenom VARCHAR(50),
   gsm VARCHAR(50),
   fixe VARCHAR(50),
   statut BOOLEAN
);

CREATE TABLE planning (
   id_planning SERIAL PRIMARY KEY,
   semaine VARCHAR(50)
);

CREATE TABLE fonction (
   id_fonction SERIAL PRIMARY KEY,
   nom_fonction VARCHAR(50),
   statut BOOLEAN
);

CREATE TABLE equipe_agent_fonction (
   id_equipe_agent_fonction SERIAL PRIMARY KEY,
   id_equipe INT NOT NULL,
   id_agent INT NOT NULL,
   id_fonction INT NOT NULL,
   UNIQUE (id_equipe, id_agent, id_fonction),
   FOREIGN KEY (id_equipe) REFERENCES equipe(id_equipe),
   FOREIGN KEY (id_agent) REFERENCES agent(id_agent),
   FOREIGN KEY (id_fonction) REFERENCES fonction(id_fonction)
);

CREATE TABLE planning_agent (
   id_planning_agent SERIAL PRIMARY KEY,
   id_planning INT NOT NULL,
   id_equipe_agent_fonction INT NOT NULL,
   statut BOOLEAN,
   date_assignement DATE,
   UNIQUE (id_planning, id_equipe_agent_fonction),
   FOREIGN KEY (id_planning) REFERENCES planning(id_planning),
   FOREIGN KEY (id_equipe_agent_fonction) REFERENCES equipe_agent_fonction(id_equipe_agent_fonction)
);
