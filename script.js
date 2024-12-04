let defectsDirHandle;

document.getElementById('selectDir').addEventListener('click', async () => {
    const directoryHandle = await window.showDirectoryPicker();
    defectsDirHandle = await directoryHandle.getDirectoryHandle('defects', { create: false });
    const defects = await loadDefects(defectsDirHandle);
    renderDefects(defects);
    document.getElementById('createDefect').disabled = false;
});

document.getElementById('createDefect').addEventListener('click', () => {
    document.getElementById('createDefectModal').style.display = 'block';
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.parentElement.parentElement.style.display = 'none';
    });
});

document.getElementById('defectForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const defect = Object.fromEntries(formData.entries());
    defect.CC = defect.CC ? defect.CC.split(',').map(item => item.trim()) : [];
    defect.Keywords = defect.Keywords ? defect.Keywords.split(',').map(item => item.trim()) : [];
    defect.Time = new Date(defect.Time).toISOString();
    defect.Changetime = new Date(defect.Changetime).toISOString();

    const fileHandle = await defectsDirHandle.getFileHandle(`${defect.ID}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(defect, null, 4));
    await writable.close();

    const defects = await loadDefects(defectsDirHandle);
    renderDefects(defects);
    document.getElementById('createDefectModal').style.display = 'none';
    event.target.reset();
});

async function loadDefects(directoryHandle) {
    const defects = [];
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
            const file = await entry.getFile();
            const content = await file.text();
            defects.push(JSON.parse(content));
        }
    }
    return defects;
}

function renderDefects(defects) {
    const tbody = document.querySelector('#defectTable tbody');
    tbody.innerHTML = '';
    defects.forEach(defect => {
        const row = document.createElement('tr');
        const fields = [
            'ID', 'Summary', 'Description', 'Status', 'Type', 'Priority', 'Milestone', 'Component', 
            'Version', 'Severity', 'Reporter', 'Owner', 'CC', 'Keywords', 'Resolution', 'Time', 
            'Changetime', 'Project'
        ];
        fields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = defect[field] ? (Array.isArray(defect[field]) ? defect[field].join(', ') : defect[field]) : '';
            row.appendChild(cell);
        });
        row.querySelector('td').addEventListener('click', () => openDefectWindow(defect));
        tbody.appendChild(row);
    });
}

function openDefectWindow(defect) {
    const defectWindow = window.open('', 'Defect Details', 'width=600,height=600');
    const doc = defectWindow.document;

    doc.open();
    doc.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Defect Details</title></head><body>');
    doc.write('<h2>Defect Details</h2>');
    for (const [key, value] of Object.entries(defect)) {
        doc.write(`<p><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</p>`);
    }
    doc.write('</body></html>');
    doc.close();
}

window.onclick = function(event) {
    if (event.target == document.getElementById('createDefectModal')) {
        document.getElementById('createDefectModal').style.display = 'none';
    }
}
