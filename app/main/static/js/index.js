$(document).ready(function () {
    // Set today's date as default for date select
    setDefaultDate();

    // Load planning data for today's date
    loadPlanningData();
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
 * Format phone number for display
 */
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '-';
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as XX XX XX XX XX
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phoneNumber;
}

/**
 * Load planning data for the selected date
 */
function loadPlanningData() {
    const selectedDate = $('#dateSelect').val();

    if (!selectedDate) {
        showAlert('Veuillez sélectionner une date', 'warning');
        hideWeekInfo();
        updateExportButton(false);
        return;
    }

    const weekNumber = getWeekNumber(selectedDate);
    const year = new Date(selectedDate).getFullYear();

    console.log('Chargement du planning pour la semaine:', weekNumber, 'année:', year);

    // Display week information
    displayWeekInfo(weekNumber, year);

    fetchPlanningData(weekNumber, year);
}

/**
 * Display week information above the table
 */
function displayWeekInfo(weekNumber, year) {
    const dateRange = getWeekDateRange(weekNumber, year);
    const dateRangeText = ` (${formatDate(dateRange.start)} - ${formatDate(dateRange.end)})`;

    $('#weekNumber').text(weekNumber);
    $('#weekDateRange').text(dateRangeText);
    $('#weekInfo').show();
}

/**
 * Hide week information
 */
function hideWeekInfo() {
    $('#weekInfo').hide();
}

/**
 * Update export button state
 */
function updateExportButton(hasData) {
    const exportBtn = $('#exportPdfBtn');
    const mailBtn = $('#mailBtn');
    if (hasData) {
        exportBtn.css('opacity', '1');
        mailBtn.css('opacity', '1');
        exportBtn.css('pointer-events', 'auto');
        mailBtn.css('pointer-events', 'auto');
    } else {
        exportBtn.css('opacity', '0.5');
        mailBtn.css('opacity', '0.5');
        exportBtn.css('pointer-events', 'none');
        mailBtn.css('pointer-events', 'none');
    }
}

/**
 * Fetch planning data from API
 */
function fetchPlanningData(weekNumber, year) {
    const domain = window.location.origin;

    $.ajax({
        url: `${domain}/astreinte/api/query/planning/?a.statut_agent=true&pa.semaine=${weekNumber}&pa.annee=${year}`,
        method: 'GET',
        success: function (planningData) {
            console.log('Données de planning reçues:', planningData);
            populatePlanningTable(planningData, weekNumber, year);
            updateExportButton(planningData && planningData.length > 0);
        },
        error: function (error) {
            console.error('Erreur lors de la récupération du planning:', error);
            showAlert('Erreur lors du chargement du planning', 'danger');
            updateExportButton(false);
        }
    });
}

/**
 * Populate the planning table with data
 */
function populatePlanningTable(planningData, weekNumber, year) {
    const tableBody = $('#planningTableBody');
    tableBody.empty();

    if (!planningData || planningData.length === 0) {
        const noDataRow = $('<tr>').append(
            $('<td colspan="3" class="text-center text-muted">').text('Aucune donnée de planning disponible pour cette semaine')
        );
        tableBody.append(noDataRow);
        return;
    }

    // Group data by team
    const teamsData = groupByTeam(planningData);

    // Get date range for the week
    const dateRange = getWeekDateRange(weekNumber, year);
    const dateRangeText = `du ${formatDate(dateRange.start)} au ${formatDate(dateRange.end)}`;

    // Create table rows for each team
    Object.keys(teamsData).forEach(teamName => {
        const teamAgents = teamsData[teamName];

        // Add team header row
        const teamHeaderRow = $('<tr>').append(
            $('<td colspan="3" class="section-header">').html(
                `${teamName}<br>${dateRangeText}`
            )
        );
        tableBody.append(teamHeaderRow);

        // Add agent rows for this team
        teamAgents.forEach(agent => {
            const agentRow = $('<tr>').append(
                $('<td>').text(`${agent.nom_agent} ${agent.prenom_agent}`),
                $('<td>').text(formatPhoneNumber(agent.num_astreinte_agent)),
                $('<td>').text(formatPhoneNumber(agent.num_pro_agent))
            );
            tableBody.append(agentRow);
        });
    });
}

/**
 * Group planning data by team name
 */
function groupByTeam(planningData) {
    const teams = {};

    planningData.forEach(agent => {
        const teamName = agent.nom_equipe;
        if (!teams[teamName]) {
            teams[teamName] = [];
        }
        teams[teamName].push(agent);
    });

    return teams;
}

/**
 * Export table to PDF using html2pdf
 */
function exportToPdf() {
    const selectedDate = $('#dateSelect').val();
    if (!selectedDate) {
        showAlert('Veuillez sélectionner une date avant d\'exporter', 'warning');
        return;
    }

    const weekNumber = getWeekNumber(selectedDate);
    const year = new Date(selectedDate).getFullYear();
    const dateRange = getWeekDateRange(weekNumber, year);
    const dateRangeText = `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;

    // Create a temporary container for PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.padding = '20px';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';

    // Add title and subtitle
    const title = document.createElement('h1');
    title.textContent = 'Planning d\'astreinte';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.style.fontSize = '24px';
    title.style.color = '#333';

    const subtitle = document.createElement('h2');
    subtitle.textContent = `Semaine ${weekNumber} (${dateRangeText})`;
    subtitle.style.textAlign = 'center';
    subtitle.style.marginBottom = '20px';
    subtitle.style.fontSize = '16px';
    subtitle.style.color = '#666';

    pdfContainer.appendChild(title);
    pdfContainer.appendChild(subtitle);

    // Clone the table for PDF
    const tableClone = $('#planningTable').clone();

    // Apply PDF-specific styles to the cloned table
    tableClone.css({
        'width': '100%',
        'border-collapse': 'collapse',
        'margin': '0',
        'font-size': '12px'
    });

    // Style table headers
    tableClone.find('thead th').css({
        'background-color': '#343a40',
        'color': 'white',
        'padding': '8px',
        'border': '1px solid #dee2e6',
        'font-weight': 'bold',
        'text-align': 'center'
    });

    // Style table cells
    tableClone.find('td').css({
        'padding': '6px',
        'border': '1px solid #dee2e6',
        'text-align': 'center'
    });

    // Style section headers (team headers)
    tableClone.find('.section-header').css({
        'background-color': '#f8f9fa',
        'font-weight': 'bold',
        'text-align': 'center',
        'padding': '10px'
    });

    pdfContainer.appendChild(tableClone[0]);

    // Configure html2pdf options
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `planning_astreinte_semaine_${weekNumber}_${year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    // Generate and download PDF
    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        showAlert('PDF exporté avec succès !', 'success');
    }).catch((error) => {
        console.error('Erreur lors de l\'export PDF:', error);
        showAlert('Erreur lors de l\'export PDF', 'danger');
    });
}

/**
 * Show alert message
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
 * Handle date selection change
 */
$('#dateSelect').on('change', function () {
    loadPlanningData();
});

/**
 * Handle PDF export button click
 */
$('#exportPdfBtn').on('click', function () {
    exportToPdf();
});

/**
 * Open email client with pre-filled content
 */
function openEmailClient() {
    const selectedDate = $('#dateSelect').val();
    if (!selectedDate) {
        showAlert('Veuillez sélectionner une date avant d\'envoyer par mail', 'warning');
        return;
    }

    const weekNumber = getWeekNumber(selectedDate);
    const year = new Date(selectedDate).getFullYear();
    const dateRange = getWeekDateRange(weekNumber, year);
    const dateRangeText = `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;

    // Create email content
    const subject = `Planning d'astreinte - Semaine ${weekNumber} (${dateRangeText})`;

    const body = `Bonjour,

Veuillez trouver ci-joint le planning d'astreinte pour la semaine ${weekNumber} (${dateRangeText}).

Cordialement,
[Votre nom]`;

    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.open(mailtoLink, '_blank');

    // Show instructions for PDF attachment
    showEmailInstructions(weekNumber, year);
}

/**
 * Show instructions for PDF attachment
 */
function showEmailInstructions(weekNumber, year) {
    const instructions = `
        <div class="alert alert-info">
            <h5><i class="fas fa-info-circle"></i> Instructions pour l'attachement PDF</h5>
            <ol>
                <li>Cliquez sur le bouton "Exporter PDF" ci-dessus</li>
                <li>Le fichier sera téléchargé avec le nom: <strong>planning_astreinte_semaine_${weekNumber}_${year}.pdf</strong></li>
                <li>Dans votre client mail, attachez ce fichier PDF</li>
            </ol>
            <p class="mb-0"><strong>Note:</strong> Pour une intégration complète, vous pourriez envisager d'utiliser un serveur SMTP côté serveur.</p>
        </div>
    `;

    // Add instructions to the page
    $('.alertPlaceholder').append(instructions);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        $('.alertPlaceholder .alert-info').last().fadeOut();
    }, 10000);
}

/**
 * Handle mail button click
 */
$('#mailBtn').on('click', function () {
    openEmailClient();
});
