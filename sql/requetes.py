queries = {
    'agent': """
        SELECT 
            a.id_agent,
            a.nom_agent,
            a.prenom_agent,
            e.nom_equipe,
            f.nom_fonction,
            eaf.id_equipe_agent_fonction,
            e.id_equipe,
            f.id_fonction,
            a.num_astreinte_agent,
            a.num_pro_agent
        FROM agent a
        JOIN equipe_agent_fonction eaf ON a.id_agent = eaf.id_agent
        JOIN equipe e ON eaf.id_equipe = e.id_equipe
        JOIN fonction f ON eaf.id_fonction = f.id_fonction

""",

    'planning': """
        SELECT 
            pa.id_planning_agent,
            pa.semaine,
            pa.annee,
            a.id_agent,
            a.nom_agent,
            a.prenom_agent,
            e.nom_equipe,
            f.nom_fonction,
            eaf.id_equipe_agent_fonction,
            e.id_equipe,
            a.num_astreinte_agent,
            a.num_pro_agent
        FROM planning_agent pa
        JOIN equipe_agent_fonction eaf ON pa.id_equipe_agent_fonction = eaf.id_equipe_agent_fonction
        JOIN agent a ON eaf.id_agent = a.id_agent
        JOIN equipe e ON eaf.id_equipe = e.id_equipe
        JOIN fonction f ON eaf.id_fonction = f.id_fonction
"""

}
