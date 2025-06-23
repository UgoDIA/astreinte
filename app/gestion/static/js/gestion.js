$(document).ready(function () {
    const domain = window.location.origin;
    console.log(user_nni)
    loadActiveTab();
    // getEquipe(domain)
    populateEquipe(domain)
    populateAgent(domain)
    populateFonction(domain)



    const tabs = document.querySelectorAll('#myTabs button[data-bs-toggle="tab"]');

    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            const newActiveTabId = event.target.id;
            sessionStorage.setItem('activeTabId', newActiveTabId);
        });
    });



    $('#addEquipe').click(function () {
        openAddModal('equipe');
    });

    $('#addAgent').click(function () {
        openAddModal('agent');
    });

    $('#addFonction').click(function () {
        openAddModal('fonction');
    });



})

function populateEquipe(domain) {
    const key = "equipe"

    $('#equipeTable').DataTable({

        ajax: {
            url: domain + '/astreinte/api/equipe/?statut_equipe=true',
            dataSrc: '',

        },
        columns: [
            { data: 'nom_equipe', title: 'Nom équipe' },
            { data: 'jour_astreinte_equipe', title: 'Jour de prise d\'astreinte' },
            { data: 'heure_astreinte_equipe', title: 'Heure de prise d\'astreinte' }

        ],

        language: { url: '/static/librairie/datatables/fr_fr.json' },
        autoWidth: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
            {
                targets: [0],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        const button = `
                            <button onclick="fetchOne('${domain}','${key}','${row.id_equipe}')" class="btn btn-edit">
                                <img src="/static/images/edit.png" class="mx-1 py-1" style="max-height: 30px;">
                            </button>
                        `;
                        return `
                        <div class="row align-items-center">
                            <div class="col-auto edit-btn">${button}</div>
                            <div class="col center-edit text-center">${data}</div>
                        </div>
                    `;
                    }
                    return data;
                }
            },
            {
                targets: '_all',
                render: function (data, type, row) {

                    if (data === null || data === undefined || data === '') {
                        return '-';
                    }
                    return data;
                }
            },
            {
                className: "dt-center",
                targets: "_all"
            },
            {
                type: 'string',
                targets: '_all'
            }
        ]
    });
}


function populateAgent(domain) {
    const key = "agent"
    $('#agentTable').DataTable({

        ajax: {
            url: domain + '/astreinte/api/agent/?statut_agent=true',
            dataSrc: ''
        },
        columns: [
            { data: 'nom_agent', title: 'Nom' },
            { data: 'prenom_agent', title: 'Prénom' },
            { data: 'num_astreinte_agent', title: 'N° d\'astreinte' },
            { data: 'num_pro_agent', title: 'N° professionnel' }
        ],

        language: { url: '/static/librairie/datatables/fr_fr.json' },
        autoWidth: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
            {
                targets: [0],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        const button = `
                            <button onclick="fetchOne('${domain}','${key}','${row.id_agent}')" class="btn btn-edit">
                                <img src="/static/images/edit.png" class="mx-1 py-1" style="max-height: 30px;">
                            </button>
                        `;
                        return `
                            <div class="row align-items-center">
                                <div class="col-auto edit-btn">${button}</div>
                                <div class="col center-edit text-center">${data}</div>
                            </div>
                        `;
                    }
                    return data;
                }
            },
            {
                targets: '_all',
                render: function (data, type, row) {

                    if (data === null || data === undefined || data === '') {
                        return '-';
                    }
                    return data;
                }
            },
            {
                className: "dt-center",
                targets: "_all"
            },
            {
                type: 'string',
                targets: '_all'
            }
        ]
    });
}

function populateFonction(domain) {
    const key = "fonction"
    $('#fonctionTable').DataTable({

        ajax: {
            url: domain + '/astreinte/api/fonction/?statut_fonction=true',
            dataSrc: ''
        },
        columns: [
            { data: 'nom_fonction', title: 'Fonction' },
        ],

        language: { url: '/static/librairie/datatables/fr_fr.json' },
        autoWidth: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
            {
                targets: [0],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter' || data === '') {
                        const button = `
                            <button onclick="fetchOne('${domain}','${key}','${row.id_fonction}')" class="btn btn-edit">
                                <img src="/static/images/edit.png" class="mx-1 py-1" style="max-height: 30px;">
                            </button>
                        `;
                        return `
                        <div class="row align-items-center">
                            <div class="col-auto edit-btn">${button}</div>
                            <div class="col center-edit text-center">${data}</div>
                        </div>
                    `;
                    }
                    return data;
                }
            },
            {
                targets: '_all',
                render: function (data, type, row) {

                    if (data === null || data === undefined) {
                        return '-';
                    }
                    return data;
                }
            },
            {
                className: "dt-center",
                targets: "_all"
            },
            {
                type: 'string',
                targets: '_all'
            }
        ]
    });
}

function populateParam(domain) {
    $.ajax({
        url: domain + '/elia/api/liste_param/',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            let param_select = $('#parametre');
            let totalCount = 0;

            data.forEach(item => {
                totalCount += item.count;
            });

            param_select.append(`<option value="all">Tout</option>`);

            data.forEach(item => {
                param_select.append(`<option value="${item.parametre}">${item.parametre}</option>`);
            });
        },
        error: function (err) {
            console.error('Erreur lors de la récupération des labels:', err);
        }
    });
}

function populateLabel(domain, selectedParam) {
    const key = "label"

    $('#labelTable').DataTable().destroy();

    $('#labelTable').DataTable({

        ajax: {
            url: domain + '/elia/api/label/',
            dataSrc: function (data) {
                if (selectedParam === 'all') {
                    return data;
                } else {
                    return data.filter(item => item.parametre === selectedParam);
                }
            }
        },
        columns: [
            { data: 'libelle', title: 'Libellé' },
            { data: 'parametre', title: 'Nom paramètre' },
            { data: 'ordre', title: 'Ordre' },


        ],

        language: { url: '/static/librairie/datatables/fr_fr.json' },
        autoWidth: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
            {
                targets: [0],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        const button = `
                            <button onclick="fetchOne('${domain}','${key}','${row.id_label}')" class="btn btn-edit">
                                <img src="/static/images/edit.png" class="mx-1 py-1" style="max-height: 30px;">
                            </button>
                        `;
                        return `
                        <div class="row align-items-center">
                            <div class="col-auto edit-btn">${button}</div>
                            <div class="col center-edit text-center">${data}</div>
                        </div>
                    `;
                    }
                    return data;
                }
            },
            {
                targets: '_all',
                render: function (data, type, row) {

                    if (data === null || data === undefined || data === '') {
                        return '-';
                    }
                    return data;
                }
            },
            {
                className: "dt-center",
                targets: "_all"
            },
            {
                type: 'string',
                targets: '_all'
            }
        ]
    });
}

function populateBatterie(domain) {
    const key = "batterie"
    $('#batterieTable').DataTable({

        ajax: {
            url: domain + '/elia/api/batterie/',
            dataSrc: ''
        },
        columns: [
            { data: 'type_batterie', title: 'Type' },
            { data: 'constructeur_batterie', title: 'Constructeur' },
            { data: 'modele_batterie', title: 'Modèle' },


        ],

        language: { url: '/static/librairie/datatables/fr_fr.json' },
        autoWidth: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
            {
                targets: [0],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        const button = `
                            <button onclick="fetchOne('${domain}','batteries','${row.id_batterie}')" class="btn btn-edit">
                                <img src="/static/images/edit.png" class="mx-1 py-1" style="max-height: 30px;">
                            </button>
                        `;
                        return `
                        <div class="row align-items-center">
                            <div class="col-auto edit-btn">${button}</div>
                            <div class="col center-edit text-center">${data}</div>
                        </div>
                    `;
                    }
                    return data;
                }
            },
            {
                targets: '_all',
                render: function (data, type, row) {

                    if (data === null || data === undefined || data === '') {
                        return '-';
                    }
                    return data;
                }
            },
            {
                className: "dt-center",
                targets: "_all"
            },
            {
                type: 'string',
                targets: '_all'
            }
        ]
    });
}



function loadActiveTab() {
    const activeTabId = sessionStorage.getItem('activeTabId');
    if (activeTabId) {
        const tabTriggerEl = document.querySelector(`#${activeTabId}`);
        if (tabTriggerEl) {
            const tab = new bootstrap.Tab(tabTriggerEl);
            tab.show();
        }
    } else {
        const defaultTabTriggerEl = document.querySelector('#tab1-tab');
        if (defaultTabTriggerEl) {
            const defaultTab = new bootstrap.Tab(defaultTabTriggerEl);
            defaultTab.show();
        }
    }
}

