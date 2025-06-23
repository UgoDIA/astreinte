$(document).ready(function () {
    // Populate equipe select dropdown on page load
    populateEquipeSelect();

    // Set today's date as default for date select
    setDefaultDate();

    // Initialize pending changes tracking
    window.pendingChanges = {
        assignments: [],
        unassignments: []
    };
});

/**
 * Set today's date as default for the date select
 */
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    $('#dateSelect').val(today);
}

/**
 * Get week number from a date string (YYYY-MM-DD format)
 */
function getWeekNumber(dateString) {
    const date = new Date(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get date range for a specific week number
 */
function getWeekDateRange(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const firstWeekday = firstDayOfYear.getDay();

    // Calculate the first day of the week
    const daysToAdd = (weekNumber - 1) * 7 - firstWeekday + 1;
    const firstDayOfWeek = new Date(year, 0, 1);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysToAdd);

    // Calculate the last day of the week (Sunday)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

    return {
        start: firstDayOfWeek,
        end: lastDayOfWeek
    };
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format week number and date range for display
 */
function formatWeekDisplay(weekNumber, year) {
    const dateRange = getWeekDateRange(weekNumber, year);
    const startDate = formatDate(dateRange.start);
    const endDate = formatDate(dateRange.end);

    return `Semaine ${weekNumber}<br><small>${startDate} - ${endDate}</small>`;
}

/**
 * Populate the equipe select dropdown with data from the API
 */
function populateEquipeSelect() {
    const domain = window.location.origin;

    $.ajax({
        url: `${domain}/astreinte/api/equipe/?statut_equipe=true`,
        method: 'GET',
        success: function (equipeData) {
            const equipeSelect = $('#equipeSelect');

            // Clear the loading option
            equipeSelect.html('<option value="" disabled selected>Sélectionner une équipe</option>');

            // Add options for each equipe
            equipeData.forEach(equipe => {
                equipeSelect.append(`<option value="${equipe.id_equipe}">${equipe.nom_equipe}</option>`);
            });
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des équipes:', error);
            const equipeSelect = $('#equipeSelect');
            equipeSelect.html('<option value="" disabled selected>Erreur de chargement</option>');
        }
    });
}

/**
 * Fetch agents from the selected equipe
 */
function fetchAgentsFromEquipe(equipeId) {
    const domain = window.location.origin;

    $.ajax({
        url: `${domain}/astreinte/api/query/agent/?a.statut_agent=true&e.id_equipe=${equipeId}`,
        method: 'GET',
        success: function (agentsData) {
            console.log('Agents de l\'équipe:', agentsData);
            // Store agents data for table population
            window.currentAgents = agentsData;
        },
        error: function (error) {
            console.error('Erreur lors de la récupération des agents:', error);
        }
    });
}

/**
 * Fetch planning data for the selected equipe and week
 */
function fetchPlanningData(equipeId, weekNumber, selectedDate) {
    const domain = window.location.origin;
    const year = new Date(selectedDate).getFullYear();

    $.ajax({
        url: `${domain}/astreinte/api/query/planning/?a.statut_agent=true&pa.semaine=>=${weekNumber}&pa.semaine=<=${weekNumber + 5}&e.id_equipe=${equipeId}&pa.annee=${year}`,
        method: 'GET',
        success: function (planningData) {
            console.log('Données de planning:', planningData);
            // Store planning data for table population
            window.currentPlanning = planningData;
            // Populate the table with both agents and planning data
            populatePlanningTable(weekNumber);
        },
        error: function (error) {
            console.error('Erreur lors de la récupération du planning:', error);
        }
    });
}

/**
 * Populate the planning table with agents and weeks
 */
function populatePlanningTable(startWeek) {
    const agents = window.currentAgents || [];
    const planning = window.currentPlanning || [];
    const selectedDate = $('#dateSelect').val();
    const year = new Date(selectedDate).getFullYear();

    // Update week headers with date ranges
    for (let i = 1; i <= 5; i++) {
        const weekNumber = startWeek + i - 1;
        const headerText = formatWeekDisplay(weekNumber, year);
        $(`#week${i}Header`).html(headerText);
    }

    // Clear existing table body
    const tableBody = $('#planningTableBody');
    tableBody.empty();

    // Create rows for each agent
    agents.forEach(agent => {
        const row = $('<tr>');

        // Agent name column
        const agentCell = $('<td>').text(`${agent.nom_agent} ${agent.prenom_agent}`);
        row.append(agentCell);

        // Week columns (5 weeks total)
        for (let weekIndex = 1; weekIndex <= 5; weekIndex++) {
            const weekNumber = startWeek + weekIndex - 1;
            const cell = createWeekCell(agent, weekNumber, planning);
            row.append(cell);
        }

        tableBody.append(row);
    });
}

/**
 * Create a clickable cell for a specific agent and week
 */
function createWeekCell(agent, weekNumber, planningData) {
    const cell = $('<td>');
    cell.addClass('planning-cell');
    cell.attr('data-agent-id', agent.id_equipe_agent_fonction);
    cell.attr('data-week', weekNumber);
    cell.attr('data-agent-name', `${agent.nom_agent} ${agent.prenom_agent}`);

    // Check if this agent is assigned to this week
    const isAssigned = planningData.some(plan =>
        plan.id_equipe_agent_fonction === agent.id_equipe_agent_fonction && plan.semaine === weekNumber
    );

    if (isAssigned) {
        cell.addClass('assigned');
        cell.html('<i class="fas fa-check text-success"></i> Assigné');
    } else {
        cell.addClass('unassigned');
        cell.text('-');
    }

    // Add click handler
    cell.on('click', function () {
        handleCellClick($(this), agent, weekNumber);
    });

    return cell;
}

/**
 * Handle cell click for assignment
 */
function handleCellClick(cell, agent, weekNumber) {
    const isCurrentlyAssigned = cell.hasClass('assigned');
    const isPendingAssign = cell.hasClass('pending-assign');
    const isPendingUnassign = cell.hasClass('pending-unassign');
    const selectedDate = $('#dateSelect').val();
    const year = new Date(selectedDate).getFullYear();

    if (isPendingAssign) {
        // Cancel pending assignment
        removePendingAssignment(agent.id_equipe_agent_fonction, weekNumber, cell);
    } else if (isPendingUnassign) {
        // Cancel pending unassignment
        removePendingUnassignment(agent.id_equipe_agent_fonction, weekNumber, cell);
    } else if (isCurrentlyAssigned) {
        // Unassign agent - immediate action
        // Find the planning_agent record to delete
        const planningData = window.currentPlanning || [];
        const planningRecord = planningData.find(plan =>
            plan.id_equipe_agent_fonction === agent.id_equipe_agent_fonction &&
            plan.semaine === weekNumber
        );

        if (planningRecord) {
            addPendingUnassignment(planningRecord.id_planning_agent, cell, agent, weekNumber);
        }
    } else {
        // Assign agent - immediate action
        addPendingAssignment(agent.id_equipe_agent_fonction, weekNumber, year, cell, agent);
    }
}

/**
 * Show confirmation modal
 */
function showConfirmationModal(title, message, onConfirm) {
    $('#confirmationModalLabel').text(title);
    $('#confirmationModalBody').html(message);

    // Remove previous event handlers
    $('#confirmButton').off('click');

    // Add new event handler
    $('#confirmButton').on('click', function () {
        $('#confirmationModal').modal('hide');
        onConfirm();
    });

    $('#confirmationModal').modal('show');
}

/**
 * Add pending assignment
 */
function addPendingAssignment(idEquipeAgentFonction, semaine, annee, cell, agent) {
    const change = {
        id_equipe_agent_fonction: idEquipeAgentFonction,
        semaine: semaine,
        annee: annee,
        agent: agent,
        cell: cell
    };

    // Check if this assignment is already pending
    const existingIndex = window.pendingChanges.assignments.findIndex(assignment =>
        assignment.id_equipe_agent_fonction === idEquipeAgentFonction &&
        assignment.semaine === semaine
    );

    if (existingIndex === -1) {
        window.pendingChanges.assignments.push(change);
        cell.removeClass('unassigned').addClass('pending-assign');
        cell.html('<i class="fas fa-clock text-warning"></i> En attente');
        updateSaveButton();
    }
}

/**
 * Add pending unassignment
 */
function addPendingUnassignment(idPlanningAgent, cell, agent, weekNumber) {
    const change = {
        id_planning_agent: idPlanningAgent,
        agent: agent,
        cell: cell,
        weekNumber: weekNumber
    };

    // Check if this unassignment is already pending
    const existingIndex = window.pendingChanges.unassignments.findIndex(unassignment =>
        unassignment.id_planning_agent === idPlanningAgent
    );

    if (existingIndex === -1) {
        window.pendingChanges.unassignments.push(change);
        cell.removeClass('assigned').addClass('pending-unassign');
        cell.html('<i class="fas fa-clock text-danger"></i> En attente');
        updateSaveButton();
    }
}

/**
 * Update save button state
 */
function updateSaveButton() {
    const hasChanges = window.pendingChanges.assignments.length > 0 || window.pendingChanges.unassignments.length > 0;
    const saveButton = $('#saveButton');

    if (hasChanges) {
        saveButton.prop('disabled', false);
        const totalChanges = window.pendingChanges.assignments.length + window.pendingChanges.unassignments.length;
        saveButton.html(`<i class="fas fa-save"></i> Enregistrer les modifications (${totalChanges})`);
    } else {
        saveButton.prop('disabled', true);
        saveButton.html('<i class="fas fa-save"></i> Enregistrer les modifications');
    }
}

/**
 * Save all pending changes
 */
function saveAllChanges() {
    const assignments = window.pendingChanges.assignments;
    const unassignments = window.pendingChanges.unassignments;

    if (assignments.length === 0 && unassignments.length === 0) {
        return;
    }

    // Show confirmation modal
    const totalChanges = assignments.length + unassignments.length;
    const message = `
        <p>Vous êtes sur le point d'enregistrer <strong>${totalChanges}</strong> modification(s) :</p>
        <ul>
            ${assignments.length > 0 ? `<li><strong>${assignments.length}</strong> assignation(s)</li>` : ''}
            ${unassignments.length > 0 ? `<li><strong>${unassignments.length}</strong> désassignation(s)</li>` : ''}
        </ul>
        <p>Voulez-vous continuer ?</p>
    `;

    showConfirmationModal('Enregistrer les modifications', message, () => {
        processAllChanges();
    });
}

/**
 * Process all pending changes
 */
function processAllChanges() {
    const assignments = window.pendingChanges.assignments;
    const unassignments = window.pendingChanges.unassignments;

    let completedAssignments = 0;
    let completedUnassignments = 0;
    const totalOperations = assignments.length + unassignments.length;

    // Process assignments
    assignments.forEach(assignment => {
        assignAgent(assignment.id_equipe_agent_fonction, assignment.semaine, assignment.annee, assignment.cell, assignment.agent)
            .then(() => {
                completedAssignments++;
                checkAllCompleted();
            })
            .catch(() => {
                checkAllCompleted();
            });
    });

    // Process unassignments
    unassignments.forEach(unassignment => {
        unassignAgent(unassignment.id_planning_agent, unassignment.cell, unassignment.agent, unassignment.weekNumber)
            .then(() => {
                completedUnassignments++;
                checkAllCompleted();
            })
            .catch(() => {
                checkAllCompleted();
            });
    });

    function checkAllCompleted() {
        if (completedAssignments + completedUnassignments === totalOperations) {
            // Clear pending changes
            window.pendingChanges = {
                assignments: [],
                unassignments: []
            };
            updateSaveButton();

            // Show success message
            showAlert('Toutes les modifications ont été enregistrées avec succès !', 'success');
        
        }
    }
}

/**
 * Assign agent to a week via API
 */
function assignAgent(idEquipeAgentFonction, semaine, annee, cell, agent) {
    return new Promise((resolve, reject) => {
        const domain = window.location.origin;
        const csrftoken = getCookie('csrftoken');

        const data = {
            id_equipe_agent_fonction: idEquipeAgentFonction,
            semaine: semaine,
            annee: annee
        };

        $.ajax({
            url: `${domain}/astreinte/api/planning_agent/`,
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
                "X-CSRFToken": csrftoken
            },
            success: function (response) {
                console.log('Agent assigné avec succès:', response);
                cell.removeClass('pending-assign').addClass('assigned');
                cell.html('<i class="fas fa-check text-success"></i> Assigné');

                // Update the planning data to include the new assignment
                if (!window.currentPlanning) {
                    window.currentPlanning = [];
                }
                window.currentPlanning.push({
                    id_planning_agent: response.id,
                    id_equipe_agent_fonction: idEquipeAgentFonction,
                    semaine: semaine,
                    annee: annee
                });
                resolve();
            },
            error: function (error) {
                console.error('Erreur lors de l\'assignation:', error);
                cell.removeClass('pending-assign').addClass('unassigned');
                cell.text('-');
                reject(error);
            }
        });
    });
}

/**
 * Unassign agent from a week via API
 */
function unassignAgent(idPlanningAgent, cell, agent, weekNumber) {
    return new Promise((resolve, reject) => {
        const domain = window.location.origin;
        const csrftoken = getCookie('csrftoken');

        $.ajax({
            url: `${domain}/astreinte/api/planning_agent/${idPlanningAgent}/`,
            method: 'DELETE',
            headers: {
                "X-CSRFToken": csrftoken
            },
            success: function (response) {
                console.log('Agent désassigné avec succès:', response);
                cell.removeClass('pending-unassign').addClass('unassigned');
                cell.text('-');

                // Remove the assignment from the planning data
                if (window.currentPlanning) {
                    window.currentPlanning = window.currentPlanning.filter(plan =>
                        plan.id_planning_agent !== idPlanningAgent
                    );
                }
                resolve();
            },
            error: function (error) {
                console.error('Erreur lors de la désassignation:', error);
                cell.removeClass('pending-unassign').addClass('assigned');
                cell.html('<i class="fas fa-check text-success"></i> Assigné');
                reject(error);
            }
        });
    });
}

/**
 * Get CSRF token from cookies
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Handle equipe selection change
 */
$('#equipeSelect').on('change', function () {
    const selectedEquipeId = $(this).val();
    const selectedEquipeName = $(this).find('option:selected').text();
    const selectedDate = $('#dateSelect').val();

    if (selectedEquipeId && selectedDate) {
        console.log('Équipe sélectionnée:', selectedEquipeName, 'ID:', selectedEquipeId);
        console.log('Date sélectionnée:', selectedDate);

        // Calculate week number from selected date
        const weekNumber = getWeekNumber(selectedDate);
        console.log('Numéro de semaine:', weekNumber);

        // Fetch agents from the selected equipe
        fetchAgentsFromEquipe(selectedEquipeId);

        // Fetch planning data for the selected equipe and week
        fetchPlanningData(selectedEquipeId, weekNumber, selectedDate);
    }
});

/**
 * Handle date selection change
 */
$('#dateSelect').on('change', function () {
    const selectedDate = $(this).val();
    const selectedEquipeId = $('#equipeSelect').val();

    if (selectedDate && selectedEquipeId) {
        console.log('Date sélectionnée:', selectedDate);

        // Calculate week number from selected date
        const weekNumber = getWeekNumber(selectedDate);
        console.log('Numéro de semaine:', weekNumber);

        // Fetch planning data for the selected equipe and week
        fetchPlanningData(selectedEquipeId, weekNumber, selectedDate);
    }
});

/**
 * Handle save button click
 */
$('#saveButton').on('click', function () {
    saveAllChanges();
});

/**
 * Remove pending assignment
 */
function removePendingAssignment(idEquipeAgentFonction, semaine, cell) {
    // Remove from pending changes
    window.pendingChanges.assignments = window.pendingChanges.assignments.filter(assignment =>
        !(assignment.id_equipe_agent_fonction === idEquipeAgentFonction && assignment.semaine === semaine)
    );

    // Reset cell to unassigned state
    cell.removeClass('pending-assign').addClass('unassigned');
    cell.text('-');

    updateSaveButton();
}

/**
 * Remove pending unassignment
 */
function removePendingUnassignment(idEquipeAgentFonction, semaine, cell) {
    // Remove from pending changes
    window.pendingChanges.unassignments = window.pendingChanges.unassignments.filter(unassignment =>
        !(unassignment.agent.id_equipe_agent_fonction === idEquipeAgentFonction && unassignment.weekNumber === semaine)
    );

    // Reset cell to assigned state
    cell.removeClass('pending-unassign').addClass('assigned');
    cell.html('<i class="fas fa-check text-success"></i> Assigné');

    updateSaveButton();
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