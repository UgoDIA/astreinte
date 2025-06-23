/**
 * Ouvre le modal formulaire d'ajout en fonction de la clé
 * @param {string} key - identifie le formulaire à générer (vp, flux, evt).
 */
function openAddModal(key) {
    const formHtml = generateFormHtml(key);
    const modalTitle = getModalTitle(key);
    $('#modalTitle').text(modalTitle);
    $('.modal-body').html(formHtml);
    $('#modalForm').modal('show');

    if (key === 'equipe') {
        flatpickr("#heure_astreinte_equipe", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            minuteIncrement: 1,
            allowInput: true,
            clickOpens: true
        });
    } else if (key === 'agent') {
        populateAgentSelects();
    }
}


function populateAgentSelects() {
    const domain = window.location.origin;

    $.ajax({
        url: `${domain}/astreinte/api/equipe/?statut_equipe=true`,
        method: 'GET',
        success: function (equipeData) {
            const equipeSelect = $('#equipe');
            equipeSelect.html('<option value="" disabled selected>Sélectionner une équipe</option>');
            equipeData.forEach(equipe => {
                equipeSelect.append(`<option value="${equipe.id_equipe}">${equipe.nom_equipe}</option>`);
            });
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des équipes:', error);
        }
    });

    $.ajax({
        url: `${domain}/astreinte/api/fonction/?statut_fonction=true`,
        method: 'GET',
        success: function (fonctionData) {
            const fonctionSelect = $('#fonction');
            fonctionSelect.html('<option value="" disabled selected>Sélectionner une fonction</option>');
            fonctionData.forEach(fonction => {
                fonctionSelect.append(`<option value="${fonction.id_fonction}">${fonction.nom_fonction}</option>`);
            });
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des fonctions:', error);
        }
    });
}

/**
 * Génère le HTML du formulaire basé sur la clé
 * @param {string} key - Identifiant du formulaire.
 * @returns {string} - Le HTML du formulaire.
 */
function generateFormHtml(key) {
    let formHtml = '';
    // 
    switch (key) {
        case 'equipe':
            formHtml = generateEquipeFormHtml();
            break;
        case 'fonction':
            formHtml = generateFonctionFormHtml();
            break;
        case 'agent':
            formHtml = generateAgentFormHtml();
            break;
        default:
            formHtml = '<p>Formulaire non défini.</p>';
    }

    return formHtml;
}

/**
 * Génère le HTML du formulaire pour l'intervenant
 * @returns {string} - Le HTML du formulaire pour l'intervenant.
 */
function generateEquipeFormHtml() {
    return `
        <form id="addForm">
            <div class="row mb-3">
                <div class="col-md-12">
                    <label for="nom_equipe" class="form-label">Nom de l'équipe</label>
                    <input type="text" class="form-control" id="nom_equipe" name="nom_equipe" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="jour_astreinte_equipe" class="form-label">Jour de prise d'astreinte</label>
                        <select class="form-select" id="jour_astreinte_equipe" name="jour_astreinte_equipe" required>
                        <option value="" disabled selected>Sélectionner un jour</option>
                        <option value="Lundi">Lundi</option>
                        <option value="Mardi">Mardi</option>
                        <option value="Mercredi">Mercredi</option>
                        <option value="Jeudi">Jeudi</option>
                        <option value="Vendredi">Vendredi</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="heure_astreinte_equipe" class="form-label">Heure de prise d'astreinte</label>
                    <input type="text" class="form-control" id="heure_astreinte_equipe" name="heure_astreinte_equipe" placeholder="Sélectionner une heure" required>
                </div>
            </div>
            <button type="button" class="btn btnsubmit" onclick="handleFormAdd('equipe')">Enregistrer</button>
        </form>
    `;
}



/**
 * Génère le HTML du formulaire pour la fonnction
 * @returns {string} - Le HTML du formulaire pour la fonnction.
 */
function generateFonctionFormHtml() {
    return `
        <form id="addForm">
            <div class="row mb-3">
                <div class="col-md-12">
                    <label for="nom_fonction" class="form-label">Fonction</label>
                    <input type="text" class="form-control" id="nom_fonction" name="nom_fonction" required>
                </div>
            </div>
            <button type="button" class="btn btnsubmit" onclick="handleFormAdd('fonction')">Enregistrer</button>
        </form>
    `;
}

/**
 * Génère le HTML du formulaire pour l'agent
 * @returns {string} - Le HTML du formulaire pour l'agent.
 */
function generateAgentFormHtml() {
    return `
        <form id="addForm">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="nom_agent" class="form-label">Nom</label>
                    <input type="text" class="form-control" id="nom_agent" name="nom_agent" required>
                </div>
                <div class="col-md-6">
                    <label for="prenom" class="form-label">Prénom</label>
                    <input type="text" class="form-control" id="prenom" name="prenom" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="equipe" class="form-label">Équipe</label>
                    <select class="form-select" id="equipe" name="equipe" required>
                        <option value="" disabled selected>Sélectionner une équipe</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="fonction" class="form-label">Fonction</label>
                    <select class="form-select" id="fonction" name="fonction" required>
                        <option value="" disabled selected>Sélectionner une fonction</option>
                    </select>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="num_astreinte_agent" class="form-label">N° d\'astreinte</label>
                    <input type="text" class="form-control" id="num_astreinte_agent" name="num_astreinte_agent" required>
                </div>
                <div class="col-md-6">
                    <label for="num_pro_agent" class="form-label">N° professionnel</label>
                    <input type="text" class="form-control" id="num_pro_agent" name="num_pro_agent" required>
                </div>
            </div>
            <button type="button" class="btn btnsubmit" onclick="handleFormAdd('agent')">Enregistrer</button>
        </form>
    `;
}


/**
 * Obtient le titre du modal basé sur la clé
 * @param {string} key - Identifiant du formulaire.
 * @returns {string} - Le titre du modal.
 */
function getModalTitle(key) {
    switch (key) {
        case 'equipe':
            return "Ajout d'une équipe";
        case 'fonction':
            return "Ajout d'une fonction";
        case 'agent':
            return "Ajout d'un agent";
        default:
            return 'Ajout';
    }
}


/**
 * gere envoi du formulaire d'ajout
 * @param {string} key - cle qui identifie le formulaire a generer (vp, flux, evt, agence).
 */
function handleFormAdd(key) {
    const form = $('#addForm');
    const form_data = form.serializeArray();
    const domain = window.location.origin;
    const csrftoken = getCookie('csrftoken');
    let url = domain + '/astreinte/api/' + key + '/';
    let method = 'POST';

    switch (key) {
        case 'equipe':
        case 'fonction':
        case 'agent':
            break;
        default:
            return;
    }

    form.find('.invalid-feedback').remove();
    form.find('.is-invalid').removeClass('is-invalid');

    let hasInvalidField = false;

    form.find('input, select, textarea').each(function () {
        let value = $(this).val();
        const isRequired = $(this).is('[required]');
        console.log(value);

        if (typeof value === 'string') {
            value = value.trim();
        }
        if (value === '') {
            value = null;
        }

        $(this).val(value);

        if (isRequired && value === null) {
            hasInvalidField = true;
            $(this).addClass('is-invalid');
            $(this).after('<div class="invalid-feedback">Ce champ est requis.</div>');
        }
    });

    if (hasInvalidField) {
        return;
    }

    let data = {};

    form_data.forEach(item => {
        data[item.name] = item.value === '' ? null : item.value;
    });

    // Special handling for agent creation (two-step process)
    if (key === 'agent') {
        handleAgentCreation(data, domain, csrftoken);
        return;
    }

    $.ajax({
        url: url,
        method: method,
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (response) {
            showAlert('Ajout enregistré avec succès.', 'success');
            console.log('ajout ok')
            table_id = key + 'Table'
            $('#modalForm').modal('hide');
            $('#' + table_id).DataTable().ajax.reload(null, false);

            if (key === 'fonction') {
                // histo(domain, 'create', user_nni, "fonction", response.id, data, affaire_id, response.id);
                $('#' + table_id).DataTable().ajax.reload(null, false);
            } else if (key === 'equipe') {
                // histo(domain, 'create', user_nni, "equipe", response.id, data, affaire_id);
                $('#' + table_id).DataTable().ajax.reload(null, false);
            }
        },
        error: function (error) {
            showAlert('Erreur lors de l\'ajout.', 'danger');
            $('#modalForm').modal('hide');
            console.error('Erreur lors de l\'ajout:', error);
        }
    });
}


function handleAgentCreation(agentData, domain, csrftoken) {
    const agentUrl = domain + '/astreinte/api/agent/';

    const agentOnlyData = {
        nom_agent: agentData.nom_agent,
        prenom_agent: agentData.prenom,
        num_astreinte_agent: agentData.num_astreinte_agent || null,
        num_pro_agent: agentData.num_pro_agent || null
    };

    $.ajax({
        url: agentUrl,
        method: 'POST',
        data: JSON.stringify(agentOnlyData),
        contentType: 'application/json',
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (agentResponse) {
            console.log('Agent créé avec succès:', agentResponse);


            const eafUrl = domain + '/astreinte/api/equipe_agent_fonction/';
            const eafData = {
                id_agent: agentResponse.id,
                id_equipe: agentData.equipe,
                id_fonction: agentData.fonction
            };

            $.ajax({
                url: eafUrl,
                method: 'POST',
                data: JSON.stringify(eafData),
                contentType: 'application/json',
                headers: {
                    "X-CSRFToken": csrftoken
                },
                success: function (eafResponse) {
                    showAlert('Agent ajouté avec succès.', 'success');
                    console.log('Relation équipe-agent-fonction créée:', eafResponse);

                    $('#modalForm').modal('hide');
                    $('#agentTable').DataTable().ajax.reload(null, false);


                    // histo(domain, 'create', user_nni, "agent", agentResponse.id_agent, agentOnlyData);
                    // histo(domain, 'create', user_nni, "equipe_agent_fonction", eafResponse.id_equipe_agent_fonction, eafData);
                },
                error: function (eafError) {
                    showAlert('Erreur lors de la création de la relation équipe-agent-fonction.', 'danger');
                    console.error('Erreur création relation EAF:', eafError);


                }
            });
        },
        error: function (agentError) {
            showAlert('Erreur lors de la création de l\'agent.', 'danger');
            $('#modalForm').modal('hide');
            console.error('Erreur création agent:', agentError);
        }
    });
}

function fetchOne(domain, key, id) {
    let apiUrl = domain + '/astreinte/api/' + key + '/' + id + '/'
    
    $.ajax({
        url: apiUrl,
        method: 'GET',
        success: function (data) {
            console.log(data)
            openEditModal(key, data);
        },
        error: function (error) {
            console.error('Erreur :', error);
        }
    });
}

function populateAgentEditSelects(rowData) {
    const domain = window.location.origin;

    $.ajax({
        url: `${domain}/astreinte/api/equipe/?statut_equipe=true`,
        method: 'GET',
        success: function (equipeData) {
            const equipeSelect = $('#equipe');
            equipeSelect.html('<option value="" disabled>Sélectionner une équipe</option>');
            equipeData.forEach(equipe => {
                const selected = equipe.id_equipe === rowData.id_equipe ? 'selected' : '';
                equipeSelect.append(`<option value="${equipe.id_equipe}" ${selected}>${equipe.nom_equipe}</option>`);
            });
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des équipes:', error);
        }
    });

 
    $.ajax({
        url: `${domain}/astreinte/api/fonction/?statut_fonction=true`,
        method: 'GET',
        success: function (fonctionData) {
            const fonctionSelect = $('#fonction');
            fonctionSelect.html('<option value="" disabled>Sélectionner une fonction</option>');
            fonctionData.forEach(fonction => {
                const selected = fonction.id_fonction === rowData.id_fonction ? 'selected' : '';
                fonctionSelect.append(`<option value="${fonction.id_fonction}" ${selected}>${fonction.nom_fonction}</option>`);
            });
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des fonctions:', error);
        }
    });
}

/**
 * Ouvre le modal formulaire d'edit et le pre-remplis en fonction de la cle et la section
 * @param {string} key - identifie le formulaire a generer .
 * @param {Object} [rowData] - permet de recuperer les donnees de la ligne selectionnee
 */
function openEditModal(key, rowData) {
    let formHtml = '';
    if (key == 'fonction') {
        formHtml += `
        <form id="editForm">
            <div class="row mb-3">
                <div class="col-md-12">
                    <label for="nom_fonction" class="form-label">Fonction</label>
                    <input type="text" class="form-control" id="nom_fonction" name="nom_fonction" value="${replaceNull(rowData.nom_fonction)}" required>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btnsubmit" onclick="handleFormEdit('${key}','${rowData.id_fonction}')">Enregistrer</button>
                </div>
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btn-danger" onclick="handleSoftDelete('${key}','${rowData.id_fonction}')">Supprimer</button>
                </div>
            </div>
        </form>
    `;
    } else if (key === 'equipe') {
        formHtml += `
        <form id="editForm">
            <div class="row mb-3">
                <div class="col-md-12">
                    <label for="nom_equipe" class="form-label">Nom de l'équipe</label>
                    <input type="text" class="form-control" id="nom_equipe" name="nom_equipe" value="${replaceNull(rowData.nom_equipe)}" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="jour_astreinte_equipe" class="form-label">Jour de prise d'astreinte</label>
                    <select class="form-select" id="jour_astreinte_equipe" name="jour_astreinte_equipe" required>
                        <option value="" disabled>Sélectionner un jour</option>
                        <option value="Lundi" ${rowData.jour_astreinte_equipe === 'Lundi' ? 'selected' : ''}>Lundi</option>
                        <option value="Mardi" ${rowData.jour_astreinte_equipe === 'Mardi' ? 'selected' : ''}>Mardi</option>
                        <option value="Mercredi" ${rowData.jour_astreinte_equipe === 'Mercredi' ? 'selected' : ''}>Mercredi</option>
                        <option value="Jeudi" ${rowData.jour_astreinte_equipe === 'Jeudi' ? 'selected' : ''}>Jeudi</option>
                        <option value="Vendredi" ${rowData.jour_astreinte_equipe === 'Vendredi' ? 'selected' : ''}>Vendredi</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="heure_astreinte_equipe" class="form-label">Heure de prise d'astreinte</label>
                    <input type="text" class="form-control" id="heure_astreinte_equipe" name="heure_astreinte_equipe" value="${replaceNull(rowData.heure_astreinte_equipe)}" placeholder="Sélectionner une heure" required>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btnsubmit" onclick="handleFormEdit('${key}','${rowData.id_equipe}')">Enregistrer</button>
                </div>
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btn-danger" onclick="handleSoftDelete('${key}','${rowData.id_equipe}')">Supprimer</button>
                </div>
            </div>
        </form>
    `;
    } else if (key === 'agent') {
        formHtml += `
        <form id="editForm">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="nom_agent" class="form-label">Nom</label>
                    <input type="text" class="form-control" id="nom_agent" name="nom_agent" value="${replaceNull(rowData.nom_agent)}" required>
                </div>
                <div class="col-md-6">
                    <label for="prenom" class="form-label">Prénom</label>
                    <input type="text" class="form-control" id="prenom" name="prenom" value="${replaceNull(rowData.prenom_agent)}" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="equipe" class="form-label">Équipe</label>
                    <select class="form-select" id="equipe" name="equipe" required>
                        <option value="" disabled>Sélectionner une équipe</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="fonction" class="form-label">Fonction</label>
                    <select class="form-select" id="fonction" name="fonction" required>
                        <option value="" disabled>Sélectionner une fonction</option>
                    </select>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="num_astreinte_agent" class="form-label">N° d'astreinte</label>
                    <input type="text" class="form-control" id="num_astreinte_agent" name="num_astreinte_agent" value="${replaceNull(rowData.num_astreinte_agent)}" required>
                </div>
                <div class="col-md-6">
                    <label for="num_pro_agent" class="form-label">N° professionnel</label>
                    <input type="text" class="form-control" id="num_pro_agent" name="num_pro_agent" value="${replaceNull(rowData.num_pro_agent)}" required>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btnsubmit" onclick="handleFormEdit('${key}','${rowData.id_agent}')">Enregistrer</button>
                </div>
                <div class="col-md-6 text-center">
                    <button type="button" class="btn btn-danger" onclick="handleSoftDelete('${key}','${rowData.id_agent}')">Supprimer</button>
                </div>
            </div>
        </form>
    `;
    }

    let modalTitle;
    switch (key) {
        case 'fonction':
            modalTitle = 'Modification d\'une fonction';
            break;
        case 'equipe':
            modalTitle = 'Modification d\'une équipe';
            break;
        case 'agent':
            modalTitle = 'Modification d\'un agent';
            break;
        default:
            modalTitle = 'Modification';
    }
    $('#modalTitle').text(modalTitle);
    $('.modal-body').html(formHtml);
    $('#modalForm').modal('show');

    if (key === 'equipe') {
        flatpickr("#heure_astreinte_equipe", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            minuteIncrement: 1,
            allowInput: true,
            clickOpens: true
        });
    } else if (key === 'agent') {
        populateAgentEditSelects(rowData);
    }
}

/**
 * gere envoi du formulaire edit.
 * @param {string} key - cle qui identifie le formulaire a generer
 * @param {number} [id] - permet de recuperer les donnees de la ligne selectionnee 
 */
function handleFormEdit(key, id) {
    const form = $('#editForm');
    const form_data = form.serializeArray();
    const domain = window.location.origin;
    var csrftoken = getCookie('csrftoken');
    let url = '';
    let method = 'PUT';
    let hasInvalidField = false;

    form.find('input, select').each(function () {
        let value = $(this).val();
        const isRequired = $(this).is('[required]');
        console.log(value);

        if (typeof value === 'string') {
            value = value.trim();
        }
        if (value === '') {
            value = null;
        }

        $(this).val(value);

        if (isRequired && value === null) {
            hasInvalidField = true;
            $(this).addClass('is-invalid');
            $(this).after('<div class="invalid-feedback">Ce champ est requis.</div>');
        }
    });

    if (hasInvalidField) {
        return;
    }

    let data = {};

    form_data.forEach(item => {
        data[item.name] = item.value === '' ? null : item.value;
    });

    if (data.hasOwnProperty('statut')) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
            return;
        }
        data = { 'statut': 'inactif' };
    }


    if (key === 'agent') {
        handleAgentEdit(data, id, domain, csrftoken);
        return;
    }

    switch (key) {
        case 'fonction':
        case 'equipe':
            url = `${domain}/astreinte/api/${key}/${id}/`;
            break;
        default:
            return;
    }

    $.ajax({
        url: url,
        method: method,
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (response) {
            showAlert('Modifications enregistrées avec succès.', 'success');
            $('#modalForm').modal('hide');
            table_id = key + 'Table'
            $('#' + table_id).DataTable().ajax.reload(null, false);

            if (key === 'fonction') {
                // histo(domain, 'update', user_nni, "fonction", id, data, null, id)
            } else if (key === 'equipe') {
                // histo(domain, 'update', user_nni, "equipe", id, data, id)
            }
        },
        error: function (error) {
            showAlert('Erreur lors de l\'enregistrement des modifications.', 'danger');
            console.error('Erreur lors de l\'enregistrement des modifications:', error);
        }
    });
}

function handleAgentEdit(agentData, id, domain, csrftoken) {

    const agentUrl = domain + '/astreinte/api/agent/' + id + '/';

    const agentOnlyData = {
        nom_agent: agentData.nom_agent,
        prenom_agent: agentData.prenom,
        num_astreinte_agent: agentData.num_astreinte_agent || null,
        num_pro_agent: agentData.num_pro_agent || null
    };

    $.ajax({
        url: agentUrl,
        method: 'PUT',
        data: JSON.stringify(agentOnlyData),
        contentType: 'application/json',
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (agentResponse) {
            console.log('Agent mis à jour avec succès:', agentResponse);

            const eafUrl = domain + '/astreinte/api/equipe_agent_fonction/?id_agent=' + id;

            $.ajax({
                url: eafUrl,
                method: 'GET',
                success: function (eafListResponse) {
                    if (eafListResponse && eafListResponse.length > 0) {
                        const eafId = eafListResponse[0].id_equipe_agent_fonction;
                        const eafUpdateUrl = domain + '/astreinte/api/equipe_agent_fonction/' + eafId + '/';

                        const eafData = {
                            id_agent: id,
                            id_equipe: agentData.equipe,
                            id_fonction: agentData.fonction
                        };

                        $.ajax({
                            url: eafUpdateUrl,
                            method: 'PUT',
                            data: JSON.stringify(eafData),
                            contentType: 'application/json',
                            headers: {
                                "X-CSRFToken": csrftoken
                            },
                            success: function (eafResponse) {
                                showAlert('Agent modifié avec succès.', 'success');
                                console.log('Relation équipe-agent-fonction mise à jour:', eafResponse);

                                $('#modalForm').modal('hide');
                                $('#agentTable').DataTable().ajax.reload(null, false);

                                // histo(domain, 'update', user_nni, "agent", id, agentOnlyData);
                                // histo(domain, 'update', user_nni, "equipe_agent_fonction", eafId, eafData);
                            },
                            error: function (eafError) {
                                showAlert('Erreur lors de la mise à jour de la relation équipe-agent-fonction.', 'danger');
                                console.error('Erreur mise à jour relation EAF:', eafError);
                            }
                        });
                    } else {
                        showAlert('Erreur: Relation équipe-agent-fonction non trouvée.', 'danger');
                    }
                },
                error: function (eafListError) {
                    showAlert('Erreur lors de la récupération de la relation équipe-agent-fonction.', 'danger');
                    console.error('Erreur récupération relation EAF:', eafListError);
                }
            });
        },
        error: function (agentError) {
            showAlert('Erreur lors de la modification de l\'agent.', 'danger');
            console.error('Erreur modification agent:', agentError);
        }
    });
}

/**
 * permet de retrouver la valeur d'un cookie, sera appelé dans toutes les requetes ajax pour le CSRF
 * @param {string} name - nom du cookie
 * @returns {string|null} valeur du cookie, null si vide
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();

            if (cookie.substring(0, name.length + 1) === (name + '=')) {

                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function replaceNull(value) {
    return value === null ? '' : value;
}

/**
 * genere message d'alerte bootstrap a l'interieur d'un placeholder
 * @param {string} message - message de l'alerte
 * @param {string} type - couleur de l'alerte bootstrap (success, danger, etc.)
 */
function showAlert(message, type) {
    const alertPlaceholder = $('.alertPlaceholder');
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertPlaceholder.html(alertHtml);

    setTimeout(function () {
        const alertElement = $('.alert');
        if (alertElement.length) {
            alertElement.alert('close');
        }
    }, 4500);
}

/**
 * enregistre saisies dans la table histo_saisies
 * @param {string} domain - url du domaine
 * @param {string} action - type d'action
 * @param {number} user - nni de l'utilisateur
 * @param {string} type - categorie saisie
 * @param {string} valeur -valeur de la saisie
 */
function histo(domain, action, user, type, id_item, valeur = null, id_affaires = null, id_intervenant_info = null) {
    console.log(valeur)
    const url = domain + '/astreinte/api/histo_saisies/';
    const csrftoken = getCookie('csrftoken');

    if (valeur !== null && typeof valeur !== 'string') {
        valeur = JSON.stringify(valeur);
    }

    const data = {
        action: action,
        nni: user,
        type: type,
        valeur: valeur === null ? null : valeur,
        id_item: id_item,
        id_affaires: id_affaires,
        id_intervenant_info: id_intervenant_info
    };

    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (response) {
            console.log('Histo enregistré avec succés:', response);

        },
        error: function (error) {
            console.error('Erreur enregistrement histo', error);

        }
    });
}


function handleSoftDelete(key, id) {
    $('#modalForm').modal('hide');
    showConfirmationModal(
        'Confirmation de suppression',
        'Êtes-vous sûr de vouloir supprimer cet élément ?',
        function () {
            performSoftDelete(key, id);
        }
    );
}

function showConfirmationModal(title, message, onConfirm) {
    const modalHtml = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-md modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Supprimer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#confirmationModal').remove();

    $('body').append(modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();

    $('#confirmDeleteBtn').off('click').on('click', function () {
        modal.hide();
        onConfirm();
        
    });

    $('#confirmationModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}


function performSoftDelete(key, id) {
    const domain = window.location.origin;
    const csrftoken = getCookie('csrftoken');
    let url = '';
    let statusField = '';

    switch (key) {
        case 'equipe':
        case 'fonction':
        case 'agent':
            url = `${domain}/astreinte/api/${key}/${id}/`;
            statusField = 'statut_' + key;
            break;
        default:
            console.error('Table non reconnue pour la suppression:', key);
            return;
    }

    const data = {
        [statusField]: false
    };

    $.ajax({
        url: url,
        method: 'PUT',
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            "X-CSRFToken": csrftoken
        },
        success: function (response) {
            showAlert('Enregistrement supprimé avec succès.', 'success');
            $('#modalForm').modal('hide');

            const table_id = key + 'Table';
            if ($('#' + table_id).length) {
                $('#' + table_id).DataTable().ajax.reload(null, false);
            }

        },
        error: function (error) {
            showAlert('Erreur lors de la suppression de l\'enregistrement.', 'danger');
            console.error('Erreur lors de la suppression:', error);
        }
    });
}