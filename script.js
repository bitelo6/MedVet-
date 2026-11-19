// --- 1. VERIFICAÇÃO DE SEGURANÇA (LOGIN) ---
const vetUser = JSON.parse(localStorage.getItem('vet_user'));

if (!vetUser) {
    window.location.href = 'index.html';
} else {
    const vetNameEl = document.getElementById('vet-name');
    if (vetNameEl) {
        vetNameEl.innerText = vetUser.nome;
    }
}

function logout() {
    localStorage.removeItem('vet_user');
    window.location.href = 'index.html';
}

// --- 2. LÓGICA DE PACIENTES (CRIAR, LISTAR, EDITAR E REMOVER) ---
const form = document.getElementById('patient-form');
const patientList = document.getElementById('patient-list');
const patientCount = document.getElementById('patient-count');
const submitBtn = form.querySelector('button[type="submit"]');
const formTitle = document.querySelector('.card h2');

const STORAGE_KEY = 'vet_patients';
let editingId = null; // Guarda o ID do paciente que está a ser editado

function getSavedPatients() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Carregar pacientes no ecrã
function loadPatients() {
    const patients = getSavedPatients();

    patientList.innerHTML = '';

    if (patientCount) {
        patientCount.innerText = `${patients.length} registo(s)`;
    }

    if (patients.length === 0) {
        patientList.innerHTML = '<p style="color: #64748b;">Nenhum paciente clínico registado.</p>';
        return;
    }

    patients.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <div>
                <div class="patient-card-header">
                    <h3>🐾 ${patient.nome} <span>(${patient.especie} - ${patient.raca || 'Raça N/D'})</span></h3>
                </div>
                <div class="patient-info-list">
                    <p><strong>Dados Fisiológicos:</strong> ${patient.sexo || '-'} | ${patient.castrado || '-'} | ${patient.peso} kg | ${patient.idade || 'Idade N/D'}</p>
                    <p><strong>Tutor Responsável:</strong> ${patient.tutor} ${patient.contacto ? `(${patient.contacto})` : ''}</p>
                    ${patient.microchip ? `<p><strong>Microchip:</strong> ${patient.microchip}</p>` : ''}
                    
                    <div class="patient-section-box">
                        <strong>Vacinação:</strong> ${patient.vacinacao || '-'}<br>
                        <strong>Alergias:</strong> ${patient.alergias || 'Nenhuma declarada'}
                    </div>

                    <div class="patient-section-box">
                        <strong>Histórico Clínico:</strong><br>
                        ${patient.consultas || 'Sem registos prévios.'}
                    </div>

                    <div class="patient-section-box">
                        <strong>Terapêutica / Fármacos:</strong><br>
                        ${patient.medicamentos || 'Nenhum medicamento ativo.'}
                    </div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-edit" onclick="editPatient(${patient.id})">Editar Ficha</button>
                <button class="btn-delete" onclick="removePatient(${patient.id})">Remover Ficha</button>
            </div>
        `;
        patientList.appendChild(card);
    });
}

// Carregar dados do paciente para o formulário para edição
function editPatient(id) {
    const patients = getSavedPatients();
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    editingId = id;

    // Preenche o formulário com os dados atuais do paciente
    document.getElementById('nome').value = patient.nome || '';
    document.getElementById('especie').value = patient.especie || '';
    document.getElementById('raca').value = patient.raca || '';
    document.getElementById('sexo').value = patient.sexo || '';
    document.getElementById('castrado').value = patient.castrado || 'Não Castrado';
    document.getElementById('peso').value = patient.peso || '';
    document.getElementById('idade').value = patient.idade || '';
    document.getElementById('tutor').value = patient.tutor || '';
    document.getElementById('contacto').value = patient.contacto || '';
    document.getElementById('microchip').value = patient.microchip || '';
    document.getElementById('consultas').value = patient.consultas || '';
    document.getElementById('vacinacao').value = patient.vacinacao || 'Atualizado';
    document.getElementById('alergias').value = patient.alergias || '';
    document.getElementById('medicamentos').value = patient.medicamentos || '';

    // Muda o texto do título e do botão para indicar modo de edição
    if (formTitle) formTitle.innerText = `A Editar Ficha: ${patient.nome}`;
    if (submitBtn) submitBtn.innerText = 'Guardar Alterações';

    // Desliza a página suavemente até ao formulário no topo
    form.scrollIntoView({ behavior: 'smooth' });
}

// Guardar novo paciente ou atualizar existente
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dadosFormulario = {
        id: editingId ? editingId : Date.now(),
        nome: document.getElementById('nome') ? document.getElementById('nome').value : '',
        especie: document.getElementById('especie') ? document.getElementById('especie').value : '',
        raca: document.getElementById('raca') ? document.getElementById('raca').value : '',
        sexo: document.getElementById('sexo') ? document.getElementById('sexo').value : '',
        castrado: document.getElementById('castrado') ? document.getElementById('castrado').value : '',
        peso: document.getElementById('peso') ? parseFloat(document.getElementById('peso').value) : 0,
        idade: document.getElementById('idade') ? document.getElementById('idade').value : '',
        tutor: document.getElementById('tutor') ? document.getElementById('tutor').value : '',
        contacto: document.getElementById('contacto') ? document.getElementById('contacto').value : '',
        microchip: document.getElementById('microchip') ? document.getElementById('microchip').value : '',
        consultas: document.getElementById('consultas') ? document.getElementById('consultas').value : '',
        vacinacao: document.getElementById('vacinacao') ? document.getElementById('vacinacao').value : '',
        alergias: document.getElementById('alergias') ? document.getElementById('alergias').value : '',
        medicamentos: document.getElementById('medicamentos') ? document.getElementById('medicamentos').value : ''
    };

    let patients = getSavedPatients();

    if (editingId) {
        // Atualiza o paciente existente na lista
        patients = patients.map(p => p.id === editingId ? dadosFormulario : p);
        editingId = null;
        if (formTitle) formTitle.innerText = 'Novo Registo de Paciente';
        if (submitBtn) submitBtn.innerText = 'Gravar Ficha do Paciente';
    } else {
        // Cria um novo paciente no início da lista
        patients.unshift(dadosFormulario);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));

    form.reset();
    loadPatients();
});

// Remover paciente
function removePatient(id) {
    if (confirm("Confirmar a remoção permanente desta ficha clínica?")) {
        const patients = getSavedPatients();
        const updatedPatients = patients.filter(patient => patient.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));

        // Se o paciente removido estava a ser editado no momento, limpa o formulário
        if (editingId === id) {
            editingId = null;
            form.reset();
            if (formTitle) formTitle.innerText = 'Novo Registo de Paciente';
            if (submitBtn) submitBtn.innerText = 'Gravar Ficha do Paciente';
        }

        loadPatients();
    }
}

// Inicia o carregamento ao abrir a página
loadPatients();