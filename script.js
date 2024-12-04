let currentFileHandle;
let defectsHandle;
let isNewDefect = false;

document.getElementById('open-folder').addEventListener('click', async () => {
    try {
        const dirHandle = await window.showDirectoryPicker();
        defectsHandle = await dirHandle.getDirectoryHandle('defects', { create: false });
        document.getElementById('new-defect').style.display = 'inline-block';
        updateDefectList();
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('new-defect').addEventListener('click', () => {
    isNewDefect = true;
    openEditModal({
        ID: '',
        Summary: '',
        Description: '',
        Status: '',
        Type: '',
        Priority: '',
        Milestone: '',
        Component: '',
        Version: '',
        Severity: '',
        Reporter: '',
        Owner: '',
        CC: '',
        Keywords: '',
        Resolution: '',
        Time: '',
        Changetime: '',
        Project: ''
    });
});

function displayDefect(defect, fileHandle) {
    const defectTable = document.getElementById('defect-table').getElementsByTagName('tbody')[0];
    const row = defectTable.insertRow();
    row.insertCell(0).textContent = defect.ID;
    row.insertCell(1).textContent = defect.Summary;
    row.insertCell(2).textContent = defect.Description;
    row.insertCell(3).textContent = defect.Status;
    row.insertCell(4).textContent = defect.Type;
    row.insertCell(5).textContent = defect.Priority;
    row.insertCell(6).textContent = defect.Milestone;
    row.insertCell(7).textContent = defect.Component;
    row.insertCell(8).textContent = defect.Version;
    row.insertCell(9).textContent = defect.Severity;
    row.insertCell(10).textContent = defect.Reporter;
    row.insertCell(11).textContent = defect.Owner;
    row.insertCell(12).textContent = defect.CC.join(', ');
    row.insertCell(13).textContent = defect.Keywords.join(', ');
    row.insertCell(14).textContent = defect.Resolution;
    row.insertCell(15).textContent = defect.Time;
    row.insertCell(16).textContent = defect.Changetime;
    row.insertCell(17).textContent = defect.Project;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
        isNewDefect = false;
        openEditModal(defect, fileHandle);
    });
}

function openEditModal(defect, fileHandle) {
    currentFileHandle = fileHandle;
    document.getElementById('defectId').value = defect.ID;
    document.getElementById('summary').value = defect.Summary;
    document.getElementById('description').value = defect.Description;
    document.getElementById('status').value = defect.Status;
    document.getElementById('type').value = defect.Type;
    document.getElementById('priority').value = defect.Priority;
    document.getElementById('milestone').value = defect.Milestone;
    document.getElementById('component').value = defect.Component;
    document.getElementById('version').value = defect.Version
    document.getElementById('severity').value = defect.Severity;
    document.getElementById('reporter').value = defect.Reporter;
    document.getElementById('owner').value = defect.Owner;
    document.getElementById('cc').value = defect.CC.join(', ');
    document.getElementById('keywords').value = defect.Keywords.join(', ');
    document.getElementById('resolution').value = defect.Resolution;
    document.getElementById('time').value = defect.Time;
    document.getElementById('changetime').value = defect.Changetime;
    document.getElementById('project').value = defect.Project;
    document.getElementById('editModal').style.display = 'block';
}

    document.getElementsByClassName('close')[0].addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
    });

    document.getElementById('saveButton').addEventListener('click', async () => {
        const updatedDefect = {
            ID: document.getElementById('defectId').value,
            Summary: document.getElementById('summary').value,
            Description: document.getElementById('description').value,
            Status: document.getElementById('status').value,
            Type: document.getElementById('type').value,
            Priority: document.getElementById('priority').value,
            Milestone: document.getElementById('milestone').value,
            Component: document.getElementById('component').value,
            Version: document.getElementById('version').value,
            Severity: document.getElementById('severity').value,
            Reporter: document.getElementById('reporter').value,
            Owner: document.getElementById('owner').value,
            CC: document.getElementById('cc').value.split(',').map(item => item.trim()),
            Keywords: document.getElementById('keywords').value.split(',').map(item => item.trim()),
            Resolution: document.getElementById('resolution').value,
            Time: document.getElementById('time').value,
            Changetime: document.getElementById('changetime').value,
            Project: document.getElementById('project').value
        };
        const updatedContent = JSON.stringify(updatedDefect, null, 2);

        if (isNewDefect) {
            const newFileName = `${updatedDefect.ID}.json`;
            currentFileHandle = await defectsHandle.getFileHandle(newFileName, { create: true });
        }

        await writeFile(currentFileHandle, updatedContent);
        document.getElementById('editModal').style.display = 'none';
        updateDefectList();
    });

    async function updateDefectList() {
        const defectTable = document.getElementById('defect-table').getElementsByTagName('tbody')[0];
        defectTable.innerHTML = '';

        for await (const entry of defectsHandle.values()) {
            if (entry.kind === 'file') {
                const fileHandle = await defectsHandle.getFileHandle(entry.name);
                const file = await fileHandle.getFile();
                const content = await readFile(file);
                const defect = JSON.parse(content);
                displayDefect(defect, fileHandle);
            }
        }
    }